title: GFWlist+ShadowSocks实现路由器透明代理
date: 2016-08-06 18:18:18
tags: [GFWlist, ShadowSocks, OpenWrt, 科学上网, 路由器, Linux]
categories: [网络, 科学上网]
photos:
	- /img/gfwbanner.png
---

前两个月OpenWrt一直使用[ChinaDNS+ShadowSocks](/posts/chinadns/)的方式按IP切换代理，但是由于长城宽带非常蛋疼代理时常上不去，导致平时可以正常访问的一些网站也无法访问，得不偿失。于是趁这周换了移动光纤，为了避免发生之前的情况，也把代理方式换成了按[GFWlist](https://github.com/gfwlist/gfwlist)得域名切换。

# 必要软件
首先是在OpenWrt下装上一堆必要软件：

+ ipset
+ iptables-mod-nat-extra
+ libopenssl
+ dnsmasq-full
+ shadowsocks-libev

其中前三个正常安装即可，`dnsmasq-full`需要先卸载预装的`dnsmasq`再安装。

`shadowsocks-libev`可以在[sourceforge](https://sourceforge.net/projects/openwrt-dist/files/shadowsocks-libev/)里找到。如果无法访问也可以下载我备份在服务器上的较老版本（注意软件所适配的架构）：

	wget https://www.shintaku.cc/files/shadowsocks-libev_2.4.8-3_ar71xx.ipk
	
下载完成后使用`opkg install`命令直接安装即可。

# 配置ShadowSocks
编辑`/etc/shadowsocks.json`文件：

```json
{
    "server": "",
    "server_port": 8388,
    "local_port": 1080,
    "password": "",
    "timeout": 300,
    "method": "rc4-md5"
}
```
	
修改`/etc/init.d/shadowsocks`成如下（就是把关于`ss-local`的注释掉再把`ss-redir`的解注释）：

```bash
#!/bin/sh /etc/rc.common

START=95

SERVICE_USE_PID=1
SERVICE_WRITE_PID=1
SERVICE_DAEMONIZE=1

CONFIG=/etc/shadowsocks.json

start() {
	#service_start /usr/bin/ss-local -c $CONFIG -b 0.0.0.0
	service_start /usr/bin/ss-redir -c $CONFIG -b 0.0.0.0
	#service_start /usr/bin/ss-tunnel -c $CONFIG -b 0.0.0.0 -l 5353 -L 8.8.8.8:53 -u
}

stop() {
	#service_stop /usr/bin/ss-local
	service_stop /usr/bin/ss-redir
	#service_stop /usr/bin/ss-tunnel
}
```

之后启动ShadowSocks并设置开机自启：

	/etc/init.d/shadowsocks start
	/etc/init.d/shadowsocks enable
	
# 配置dnsmasq

新建目录`/etc/dnsmasq.d`，并在其中放入`dnsmasq_list.conf`文件，这个文件就是根据GFWlist生成的走代理的域名列表，生成方法已经有大神放在了[GitHub](https://github.com/cokebar/gfwlist2dnsmasq)上，可根据自己的情况进行修改。若是懒得生成，我在服务器上也会每日更新[dnsmasq_list.conf](http://info.shintaku.cc/dnsmasq_list.conf)，里面用的DNS是在这台服务器上搭的dnsmasq，ipset表叫做`gfwlist`。

建议使用自己VPS上的DNS，具体就是在服务器装上dnsmasq，编辑`/etc/dnsmasq.conf`加入：

```bash
port=5353
server=8.8.8.8
server=8.8.4.4
```

保存后运行dnsmasq并设置开机启动就可以间接使用*Google Public DNS*了。

然后编辑路由器上的`/etc/dnsmasq.conf`，在全篇注释后面加一句：

```bash
conf-dir=/etc/dnsmasq.d
```

最后自定义防火墙规则（可在LuCI里直接添加）：

```bash
ipset -N gfwlist iphash
iptables -t nat -A PREROUTING -p tcp -m set --match-set gfwlist dst -j REDIRECT --to-port 1080
```

重启dnsmasq就算完成了：

	/etc/init.d/dnsmasq restart