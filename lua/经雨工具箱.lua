-- 工具信息和应用信息部分保持不变
local Tool = {
    Name = "经雨🌧工具箱",
    Version = "1.1.5",
    Author = "东经雨",
    Description = "整合了来自各种各样的脚本"
}

local targetInfo = gg.getTargetInfo()
local AppInfo = {
    Name = targetInfo.label,
    Package = targetInfo.packageName,
    Architecture = targetInfo.x64 and "x64" or "其他"
}

-- 常量定义
JingYu = "/sdcard/经雨/"
ConfigFile = JingYu .. "设置.ini"
Web = "https://Dong-Jing-Yu.github.io/lua/"
ChinaWeb = "https://gitee.com/Dong-Jing-Yu/Dong-Jing-Yu.gitee.io/raw/main/lua/"

-- 检查并创建目录
local function ensureDirectory(YN)
    local success = io.open(JingYu .. "test.tmp", "w")
    if not success then
        if YN then
            gg.alert("⌖请在内部存储创建'经雨'文件夹⌖\n⌖如:/storage/emulated/0/经雨⌖\n⌖重置设置可以删除该文件夹⌖\n⌖注意给予修改器文件权限!!!⌖")
            gg.copyText("经雨")
            gg.toast("已复制,请手动创建该文件夹")
        end
        return false
    end
    success:close()
    os.remove(JingYu .. "test.tmp")
    return true
end
local CreateFile = ensureDirectory("true")

