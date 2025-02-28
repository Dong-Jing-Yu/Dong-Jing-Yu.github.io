#!/data/data/com.termux/files/usr/bin/bash -e

VERSION=2024091801
BASE_URL=https://kali.download/nethunter-images/current/rootfs
USERNAME=kali



function unsupported_arch() {
    printf "${red}"
    echo "[*] 不支持的架构\n\n"
    printf "${reset}"
    exit
}

function ask() {
    # http://djm.me/ask
    while true; do

        if [ "${2:-}" = "Y" ]; then
            prompt="Y/n"
            default=Y
        elif [ "${2:-}" = "N" ]; then
            prompt="y/N"
            default=N
        else
            prompt="y/n"
            default=
        fi

        # Ask the question
        printf "${light_cyan}\n[?] "
        read -p "$1 [$prompt] " REPLY

        # Default?
        if [ -z "$REPLY" ]; then
            REPLY=$default
        fi

        printf "${reset}"

        # Check if the reply is valid
        case "$REPLY" in
            Y*|y*) return 0 ;;
            N*|n*) return 1 ;;
        esac
    done
}

function get_arch() {
    printf "${blue}[*] 检查设备架构 ..."
    case $(getprop ro.product.cpu.abi) in
        arm64-v8a)
            SYS_ARCH=arm64
            ;;
        armeabi|armeabi-v7a)
            SYS_ARCH=armhf
            ;;
        *)
            unsupported_arch
            ;;
    esac
}

function set_strings() {
    echo \
    && echo "" 
    ####
    if [[ ${SYS_ARCH} == "arm64" ]];
    then
        echo "[1] NetHunter ARM64 (完整版)"
        echo "[2] NetHunter ARM64 (最小版)"
        echo "[3] NetHunter ARM64 (微型版)"
        read -p "输入你想安装的镜像: " wimg
        if (( $wimg == "1" ));
        then
            wimg="full"
        elif (( $wimg == "2" ));
        then
            wimg="minimal"
        elif (( $wimg == "3" ));
        then
            wimg="nano"
        else
            wimg="full"
        fi
    elif [[ ${SYS_ARCH} == "armhf" ]];
    then
        echo "[1] NetHunter ARMhf (完整版)"
        echo "[2] NetHunter ARMhf (最小版)"
        echo "[3] NetHunter ARMhf (微型版)"
        read -p "输入你想安装的镜像: " wimg
        if [[ "$wimg" == "1" ]]; then
            wimg="full"
        elif [[ "$wimg" == "2" ]]; then
            wimg="minimal"
        elif [[ "$wimg" == "3" ]]; then
            wimg="nano"
        else
            wimg="full"
        fi
    fi
    ####


    CHROOT=chroot/kali-${SYS_ARCH}
    IMAGE_NAME=kali-nethunter-rootfs-${wimg}-${SYS_ARCH}.tar.xz
    SHA_NAME=${IMAGE_NAME}.sha512sum
}    

function prepare_fs() {
    unset KEEP_CHROOT
    if [ -d ${CHROOT} ]; then
        if ask "找到现有的rootfs目录。删除并创建新的目录?" "N"; then
            rm -rf ${CHROOT}
        else
            KEEP_CHROOT=1
        fi
    fi
} 

function cleanup() {
    if [ -f "${IMAGE_NAME}" ]; then
        if ask "删除已下载的rootfs文件?" "N"; then
        if [ -f "${IMAGE_NAME}" ]; then
                rm -f "${IMAGE_NAME}"
        fi
        if [ -f "${SHA_NAME}" ]; then
                rm -f "${SHA_NAME}"
        fi
        fi
    fi
} 

function check_dependencies() {
    printf "${blue}\n[*] 检查包依赖...${reset}\n"
    ## Workaround for termux-app issue #1283 (https://github.com/termux/termux-app/issues/1283)
    ##apt update -y &> /dev/null
    apt-get update -y &> /dev/null || apt-get -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" dist-upgrade -y &> /dev/null

    for i in proot tar axel wget; do
        if [ -e "$PREFIX"/bin/$i ]; then
            echo "  $i 已就绪"
        else
            printf "正在安装 ${i}...\n"
            apt install -y $i || {
                printf "${red}错误:无法安装软件包。\n 正在退出。\n${reset}"
            exit
            }
        fi
    done
    apt upgrade -y
}


function get_url() {
    ROOTFS_URL="${BASE_URL}/${IMAGE_NAME}"
    SHA_URL="${BASE_URL}/${SHA_NAME}"
}

function get_rootfs() {
    unset KEEP_IMAGE
    if [ -f "${IMAGE_NAME}" ]; then
        if ask "找到现有的镜像文件。是否删除并下载新的?" "N"; then
            rm -f "${IMAGE_NAME}"
        else
            printf "${yellow}[!] 使用现有的 rootfs 归档文件${reset}\n"
            KEEP_IMAGE=1
            return
        fi
    fi
    printf "${blue}[*] 正在下载 rootfs...${reset}\n\n"
    get_url
    wget "${EXTRA_ARGS}" --continue "${ROOTFS_URL}"
}

