---
title: "Kubernetes Tutorial"
date: 2019-06-27T23:03:09+08:00
tags: [ "Kubernetes" ]
---

> Kubernetes[^k8s] is an open-source system for automating deployment, scaling, and management of containerized applications.

> It groups containers that make up an application into logical units for easy management and discovery. Kubernetes builds upon 15 years of experience of running production workloads at Google, combined with best-of-breed ideas and practices from the community.

<!--more-->

__Kubernetes__ 典型的结构图：

![Kubernetes](/img/k8s_0330_01.png)

按照角色划分，Kubernetes 和绝大多数分布式系统一样，分为 Master 和 Slave 两类。其中 Master 是整个系统的控制中心，是大脑；而 Slave 是分布在各个节点的工作单元。

### 工具介绍

__Kubernetes__ 三大支撑工具：__kubelet__，__kubeadm__，__kubectl__。

__kubelet__: Kubernetes 是一个分布式的集群管理系统，在每个节点上都要运行一个 agent 对容器进行生命周期的管理，这个 agent 程序就是 kubelet。简单地说，kubelet 的主要功能就是定时从某个地方获取节点上 pod/Container 的期望状态，运行什么容器、运行的副本数量、网络或者存储如何配置等等，并调用对应的容器平台接口达到这个状态。上面说的定时从某个地方获取就是指的通过 Kubernetes 资源注册与发现框架从apiserver中获取。

__kubeadm__: 用于初始化引导 Kubernetes cluster 的创建。

__kubectl__: 是 kubenetes 命令行工具，通过 kubectl 可以部署和管理应用，查看各种资源，创建，删除和更新组件。

### 组件介绍

__etcd__ 组件是 Kubernetes 系统的资源存储的地方，是整个 Kubernetes 的基石，也是 Kubernetes 很多功能的设计之源。做为一个高可用强一致性的服务发现存储仓库，etcd 本身非常好的提供了数据的持久化存储和服务发现的支持。在云计算时代，如何让服务快速透明地接入到计算集群中，如何让共享配置信息快速被集群中的所有机器发现是迫切要解决的问题，也是最最核心的问题。etcd 很好的解决了这个问题。

__kube-apiserver__ 组件是 Kubernetes 的入口，也是整个 Kubernetes 除了 etcd 外最最基础、最最核心的组件。它是整个 Kubernetes 系统和生态的枢纽和消息总线。没有kube-apiserver 整个 Kubernetes 系统将会土崩瓦解，无法运转。

从功能实现角度来看，kube-apiserver 是对 etcd 的一个包装，通过对 etcd 的进一步包装，实现两大功能。一是对外提供查询资源对象的接口；二是提供 Kubernetes 中资源注册与发现的框架。

__kube-controller-manager__ 是 Kubernetes 多种资源控制器的集合。像 ReplicationController、ReplicaSetController、DeploymentController、ConfigMapController 等等。通过这些控制器实现对各种资源的 CRUD 操作。 这些控制器通过 Kubernetes 资源注册与发现框架（其中最核心的就是 list/watch 机制）来注册和发现自己关心的资源状态变化（如：ReplicationController 关心 RC 和 POD 资源、ReplicaSetController 关心 RS 和 POD 资源等）。通过感知资源状态的变化，对这些资源进行相应的处理，使得资源状态最终达到规定的状态。

__kube-scheduler__[^kube-scheduler]，调度是容器编排的重要环节，需要经过严格的监控和控制，现实生产通常对调度有各类限制，譬如某些服务必须在业务独享的机器上运行，或者从灾备的角度考虑尽量把服务调度到不同机器，这些需求在 Kubernetes 集群依靠调度组件 kube-scheduler 满足。以达到四个目标：公平性，资源高效利用，高效率，高灵活度。

__kube-proxy__[^kube-proxy]，我们可以在集群中创建 pod，也能通过 ReplicationController 来创建特定副本的 pod。可以从集群中获取每个 pod ip 地址，然后也能在集群内部直接通过 ip:port 来获取对应的服务。但是还有一个问题：pod 是经常变化的，每次更新 ip 地址都可能会发生变化，如果直接访问容器 ip 的话，会有很大的问题。而且进行扩展的时候，rc 中会有新的 pod 创建出来，出现新的 ip 地址，我们需要一种更灵活的方式来访问 pod 的服务。针对这个问题，kubernetes 的解决方案是服务（service），每个服务都一个固定的虚拟 ip（clusterIP），自动并且动态地绑定后面的 pod，所有的网络请求直接访问服务 ip，服务会自动向后端做转发。Service 除了提供稳定的对外访问方式之外，还能起到负载均衡（Load Balance）的功能，自动把请求流量分布到后端所有的服务上，服务可以做到对客户透明地进行水平扩展（scale）。

