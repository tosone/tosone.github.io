---
title: "Gitea"
date: 2019-10-23T21:03:15+08:00
draft: false
contentCopyright: false
tags: [ "Git" ]
categories: [ "Config" ]
---

A painless self-hosted Git service. Gitea is a community managed lightweight code hosting solution written in Go.

<!--more-->

### 部署

``` yaml
version: '3.7'

services:
  gitea:
    image: gitea/gitea:1.9
    container_name: gitea
    hostname: gitea
    ports:
      - 22:22/tcp
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always
    volumes:
      - ${VOLUME_PREFIX}/gitea:/data
    networks:
      - default
    labels:
      traefik.enable: true
      traefik.port: 3000
      traefik.frontend.rule: Host:git${HOST_DOMAIN}
  traefik:
    image: traefik:alpine
    container_name: traefik
    restart: always
    ports:
      - 80:80
      - 443:443
    networks:
      - default
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.toml:/traefik.toml
      - ${VOLUME_PREFIX}/traefik/acme.json:/acme.json
    labels:
      traefik.enable: true
      traefik.frontend.rule: "Host:traefik.tosone.cn"
      # get md5 from htpasswd or http://www.htaccesstools.com/htpasswd-generator/
      # and then double all $ to $$ to avoid docker-compose
      traefik.frontend.auth.basic: "tosone:$$apr1$$2DvxBXHm$$7iRM18fGqs30h2r0gDZK0/"
      traefik.port: 8080
networks:
  default:
    external:
      name: ${DOCKER_NETWORK:-webproxy}
```

直接执行，如下命令就可以运行了：

``` bash
docker-compose up --force-recreate -d gitea
```

按照如上的配置如上的命令执行之后，是访问不到的，因为没有暴露任何服务到 Docker 外部。就算把服务暴露出来也仅仅只是一个简单的 http 的 git server，没什么高级的。我们需要一个高级的实现 https 和 ssh，还有存储备份。

### HTTPS

实现 https 的方式有很多，这里选用 [traefik](https://traefik.io/) 这个软件，可以实现 HTTPS 的自动续期，负载均衡，蓝绿部署等等，配置比较复杂，我们需要的配置很简单。配置如下：

``` toml
logLevel = "ERROR"
defaultEntryPoints = ["https","http"]

[api]
debug = true
entryPoint = "dashboard"

[entryPoints]
  [entryPoints.http]
  address = ":80"
    [entryPoints.http.redirect]
    entryPoint = "https"
  [entryPoints.https]
  address = ":443"
  [entryPoints.https.tls]
  [entryPoints.dashboard]
  address = ":8080"

[docker]
endpoint = "unix:///var/run/docker.sock"
watch = true

[acme]
email = "i@tosone.cn"
storage = "acme.json"
entryPoint = "https"
onHostRule = true
[acme.httpChallenge]
entryPoint = "http"
```

运行如下启动 traefik：

``` bash
docker-compose up --force-recreate -d traefik
```

OK，这时候再启动你的 gitea，然后把相应的域名解析到你的服务器上，你就完成了一个 https 的服务部署了，因为 traefik 可以监听所有 docker 上的容器的 label 参数，然后代理对应容器的服务成 HTTPS

### SSH

还不满足，Git 的 ssh 功能还不能用，因为服务器的 22 端口和这个 service 需要监听的端口是冲突的，那么需要一边让路。这个端口做不到复用，这里的方案是服务器的 ssh 端口为 git ssh 端口让步。OK，上边的那个 docker-compose.yml 文件不需要任何修改，修改本机的 `/etc/ssh/sshd_config` 里边有个关于 `Port` 的配置修改为其他端口，暂且认为你修改成了 10，然后重启 `sshd` 的服务 `systemctl restart sshd`，OK，现在 gitea 的 SSH 22 端口的服务是可以使用了，但是有个后遗症，导致我们以后登录服务器需要用这样的命令登陆 `ssh -p 10 user@10.10.10.10`，每次需要我们手动指定这个端口号，有些人会受不了，可以这么做，修改你本地的 `$HOME/.ssh/config` 这个文件，添加如下内容：

``` ini
Host my_saoqi_host
    Hostname 10.10.10.10
    User user
    Port 10
```

以后你登录你的主机就可以这样了 `ssh my_saoqi_host`，是不是很骚气？

### 存储备份

你的 Gitea 可以用 HTTPS 了，也可以 SSH 了，但是主机突然没了怎么办？那就需要我们定时的备份一下存储到云存储上，这里选用 OSS。经过我的一番调教每次运行如下命令直接将 Gitea 的内容被增量备份 OSS：

``` bash
ossutil64 cp -r -u -c .ossutilconfig  /data/volume oss://your-bucket/volume
```

将以上内容加入到 crond 中就可以定时备份存储到 OSS 上了，是增量更新，OSS 上的存储也不贵，你总是内网传输这部分内容，所以不会有流量传输的费用，仅有存储费用。

ossutil64 的文档在[这里](https://www.alibabacloud.com/help/zh/doc-detail/50452.htm)。

### 总结

完整的项目配置下载地址在[这里](https://tc.tosone.cn/gitea.tar.gz)。

OK，到这里配置做完了，每次你启动服务只需要运行如下两个命令：

``` bash
make traefik
make gitea
```
