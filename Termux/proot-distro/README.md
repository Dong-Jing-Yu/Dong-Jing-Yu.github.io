注意本文件夹下的文件可能有所修改,官方文件请点击\
[proot-distro](https://github.com/termux/proot-distro)

## debian-bookworm-aarch64-pd-v4.17.3.tar.xz

### 2025/7/31
修改了`/etc/apt/sources.list`
```
deb [signed-by="/usr/share/keyrings/debian-archive-keyring.gpg"] http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib
deb [signed-by="/usr/share/keyrings/debian-archive-keyring.gpg"] http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib
deb [signed-by="/usr/share/keyrings/debian-archive-keyring.gpg"] http://security.debian.org/debian-security bookworm-security main contrib
```