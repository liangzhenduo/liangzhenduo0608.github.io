title: 使用adb工具刷机
date: 2016-07-07 21:11:11
tags: [Android, 刷机]
categories: [奇技淫巧, Android]
photos: 
	- /img/adbbanner.png
---

今天刷机小王子**一加3**终于给送来了，趁此机会总结一下之前用过的`adb`命令备查。

之前曾经用过Odin线刷、卡刷等方式，直到接触了**Android Debug Bridge**才发现命令行的强大。

首先通过Homebrew安装adb工具：
	
	brew install android-platform-tools

# OEM解锁
拿到一部新机一般OEM是上锁的。为了刷机我们需要对Bootloader进行解锁。这个过程会清除设备中的数据，所以需要提前进行备份。

首先进入**关于手机**连击**版本号**打开**开发者模式**，然后进入**开发者模式**打开**OEM解锁**，顺便将**USB调试**也打开。

这时用数据线将手机与电脑相连进行USB调试，在命令行里输入：

	adb devices
	
如果设备列表中出现Android设备则说明连接成功，接着输入：

	adb reboot bootloader
	
设备会重启到bootloader，此时使用命令：

	fastboot oem unlock

在手机上进行确认后就解锁了bootloader。

# 刷入Recovery
设备自带的Recovery一般可能不如第三方的功能强大，这里推荐一个叫**TWRP**的Recovery，因为如果要刷Gapps的话可能需要用到它。首先到[TeamWin](https://twrp.me/)下载对应设备的recovery包。

接着通过`adb reboot bootloader`进入bootloader，再输入：

	fastboot flash recovery Recovery.img
	
就刷入新的recovery了，再通过`fastboot reboot`重启就可以了。

# 刷入ROM
先通过命令使设备重启为recovery模式：

	adb reboot recovery

如果是刷入新系统建议先*四清*（System、Data、Cache、Dalvik Cache），如果是升级系统建议先*三清*（Data、Cache、Dalvik Cache），如果希望保留数据，*双清*（Cache、Dalvik Cache）就可以了。无论怎样最好都先备份数据。

首先将对应的ROM下载到电脑上。然后到手机上进入TWRP的`Advanced`，选择`ADB Sideload`。在电脑终端输入：

	adb sideload ROM.zip

等待刷完就可以了。刷完后建议双清一下再重启。

# 刷入GAPPS（可选）
如果想要装上Google全家桶，在刷完ROM后先不要急于重启。先到[OpenGAPPS](http://opengapps.org/)下载对应版本的GAPPS到电脑上（注意Platform和Android版本），不同Variant区别在于：

| Variant | Description |
|---|---|
| aroma | 图形化界面的super版，可以选择安装GAPPS |
| super | 包含Google设备的所有Google Apps |
| stock | 包含最新Nexus机型上预装的应用，并以GAPPS替换AOSP的同类应用 |
| full  | 与stock版的内容相似，但不会替换AOSP应用 |
| mini  | 包含完整的Google Play服务框架和主流应用 |
| micro | 包含完整的Google Play服务框架和少数应用（Gmail、Calender、Google Now） |
| nano  | 仅包含完整的Google Play服务框架 |
| pico  | 仅包含最基础的Google Play服务框架 |

可以根据自己的需要进行下载。

最好在刷完ROM后立刻刷入GAPPS。依然进入`ADB Sideload`，并输入命令：

	adb sideload open_gapps.zip

等待刷完后最好先双清一下再重启，否则可能会出现无限重启或停止工作的问题。

# Root（可选）
root权限可以通过安装SuperSU的方式获取（CM13之类的系统可以在开发者选项里直接获取）。

先到[chainfire](https://chainfire.eu/)下载最新版本的SuperSU，然后进入TWRP的`ADB Sideload`模式下直接通过`adb sideload SuperSU.zip`命令刷入即可。

# 安装apk（可选）
如果apk下载到了电脑上，无需拷贝到手机通过以下命令便可直接安装：

	adb install APP.apk