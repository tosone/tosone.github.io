---
title: "CGO 入门"
tags: [ "Golang", "C", "CGO" ]
date: 2018-07-10 21:14:28
categories: [ "Develop" ]
draft: false
contentCopyright: false
---

Golang 和 C 之间相互调用入门。

<!--more-->

> 原文链接：[https://github.com/golang/go/wiki/cgo](https://github.com/golang/go/wiki/cgo)

### 介绍

首先，[http://golang.org/cmd/cgo](http://golang.org/cmd/cgo) 是最基础的 cgo 的文档。
关于 cgo 更加详尽的文档在 [https://blog.golang.org/c-go-cgo](https://blog.golang.org/c-go-cgo)。

### 入门

如果一个 Go 的源码文件引用了 `"C"` 这个包，那么这就是在用 cgo 了。在整个的编译过程中 Go 将会立即处理位于 `import "C"` 上边的注释的部分，并且将会和其他的 cgo 的注释 link 到一起，也包括其他所有的 C 文件。

需要注意的是在 `import "C"` 和 cgo 注释中间不能有空行。

想要获取 C 中的变量只需要用到包名为 C 的 Go 内置的依赖。也就是说，如果你想调用 C 的函数 `printf()` 在 Go 的代码中，可以这样写 `C.printf()`。由于 cgo 还不支持可变参数（见[issue 975](https://github.com/golang/go/issues/975)），我们需要将它包裹成另外我们自己的函数 `myprint()`：

``` go
package cgoexample

/*
#include <stdio.h>
#include <stdlib.h>

void myprint(char* s) {
    printf("%s\n", s);
}
*/
import "C"

import "unsafe"

func Example() {
    cs := C.CString("Hello from stdio\n")
    C.myprint(cs)
    C.free(unsafe.Pointer(cs))
}
```

### 在 C 中调用 Go 方法

利用 cgo 在 C 中执行 Go 代码中定义的全局函数或者函数变量都是可行的。

#### 全局函数

Go 使它的函数在 C 中可见是用的一个特殊的注释 `//export`。注意：如果你在用 exports，那么你就不能定义任何 C 的方法在文件头的位置。

举例说明，有两个文件 foo.c 和 foo.go

foo.go 的内容：

``` go
package gocallback

import "fmt"

/*
#include <stdio.h>
extern void ACFunction();
*/
import "C"

//export AGoFunction
func AGoFunction() {
    fmt.Println("AGoFunction()")
}

func Example() {
    C.ACFunction()
}
```

foo.c 的内容：

``` c
#include "_cgo_export.h"
void ACFunction() {
    printf("ACFunction()\n");
    AGoFunction();
} 
```

#### 函数变量

下边的代码展示了一个 C 中执行 Go 代码中定义的回调函数。由于指针传递规则，Go 代码不能直接传递一个函数变量到 C 中。我们需要用间接的方式来实现。

``` go
package gocallback

import (
    "fmt"
    "sync"
)

/*
extern void go_callback_int(int foo, int p1);

// normally you will have to define function or variables
// in another separate C file to avoid the multiple definition
// errors, however, using "static inline" is a nice workaround
// for simple functions like this one.
static inline void CallMyFunction(int foo) {
    go_callback_int(foo, 5);
}
*/
import "C"

//export go_callback_int
func go_callback_int(foo C.int, p1 C.int) {
    fn := lookup(int(foo))
    fn(p1)
}

func MyCallback(x C.int) {
    fmt.Println("callback with", x)
}

func Example() {
    i := register(MyCallback)
    C.CallMyFunction(C.int(i))
    unregister(i)
}

var mu sync.Mutex
var index int
var fns = make(map[int]func(C.int))

func register(fn func(C.int)) int {
    mu.Lock()
    defer mu.Unlock()
    index++
    for fns[index] != nil {
        index++
    }
    fns[index] = fn
    return index
}

func lookup(i int) func(C.int) {
    mu.Lock()
    defer mu.Unlock()
    return fns[i]
}

func unregister(i int) {
    mu.Lock()
    defer mu.Unlock()
    delete(fns, i)
}
```

The following code shows an example of invoking a Go callback from C code. Because of the pointer passing rules Go code can not pass a function value directly to C. Instead it is necessary to use an indirection. This example uses a registry with a mutex, but there are many other ways to map from a value that can be passed to C to a Go function.
