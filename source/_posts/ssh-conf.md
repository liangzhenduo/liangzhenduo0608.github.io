title: ssh保持继续连接
date: 2016-09-21 22:22:22
tags: [ssh, Linux]
categories: [奇技淫巧, ＊nix]
photos: 
	- /img/sshconfbanner.png
toc: false
---
公司开发登录堡垒机时需要使用**PIN+token**的方式进行认证，而且动态密码只能一次使用，因此一次要打开多个终端都要多次等待动态密码的变化才能登录。

所以听从公司同（xué）事（zhǎng）的建议，配置了一下`~/.ssh/config`：

```nginx
Host *
    ControlMaster auto
    ControlPath ~/.ssh/%h-%p-%r
    ControlPersist yes
```

如果没有这个文件可以新建。其中`Host`项是指目标地址；`ControlMaster`一项会使一旦有一个连接以后，再次从其他终端连接同一个host也不必再输密码；`ControlPersist`一项可以一段时间不再输密码也可以登录。这样配置以后就能实现输一次密码后对于同一host不再输密码即可连接了。