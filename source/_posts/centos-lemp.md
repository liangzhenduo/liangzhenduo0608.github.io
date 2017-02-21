title: CentOS 7配置LEMP环境
date: 2016-03-21 21:11:11
tags: [Linux, LEMP, VPS, Nginx, MySQL, PHP, 服务器]
categories: [网络, 网站部署]
photos: 
	- /img/lempbanner.png
---
由于最近许多服务都需要依赖LEMP（Linux、Nginx、MySQL、PHP）环境，之前旧金山机房的VPS使用CentOS 6的系统总是安装不成功，最近换了新加坡机房装了CentOS 7，所以重新完完整整的配置一遍，以便后面使用。
	
# 安装MySQL
MySQL直接从yum安装总是不能成功，后来索性就直接下载rpm包安装了。首先下载MySQL社区版的rpm包并执行安装：

	rpm -ivh http://repo.mysql.com/mysql-community-release-el7-7.noarch.rpm
	yum update
	
之后安装mysql-server：

	yum install mysql-server
	
通过`mysql -V`命令查看版本来检查MySQL是否安装成功。
	
启动服务并设置开机启动：

	systemctl start mysqld
	systemctl enable mysqld
	
然后配置安全脚本：

	mysql_secure_installation
	
这时会要求输入数据库的root密码，由于是新安装的并没有密码，所以直接回车即可。接下来会提示设置新的root密码，然后会有一些其它选项：

> Remove anonymous users? [Y/n]
> Disallow root login remotely? [Y/n]
> Remove test database and access to it? [Y/n]
> Reload privilege tables now? [Y/n]

按需求选择即可，推荐都选Y。

结束后使用`mysql -u root -p`命令以root身份登录，后面输入密码就登进去了。

# 安装PHP
yum默认安装的PHP还是5.4版本，对于需要新版本特性的用户还是通过Remi源安装好了。所以首先下载安装Remi源：

	rpm -ivh http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
	rpm -ivh http://rpms.famillecollet.com/enterprise/remi-release-7.rpm
	yum update
	
然后编辑`/etc/yum.repos.d/remi.repo`文件：

```accesslog
[remi]
name=Remi's RPM repository for Enterprise Linux 7 - $basearch
#baseurl=http://rpms.remirepo.net/enterprise/7/remi/$basearch/
mirrorlist=http://rpms.remirepo.net/enterprise/7/remi/mirror
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-remi
```

请确保`[remi]`中的`enabled`的值是`1`。然后向下查看，在想要安装的php的版本（`[remi-php55]`或`[remi-php56]`）一段将对应的`enabled`的值改为`1`，例如：

```accesslog
[remi-php55]
name=Remi's PHP 5.5 RPM repository for Enterprise Linux 7 - $basearch
#baseurl=http://rpms.remirepo.net/enterprise/7/php55/$basearch/
mirrorlist=http://rpms.remirepo.net/enterprise/7/php55/mirror
# NOTICE: common dependencies are in "remi-safe"
enabled=0
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-remi

[remi-php56]
name=Remi's PHP 5.6 RPM repository for Enterprise Linux 7 - $basearch
#baseurl=http://rpms.remirepo.net/enterprise/7/php56/$basearch/
mirrorlist=http://rpms.remirepo.net/enterprise/7/php56/mirror
# NOTICE: common dependencies are in "remi-safe"
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-remi
```

保存之后就可以用yum命令安装较新的PHP了：

	yum install php php-fpm php-mysql
	
当然以后如果发现缺了什么php的组件也可以通过这种方式安装，例如：
	
	yum install php-gd php-mcrypt php-pear
	
通过`php -v`命令查看版本来检查PHP是否安装成功。

启动PHP并设置开机启动：

	systemctl start php-fpm
	systemctl enable php-fpm
	
# 安装Nginx
再使用yum安装Nginx：

	yum install nginx
	
通过`nginx -v`命令查看版本来检查Nginx是否安装成功。
	
启动Nginx并设置开机启动：

	systemctl start nginx
	systemctl enable nginx
	
然后在`/etc/nginx/nginx.conf`的`http`段中加入一句：

```sh
include /etc/nginx/conf.d/*.conf;
```

编辑`/etc/nginx/conf.d/default.conf`文件（若不存在请新建，以后就可以在这里修改配置了）：

```nginx
server {
    listen       80;
    server_name  your_domain;
    return 301 https://$server_name$request_uri;
    #charset koi8-r;

    #access_log  logs/host.access.log  main;

    # Load configuration files for the default server block.
    
    include /etc/nginx/default.d/*.conf;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm index.php;
    }

    error_page  404              /404.html;
    location = /404.html {
        root   /usr/share/nginx/html;
    }

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    #    include        fastcgi_params;
    #}

    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```

保存后通过`systemctl restart nginx`命令重启Nginx。然后在根目录下新建一个html文件并从浏览器访问它看看是不是正常显示。
	
# 配置Nginx和PHP
继续编辑`/etc/nginx/conf.d/default.conf`文件，将`location ~ \.php$`一段解注释，并改成如下样子：

```nginx
    location ~ \.php$ {
        root	   /usr/share/nginx/html;
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }
```

其中要注意`root`改成网页的根目录，此外还要确保`location /`的`index`中有`index.php`。然后通过`systemctl restart nginx`命令重启Nginx。

再编辑`/etc/php-php.d/www.conf`将`user`和`group`的值改为`nginx`（默认应该是`apache`）：

```sh
user = nginx
group = nginx
```

保存后使用`systemctl restart php-fpm`命令重启PHP。

下面新建`/usr/share/nginx/html/index.php`文件测试PHP环境是否配置成功：

```php
<?php
	phpinfo();
?>
```

从浏览器打开该页面，如果出现PHP信息则说明配置完成。