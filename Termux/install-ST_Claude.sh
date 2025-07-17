#!/data/data/com.termux/files/usr/bin/bash
#
# SillyTavern Termux 安装脚本
# 创建者：基于 Deffcolony 的原始脚本修改
#
# 描述：
# 此脚本在 Termux 环境中安装 SillyTavern
#
# 使用方法：
# chmod +x install-ST-termux.sh && ./install-ST-termux.sh
#
# 注意：此脚本专为 Termux 环境设计

echo -e "\033]0;SillyTavern Termux 安装器\007"

# ANSI 转义码颜色定义
reset="\033[0m"
white_fg_strong="\033[90m"
red_fg_strong="\033[91m"
green_fg_strong="\033[92m"
yellow_fg_strong="\033[93m"
blue_fg_strong="\033[94m"
magenta_fg_strong="\033[95m"
cyan_fg_strong="\033[96m"

# 背景色
red_bg="\033[41m"
blue_bg="\033[44m"
yellow_bg="\033[43m"

# 简化的日志记录函数
log() {
    current_time=$(date +'%H:%M:%S')
    case "$1" in
        "INFO")
            echo -e "${blue_bg}[$current_time]${reset} ${blue_fg_strong}[信息]${reset} $2"
            ;;
        "WARN")
            echo -e "${yellow_bg}[$current_time]${reset} ${yellow_fg_strong}[警告]${reset} $2"
            ;;
        "ERROR")
            echo -e "${red_bg}[$current_time]${reset} ${red_fg_strong}[错误]${reset} $2"
            ;;
        *)
            echo -e "${blue_bg}[$current_time]${reset} ${blue_fg_strong}[调试]${reset} $2"
            ;;
    esac
}

