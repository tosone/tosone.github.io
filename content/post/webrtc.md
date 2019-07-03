---
tags: [ "NodeJs" ]
date: 2017-02-26 09:56:03
title: Web RTC Demo
categories: [ "Tutorial" ]
---

WebRTC 项目的最终目的主要是让 Web 开发者能够基于浏览器轻易快捷开发出丰富的实时多媒体应用，而无需下载安装任何插件，Web 开发者也无需关注多媒体的数字信号处理过程，只需编写简单的 Javascript 程序即可实现。

<!--more-->

{% codeblock package.json lang:json %}
{
  "name": "WebRTC-demo",
  "description": "A simple WebRTC demo",
  "dependencies": {
    "uuid": "^3.0.1",
    "ws": "^2.1.0"
  }
}
{% endcodeblock %}

{% codeblock server.js lang:javascript %}
const http = require("http");
const uuid = require("uuid");
const util = require("util");
const fs = require("fs");
const url = require('url');
const path = require('path');
const WebSocket = require('ws');

const PORT = 3000; //端口
const dist = "./"; //根目录
const mine = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".js": "text/javascript",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".swf": "application/x-shockwave-flash",
  ".tiff": "image/tiff",
  ".txt": "text/plain",
  ".wav": "audio/x-wav",
  ".wma": "audio/x-ms-wma",
  ".wmv": "video/x-ms-wmv",
  ".xml": "text/xml",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".exe": "application/octet-stream",
  ".md": "text/x-markdown"
};
const default_visit_list = ["index.html", "index.htm", "default.html", "default.htm"];

