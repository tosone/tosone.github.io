---
title: "NodeJs 的那点历史"
date: 2019-11-12T22:01:55+08:00
draft: false
contentCopyright: false
categories: [ "Coding" ]
tags: [ "NodeJs" ]
---

2014 年 12 月，多位重量级 Node.js 开发者不满 Joyent 对 Node.js 的管理，自立门户创建了 io.js。io.js 的发展速度非常快，先是于 2015 年 1 月份发布了 1.0 版本，并且很快就达到了 2.0 版本，社区非常活跃。而最近 io.js 社区又宣布，这两个项目将合并到 Node 基金会下，并暂时由 Node.js 和 io.js 核心技术团队联合监督”运营。本文将聊一聊Node.js 项目的一些历史情况，与 io.js 项目之间的恩怨纠葛，他们将来的发展去向。希望能从历史的层面去了解这个开源项目在运营模式上是如何演变和发展的。

<!--more-->

自从 JavaScript 被 Brendan Eich 创造出来后，除了应用在浏览器中作为重要的补充外，人类从来就没有放弃过将 JavaScript 应用到服务端的想法。这些努力从 livewired 项目（1994 年 12 月）开始，就从来没有停止过。如果你不知道 livewired，那应该知道 ASP 中可以使用 JScript 语言（1996 年），或者 Rhino。但直到 2009 年，这些服务端 JavaScript 技术与同样应用在服务端的 Java、PHP 相比，显得相对失色。

谈到 Node.js 的由来，不可避免要聊到它的创始人 Ryan Dahl。在 2009 年时，服务端 JavaScript 迎来了它的拐点，因为 Ryan Dahl 带来了 Node.js，在那之后 Node.js 将服务端 JavaScript 带入了新的境地，大量的 JavaScript 在 GitHub 上被贡献出来，大量的 JavaScript 模块出现，出现了真正的繁荣。

Node.js 不是凭空出现的项目，也不是某个 Web 前端工程师为了完成将 JavaScript 应用到服务端的理想而在实验室里捣鼓出来的。它的出现主要归功于 Ryan Dahl 历时多年的研究，以及一个恰到好处的节点。2008 年 V8 随着 Chrome 浏览器的出世，JavaScript 脚本语言的执行效率得到质的提升，这给 Ryan Dahl 带来新的启示，他原本的研究工作与 V8 之间碰撞出火花，于是带来了一个基于事件的高性能 Web 服务器。

