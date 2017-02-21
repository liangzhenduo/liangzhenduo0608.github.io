title: macOS配置PHP开发环境
date: 2016-10-31 21:11:11
tags: [macOS, PHP, Nginx, MySQL, LEMP]
categories: [手帐, 实习]
photos: 
	- /img/mpbanner.png
---
上（shí）班（xí）的时候写PHP都是在开发机上，所以公司配的电脑上一直就没有搭PHP环境。最近我预料到要写一个Web的项目，所以提前搭一下环境备用。

# 安装MySQL
可以直接通过homebrew安装：

	brew install mysql

安装完成后第一次启动MySQL：

	brew services start mysql
	
然后就可以用`mysql_secure_installation`初始化设置一下MySQL，包括root密码等等。
	
开机启动`homebrew.mxcl.mysql.plist`已经默认添加到`~/Library/LaunchAgents`里了，所以不用再设置了。

# 安装Nginx
同样Nginx也可以通过homebrew安装：

	brew install nginx
	
安装完成后直接用`nginx`命令就可以启动。

但是Nginx的开机启动项并没有默认添加，我们可以手动将它添加进去：

	cp /usr/local/opt/nginx/homebrew.mxcl.nginx.plist ~/Library/LaunchAgents/
	
# 配置PHP
macOS默认是安装好PHP的，所以就不想再安装其他版本了。

先编辑`/private/etc/php.ini`，如果没有就复制一份`php.ini.default`，然后配置一下时区和数据库socket：

```ini
date.timezone = "Asia/Shanghai"
pdo_mysql.default_socket = /tmp/mysql.sock
```

因为我要用**~~噫~~yii**框架，所以改了这一项，如果用到了MySQL的其他函数需要修改相应的`mysql.default_socket`或`mysqli.default_socket`。

然后编辑`/private/etc/php-fpm.conf`，在里面指定一下`error_log`的路径：

```sh
error_log = /usr/local/var/log/php-fpm/error.log
```

然后直接用`php-fpm`命令启动即可。

接着去配置一下`/usr/local/etc/nginx/nginx.conf`，将php的一段去掉注释，并修改`fastcgi_param`：

```nginx
location ~ \.php$ {
    root           html;
    fastcgi_pass   127.0.0.1:9000;
    fastcgi_index  index.php;
    fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    include        fastcgi_params;
}
```

然后执行`nginx -s reload`重新加载配置。

然后也可以配置一下php-fpm的开机启动，直接新建`~/Library/LaunchAgents/net.php.php-fpm.plist`文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>net.php.php-fpm</string>
    <key>RunAtLoad</key>
    <true/>
    <key>Program</key>
    <string>/usr/sbin/php-fpm</string>
  </dict>
</plist>
```

保存后将其权限设为**600**即可，然后执行启动：

	launchctl load ~/Library/LaunchAgents/net.php.php-fpm.plist
	
如果提示`Service is disabled`，上面的命令加上`-w`参数再执行就行了。