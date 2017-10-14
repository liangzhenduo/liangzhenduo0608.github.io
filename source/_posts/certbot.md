---
title: Let's Encrypt SSL证书配置
tags:
  - SSL
  - Nginx
  - VPS
categories:
  - 网络
  - 网站部署
photos:
  - /img/certbotbanner.png
date: 2017-06-18 22:22:22
---

[certbot.eff.org](https://certbot.eff.org/)
# 安装certbot

	yum install epel-release
	yum install certbot
	
# 获取证书

	certbot certonly --webroot --email user@domain.com -w /usr/share/nginx/blog -d www.shintaku.cc -w /usr/share/nginx/info -d info.shintaku.cc
	
然后在`/etc/letsencrypt/live/`下就会生成存放证书链接的目录，将它们配置到Web服务器就可以了。
	
# 配置Nginx
编辑`/etc/nginx/conf.d/ssl.conf`文件：

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

最后重载Nginx配置就可以了。

# 证书续期

	certbot renew && nginx -s reload