title: macOS启用TFTP服务
date: 2018-08-18
tags: [macOS]
categories: [奇技淫巧, macOS]
photos:
	- /img/mactftpbanner.png
toc: false
---
TFTP在路由器刷机中被普遍使用，因为其协议简单，可以通过少量存储器实现。在PC上打开Windows功能就可启用。其实macOS也自带TFTP，只不过是没有自动启用。

TFTP默认使用的目录是`/private/tftpboot`，首先给其增加权限：

	sudo chmod -R 777 /private/tftpboot

然后启用服务：

	sudo launchctl load -F /System/Library/LaunchDaemons/tftp.plist
	sudo launchctl start com.apple.tftpd

如果觉得命令行方式不直观，macOS上也有类似Windows上的Tftpd32的应用[TFTP Server](http://ww2.unime.it/flr/tftpserver/)，直接下载安装即可：

![](/img/mactftpserver.png)

TFTP的目录也可以在应用中修改。
