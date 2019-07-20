---
date: 2017-04-17 21:38:24
tags: [ "Linux" ]
title: "ECS init"
categories: [ "Config" ]
draft: false
contentCopyright: false
---

ECS 新购主机 Ubuntu 初始化的一些操作。

<!--more-->

### 重置主机名
- 修改你的自己的个性化主机名 `vi /etc/hostname`。
- 完事之后还需要修改 `vi /etc/hosts` [原因请看](https://askubuntu.com/questions/59458/error-message-when-i-run-sudo-unable-to-resolve-host-none)。
- 最后 `apt update`。

### 挂载数据盘

系统盘是系统该有东西，总是要有个存储数据的地方，所以你需要有一个数据盘。

- 查看未挂载的磁盘 `fdisk -l`
- 创建分区 `fdisk /dev/xvdb`
- 格式化分区 `mkfs.ext3 /dev/xvdb`
- 挂载目录 `mkdir /data && mount /dev/xvdb /data`
- 自动挂载 `vi /etc/fstab`
- 添加 `/dev/xvdb /data ext3 defaults 0 0`
- 重启 `reboot`
- 查看分区信息 `df`

### 创建用户

``` bash
adduser tosone
apt install sudo
gpasswd -a tosone sudo
visudo
```

在 `# User privilege specification` 这里行下边添加一行 `tosone ALL=(ALL:ALL) ALL`。tosone 这个用户将使用密码来拥有所有 root 拥有的权限。

### 复制公钥

`ssh-key-copy tosone@ip` 将自己的 pubkey 复制到远程的主机上，然后后续不再需要密码登录主机了。

### 安装常用软件

``` bash
apt-get install redis-server mosquitto python-pip vim zsh git supervisor curl
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
echo "export NVM_DIR=\"\$HOME/.nvm\"" >> ~/.zshrc
echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"" >> ~/.zshrc
source ~/.zshrc
```
