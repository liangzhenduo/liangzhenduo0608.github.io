title: DenyHosts防止ssh暴力登录
date: 2016-08-26 18:18:18
tags: [VPS, Linux, ssh, 服务器]
categories: [网络, 网站部署]
photos:
	- /img/dhbanner.png
---
每次登录服务器都会提示：
	
> There were xxxx failed login attempts since the last successful login.
	
就知道总有闲人在扫IP试密码。再看一下`/var/log/secure`就能知道这些失败登录的详情：

```bash
Aug 26 05:45:58 sgp1 sshd[4999]: Failed password for invalid user test from 128.199.92.158 port 38416 ssh2
```
	
所以我决定用**DenyHosts**屏蔽这些地址。[DenyHosts](http://denyhosts.sourceforge.net/)是一个可以帮助阻止ssh攻击的脚本，它会分析`/var/log/secure`并记录多次失败登录的IP到`/etc/hosts.deny`中。

# 添加信任IP
编辑`/etc/hosts.allow`，将自己常用的IP加进去：

```sh
sshd: 202.113.*.*: allow
```

比如学校用的天津南开教育网，就把上面的IP段加进去，防止哪天自己手残输错几次密码IP被禁登不进去了。

# 安装配置DenyHosts

	yum install denyhosts
	
安装完成后编辑`/etc/denyhosts.conf`文件：

```ini
SECURE_LOG = /var/log/secure
HOSTS_DENY = /etc/hosts.deny
PURGE_DENY = 10w #禁止列表清理周期，不填就是永不清理
BLOCK_SERVICE  = sshd
DENY_THRESHOLD_INVALID = 5 #非法用户失败登录次数
DENY_THRESHOLD_VALID = 5 #合法用户失败登录次数（不含root）
DENY_THRESHOLD_ROOT = 3 #root用户失败登录次数
DENY_THRESHOLD_RESTRICTED = 3 #限制用户失败登录次数
WORK_DIR = /var/lib/denyhosts
ETC_DIR = /etc
SUSPICIOUS_LOGIN_REPORT_ALLOWED_HOSTS = NO #是否报告来自允许列表的可疑登录
HOSTNAME_LOOKUP = NO #是否屏蔽被禁止IP对应的域名
LOCK_FILE = /var/lock/subsys/denyhosts
```

其中几个数字可以根据自己的需求修改，文件路径一般都不需要修改。另外还可以设置管理员邮箱`ADMIN_EMAIL`，默认是`root@localhost`，会把通知邮件发到`/var/spool/mail`下；也可以加上自己的其他邮箱。

# 启动服务

保存好配置文件后可以启动DenyHosts并加入到开机启动了：

	systemctl start denyhosts
	systemctl enable denyhosts
	
然后`tail -f /etc/hosts.deny`看一下禁用列表的动态，如果有：

```sh
# DenyHosts: Fri Aug 26 05:41:17 2016 | sshd: 87.106.142.246
sshd: 87.106.142.246
# DenyHosts: Fri Aug 26 05:41:17 2016 | sshd: 123.49.62.231
sshd: 123.49.62.231
# DenyHosts: Fri Aug 26 05:41:17 2016 | sshd: 45.32.20.165
sshd: 45.32.20.165
# DenyHosts: Fri Aug 26 05:41:17 2016 | sshd: 58.221.60.2
sshd: 58.221.60.2
# DenyHosts: Fri Aug 26 05:41:17 2016 | sshd: 118.71.224.139
sshd: 118.71.224.139
```

这样的内容出现就说明DenyHosts已经把之前记录里的可疑IP写进来了。我也把自己服务器上的[hosts.deny](http://info.shintaku.cc/hosts.deny)放出来供大家（lā）考（hēi）。