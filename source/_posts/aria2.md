title: 使用aria2多线程下载
date: 2015-12-03 23:33:33
tags: [下载, Unix, Linux]
categories: [奇技淫巧, ＊nix]
photos: 
	- /img/arbanner.png
---
**aria2**是一款轻量级多线程的命令行下载工具，支持**HTTP/HTTPS**、**FTP**、**SFTP**、**BitTorrent**和**Metalink**等多种下载方式。程序支持Mac OS X、Linux、Windows等多平台。

这个下载器最大的优点就是多线程。最开始接触它的时候是因为在Mac下下载百度云的资源非常不方便，不借助其他工具只能通过浏览器下载，而且一个线程速度超慢，一不小心就会下载失败。后来从知乎上看到这个神器，~~用了*金坷垃*，~~速度**一千八**。

# 下载安装
首先到[GitHub](https://github.com/tatsuhiro-t/aria2/releases)下载对应系统的安装文件进行安装；如果在macOS下也可以通过`homebrew`安装：

	brew install aria2

# 配置文件
先新建一个配置文件叫`aria2.conf`：

	mkdir ~/.aria2
	vi ~/.aria2/aria2.conf
	
放在这个目录下的主要原因是可以在启动时不再指定其配置文件的位置。然后编辑它：

```ini
# Basic Options
dir=/Users/$USER/Downloads
input-file=/Users/$USER/.aria2/session.dat
log=/Users/$USER/.aria2/aria2.log
max-concurrent-downloads=15
max-connection-per-server=15
check-integrity=true
continue=true

# BitTorrent/Metalink Options
bt-enable-lpd=true
bt-max-open-files=16
bt-max-peers=8
dht-file-path=/opt/var/aria2/dht.dat
dht-file-path6=/opt/var/aria2/dht6.dat
dht-listen-port=6801
#enable-dht6=true
listen-port=6801
max-overall-upload-limit=0K
seed-ratio=0

# RPC Options
enable-rpc=true
rpc-allow-origin-all=true
rpc-listen-all=true
rpc-listen-port=6800
#rpc-secret=123456
#rpc-secure=true

# Advanced Options
daemon=true
disable-ipv6=true
#enable-mmap=true
force-save=true
file-allocation=none
log-level=warn
max-overall-download-limit=0K
save-session=/Users/$USER/.aria2/session.dat
always-resume=true
split=10
min-split-size=10M

# Pan.baidu.com
user-agent=netdisk;5.2.6;PC;PC-Windows;6.2.9200;WindowsBaiduYunGuanJia
referer=http://pan.baidu.com/disk/home
```
配置文件中所有`$USER`要改成自己的用户名，`dir`参数设置的是下载路径，也可以按自己的习惯更改；`input-file`、`save-session`参数是指定session（保存下载进度）的存储位置，如果没有那个文件可以手动创建：

	touch session.dat

`log`参数指定log路径，会自动生成。这时可以通过`aria2c`命令启动服务了。可以通过`ps aux | grep aria2c`命令检查是否启动成功。如果没有正常启动可以检查一下log。

# 开机启动
若要配置macOS开机启动，可以在`~/Library/LaunchAgents`下创建一个plist文件`homebrew.mxcl.aria2.plist`，内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>homebrew.mxcl.aria2</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>Program</key>
    <string>/usr/local/opt/aria2/bin/aria2c</string>
  </dict>
</plist>
```

# 配置GUI
由于aria2是一个命令行工具，所以在没有其他辅助的情况下需要通过命令行来操作。具体使用方法请参阅[aria2.github.io](https://aria2.github.io/)。

为了更加便于使用，GitHub上的[ziahamza](https://github.com/ziahamza)开发了一个WebUI，可以通过网页界面来操作aria2：

![WebUI](/img/arui.png)	

简单来说就是打开[http://ziahamza.github.io/webui-aria2/](http://ziahamza.github.io/webui-aria2/)就能使用了。也可以将[项目源码](https://github.com/ziahamza/webui-aria2/archive/master.zip)下载下来放到本地或者放到自己的服务器上来用，比如[http://aria.shintaku.cc/](http://aria.shintaku.cc/)。

打开以后如果右上角出现：

![连接成功](/img/arsuccess.png)	
	
就说明连接成功了，这时就可以直接输入下载链接下载了。

如果连接不成功请到`Setting`-`Connection Setting`检查端口是不是6800，并且确保6800端口没被别的服务占用：

![连接设置](/img/arsetting.png)	

# 百度网盘插件
百度网盘如果使用普通下载的话~~可能得到的是一个临时的链接？~~不能断点续传，所以需要一个叫[BaiduExporter](https://chrome.google.com/webstore/detail/baiduexporter/mjaenbjdjmgolhoafkohbhhbaiedbkno)的Chrome插件像百度云的客户端一样获取地址。如果Chrome商店被墙了也可以到[GitHub](https://github.com/acgotaku/BaiduExporter/blob/master/BaiduExporter.crx?raw=true)上直接下载`crx`文件手动添加。

添加成功后再打开百度云会发现多了一个`导出下载`按钮：

![导出下载](/img/arbaiduyun.png)	

打开`设置`，按照如下设置：

![导出设置](/img/aryunsetting.png)

其中`User-agent`需要设置为`netdisk;5.2.7;PC;PC-Windows;6.2.9200;WindowsBaiduYunGuanJia`，`referer`设置为`http://pan.baidu.com/disk/home`，将aria2伪装成百度云管家来解除限速。

应用后选择百度云上的文件，通过`导出下载`-`ARIA2 RPC`：

![下载成功](/img/ardownload.png)

这时再通过WebUI查看应当已经有新添加的任务以一千八的速度在下载了。