---
title: "Golang Memory Align"
date: 2020-10-24T15:53:21+08:00
lastmod: 2020-10-24T15:53:21+08:00
draft: false
keywords: ["Golang", "Memory"]
description: "Golang Memory Align"
tags: ["Golang"]
categories: ["Develop"]
author: "Tosone"
---

操作系统并非一个字节一个字节访问内存，而是按 2, 4, 8 这样的字长来访问。因此，当 CPU 从存储器读数据到寄存器，或者从寄存器写数据到存储器，IO 的数据长度通常是字长。如 32 位系统访问粒度是 4 字节，64 位系统的是 8 字节。

当被访问的数据长度为 n 字节且该数据地址为n字节对齐，那么操作系统就可以高效地一次定位到数据，无需多次读取、处理对齐运算等额外操作。

数据结构应该尽可能地在自然边界上对齐。如果访问未对齐的内存，CPU需要做两次内存访问。

<!--more-->

下面是腾讯的面试题：

``` go
type S struct {
	A uint32
	B uint64
	C uint64
	D uint64
	E struct{}
}
```

上面的 struct S，占用多大的内存？

``` go
func main() {
	fmt.Println(unsafe.Offsetof(S{}.E))
	fmt.Println(unsafe.Sizeof(S{}.E))
	fmt.Println(unsafe.Sizeof(S{}))
}
```

首先，我们可以明确S的是8字节对齐的，因此我给出的答案是 32。但是很明显，答案并不是 32。先看下正确答案。终端输出：

``` txt
32
0
40
```

可以看到，S.E 的偏移量 offset 是32，并且 size 确实是 0，但是 S 实例的 size 却是 40。说明 S.E 后面隐藏着一个 8 字节的 padding。

### 社区解答