let default_visit = (request, response, default_visit_file_list, i) => {
  fs.exists(path.join(__dirname, dist, url.parse(request.url).pathname, default_visit_file_list[i]), function (exists) {
    if (exists) { //若index.html存在
      fs.readFile(path.join(__dirname, dist, url.parse(request.url).pathname, default_visit_file_list[i]), "binary", function (err, file) {
        response.writeHead(200, {
          'Content-Type': mine[".html"] || "text/plain"
        });
        response.write(file, "binary");
        response.end();
      });
    } else { //若index.html不存在
      if (default_visit_file_list.length - 1 == i) {
        console.log("\x1B[31mERROR\x1B[39m: " + default_visit_file_list[0] + " is not exists.");
        file_not_found
          (response, request);
      } else {
        default_visit(request, response, default_visit_list, i + 1);
      }
    }
  });
}
let file_not_found = (response, request) => {
  response.writeHead(404, {
    'Content-Type': 'text/plain'
  });
  response.write("This request URL " + url.parse(request.url).pathname + " was not found on this server.");
  response.end();
}
let server = http.createServer((request, response) => {
  let realPath = path.join(__dirname, dist, url.parse(request.url).pathname);
  if (url.parse(request.url).pathname == "/" || url.parse(request.url).pathname.split("/")[url.parse(request.url).pathname.split("/").length - 1].indexOf(".") == -1) { //访问目录为 "/"
    default_visit(request, response, default_visit_list, 0);
  } else { //指定路径
    let ext = path.extname(realPath);
    fs.exists(realPath, exists => {
      if (!exists) { //指定路径的文件不存在
        console.log("\x1B[31mERROR\x1B[39m: " + realPath + " is not exists.");
        file_not_found(response, request);
      } else { //指定路径的文件存在
        fs.readFile(realPath, "binary", (err, file) => {
          response.writeHead(200, {
            'Content-Type': mine[ext] || "text/plain"
          });
          response.write(file, "binary");
          response.end();
        });
      }
    });
  }
});
server.listen(PORT);
server.on('listening', () => {
  console.log("Server runing at http://127.0.0.1:" + server.address().port + ".");
});
server.on('error', () => {
  console.log("Server Listen on " + PORT + " error.");
});
let sockets = new Map();
let socketsID = new Set();
let wss = new WebSocket.Server({ server: server });
wss.on('connection', socket => {
  socket.id = uuid.v4().split("-").join('');
  console.log('connection ' + sockets.size);
  socket.send(JSON.stringify({
    event: "peers",
    data: {
      queue: sockets.size + 1,
      socketID: socket.id,
      socketsID: Array.from(socketsID)
    }
  }));
  for (let item of sockets.entries()) {
    item[1].send(JSON.stringify({
      event: "new_peer",
      data: {
        socketID: socket.id,
        me: item[1].id
      }
    }));
  }
  sockets.set(socket.id, socket);
  socketsID.add(socket.id);
  socket.on('message', msg => {
    console.log(JSON.parse(msg).event + ": " + socket.id + " ---> " + sockets.get(JSON.parse(msg).data.socketID).id);
    if (JSON.parse(msg).event === "msg") {
      for (let item of sockets.entries()) {
        if (item[0] == JSON.parse(msg).data.socketID) continue;
        item[1].send(msg);
      }
    } else {
      sockets.get(JSON.parse(msg).data.socketID).send(msg);
    }
  });
  socket.on("close", () => {
    console.log("delete " + socket.id);
    sockets.delete(socket.id);
    socketsID.delete(socket.id);
    for (let item of sockets.entries()) {
      item[1].send(JSON.stringify({
        event: "close",
        data: {
          socketID: socket.id
        }
      }));
    }
  })
});
{% endcodeblock %}
{% codeblock index.html lang:html %}
<html>
<head>
  <meta charset="UTF-8">
  <style>
    html,
    body {
      margin: 0;
      padding: 0;
    }

    body {
      font-size: 62.5%;
      font-family: Consolas, "Microsoft Yahei";
      height: 100%;
      width: 100%;
      background: url(https://o3cpfaosb.qnssl.com/4874bd3e3bb8e89fd704771c77551f70.png) center center no-repeat;
      background-size: 100% 100%;
      background-attachment: fixed;
    }

    .login {
      display: block;
      font-family: inherit;
      left: 50%;
      top: 50%;
      line-height: 1;
      width: 400px;
      height: 40px;
      position: absolute;
      margin-left: -200px;
      margin-top: -20px;
      box-sizing: border-box;
      border: 1px solid #333;
      font-size: 2rem;
      padding: 3px;
      border-radius: 5px;
    }

    .login:focus,
    .login:active {
      border: 1px solid #333;
    }

    .body {
      width: 960px;
      margin: 0 auto;
    }

    .box {
      width: 100%;
    }

    video {
      float: left;
      width: 420px;
      height: 315px;
      margin: 30px;
      background-color: #333;
      border-radius: 4px;
      width: 420px;
      height: 315px;
      border-radius: 4px;
    }

    .message {
      background-color: #333;
      height: 400px;
      width: 900px;
      margin: 0 auto;
      padding: 3px 10px;
      line-height: 1.2;
      overflow-y: auto;
      overflow-x: visible;
      box-sizing: border-box;
    }

     ::-webkit-scrollbar {
      width: 5px;
      background-color: transparent;
    }

     ::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
      border-radius: 10px;
      background-color: #777;
    }

     ::-webkit-scrollbar-thumb {
      height: 20px;
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
      background-color: #555;
    }

    p {
      margin: 0;
    }

    p .name {
      font-size: 2rem;
    }

    p .name.me {
      color: #12BCD4;
    }

    p .name.other {
      color: #F34E4E;
    }

    p .msg {
      font-size: 1.8rem;
      color: #A9A7A7;
      word-wrap: break-word;
    }

    #msg-ipt {
      display: block;
      margin-left: 30px;
      margin-right: 30px;
      width: 900px;
      box-sizing: border-box;
      height: 40px;
      line-height: 40px;
      font-size: 2rem;
      margin-top: 10px;
      border-radius: 5px;
      border: 0;
      padding: 3px;
    }

    #msg-ipt:active {
      outline: none;
      border: 0;
    }

    .clearfix:after {
      content: ".";
      display: block;
      height: 0;
      clear: both;
      visibility: hidden
    }

    .clearfix {
      *+height: 1%;
    }
  </style>
