---
title: 优雅的翻墙
tags: [ "Shadowsocks" ]
date: 2017-02-24 15:14:28
categories: [ "Config" ]
draft: false
contentCopyright: false
---

Long long ago, 在一个叫 v2ex 的地方，有一位叫做 clowwindy 的用户。他为了避免网络流量分类技术和 ssh tunnel 的低效，自己写了一个用于加密流量的协议，并自用了一年多. 后来，由于这个协议非常高效，而且使用json 作为配置文件，配置起来非常方便，所以迅速赢得了很多用户，并在 v2ex 上有了一个专属的节点。shadowsocks 迅速被移植到各种平台、各种语言，用户也急剧上升，并且有了专门经营 shadowsocks 服务的商家。

<!--more-->

### 关于翻墙
---

> 不会翻墙的程序员是没有走在正确的康庄大道上，不会翻墙的民众就不是明事理的民众，翻墙是你的必备技能。

### 翻墙历史

翻墙的话，方法有很多，直接到百度上搜一下关键词 `vpn` 也是可以搜到很多相关信息。很多乱七八糟的那些网站里边的东西也都是可以用的。但是有一点，那些网站里边的东西可能并不会长久，可能隔一段时间网站就消失了，找不到了，你花钱买的翻墙利器也就没了保障。

说一点黑历史，之前 UC 浏览器中有一个翻墙的神器叫红杏出墙，当时觉得特别好用，也是免费的。翻墙嘛，毕竟也是国家花大力气建造的 GFW 来做这堵墙的，这么好的工具很定不能让你轻易地用啊。之后 UC 就撤掉了这个插件，现在也找不到了，现在关于红杏出墙的所有网站都算是空壳了，千万不要再相信关于红杏出墙的任何网站，想当年红杏出墙的克隆网站、钓鱼网站相当之多，现在已经是凄凄惨惨戚戚。后来也是出现一些翻墙浏览器，简单的就是说，在浏览器中做了一些插件，只需要把人家提供的浏览器装上去，就可以翻墙了，但是无奈，这种东西能用的时间太过于短了，市场需要更新，对于嫌麻烦的人来说这简直就是不可以忍受的。然后还有一个不得不说的工具 `Lantern` ，这个工具是基于 `P2P` 的，这种点对点的协议屏蔽的很多的中间环节，所以说能够翻墙，但是在国内想封锁 `Lantern` 是比较容易的，只是说国家在很大程度上不想让绝大多数人翻墙而已，这才是GFW的目的，目前 `Lantern` 是时不时就不能用的玩意儿。

### Windows 篇

下面来到我们的重要环节，怎么样才能优雅地翻墙，首先是 `Windows` 篇：

