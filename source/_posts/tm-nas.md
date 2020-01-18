---
title: Time Machine通过Samba备份到NAS
date: 2020-01-01
tags: [macOS, Linux, OMV, NAS]
categories: [奇技淫巧, macOS]
photos:
  - /img/tm-nas-banner.png
---
MacBook升级后去掉了USB口，插移动硬盘比较麻烦，所以就一直没有备份时间机器了。后来觉得samba挂载的硬盘也可以用来备份，于是就想起了2019年捡垃圾时在某宝买的**蜗牛星际**矿渣（现在挂上硬盘装了OMV系统成为了一台家用NAS），希望可以无线局域网的环境下直接备份。

# OMV设置
## 配置共享文件夹
首先进入OMV控制台配置一个共享文件夹用于Time Machine的备份：

![共享文件夹](/img/tm-nas-shared-folder.png)

这里我用了单独一块磁盘用于备份，并把文件夹命名为Backup。

配置完成后在`特权`里给用于备份的账户授予`读写权限`，并更改`ACL`设置如下：

![修改ACL](/img/tm-nas-acl.png)

## 更改samba设置
以root身份登入OMV，编辑samba的配置文件`/etc/samba/smb.conf`，更改备份文件夹的内容：

```
[Backup]
comment = Time Machine
path = /srv/dev-disk-by-label-Backup/
guest ok = no
guest only = no
read only = no
browseable = yes
inherit acls = yes
inherit permissions = no
ea support = no
store dos attributes = no
fruit:encoding = private
fruit:locking = none
fruit:metadata = netatalk
fruit:resource = file
fruit:time machine = yes
vfs objects = catia fruit streams_xattr
printable = no
create mask = 0664
force create mode = 0664
directory mask = 0775
force directory mode = 0775
hide special files = yes
follow symlinks = yes
hide dot files = yes
valid users = "shintaku"
invalid users =
read list =
write list = "shintaku"
```

主要变化在于更改了`vfs objects`的值并增加了几个`fruit`的配置。

保存后运行`testparm`看一下配置是否正确，没问题就可以`systemctl restart smbd`重启服务了。

# macOS设置
将Mac和NAS放到统一局域网下，用Finder的`前往`-`连接服务器`挂载一下备份硬盘看看是否正常。

## 开启文件共享
进入`系统偏好设置`-`共享`，在`文件共享`的选项里将SMB共享打勾：

![文件共享](/img/tm-nas-sharing.png)

## 配置时间机器
进入`系统偏好设置`-`时间机器`，点`选择磁盘`：

![选择磁盘](/img/tm-nas-select-disk.png)

发现在NAS上配置的共享磁盘已经出现了，选择这个磁盘会弹出窗口认证身份，填入之前授权过的用户名密码即可：

![登录](/img/tm-nas-access.png)

然后就连接完成，可以开始备份了：

![备份](/img/tm-nas-backup.png)
