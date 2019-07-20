---
title: "Cloudify Tutorial"
date: 2019-07-20T11:22:09+08:00
draft: false
contentCopyright: false
tags: [ "Cloudify", "Container" ]
categories: [ "Tutorial" ]
---

> A single open source, end-to-end platform designed to transform network services and applications, connect branches, deploy and manage multi-access edge and IoT devices, break down silos and deliver all services on-demand – automatically, at scale.

<!--more-->

#### 文档

- 首先在 [cloudify-dev](https://github.com/cloudify-cosmo/cloudify-dev) 有一个详细的关于 cloudify 的开发说明，包括他们各个模块之间的关系，环境配置，开发流程管理，开发过程中的一些实用脚本。

- Cloudify 最重要的三个仓库为 [cloudify-cli](https://github.com/cloudify-cosmo/cloudify-cli) (Cloudify's Command Line Interface), [cloudify-manager](https://github.com/cloudify-cosmo/cloudify-manager) (Cloudify's manager REST service, Cloudify system-workflows, Integration tests), [cloudify-common](https://github.com/cloudify-cosmo/cloudify-common) (DSL parsing package, DSL Parser, REST Client, Script Plugin)

<img src="https://tc.tosone.cn/20190718110415.png" alt="drawing" width="600"/>

- Cloudify 的 restful API 的在线地址在[这里](https://docs.cloudify.co/api/v3.1/)，文档源码在[这里](https://github.com/cloudify-cosmo/cloudify-rest-docs)，文档写的非常详细。文档是用的 `Hugo` 来生成的，将代码克隆下来之后，直接运行 `hugo` 就可以看到了。我的[博客](https://tosone.cn)也是用这个搭建的，非常好用。

- Cloudify 的 Python API 的在线地址在[这里](https://docs.cloudify.co/cloudify-rest-client/)，文档源码在[这里](https://github.com/cloudify-cosmo/cloudify-rest-client)。文档是用的 `ReadTheDocs` 来生成的。在根目录下运行 `make dev && make docs` 然后 `serve docs/_build/html ` 就直接可以在本地访问到文档。

- cloudify-plugins-common 的在线地址在[这里](http://cloudify-plugins-common.readthedocs.org/en/latest/)，文档源码在[这里](https://github.com/cloudify-cosmo/cloudify-plugins-common/tree/master/docs)。文档是用的 `ReadTheDocs` 来生成的。

- [DSL Specification](http://docs.getcloudify.org/latest/blueprints/overview/) BluePrint 的语法规则。

- [Script Plugin](http://docs.getcloudify.org/latest/plugins/script/) The Script plugin can be used to map node life-cycle operations and workflows to scripts that are included in your blueprint. Scripts can be written in Python, bash, ruby, and so on.

#### API Authentication[^1]

Starting from Cloudify 4.0.0, all restful API communication to the server requires:

- Authentication using user credentials.

- Tenant name, representing the scope of the request.

Every Cloudify Manager has a default tenant, called `default_tenant`. The `default_tenant` tenant is created during bootstrap.

In addition to the `default_tenant`, every Cloudify Manager includes a bootstrap Admin. The bootstrap Admin is the Admin user that created during the bootstrap.

In addition to the user credentials, every request must also specify a tenant in the header.

In the case of using the Cloudify community edition or if you have not created any new tenant, you can use the `default_tenant` as the tenant for the request.

#### 资源更新

资源的更新可能会涉及到 `Blueprints` 的[更新](https://docs.cloudify.co/api/v3.1/#upload-blueprint)，`Deployment` 的[更新](https://docs.cloudify.co/api/v3.1/#update-deployment)。

#### 实例

部署的服务器资源至少是 2C2G 的才不至于会卡。

```bash
sudo docker run --name cfy_manager_local -d --restart unless-stopped -v /sys/fs/cgroup:/sys/fs/cgroup:ro --tmpfs /run --tmpfs /run/lock --security-opt seccomp:unconfined --cap-add SYS_ADMIN -p 80:80 -p 8000:8000 cloudifyplatform/community:19.01.24
```

部署一个 Hello World 的应用进去。

```bash
docker exec -it cfy_manager_local sh -c "cfy install https://github.com/cloudify-examples/local-simple-python-webserver-blueprint/archive/master.zip"
```

访问 `http://104.207.134.211:8000/` 可以看到一个正确的结果。

```bash
# 获取用户的 auth token
curl -X GET \
    --header "Tenant: default_tenant" \
    -u admin:admin \
    "http://104.207.134.211/api/v3.1/tokens"
```

```json
{
  "username":"admin",
  "role":"sys_admin",
  "value":"WyIwIiwiOTY0OGQ3YTM5ZGQ5NzBlZTE0ZGVkNDc1ZWU4MWI1ZTQiXQ.XTAqMA.km04sF50HUfMwID3EWysJNnAlQg"
}
```

```bash
# 获取所有 blueprints 的 id
curl -X GET \
    --header "Tenant: default_tenant" \
    --header "Authentication-Token: WyIwIiwiOTY0OGQ3YTM5ZGQ5NzBlZTE0ZGVkNDc1ZWU4MWI1ZTQiXQ.XTAqMA.km04sF50HUfMwID3EWysJNnAlQg" \
    "http://104.207.134.211/api/v3.1/blueprints?_include=id"
```

```json
{
  "items":[
    {
      "id":"local-simple-python-webserver-blueprint-master"
    }
  ],
  "metadata":{
    "pagination":{
      "total":1,
      "offset":0,
      "size":1000
    }
  }
}
```

```bash
# 获取某个 blueprint 的指定信息
curl -X GET \
    --header "Tenant: default_tenant" \
    --header "Authentication-Token: WyIwIiwiOTY0OGQ3YTM5ZGQ5NzBlZTE0ZGVkNDc1ZWU4MWI1ZTQiXQ.XTAqMA.km04sF50HUfMwID3EWysJNnAlQg" \
    "http://104.207.134.211/api/v3.1/blueprints?id=local-simple-python-webserver-blueprint-master&_include=id,description,main_file_name"
```

```json
{
  "items":[
    {
      "main_file_name":"blueprint.yaml",
      "description":null,
      "id":"local-simple-python-webserver-blueprint-master"
    }
  ],
  "metadata":{
    "pagination":{
      "total":1,
      "offset":0,
      "size":1000
    }
  }
}
```

[^1]: Cloudify REST API V3.1 https://docs.cloudify.co/api/v3.1/#cloudify-rest-api-v3-1
