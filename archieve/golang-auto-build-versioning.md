---
title: "Golang auto build version"
tags: [ "Golang" ]
date: 2017-04-11 20:26:54
categories: [ "Develop", "Config" ]
draft: false
contentCopyright: false
---

We needed a version number to find whether the binary was from yesterday or today’s source. Then we decided that for all our golang applications we should have a way to find out the version number, so that we can always query and find out which version it is, there by which source is running.

<!--more-->

``` go
package main

import "fmt"

var (
    BuildStamp = "Nothing Provided."
    GitHash   = "Nothing Provided."
)

func main() {
    fmt.Printf("Git Commit Hash: %s\n", GitHash)
    fmt.Printf("UTC Build Time: %s\n", BuildStamp)
}
```

现在只需要，这样 build 这个文件：

``` bash
go build -ldflags "-X main.GitHash=`git rev-parse HEAD` \
                   -X main.BuildStamp=`date -u '+%Y-%m-%d_%I:%M:%S%p'`" main.go
```
