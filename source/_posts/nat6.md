title: PandoraBox路由器的IPv6穿透
date: 2017-03-13 13:13:13
tags: [ShadowSocks, OpenWrt, PandoraBox, 科学上网, 路由器, IPv6]
categories: [奇技淫巧, 路由器]
photos:
	- /img/nat6banner.png
---

2015年年底的时候学校升级了校园网的计费系统，当时用的路由器（大概由于配置姿势不对）一直获取不到IPv6地址。好在之后每人每月给了免费5G流量，电脑直接使用IPv6的代理，免费流量只给手机用还算熬的过去，所以就一直没再折腾。直到前些天入手了一个斐讯K2，所以想碰碰运气，结果乱搞了一通就成功了。

最开始拿到学校插上网线总是未连接状态，刷了好几种固件都没用~~，最后发现是网线水晶头接触不良~~。由于OpenWrt对K2的支持还不是很好，可能出现WiFi不稳定的状况，最后我还是刷了一个PandoraBox，但方法是和OpenWrt通用的。

# 获取IPv6地址
首先更改`网络`-`接口`设置。`WAN`选用`DHCP客户端`即可，`WAN6`要用默认的`DHCPv6客户端`，但是要改成**强制**请求IPv6地址并**禁用**请求指定长度的IPv6前缀：

![WAN6](/img/nat6wan6.png)

这时可以重新连接一下看看WAN6是否出现了IPv6地址，如果依旧没有，可以按照[官方文档](https://wiki.openwrt.org/doc/uci/network6?s[]=ipv6&s[]=relay#upstream_configuration_for_wan_interfaces)所说将`wan`的`ipv6`选项设为`1`：

	uci set network.wan.ipv6='1'
	uci commit network
	
再重新连接应当就能获取到IPv6地址了：

![接口总览](/img/nat6interface.png)
	
# 安装NAT6
最早的时候使用6relayd来实现IPv6网络穿透的，但是这个软件很早之前就被弃用了，现在当然不能再使用这么古老的方法了，所以就在网上寻找新的方法，最后根据[官方文档](https://wiki.openwrt.org/doc/howto/ipv6.nat6)发现了通过NAT6使设备获取IPv6地址的方法。

首先安装必要的软件：

	opkg update
	opkg install kmod-ipt-nat6
	
然后把IPv6 ULA前缀改成`d`开头的：

	uci set network.globals.ula_prefix="$(uci get network.globals.ula_prefix | sed 's/^./d/')"
	uci commit network

官方文档对这个操作的解释是*默认前缀是非全局路由的地址，大多路客户端在没有全局IPv6地址的情况下只有IPv4地址，所以需要将前缀改成未使用过的全局地址的样子*。

接下来更改DHCP服务器的设置：

	uci set dhcp.lan.ra_default='1'
	uci commit dhcp
	
之后修改`/etc/sysctl.conf`，将以下内容加进去：

```
net.ipv6.conf.default.forwarding=2
net.ipv6.conf.all.forwarding=2
net.ipv6.conf.default.accept_ra=2
net.ipv6.conf.all.accept_ra=2
```

最后在`/etc/firewall.user`添加防火墙规则：

```
ip6tables -t nat -I POSTROUTING -s $(uci get network.globals.ula_prefix) -j MASQUERADE
```
重启路由器后再次连接看电脑是否已经得到路由器分配的IPv6地址了：

![Network](/img/nat6address.png)

# 安装ShadowSocks
安装ShadowSocks和luci界面：

	opkg update
	opkg install shadowsocks-libev
	opkg install luci-app-shadowsocks
	
然后在`服务`-`ShadowSocks`中配置服务器信息并启用`ss-redir`模式即可：

![ShadowSocks](/img/nat6shadowsocks.png)

