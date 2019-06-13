---
title: "Golang 中如何用 CGO 与 C 之间做一个缓存 buffer"
tags: [ "Golang", "C", "CGO" ]
date: 2018-11-05 20:00:00
---

Golang 和 C 之间如何传递二进制数据呢？
<!--more-->

Golang 是一个不错的语言，尤其是做一个缓存中间层是非常非常容易的。比较常见的场景就是我们在读一个很大很大的文件的时候，我们是做不到一次加载文件到内存的，Golang 可以做到一点一点的将文件读至末尾，慢慢处理完，相信很多语言也很容易做到这个,那如果在处理这个文件的时候项目的主语言是 Golang 而需要用到一些用 C 写好的模块那又该如何呢？如果让一个程序员只用 C 来实现处理一个大文件，那应该也是很容易的。Golang 对 C 的 binding 呢？

首先，我们先定义一个 C 的数据结构，也是一个很经典的数据结构：

``` C
typedef struct buffer_data { // 缓存数据的结构体
  uint8_t *ptr;
  size_t size;
} buffer_data;
```

既然是缓存那就应该有一个明确的大小，至少会是一个固定的大小，更复杂的场景可能会根据具体的外部参数造成缓存大小的变化。现在我们只是写一个例子而已，简单至上。然后就需要写一个针对上边的数据结构的初始化函数了。

``` C
// 初始化传入的 buffer 的内存对象
buffer_data init_buffer() {
  buffer_data buffer_in; // 传入的数据对象
  buffer_in.ptr  = malloc(MAX_BUFFER_SIZE * sizeof(uint8_t));
  buffer_in.size = 0;
  return buffer_in;
}
```

代码到此为止都很简单，仅仅是申请一些空间给这个缓存，并且缓存大小固定。后边的就稍微有一点点难度了。

缓存的话，就需要两个函数写入读出来操作。

读入的操作来说就是将新的数据添加到缓存的尾部，首先看一下代码：

``` C
// 从 Golang 中传入数据到 c 的内存中，返回每次读取的数据的数量
// 鉴于内存中不可以缓存过多的数据，也是为了节省内存，那么就需要每次仅将 buffer 填充的一定长度即可
// buffer 数据写入的目的位置
// buf 写入的数据
// buf_size 写入数据的大小
// return 已经写入数据的长度
int buffer_append(buffer_data *buffer, uint8_t *buf, int buf_size) {
  if (buffer->size == MAX_BUFFER_SIZE) {
    return 0;
  }
  pthread_mutex_lock(&buffer_in_mutex);
  if (MAX_BUFFER_SIZE - buffer->size > buf_size) {
    memcpy(buffer->ptr + buffer->size, buf, buf_size);
    buffer->size += buf_size;
    pthread_mutex_unlock(&buffer_in_mutex); // 解锁线程
    return buf_size;
  }
  memcpy(buffer->ptr + buffer->size, buf, MAX_BUFFER_SIZE - buffer->size);
  int read     = MAX_BUFFER_SIZE - buffer->size;
  buffer->size = MAX_BUFFER_SIZE;
  pthread_mutex_unlock(&buffer_in_mutex); // 解锁线程
  return read;
}
```

由于写入和读出的操作是针对一个竞态变量的互斥操作，那我们为了防止多线程操作的时候有问题，就需要针对 buffer 操作的时候加上一个线程锁。代码的其他部分就比较容易理解了，仅仅是一些内存复制之类的。

最后就是那个读出的操作了，读出的操作稍稍有一点点复杂相比写入，常规的做法就是将缓存的头部的数据取出一些，然后将后边的未被读到的数据往前移动，OK，看代码：

``` C
// 读出数据
// buffer 数据源
// buf 数据读出之后存储的位置
// buf_size 传入的 buf 的申请的空间的大小
// return 读出的数据的长度
int buffer_read(buffer_data *buffer, uint8_t *buf, int buf_size) {
  if (buf_size == 0) {
    return 0;
  }
  pthread_mutex_lock(&buffer_in_mutex);
  if (buf_size >= buffer->size) {
    int read = buffer->size;
    memcpy(buf, buffer->ptr, buffer->size);
    buffer->size = 0;
    pthread_mutex_unlock(&buffer_in_mutex); // 解锁线程
    return read;
  }
  memcpy(buf, buffer->ptr, buf_size); 
  memmove(buffer->ptr,buffer->ptr+buf_size,buffer->size-buf_size);
  buffer->size -= buf_size;
  pthread_mutex_unlock(&buffer_in_mutex); // 解锁线程
  return buf_size;
}
```

到此为止，我们的 C 的部分就完成了，其实这个还是有一点点简陋，真正的应该是 `buffer_in` 和 `buffer_out` 一个输入的缓存，一个是输出的缓存，中间 C 对输入的缓存做一些处理，比如音频格式转换之类的，然后将数据给到 `buffer_out` 中，在 Golang 中接收数据做一些其他处理。

在这个例子中我们的 Golang 的作用仅仅是将数据一步步放到 buffer 中然后从 buffer 再读出来。

``` go
package main

// #include <reader.h>
import "C"
import (
    "io/ioutil"
    "os"
    "unsafe"
)

func main() {
    var buffer = C.init_buffer()
    bytes, _ := ioutil.ReadFile("reader.h.gch")

    f, _ := os.Create("reader.out")
    for len(bytes) != 0 {
        var write = int(C.buffer_append(&buffer, (*C.uchar)(unsafe.Pointer(&bytes[0])), C.int(len(bytes))))
        bytes = bytes[write:]
        for {
            var bytes = make([]byte, 1024)
            var read = int(C.buffer_read(&buffer, (*C.uchar)(unsafe.Pointer(&bytes[0])), C.int(len(bytes))))
            if read == 0 {
                break
            }
            f.Write(bytes[:read])
        }
    }
    f.Close()
}
```

OK，代码到此为止就已经完了，大概的写法就是这样，里边没什么难点，只是有些同学开始做 CGO 的时候不太会写二进制的数据如何在 C 和 Golang 中传递而已。

完整的项目请查看这里: [https://github.com/tosone/reader](https://github.com/tosone/reader)

另外要说明的一点是 Golang 和 C 在传递参数的时候是内存拷贝各自管理内存，CGO 底层有做中间内存的处理。所以如果你的程序关于 CGO 那一部分总是出现 Segmentation fault 那就是 C 的内存没有管理好，仔细查查，也有可能是 CGO 底层出了问题，这个概率就比较小了，如果是 Golang 这边出现了问题一般都会有错误的堆栈的打印。这个小例子里边没有考虑太多的内存释放这方面的问题，实际项目中参考这段代码的时候千万注意，坑了别找我。