首先我是不推荐那些乱七八糟的网站里边的小工具的，不可靠也不长久，然后也不推荐 `Lantern` 的。只推荐一个东西：[Shadowsocks](https://shadowsocks.org/)，这个网站不翻墙是访问不到的。

然后着重强调一点的是本文不提供任何非官方的下载链接，所有官方下载链接均是目前的最新版，如果你看到的是时间是很久以后，请根据提供的链接自行寻找最新版的下载链结，我想这个并不困难吧。

最后，本文不提供任何截图，原因不说明。

#### 第一种方法

- 首先，到 `GitHub` 找到 [Shadowsocks](https://github.com/shadowsocks/) 这个项目，可以稍微浏览一下，这个项目是开源的，你可以查看它的所有项目的每一行代码。
- 然后，找到一个项目，名字叫 [shadowsocks-qt5](https://github.com/shadowsocks/shadowsocks-qt5)，看到 `QT5` 你应该知道，这个项目的软件是跨平台的。
- OK，亲爱的盆友们，在这个项目里边找找 `Windows` 的软件在哪里吧。在代码列表的上方有个 [Release](https://github.com/shadowsocks/shadowsocks-qt5/releases) 的链接，点开来看，就可以看到最新发布的版本了。
- Release 页面往下拉一下，就可以看到两个编译好的版本的下载链接，截止本文更新的时间，最新版本的发布时间为 2017 年 7 月 24 日。可以下载 [ss-qt5-v2.9.0-win64.7z](https://github.com/shadowsocks/shadowsocks-qt5/releases/download/v2.9.0/ss-qt5-v2.9.0-win64.7z)。下载会很慢，稍等即可。然后上边还有一个后缀名为 `AppImage` 的文件，这种格式是 Linux 的通用格式，加上可执行权限就可以在 Linux 上直接使用，目前发现在 Deepin 系统上，由于系统问题暂时有问题，其他系统没有任何问题。
- 下载后，可以直接运行，然后需要配置一些信息，包括服务器 `IP`，`Port` 等等之类的信息。这些信息怎么获取到呢？这些信息是需要买的，或者自己搭建一个 Shadowsocks Server 的服务。
- 之后，把购买到的 `IP`，`Port`，加密算法填进去，请反复验证以上信息是一致的，否则不能成功。
- 最后在，本地地址上填写 `0.0.0.0`，这样写的好处是可以使局域网内的其他用户也可以用这个翻墙服务，本地端口填写 1880，也务必保证这个填写的 1880 端口没有本其他应用程序占用，否则请更换成其它端口，之后要用。点击软件上方的连接按钮即可。到此为止，我们的 Shadowsocks 已经连接成功了。
- 但是仍然没有办法访问墙外的资源，因为这个 Shadowsocks 的客户端仅仅是在本地开启了一个 socks5 的通道，浏览器翻墙需要另外的一个东西了，名字叫 [SwitchyOmega](https://github.com/FelisCatus/SwitchyOmega)，具体它的下载方法跟 Shadowsocks 下载方法是一样的。
- 现在我认为你已经下载了 [SwitchyOmega](https://github.com/FelisCatus/SwitchyOmega)，而且用的浏览器是 `Chrome`。
- 在 Chrome 中访问 [extensions](chrome://extensions/)，打开右上角的开发者模式。
- 然后把 SwitchyOmega.crx 文件拖动到 [extensions](chrome://extensions/) 这个页面上。
- 之后 SwitchyOmega 会引导你怎么用。可以看一眼，没什么坏处。
- 首先选择到右侧的 `proxy` 选项。代理协议选择 `SOCKS5`，代理服务器填写 `127.0.0.1`，代理端口填写上边设置好的 `1880`。
- SwitchyOmega 是有几种模式的：
	- proxy：全部都翻墙，显然是不合理的，对于国内的网站是不需要翻墙的。
	- auto switch：自动选择，这是本人非常推荐的，选择不能访问的页面翻墙。
	- 系统代理：选择系统上的代理，这种一般用不到。
	- 直接连接：就是没有做任何的代理。
- 当有资源未加载的话，在 Chrome 浏览器有右上角有个圆圈，那是 SwitchyOmega 的图标，然后图标上会有带有数字的感叹号。点击图标，会有显示多少资源未加载的菜单。之后会让你选择那些未加载的资源是否选择 proxy，选择之后那个资源就永远的加载到了 SwitchyOmega 的翻墙列表中了。不需要再次设置，除非浏览器卸载或者 SwitchyOmega 重装。之所以有时候某个资源明明已经选择翻墙了，但是下次还是会有显示那个资源未被加载，原因在于这个资源可能不稳定或者网络情况不太好，请给它足够的时间的时间，而不是一直点加入我的翻墙列表中。
- 当用了一段时间 SwitchyOmega 之后，翻墙列表会越来越丰富，这是一个习惯培养的过程。

#### 第二种方法

- 第一种方法是最行之有效最稳定的方法，这第二种方法和上边的方法没有太大的不一样，只是用的 Shadowssocks 软件不太一样。
- 首先，还是查看 [GitHub](https://github.com) 上用户 [shadowsocks](https://github.com/shadowsocks) 有一个项目 [shadowsocks-chromeapp](https://github.com/shadowsocks/shadowsocks-chromeapp)，看名字就知道这是 Chrome 的一个插件。
- 唯一不好的是，这个插件需要编译而且官方没有提供编译好的版本，没有程序员朋友为你编译，你是没有办法用得了的，貌似没有人再为它跟新任何东西了。如果你动手能力足够强的话，可以看着文档自己编译。
- 后边的步骤和上边第一种方法没有什么不一样的了。
- 然后说一个比较坑的地方，这个插件 shadowsocks-chromeapp，不知道为什么会自己关闭。等到你不能翻墙的时候，查看一下 shadowsocks-chromeapp 是否在开着吧。

#### 第三种方法

- 第三种方法，也是用的 Shadowssocks 软件不太一样，这次用的软件是用 C# 写的。在某一段时间 GitHub 上这个仓库的源代码被移除了，这是中国政府的斗争结果，我很不想表达我的愤怒的，但是还是要发泄一下，GFW 吃狗屎去吧。目前代码都还在，但是项目介绍中的 `If you want to keep a secret, you must also hide it from yourself.` 意味深长，不知道是不是说的是这个事儿。
- 虽然我们看不到源代码，但是还是可以下载到的。请到这个 [shadowsocks-windows](https://github.com/shadowsocks/shadowsocks-windows) 下去找 [Release](https://github.com/shadowsocks/shadowsocks-windows/releases/) 版本。最新版本是 2018 年 3 月 14 日的。
- 配置和上边是一样的。
- 仍然要说的比较坑的是，最新版有时候会出现一些问题，导致连接不了 Server，但是是可以解决的。行之有效的方法是在 Windows 管理员命令行中执行一条命令 `netsh int ipv4 reset all && netsh int ipv6 reset all && netsh winsock reset all`，如何打开管理员命令行，不解释。之后重启电脑就 OK 了。其他的问题请访问这个[链接](https://github.com/shadowsocks/shadowsocks-windows/issues/621)。
- 然后，稍微探索一下这个 shadowsocks-windows 软件，你会发现用这个软件翻墙不再需要 SwitchyOmega，这个软件会帮我们下载需要翻墙的网址列表。现在我想你已经知道为什么中国政府为什么要斗争着要把这个项目给删掉了吧，因为翻墙的门槛太低了，小白都能学会。翻墙可以，就是不能这么容易，这就是中国政府的态度。
- 还有就是这个软件可以选择全局翻墙，不论当前电脑访问的任何网络，流量都会由 Shadowsocks 代理一下。

### Linux 篇

- 首先，这里说的 Linux 发行版适用于 Ubuntu Archlinux，有几个方案都可以用。

#### 第一种方法

- 从[这里](https://github.com/shadowsocks/shadowsocks-qt5)下载一个 QT 版本的 Shadowsocks，但是这个版本貌似更新有点不太频繁，最新的稳定版本支持的加密算法也不太多。但是用是没有任何问题的。他们提供了一种后缀名叫 `.AppImage` 的文件，这种文件是支持常见的 Linux 发行版的。下载后只需要给其加上可执行权限就能直接运行，简单的配置和 Windows 的一模一样。
- 每次需要科学上网的时候需要将这个软件打开，在浏览器上配置好 SwitchOmega，就可以了。请注意端口一致！

#### 第二种方法

- 一般 Linux 都会有默认安装 Python，但是可能没有默认安装 pip，执行命令 `sudo apt install python-pip` 或 `sudo pacman -S python-pip`, 安装完成之后，就可以直接安装 Shadowsocks 的 Python 版本了，执行命令 `sudo -H pip install shadowsocks`，或者你担心不是装的最新版本的 Shadowsocks，可以执行命令 `pip install git+https://github.com/shadowsocks/shadowsocks.git@master`。
- 安装完成之后系统里边会多出来一个命令 sslocal，sslocal 可以接受命令行参数或者文件配置。

``` json
{
    "server": "my_server_ip",
    "server_port": 8388,
    "local_address": "127.0.0.1",
    "local_port": 1080,
    "password": "mypassword",
    "timeout": 300,
    "method": "aes-256-cfb",
    "fast_open": false,
    "workers": 1,
    "prefer_ipv6": false
}
```

- `sslocal -p 8388 -s 45.35.75.57 -k password -l 1080 -m aes-256-cfb` 用参数在命令行启动。
- `sslocal -c config.json` 利用配置文件启动。
- 以上这样启动之后只是在前台运行了一个 Shadowsocks 的客户端，怎样开机自启动这才是关键，首先还是一个 Python 的工具软件 `supervisor`，这是一个很有名的进程管理工具，安装 `sudo -H pip install supervisor`。
- 编辑文件 `/etc/supervisor/conf.d/shadowsocks.conf` 写入以下内容：

``` json
[program:shadowsocks]
command=ssserver -c /etc/shadowsocks.json
autorestart=true
user=nobody
```

- 如果监听的端口小于 1024 以下的 `user=nobody` 改成 `user=root`。
- `service supervisor start` 启动 supervisor 的服务。
- `supervisorctl reload` 重载 supervisor 服务的配置。
- `supervisorctl restart shadowsocks` 启动指定的服务。
- 如果对 `supervisor` 的操作有有什么疑问的话可以专门搜索一下 `supervisor` 的基本操作。

#### 第三种方法

- 在 ubuntu 和 ArchLinux 的源里有 shadowsocks-libev 的包，直接 `sudo apt install shadowsocks-libev` 或者 `sudo pacman -S shadowsocks-libev`。
- 如果你在你的 Linux 发行版中没有找到 shadowsocks-libev 相关的包的话，可以考虑从源码开始编译安装。具体编译过程可以参照[这里](https://github.com/shadowsocks/shadowsocks-libev#distribution-specific-guide)。
- 安装好之后在系统的 `/lib/systemd/system/shadowsocks-local@.service` 的文件，不尽相同，大多是这样 `shadowsocks-local@.service` 的名字，这个文件就是 `systemd` 所需要的启动文件。
- `sudo systemctl enable shadowsocks-local@config.service` 看见和那个文件名有什么不同了么？多了一个 config，指的是在这个服务启动的时候传入参数 config。看一眼这个文件的内容你就理解了。
- 编辑好 `/etc/shadowsocks-libev/config.json` 也可能是 `/etc/shadowsocks/config.json` 具体是哪个文件以这个文件为准 `/lib/systemd/system/shadowsocks-local@.service`。
- 最后 `sudo systemctl start shadowsocks-local@config.service`。
- 然后浏览器装上 SwitchyOmega，就可以用了。
- 然后有些人需要 git 翻墙，需要这样两条命令设置 git 的代理。
- `git config --global http.proxy 'socks5://127.0.0.1:1080'`
- `git config --global https.proxy 'socks5://127.0.0.1:1080'`

### Linux Server 篇

为了最快化的安装 Shadowsocks 的 Server，我们采用 Docker 来操作。

- `curl -fsSL get.docker.com -o get-docker.sh` 然后 `sh get-docker.sh` 稍等片刻就会安装完成。具体安装过程遇见的坑，多多搜索一下就好。
- `curl -sSL https://github.com/shadowsocks/shadowsocks-libev/raw/master/docker/alpine/Dockerfile | docker build -t shadowsocks-libev -` 这样直接会编译一个 Docker 镜像根据[这里](https://github.com/shadowsocks/shadowsocks-libev/blob/master/docker/alpine/Dockerfile)的 Dockerfile。
- `docker run --name "shadowsocks" --restart=always -d -e METHOD="aes-256-gcm" -e PASSWORD=1234567890 --hostname "shadowsocks" -p 10240:8388 -p 10240:8388/udp shadowsocks-libev` 这样这个 Docker Container 在 Server 中每次开机都会自己启动。
- 以上参数启动的 Docker Container 对外提供的服务参数就是：加密算法是 aes-256-gcm，密码是 1234567890，端口是 10240。