# 边框绘制函数
boxDrawingText() {
    local string=$1
    local maxwidth=$2
    local color=

    if [ $# -eq 3 ]; then
        color=$3
    fi

    local stringlength=${#string}
    local width=$((stringlength < maxwidth ? maxwidth : stringlength))
    local middle="║"

    echo -e "$color$middle$string$(printf ' %.0s' $(seq 1 $((width - stringlength))))$middle"
}

# 更新 Termux 包列表
update_packages() {
    log "INFO" "更新包列表..."
    pkg update -y
    pkg upgrade -y
}

# 安装 Git
install_git() {
    if ! command -v git &> /dev/null; then
        log "WARN" "${yellow_fg_strong}Git 未安装在此系统上${reset}"
        log "INFO" "使用 pkg 安装 Git..."
        pkg install -y git
        log "INFO" "${green_fg_strong}Git 安装成功。${reset}"
    else
        log "INFO" "${blue_fg_strong}Git 已安装。${reset}"
    fi
}

# 安装 Node.js
install_nodejs() {
    if ! command -v node &> /dev/null; then
        log "WARN" "${yellow_fg_strong}Node.js 未安装在此系统上${reset}"
        log "INFO" "使用 pkg 安装 Node.js..."
        pkg install -y nodejs npm
        log "INFO" "${green_fg_strong}Node.js 安装成功。${reset}"
    else
        log "INFO" "${blue_fg_strong}Node.js 已安装。${reset}"
    fi
}

# 安装 Python
install_python() {
    if ! command -v python &> /dev/null; then
        log "WARN" "${yellow_fg_strong}Python 未安装在此系统上${reset}"
        log "INFO" "使用 pkg 安装 Python..."
        pkg install -y python python-pip
        log "INFO" "${green_fg_strong}Python 安装成功。${reset}"
    else
        log "INFO" "${blue_fg_strong}Python 已安装。${reset}"
    fi
}

# 安装其他必要工具
install_tools() {
    log "INFO" "安装必要工具..."
    pkg install -y wget curl build-essential
}

# 安装 SillyTavern 函数
install_sillytavern() {
    echo -e "\033]0;SillyTavern [安装-ST]\007"
    clear
    echo -e "${blue_fg_strong}/ 安装器 / SillyTavern${reset}"
    echo "---------------------------------------------------------------"
    echo -e "${cyan_fg_strong}这可能需要一些时间，请耐心等待。${reset}"
    
    log "INFO" "正在安装 SillyTavern..."
    log "INFO" "克隆 SillyTavern 仓库..."
    
    # 如果目录已存在，先删除
    if [ -d "SillyTavern" ]; then
        log "WARN" "SillyTavern 目录已存在，正在删除..."
        rm -rf SillyTavern
    fi
    
    git clone https://github.com/SillyTavern/SillyTavern.git
    
    if [ $? -eq 0 ]; then
        log "INFO" "${green_fg_strong}SillyTavern 安装成功。${reset}"
        
        # 进入目录并安装依赖
        cd SillyTavern
        log "INFO" "安装 Node.js 依赖..."
        npm install
        
        if [ $? -eq 0 ]; then
            log "INFO" "${green_fg_strong}依赖安装完成。${reset}"
            create_start_script
        else
            log "ERROR" "${red_fg_strong}依赖安装失败。${reset}"
        fi
        
        cd ..
    else
        log "ERROR" "${red_fg_strong}SillyTavern 克隆失败。${reset}"
    fi
    
    # 询问是否立即启动
    read -p "是否立即启动 SillyTavern？ [Y/n] " start_now
    if [[ "${start_now}" == "Y" || "${start_now}" == "y" || "${start_now}" == "" ]]; then
        start_sillytavern
    fi
    
    main_menu
}

# 创建启动脚本
create_start_script() {
    log "INFO" "创建启动脚本..."
    
    # 创建启动脚本
    cat << 'EOF' > start-sillytavern.sh
#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")/SillyTavern"
echo "正在启动 SillyTavern..."
echo "启动后请在浏览器中访问：http://localhost:8000"
echo "按 Ctrl+C 停止服务器"
echo "---"
node server.js
EOF
    
    chmod +x start-sillytavern.sh
    log "INFO" "${green_fg_strong}启动脚本创建成功：start-sillytavern.sh${reset}"
}

# 启动 SillyTavern
start_sillytavern() {
    if [ -f "start-sillytavern.sh" ]; then
        log "INFO" "启动 SillyTavern..."
        ./start-sillytavern.sh
    else
        log "ERROR" "${red_fg_strong}启动脚本不存在！${reset}"
        if [ -d "SillyTavern" ]; then
            log "INFO" "尝试直接启动..."
            cd SillyTavern
            node server.js
            cd ..
        fi
    fi
}

# 卸载 SillyTavern
uninstall_sillytavern() {
    echo -e "\033]0;SillyTavern [卸载]\007"
    clear
    echo -e "${red_fg_strong}/ 卸载器 / SillyTavern${reset}"
    echo "---------------------------------------------------------------"
    
    if [ -d "SillyTavern" ]; then
        echo -e "${yellow_fg_strong}警告：这将删除 SillyTavern 及其所有数据！${reset}"
        read -p "确定要卸载 SillyTavern 吗？ [y/N] " confirm
        
        if [[ "${confirm}" == "Y" || "${confirm}" == "y" ]]; then
            log "INFO" "正在卸载 SillyTavern..."
            rm -rf SillyTavern
            rm -f start-sillytavern.sh
            log "INFO" "${green_fg_strong}SillyTavern 卸载完成。${reset}"
        else
            log "INFO" "取消卸载。"
        fi
    else
        log "WARN" "SillyTavern 未安装。"
    fi
    
    read -p "按回车键继续..."
    main_menu
}

# 系统信息
show_system_info() {
    echo -e "\033]0;SillyTavern [系统信息]\007"
    clear
    echo -e "${blue_fg_strong}/ 系统信息${reset}"
    echo "---------------------------------------------------------------"
    
    echo -e "${cyan_fg_strong}系统信息：${reset}"
    echo "  操作系统：Android (Termux)"
    echo "  架构：$(uname -m)"
    echo "  内核：$(uname -r)"
    echo "  Shell：$SHELL"
    echo ""
    
    echo -e "${cyan_fg_strong}已安装软件：${reset}"
    if command -v git &> /dev/null; then
        echo "  Git：$(git --version)"
    else
        echo "  Git：未安装"
    fi
    
    if command -v node &> /dev/null; then
        echo "  Node.js：$(node --version)"
    else
        echo "  Node.js：未安装"
    fi
    
    if command -v npm &> /dev/null; then
        echo "  npm：$(npm --version)"
    else
        echo "  npm：未安装"
    fi
    
    if command -v python &> /dev/null; then
        echo "  Python：$(python --version)"
    else
        echo "  Python：未安装"
    fi
    
    echo ""
    if [ -d "SillyTavern" ]; then
        echo -e "${green_fg_strong}SillyTavern：已安装${reset}"
    else
        echo -e "${red_fg_strong}SillyTavern：未安装${reset}"
    fi
    
    read -p "按回车键继续..."
    main_menu
}

# 退出程序
exit_program() {
    clear
    echo -e "${green_fg_strong}感谢使用！再见！${reset}"
    exit 0
}

# 主菜单
main_menu() {
    echo -e "\033]0;SillyTavern Termux 安装器\007"
    clear
    echo -e "${blue_fg_strong}| > / SillyTavern Termux 安装器                             |${reset}"
    echo -e "${blue_fg_strong}============================================================${reset}"
    echo -e "${cyan_fg_strong} _________________________________________________________${reset}"
    echo -e "${cyan_fg_strong}| 您想要做什么？                                           |${reset}"
    echo "  1. 安装 SillyTavern"
    echo "  2. 启动 SillyTavern"
    echo "  3. 卸载 SillyTavern"
    echo "  4. 系统信息"
    echo -e "${cyan_fg_strong} _________________________________________________________${reset}"
    echo -e "${cyan_fg_strong}| 菜单选项：                                               |${reset}"
    echo "  0. 退出"
    echo -e "${cyan_fg_strong} _________________________________________________________${reset}"
    echo -e "${cyan_fg_strong}|                                                         |${reset}"
    read -p "  请选择 (默认为 1)： " choice

    # 如果没有输入，默认选择 1
    if [ -z "$choice" ]; then
        choice=1
    fi

    case $choice in
        1) install_sillytavern ;;
        2) start_sillytavern ;;
        3) uninstall_sillytavern ;;
        4) show_system_info ;;
        0) exit_program ;;
        *) 
            log "ERROR" "${red_fg_strong}无效选项。请输入有效数字。${reset}"
            read -p "按回车键继续..."
            main_menu
            ;;
    esac
}

# 初始化设置
initialize() {
    echo -e "${blue_fg_strong}正在初始化 SillyTavern Termux 安装器...${reset}"
    
    # 更新包列表
    update_packages
    
    # 安装基本工具
    install_tools
    install_git
    install_nodejs
    install_python
    
    log "INFO" "${green_fg_strong}初始化完成！${reset}"
    echo ""
}

# 主程序入口
main() {
    initialize
    main_menu
}

# 运行主程序
main