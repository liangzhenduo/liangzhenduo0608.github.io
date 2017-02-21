title: 搭建Ngrok内网穿透服务
date: 2016-09-01 21:11:11
tags: [服务器, VPS, OpenWrt, 路由器]
categories: [网络, 网站部署]
photos: 
	- /img/ngbanner.png
---

之前上开源课的时候听说可以通过外网访问局域网电脑获取文件，但由于自己家中的宽带一直不给分配公网地址，所以无法直接访问。

后来又听说可以用[花生壳](http://www.oray.com/)之类的**DDNS**动态解析，即使家中IP总变化也可以通过域名访问。但苦于这样的服务一般是收费的，而且又是使用第三方的服务器容易受制于人，用起来有些不爽，才一直寻找更好的方法。

近日又发现**Ngrok**这样的神器，可以自己搭建内网穿透服务，只用**一台VPS**和**一个域名**就完美地解决了问题。其主要是在客户端与服务端之间建立端到端的隧道进行通信，用固定的域名进行访问以规避了IP变更的不便。

# 服务端
目前[Ngrok官网](https://ngrok.com/)上放出的2.0以上版本是付费的服务，若要自己搭建需要自行编译1.7的源码。首先将源码从[GitHub](https://github.com/inconshreveable/ngrok)上clone下来：

	git clone https://github.com/inconshreveable/ngrok.git

## 编译
由于该服务是*Go语言*编写的，所以先要安装golang开发环境：

	yum install golang
	
然后将`NGROK_DOMAIN`这个变量赋成要使用的域名后面要用到，例如使用如下域名，相应的也要在域名解析里将`shintaku.cc`和`*.shintaku.cc`解析到这台VPS的IP上：

	NGROK_DOMAIN="shintaku.cc"

使用Ngrok官方服务时，下载的客户端使用的是官方证书。我们自己编译服务端和客户端，使用自己的域名也要生成**自签名证书**：

	cd ngrok
	openssl genrsa -out ngrokroot.key 2048
	openssl req -x509 -new -nodes -key ngrokroot.key -subj "/CN=$NGROK_DOMAIN" -days 36500 -out ngrokroot.crt
	openssl genrsa -out snakeoil.key 2048
	openssl req -new -key snakeoil.key -subj "/CN=$NGROK_DOMAIN" -out snakeoil.csr
	openssl x509 -req -in snakeoil.csr -days 36500 -CA ngrokroot.crt -CAkey ngrokroot.key -CAcreateserial -out snakeoil.crt 
	
这样就在当前目录下生成了`ngrokroot.crt`、`ngrokroot.key`、`ngrokroot.srl`、`snakeoil.crt`、`snakeoil.csr`、`snakeoil.key`六个文件，将它们复制到相应的目录中：
	
	cp ngrokroot.crt assets/client/tls/
	cp snakeoil.crt assets/server/tls/
	cp snakeoil.key assets/server/tls/
	
然后就可以开始编译服务端了：

	make release-server

编译好的二进制文件`ngrokd`生成在bin目录下。

## 启动
ngrokd可以在其目录下直接启动，若要想全局使用这个命令可以将其移动到设了环境变量的目录下：

	cp ./bin/ngrokd /usr/sbin/
	
可以先`ngrokd -h`看一下使用说明，然后就可以通过如下命令启动服务端了：

	ngrokd -domain="shintaku.cc" -httpAddr=":80" -httpsAddr=":443"
	
启动要像上面一样加参数指定域名和端口。由于这台VPS我没有搭建Web服务，所以80和443端口没有占用，当然默认也是使用这两个端口的，这样在浏览器访问地址时也省得指定非80端口的麻烦了。出现如下信息就说明启动成功了：

> [16:58:26 CST 2016/09/01] [INFO] (ngrok/log.(\*PrefixLogger).Info:83) [registry] [tun] No affinity cache specified
> [16:58:26 CST 2016/09/01] [INFO] (ngrok/log.Info:112) Listening for public http connections on [::]:80
> [16:58:26 CST 2016/09/01] [INFO] (ngrok/log.Info:112) Listening for public https connections on [::]:443
> [16:58:26 CST 2016/09/01] [INFO] (ngrok/log.Info:112) Listening for control and proxy connections on [::]:4443
> [16:58:26 CST 2016/09/01] [INFO] (ngrok/log.(\*PrefixLogger).Info:83) [metrics] Reporting every 30 seconds
	
另外4443端口用于监听客户端，如有必要也可修改。

# 客户端
## 编译
客户端的编译和服务端类似，但要使用与服务端相同的文件。可以先在本机安装golang环境，再将VPS上的源码拷贝到本机直接用`make release-client`编译；也可以在VPS上加参数编译其他环境的客户端：

### macOS
	
	GOOS=darwin GOARCH=amd64 make release-client

### Windows

	GOOS=windows GOARCH=amd64 make release-client
	
### OpenWrt
由于OpenWrt上没有对应的Go环境，所以没法用ngrok源码直接编译OpenWrt的客户端。但是[dosgo](https://www.v2ex.com/t/176838)大神写了一个*C语言*版本的[ngrok-c](https://github.com/dosgo/ngrok-c)，文档中也附带了[编译方法](http://www.jianshu.com/p/8428949d946c)。但是编译过程比较复杂，而且自己编译出来的二进制文件体积也不小，比较占空间，所以就在恩山上搜了一个民间高手编译好的装上了，顺带着LuCI界面放到服务器上：

	wget https://www.shintaku.cc/files/ngrokc_ba56781152-1_ar71xx.ipk
	wget https://www.shintaku.cc/files/luci-app-ngrokc_git-15.290.16504-8c2fd44-1_all.ipk
	
如果安装时遇到问题请确定路由器上是否已经安装了必要的库：

	opkg install libstdcpp
	opkg install libopenssl
	
## 启动
### PC
先创建配置文件`~/.ngrok`并编辑，写入自己的域名和监听端口：

```sh
server_addr: "shintaku.cc:4443"
trust_host_root_certs: false
```

可以先用`ngrok -h`查看使用说明，然后指定二级域名和要映射的端口启动客户端：

	ngrok -subdomain test 4000
	
就会出现Ngrok的连接状态：
	
> ngrok                                                           (Ctrl+C to quit)

> Tunnel Status                 online
> Version                       1.7/1.7
> Forwarding                    http://test.shintaku.cc -> 127.0.0.1:4000
> Forwarding                    https://test.shintaku.cc -> 127.0.0.1:4000
> Web Interface                 127.0.0.1:4040
> \# Conn                        0
> Avg Conn Time                 0.00ms
	
然后再访问`test.shintaku.cc`就会发现和`localhost:4000`的内容是一样的，就说明Ngrok连接成功了：

![](/img/ngcompare.png)

也可以通过`localhost:4040`的Web页面查看连接状态：

![Inbound Requests](/img/ngrequests.png)

### OpenWrt
路由器上装好了以后可以在`服务`-`Ngrok Settings`下设置：

![OpenWrt](/img/ngluci.png)

除了HTTP协议以外，也可映射TCP其他端口，例如ssh的22端口映射到远程的8022端口：

![OpenWrt](/img/ngssh.png)

这时`ssh root@shintaku.cc -p 8022`和`ssh root@192.168.1.1`的效果是一样的，意味着即使在外面也可以访问没有公网地址的路由器了。更进一步，如果给路由器下连接的设备都分配了固定的局域网IP地址，将它们的端口映射到Ngrok服务器的端口，外网同样可以访问，这样就可以做很多事情了。