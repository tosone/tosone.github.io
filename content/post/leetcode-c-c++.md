---
title: "Leetcode C/C++"
date: 2019-07-20T12:47:23+08:00
draft: false
contentCopyright: false
tags: [ "LeetCode" ]
categories: [ "Develop" ]
---

LeetCode 上做一些 C/C++ 的算法的时候总会出现一些奇奇怪怪的问题。如何在本地的时候把问题解决解决或者 Debug 出来呢？

<!--more-->

### Index out of bounds

对于 C 语言来说，如果直接访问超出 index 的数组，会报错：

``` c
int main(int argc, char **argv) {
  int array[100];
  array[101] = -1;
  int res = array[-1];
  return res;
}
```

报错如下：

``` bash
Runtime Error:
Line 3: Char 10: runtime error: index 101 out of bounds for type 'int [100]' (solution.c)
```

但是如果你使用 malloc 分配空间给 int 数组，index 的越界访问是不会直接报错的。

### Heap-buffer-overflow

LeetCode 使用了 AddressSanitizer 检查是否存在内存非法访问。

``` c
#include <stdlib.h>
int main(int argc, char **argv) {
  int *array = (int *)malloc(100 * sizeof(int));
  array[0] = -1;
  int res = array[-1]; // BOOM
  return res;
}
```

``` bash
gcc -O -g -fsanitize=address test.c
./a.out
```

LeetCode 报错如下：

``` bash
AddressSanitizer: heap-buffer-overflow on address 0x60300000000c at pc 0x000000401749 bp 0x7ffc91bd0570 sp 0x7ffc91bd0568
WRITE of size 4 at 0x60300000000c thread T0
    #3 0x7ff2c35d42e0 in __libc_start_main (/lib/x86_64-linux-gnu/libc.so.6+0x202e0)

0x60300000000c is located 4 bytes to the left of 20-byte region [0x603000000010,0x603000000024)
allocated by thread T0 here:
    #0 0x7ff2c4a5e2b0 in malloc (/usr/local/lib64/libasan.so.5+0xe82b0)
    #4 0x7ff2c35d42e0 in __libc_start_main (/lib/x86_64-linux-gnu/libc.so.6+0x202e0)
```

### Heap-use-after-free

``` c
int main(int argc, char **argv) {
  int *array = new int[100];
  delete[] array;
  return array[argc]; // BOOM
}
```

``` bash
g++ -O -g -fsanitize=address test.c
./a.out
```

LeetCode 报错如下：

``` bash
AddressSanitizer: heap-use-after-free on address 0x61400000fe44 at pc 0x56282de47977 bp 0x7fff9cfc65e0 sp 0x7fff9cfc65d8
READ of size 4 at 0x61400000fe44 thread T0
    #0 0x56282de47976 in main /root/heap-use-after-free.c:4
    #1 0x7fabfddb72e0 in __libc_start_main (/lib/x86_64-linux-gnu/libc.so.6+0x202e0)
    #2 0x56282de47819 in _start (/root/a.out+0x819)

0x61400000fe44 is located 4 bytes inside of 400-byte region [0x61400000fe40,0x61400000ffd0)
freed by thread T0 here:
    #0 0x7fabfea96370 in operator delete[](void*) (/usr/lib/x86_64-linux-gnu/libasan.so.3+0xc3370)
    #1 0x56282de47941 in main /root/heap-use-after-free.c:3

previously allocated by thread T0 here:
    #0 0x7fabfea95d70 in operator new[](unsigned long) (/usr/lib/x86_64-linux-gnu/libasan.so.3+0xc2d70)
    #1 0x56282de47931 in main /root/heap-use-after-free.c:2
``` 

### Stack-buffer-overflow

``` c
int main(int argc, char **argv) {
  int stack_array[100];
  stack_array[1] = 0;
  return stack_array[argc + 100]; // BOOM
}
```

```
gcc -O -g -fsanitize=address test.c
./a.out
```

LeetCode 报错如下：

``` bash
AddressSanitizer: stack-buffer-overflow on address 0x7fffe55a7b04 at pc 0x555dec997a0e bp 0x7fffe55a7940 sp 0x7fffe55a7938
READ of size 4 at 0x7fffe55a7b04 thread T0
    #0 0x555dec997a0d in main /root/test6.c:4
    #1 0x7f903bdab2e0 in __libc_start_main (/lib/x86_64-linux-gnu/libc.so.6+0x202e0)
    #2 0x555dec997819 in _start (/root/a.out+0x819)

Address 0x7fffe55a7b04 is located in stack of thread T0 at offset 436 in frame
    #0 0x555dec99792f in main /root/test6.c:1
```

### Global-buffer-overflow

``` c
int global_array[100] = {-1};
int main(int argc, char **argv) {
  return global_array[argc + 100]; // BOOM
}
```

``` bash
gcc -O -g -fsanitize=address test.c
./a.out
```

LeetCode 报错如下：

```
AddressSanitizer: global-buffer-overflow /root/test6.c:3 in main
Shadow bytes around the buggy address:
  0x0ab033158fe0: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0ab033158ff0: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0ab033159000: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0ab033159010: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0ab033159020: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
=>0x0ab033159030: 00 00 00 00 00 00 00 00 00 00 00 00 00 00[f9]f9
  0x0ab033159040: f9 f9 f9 f9 00 00 00 00 00 00 00 00 00 00 00 00
  0x0ab033159050: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0ab033159060: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0ab033159070: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0ab033159080: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
Shadow byte legend (one shadow byte represents 8 application bytes):
```
