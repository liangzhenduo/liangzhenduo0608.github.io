title: 路由器刷入OpenWrt固件
date: 2015-12-12 12:12:12
tags: [OpenWrt, 路由器, Linux, ssh]
categories: [网络, 科学上网]
photos:
	- https://wiki.openwrt.org/lib/tpl/openwrt/images/logo.png
---

暑假剁手了一台rMBP但没有以太网接口，为了省钱就需要一个无线路由器，之前曾了解到路由器可以刷**OpenWrt**后装上**ShadowSocks**实现自动科学上网，于是就在集训的时候从马云家买了一个二手的[TP-Link TL-WR703N](http://www.tp-link.com.cn/product_225.html)刷上OpenWrt在机房给笔记本供网。

![TL-WR703N](/img/op703n.png)

由于这货只有一个网口，当路由器自动获取IP地址后，就进不去[192.168.1.1](192.168.1.1)的管理界面了，虽然能上网，但每次换网线接头的时候都要捅菊花抹掉原来的设置。因此只有使用静态IP时才能正常使用这种路由器。这学期开学后发现家里有一个[Netgear WNR2200](http://www.netgear.com/home/products/networking/wifi-routers/wnr2200.aspx)在吃灰，于是就把它拿到学校刷上了OpenWrt放宿舍给各种无线设备供网。

![WNR2200](/img/op2200.png)

# 刷入固件
**OpenWrt**是一个适合于嵌入式设备的Linux发行版。它提供了一个可添加软件包的可写的文件系统，使用者可以自由的选择应用程序和配置，并且可以使用一些适合某方面的应用的软件包来定制设备。

## 准备工作
### 路由器
首先你要拥有一台可以刷入OpenWrt的路由器，至于OpenWrt支持那些设备，请到[Supported Devices](https://wiki.openwrt.org/toh/start)页面查看。本文以WNR2200为例。
### 固件
前往[Download](https://downloads.openwrt.org/latest/)下载最新的对应设备的固件。注意固件列表里一半会有两种后缀：`squashfs-factory.img`和`squashfs-sysupgrade.img`，如果是从原厂固件刷到OpenWrt请用前者，如果是从OpenWrt升级请用后者。还有一种可能文件名以`NA`结尾~~，可能是代表`North America`~~，基本上与不带`NA`的没什么区别。
### 环境
还需要一台有以太网接口的电脑和一根网线，电脑操作系统不限，但是*Windows*需要提前开启`TFTP`（因为这个功能系统默认是关闭的），具体操作就是进入`控制面板`-`程序`-`程序和功能`，

![开启TFTP](/img/optftp.png)

打开`打开或关闭Windows功能`窗口，在里面把`TFTP`挑上钩，之后就可以开始了。

## 刷入固件
**刷机有风险，操作需谨慎！**
**刷机有风险，操作需谨慎！**
**刷机有风险，操作需谨慎！**
~~重要的事说三遍~~

首先要将路由器与电脑用网线相连（在后面的设置中网线是必要的），然后进入到路由器管理界面。

有的原厂固件是可以直接升级成OpenWrt的，因此首先进入路由器管理界面，找到固件升级的选项，选择下好的OpenWrt固件上传就可以了，我之前刷TL-WR703N时是可以直接上传的，上传完成重启后就算是刷完了。但我后来刷WNR2200时遇到了不认固件的情况（可能是因为原厂固件的版本问题），于是只好用**TFTP**的方式上传固件，这就是之前为什么要打开Windows中`TFTP`功能的原因。

如果从原厂管理界面中直接上传固件成功，请直接进入下一节；若不认固件，请执行以下步骤：

+ 关闭路由器电源，用笔尖捅住“Restore Factory Settings”~~菊花~~键不放。

+ 打开路由器电源，这时电源黄灯开始闪烁，这时依然**不要松开**RESET键，直到电源灯变为绿色长亮（或闪烁？）才可松手（可能有的路由器的表现不一样，达到类似效果即可），这时路由器已经进入了tftp模式。

+ 将电脑的IP设为`192.168.1.2`，子网掩码设为`255.255.255.0`，将电脑与路由器的**1号LAN口**用网线相连。

+ 从终端进入到要刷的固件所在目录中，假设固件名叫`openwrt.img`，如果在*Windows*下则使用命令：

		tftp -i 192.168.1.1 PUT "openwrt.img"
  
  如果在*OS X*或*Linux*下则在终端里键入`tftp`，之后使用以下命令：
  
		connect 192.168.1.1
		binary
		rexmt 1
		timeout 60
		put "openwrt.img"
  
  稍等片刻，路由器的灯会出现各种变化，直到电源灯又恢复长绿状态（不同路由器或许不同），说明上传完成了。

+ 重启路由器，不出意外之后应该可以通过网页访问[192.168.1.1](192.168.1.1)的`LuCI`管理界面了。

## 开启无线
较新的OpenWrt应该已经自带`LuCI`图形化界面了，因此直接浏览器打开[192.168.1.1](192.168.1.1)就可以看到类似如下界面：

![LuCI](/img/opfirst.png)

当然咯，第一次登入肯定是要先设密码的，毕竟也算是一个Linux系统：

![更改密码](/img/oppasswd.png)

OpenWrt默认是关闭无线网络的，所以到`Network`-`Wifi`下面启用即可：

![启用Wifi](/img/opwifi.png)

之后设置SSID和密码就可以通过无线方式连接了。

# 基本设置

既然要装上软件，自然要从互联网获取，那么路由器当然要联网咯。先到`Network`-`Interfaces`设置WAN口的上网方式，这点和普通路由器没有什么差别，这里不再赘述。

如果觉得英文LuCI使用不便，也可以到`System`-`Software`下找到一个叫`luci-i18n-base-zh-cn`的包装上就行了，当然首先要`Update lists`一下，之后到`System`-`System`下切换成`普通话`再刷新一下就变成中文界面了。

![设置中文](/img/oplucicn.png)

当然，以后要装的部分软件也可以通过上面这种方式安装，但由于有的包官方源里没有，我们在下面使用一种更通用的方法——从命令行安装。

OpenWrt归根结底还是一个**Linux发行版**，所以Linux命令在这里依然适用。

我们还是通过SSH登录：

	ssh root@192.168.1.1
	
输入之前设置的密码后，就会看到OpenWrt特有的终端界面：

	BusyBox v1.23.2 (2015-07-25 15:09:46 CEST) built-in shell (ash)

	  _______                     ________        __
	 |       |.-----.-----.-----.|  |  |  |.----.|  |_
	 |   -   ||  _  |  -__|     ||  |  |  ||   _||   _|
	 |_______||   __|_____|__|__||________||__|  |____|
	          |__| W I R E L E S S   F R E E D O M
	 -----------------------------------------------------
	 CHAOS CALMER (15.05, r46767)
	 -----------------------------------------------------
	  * 1 1/2 oz Gin            Shake with a glassful
	  * 1/4 oz Triple Sec       of broken ice and pour
	  * 3/4 oz Lime Juice       unstrained into a goblet.
	  * 1 1/2 oz Orange Juice
	  * 1 tsp. Grenadine Syrup
	 -----------------------------------------------------
	root@OpenWrt:~# 

先更新一下软件源（和LuCI中的软件包刷新列表是一样的）：

	opkg update
	opkg list-installed
	opkg list

然后就可以按照自己的需求安装要用的软件了。