function get_sha() {
    if [ -z $KEEP_IMAGE ]; then
        printf "\n${blue}[*] 获取 SHA ... ${reset}\n\n"
        get_url
        if [ -f "${SHA_NAME}" ]; then
            rm -f "${SHA_NAME}"
        fi
        wget "${EXTRA_ARGS}" --continue "${SHA_URL}"
    fi
}

function verify_sha() {
    if [ -z $KEEP_IMAGE ]; then
        printf "\n${blue}[*] 正在验证 rootfs 完整性...${reset}\n\n"
        sha512sum -c "$SHA_NAME" || {
            printf "${red} Rootfs 已损坏。请重新运行安装程序或手动下载文件\n${reset}"
            exit 1
        }
    fi
}

function extract_rootfs() {
    if [ -z $KEEP_CHROOT ]; then
        printf "\n${blue}[*] 正在解压 rootfs... ${reset}\n\n"
        proot --link2symlink tar -xf "$IMAGE_NAME" 2> /dev/null || :
    else        
        printf "${yellow}[!] 使用现有的 rootfs 目录${reset}\n"
    fi
}


function create_launcher() {
    NH_LAUNCHER=${PREFIX}/bin/nethunter
    NH_SHORTCUT=${PREFIX}/bin/nh
    cat > "$NH_LAUNCHER" <<- EOF
#!/data/data/com.termux/files/usr/bin/bash -e
cd \${HOME}
## 在继续之前取消设置 termux-exec 的 LD_PRELOAD
unset LD_PRELOAD
## Libreoffice 的临时解决方案，还需要绑定一个虚拟的 /proc/version
if [ ! -f $CHROOT/root/.version ]; then
    touch $CHROOT/root/.version
fi

## 默认用户是 "kali"
user="$USERNAME"
home="/home/\$user"
start="sudo -u kali /bin/bash"

## NH 可以通过 "-r" 命令属性以 root 身份启动
## 同时检查 kali 用户是否存在，如果不存在则以 root 身份启动
if grep -q "kali" ${CHROOT}/etc/passwd; then
    KALIUSR="1";
else
    KALIUSR="0";
fi
if [[ \$KALIUSR == "0" || ("\$#" != "0" && ("\$1" == "-r" || "\$1" == "-R")) ]];then
    user="root"
    home="/\$user"
    start="/bin/bash --login"
    if [[ "\$#" != "0" && ("\$1" == "-r" || "\$1" == "-R") ]];then
        shift
    fi
fi

cmdline="proot \\
        --link2symlink \\
        -0 \\
        -r $CHROOT \\
        -b /dev \\
        -b /proc \\
        -b /sdcard \\
        -b $CHROOT\$home:/dev/shm \\
        -w \$home \\
           /usr/bin/env -i \\
           HOME=\$home \\
           PATH=/usr/local/sbin:/usr/local/bin:/bin:/usr/bin:/sbin:/usr/sbin \\
           TERM=\$TERM \\
           LANG=C.UTF-8 \\
           \$start"

cmd="\$@"
if [ "\$#" == "0" ];then
    exec \$cmdline
else
    \$cmdline -c "\$cmd"
fi
EOF

    chmod 700 "$NH_LAUNCHER"
    if [ -L "${NH_SHORTCUT}" ]; then
        rm -f "${NH_SHORTCUT}"
    fi
    if [ ! -f "${NH_SHORTCUT}" ]; then
        ln -s "${NH_LAUNCHER}" "${NH_SHORTCUT}" >/dev/null
    fi
   
}

function create_kex_launcher() {
    KEX_LAUNCHER=${CHROOT}/usr/bin/kex
    cat > $KEX_LAUNCHER <<- EOF
#!/bin/bash

function start-kex() {
    if [ ! -f ~/.vnc/passwd ]; then
        passwd-kex
    fi
    USR=\$(whoami)
    if [ \$USR == "root" ]; then
        SCREEN=":2"
    else
        SCREEN=":1"
    fi 
    export MOZ_FAKE_NO_SANDBOX=1; export HOME=\${HOME}; export USER=\${USR}; LD_PRELOAD=/usr/lib/aarch64-linux-gnu/libgcc_s.so.1 nohup vncserver \$SCREEN >/dev/null 2>&1 </dev/null
    starting_kex=1
    return 0
}

function stop-kex() {
    vncserver -kill :1 | sed s/"Xtigervnc"/"NetHunter KeX"/
    vncserver -kill :2 | sed s/"Xtigervnc"/"NetHunter KeX"/
    return $?
}

function passwd-kex() {
    vncpasswd
    return $?
}

function status-kex() {
    sessions=\$(vncserver -list | sed s/"TigerVNC"/"NetHunter KeX"/)
    if [[ \$sessions == *"590"* ]]; then
        printf "\n\${sessions}\n"
        printf "\n你可以使用 KeX 客户端连接这些显示器.\n\n"
    else
        if [ ! -z \$starting_kex ]; then
            printf '\n启动 KeX 服务器时出错。\n请尝试 "nethunter kex kill" 或重启你的 termux 会话并重试.\n\n'
        fi
    fi
    return 0
}

function kill-kex() {
    pkill Xtigervnc
    return \$?
}

case \$1 in
    start)
        start-kex
        ;;
    stop)
        stop-kex
        ;;
    status)
        status-kex
        ;;
    passwd)
        passwd-kex
        ;;
    kill)
        kill-kex
        ;;
    *)
        stop-kex
        start-kex
        status-kex
        ;;