</head>
<body>
  <div class="body">
    <div class="box clearfix">
      <video id="localVideo" autoplay></video>
    </div>
    <div class="message"></div>
    <input type="text" id="msg-ipt">
  </div>
  <script src="https://cdn.bootcss.com/jquery/2.2.1/jquery.min.js"></script>
  <script src='index.js'></script>
</body>
</html>
{% endcodeblock %}
{% codeblock index.js lang:javascript %}
var iceServer = {
  "iceServers": [{
    url: "stun:115.28.87.181:40167"
  }]
};
var socket = new WebSocket("wss://" + window.location.host); //socket
var localStream = null;
var peerconns = new Map();
var ipt_addevent = false;
socket.onopen = function () {
  socket.onmessage = function (msg) {
    new Promise(function (resolve, reject) {
      if (localStream) {
        resolve(localStream);
      } else {
        navigator.webkitGetUserMedia({
          "audio": true,
          "video": true
        }, function (stream) {
          localStream = stream;
          resolve(stream);
          document.getElementById('localVideo').src = URL.createObjectURL(stream);
        }, function (error) {
          reject(error);
        });
      }
    }).then(function (stream) {
      var json = JSON.parse(msg.data);
      var data = json.data;
      if (!ipt_addevent) {
        ipt_addevent = true;
        var ipt = document.getElementById("msg-ipt");
        ipt.addEventListener("keydown", function (e) {
          if (e.keyCode == 13) {
            socket.send(JSON.stringify({
              event: "msg",
              data: {
                msg: ipt.value,
                socketID: data.socketID
              }
            }));
            $(".message").append("<p><span class=\"name me\">" + data.socketID + ": </span><span class=\"msg\">" + ipt.value + "</span></p>");
            ipt.value = "";
          }
        }, true);
      }
      var createRTCPeerConnection = function (socketID, me) {
        var pc = new webkitRTCPeerConnection(iceServer);
        pc.addStream(stream);
        peerconns.set(socketID, pc);
        pc.onicecandidate = function (event) {
          if (event.candidate !== null) {
            socket.send(JSON.stringify({
              event: "_ice_candidate",
              data: {
                candidate: event.candidate,
                socketID: socketID,
                me: me
              }
            }));
          }
        };
        pc.onaddstream = function (event) {
          $(".box").append("<video id=\"" + socketID + "\" autoplay src='" + URL.createObjectURL(event.stream) + "'></video>")
        };
        return pc;
      }
      switch (json.event) {
      case "new_peer":
        console.log(data.me)
        createRTCPeerConnection(data.me, data.socketID);
        break;
      case 'peers':
        console.log(data.socketsID)
        for (var i in data.socketsID) {
          (function () {
            var otherSocketID = data.socketsID[i];
            console.log(otherSocketID)
            var pc = createRTCPeerConnection(otherSocketID, data.socketID);
            pc.createOffer(function (desc) {
              pc.setLocalDescription(desc);
              socket.send(JSON.stringify({
                event: "_offer",
                data: {
                  sdp: desc,
                  socketID: otherSocketID,
                  me: data.socketID
                }
              }));
            }, function (error) {
              console.log('Failure callback: ' + error);
            });
          })()
        }
        if (data.queue == 1) {
        }
        break;
      case '_ice_candidate':
        var pc = peerconns.get(data.socketID);
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        break;
      case '_offer':
        var pc = peerconns.get(data.socketID);
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        pc.createAnswer(function (desc) {
          pc.setLocalDescription(desc);
          socket.send(JSON.stringify({
            event: "_answer",
            data: {
              sdp: desc,
              socketID: data.me,
              me: data.socketID
            }
          }));
        }, function (error) {
          console.log('Failure callback: ' + error);
        });
        break;
      case '_answer':
        peerconns.get(data.me).setRemoteDescription(new RTCSessionDescription(data.sdp)); //receive answer
        break;
      case "close":
        peerconns.delete(data.socketID);
        $("#" + data.socketID).remove();
        break;
      case "msg":
        $(".message").append("<p><span class=\"name other\">" + data.socketID + ": </span><span class=\"msg\">" + data.msg + "</span></p>");
        break;
      }
    }).catch(function (err) {
      console.log(err);
    });
  }
}
{% endcodeblock %}