![img](https://tc.tosone.cn/20191112221504.png)

上图为 Node.js 创始人 Ryan Dahl。

Ryan Dahl 的经历比较奇特，他并非科班出身的开发者，在 2004 年的时候他还在纽约的罗彻斯特大学数学系读博士，期间有研究一些分形、分类以及 p-adic 分析，这些都跟开源和编程没啥关系。2006 年，也许是厌倦了读博的无聊，他产生了『世界那么大，我想去看看』的念头，做出了退学的决定，然后一个人来到智利的 Valparaiso 小镇。那时候他尚不知道找一个什么样的工作来糊口，期间他曾熬夜做了一些不切实际的研究，如如何通过云进行通信。下面是这个阶段他产出的中间产物，与后来苹果发布的 iCloud 似乎有那么点相似。

![img](https://tc.tosone.cn/20191112221520.png)

从那起，Ryan Dahl 不知道是否因为生活的关系，他开始学习网站开发了，走上了码农的道路。那时候 Ruby on Rails 很火，他也不例外的学习了它。从那时候开始，Ryan Dahl 的生活方式就是接项目，然后去客户的地方工作，在他眼中，拿工资和上班其实就是去那里旅行。此后他去过很多地方，如阿根廷的布宜诺斯艾利斯、德国的科隆、奥地利的维也纳。

Ryan Dahl 经过两年的工作后，成为了高性能 Web 服务器的专家，从接开发应用到变成专门帮客户解决性能问题的专家。期间他开始写一些开源项目帮助客户解决 Web 服务器的高并发性能问题，尝试过的语言有 Ruby、C、Lua。当然这些尝试都最终失败了，只有其中通过 C 写的 HTTP 服务库 libebb 项目略有起色，基本上算作 libuv 的前身。这些失败各有各的原因，Ruby 因为虚拟机性能太烂而无法解决根本问题，C 代码的性能高，但是让业务通过 C 进行开发显然是不太现实的事情，Lua 则是已有的同步 I/O 导致无法发挥性能优势。虽然经历了失败，但 Ryan Dahl 大致的感觉到了解决问题的关键是要通过事件驱动和异步 I/O 来达成目的。

在他快绝望的时候，V8 引擎来了。V8 满足他关于高性能 Web 服务器的想象：

1. 没有历史包袱，没有同步 I/O。不会出现一个同步 I/O 导致事件循环性能急剧降低的情况。
2. V8 性能足够好，远远比 Python、Ruby 等其他脚本语言的引擎快。
3. JavaScript 语言的闭包特性非常方便，比 C 中的回调函数好用。

于是在 2009 年的 2 月，按新的想法他提交了项目的第一行代码，这个项目的名字最终被定名为 “node”。

2009 年 5 月，Ryan Dahl 正式向外界宣布他做的这个项目。2009 年底，Ryan Dahl 在柏林举行的 JSConf EU 会议上发表关于 Node.js 的演讲，之后 Node.js 逐渐流行于世。

以上就是 Node.js 项目的由来，是一个专注于实现高性能 Web 服务器优化的专家，几经探索，几经挫折后，遇到 V8 而诞生的项目。

### Node.js 项目的组织架构和管理模式

Node.js 随着 JSConf EU 会议等形式的宣传下，一家位于硅谷的创业公司注意到了该项目。这家公司就是 Joyent，主要从事云计算和数据分析等。Joyent 意识到 Node.js 项目的价值，决定赞助这个项目。Ryan Dahl 于 2010 年加入该公司，全职负责 Node.js 项目的开发。此时 Node.js 项目进入了它生命历程里的第二个阶段：从个人项目变成一个公司组织下的项目。

这个阶段可以从 2010 年 Ryan Dahl 加入 Joyent 开始到 2014 年底 Mikeal Rogers 发起 Node Forward 结束，Node 的版本也发展到了 v0.11。这个时期，IT 业中的大多数企业都关注过 Node.js 项目，如微软甚至对于 Node.js 对 Windows 的移植方面做过重要的贡献。

这个时期可以的组织架构和管理模式可以总结为“Gatekeeper ＋ Joyent”模式。

Gatekeeper 的身份类似于项目的技术负责人，对技术方向的把握是有绝对权威。历任的 Gatekeeper 为：Ryan Dahl、Isaac Z. Schlueter、Timothy J Fontaine，均是在 Node.js 社区具有很高威望的贡献者。项目的法律方面则由 Joyent 负责，Joyent 注册了“Node.js”这个商标，使用其相关内容需要得到法律授权（如笔者《深入浅出 Node.js》上使用了 Node.js 的 Logo，当时是通过邮件的形式得到过授权）。技术方面除了 Gatekeeper 外，还有部分 core contributor。core contributor 除了贡献重要 feature 外，帮助项目进行日常的 patch 提交处理，协助 review 代码和合并代码。项目中知名的 core contributor 有 Ben Noordhuis，Bert Belder、Fedor Indutny、Trevor Norris、Nathan Rajlich 等，这些人大多来自 Joyent 公司之外，他们有各自负责的重要模块。Gatekeeper 除了要做 core contributor 的事情外，还要决定版本的发布等日常事情。

Node.js 成为 Joyent 公司的项目后，Joyent 公司对该项目的贡献非常大，也没有过多的干涉 Node.js 社区的发展，还投入了较多资源发展它，如 Ryan Dahl、Isaac Z. Schlueter、Timothy J Fontaine 等都是 Joyent 的全职员工。

### Node.js 社区的分裂

“Gatekeeper ＋ Joyent” 模式运作到 2013 年的时候都还工作良好，蜜月期大概中止于第二任 Gatekeeper Isaac Z. Schlueter 离开 Joyent 自行创建 npm inc. 公司时期。前两任 Gatekeeper 期间，Node.js 的版本迭代都保持了较高的频率，大约每个月会发布一个小版本。在 Isaac Z. Schlueter 卸任 Gatekeeper 之后，Node.js 的贡献频率开始下降，主要的代码提交主要来自社区的提交，代码的版本下降到三个月才能发布一个小版本。社区一直期待的 1.0 版本迟迟不能发布。这个时期 Node.js 属于非常活跃的时期，但是对于 Node.js 内核而言却进展缓慢。技术方向上似乎是有些不明朗，一方面期待内核稳定下来，一方面又不能满足社区对新 feature 的渴望（如 ES6 的特性迟迟无法引入）。

第三任的 Gatekeeper Timothy J Fontaine 本人也意识到这个问题。从他上任开始，主要的工作方向就是解决该问题。他主要工作是 Node on the road 活动，通过一系列活动来向一些大企业用户获取他们使用 Node.js 的反馈。通过一些调研，他做了个决定，取消了贡献者的 CLA 签证，让任何人可以贡献代码。

尽管 Timothy J Fontaine 的做法对 Node.js 本身是好的，但是事情没有得到更好的改善。这时候 Node.js 项目对社区贡献的 patch 处理速度已经非常缓慢，经常活跃的 core contributor 只有 Fedor Indutny、Trevor Norris。另外还发生了人称代词的事件，导致Node.js/libuv 项目中非常重要的贡献者Ben Noordhuis 离开core contributor 列表，这件事情被上升到道德层面，迎来了不少人的谩骂。其中Joyent 的前任CEO 甚至还致信表示如果是他的员工，会进行开除处理。这致使Node.js 项目的活跃度更低。Node.js 的进展缓慢甚至让社区的知名极客 [TJ Holowaychuk](https://github.com/tj) 都选择离开 Node.js 而投入Go 语言的怀抱。

可以总结这个时期是“Gatekeeper ＋ Joyent”模式的末期。Joyent 对于项目的不作为和其他层面对社区其他成员的干预，导致项目进展十分缓慢，用蜗牛的速度来形容一点也不为过。尽管 Timothy J Fontaine 试图挽回些什么，也有一些行为来试图重新激活这个项目的活力，但是已经为时已晚。

这时一个社区里非常有威望的人出现了，他就是 Mikeal Rogers。Mikeal Rogers 的威望不是建立在他对 Node.js 项目代码的贡献上，他的威望主要来自于 request 模块和 JSConf 会议。其中 JSConf 是 JavaScript 社区最顶级的会议，他是主要发起人。

在 2014 年 8 月，以 Mikeal Rogers 为首，几个重要 core contributor 一起发起了一个叫做“Node forword”的组织。该组织致力于发起一个由社区自己驱动来提升 Node、JavaScript 和整个生态的项目。

![img](https://tc.tosone.cn/20191112221727.png)

“Node forword”可以视作是 io.js 的前身。这些 core contributor 们在“Node forword”上工作了一段时间，后来因为可能涉及到 Node 这个商标问题，Fedor Indutny 愤而 fork 了 Node.js，改名为 io.js，宣告了 Node.js 社区的正式分裂。

简单点来说这件事情主要在于社区贡献者们对于 Joyent 公司的不满，导致这些主要贡献者们想通过一个更开放的模式进行协作。复杂点来说这是公司开源项目管理模式的问题所在，当社区方向和公司方向一致时，必然对大家都有好处，形同蜜月期，但当两者步骤不一致时，分歧则会暴露出来。这点在 Node.js 项目的后期表现得极为明显，社区觉得项目进展缓慢，而 Joyent 公司的管理层则认为他稳定可靠。

### io.js 与 Node.js advisory board

在“Node Forward”的进展期间，社区成员们一起沟通出了一个基本的开放的管理模式。这个模式在 io.js 期间得到体现。

![img](https://tc.tosone.cn/20191112221815.png)

io.js 的开放管理模式主要体现在以下方面：

- 不再有 Gatekeeper。取而代之的是 TC（Technical Committee），也就是技术委员会。技术委员会基本上是由那些有很多代码贡献的 core contributor 组成，他们来决定技术的方向、项目管理和流程、贡献的原则、管理附加的合作者等。当有分歧产生时（如引入 feature），采用投票的方式来决定，遵循少数服从多数的简单原则。基本上原来由一个人担任的 Gatekeeper 现在由一个技术委员会来执行。如果要添加一个新成员为 TC 成员，需要由一位现任的 TC 成员提议。每个公司在 TC 中的成员不能超过总成员的 1/3。
- 引入 Collaborators。代码仓库的维护不仅仅局限在几个 core contributor 手中，而是引入 Collaborators，也就是合作者。可以理解为有了更多的 core contributor。
- TC 会议。之前的的沟通方式主要是分布式的，大家通过 GitHub 的 issue 列表进行沟通。这种模式容易堆积问题，社区的意见被接受和得到处理取决于 core contributor 的情况。io.js 会每周举行 TC 会议，会议的内容主要就 issue 讨论、解决问题、工作进展等。会议通过 Google Hangout 远程进行，由 TC 赞同的委任主席主持。会议视频会发布在 YouTube 上，会议记录会提交为文档放在代码仓库中。
- 成立工作组。在项目中成立一些细分的工作组，工作组负责细分方向上的工作推进。

io.js 项目从 fork 之后，于 2015-01-14 发布了 v1.0.0 版本。自此 io.js 一发不可收拾，以周为单位发布新的版本，目前已经发布到 2.0.2。io.js 项目与 Node.js 的不同在行为上主要体现在以下方面：

- 新功能的激进。io.js 尽管在架构层面依然保持着 Node.js 的样子（由 Ryan Dahl 时确立），但是对于 ECMAScript 6 持拥抱态度。过去在 Node.js 中需要通过 flag 来启用的新功能，io.js 中不再需要这些 flag。当然不用 flag 的前提是 V8 觉得这个 feature 已经稳定的情况下。一旦最新的 Chrome 采用了新版本的 V8，io.js 保持很快的跟进速度。
- 版本迭代。io.js 保持了较高频率的迭代，以底层 API 改变作为大版本的划分，但对于小的改进，保持每周一个版本的频率。只要是改进，io.js 项目的 TC 和 Collaborators 都非常欢迎，大到具体 feature 或 bug，小到文档改进都可以被接受，并很快放出版本。
- issue 反馈。Node.js 的重要的贡献者们都在 io.js 上工作，Node.js 和 io.js 项目的问题反馈速度几乎一致，但是问题处理速度上面 io.js 以迅捷著称，基本在 2-3 天内必然有响应，而 Node.js 则需要 1 个礼拜才有回复。

基本上而言原本应该属于 Node.js 项目的活力现在都在 io.js 项目这里。如果没有其他事情的发生，io.js 可以算作社区驱动开源项目的成功案例了。

当然，尽管在 Node.js 这边进展缓慢，但 Joyent 方面还是做出了他们的努力。在“Node Forward”讨论期间，Joyent 成立了临时的 Node.js 顾问委员会 <https://nodejs.org/about/advisory-board/> 。顾问委员会的主要目标与“Node Forward”的想法比较类似，想借助顾问委员会的形式来产出打造一个更加开放的管理模式，以找到办法来平衡所有成员的需要，为各方提供一个平台来投入资源到 Node.js 项目。

顾问委员会中邀请了很多重要的 Contributor 和一些 Node.js 重度用户的参与。开了几次会议来进行探讨和制定新的管理模式。于是就出现了一边是 io.js 如火如荼发布版本，Joyent 这边则是开会讨论的情况。顾问委员会调研了 IBM（Eclipse）、Linux 基金会、Apache 等，决定成立 Node.js 基金会的形式。

### io.js 与 Node.js 基金会

时间来到 2015 年 1 月，临时委员会正式发布通告决定将 Node.js 项目迁移到基金会，并决定跟 io.js 之间进行和解。简单点来说 Node.js 方面除了版本的进展比较缓慢外，确实是在制定一个新的模式来确保 Node.js 项目的下一步发展，Joyent 公司本着开放的原则，也做出相当大的让步，保持着较为和谐的状态。

然而 io.js 动作太快，代码的进展程度远远快于 Node.js 项目，和解的讨论从 2 月开始讨论，到 5 月才做出决定。这时 io.js 已经发布了它的 2.0 版本。

最终的结论是 Node.js 项目和 io.js 项目都将加入 Node.js 基金会。Node.js 基金会的模式与 io.js 较为相似，但是更为健全。Mikeal Rogers 在他的一篇名为《Growing Up》的文章中提到io.js 项目需要一个基金会的原因。

io.js 项目在技术方面的成熟度显然要比最初的 Gatekeeper 时代要更为先进，给予贡献者更多的管理权利。然而在市场和法律方面，还略显幼稚。最终无论是顾问委员会，还是 io.js 都选定以基金会的形式存在。这个基金会参考 Linux 基金会的形式，由董事会和技术委员会组成，董事会负责市场和法律方面的事务，技术委员会负责技术方向。

![img](https://tc.tosone.cn/20191112222041.png)

就像《三国演义》所述：天下大势，合久必分，分久必合。Node.js 项目也从 Joyent 公司的怀里走出来，成长为基金会的形式，进入这个项目生命周期里第三个阶段。

### 后续

从 io.js 的分裂到 Node.js 基金会，从外人看起来似乎如一场闹剧一般，然而这个过程中可以看到一个开源项目自身的成长。尽管 io.js 将归于 Node.js 基金会，像一个离家出走的孩子又回家一般，它的出走可能要被人忘记，但从当初的出发点来说，这场战役，io.js 其实是赢家。穷则思变、不破不立是对 Joyent 较为恰当的形容。如果 Joyent 能提前想到这些，则不会有社区分裂的事情发生。

Node.js 处于停滞状态的开发和 io.js 的活跃情况之间，目前免不了大量的 Merge 工作。作为和解的条件之一，Node.js 基金会之后 Node 版本的发布将基于目前 io.js 的进展来进行。后续的合并工作示意如下：

![img](https://tc.tosone.cn/20191112222140.jpg)

在未完成合并之前，io.js 会继续保持发布。Node.js 的下个大版本跨过 1.0，直接到 2.0。

io.js 项目的 TC 将被邀请加入 Node.js 基金会的 TC，毕竟两者在技术管理方面达成了一致。基金会将在黄金和白银会员中选举出董事、技术委员会成员中选举出技术委员主席。

对于成为 Node.js 基金会成员方面，企业可以通过赞助的方式注册成为会员。

### 总结

一个开源项目成长起来之后，就不再是当初创始人个人维护的那个样子了。Node.js 项目的发展可以说展现了一个开源项目是如何成长蜕变成成熟项目的。当然我们现在说 Node.js 基金会是成功的还为时尚早，但是祝福它。

### 参考文档

- <https://github.com/joyent/node/issues/9295>
- <https://github.com/iojs/io.js/issues/978>
- <https://github.com/iojs/io.js/issues/1336>
- <https://github.com/iojs/io.js/issues/1416>
- <https://github.com/iojs/io.js/labels/meta>
- <http://blog.nodejs.org/2015/05/08/transitions/>
- <http://blog.nodejs.org/2015/05/08/next-chapter/>
- <https://github.com/iojs/io.js/issues/1664>
- <http://tinyclouds.org/nodeconf2012.pdf>
- <https://www.joyent.com/blog/introducing-the-nodejs-foundation>
- <http://blog.nodejs.org/2015/05/15/node-leaders-are-building-an-open-foundation/>
- <https://medium.com/node-js-javascript/growing-up-27d6cc8b7c53>
