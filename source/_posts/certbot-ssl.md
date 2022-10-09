---
title: Certbot配置SSL证书获得A+
tags:
  - SSL
  - 服务器
  - Nginx
  - VPS
categories:
  - 网络
  - 网站部署
photos:
  - /img/certbotsslbanner.png
date: 2022-10-01 22:22:22
toc: true
---
# 安装Certbot
[Certbot](https://certbot.eff.org/)是一个自动生成[Let’s Encrypt](https://letsencrypt.org/)免费SSL证书的自由开源工具。CentOS可以通过yum直接安装：

```sh
yum install certbot
```



# 获取Cloudflare API Key

因为DNS解析是托管在CloudFlare上，通过DNS API去验证域名所有权并申请/更新证书操作起来更简单。

在[CloudFlare个人资料](https://dash.cloudflare.com/profile/api-tokens)里获取Global API Key，在VPS上创建`cf.ini`文件填入帐号和Key：

```ini
# Cloudflare API credentials used by Certbot
dns_cloudflare_email = cloudflare@example.com
dns_cloudflare_api_key = 0123456789abcdef0123456789abcdef0123
```



# 申请证书

用DNS插件申请域名和二级域名的证书：

```sh
certbot certonly -d 'yourdomain.com' -d '*.yourdomain.com' \
	--dns-cloudflare \
	--dns-cloudflare-credentials /etc/nginx/cf.ini \
	--dns-cloudflare-propagation-seconds 60
```

证书默认会保存在`/etc/letsencrypt/live/yourdomain.com`目录下面。



# 配置Nginx
配置`/etc/nginx/nginx.conf`：

```nginx
server {
    listen       443 ssl http2;
    listen       [::]:443 ssl http2;
    server_name  _;
    root         /usr/share/nginx/html;

    ssl_certificate      /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_session_cache shared:le_nginx_SSL:1m;
    ssl_session_timeout 1440m;
    ssl_session_tickets off;

    ssl_dhparam /etc/nginx/dhparam.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!kRSA;
}
```

重启Nginx就对所有二级域名都生效了。可以到[SSL Labs](https://www.ssllabs.com/)检测一下SSL评分是不是A+。

# 证书续期
证书有效期为90天，所以需要定期更新，离过期30天以内可以续期，续期命令（可以加`--dry-run`试一下）：

```sh
certbot renew \
	--dns-cloudflare \
	--dns-cloudflare-credentials /etc/nginx/cf.ini \
	--dns-cloudflare-propagation-seconds 60
```

可以写个crontab定时任务每个月执行一次：

```sh
55 7 1 * * /usr/bin/certbot renew --dns-cloudflare --dns-cloudflare-credentials /etc/nginx/cf.ini --dns-cloudflare-propagation-seconds 60 >> ~/cert.log && systemctl restart nginx
```

