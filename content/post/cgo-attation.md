---
title: "CGO 注意事项"
tags: [ "Golang", "C", "CGO" ]
date: 2018-09-12 10:14:28
---

Golang 和 C 之间相互调用存在一些局限性。

<!--more-->

### 首先不支持可变参数函数

我们知道 C 语言中 stdarg.h 这个头文件提供了可变参数的实现，但是 cgo 中暂未实现对这个特性的支持，这并不意味着 Golang 不支持可变参数，仅仅是 cgo 不支持而已。具体可以看这个 [issue](https://github.com/golang/go/issues/975) 和这个 [commit](https://github.com/golang/go/commit/67d276c57cda9e05faa84c332ba52791d4713f65)。

![](https://tc.tosone.cn/20190703180522.png)

### 其次不支持带参数的宏定义

运行如下两段不同的代码：

``` go
package main

/*
#define test 1
#define ABS(a) ((a) >= 0 ? (a) : (-(a)))
*/
import "C"

import "fmt"

func main() {
    fmt.Println(C.test)
    fmt.Println(C.ABS(-1))
}
```

``` go
package main

/*
#define test 1
#define ABS(a) ((a) >= 0 ? (a) : (-(a)))
#define abs ABS(-1)
*/
import "C"

import "fmt"

func main() {
    fmt.Println(C.test)
    fmt.Println(C.abs)
}
```