-- 配置文件读写功能
local function SaveConfig(key, value)
    local data = {}
    local file = io.open(ConfigFile, "r")
    if file then
        for line in file:lines() do
            local k = line:match("^([^=]+)=")
            if k ~= key then
                data[#data + 1] = line
            end
        end
        file:close()
    end

    data[#data + 1] = key .. "=" .. tostring(value)

    file = io.open(ConfigFile, "w")
    if file then
        file:write(table.concat(data, "\n"))
        file:close()
        gg.toast("设置已保存")
        return true
    end
    gg.toast("保存设置失败")
    return false
end

local function LoadConfig(key, default)
    local file = io.open(ConfigFile, "r")
    if not file then return default end

    for line in file:lines() do
        local k, v = line:match("^([^=]+)=(.+)$")
        if k == key then
            file:close()
            return v
        end
    end
    file:close()
    return default
end

local function Time()
    return os.date("%Y-%m-%d %H:%M:%S")
end

local function log(msg, type)
    if LoadConfig("showLogOnExit", "false") then
        tmp = Time() .. " " .. msg
        if type == "0" then
            print("[退出]:" .. tmp)
        elseif type == "1" then
            print("[信息]" .. tmp)
        elseif type == "2" then
            print("[文件]" .. tmp)
        elseif type == "3" then
            print("[更新]" .. tmp)
        else
            print("[错误]" .. tmp)
        end
    end
end

local function Updates(scriptBlock)
    local latestVersion = scriptBlock:match("Version%s*=%s*(%d+%.%d+%.?%d*)")
    local updateDetails = scriptBlock:match("UpdatesDescription%s*=%s*(.*)%s*\n")
    local updateMessage = string.format(
        "发现新版本 %s\n\n%s\n\n是否立即更新?",
        latestVersion,
        updateDetails or "无更新说明"
    )

    local updateResult = gg.alert(updateMessage, "更新", "取消")

    if updateResult == 1 then
        local downloadUrl = scriptBlock:match("url%s*=%s*(.-)%s*\n")
        if downloadUrl and downloadUrl ~= "" then
            gg.alert("即将开始下载地址:\n" .. downloadUrl)
            local response = gg.makeRequest(downloadUrl).content
            if response then
                file = io.open("/sdcard/Download/" .. Tool.Name .. ".lua", "w")
                if file then
                    file:write(response)
                    file:close()
                    gg.toast("已下载到\n/sdcard/Download/" .. Tool.Name .. ".lua")
                    return true
                end
            else
                gg.alert("获取文件内容失败")
                log("获取文件内容失败", 3)
            end
        else
            gg.alert("未提供下载地址")
        end
        return true
    end
end

-- 将 compareVersions 函数移到外部,使其可以被其他地方调用
local function compareVersions(current, latest)
    local currentParts = { current:match("(%d+)%.(%d+)%.?(%d*)") }
    local latestParts = { latest:match("(%d+)%.(%d+)%.?(%d*)") }

    for i = 1, 3 do
        local currentPart = tonumber(currentParts[i] or 0)
        local latestPart = tonumber(latestParts[i] or 0)

        if currentPart < latestPart then
            return true  -- 需要更新
        elseif currentPart > latestPart then
            return false -- 当前版本比最新版本新
        end
    end

    return false -- 版本相同
end

local function CheckUpdates()
    -- 直接使用 Tool 表中的脚本名称和版本号
    local scriptName = "经雨Tool"

    -- 确认是否检查更新
    if gg.alert("是否检查 " .. scriptName .. " 的更新?\n目标网站为GitHub", "确定", "取消") ~= 1 then
        return false
    end

    log("检查更新", 3)

    -- 尝试获取更新信息
    local response = gg.makeRequest(Web .. "Updates.ini").content
    -- 检查网络请求是否成功
    if not response then
        log("网络请求失败,检查网络权限")
        gg.alert("网络请求失败,检查网络权限")
        return false
    end

    -- 使用模式匹配提取特定脚本的更新信息
    local scriptBlock = response:match("<经雨Tool>\r(.*)<")
    if not scriptBlock then
        log("未找到 " .. scriptName .. " 的更新信息")
        if gg.alert("未找到 " .. scriptName .. " 的更新信息\n是否尝试使用国内源?", "确定", "取消") == 1 then
            response = gg.makeRequest(ChinaWeb .. "Updates.ini").content
            if not response then
                gg.alert("国内获取信息失败")
                return false
            else
                scriptBlock = response:match("<经雨Tool>\r(.*)<")
                if not scriptBlock then
                    log("国内获取信息失败")
                    return false
                end
            end
        else
            log("国外获取信息失败")
            return false
        end
    end

    -- 提取版本号
    local latestVersion = scriptBlock:match("Version%s*=%s*(%d+%.%d+%.?%d*)")

    -- 比较版本号
    if not latestVersion then
        gg.alert("无法解析版本号")
        log("无法解析版本号")
        return false
    end

    -- 检查是否需要更新
    if compareVersions(Tool.Version, latestVersion) then
        Updates(scriptBlock)
    else
        gg.alert("当前已是最新版本")
        log("当前已是最新版本", 3)
    end

    return false
end

-- 自动检查更新的代码
if LoadConfig("AutoCheckUpdates", "false") == "true" then
    gg.toast("正在检查更新")
    gg.sleep(3000)
    local response = gg.makeRequest(ChinaWeb .. "Updates.ini").content
    if not response then
        log("自检更新失败(网络请求失败)")
    else
        local scriptBlock = response:match("<经雨Tool>\r(.*)<")
        if scriptBlock then
            local latestVersion = scriptBlock:match("Version%s*=%s*(%d+%.%d+%.?%d*)")
            if compareVersions(Tool.Version, latestVersion) then
                Updates(scriptBlock)
            else
                log("暂无更新", 3)
                gg.toast("暂无更新")
            end
        end
    end
end

local function Static()
    XGCK = -1
    local function S_Pointer(t_So, t_Offset, _bit)
        local function getRanges()
            local ranges = {}
            local t = gg.getRangesList('^/data/*.so*$')
            for i, v in pairs(t) do
                if v.type:sub(2, 2) == 'w' then
                    table.insert(ranges, v)
                end
            end
            return ranges
        end
        local function Get_Address(N_So, Offset, ti_bit)
            local ti = gg.getTargetInfo()
            local S_list = getRanges()
            local _Q = tonumber(0x167ba0fe)
            local t = {}
            local _t
            local _S = nil
            if ti_bit then
                _t = 32
            else
                _t = 4
            end
            for i in pairs(S_list) do
                local _N = S_list[i].internalName:gsub('^.*/', '')
                if N_So[1] == _N and N_So[2] == S_list[i].state then
                    _S = S_list[i]
                    break
                end
            end
            if _S then
                t[#t + 1] = {}
                t[#t].address = _S.start + Offset[1]
                t[#t].flags = _t
                if #Offset ~= 1 then
                    for i = 2, #Offset do
                        local S = gg.getValues(t)
                        t = {}
                        for _ in pairs(S) do
                            if not ti.x64 then
                                S[_].value = S[_].value & 0xFFFFFFFF
                            end
                            t[#t + 1] = {}
                            t[#t].address = S[_].value + Offset[i]
                            t[#t].flags = _t
                        end
                    end
                end
                _S = t[#t].address
            end
            return _S
        end
        local _A = string.format('0x%X', Get_Address(t_So, t_Offset, _bit))
        return _A
    end

    function split(szFullString, szSeparator)
        local nFindStartIndex = 1
        local nSplitIndex = 1
        local nSplitArray = {}
        while true do
            local nFindLastIndex = string.find(szFullString, szSeparator, nFindStartIndex)
            if not nFindLastIndex then
                nSplitArray[nSplitIndex] = string.sub(szFullString, nFindStartIndex, string.len(szFullString))
                break
            end
            nSplitArray[nSplitIndex] = string.sub(szFullString, nFindStartIndex, nFindLastIndex - 1)
            nFindStartIndex = nFindLastIndex + string.len(szSeparator)
            nSplitIndex = nSplitIndex + 1
        end
        return nSplitArray
    end

    function xgxc(szpy, qmxg)
        for x = 1, #(qmxg) do
            xgpy = szpy + qmxg[x]["offset"]
            xglx = qmxg[x]["type"]
            xgsz = qmxg[x]["value"]
            xgdj = qmxg[x]["freeze"]
            if xgdj == nil or xgdj == "" then
                gg.setValues({ [1] = { address = xgpy, flags = xglx, value = xgsz } })
            else
                gg.addListItems({ [1] = { address = xgpy, flags = xglx, freeze = xgdj, value = xgsz } })
            end
            xgsl = xgsl + 1
            xgjg = true
        end
    end

    function xqmnb(qmnb)
        gg.clearResults()
        gg.setRanges(qmnb[1]["memory"])
        gg.searchNumber(qmnb[3]["value"], qmnb[3]["type"])
        if gg.getResultCount() == 0 then
            gg.toast(qmnb[2]["name"] .. "开启失败")
        else
            gg.refineNumber(qmnb[3]["value"], qmnb[3]["type"])
            gg.refineNumber(qmnb[3]["value"], qmnb[3]["type"])
            gg.refineNumber(qmnb[3]["value"], qmnb[3]["type"])
            if gg.getResultCount() == 0 then
                gg.toast(qmnb[2]["name"] .. "开启失败")
            else
                sl = gg.getResults(999999)
                sz = gg.getResultCount()
                xgsl = 0
                if sz > 999999 then sz = 999999 end
                for i = 1, sz do
                    pdsz = true
                    for v = 4, #(qmnb) do
                        if pdsz == true then
                            pysz = {}
                            pysz[1] = {}
                            pysz[1].address = sl[i].address + qmnb[v]["offset"]
                            pysz[1].flags = qmnb[v]["type"]
                            szpy = gg.getValues(pysz)
                            pdpd = qmnb[v]["lv"] .. ";" .. szpy[1].value
                            szpd = split(pdpd, ";")
                            tzszpd = szpd[1]
                            pyszpd = szpd[2]
                            if tzszpd == pyszpd then
                                pdjg = true
                                pdsz = true
                            else
                                pdjg = false
                                pdsz = false
                            end
                        end
                    end
                    if pdjg == true then
                        szpy = sl[i].address
                        xgxc(szpy, qmxg)
                    end
                end
                if xgjg == true then
                    gg.toast(qmnb[2]["name"] .. "开启成功,一共修改" .. xgsl .. "条数据")
                else
                    gg.toast(qmnb[2]["name"] ..
                        "开启失败")
                end
            end
        end
    end

    readPointer = function(name, offset, i)
        local re = gg.getRangesList(name)
        local x64 = gg.getTargetInfo().x64
        local va = { [true] = 32, [false] = 4 }
        if re[i or 1] then
            local addr = re[i or 1].start + offset[1]
            for i = 2, #offset do
                addr = gg.getValues({ { address = addr, flags = va[x64] } })
                if not x64 then addr[1].value = addr[1].value & 0xFFFFFFFF end
                addr = addr[1].value + offset[i]
            end
            return addr
        end
    end
    gg.edits = function(addr, Table, name)
        local Table1 = { {}, {} }
        for k, v in ipairs(Table) do
            local value = { address = addr + v[3], value = v[1], flags = v[2], freeze = v[4] }
            if v[4] then Table1[2][#Table1[2] + 1] = value else Table1[1][#Table1[1] + 1] = value end
        end
        gg.addListItems(Table1[2])
        gg.setValues(Table1[1])
        gg.toast((name or "") .. "开启成功, 共修改" .. #Table .. "个值")
    end
    function fastsearch(search, write)
        gg.setVisible(false)
        gg.clearResults()
        gg.setRanges(search[1][3])
        gg.searchNumber(search[1][1], search[1][2])
        if gg.getResultsCount() == 0 then
            gg.toast("Not Found")
            return false
        else
            local result = gg.getResults(gg.getResultsCount())
            gg.clearResults()
            for i = 2, #search do
                local mtp = {}
                for w, r in ipairs(result) do
                    mtp[#mtp + 1] = { address = r.address + search[i][2], flags = search[i][3] }
                end
                mtp = gg.getValues(mtp)
                local hook = {}
                for w, r in ipairs(mtp) do
                    if r.value == search[i][1] then
                        hook[#hook + 1] = result[w]
                    end
                end
                result = hook
            end
            if #result > 0 then
                local tb = { {}, {} }
                for i, v in ipairs(result) do
                    --- 遍历每个结果
                    for _, vv in ipairs(write) do
                        local p = { address = v.address + vv[2], flags = vv[3], value = vv[1], freeze = vv[4] }
                        if vv[4] then --- true 就是冻结
                            table.insert(tb[2], p)
                        else
                            table.insert(tb[1], p)
                        end
                    end
                end
                gg.addListItems(tb[2])
                gg.setValues(tb[1])
                gg.toast("获取成功" .. (#tb[1] + #tb[2]) .. "条结果")
            else
                gg.toast("Not Found")
            end
        end
    end

    function setvalue(address, flags, value)
        --修改地址数值(地址,数值类型,要修改的值)
        local tt = {}
        tt[1] = {}
        tt[1].address = address
        tt[1].flags = flags
        tt[1].value = value
        gg.setValues(tt)
    end

    local UE4 = gg.getRangesList("libUE4.so")
    if not UE4 or #UE4 == 0 then
        gg.alert("so模块不存在 请检查游戏进程是否正确?")
        return Main()
    end

    while true do
        local options = {
            "0.返回"
        }
        local choice = gg.choice(options, nil, "静态扫值工具")
        if not choice then return end
        if choice == 1 then
            return Main()
        end
    end
end

local function Dynamic()
    XGCK = -1
    while true do
        local options = {
            "0.返回"
        }
        local choice = gg.choice(options, nil, "动态扫值工具")
        if not choice then return Main() end

        if choice == 1 then
            return Main()
        end
    end
end

-- 主菜单显示功能
local function getHeader()
    return string.format([[%s v%s by %s
当前:%s(%s)
框架:%s
时间:%s]],
        Tool.Name, Tool.Version, Tool.Author,
        AppInfo.Name, AppInfo.Package, AppInfo.Architecture,
        Time())
end

local function No()
    gg.alert("暂无")
    return Main()
end

--特征菜单
local function Feature()
    XGCK = -1
    local function Get()
        local Items        = gg.getSelectedListItems() --获取在保存列表勾选的项目
        local OptionsItems = {}
        local t_list_take  = {}

        for i = 1, #Items do
            t_list_take[i] = Items[i].address
            OptionsItems[i] = "地址: " .. string.format("%X", Items[i].address)
        end
        if #OptionsItems == 0 then
            return gg.alert("请在保存列表勾选值")
        end
        OptionsItems[#OptionsItems + 1] = "返回"
        local menu = gg.choice(OptionsItems, nil, "获取了:" .. #OptionsItems - "1" .. " 个值")
        local t = {}
        local ER = 0
        for i = 1, #t_list_take do
            if menu == #OptionsItems then return gg.toast("退出") end
            if menu == i then
                local Prompt = gg.prompt({ "获取多少个特征码?" }, { "1000" }, { "number" })
                if Prompt == nil or Prompt[1] == "" then return gg.alert("退出") end
                for x = 1, Prompt[1] do
                    t[x] = "〔保存值〕" ..
                        gg.getValues({ [1] = { address = t_list_take[i] - (tonumber(Prompt[1]) - ER) * 0x4, flags = Items[i].flags } })
                        [i].value .. "  〔偏移值〕" .. -(tonumber(Prompt[1]) - ER) * 0x4
                    ER = ER + 1
                end
                t[#t + 1] = "〔保存值〕" ..
                    gg.getValues({ [1] = { address = t_list_take[i], flags = Items[i].flags } })[i].value ..
                    "  〔偏移值〕0"
                ER = 0
                for x = #t + 1, tonumber(Prompt[1]) + #t do
                    t[x] = "〔保存值〕" ..
                        gg.getValues({ [1] = { address = t_list_take[i] + (x - #t + ER) * 0x4, flags = Items[i].flags } })
                        [i]
                        .value .. "  〔偏移值〕" .. (x - #t + ER) * 0x4
                    ER = ER + 1
                end
            end
        end
        local times_out = 1
        while true do
            local file = io.open(AppInfo.Name .. "_" .. times_out .. ".txt", "r+"):read("*a")
            if file == "" then
                times_out = times_out
                break
            else
                times_out = times_out + 1
            end
        end
        local path = gg.getFile():gsub("[^/]*$", "") .. AppInfo.Name .. "_" .. times_out .. ".txt"
        for i = 1, #t do
            io.open(path, "a+"):write(t[i] .. "\n")
        end
    end
    local function Contrast()
        local path = gg.getFile():gsub("[^/]*$", "")
        local Prompt = gg.prompt({ "文件1：", "文件2：", "结果过滤0" }, { path, path, true }, { "file", "file", "checkbox" })
        if Prompt == nil then return the_choice() end
        local read_a = io.open(Prompt[1], "r")
        local read_b = io.open(Prompt[2], "r")
        local t_1 = {}
        for i in read_a:lines() do
            t_1[#t_1 + 1] = i
        end
        local t_2 = {}
        for i in read_b:lines() do
            t_2[#t_2 + 1] = i
        end
        local end_t = {}
        for i = 1, #t_1 do
            if t_1[i] == t_2[i] then
                if Prompt[3] == true then
                    if t_1[i]:match("〔保存值〕(.-)〔偏移值〕") ~= "0  " and "0.0  " then
                        end_t[#end_t + 1] = t_1[i]
                    end
                else
                    end_t[#end_t + 1] = t_1[i]
                end
            end
        end
        if #end_t == 0 then return gg.alert("无相同的内容") end
        local t = 1
        while true do
            local file = io.open(gg.getFile():gsub("[^/]*$", "") .. "Results_" .. t .. ".lua", "r+"):read("*a")
            if file == "" then
                t = t
                os.remove(gg.getFile():gsub("[^/]*$", "") .. "Results_" .. t .. ".lua")
                break
            else
                t = t + 1
            end
        end
        local Prompt_1 = gg.prompt({ "结果文件输出", "结果文件打印" },
            { gg.getFile():gsub("[^/]*$", "") .. "Results_" .. t .. ".lua" },
            { "file", "checkbox" })
        if Prompt_1[2] then return print(end_t) end
        for i = 1, #end_t do
            io.open(gg.getFile():gsub("[^/]*$", "") .. "Results_" .. t .. ".lua", "a+"):write(end_t[i] .. "\n")
            end_t[i] = nil
        end
    end
    local function Tutorial()
        gg.alert(
            "1. 找到你想要的值\n" ..
            "2. 将其放入保存列表\n" ..
            "3. 在保存列表中选择它\n" ..
            "4. 运行特征 > 获取\n" ..
            "5. 重启应用并重复操作\n" ..
            "6. 至少要两个文件\n" ..
            "7. 就可以开始对比了"
        )
    end

    while true do
        local options = {
            "1.获取",
            "2.对比",
            "3.教程",
            "0.返回"
        }
        local choice = gg.choice(options, nil, "用来寻找特征码和对比的工具")
        if not choice then return Main() end

        if choice == 1 then
            Get()
        elseif choice == 2 then
            Contrast()
        elseif choice == 3 then
            Tutorial()
        elseif choice == 4 then
            return Main()
        end
    end
end
--加解密菜单
local function EncryptDecrypt()
    XGCK = -1
    local function Encrypt()
        gg.alert("加密")
    end
    local function Decrypt()
        gg.alert("解密")
    end
    while true do
        local options = {
            "1.加密",
            "2.解密",
            "0.返回"
        }
        local choice = gg.choice(options, nil, "该界面可以用于加密或者解密lua脚本\n(不过目前还没有开发)")
        if not choice then return Main() end

        if choice == 1 then
            Encrypt()
        elseif choice == 2 then
            Decrypt()
        elseif choice == 3 then
            return Main()
        end
    end
end
-- 设置菜单
local function Settings()
    XGCK = -1
    while true do
        if not CreateFile then
            gg.alert("无法访问经雨目录,无法保存设置操作")
            return Main()
        end
        local choice = gg.choice({
            "1.搜索",
            "2.其他",
            "0.返回主菜单"
        }, nil, "设置选项")

        if not choice then
            return Main()
        end

        if choice == 1 then
            local options = gg.multiChoice({
                "自动清理搜索结果 [" .. (LoadConfig("autoClear", "false") == "true" and "✓" or "✗") .. "]",
                "搜索完暂停 [" .. (LoadConfig("pauseAfterSearch", "false") == "true" and "✓" or "✗") .. "]",
                "显示详细日志 [" .. (LoadConfig("showDetailedLog", "false") == "true" and "✓" or "✗") .. "]"
            }, nil, "搜索设置")

            if options then
                local keys = { "autoClear", "pauseAfterSearch", "showDetailedLog" }
                for i, key in ipairs(keys) do
                    if options[i] then
                        local currentValue = LoadConfig(key, "false")
                        SaveConfig(key, currentValue == "true" and "false" or "true")
                    end
                end
            end
        elseif choice == 2 then
            local options = gg.multiChoice({
                "运行时检查更新 [" .. (LoadConfig("AutoCheckUpdates", "false") == "true" and "✓" or "✗") .. "]",
                "关闭日志 [" .. (LoadConfig("showLogOnExit", "false") == "true" and "✓" or "✗") .. "]"
            }, nil, "其他设置")

            if options then
                local keys = { "AutoCheckUpdates", "showLogOnExit" }
                for i, key in ipairs(keys) do
                    if options[i] then
                        local currentValue = LoadConfig(key, "false")
                        SaveConfig(key, currentValue == "true" and "false" or "true")
                    end
                end
            end
            gg.alert("设置会在下一次运行脚本时生效")
        elseif choice == 3 then
            return Main()
        end
    end
end

-- 关于界面
local function About()
    XGCK = -1
    local about_info = string.format([[
%s v%s

作者: %s
描述: %s

支持功能:
• 静态/动态数值搜索
• 特征码搜索
• 数值对比搜索
• 配置文件管理
• 加密解密lua脚本
当前应用:
• 包名: %s
• 架构: %s
    ]], Tool.Name, Tool.Version, Tool.Author, Tool.Description,
        AppInfo.Package, AppInfo.Architecture)

    while true do
        local choice = gg.alert(about_info, "返回", "官网链接", "检查更新")
        --gg.alert(choice)
        if choice == 0 then return Main() end

        if choice == 1 then
            return Main()
        elseif choice == 2 then
            gg.copyText(Web)
            gg.toast("官网链接已复制到剪贴板")
        elseif choice == 3 then
            CheckUpdates()
        end
    end
end
-- 修改主菜单函数
function Main()
    XGCK = -1
    local options = {
        "1.静态",
        "2.动态",
        "3.特征",
        "4.无",
        "5.无",
        "6.无",
        "7.加解🔒",
        "8.设置🛠",
        "9.关于ℹ️",
        "0.退出"
    }

    local choice = gg.choice(options, nil, getHeader())
    if not choice then return end

    if choice == 10 then
        math.randomseed(os.time()) -- 初始化随机数种子

        local messages = {
            "保重,他日再相逢",
            "期待下次相遇!",
            "感谢使用，再见！",
            "正常退出，祝您愉快。",
            "再见，期待下次见面！"
        }

        local randomIndex = math.random(#messages)  -- 生成一个随机索引
        local randomMessage = messages[randomIndex] -- 获取随机文案
        os.exit(log(randomMessage, 0))
    elseif choice == 9 then
        return About()
    elseif choice == 8 then
        return Settings()
    elseif choice == 7 then
        return EncryptDecrypt()
    elseif choice == 3 then
        return Feature()
    elseif choice == 2 then
        return Dynamic()
    elseif choice == 1 then
        return Static()
    else
        return No()
    end
end

-- 主循环
while true do
    if gg.isVisible(true) then
        XGCK = 1
        gg.setVisible(false)
    end
    if XGCK == 1 then
        Main()
    end
end
