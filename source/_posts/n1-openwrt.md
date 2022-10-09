title: N1盒子刷入OpenWrt做主路由
date: 2021-08-30 21:11:11
tags: [OpenWrt, N1盒子]
categories: [奇技淫巧, 路由器]
photos: 
	- /img/n1openwrtbanner.png

toc: true
---

# 获取固件

首先从[恩山论坛](https://www.right.com.cn/forum/thread-4076037-1-1.html)上获取最新的flippy大神的固件，从网盘下载一般文件名为**openwrt_s905d_n1_Rxx.xx.xx_kxx.xx.xx-flippy-xx+o.7z**。

关于**+**和**+o**版本的区别请看作者的[帖子](https://www.right.com.cn/forum/thread-4017145-1-1.html)。

解压后得到img文件，用[Etcher](https://www.balena.io/etcher/)或[Rufus](https://rufus.ie/zh/)等工具烧录到U盘中。

# U盘启动
U盘插到N1盒子上电，就应该能直接进入OpenWrt系统。

如果之前刷过电视盒子系统进不去U盘启动，可以先在原系统下连上局域网并查到ip，电脑上adb连接并重启：

	adb connect 192.168.xxx.xxx
	adb shell reboot update

应该就可以进入U盘系统了。

# 修改ip地址
有两种方法：

## HDMI连接显示器
如果hdmi无信号有可能是4K显示器不支持换一台试试。
在显示的终端里编辑**/etc/config/network**，将**lan**的**ipaddr**改成想要的地址（如*192.168.0.1*）并保存。
执行```/etc/init.d/network restart```重启网络生效。

## 连接N1已开启的WiFi
接入盒子自带的无线网（SSID：Phicomm_n1 密码：password），浏览器访问[openwrt/](http://openwrt/)，修改**网络-接口-LAN**里的ip地址即可。

# 常规设置

## 刷入EMMC

可以选择继续用U盘启动，也可以执行`sh /root/install-to-emmc.sh`选择刷入盒子的内置闪存，刷入之前最好用`ddbr`命令备份一下。

## 配置WAN口

在**网络-接口**里设置**WAN**接口（没有就添加一个），宽带拨号就用PPPoE协议；物理设置的接口自定义成**eth0.2**，因为只有一个网口，连到了交换机上的VLAN2上和光猫进行桥接；最后给wan配置防火墙。

## 配置LAN口

协议就是上面设置的静态地址；物理设置指定桥接接口，选中**eth0**和无线网络；给lan配置防火墙。

下面的DHCP服务器高级设置中选中**动态DHCP**和**强制**作为局域网内唯一的DHCP服务器。

## 禁用IPv6 DNS

在**网络-DHCP/DNS**中的高级设置中**禁止解析 IPv6 DNS 记录**，防止在科学上网时梯子只支持IPv4的情况。

## 其他

### 开启UPnP

在**服务-UPnP**里开启，当在局域网里挂一些PCDN服务时会用到。

### 网络加速

在**网络-Turbo ACC 网络加速**里可以适当打开流量分载和BBR。



