---
title: "Compile Lua and Luajit"
tags: [ "Lua", "Luajit" ]
date: 2016-12-31 15:14:28
categories: [ "Develop" ]
draft: false
contentCopyright: false
---

Lua is a lightweight, multi-paradigm programming language designed primarily for embedded systems and clients. Lua is cross-platform, since the interpreter is written in ANSI C, and has a relatively simple C API.
<!--more-->

### 写在前边

Lua 是一个小巧的脚本语言。是巴西里约热内卢天主教大学（Pontifical Catholic University of Rio de Janeiro）里的一个研究小组，由 Roberto Ierusalimschy、Waldemar Celes 和 Luiz Henrique de Figueiredo 所组成并于 1993 年开发。其设计目的是为了嵌入应用程序中，从而为应用程序提供灵活的扩展和定制功能。Lua 由标准 C 编写而成，几乎在所有操作系统和平台上都可以编译，运行。Lua 并没有提供强大的库，这是由它的定位决定的。所以 Lua 不适合作为开发独立应用程序的语言。Lua 有一个同时进行的 JIT 项目，提供在特定平台上的即时编译功能。Lua 脚本可以很容易的被 C/C++ 代码调用，也可以反过来调用 C/C++ 的函数，这使得 Lua 在应用程序中可以被广泛应用。不仅仅作为扩展脚本，也可以作为普通的配置文件，代替 XML，ini 等文件格式，并且更容易理解和维护。Lua 由标准 C 编写而成，代码简洁优美，几乎在所有操作系统和平台上都可以编译，运行。一个完整的 Lua 解释器不过 200k，在目前所有脚本引擎中，Lua 的速度是最快的。这一切都决定了 Lua 是作为嵌入式脚本的最佳选择。

### 下载源码，安装环境，编译Lua

首先下载 Lua 的源代码，官方[下载地址](http://www.lua.org/download.html)，下载之后，目录内存在两个文件夹分别是 doc 和 src 的文件夹，doc 是介绍如何编译文件的，但是我要跟你说看了还不如不看，基本看不懂，写的太笼统了，就别看了。

编译源码需要的东西有 GCC 的编译器，在 Windows 上安装这个编译器需要用 MinGw 安装，具体 MinGw 到 GCC 的安装以及配置在这就不说了，网上能找到很多。要说明的一点是在 GCC 的 bin 目录下有一个文件名字是 `mingw32-make.exe`，复制一份存在相同位置改名为 `make.exe`。然后把这个路径加入到本机的 Path 环境变量里边。OK，以上就是编译环境的配置过程，进入本机的 Lua 源码的命令行根目录下，直接键入 `make mingw` 就可以了。然后 src 的根目录下就会生成很多的目标文件，和我们希望看到的 `Lua53.dll`，`lua.exe`，`Luac.exe` 这三个文件。有些童鞋说不想让 `Lua.exe` 这个文件依赖于 `Lua53.dll` 文件运行，也可以的。对 src 下的 makefile 文件的 `mingw` 段写改为如下代码，就可以生成无依赖的 `Lua.exe` 了。

``` ini
$(MAKE) "LUA_A=lua53.a" "LUA_T=lua.exe" \
"AR=$(AR) -o" "RANLIB=strip --strip-unneeded" \
"SYSCFLAGS=-static" "SYSLIBS=" "SYSLDFLAGS=-s" lua.exe
$(MAKE) "LUAC_T=luac.exe" luac.exe
```

### 编译 Luajit

如果想最小化的编译 Lua 代码为 Lua 的字节码，就需要用到 Luajit 了，有测试结果表明 Luajit 编译出来的字节码速度还要比 C 编译出来的二进制代码还要快，还有难能可贵的一点是 Luajit 的字节码反编译几乎就是不可能的，很安全，还有一个优点就是编译速度比 GCC 要快很多的，毕竟 Lua 的语法也不是很复杂。还有一点是 Luajit 提供了一个 ffi 的库更加容易的让我们用 Lua，使 Lua 和 C 更加的亲密。好了，Luajit 的[下载地址](http://luajit.org/download.html)，Luajit 的编译也非常的简单，用 VisualStudio 的命令行工具运行 src 目录下的 `msvcbuild.bat`，就编译成功了，VisualStudio 的命令行工具分为 64 位和 32 位的，自己想要什么版本的就编译成那个版本的就行了，或者在 src 下运行命令 `make` 也是可以编译成功。

### 编译 srlua

如果我们想让 Lua 的文件无依赖的运行怎么办？就需要一个东西 srlua（self-run lua），直接把 Lua 的文件转换为可执行的文件。srlua 的编译，首先去 [Github](https://github.com) 下载最新版的源代码，搜索 srlua 就可以看到了，在此给出[链接](https://github.com/LuaDist/srlua)同样进入文件的根目录下，`make` 编译发现不通过，很正常，修改 makefile 文件，`LUA=` 后边写上你的 Lua 的文件路径，就是上边我们进行编译 Lua 源码的那个文件夹所处的位置。再编译，还是不通过，还是很正常，修改 makefile 文件，`LIBS=` 后边的 `-ldl` 删除，OK，编译，提示还是有错误，但是编译工作已经完成了，该出现的文件都出现了，不管了，OK。如果你不想自己编译的话，也可以下载 Github 上编译好的版本，`srlua` 的用法是在命令行下输入：`glue srlua.exe Josephus.lua Josephus.exe`，`Josephus.lua` 是要进行编译的文件，`Josephus.exe` 是要生成的文件，`Josephus.lua` 的源码如下：

``` lua
function Josephus(x,y)
    local a={};
    for i=1,y do a[i] = i end
    local s, k, i, out = 0, 0, 0, ""
    local from = os.clock()
    while (true) do
        local temp = 0
        repeat
            if(a[i + 1] == 0) then break end
            k = k + 1
            if(k % x == 0) then
                k = 0
                s = s + 1
                out = out .. a[i + 1] .. " "
                if(s == y) then temp = 1 end
                a[i + 1] = 0;
            end
        until true
        if(temp == 1) then break end
        i = (i + 1) % y
    end
    local to = os.clock()
    return to - from
end
function sleep(n) -- seconds
    local t0 = os.clock()
    while os.clock() - t0 <= n do end
end
for i = 1, 5 do
    print("Parameters: \tall people: " .. 10^i .. " Every other: 30")
    print("Josephus has spend " .. Josephus(30,10^i) .. "s")
    print("Program takes up " .. collectgarbage("count") .. "b")
    sleep(2)
    collectgarbage("collect")
    print()
end
io.read()
```
