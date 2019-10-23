---
title: "High available shadowsocks"
date: 2019-10-23T19:38:03+08:00
draft: false
contentCopyright: false
tags: [ "Shadowsocks" ]
categories: [ "Config" ]
---

我们都知道国内总有一些 404 的网站，但是某些有技术的人总能访问到一些不存在的网站，这个在之前的文章中有说，有这[一篇](https://tosone.cn/post/shadowsocks-ppt/)，也有这[一篇](https://tosone.cn/post/shadowsocks/)，但是每到一些关键节日，某些技术比较不是特别强的人只能等比较严格的网络封锁过去之后才能再去访问那些网站，但是有没有一种永远可用特别高级的方式呢？答案是有的。快看！

<!--more-->

首先你看这个短文的时候默认你已经会了一下几个东西：

- Docker
- docker-compose
- Makefile

我们注意到 Docker Hub 里边有一些关于 Shadowsocks 的镜像，有一个名叫 `shadowsocks/shadowsocks-libev` 是 Shadowsocks 官方的镜像，功能比较单一，但是完全够用。另外一个镜像 `mritd/shadowsocks`，这个镜像功能比较丰富，提供了 kcp 和 obfs 的功能，但是我比较懒得研究，其实官方的那个镜像就挺好。说到这里，镜像解决了，下边来一个 Shadowsocks 的 docker-compose 的启动配置。

``` YAML
version: "3.7"

services:
  shadowsocks-proxy:
    image: nginx:dev
    container_name: shadowsocks
    restart: always
    hostname: shadowsocks
    build: $PWD/shadowsocks-proxy
    ports:
      - ${SHADOWSOCKS_PORT}:${SHADOWSOCKS_PORT}
  shadowsocks:
    image: shadowsocks/shadowsocks-libev:latest
    container_name: shadowsocks
    restart: always
    hostname: shadowsocks
    environment:
      - METHOD=chacha20-ietf-poly1305
      - PASSWORD=${SECRETPERSONAL}
    ports:
      - ${SHADOWSOCKS_PORT}:8388
```

OK，解释一下上边的配置，`shadowsocks-proxy` 这个 service 的配置先不用管，下边有解释。`shadowsocks` 这个 service 的配置仅仅定义了加密方法和秘钥，还有对外映射的 8388 端口。里边有一些环境变量的东西，暂时先不管，下边讲。如果配置完了的话，直接运行 `docker-compose up -d shadowsocks` 就完了，你的 Shadowsocks 就启动完了，就能用了。

然后看一眼环境变量的文件内容，如下，保存内容为 `.env`。

``` bash
SHADOWSOCKS_SERVER=us.tosone.cn china.tosone.cn
SHADOWSOCKS_PORT=8388
SECRETPERSONAL=my_secret_you_dont_know
```

上边 `SHADOWSOCKS_PORT` 设置成了 8388 但是你千万不要这么做，8388，这个数字很危险，希望看到这篇短文的人都能懂。`SHADOWSOCKS_SERVER` 这个在下文有用，先别着急。

最后就剩下最重要的一个文件了，`Makefile` 如下：

``` makefile
include .env
export $(shell sed 's/=.*//' .env)

.PHONY: install-docker
install-docker:
	curl -fsSL https://get.docker.com | sh
	sudo usermod -aG docker $(USER)
	sudo curl -L https://github.com/docker/compose/releases/download/1.24.1/docker-compose-`uname -s`-`uname -m` -o /usr/bin/docker-compose
	sudo chmod +x /usr/bin/docker-compose

.PHONY: shadowsocks-proxy
shadowsocks-proxy:
	shadowsocks-proxy/gen.sh >> $@/modules-enabled/shadowsocks.conf
	docker-compose -f docker-compose-shadowsocks.yml up --force-recreate -d --build $@
	$(RM) $@/modules-enabled/shadowsocks.conf

.PHONY: shadowsocks
shadowsocks:
	docker-compose -f docker-compose-$@.yml up --force-recreate -d $@

.PHONY: upgrade
upgrade:
	docker-compose pull

```

`Makefile` 的前两行是将 .env 中的环境变量导入到 Makefile 执行的环境变量中，这里需要注意的一点是，Makefile 执行的环境变量和你当前在的 bash 环境变量不是一个东西，需要特别注意，这一点很重要，一定要记住。

`Makefile` 的 target `install-docker` 是在你的环境里边安装 Docker 和 docker-compose，但是如果你是国内的环境的话，这个命令执行的时间长度将会比你的一辈子都要长，安装这两个东西不过多深入，反正这样安装的是最正统的。哈哈哈。

`Makefile` 的 target `shadowsocks` 是将 shadowsocks server 运行起来，需要找个能访问那些 404 网站的服务器上运行。

`Makefile` 的 target `shadowsocks-proxy` 是运行起来一个对于 Shadowsocks server 的透明代理。里边写的比较复杂，里边主要做的是可以对多个 Shadowsocks server 做反向代理的负载均衡，哈哈哈，会将 `SHADOWSOCKS_SERVER` 中的配置写到 nginx 的配置中作为代理用。主要的魔法在 `shadowsocks-proxy/gen.sh` 这个文件里边，内容如下：

``` bash
#!/bin/sh

cat << EOF
stream {
	upstream group {
EOF

for i in $SHADOWSOCKS_SERVER; do
cat << EOF
		server $i:$SHADOWSOCKS_PORT;
EOF
done

cat << EOF
	}
	server {
		listen $SHADOWSOCKS_PORT;
		listen $SHADOWSOCKS_PORT udp;
		proxy_pass group;
	}
}
EOF
```

So easy，是不是。

`SHADOWSOCKS_PORT` 这个变量在代理中的配置，在 Shadowsocks server 中的外部地址都是一样的，这就可以只改一个地方的配置，其他同步配置只执行一条命令就完成了服务的更新。

说到这里其实该说的都已经说完了，但是怎么个高可用呢？首先一个国外的服务器作为 Shadowsocks server，如果国内把这个 IP 在某些地区封掉呢？（经验发现 IP 被封，是某些区域可用，某些区域不可以用，全国区域都被封，那真的是神仙难救）那么就需要在国内找个能访问这个 IP 的国内主机做一次代理，有时候一层代理还不够，那就多来几层，有时候国外的主机一台不稳定，那就多台负载均衡。反正可以尽情发挥。

以上零零散散的有一些配置，不适合学习，完整的所有配置下载在[这里](https://tc.tosone.cn/high-available-shadowsocks.tar.gz)。
