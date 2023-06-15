---
date: 2019-04-26 10:38:24
tags: [ "Linux" ]
title: "CoreOS 初始化配置"
categories: [ "Config" ]
draft: false
contentCopyright: false
---

> Container Linux (formerly CoreOS Linux) is an open-source lightweight operating system based on the Linux kernel and designed for providing infrastructure to clustered deployments, while focusing on automation, ease of application deployment, security, reliability and scalability. As an operating system, Container Linux provides only the minimal functionality required for deploying applications inside software containers, together with built-in mechanisms for service discovery and configuration sharing.

<!--more-->

各个虚拟主机平台上基本都有 CoreOS 系统，但是 Aliyun 上的 ECS 就是有问题的，在用 `docker build` 的时候总出问题，在 Docker 的仓库中有这些[讨论](https://github.com/coreos/bugs/issues/2340)，最终的解决方法就是：

``` bash
# fix wrong driver
echo '{ "storage-driver": "devicemapper" }' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker.service

# fix aliyun buggy selinux
sudo sed -i 's/SELINUXTYPE=mcs/SELINUXTYPE=targeted/' /etc/selinux/config
```

### 升级通道

定义了 CoreOS 每次升级的目标版本号。官方提供了三个升级通道，分别为 Alpha、Beta 和 Stable，简单来说就是每个大版本升级的内测、公测和正式发行版。只不过 CoreOS 目前是采用一个不断增加的数字来表示各个版本号，数字越大则相对版本越高。

各通道发布更新的频率依次为（官方目标数据，实际可能不准时）：

- Alpha：每周星期四发布
- Beta：每两周发布一次
- Stable：每个月发布一次

每个通道当前的具体版本号可以在[这个网页](https://coreos.com/releases/)上查看到。关于升级通道，[这篇文档](https://coreos.com/os/docs/latest/switching-channels.html)有更详细的介绍。

如果你想切换系统所在发布通道的话可以修改文件 `/etc/coreos/update.conf` 中的 `GROUP=beta`。

然后重启一下 update-engine 服务 `systemctl restart update-engine`

### 升级策略

关系到系统自动升级后用户是否需要手工重启。它的值可以是 best-effort（默认值）、 etcd-lock、 reboot 和 off。其作用依次解释如下：

- best-effort：如果Etcd运行正常则相当于 etcd-lock，否则相当于 reboot
- etcd-lock：自动升级后自动重启，使用 LockSmith 服务调度重启过程
- reboot：自动升级后立即自动重启系统
- off：自动升级后等待用户手工重启

升级通道和升级策略都可以在系统启动时的 cloud-config 中的 coreos.update 中配置，例如：

``` yml
coreos:
  update:
    reboot-strategy: best-effort
    group: alpha
```

对于已经启动的集群，可以在 `/etc/coreos/update.conf` 配置文件中修改，其内容格式如下：

``` conf
GROUP=alpha
REBOOT_STRATEGY=best-effort
```

修改完成后需要重启一下 update-engine 服务：`systemctl restart update-engine`。

用户手动执行升级一般是没有必要滴。当然如果你非要这么做，也非常简单，命令是 `update_engine_client -update`。如果只是想查看一下有没有新版本，可以换个参数 `update_engine_client -check_for_update`。

### 添加账户

`useradd -U -m tosone -G sudo`，添加一个新的账户，`passwd tosone`。
赋予 `sudo` 权限，`visudo -f /etc/sudoers.d/user1` 添加这样一行： `tosone ALL=(ALL) NOPASSWD: ALL`。

验证：

``` bash
# su tosone
$ cat /etc/sudoers.d/tosone
cat: /etc/sudoers.d/tosone: Permission denied

$ sudo cat /etc/sudoers.d/tosone
tosone ALL=(ALL) NOPASSWD: ALL
```

### toolbox

toolbox is a small script that launches a container to let you bring in your favorite debugging or admin tools.
There are currently two scripts that live within this repository:

- toolbox: designed for Container Linux, uses rkt and systemd-nspawn
- rhcos-toolbox: designed for Red Hat CoreOS, uses podman

``` bash
$ /usr/bin/toolbox
Spawning container core-fedora-latest on /var/lib/toolbox/core-fedora-latest.
Press ^] three times within 1s to kill container.
[root@localhost ~]# dnf -y install tcpdump
...
[root@localhost ~]# tcpdump -i ens3
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on ens3, link-type EN10MB (Ethernet), capture size 65535 bytes
```

Automatically enter toolbox on login. Set an `/etc/passwd` entry for one of the users to `/usr/bin/toolbox`:

``` sh
useradd bob -m -s /usr/bin/toolbox -U -G sudo,docker,rkt
```

Now when SSHing into the system as that user, toolbox will automatically be started:

``` bash
$ ssh bob@hostname.example.com
Container Linux by CoreOS alpha (1284.0.0)
...
Spawning container bob-fedora-latest on /var/lib/toolbox/bob-fedora-latest.
Press ^] three times within 1s to kill container.
[root@localhost ~]# dnf -y install emacs-nox
...
[root@localhost ~]# emacs /media/root/etc/systemd/system/docker.service
```

### Install docker-compose

``` bash
mkdir -p /opt/bin
curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /opt/bin/docker-compose
```
