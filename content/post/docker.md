---
date: 2017-05-07 10:59:43
tags: [ "Docker" ]
title: "Docker 入门"
---

Docker 安装以及常用数据库安装。
<!--more-->

### 安装 Docker

``` bash
curl -sSL https://get.docker.com/ | sh
wget -qO- https://get.docker.com/ | sh
```

### 安装 Docker Compose

``` bash
curl -L https://github.com/docker/compose/releases/download/1.13.0/docker-compose-`uname -s`-`uname -m` > /usr/bin/docker-compose
chmod +x /usr/bin/docker-compose
```

### 安装 MongoDB

``` bash
FROM mongo:latest
ENV MONGO_INITDB_ROOT_USERNAME mongodb_name
ENV MONGO_INITDB_ROOT_PASSWORD mongodb_passwd
COPY mongod.conf /etc/
EXPOSE 27017
CMD ["mongod", "-f", "/etc/mongod.conf"]
```

``` bash
processManagement:
    fork: true
net:
    bindIp: "0.0.0.0"
    port: 27017
    maxIncomingConnections: 1000
    http:
        enabled: false
        JSONPEnabled: false
        RESTInterfaceEnabled: false
storage:
    dbPath: "/data/db"
    directoryPerDB: true
    journal:
        enabled: true
systemLog:
    destination: "file"
    path: "/var/log/mongodb/mongod.log"
    logAppend: true
security:
    authorization: "enabled"
```

``` bash
docker build -t mongo-tosone .
docker run --name mongo -v /data/mongodb/data:/data/db --hostname="mongodb" -p 27017:27017 -d mongo-tosone --smallfiles
```

### 安装 Mysql

``` bash
FROM mysql:latest
ENV MYSQL_ROOT_PASSWORD 8541539655
ENV MYSQL_USER tosone
ENV MYSQL_PASSWORD 8541539655
CMD ["mysqld"]
```

``` bash
docker build -t mysql-tosone .
docker run --name mysql -v /data/mysql:/var/lib/mysql --hostname="mysql" -p 3306:3306 -d mysql-tosone
```

### 安装 Redis

``` bash
FROM redis:latest
COPY redis.conf /etc/redis/redis.conf
CMD [ "redis-server", "/etc/redis/redis.conf" ]
```

``` bash
################################## INCLUDES ###################################
################################## NETWORK #####################################
bind 0.0.0.0
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300
################################# GENERAL #####################################
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
################################ SNAPSHOTTING  ###############################
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./
################################# REPLICATION #################################
slave-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-disable-tcp-nodelay no
slave-priority 100
################################## SECURITY ###################################
requirepass 8541539655
################################### LIMITS ####################################
############################## APPEND ONLY MODE ###############################
appendonly no
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
################################ LUA SCRIPTING  ###############################
lua-time-limit 5000
################################ REDIS CLUSTER  ##############################
################################## SLOW LOG ###################################
slowlog-log-slower-than 10000
slowlog-max-len 128
################################ LATENCY MONITOR ##############################
latency-monitor-threshold 0
############################# EVENT NOTIFICATION ##############################
notify-keyspace-events ""
############################### ADVANCED CONFIG ###############################
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit slave 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
aof-rewrite-incremental-fsync yes
```

``` bash
docker build -t redis-tosone .
```
