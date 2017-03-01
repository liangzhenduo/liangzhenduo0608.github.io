title: 路由器刷breed引导第三方固件
date: 2017-02-24 12:12:12
tags: [OpenWrt, 路由器, Linux]
categories: [奇技淫巧, 路由器]
photos:
	- /img/breedbanner.png
---

之前早就听说**斐讯**路由器有个*[0元购](http://www.phicomm.com/cn/index.php/News/detail/cateid/2/id/372.html)*活动，一直没往心里去；直到昨天看到[XForce](http://weibo.com/xforce)大神也撸了一台，于是~~江信江疑~~跟风在*二手东*下了一单，结果今天就上船了，但愿30天内别翻船，才算真的免费拿到手啊。

收货后先别急刮K码，刮开了万一有毛病就不给退了。先登[192.168.2.1](http://192.168.2.1/)配置一下网络，发现原厂固件功能还算齐全，一般情况都够用了。但是据说有人发现路由器暗地里在给某些服务器传送着数据，恐怕有信息泄露的风险，当然刷一个第三方固件更保险一些了。

我拿到的**斐讯K2**硬件版本是`A2`，固件版本是`22.4.5.42`。听闻说更高版本的固件刷Breed非常麻烦，我还比较庆幸原厂版本比较低，然而依然要降级。

# 刷入breed
## 下载工具
首先下载huzibbs大神制作的**路由器刷breed Web助手通用版**（[千脑](http://qiannao.com/file/huzibbs/6952c4dc/) [百度网盘](https://pan.baidu.com/s/1eSA6AdW)），可以实现一键刷telnet、ssh、breed。

然后将路由器**LAN**口与Windows电脑用网线相连，然后长按路由器Reset键5秒恢复出厂设置。之后可以再访问一下[192.168.2.1](http://192.168.2.1/)看是不是初始状态。

## 开始刷机
如果一切正常就以管理员身份运行**路由器刷breed Web助手通用版**：

![路由器刷breed Web助手通用版](/img/breedassistant.png)

配置如图即可，注意其中刷机方案一定要选择`斐讯k1,k1s,k2全自动方案`，然后点击`开始刷机`即可。

开始刷机前工具作者建议先手动禁用除`以太网`以外的其他网络连接。由于工具中途会调用另外几个程序，所以中途如果系统弹出了提示框允许即可，顺便设成不再提醒；如果弹窗导致刷机失败了重新再来一遍基本就可以了。

## 重启路由器
几分钟之后刷机自动完成，按照工具提示**等待2分钟以后**再断电。在重新通电前先按住Reset键再接通电源，持续按住Reset键约10秒钟再松手。不出意外此时路由器应该进入了breed引导，这时访问[192.168.1.1](http://192.168.1.1/)应当就进入了**Breed Web 恢复控制台**：

![Breed Web 恢复控制台](/img/breedweb.png)

# 刷入第三方固件
## 固件备份
进入控制台后，先到`固件备份`里将`EEPROM`和`编程器固件`备份一下：

![固件备份](/img/breedbackup.png)

## 恢复出厂设置
然后到`恢复出厂设置`将固件恢复`Config区（公版）`：

![恢复出厂设置](/img/breedreset.png)

## 固件更新
最后到`固件更新`选择要刷的固件上传即可：

![固件更新](/img/breedupdate.png)

目前K2可刷的固件有很多，包括[OpenWrt](https://downloads.openwrt.org/)、[PandoraBox](http://downloads.pandorabox.com.cn/)等等。虽然OpenWrt还没有放出针对K2的Release版本，但由于它用的是**ramips**架构的**mt7620**芯片，所以一般mt7620芯片的路由器固件是通用的，于是我就刷了个小米路由器的[固件](https://downloads.openwrt.org/chaos_calmer/15.05.1/ramips/mt7620/openwrt-15.05.1-ramips-mt7620-xiaomi-miwifi-mini-squashfs-sysupgrade.bin)：

![OpenWrt](/img/breedwrt.png)

而潘多拉盒子已经有了K2的稳定版[固件](http://downloads.pandorabox.com.cn/pandorabox-16-10-stable/targets/ralink/mt7620/PandoraBox-ralink-mt7620-phicomm-k2-2017-01-03-git-6c24a7a-squashfs-sysupgrade.bin)。另外给K2装软件时记得下载**ramips**架构的ipk包。