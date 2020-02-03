---
title: ShadowSocks启用v2ray-plugin
date: 2019-11-11
tags: [ShadowSocks, VPS, 科学上网, 服务器, 代理, Linux, V2Ray]
categories: [网络, 科学上网]
photos:
  - /img/shadowsocks-v2ray-banner.png
---

2019年6月初由于某事件发生30周年，导致某长城突然加高，将大量机场IP屏蔽，于是将梯子改成了**v2ray**，并通过cloudflare代理DNS解析的方式将翻墙流量伪装成对域名的tls访问流量，曲线解决了IP端口被封的问题。
但是路由器上使用v2ray客户端有一些性能问题，总觉得不如原来的shadowsocks流畅，于是找到一种继续使用ss，并通过v2ray-plugin插件来伪装流量的方法。

# 服务端
## 搭建服务
停用原来的python版，安装shadowsocks-libev：

	yum install shadowsocks-libev -y

克隆v2ray-plugin代码并编译（需要golang环境）：

	git clone https://github.com/shadowsocks/v2ray-plugin.git
	cd v2ray-plugin && go build
	cp v2ray-plugin /usr/bin/

## 更改配置
编辑`/etc/shadowsocks-libev/config.json`：

```json
{
    "server":"0.0.0.0",
    "server_port":23333,
    "local_port":1080,
    "password":"password",
    "timeout":300,
    "method":"rc4-md5",
    "plugin":"v2ray-plugin",
    "plugin_opts":"server;loglevel=none"
}
```

本来这里使用v2ray插件的目的是将shadowsocks的流量伪装成tls流量，自然服务器端口应当使用443。
但是我的服务器同时还启用了nginx，再使用443会造成端口冲突，所以在这里使用一个其他的端口，然后再用nginx做一次端口转发。

## 端口转发
在`/etc/nginx/conf.d/`目录下新建一个配置：

```nginx
server {
    listen       443;
    server_name  ss.your.domain;

    location / {
        proxy_pass http://127.0.0.1:23333;
        proxy_redirect      off;
        proxy_http_version  1.1;
        proxy_set_header    Host $http_host;
        proxy_set_header    Upgrade $http_upgrade;
        proxy_set_header    Connection "upgrade";
    }
}
```

`server_name`需要使用自己的域名，并将这个二级域名解析到vps上。

保存后重启nginx，启动shadowsocks并设置开机启动：

    systemctl restart nginx
	systemctl start shadowsocks-libev
	systemctl enable shadowsocks-libev

# 客户端
主要注意以下配置：
+ `服务器地址`填上面配置的`二级域名`
+ `服务器端口`填`443`
+ `插件名称`填`v2ray-plugin`
+ `插件参数`填`tls;host=二级域名`

## 路由器
此处以老毛子固件为例：

![路由器设置](/img/shadowsocks-v2ray-pdcn.png)

打开开关应用即可。

## Windows
+ 客户端下载：[shadowsocks-windows](https://github.com/shadowsocks/shadowsocks-windows/releases/latest)
+ 插件下载：[v2ray-plugin](https://github.com/shadowsocks/v2ray-plugin/releases/latest)

下载完成将插件`v2ray-plugin.exe`解压到shadowsocks的文件夹中（使其与`shadowsocks.exe`平级），启动按如下配置：

![Windows设置](/img/shadowsocks-v2ray-windows.png)

## macOS
+ 客户端下载：[ShadowsocksX-NG](https://github.com/shadowsocks/ShadowsocksX-NG/releases/latest)

将客户端解压到应用目录（客户端会自己安装插件），启动按如下配置：

![macOS设置](/img/shadowsocks-v2ray-macos.png)

## Android
+ 客户端下载：[shadowsocks-android](https://github.com/shadowsocks/shadowsocks-android/releases/latest)
+ 插件下载：[v2ray-plugin-android](https://github.com/shadowsocks/v2ray-plugin-android/releases/latest)

两个apk安装以后启动按如下配置：

![Android设置](/img/shadowsocks-v2ray-android.png)
![插件设置](/img/shadowsocks-v2ray-android-plugin.png)
