---
title: "系统初始化"
date: 2018-09-11 12:53:15
tags: [ "Linux" ]
categories: [ "Config" ]
draft: false
contentCopyright: false
---

Ubuntu 和 NodeJs 的环境的初始化。
<!--more-->

### NodeJs 初始化

``` bash
env NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node nvm install node
nvm alias default v10.6.0
npm config set registry https://registry.npm.taobao.org # set npm registry to taobao
npm install yarn hexo webpack -g # install normal package
yarn config set registry https://registry.npm.taobao.org # set yarn registry to taobao
apm config set registry https://registry.npm.taobao.org # set atom registry to taobao
```

### shadowsocks 

``` bash
apt-get install shadowsocks-libev
systemctl enable shadowsocks-libev-local@config.service
systemctl start shadowsocks-libev-local@config.service
```

### Ubuntu 初始化

``` bash
# variable
atom_version=1.15.0
shadowsocks_ip=45.35.75.57
shadowsocks_port=56002
shadowsocks_pwd=60394675
shadowsocks_method=aes-256-cfb

sudo apt-get install curl
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

sudo apt-get autoremove unity-webapps-common firefox
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
sudo apt-get install redis-server mosquitto python-pip vim zsh nfs-kernel-server git supervisor
sudo pip install --upgrade autopep8 isort shadowsocks

sudo sh -c "echo \"/home/"$USER"/share *(rw,sync)\" >> /etc/exports"
sudo service nfs-kernel-server restart

git config --global credential.helper store
git config --global core.editor vim
ssh-keygen
[[ -f ~/.ssh/config ]] && rm ~/.ssh/config
echo "Host git.nane.cn KexAlgorithms +diffie-hellman-group1-sha1" >> ~/.ssh/config

gsettings set com.canonical.Unity.Launcher launcher-position Bottom

NVM_DIR=$HOME/.nvm
[[ -d $NVM_DIR ]] && rm -rf $NVM_DIR
git clone https://github.com/creationix/nvm.git $NVM_DIR
cd $NVM_DIR
git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" origin`
. $NVM_DIR/nvm.sh
echo "export NVM_DIR=\"\$HOME/.nvm\"" >> ~/.zshrc
echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"" >> ~/.zshrc
source ~/.zshrc
NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node nvm install node
npm config set registry https://registry.npm.taobao.org
npm install yarn -g yarn npm-check-updates eslint
yarn config set registry https://registry.npm.taobao.org

sudo systemctl enable supervisor.service
sudo systemctl restart supervisor.service
sudo sh -c "echo \"[program:shadowsocks]\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"command=sslocal -p "$shadowsocks_port" -s "$shadowsocks_ip" -k "$shadowsocks_pwd" -l 1080 -m "$shadowsocks_method"\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"autostart=true\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"autorestart=true\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"user=root\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"log_stderr=true\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"logfile=/var/log/shadowsocks.log\" >> /etc/supervisor/conf.d/shadowsocks.conf"

# sogou=sogou.deb
wget https://npm.taobao.org/mirrors/atom/$atom_version/atom-amd64.deb
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# wget -O $sogou http://pinyin.sogou.com/linux/download.php?f=linux&bit=64

sudo dpkg -i atom-amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
# sudo dpkg -i $sogou

sudo apt-get install -f
sudo apt-get autoremove
```

``` bash
shadowsocks_ip=45.35.75.57
shadowsocks_port=56002
shadowsocks_pwd=60394675
shadowsocks_method=aes-256-cfb
sudo sh -c "echo \"[program:shadowsocks]\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"command=sslocal -p "$shadowsocks_port" -s "$shadowsocks_ip" -k "$shadowsocks_pwd" -l 1080 -m "$shadowsocks_method"\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"autostart=true\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"autorestart=true\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"user=root\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"log_stderr=true\" >> /etc/supervisor/conf.d/shadowsocks.conf"
sudo sh -c "echo \"logfile=/var/log/shadowsocks.log\" >> /etc/supervisor/conf.d/shadowsocks.conf"
```
