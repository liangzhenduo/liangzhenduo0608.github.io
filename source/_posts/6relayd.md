title: OpenWrt路由器的IPv6代理
date: 2015-12-15 15:15:15
tags: [ShadowSocks, OpenWrt, 科学上网, 路由器, IPv6]
categories: [奇技淫巧, 路由器]
photos:
	- /img/6rbanner.png
---

之前本来是想用路由器获取IPv6地址并使用双栈连接的代理服务器访问互联网。虽然之前网件自己的固件是有**穿透模式**并可以获取v6地址，但是无法安装ShadowSocks，所以才刷成了OpenWrt。但是这个固件默认是没有**穿透模式**的，所以需要自己配一发。

现在我们需要用到以下软件：

+ shadowsocks-libev-spec
+ luci-app-shadowsocks-spec
+ 6relayd

# 安装ShadowSocks
在OpenWrt上我们可以安装`shdowsocks-libev`版本，顺便搭配LuCI界面的`luci-app`使用，这个项目在[sourceforge](https://sourceforge.net/projects/openwrt-dist/files/shadowsocks-libev/)有发布，可以从这里下载最新的。下载完成后使用`opkg`命令安装：

	opkg install shadowsocks-libev-spec_2.4.6-1_ar71xx.ipk
	opkg install luci-app-shadowsocks-spec_1.4.0-1_all.ipk

安装完成后`reboot`命令重启路由器，再次进入LuCI界面可以看到多了一个`Services`-`ShadowSocks`：

![ShadowSocks](/img/opss.png)

就说明安装正确，在里面输入ShadowSocks服务器信息就可以自动代理了，凡是连上这台路由器的设备获取到的都是代理后的网络了。

# 安装6relayd
由于现在即使通过代理上网也是消耗校内流量的，为了不走流量，我们只能借助IPv6网络。但是普通的路由器很少可以正常获取IPv6地址，即使路由器能获取到连接设备也很难获取，除了NETGEAR的部分路由器（包括WNR2200）的新版固件是有IPv6连接的，并且本人亲测使用`穿透模式`可以正常使用IPv6网络。所以我希望在OpenWrt上也能使用`穿透模式`，再通过ShadowSocks代理IPv6网络就可以免流量访问外网了。

要使用`穿透模式`就少不了[6relayd](https://wiki.openwrt.org/doc/uci/6relayd)这个软件。可是官方源如今没提供这个包，于是可以获取我的备份并安装：

	wget https://www.shintaku.cc/files/6relayd_2013-10-21_ar71xx.ipk
	opkg install 6relayd_2013-10-21_ar71xx.ipk

安装完成之后编辑`/etc/config/6relayd`文件在默认配置后面加一组：

```sh
config relay
	option master   'wan'
	option network  'lan'
	option rd       'relay'
	option dhcpv6   'relay'
	option ndp      'relay'
```
保存后使用下面的命令开启服务并设置为开机启动即可：

	/etc/init.d/6relayd start
	/etc/init.d/6relayd enable

# 配置路由器
现在要到LuCI界面下找到`Network`-`Interfaces`并添加一个新的接口：

![Add new interface](/img/opnew.png)

接口名叫`wan6`，协议选择`DHCPv6 client`，接口自定义为`@wan`：

![wan6](/img/opwan6.png)

保存应用后重启路由器，就会发现多了一个WAN6接口，并且WAN口获取到IPv6地址了：

![IPv6地址](/img/opipv6.png)

这时回到ShadowSocks的配置界面，将服务器地址改为VPS的IPv6地址就可以了：

![ShadowSocks设置](/img/opsss.png)

记得要开全局代理，因为毕竟PPPoE拨着号呢，~~在校园网11月30日改革后有线网拨号后不用登录就能上网让我很慌啊，路由器一直连着网终归是有偷跑流量的风险，所以打开IPv6全局代理最为保险，使得能通过代理的IPv6网络可以使用而IPv4网络因为通不过代理无法使用。~~2016年春季学期开学后发现即使拨号路由器也无法获取IPv6地址了。

于是现在得到的效果就是任何连接到这台路由器的设备无需任何登录即可**访问外网**，而且**不消耗校内网流量**，网络还**自带科学上网Buff**，从此妈妈再也不用担心我流量不够用了。