那为什么需要这个 padding 呢？在 github 上面查到了相关的 [issue](https://github.com/golang/go/issues/38194)，看见社区大佬的回复是这样的：

> Trailing zero-sized struct fields are padded because if they weren’t, &C.E would point to an invalid memory location.

结构体尾部 size 为 0 的变量会被分配内存空间进行填充，原因是如果不给它分配内存，该变量指针将指向一个非法的内存空间。

并且还给了个相关的 [issue](https://github.com/golang/go/issues/9401) 地址：

> If a non-zero-size struct contains a final zero-size field f, the address &x.f may point beyond the allocation for the struct. This could cause a memory leak or a crash in the garbage collector (invalid pointer found).

一个非空结构体包含有尾部 size 为 0 的变量，如果不给它分配内存，那么该变量的指针地址将指向一个超出该结构体内存范围的内存空间。这可能会导致内存泄漏，或者在内存垃圾回收过程中，程序 crash 掉。

### 原理

#### 为什么要对齐

操作系统并非一个字节一个字节访问内存，而是按 2, 4, 8 这样的字长来访问。因此，当 CPU 从存储器读数据到寄存器，或者从寄存器写数据到存储器，IO 的数据长度通常是字长。如 32 位系统访问粒度是 4 字节，64 位系统的是 8 字节。

当被访问的数据长度为 n 字节且该数据地址为n字节对齐，那么操作系统就可以高效地一次定位到数据，无需多次读取、处理对齐运算等额外操作。

数据结构应该尽可能地在自然边界上对齐。如果访问未对齐的内存，CPU需要做两次内存访问。

看下 Go 官方文档 Size and alignment guarantees 对于 Go 数据类型的大小保证和对齐保证：

![img](https://tc.tosone.cn/20201024161902.png)

在 Go 中，如果两个值的类型为同一种类的类型，并且它们的类型的种类不为接口、数组和结构体，则这两个值的尺寸总是相等的。

目前（Go 1.14），至少对于官方标准编译器来说，任何一个特定类型的所有值的尺寸都是相同的。所以我们也常说一个值的尺寸为此值的类型的尺寸。

下表列出了各种种类的类型的尺寸（对标准编译器 1.14 来说）:

![img](https://tc.tosone.cn/20201024161748.png)

一个结构体类型的尺寸取决于它的各个字段的类型尺寸和这些字段的排列顺序。为了程序执行性能，编译器需要保证某些类型的值在内存中存放时必须满足特定的内存地址对齐要求。 地址对齐可能会造成相邻的两个字段之间在内存中被插入填充一些多余的字节。 所以，一个结构体类型的尺寸必定不小于（常常会大于）此结构体类型的各个字段的类型尺寸之和。

一个数组类型的尺寸取决于它的元素类型的尺寸和它的长度。它的尺寸为它的元素类型的尺寸和它的长度的乘积。

struct{} 和 [0]T{} 的大小为 0; 不同的大小为 0 的变量可能指向同一块地址。

Go 官方文档中的对对齐保证的要求只有如下解释：

对于任何类型的变量x，unsafe.Alignof(x) 的结果最小为 1。

对于一个结构体类型的变量 x，unsafe.Alignof(x) 的结果为x的所有字段的对齐保证 unsafe.Alignof(x.f) 中的最大值（但是最小为 1）。

对于一个数组类型的变量 x，unsafe.Alignof(x) 的结果和此数组的元素类型的一个变量的对齐保证相等。

![img](https://tc.tosone.cn/20201024162305.png)

类型对齐保证也称为值地址对齐保证。 如果一个类型T的对齐保证为N（一个正整数），则在运行时刻T类型的每个（可寻址的）值的地址都是N的倍数。 我们也可以说类型T的值的地址保证为N字节对齐的。

事实上，每个类型有两个对齐保证。当它被用做结构体类型的字段类型时的对齐保证称为此类型的字段对齐保证，其它情形的对齐保证称为此类型的一般对齐保证。

对于一个类型T，我们可以调用unsafe.Alignof(t)来获得它的一般对齐保证，其中t为一个T类型的非字段值， 也可以调用unsafe.Alignof(x.t)来获得T的字段对齐保证，其中x为一个结构体值并且t为一个类型为T的结构体字段值。

在运行时刻，对于类型为T的一个值t，我们可以调用reflect.TypeOf(t).Align()来获得类型T的一般对齐保证， 也可以调用reflect.TypeOf(t).FieldAlign()来获得T的字段对齐保证。

对于当前的官方Go编译器（1.14版本），一个类型的一般对齐保证和字段对齐保证总是相等的。

#### 重排优化

![img](https://tc.tosone.cn/20201024162347.png)

T1,T2内字段最大的都是int64, 大小为 8bytes，对齐按机器字确定，64 位下是 8bytes，所以将按 8bytes 对齐

T1.a 大小 2bytes, 填充 6bytes 使对齐（后边字段已对齐，所以直接填充）

T1.b 大小 8bytes, 已对齐

T1.c 大小 2bytes，填充 6bytes 使对齐（后边无字段，所以直接填充）

总大小为 8+8+8=24

T2中将c提前后，a和c总大小 4bytes,在填充 4bytes 使对齐

总大小为 8+8=16

所以，合理重排字段可以减少填充，使 struct 字段排列更紧密。

#### 零大小字段对齐

零大小字段（zero sized field）是指struct{}，大小为 0，按理作为字段时不需要对齐，但当在作为结构体最后一个字段（final field）时需要对齐的。即开篇我们讲到的面试题的情况，假设有指针指向这个final zero field, 返回的地址将在结构体之外（即指向了别的内存），如果此指针一直存活不释放对应的内存，就会有内存泄露的问题（该内存不因结构体释放而释放），go会对这种final zero field也做填充，使对齐。当然，有一种情况不需要对这个final zero field做额外填充，也就是这个末尾的上一个字段未对齐，需要对这个字段进行填充时，final zero field就不需要再次填充，而是直接利用了上一个字段的填充。

![img](https://tc.tosone.cn/20201024162445.png)

思考: 假如这个 E 不是struct{}，而是 [0]int32 或者 [0]int64，那 unsafe.Sizeof(S{}) 会是多少呢？

#### 64 位字安全访问保证

在 32 位系统上想要原子操作 64 位字（如 uint64）的话，需要由调用方保证其数据地址是 64 位对齐的，否则原子访问会有异常。

拿uint64来说，大小为 8bytes，32 位系统上按 4字节 对齐，64 位系统上按 8字节对齐。在 64 位系统上，8bytes 刚好和其字长相同，所以可以一次完成原子的访问，不被其他操作影响或打断。而 32 位系统，4byte 对齐，字长也为 4bytes，可能出现uint64的数据分布在两个数据块中，需要两次操作才能完成访问。如果两次操作中间有可能别其他操作修改，不能保证原子性。这样的访问方式也是不安全的。

来看下 Golang 一个 [issue](https://github.com/golang/go/issues/6404)。

![img](https://tc.tosone.cn/20201024162601.png)
![img](https://tc.tosone.cn/20201024162618.png)

Cox大神的解答：

![img](https://tc.tosone.cn/20201024162638.png)

在32位系统上，开发者有义务使64位字长的数据的原子访问是64位(8字节)对齐的。在全局变量，结构体和切片的的第一个字长数据可以被认为是64位对齐的。

#### 如何保证呢？

变量或开辟的结构体、数组和切片值中的第一个 64 位字可以被认为是 8 字节对齐

开辟的意思是通过声明，make，new 方式创建的，就是说这样创建的 64 位字可以保证是 64 位对齐的。

### 总结

内存对齐是为了让 CPU 更高效访问内存中数据

struct 的对齐是：如果类型 t 的对齐保证是 n，那么类型 t 的每个值的地址在运行时必须是 n 的倍数。

即 uintptr(unsafe.Pointer(&x)) % unsafe.Alignof(x) == 0

struct 内字段如果填充过多，可以尝试重排，使字段排列更紧密，减少内存浪费

零大小字段要避免作为 struct 最后一个字段，会有内存浪费

32 位系统上对 64 位字的原子访问要保证其是 8bytes 对齐的；当然如果不必要的话，还是用加锁（mutex）的方式更清晰简单

![img](https://tc.tosone.cn/20201024162753.png)

因为s1和s2在内存上是连续的，我们也已知s1的大小是40，那为什么s2的地址相对s1的地址偏移量却是48呢？(0xc0000aa090-0xc0000aa060 = 48)

先给出答案，因为对于s1这个对象，它的大小是40bytes，而go在内存分配时，会从span中拿大于或等于40的最小的span中的一个块给这个对象，而sizeclass中这个块的大小值为48。所以虽然s1的大小是40bytes，但实际分配给这个对象的内存大小是48。

go的内存分配，首先是按照sizeclass划分span，然后每个span中的page又分成一个个小格子(大小相同的对象object)：

span是golang内存管理的基本单位，是由一片连续的8KB(golang page的大小)的页组成的大块内存。

如下图，span由一组连续的页组成，按照一定大小划分成object。

![img](https://tc.tosone.cn/20201024162810.png)

每个span管理指定规格（以golang 中的 page为单位）的内存块，内存池分配出不同规格的内存块就是通过span体现出来的，应用程序创建对象就是通过找到对应规格的span来存储的，下面是 mspan结构中的主要部分。

![img](https://tc.tosone.cn/20201024162830.png)

那么要想区分不同规格的span，必须要有一个标识，每个span通过spanclass标识属于哪种规格的span，golang的span规格一共有67种，具体如下：

``` go
// go/src/runtime/sizeclasses.go

// class： 			 class ID，每个span结构中都有一个class ID, 表示该span可处理的对象类型
// bytes/obj：		 该class代表对象的字节数
// bytes/span：	 每个span占用堆的字节数，也即页数*页大小
// objects: 		  每个span可分配的对象个数，也即（bytes/spans）/（bytes/obj）
// waste bytes: 	每个span产生的内存碎片，也即（bytes/spans）%（bytes/obj）

// class  bytes/obj  bytes/span  objects  tail waste  max waste
//     1          8        8192     1024           0     87.50%
//     2         16        8192      512           0     43.75%
//     3         32        8192      256           0     46.88%
//     4         48        8192      170          32     31.52%  8192-(48*170)
//     5         64        8192      128           0     23.44%
//     6         80        8192      102          32     19.07%
//     7         96        8192       85          32     15.95%
//     8        112        8192       73          16     13.56%
//     9        128        8192       64           0     11.72%
//    10        144        8192       56         128     11.82%
//    11        160        8192       51          32      9.73%
//    12        176        8192       46          96      9.59%
//    13        192        8192       42         128      9.25%
//    14        208        8192       39          80      8.12%
//    15        224        8192       36         128      8.15%
//    16        240        8192       34          32      6.62%
//    17        256        8192       32           0      5.86%
//    18        288        8192       28         128     12.16%
//    19        320        8192       25         192     11.80%
//    20        352        8192       23          96      9.88%
//    21        384        8192       21         128      9.51%
//    22        416        8192       19         288     10.71%
//    23        448        8192       18         128      8.37%
//    24        480        8192       17          32      6.82%
//    25        512        8192       16           0      6.05%
//    26        576        8192       14         128     12.33%
//    27        640        8192       12         512     15.48%
//    28        704        8192       11         448     13.93%
//    29        768        8192       10         512     13.94%
//    30        896        8192        9         128     15.52%
//    31       1024        8192        8           0     12.40%
//    32       1152        8192        7         128     12.41%
//    33       1280        8192        6         512     15.55%
//    34       1408       16384       11         896     14.00%
//    35       1536        8192        5         512     14.00%
//    36       1792       16384        9         256     15.57%
//    37       2048        8192        4           0     12.45%
//    38       2304       16384        7         256     12.46%
//    39       2688        8192        3         128     15.59%
//    40       3072       24576        8           0     12.47%
//    41       3200       16384        5         384      6.22%
//    42       3456       24576        7         384      8.83%
//    43       4096        8192        2           0     15.60%
//    44       4864       24576        5         256     16.65%
//    45       5376       16384        3         256     10.92%
//    46       6144       24576        4           0     12.48%
//    47       6528       32768        5         128      6.23%
//    48       6784       40960        6         256      4.36%
//    49       6912       49152        7         768      3.37%
//    50       8192        8192        1           0     15.61%
//    51       9472       57344        6         512     14.28%
//    52       9728       49152        5         512      3.64%
//    53      10240       40960        4           0      4.99%
//    54      10880       32768        3         128      6.24%
//    55      12288       24576        2           0     11.45%
//    56      13568       40960        3         256      9.99%
//    57      14336       57344        4           0      5.35%
//    58      16384       16384        1           0     12.49%
//    59      18432       73728        4           0     11.11%
//    60      19072       57344        3         128      3.57%
//    61      20480       40960        2           0      6.87%
//    62      21760       65536        3         256      6.25%
//    63      24576       24576        1           0     11.45%
//    64      27264       81920        3         128     10.00%
//    65      28672       57344        2           0      4.91%
//    66      32768       32768        1           0     12.50%
```

每个 mspan 按照它自身的属性 Size Class 的大小分割成若干个 object，每个 object 可存储一个对象。并且会使用一个位图来标记其尚未使用的 object。属性 Size Class 决定 object 大小，而 mspan 只会分配给和 object 尺寸大小接近的对象，当然，对象的大小要小于 object 大小。