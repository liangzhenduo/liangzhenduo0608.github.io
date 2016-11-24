title: SSL证书的申请与配置
date: 2015-12-30 23:33:33
tags: [服务器, SSL, VPS, Nginx]
categories: [网络, 网站部署]
photos:
	- /img/sslbanner.png
---
超文本传输安全协议（HTTPS）是一种网络安全传输协议。在计算机网络上，HTTPS经由超文本传输协议进行通讯，但利用SSL/TLS来对数据包进行加密。HTTPS开发的主要目的，是提供对网络服务器的身份认证，保护交换数据的隐私与完整性。

如今越来越多的个人网站使用HTTPS协议，所以感觉自己的网站不装这么一个逼就落伍了。看着自己的主页地址栏前面有一个绿色的`https`也感觉安全了许多~~虽然并没有什么卵用~~。

# 申请证书
要使用HTTPS协议首先要有一个值得信任的证书颁发机构给你的网站颁发的证书。目前免费的SSL证书颁发机构有很多，本文以从**沃通**上申请证书为例。

## 填写信息
首先到[沃通官网](https://buy.wosign.com/free/)注册账号并登录。

然后会出现以下界面：

![填写信息](/img/ssl1.png)

单次申请支持1个证书5个域名2年期限，证书可选中英文，提交就好了。

## 验证域名
签发机构需要验证域名的所有者，可以通过域名邮箱验证，也可以将指定信息放到网站上让其扫描以验证：

![验证域名](/img/ssl2.png)

如果没有域名邮箱，将指定的html文件下载下来上传到服务器上网站的根目录下然后点下面的验证就可以了。

## 生成签名
到订单里选择签名生成方式，可以选择第一种方式系统自动生成，设置密码：

![生成签名](/img/ssl3.png)

这个密码是最后解压证书用的，所以要记好。

## 下载证书
之后会弹出证书的下载链接，如果没有可以稍等片刻去订单里Get Cert，或者等待邮箱收到链接，输入刚才设置的密码就可下载压缩包了：

![下载证书](/img/ssl4.png)

# 部署证书
通过之前设置的密码解压压缩包，里面有各种服务器的证书，解压自己所用的服务器对应的证书即可。本文以`Nginx`服务器为例。

## 上传证书
解压后里面有一个`.crt`文件和一个`.key`文件，将它们上传到服务器上：

	scp 1_your_domain_bundle.crt remote_username@remote_host:/usr/share/nginx/
	scp 2_your_domain.key remote_username@remote_host:/usr/share/nginx/
	
## 监听端口
一般HTTPS使用443端口，因此要编辑`/etc/nginx/conf.d`下的`ssl.conf`文件：

```sh
server {
    listen       443;
    server_name  your_domain;

    ssl                  on;
    ssl_certificate      /usr/share/nginx/1_your_domain_bundle.crt;
    ssl_certificate_key  /usr/share/nginx/2_your_domain.key;

    ssl_session_timeout  5m;

    ssl_protocols  SSLv2 SSLv3 TLSv1;
    ssl_ciphers  ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP;
    ssl_prefer_server_ciphers   on;

    location / {
        root   /usr/share/nginx/www;
        index  index.html index.htm;
    }
}
```

解开注释并将证书文件路径写进去保存，然后运行`nginx -s reload`重新加载配置文件即可。

## 强制跳转
经过之前的配置必须在地址里写上`https`才会跳转到HTTPS域名，不然还是会跳转到HTTP的。

所以还要编辑`/etc/nginx/conf.d`下的`default.conf`文件：

```sh
server {
    listen       80 default_server;
    server_name  your_domain;
    return 301 https://$server_name$request_uri;        

    include /etc/nginx/default.d/*.conf;

    location / {
        root   /usr/share/nginx/www;
        index  index.html index.htm;
    }
}
```

在`server_name`下面加一个301跳转就能强制跳转到`https`了。

保存后运行`nginx -s reload`重新加载配置文件就搞定了。