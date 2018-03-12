---
title: Let's Encrypt SSL证书配置
tags:
  - SSL
  - 服务器
  - Nginx
  - VPS
categories:
  - 网络
  - 网站部署
photos:
  - /img/certbotbanner.png
date: 2017-06-18 22:22:22
---
[Let's Encrypt](https://letsencrypt.org/)是一个于2015年三季度推出的数字证书认证机构，旨在以自动化流程消除手动创建和安装证书的复杂流程，并推广使万维网服务器的加密连接无所不在，为安全网站提供免费的SSL/TLS证书。

官方建议用[EFF](https://www.eff.org/)开发的[Certbot](https://certbot.eff.org/) ACME客户端签发证书。

# 安装certbot
CentOS可以通过yum直接安装：

	yum install certbot
	
如果yum找不到`certbot`，建议安装或重装`epel-release`。
	
# 获取证书
用以下命令对相应的若干域名生成证书：

	certbot certonly --webroot --email user@domain.com -w /usr/share/nginx/blog -d www.shintaku.cc -w /usr/share/nginx/info -d info.shintaku.cc
	
然后在`/etc/letsencrypt/live/`下就会生成存放证书链接的目录，将它们配置到Web服务器就可以了。
	
# 配置Nginx
在`/etc/nginx/conf.d`新建`ssl.conf`文件：

```
server {
    listen       443;
    server_name  www.shintaku.cc;

    ssl                  on;
    ssl_certificate      /etc/letsencrypt/live/www.shintaku.cc/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/www.shintaku.cc/privkey.pem;
    
    ssl_session_cache shared:le_nginx_SSL:1m;
    ssl_session_timeout 1440m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;

    ssl_ciphers "ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:ECDHE-ECDSA-DES-CBC3-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA:!DSS";
    
    add_header Strict-Transport-Security max-age=31536000;

    location / {
        root   /usr/share/nginx/blog;
        index  index.html;
    }

    error_page  404              /404.html;
    location = /404.html {
        root   /usr/share/nginx/blog;
    }
}

server {
    listen       443;
    server_name  info.shintaku.cc;
    autoindex    on;
    ssl                  on;
    ssl_certificate      /etc/letsencrypt/live/www.shintaku.cc/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/www.shintaku.cc/privkey.pem;
    
    ssl_session_cache shared:le_nginx_SSL:1m;
    ssl_session_timeout 1440m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;

    ssl_ciphers "ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:ECDHE-ECDSA-DES-CBC3-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA:!DSS";

    add_header Strict-Transport-Security max-age=31536000;
    
    root   /usr/share/nginx/info;
    
    location / {
        index  index.html index.htm index.php;
    }

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }
}
```

最后重载Nginx配置就可以了。可以到[SSL Labs](https://www.ssllabs.com/)检测一下SSL状态。使用上述配置一般可以获得A+评分，也可以使用[Mozilla SSL Configuration Generator](https://mozilla.github.io/server-side-tls/ssl-config-generator/)生成配置。

![评分](/img/certbotssl.png)

# 证书续期
Let's Encrypt的证书有效期为90天，所以需要定期更新，离过期30天以内可以续期：

	certbot renew && nginx -s reload