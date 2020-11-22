---
title: N1盒子Docker安装OpenWrt旁路由
date: 2020-11-17
tags: [OpenWrt, Docker, Linux, N1盒子]
categories: [奇技淫巧, ＊nix]
photos:
- /img/dockeropenwrtbanner.png
---
N1盒子装上Armbian以后就可以当作一台低功耗的小主机使用，配合各种docker可以集各种功能于一体。

# 刷入Armbian
Armbian固件使用的是恩山flippy大神的49+o（[原帖地址](https://www.right.com.cn/forum/thread-981406-1-1.html)），目前已经稳定，于是在刷入u盘后顺手刷入了eMMC。

在刷入前先在u盘启动的系统里运行`ddbr`命令选`b`进行备份（记得选压缩），文件保存到了`/ddbr`目录，以便以后有需要时恢复原系统。
然后执行`install-to-emmc.sh`脚本按提示将系统拷贝到N1的闪存中。拷贝完成关机、拔U盘、再开机，就进入内置的系统了。

# 安装docker
执行`install-docker.sh`安装docker，啪的一下就安装完成了，很快啊！

可以接着安装一个Docker图像化管理工具[Portainer](https://www.portainer.io/)：
```sh
docker volume create portainer_data
docker run -d --name portainer --restart always -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
```
通过浏览器访问盒子的9000端口就能管理docker了。

# 安装OpenWrt
OpenWrt的Docker镜像使用的也是flippy大神提供的（[原帖地址](https://www.right.com.cn/forum/thread-958173-1-1.html)），目前还在更新。

## 启动容器
从网盘上下载压缩包传到Armbian目录下，省去pull的步骤直接启动：
```sh
gzip -dc docker-img-openwrt-aarch64-r20.10.20.gz | docker load
docker network create -d macvlan --subnet=192.168.123.0/24 --gateway=192.168.123.1 -o parent=eth0 macnet
docker run -d --name openwrt --restart always --network macnet --privileged unifreq/openwrt-aarch64:r20.10.20
```
其中macvlan的网段按主路由的实际情况填写。

## 配置OpenWrt地址
执行`docker exec -it openwrt bash`进入容器里进行配置。
编辑容器里的`/etc/config/network`配置文件，将`option ipaddr`的值改为指定给OpenWrt的ip地址，如`192.168.123.2`。
保存后执行`/etc/init.d/network restart`使配置生效。
此时通过浏览器访问刚刚配置的地址应该就可以进入luci管理界面了（默认密码应该是`password`）。

## 旁路由设置
通过浏览器进入OpenWrt的管理界面，在**网络**-**接口**里修改**lan**的配置，将**IPv4网关**设置为主路由的地址，如`192.168.123.1`，在**使用自定义的DNS服务器**里添加几个当地最好用的公共DNS；在**物理设置**里关闭**桥接接口**；关闭**DHCP服务器**里的**动态DHCP**功能，保存并与应用设置。

## 主路由设置
在主路由的**内部网络(LAN)**-**DHCP服务器**设置里将**默认网关**和**DNS服务器**设置为旁路由地址，如`192.168.123.2`。
如果主路由是padavan固件且**外部网络(WAN)**-**外网设置**开启了硬件加速，需要将**IPv4 硬件加速**设置为`OFFLOAD TCP/UDP for LAN`。

# Armbian和OpenWrt网络互通
按照上面设置完旁路由发现Docker的宿主机Armbian系统和OpenWrt无法互相访问。需要修改Armbian网络配置`/etc/network/interfaces`，增加如下内容：
```sh
up ip link set eth0 promisc on

auto macvlan
iface macvlan inet static
    address 192.168.123.123
    netmask 255.255.255.0
    gateway 192.168.123.1
    dns-nameservers 192.168.123.1
    pre-up ip link add macvlan link eth0 type macvlan mode bridge
    post-down ip link del macvlan link eth0 type macvlan mode bridge
```
其中`address`是要固定的Armbian的地址，`gateway`和`dns-nameservers`填主路由地址就可以了。

保存后执行`systemctl restart networking`使配置生效，两个地址就可以互相访问了。

然后在比硬路由更强大的N1盒子上就起一些留学服务了。
