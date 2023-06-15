---
date: 2017-04-22 13:16:42
tags: [ "Git" ]
title: Generate SSH key and GPG key
categories: [ "Config" ]
draft: false
contentCopyright: false
---

2012年3月4号，GitHub 的[公钥安全漏洞](https://github.com/blog/1068-public-key-security-vulnerability-and-mitigationhttp://)被一个叫 Egor Homakov 的俄国人利用了。这个漏洞允许他向 GitHub 上的 Ruby on Rails 框架的主分支上提交代码。[Git 使用中的教训：签名提交确保代码完整可信](http://www.oschina.net/translate/git-horror-story)

<!--more-->

### SSH key 的生成及使用

- 生成一个 SSH key `ssh-keygen -t ed25519 -C "i@tosone.cn"`。
- 在 GitHub 中这个[页面](https://github.com/settings/keys)添加 SSH key。

``` conf
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

### GPG key 的生成及使用

- 安装 gpg2 `brew install gpg2`。
- 生成一个 GPG key `gpg --full-generate-key`。
- 列出所有的 GPG key `gpg --list-keys`。
- 配置将要使用的 GPG key `git config --global user.signingkey 0A46826A`。
- 配置 GIT `git config --global commit.gpgsign true`。
- 在 GitHub 中这个[页面](https://github.com/settings/keys)添加 GPG key。
