---
title: "Golang 获取 goroutine id 完全指南"
tags: [ "Golang" ]
date: 2018-03-09 21:14:28
---

在 Golang 中，每个 goroutine 协程都有一个 goroutine id (goid)，该goid没有向应用层暴露。但是，在很多场景下，开发者又希望使用 goid 作为唯一标识，将一个 goroutine 中的函数层级调用串联起来。比如，希望在一个 http handler 中将这个请求的每行日志都加上对应的 goid 以便于对这个请求处理过程进行跟踪和分析。

<!--more-->

关于是否应该将 goid 暴露给应用层已经争论多年。基本上，Golang 的开发者都一致认为不应该暴露 goid（[faq: document why there is no way to get a goroutine ID](https://github.com/golang/go/issues/22770)），主要有以下几点理由：

- goroutine 设计理念是轻量，鼓励开发者使用多 goroutine 进行开发，不希望开发者通过 goid 做 goroutine local storage 或 thread local storage（TLS）的事情；
- Golang 开发者Brad认为 TLS 在 C/C++ 实践中也问题多多，比如一些使用TLS的库，thread 状态非常容易被非期望线程修改，导致crash.
- goroutine 并不等价于thread, 开发者可以通过syscall 获取 thread id，因此根本不需要暴露 goid.

官方也一直推荐使用context作为上下文关联的最佳实践。如果你还是想获取 goid，下面是我整理的目前已知的所有获取它的方式，希望你想清楚了再使用。

- 通过 stack 信息获取 goroutine id.
- 通过修改源代码获取 goroutine id.
- 通过 CGo 获取 goroutine id.
- 通过汇编获取 goroutine id.
- 通过汇编获取伪 goroutine id.

在开始介绍各种方法前，先看一下定义在 `src/runtime/runtime2.go` 中保存 goroutine 状态的g结构：

``` go
type g struct {
    // Stack parameters.
    // stack describes the actual stack memory: [stack.lo, stack.hi).
    // stackguard0 is the stack pointer compared in the Go stack growth prologue.
    // It is stack.lo+StackGuard normally, but can be StackPreempt to trigger a preemption.
    // stackguard1 is the stack pointer compared in the C stack growth prologue.
    // It is stack.lo+StackGuard on g0 and gsignal stacks.
    // It is ~0 on other goroutine stacks, to trigger a call to morestackc (and crash).
    stack       stack   // offset known to runtime/cgo
    stackguard0 uintptr // offset known to liblink
    stackguard1 uintptr // offset known to liblink

    _panic         *_panic // innermost panic - offset known to liblink
    _defer         *_defer // innermost defer
    m              *m      // current m; offset known to arm liblink
    sched          gobuf
    syscallsp      uintptr        // if status==Gsyscall, syscallsp = sched.sp to use during gc
    syscallpc      uintptr        // if status==Gsyscall, syscallpc = sched.pc to use during gc
    stktopsp       uintptr        // expected sp at top of stack, to check in traceback
    param          unsafe.Pointer // passed parameter on wakeup
    atomicstatus   uint32
    stackLock      uint32 // sigprof/scang lock; TODO: fold in to atomicstatus
    goid           int64 // goroutine id
    ...
```

其中 goid int64 字段即为当前 goroutine 的 id。

### 1. 通过 stack 信息获取 goroutine id

``` go
package main

import (
    "bytes"
    "fmt"
    "runtime"
    "strconv"
)

func main() {
    fmt.Println(GetGID())
}

func GetGID() uint64 {
    b := make([]byte, 64)
    b = b[:runtime.Stack(b, false)]
    b = bytes.TrimPrefix(b, []byte("goroutine "))
    b = b[:bytes.IndexByte(b, ' ')]
    n, _ := strconv.ParseUint(string(b), 10, 64)
    return n
}
```

原理非常简单，将 stack 中的文本信息 "goroutine 1234" 匹配出来。但是这种方式有两个问题：

stack 信息的格式随版本更新可能变化，甚至不再提供 goroutine id，可靠性差。
性能较差，调用 10000 次消耗 >50ms。

如果你只是想在个人项目中使用 goid，这个方法是可以胜任的。维护和修改成本相对较低，且不需要引入任何第三方依赖。同时建议你就此打住，不要继续往下看了。

### 2. 通过修改源代码获取goroutine id

既然方法 1 效率较低，且不可靠，那么我们可以尝试直接修改源代码 `src/runtime/runtime2.go` 中添加 Goid 函数，将 goid 暴露给应用层：

``` go
func Goid() int64 {
    _g_ := getg()
    return _g_.goid
}
```

这个方式能解决法 1 的两个问题，但是会导致你的程序只能在修改了源代码的机器上才能编译，没有移植性，并且每次 go 版本升级以后，都需要重新修改源代码，维护成本较高。

### 3. 通过 CGo 获取 goroutine id

那么有没有性能好，同时不影响移植性，且维护成本低的方法呢？那就是来自 Dave Cheney 的 CGo 方式：

文件 id.c：

``` go
#include "runtime.h"

int64 ·Id(void) {
    return g->goid;
}
```

文件 id.go:

``` go
package id

func Id() int64
```

完整代码参见 [junk/id](https://github.com/davecheney/junk/blob/master/id/id.c).

这种方法的问题在于你需要开启 CGo, CGo 存在一些缺点，具体可以参见这个大牛的 [cgo is not Go](https://dave.cheney.net/2016/01/18/cgo-is-not-go). 我相信在你绝大部分的工程项目中，你是不希望开启CGo的。

### 4. 通过汇编获取 goroutine id

如果前面三种方法我们都不能接受，有没有第四种方法呢？那就是通过汇编获取goroutine id的方法。原理是：通过 getg 方法（汇编实现）获取到当前goroutine的g结构地址，根据偏移量计算出成员goid int的地址，然后取出该值即可。

项目goroutine实现了这种方法。需要说明的是，这种方法看似简单，实际上因为每个go版本几乎都会有针对g结构的调整，因此goid int64的偏移并不是固定的，更加复杂的是，go在编译的时候，传递的编译参数也会影响goid int64的偏移值，因此，这个项目的作者花了非常多精力来维护每个go版本g结构偏移的计算，详见hack目录。

这个方法性能好，原理清晰，实际使用上稳定性也不错（我们在部分不太重要的线上业务使用了这种方法）。但是，维护这个库也许真的太累了，最近发现作者将这个库标记为“DEPRECATED”，看来获取goroutine id是条越走越远的不归路😂

### 5. 通过汇编获取伪goroutine id

虽然方法4从原理和实际应用上表现都不错，但是毕竟作者弃坑了。回到我们要解决的问题上：我们并不是真的一定要获取到 goroutine id，我们只是想获取到 goroutine 的唯一标识。那么，从这个角度看的话，我们只需要解决 goroutine 标识唯一性的问题即可。

显然，上面作者也想清楚了这个问题。他新开了一个库 [go-tls](https://github.com/huandu/go-tls), 这个库实现了 goroutine local storage，其中获取 goroutine id 的方式是：用方法4的汇编获取 goroutine 的地址，然后自己管理和分配 goroutine id。由于它获取到的并不是真正的 goroutine id，因此我将之称为伪 goroutine id。其实现的核心代码如下：

``` go
var (
    tlsDataMap  = map[unsafe.Pointer]*tlsData{}
    tlsMu       sync.Mutex
    tlsUniqueID int64
)
...

func fetchDataMap(readonly bool) *tlsData {
    gp := g.G() // 1. 获取g结构地址
    if gp == nil {
        return nil
    }
    // Try to find saved data.
    needHack := false
    tlsMu.Lock()
    dm := tlsDataMap[gp]
    if dm == nil && !readonly {
        needHack = true
        dm = &tlsData{
            id:   atomic.AddInt64(&tlsUniqueID, 1), // 2. 分配伪goroutine id
            data: dataMap{},
        }
        tlsDataMap[gp] = dm
    }
    tlsMu.Unlock()
    // Current goroutine is not hacked. Hack it.
    if needHack {
        if !hack(gp) {
            tlsMu.Lock()
            delete(tlsDataMap, gp)
            tlsMu.Unlock()
        }
    }
    return dm
}
```

- 获取 g 结构地址。
- 分配伪 goroutine id.

这种方式基本没有什么不能接受的 hack 实现，从原理上来说也更加安全。但是获取到不是你最开始想要的 goroutine id，不知你能否接受😅。

### 小结

获取 goroutine id 是一条不归路，目前也没有完美的获取它的方式。如果你一定要使用 goroutine id，先想清楚你要解决的问题是什么，如果没有必要，建议你不要走上这条不归路。尽早在团队中推广使用 context, 越早使用越早脱离对 goroutine id 的留恋和挣扎。

### Credit
- [Goroutine IDs](https://blog.sgmansfield.com/2015/12/goroutine-ids/)
- [faq: document why there is no way to get a goroutine ID](https://github.com/golang/go/issues/22770)
- [获取 Goroutine Id 的最佳实践](https://www.jianshu.com/p/85a08d8e7af3)
