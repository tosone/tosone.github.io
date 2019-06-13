---
date: 2017-01-03 00:20:20
title: "Git 基本操作"
tags: [ "Git" ]
---

Git 是一款免费、开源的分布式版本控制系统，用于敏捷高效地处理任何或小或大的项目。Git 的读音为 /gɪt/。
Git 是一个开源的分布式版本控制系统，可以有效、高速的处理从很小到非常大的项目版本管理。Git 是 Linus Torvalds 为了帮助管理 Linux 内核开发而开发的一个开放源码的版本控制软件。
Torvalds 开始着手开发 Git 是为了作为一种过渡方案来替代 BitKeeper，后者之前一直是 Linux 内核开发人员在全球使用的主要源代码工具。开放源码社区中的有些人觉得 BitKeeper 的许可证并不适合开放源码社区的工作，因此 Torvalds 决定着手研究许可证更为灵活的版本控制系统。尽管最初 Git 的开发是为了辅助 Linux 内核开发的过程，但是我们已经发现在很多其他自由软件项目中也使用了 Git。例如很多 Freedesktop 的项目迁移到了 Git 上。

<!--more-->

### 基础配置

- `git config --global user.email "itosone@outlook.com"`
- `git config --global user.name "Tosone"`
- `git config --global credential.helper store`
- `git config --global push.default simple`
- `git config --global color.ui true`
- `git config --global alias.co checkout`
- `git config --global alias.ci commit`
- `git config --global alias.st status`
- `git config --global alias.br branch`
- `git config --global core.editor vim` 设置Editor使用vim
- `git config -l` 列举所有配置
- 用户的git配置文件 `~/.gitconfig`
- `echo "Host git.nane.cn KexAlgorithms +diffie-hellman-group1-sha1" >> ~/.ssh/config` 给指定的站点添加特殊的加密算法

### Git常用命令:查看、添加、提交、删除、找回，重置修改文件

- `git help <command>` 显示command的help
- `git show` 显示某次提交的内容
- `git show $id`
- `git checkout  -- <file>` 抛弃工作区修改
- `git checkout  .` 抛弃工作区修改
- `git add <file>` 将工作文件修改提交到本地暂存区
- `git add .` 将所有修改过的工作文件提交暂存区
- `git rm <file>` 从版本库中删除文件
- `git rm <file> --cached` 从版本库中删除文件，但不删除文件
- `git reset <file>` 从暂存区恢复到工作文件
- `git reset -- .` 从暂存区恢复到工作文件
- `git reset --hard` 恢复最近一次提交过的状态，即放弃上次提交后的所有本次修改
- `git commit <file>`
- `git commit .`
- `git commit -a` 将git add, git rm和git commit等操作都合并在一起做
- `git commit -am "some comments"`
- `git commit --amend` 修改最后一次提交记录
- `git commit --amend` 修改最后一次提交注释的，利用–amend参数
- `git revert <$id>` 恢复某次提交的状态，恢复动作本身也创建了一次提交对象
- `git revert HEAD` 恢复最后一次提交的状态

### 查看文件diff

- `git diff <file>` 比较当前文件和暂存区文件差异
- `git diff`
- `git diff <$id1> <$id2>` 比较两次提交之间的差异
- `git diff <branch1>..<branch2>` 在两个分支之间比较
- `git diff --staged` 比较暂存区和版本库差异
- `git diff --cached` 比较暂存区和版本库差异
- `git diff --stat` 仅仅比较统计信息

### 查看提交记录

- `git log`
- `git log <file>` 查看该文件每次提交记录
- `git log -p <file>` 查看每次详细修改内容的diff
- `git log -p -2` 查看最近两次详细修改内容的diff
- `git log --stat` 查看提交统计信息

### Git 本地分支管理查看、切换、创建和删除分支

- `git br -r` 查看远程分支
- `git br <new_branch>` 创建新的分支
- `git br -v` 查看各个分支最后提交信息
- `git br --merged` 查看已经被合并到当前分支的分支
- `git br --no-merged` 查看尚未被合并到当前分支的分支
- `git co <branch>` 切换到某个分支
- `git co -b <new_branch>` 创建新的分支，并且切换过去
- `git co -b <new_branch> <branch>` 基于branch创建新的new_branch
- `git co $id` 把某次历史提交记录checkout出来，但无分支信息，切换到其他分支会自动删除
- `git co $id -b <new_branch>` 把某次历史提交记录checkout出来，创建成一个分支
- `git br -d <branch>` 删除某个分支
- `git br -D <branch>` 强制删除某个分支 (未被合并的分支被删除的时候需要强制)

### 分支合并和 rebase

- `git merge <branch>` 将branch分支合并到当前分支
- `git merge origin/master --no-ff` 不要Fast-Foward合并，这样可以生成merge提交
- `git rebase master <branch>` 将master rebase到branch，相当于：
- `git co <branch> && git rebase master && git co master && git merge <branch>`

### Git 补丁管理(方便在多台机器上开发同步时用)

- `git diff > ../sync.patch` 生成补丁
- `git apply ../sync.patch` 打补丁
- `git apply --check ../sync.patch` 测试补丁能否成功

### Git 暂存管理

- `git stash` 暂存
- `git stash list` 列所有stash
- `git stash apply` 恢复暂存的内容
- `git stash drop` 删除暂存区

### Git 远程分支管理

- `git pull` 抓取远程仓库所有分支更新并合并到本地
- `git pull --no-ff` 抓取远程仓库所有分支更新并合并到本地，不要快进合并
- `git fetch origin` 抓取远程仓库更新
- `git merge origin/master` 将远程主分支合并到本地当前分支
- `git commit --track origin/branch` 跟踪某个远程分支创建相应的本地分支
- `git commit -b <local_branch> origin/<remote_branch>` 基于远程分支创建本地分支，功能同上
- `git push` push所有分支
- `git push origin master` 将本地主分支推到远程主分支
- `git push -u origin master` 将本地主分支推到远程(如无远程主分支则创建，用于初始化远程仓库)
- `git push origin <local_branch>` 创建远程分支， origin是远程仓库名
- `git push origin <local_branch>:<remote_branch>` 创建远程分支
- `git push origin :<remote_branch>` 先删除本地分支(git br -d <branch>)，然后再push删除远程分支
- `git remote -v` 查看远程服务器地址和仓库名称
- `git remote show origin` 查看远程服务器仓库状态
- `git remote add origin git@github:robbin/robbin_site.git` 添加远程仓库地址
- `git remote set-url origin git@github.com:robbin/robbin_site.git` 设置远程仓库地址(用于修改远程仓库地址)
- `git remote rm <repository>` 删除远程仓库

### 创建一个独立的分支

- `git checkout --orphan gh-pages` 创建一个独立的分支
- `git rm -rf .` 删除当前分之下所有的文件
- `rm '.gitignore'` 删除配置文件
- 进行一次提交后就可以在git branch的命令后看到分支名字

### 导出命令

- `git checkout 分支名  路径/文件名` 检出某分支特定文件或者文件夹到当前路径
- `git tag -a 0.1.3 -m "Release version 0.1.3"`
- `git push origin --tags` 提交所有标签
- `git push origin v1.0:v1.5` 推送本地的1.0到远端的1.5版本
- `git archive -o ../updated.zip HEAD $(git diff --name-only HEAD^)` 将本地未提交的修改打包出来
- `git archive develop $(git diff v1.1.8_beta13..v1.1.8_beta14 --name-only)|gzip >aaa.zip` 两个版本的不同将不同的地方打包出来
