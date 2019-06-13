---
title: "RaspberryPi 上手"
date: 2017-11-25 18:27:37
tags: [ "Raspberry" ]
---

当你花 35 美元买到一部树莓派（Raspberry Pi）计算机的时候，机器里面是没有预装操作系统（OS）的。这个时候你要自己下载一个 OS 到 SD 卡，插到树莓派上重启完成 OS 的安装。这一切看起来很简便，但你考虑过这个跟树莓派兼容的OS是哪里来的吗？

<!--more-->

其实，树莓派的操作系统 Raspbian 的来历可不简单。它诞生的前提是，每周 60 个小时的工作量，处理一大堆自建的 ARM 计算机以及重建 19000 组 Linux 软件包。而这一切，都是由两名志愿者完成的。他们是：麦克·汤姆森（Mike Thompson）和彼得·格林（Peter Green）。

### 下载系统

适用于树莓派的系统有很多，这里主要说 Raspberry，从[这里](https://www.raspberrypi.org/downloads/raspbian/)下载 [Raspberry](https://downloads.raspberrypi.org/raspbian_lite_latest)。

### 烧写镜像到 SD 卡

Windows 系统的话，需要这个软件 [win32diskimager](https://sourceforge.net/projects/win32diskimager/)。
在 Mac 上或者 Linux 上 用这个命令烧录进去 `sudo dd bs=4M if=raspbian.img of=/dev/sdb`

### 初始化

在 raspbian 系统中的 boot 分区中新建一个空的文件并命名为 `ssh`。当系统启动的时候将会启动 ssh，然后就可以用 ssh 连接上去。
目前下载的 raspbian 的系统都是基于 Debian 9 stretch 的，所以在 boot 分区下新建文件 `wpa_supplicant.conf` 内容如下：

{% codeblock wpa_supplicant.conf lang:apacheConf %}
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="YOUR_NETWORK_NAME"
    psk="YOUR_PASSWORD"
    key_mgmt=WPA-PSK
}
{% endcodeblock %}

系统启动后将会把这个文件移动到 `/etc/wpa_supplicant/` 文件夹下，然后自动连接 Wifi。

### 查找内网 RaspberryPi

`sudo nmap -sP 192.168.31.0/24 | awk '/^Nmap/{ip=$NF}/B8:27:EB/{print ip}'`

### 切换源

只需要将 `/etc/apt/sources.list` 和 `/etc/apt/sources.list.d/raspi.list` 中修改一下即可。

{% codeblock /etc/apt/sources.list lang:bash %}
deb https://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ stretch main contrib non-free rpi
deb-src https://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ stretch main contrib non-free rpi
{% endcodeblock %}

{% codeblock /etc/apt/sources.list.d/raspi.list lang:bash %}
deb https://mirror.tuna.tsinghua.edu.cn/raspberrypi/ stretch main ui
deb-src https://mirror.tuna.tsinghua.edu.cn/raspberrypi/ stretch main ui
{% endcodeblock %}

### 切换 DNS

修改 `/etc/resolv.conf` 为以下内容：

{% codeblock /etc/resolv.conf lang:apacheConf %}
nameserver 9.9.9.9
{% endcodeblock %}
