---
title: "Mac 下更换 Homebrew 镜像源"
date: 2019-07-20T12:09:17+08:00
draft: false
contentCopyright: false
tags: [ "Tips" ]
categories: [ "Macos" ]
---

Mac 下更换 Homebrew 镜像源，加速软件的更新以及下载。

<!--more-->

替换 brew.git：

``` bash
cd "$(brew --repo)"
git remote set-url origin https://mirrors.ustc.edu.cn/brew.git
```

替换 homebrew-core.git：

``` bash
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git
```

替换 homebrew-cask.git：

``` bash
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-cask"
git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-cask.git
```

``` bash
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.zshrc
source ~/.zshrc
```

复原：

``` bash
git -C "$(brew --repo)" remote set-url origin https://github.com/Homebrew/brew.git

git -C "$(brew --repo homebrew/core)" remote set-url origin https://github.com/Homebrew/homebrew-core

brew update
```
