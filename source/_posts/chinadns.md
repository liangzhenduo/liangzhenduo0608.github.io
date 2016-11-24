title: ChinaDNS+ShadowSocks实现路由器透明代理
date: 2016-06-01 18:18:18
tags: [ChinaDNS, ShadowSocks, OpenWrt, 科学上网, 路由器, Linux]
categories: [网络, 科学上网]
photos:
	- /img/dnsbanner.png
---

之前给一个路由器刷了**OpenWrt**在学校上网用，这个月开始学校改计费方式了，索性就拿回家来做透明代理了。之前想使用**GFWlist**来分流结果没成功，所以才折腾一下**ChinaDNS**感觉还是比较简单的，但唯一的弊病是无论境外IP是否被屏蔽都会走代理，这样有些无关痛痒的国外网站访问起来可能会变慢。无论如何，终端设备不再使用代理软件已经方便很多了。

在搞透明代理之前请确保路由器已经安刷好了OpenWrt。具体怎么刷OpenWrt请参见我之前的一篇博文[路由器刷入OpenWrt固件](/posts/openwrt/)。

# 必要软件
首先是在OpenWrt下装上一堆必要软件：

+ shadowsocks-libev-spec
+ luci-app-shadowsocks-spec
+ ChinaDNS
+ luci-app-chinadns

这些都可以在[sourceforge](https://sourceforge.net/projects/openwrt-dist/files/)里找到。如果无法访问也可以下载我备份在服务器上的较老版本：

	wget https://www.shintaku.cc/files/shadowsocks-libev-spec_2.4.6-1_ar71xx.ipk
	wget https://www.shintaku.cc/files/luci-app-shadowsocks-spec_1.4.0-1_all.ipk
	wget https://www.shintaku.cc/files/ChinaDNS_1.3.2-3_ar71xx.ipk
	wget https://www.shintaku.cc/files/luci-app-chinadns_1.4.0-1_all.ipk
	
下载完成后使用`opkg`命令安装，如果当前目录下没有其他文件就直接`opkg install *`就好了。这时刷新一下LuCI界面就会多出`服务`一项了。

![服务](/img/dnsservice.png)

# 配置ChinaDNS
默认配置是这样的：

![ChinaDNS](/img/dnschinadns.png)

其中的设置基本不用动，国内路由表在`/etc/chinadns_chnroute.txt`，最好设置成定期更新，可以在计划任务中添加`crontab`任务：

	0 4 * * * wget -O- 'http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest' | grep ipv4 | grep CN | awk -F\| '{ printf("%s/%d\n", $4, 32-log($5)/log(2)) }' > /etc/chinadns_chnroute.txt
	
这样每天凌晨4点就可以将新的路由表文件写入了。

还有`上游服务器`一项，前面的是对于国内线路的DNS服务器，默认是114基本没什么问题；但是后一个DNS服务器则要求没有污染，默认用的Google的，感觉直接作为DNS不会太理想，所以需要自己在VPS上搭建一个简易的DNS服务器。

简单来说，使用`dnsmasq`比较方便，所以登入VPS服务器，安装dnsmasq并加入开机启动：

	yum install dnsmasq
	systemctl enable dnsmasq

然后编辑配置文件`/etc/dnsmasq.conf`（因为所有内容都注释掉了，所以直接加入下面几行就可以了）：

```ini
port = 5353
server = 8.8.8.8
server = 8.8.4.4
```

保存后运行`dnsmasq`就监听到5353端口了，这样就可以间接地使用Google的DNS了。

回到路由器方面，将`上游服务器`的后一项改为`VPS_ip:5353`保存就可以了。

然后进入`网络`-`DHCP/DNS`，将`基本设置`里的`本地服务器`改为`127.0.0.1#5353`：

![DHCP/DNS](/img/dnsdhcpdns.png)

再到`HOSTS和解析文件`中`忽略解析文件`和`忽略/etc/hosts`保存即可。

# 配置ShadowSocks
`服务器配置`按实际情况填写即可，主要要注意`访问控制`里的`被忽略IP列表`，因为装了ChinaDNS，所以选里面的`ChinaDNS路由表`就行了。如果怕自己的VPS也被代理了，在`额外被忽略IP`里填上自己的VPS地址就好了：

![ShadowSocks](/img/dnsshadowsocks.png)

启动ShadowSocks以后可以用Baidu和Google分别测一下自己的IP地址，如果分别是ISP和VPS的IP应该就没问题了。
	
