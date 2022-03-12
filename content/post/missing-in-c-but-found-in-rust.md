---
date: 2018-03-11 20:14:28
tags: [ "Rust", "C" ]
title: "[转载] 那些 C 语言缺失的，我在 Rust 里找到了"
categories: [ "Develop" ]
draft: false
contentCopyright: false
---

我大概在 24 年前就爱上了 C 语言。当时，我通过一本西班牙语版的 "The C Programming Language"（第二版，作者是 Brian Kernighan 和 Dennis Ritchie，所以有时候也用 K&R 来称呼这本书）来学习 C 语言。在这之前，我用过 Turbo Pascal，它也有指针，也需要手动管理内存，而 C 语言在当时是新生事物，但十分强大。

<!--more-->

### C 语言挽歌

我大概在 24 年前就爱上了 C 语言。当时，我通过一本西班牙语版的 "The C Programming Language"（第二版，作者是 Brian Kernighan 和 Dennis Ritchie，所以有时候也用 K&R 来称呼这本书）来学习 C 语言。在这之前，我用过 Turbo Pascal，它也有指针，也需要手动管理内存，而 C 语言在当时是新生事物，但十分强大。

K&R 因其独特的文风和简洁明了的代码风格而闻名。它甚至还教你如何自己实现简单的 `malloc()` 和 `free()` 函数，这实在太有意思了。而且，这门语言本身的一些特性也可以通过自身来实现。

在接下来的几年，我一直使用 C 语言。它是一门轻巧的编程语言，使用差不多 2 万行代码实现了 Unix 内核。

GIMP 和 GTK+ 让我学会了如何使用 C 语言来实现面向对象编程，GNOME 让我学会了如何使用 C 语言维护大型的软件项目。一个 2 万行代码的项目，一个人花上几周就可以完全读懂。

但现在的代码库规模已经不可同日而语，我们的软件对编程语言的标准库有了更高的期望。

### C 语言的一些好的体验

第一次通过阅读 POV-Ray 源代码学会如何在 C 语言中实现面向对象编程。

通过阅读 GTK+ 源代码了解 C 语言代码的清晰、干净和可维护性。

通过阅读 SIOD 和 Guile 的源代码，知道如何使用 C 语言实现 Scheme 解析器。

使用 C 语言写出 GNOME Eye 的初始版本，并对 MicroTile 渲染进行调优。

### C 语言的一些不好的体验

在 Evolution 团队时，很多东西老是崩溃。那个时候还没有 Valgrind，为了得到 Purify 这个软件，需要购买一台 Solaris 机器。

调试 gnome-vfs 线程死锁问题。

调试 Mesa，却无果。

接手 Nautilus-share 的初始版本，却发现代码里面居然没有使用 `free()`。

想要重构代码，却不知道该如何管理好内存。

想要打包代码，却发现到处是全局变量，而且没有静态函数。

但不管怎样，还是来说说那些 Rust 里有但 C 语言里没有的东西吧。

### 自动资源管理

我读过的第一篇关于 Rust 的文章是 "[Rust means never having to close a socket](http://blog.skylight.io/rust-means-never-having-to-close-a-socket/)"。Rust 从 C++ 那里借鉴了一些想法，如 RAII（Resource Acquisition Is Initialization，资源获取即初始化）和智能指针，并加入了值的单一所有权原则，还提供了自动化的决策性资源管理机制。

- 自动化：不需要手动调用 `free()`。内存使用完后会自动释放，文件使用完后会自动关闭，互斥锁在作用域之外会自动释放。如果要封装外部资源，基本上只要实现 Drop 这个 trait 就可以了。封装过的资源就像是编程语言的一部分，因为你不需要去管理它的生命周期。
- 决策性：资源被创建（内存分配、初始化、打开文件等），然后在作用域之外被销毁。根本不存在垃圾收集这回事：代码执行完就都结束了。程序数据的生命周期看起来就像是函数调用树。
  如果在写代码时老是忘记调用这些方法（free/close/destroy），或者发现以前写的代码已经忘记调用，甚至错误地调用，那么以后我再也不想使用这些方法了。

### 泛型

`Vec<T>` 真的就是元素 T 的 vector，而不只是对象指针的数组。在经过编译之后，它只能用来存放类型 T 的对象。

在 C 语言里需要些很多代码才能实现类似的功能，所以我不想再这么干了。

### trait 不只是 interface

Rust 并不是一门类似 Java 那样的面向对象编程语言，它有 trait，看起来就像是 Java 里的 interface 可以用来实现动态绑定。如果一个对象实现了 Drawable，那么就可以肯定该对象带有 `draw()` 方法。

不过不管怎样，trait 的威力可不止这些。

### 关联类型

trait 里可以包含关联类型，以 Rust 的 Iterator 这个 trait 为例：

``` rust
pub trait Iterator {
  type Item;
  fn next(&mut self) -> Option<Self::Item>;
}
```

也就是说，在实现 Iterator 时，必须同时指定一个 Item 类型。在调用 `next()` 方法时，如果还有更多元素，会得到一个 Some（用户定义的元素类型）。如果元素迭代完毕，会返回 None。

关联类型可以引用其他 trait。

例如，在 Rust 里，for 循环可以用于遍历任何一个实现了 IntoIterator 的对象。

``` rust
pub trait IntoIterator {
  /// 被遍历元素的类型
  type Item;
  type IntoIter: Iterator<Item=Self::Item>;
  fn into_iter(self) -> Self::IntoIter;
}
```

