---
date: 2017-04-15 14:22:24
tags: [ "OpenCV", "C++" ]
title: "Compile Opencv"
categories: [ "Develop" ]
draft: false
contentCopyright: false
---

OpenCV is released under a BSD license and hence it’s free for both academic and commercial use. It has C++, C, Python and Java interfaces and supports Windows, Linux, Mac OS, iOS and Android. OpenCV was designed for computational efficiency and with a strong focus on real-time applications. Written in optimized C/C++, the library can take advantage of multi-core processing. Enabled with OpenCL, it can take advantage of the hardware acceleration of the underlying heterogeneous compute platform.
<!--more-->

### STEP 1

To install the dependencies required for OpenCV, just run the following command:

``` bash
sudo apt-get -y install libopencv-dev build-essential cmake git libgtk2.0-dev libgtk-3-dev \
                        pkg-config python-dev python-numpy libdc1394-22 libdc1394-22-dev \
                        libjpeg-dev libpng-dev libpnglite-dev libpng++-dev libtiff5-dev \
                        libavcodec-dev libavformat-dev libswscale-dev libxine2-dev \
                        libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libv4l-dev \
                        libtbb-dev libqt4-dev libfaac-dev libmp3lame-dev libopencore-amrnb-dev \
                        libopencore-amrwb-dev libtheora-dev libvorbis-dev libxvidcore-dev x264 \
                        v4l-utils unzip
```

### STEP 2

Download the latest version of [OpenCV](https://github.com/opencv/opencv). Or from [here](https://share.weiyun.com/c01ee33744d180629d3ae779b75b8d43).

``` bash
wget https://github.com/opencv/opencv/archive/${version}.zip
unzip ${version}.zip
```

### STEP 3

Sometimes compile opencv will get an error that cannot downlaod ippicv.

``` bash
mkdir 3rdparty/ippicv/downloads/linux-808b791a6eac9ed78d32a7666804320e
```

Then copy the ippicv file in that directory.

``` bash
mkdir build
cd build
cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local ..
```

### STEP 4

Finishing compile.

Now some final touches:

``` bash
sudo /bin/bash -c 'echo "/usr/local/lib" > /etc/ld.so.conf.d/opencv.conf'
sudo ldconfig
sudo apt-get update
```

After the complete process execute reboot your system.

Now you have a working installation of OpenCV.
