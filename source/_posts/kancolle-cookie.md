title: 舰娘更改Cookie直接连接
date: 2016-02-29 22:22:22
tags: [舰队Collection, 游戏]
categories: [ACG, 艦隊これくしょん]
photos: 
	- /img/kcbanner.png
---
> DMM的游戏限制境外玩家登录，因此玩游戏必须要**让DMM认为你是从日本访问的**，境外玩家使用日本的匿名代理是一种常见的手段。而DMM仅仅是在登陆的时候会验证访客的IP地址，因此多了所谓直连的这一种途径。另外，DMM并不会经常改变游戏Token，因此采用任何方法登陆后，都可以通过浏览器的开发者工具将Flash的链接提取出来并保存为书签便可直接登陆游戏。<div style="text-align:right">***———— 萌娘百科***</div>

![地区错误](/img/kcen.png)

之前玩舰娘不是使用ShadowSocks就是使用VPN，后来也曾一度使用改hosts搭配国内VPN的方式（因为只改hosts在有的网络环境下会出现白屏）。觉得这些方式都太繁琐并且过于依赖网络代理，后来就找到一种注入Cookie的方法。

直连方法是利用DMM在大部分时间都不检查用户IP这个特性，通过技术手段绕过IP验证的环节来达到直接连接的目的，更改浏览器或者舰娘辅助工具（比如Poi）的Cookie来使服务器不去验证用户的地域信息。

# 清空Cookie
首先打开[DMM](http://www.dmm.com/)主页并选择语言为**日本语**：

![选择语言](/img/kcjp.png)

然后清一下Cookie：

![删除Cookie](/img/kccookie.png)

# 注入Cookie
打开浏览器**开发者工具**中的**控制台**（在Poi中是**显示**菜单中的**Webview开发者工具**），将以下代码粘贴进去并回车：

	document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=osapi.dmm.com;path=/";
	document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=203.104.209.7;path=/";
	document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=www.dmm.com;path=/netgame/";
	document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=log-netgame.dmm.com;path=/";

![运行代码](/img/kccode.png)

如果出现

	"ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=log-netgame.dmm.com;path=/"
	
则说明注入成功。这时再次进入舰娘的页面[-艦これ-](http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/)则会正常打开：

![舰娘主页](/img/kchome.png)

登陆后就会顺利进入游戏了：

![进入游戏](/img/kcgame.png)

楽しもっ！