在实现这个 trait 时，必须同时提供 Item 类型和 IntoIter 类型，IntoIter 必须实现 Iterator，用于维护迭代器状态。

通过这种方式就可以建立起类型网络，类型之间相互引用。

### 字符串切割

我之前发表了一篇有关 C 语言缺少字符串切割特性的[文章](https://people.gnome.org/~federico/blog/rant-on-string-slices.html)，解释了 C 语言的这个痛点。

### 依赖管理

以前实现依赖管理需要：

- 手动调用或通过自动化工具宏来调用 pkg-config。
- 指定头文件和库文件路径。
- 基本上需要人为确保安装了正确版本的库文件。
- 而在 Rust 里，只需要编写一个 Cargo.toml 文件，然后在文件里指明依赖库的版本。这些依赖库会被自动下载下来，或者从某个指定的地方获取。

### 测试

C 语言的单元测试非常困难，原因如下：

内部函数通常都是静态的。也就是说，它们无法被外部文件调用。测试程序需要使用 `#include` 指令把源文件包含进来，或者使用 `#ifdefs` 在测试过程中移除这些静态函数。需要编写 Makefile 文件将测试程序链接到其中的部分依赖库或部分代码。
需要使用测试框架，并把测试用例注册到框架上，还要学会如何使用这些框架。而在 Rust 里，可以在任何地方写这样的代码：

``` rust
#[test]
fn test_that_foo_works() {
  assert!(foo() == expected_result);
}
```

然后运行 cargo test 运行单元测试。这些代码只会被链接到测试文件中，不需要手动编译任何东西，不需要编写 Makefile 文件或抽取内部函数用于测试。

对我来说，这个功能简直就是杀手锏。

### 包含测试的文档

在 Rust 中，可以将使用 Markdown 语法编写的注释生成文档。注释里的测试代码会被作为测试用例执行。也就是说，你可以在解释如何使用一个函数的同时对它进行单元测试：

``` rust
/// Multiples the specified number by two
///
/// ```
/// assert_eq!(multiply_by_two(5), 10);
/// ```
fn multiply_by_two(x: i32) -> i32 {
  x * 2
}
```

注释中的示例代码被作为测试用例执行，以确保文档与实际代码保持同步。

### 卫生宏（Hygienic Macro）

Rust 的卫生宏避免了 C 语言宏可能存在的问题，比如宏中的一些东西会掩盖掉代码里的标识符。Rust 并不要求宏中所有的符号都必须使用括号，比如 `max(5 + 3, 4)`。

### 没有自动转型

在 C 语言里，很多 bug 都是因为在无意中将 int 转成 short 或 char 而导致，而在 Rust 里就不会出现这种情况，因为它要求显示转型。

### 不会出现整型溢出

这个就不用再多作解释了。

在安全模式下，Rust 里几乎不存在未定义的行为
在 Rust 的“安全”模式下编写的代码（unsafe{} 代码块之外的代码）如果出现了未定义行为，可以直接把它当成是一个 bug 来处理。比如，将一个负整数右移，这样做是完全可以的。

### 模式匹配

在对一个枚举类型进行 switch 操作时，如果没有处理所有的值，gcc 编译器就会给出警告。

Rust 提供了模式匹配，可以在 match 表达式里处理枚举类型，并从单个函数返回多个值。

``` rust
impl f64 {
  pub fn sin_cos(self) -> (f64, f64);
}

let angle: f64 = 42.0;
let (sin_angle, cos_angle) = angle.sin_cos();
```

match 表达式也可以用在字符串上。是的，字符串。

``` rust
let color = "green";

match color {
  "red"  => println!("it's red"),
  "green" => println!("it's green"),
  _    => println!("it's something else"),
}
```

你是不是很难猜出下面这个函数是干什么用的？

``` rust
my_func(true, false, false)
```

但如果在函数的参数上使用模式匹配，那么事情就会变得不一样：

``` rust
pub struct Fubarize(pub bool);
pub struct Frobnify(pub bool);
pub struct Bazificate(pub bool);

fn my_func(Fubarize(fub): Fubarize,
      Frobnify(frob): Frobnify,
      Bazificate(baz): Bazificate) {
  if fub {
    ...;
  }

  if frob && baz {
    ...;
  }
}

...

my_func(Fubarize(true), Frobnify(false), Bazificate(true));
```

### 标准的错误处理

在 Rust 里，不再只是简单地返回一个布尔值表示出错与否，也不再简单粗暴地忽略错误，也不再通过非本地跳转来处理异常。

### #[derive(Debug)]

在创建新类型时（比如创建一个包含大量字段的 struct），可以使用 `#[derive(Debug)]`，Rust 会自动打印该类型的内容用于调试，不需要再手动编写函数去获取类型的信息。

### 闭包

不再需要使用函数指针了。

### 结论

在多线程环境里，Rust 的并发控制机制可以防止出现数据竟态条件。我想，对于那些经常写多线程并发代码的人来说，这会是个好消息。

C 语言是一门古老的语言，用它来编写单处理器的 Unix 内核或许是个不错的选择，但对于现今的软件来说，它算不上好语言。

Rust 有一定的学习曲线，但我觉得完全值得一学。它之所以不好学，是因为它要求开发者对自己所写的代码必须有充分的了解。我想，Rust 是一门这样的语言：它可以让你变成更好的开发者，而且它会成为你解决问题的利器。
