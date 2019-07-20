---
tags: [ "Nginx" ]
date: 2017-02-24 21:45:11
title: "Nginx 搭建直播"
categories: [ "Tutorial" ]
draft: false
contentCopyright: false
---

相关行业数据显示，2015 年至今，全国在线直播平台数量超过 200 家。截止 2016 年 10 月，网络直播行业除孕育出欢聚时代、9158 两家上市公司外，斗鱼和映客也已跻身独角兽行列，在方正证券的预测中，2020 年网络直播市场规模将达到 600 亿，有研究甚至认为 2020 年网络直播及周边行业将撬动千亿级资金。

<!--more-->

目前直播很火，但是直播是怎么做的呢？很多地方都有相关的教程，在这里做一个我做的简单的 DEMO，从零开始。以下所说的服务器环境全部在 Linux 上。

### Nginx 的编译安装

  - 在服务器上下载以下源码，截至目前这些包都是最新的：
    - 下载 Nginx 的源码 [链接](https://nginx.org/download/nginx-1.10.1.zip)
    - 下载 pcre 的源码 [链接](ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.39.tar.gz)
    - 下载 zlib 的源码 [链接](https://nginx.org/download/nginx-1.10.1.zip)
    - 下载 openssl 的源码 [链接](https://nginx.org/download/nginx-1.10.1.zip)
    - 下载 nginx-rtmp-module 的源码 [链接](https://github.com/arut/nginx-rtmp-module)
  - 下载完了之后你的目录结构应该是这样的，顺序的罗列在某个文件夹下：
    - nginx
    - pcre
    - openssl
    - zlib
    - nginx-rtmp-module
  - 编译
    - 进入 pcre 的目录执行命令 `./configure && make && make install`。
    - 进入 nginx 的目录执行命令

``` bash
./configure --add-module=../nginx-rtmp-module --with-http_ssl_module  --with-openssl=../openssl --with-zlib=../zlib
make
make install
```

  - 运行
    - 安装好的nginx都在 `/usr/local/nginx` 中。
    - 修改 `/usr/local/nginx/conf/nginx.conf` 文件内容:

``` apacheConf
worker_processes  1;
events {
  worker_connections  1024;
}

rtmp {
  server {
    listen 1935;
    chunk_size 4096;
    application live {
      live on;
      record off;
    }

    application hls {
      live on;
      hls on;
      hls_path hls_temp;
      hls_fragment 8s;
    }
  }
}
http {
  include       mime.types;
  default_type  application/octet-stream;
  sendfile        on;
  keepalive_timeout  65;
  server {
    listen       80;
    server_name  localhost;
    location / {
      root   html/Love/;
      index  index.html index.htm;
    }
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
    root   html;
  }
}
```

### 推流与观看
  - 推流
    - 向服务端推送直播的内容，可以用比较流行的 [OBS](https://obsproject.com/)，当然在网上搜一下一些ffmpeg的命令也是可以的。
    - 设置广播设定为 `rtmp://ServerIP:1935/live`。
    - 设置播放路径串流码为 `test`。
    - 选择一个场景开始串流。
  - 观看
    - 就用大名鼎鼎的 [VLC](http://www.videolan.org/vlc/)
    - 设置 打开媒体 -> 打开网络 `rtmp://ServerIP/live/test`
    - VLC 也是有手机版的，是同样。