esac
EOF

    chmod 700 $KEX_LAUNCHER
}

function fix_profile_bash() {
    ## Prevent attempt to create links in read only filesystem
    if [ -f ${CHROOT}/root/.bash_profile ]; then
        sed -i '/if/,/fi/d' "${CHROOT}/root/.bash_profile"
    fi
}

function fix_resolv_conf() {
    ## 我们没有 systemd，所以使用 Quad9 DNS 服务器的静态条目
    echo "nameserver 9.9.9.9" > $CHROOT/etc/resolv.conf
    echo "nameserver 149.112.112.112" >> $CHROOT/etc/resolv.conf
}

function fix_sudo() {
    ## 修复启动时的 sudo 和 su 权限
    chmod +s $CHROOT/usr/bin/sudo
    chmod +s $CHROOT/usr/bin/su
    echo "kali    ALL=(ALL:ALL) ALL" > $CHROOT/etc/sudoers.d/kali

    # https://bugzilla.redhat.com/show_bug.cgi?id=1773148
    echo "Set disable_coredump false" > $CHROOT/etc/sudo.conf
}

function fix_uid() {
    ## 更改 kali 的用户 ID 和组 ID 以匹配 termux 用户
    USRID=$(id -u)
    GRPID=$(id -g)
    nh -r usermod -u "$USRID" kali 2>/dev/null
    nh -r groupmod -g "$GRPID" kali 2>/dev/null
}

function print_banner() {
    clear
    printf "${blue}##################################################\n"
    printf "${blue}##                                              ##\n"
    printf "${blue}##  88      a8P         db        88        88  ##\n"
    printf "${blue}##  88    .88'         d88b       88        88  ##\n"
    printf "${blue}##  88   88'          d8''8b      88        88  ##\n"
    printf "${blue}##  88 d88           d8'  '8b     88        88  ##\n"
    printf "${blue}##  8888'88.        d8YaaaaY8b    88        88  ##\n"
    printf "${blue}##  88P   Y8b      d8''''''''8b   88        88  ##\n"
    printf "${blue}##  88     '88.   d8'        '8b  88        88  ##\n"
    printf "${blue}##  88       Y8b d8'          '8b 888888888 88  ##\n"
    printf "${blue}##                                              ##\n"
    printf "${blue}####  ############# NetHunter ####################\n"
    printf "${blue}####  ############ (网络猎人) ####################\n"
    printf "${blue}by东经雨(提供汉化)${reset}\n\n"
}


##################################
##              Main            ##

# 添加一些颜色
red='\033[1;31m'
green='\033[1;32m'
yellow='\033[1;33m'
blue='\033[1;34m'
light_cyan='\033[1;96m'
reset='\033[0m'

EXTRA_ARGS=""
if [[ ! -z $1 ]]; then
    EXTRA_ARGS=$1
    if [[ $EXTRA_ARGS != "--no-check-certificate" ]]; then
        EXTRA_ARGS=""
    fi
fi

cd "$HOME"
print_banner
get_arch
set_strings
prepare_fs
check_dependencies
get_rootfs
get_sha
verify_sha
extract_rootfs
create_launcher
cleanup

printf "\n${blue}[*] 为 Termux 配置 NetHunter ...\n"
fix_profile_bash
fix_resolv_conf
fix_sudo
create_kex_launcher
fix_uid

print_banner
printf "${green}[=] Kali NetHunter 已成功安装到 Termux${reset}\n\n"
printf "${green}[+] 要启动 Kali NetHunter，请输入:${reset}\n"
printf "${green}[+] nethunter             # 启动 NetHunter 命令行界面${reset}\n"
printf "${green}[+] nethunter kex passwd  # 设置 KeX 密码${reset}\n"
printf "${green}[+] nethunter kex &       # 启动 NetHunter 图形界面${reset}\n"
printf "${green}[+] nethunter kex stop    # 停止 NetHunter 图形界面${reset}\n"
#printf "${green}[+] nethunter kex <command> # 在 NetHunter 环境中运行命令${reset}\n"
printf "${green}[+] nethunter -r          # 以 root 身份运行 NetHunter${reset}\n"
#printf "${green}[+] nethunter -r kex passwd  # 为 root 设置 KeX 密码${reset}\n"
#printf "${green}[+] nethunter kex &       # 以 root 身份启动 NetHunter 图形界面${reset}\n"
#printf "${green}[+] nethunter kex stop    # 停止 NetHunter root 会话的图形界面${reset}\n"
#printf "${green}[+] nethunter -r kex kill # 停止所有 NetHunter 图形界面会话${reset}\n"
#printf "${green}[+] nethunter -r kex <command> # 以 root 身份在 NetHunter 环境中运行命令${reset}\n"
printf "${green}[+] nh                    # NetHunter 的快捷方式${reset}\n\n"