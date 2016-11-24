title: VPS搭建ShadowSocks服务
date: 2015-11-11 23:33:33
tags: [ShadowSocks, VPS, 科学上网, 服务器, 代理, Linux]
categories: [网络, 科学上网]
photos:
	- /img/ssbanner.png
---
由于校园网的资费坑得一逼，况且有流量限制，这种感觉甚是让人不爽。之前曾看到郑老湿和陈老湿在VPS搭上VPN免流量上网，后来又在开源课上受到[杜老师](http://www.pufengdu.org/)的启发，决定通过ShadowSocks代理后的IPv6教育网实现**免流量上网**。

ShadowSocks是一个安全的socks5代理，它通过客户端以指定的密码、加密方式和端口连接服务器，成功连接到服务器后，客户端在用户的电脑上构建一个本地socks5代理。使用时将流量分到本地socks5代理，客户端将自动加密并转发流量到服务器，服务器以同样的加密方式将流量回传给客户端，以此实现代理上网。

# 服务器端
## 搭建服务
SSH登录到VPS服务器后要使用pip安装ShadowSocks，所以先装`pip`。

如果服务器是基于Red Hat的系统（CentOS等等），使用命令：

	yum install python-setuptools && easy_install pip
	
如果是基于Debian的系统（Ubuntu等等），使用命令：

	apt-get install python-pip

之后通过pip安装ShadowSocks：
	
	pip install shadowsocks

安装完成后，在`/etc/`下新建一个叫`shadowsocks.json`的配置文件，内容如下：

```json
{
	"server" : "::",
	"server_port" : 8388,
	"local_address" : "127.0.0.1",
	"local_port" : 1080,
	"password" : "PASSWORD",
	"timeout" : 300,
	"method" : "rc4-md5"
}
```
其中`"server"`一栏之所以填`"::"`是为了同时监听IPv4/v6两个端口，因为本文的需求中我们需要双栈连接，如果VPS没有IPv6功能或仅是为了搭梯子用，这里面填写一个IPv4的地址就可以了。`"password"`栏填写自己要设置的密码。至于`"method"`加密方式一栏，主流的有`rc4-md5`和`aes-256-cfb`等等，据说前者速度快，后者更安全，可以根据个人喜好自行权衡。

如果有多个用户需要使用而不想都使用一套端口和密码，可以如下写成多端口配置文件：

```json
{
	"server" : "::",
	"local_address" : "127.0.0.1",
	"local_port" : 1080,
	"port_password":
	{
		"8388":"PASSWORD0",
		"8389":"PASSWORD1",
		"8340":"PASSWORD2"
	},
   	"timeout" : 300,
	"method" : "rc4-md5"
}
```
## 启动服务
保存配置文件后就可以通过以下命令启动和停止ShadowSocks服务了：

	ssserver -c /etc/shadowsocks.json --fast-open -d start
	ssserver -d stop
	
如果发现开启服务后连接不上，可以**停用防火墙**试一下。
	
要是觉得以上命令太长难于记忆，可以在`~/.bashrc`里加入alias：

```bash
alias ssstart='ssserver -c /etc/shadowsocks.json --fast-open -d start'
alias ssstop='ssserver -d stop'
```

保存后记得使用`source ~/.bashrc`命令应用配置，这样就可以每次通过`ssstart`和`ssstop`命令启动或停止服务了。

在CentOS7以后可以用**systemd**的方式启动Shadowsocks，先新建启动脚本`/etc/systemd/system/shadowsocks.service`：

```ini
[Unit]
Description=Shadowsocks

[Service]
TimeoutStartSec=0
ExecStart=/usr/bin/ssserver -c /etc/shadowsocks.json
ExecStop=/usr/bin/ssserver -d stop

[Install]
WantedBy=multi-user.target
```

然后就可以通过`systemctl start shadowsocks`启动了，并通过`systemctl enable shadowsocks`设置开机自启。

# 性能优化
现在我们要祭出TCP加速神器——**锐速**了。

~~锐速是一款免费的TCP底层加速软件~~，可以便捷地完成服务器网络的优化，配合ShadowSocks效果甚好。

首先要去[锐速官网](http://www.serverspeeder.com/)注册。然后在服务器上通过以下命令下载安装：

	wget http://my.serverspeeder.com/d/ls/serverSpeederInstaller.tar.gz
	tar xzvf serverSpeederInstaller.tar.gz
	bash serverSpeederInstaller.sh
	
安装过程中需要填写刚注册的账号密码等，一路回车安装结束。

之后还要编辑配置文件`/serverspeeder/etc/config`，修改以下参数:

```ini
advinacc="1"
maxmode="1"
rsc="1"
gso="1"
```

保存后重启服务就可以了：

	service serverSpeeder restart
	
目前锐速不再开放使用，想用的同学可以到[91云](https://www.91yun.org/en/serverspeeder91yun)寻找新大陆。

# 本地客户端
首先确定你可以获取到IPv6地址，最简便的方法就是打开[六维空间](http://bt.neu.edu.cn/)测试一下，如果可以打开就说明没问题。

## Windows
> [Shadowsocks for Windows](https://github.com/shadowsocks/shadowsocks-windows/releases)

## macOS
> [ShadowsocksX](https://github.com/shadowsocks/shadowsocks-iOS/releases)

## Linux
> [Shadowsocks-Qt5](https://github.com/shadowsocks/shadowsocks-qt5/wiki/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97#linux)

> 也可以按照类似服务端的命令行方式进行启动，将`ssserver`改成`sslocal`即可。

## Android
> [Shadowsocks for Android](https://github.com/shadowsocks/shadowsocks-android/releases)

> 如果能上Google Play也可以从[应用商店](https://play.google.com/store/apps/details?id=com.github.shadowsocks)直接安装。

## OpenWrt
> [shadowsocks-libev](https://sourceforge.net/projects/openwrt-dist/files/shadowsocks-libev/)

各种平台上的服务器配置按照之前服务器端的设置填写即可，但是server地址记得**填写IPv6的**，然后设成全局代理。

这时Google一下自己的[IP](https://www.google.com/#newwindow=1&safe=active&q=ip)，如果地址确实是VPS的地址，就可以开始愉快的上网了。
