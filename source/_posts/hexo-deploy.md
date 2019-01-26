---
title: Hexo博客部署到VPS
tags:
  - Nginx
  - 服务器
  - VPS
  - Git
categories:
  - 网络
  - 网站部署
photos:
  - /img/hexodbanner.png
date: 2017-06-08 23:33:33
---

Hexo的博客本身之前是挂在[github.io](http://liangzhenduo0608.github.io/)的，但是想用自己的域名，本来配一个CNAME就可以了，但是再想使用https就很麻烦了，索性就在VPS上也部署一份，自己运行维护。

# 服务器hook配置
首先要装好Nginx，然后在`/usr/share/nginx`下新建一个临时目录：

	mkdir blog.git

然后在里面创建git裸库：

	cd blog.git
	git init --bare
	cd hooks

之后就可以在`hooks`目录里配置自动执行的脚本了，编辑`post-receive`：

```sh
#!/bin/bash -l
GIT_REPO=/usr/share/nginx/blog.git
PUBLIC_WWW=/usr/share/nginx/blog
rm -rf $PUBLIC_WWW
git clone $GIT_REPO $PUBLIC_WWW
rm -rf $PUBLIC_WWW/.git
```

记得给这个脚本添加执行权限：

	chmod +x post-receive

通过这个hook就可以将新生成的博客放到`/usr/share/nginx/blog`下了。

# 修改部署配置
编辑本地Hexo仓库的`_config.yml`，在`deploy`下面增加一个新的配置，参考[官方文档](https://hexo.io/zh-cn/docs/deployment.html)：

```yml
- type: git
  repo: root@YOUR_VPS_IP:/usr/share/nginx/blog.git
  branch: master
```

保存后使用`hexo d`命令重新部署，在这之前确认一下是否已经配置过VPS的公私钥登录。部署完成后到VPS的`/usr/share/nginx`下看是否出现`blog`目录，且里面是Hexo生成的页面内容。

# 服务器Nginx配置
进入`/etc/nginx/conf.d`目录新建一个配置文件`blog.conf`：

```nginx
server {
    listen       80;
    server_name  www.shintaku.cc;

    location / {
        root   /usr/share/nginx/blog;
        index  index.html;
    }

    error_page  404              /404.html;

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

保存后用`nginx -s reload`重载配置，打开上面配置的域名（首先应该配置过解析）应该就能访问Hexo博客了。这样只是http访问，之后可以按需配置https，这里不再赘述。
