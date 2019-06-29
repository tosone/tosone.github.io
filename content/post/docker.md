---
date: 2017-05-07 10:59:43
tags: [ "Docker" ]
title: "Docker Tutorial"
categories: [ "Tutorial" ]
---

> Securely build, share and run any application, anywhere.[^description]

<!--more-->

### 安装 Docker

各种 Linux 发行版都有相应的 Docker 软件在软件源中，但是需要自己寻找，比如 Ubuntu 19.04 中这么安装 `sudo apt install docker.io`。但是最稳妥的安装方式是 `curl -sSL https://get.docker.com/ | sh`。官方的这个脚本会自动配置 Docker 的软件源，但是一般国内都很慢，很痛苦，还会配置 Docker 在 systemd 中的 service，想要开机自启动就需要这个 service，随后还会自动的将这个 service 启动起来。这样安装完成之后用 Docker 的任何命令会发现都需要 sudo 权限，原因在于 Docker 不在你的用户组里边，那么就需要将它加入到当前用户的用户组里边，运行 `sudo usermod -a -G docker $USER`，然后当前用户重新登录就 OK 了。

### 安装 Docker Compose

``` bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose
chmod +x /usr/bin/docker-compose
```

### 验证安装

``` bash
docker version
docker-compose --help
```

### 镜像与容器

docker-machine start 


[^description]: Enterprise Container Platform for High-Velocity Innovation https://www.docker.com/