### 三个核心概念

__Replication Controller__（RC）是 Kubernetes 中的另一个核心概念，应用托管在 Kubernetes 之后，Kubernetes 需要保证应用能够持续运行，这是RC 的工作内容，它会确保任何时间 Kubernetes 中都有指定数量的 Pod 在运行。在此基础上，RC 还提供了一些更高级的特性，比如滚动升级、升级回滚等。

__Deployment__ 为 Kubernetes 提供了一种更加简单的更新 RC 和 Pod 的机制。通过在 Deployment 中描述你所期望的集群状态，Deployment Controller 会将现在的集群状态在一个可控的速度下逐步更新成你所期望的集群状态。Deployment 主要职责同样是为了保证pod的数量和健康，90% 的功能与 Replication Controller 完全一样，可以看做新一代的 Replication Controller。但是，它又具备了 Replication Controller 之外的新特性[^Deployment]：
Replication Controller 全部功能，事件和状态查看，回滚，版本记录，暂停和启动，多种升级方案。

__Service__ 为一组 Pod 提供单一稳定的名称和地址。他们作为基本负载均衡器而存在。是一系列 Pod 以及这些 Pod 的访问策略的抽象。

Service 具有如下特征：

1. 拥有一个唯一指定的名字
2. 拥有一个虚拟IP和端口号
3. 能够提供某种远程服务能力
4. 被映射到提供这种服务能力的一组容器上
5. Service的服务进程目前都基于socket通信方式对外提供服务

Service 的服务进程目前都基于 socket 通信方式对外提供服务，Kubernetes 内置了透明的负载均衡以及故障恢复的机制。

### 实例操作

我们先不讨论如何用 kubeadm 来初始化一个 Kubernetes 的集群，先用一个测试的好用的工具来试验一把 Kubernetes 的效果。

首先安装 `Docker`，`virtualbox`, `minikube` 通过 `brew cask install virtualbox docker minikube`。

安装 `kubectl` 通过 `brew install kubectl`。

启动 `minikube`，通过 `minikube start --memory 4096 --cpus 2`，这里指定 `minikube` 可利用的内存为 4GB，CPU 核心数为 2。

下面我们就看一个意大利面条一样的 Kubernetes 的配置[^sample]：

``` yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: meow
spec:
  replicas: 2
  selector:
    matchLabels:
      app: meow
  template:
    metadata:
      labels:
        app: meow
    spec:
      containers:
      - name: meow
        image: kennship/http-echo:latest
        ports:
        - containerPort: 3000
---

apiVersion: v1
kind: Service
metadata:
  name: meow-svc
spec:
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: meow
---

apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: meow-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: \"false\"
spec:
  rules:
  - http:
      paths:
      - path: /meow
        backend:
          serviceName: meow-svc
          servicePort: 80
```

以上配置设置了三项东西分别是 Deployment，Service 和 Ingress。启动方式是 `kubectl apply -f http-echo.yaml`。

运行 `kubectl get pods -w` 查看当前的 pod 的启动情况，稍等片刻将会启动成功。

运行 `kubectl get svc -w` 查看当前的 Service 的启动情况。

运行 `kubectl get ing -w` 查看当前的 Ing 的启动情况。

运行 `minikube ip` 获取 `minikube` 的 IP 地址。访问容器内的服务通过 `https://IP/meow`，浏览器会提示不是有效的可靠证书，但是没关系可以继续访问。

### 改进点

- 多服务多依赖的复杂部署。
- 灰度部署蓝绿部署。
- 状态监控。
- 警告管理。
- 自动伸缩。

[^k8s]: Kubernetes Production-Grade Container Orchestration https://kubernetes.io/
[^kube-scheduler]: Kubernetes 调度器 kube-scheduler https://zhuanlan.zhihu.com/p/56088355
[^kube-proxy]: kubernetes 简介：service 和 kube-proxy 原理 https://cizixs.com/2017/03/30/kubernetes-introduction-service-and-kube-proxy/
[^Deployment]: Kubernetes核心概念总结 https://www.cnblogs.com/zhenyuyaodidiao/p/6500720.html
[^sample]: Getting Started with Kubernetes Ingress-Nginx on Minikube https://medium.com/@awkwardferny/getting-started-with-kubernetes-ingress-nginx-on-minikube-d75e58f52b6c
