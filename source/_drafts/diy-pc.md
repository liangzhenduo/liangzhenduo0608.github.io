title: VPS开启TCP-BBR拥塞控制
date: 2017-05-11 11:11:11
tags: [VPS, 科学上网, 服务器, 代理, Linux]
categories: [网络, 科学上网]
photos:
	- /img/bbrbanner.png
---

早就听说Google又搞出了[BBR](https://github.com/google/bbr)这样的黑科技，能在有一定丢包率的网络链路上充分利用带宽并降低延迟，起到了玄学般的加速效果，比**锐速**不知道高到哪里去了，简直是梯子用户的福音。由于需要升级内核，有影响VPS上服务的风险，就一直没动。现在机器闲下来了，又赶上余额快用完了，就趁机乱搞一发。

# 更新内核
首先更新一下系统：

	yum update -y
	
然后添加[ELRepo](http://elrepo.org/)源来更新4.9及以上版本的内核：

	rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
	rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-2.el7.elrepo.noarch.rpm
	yum --enablerepo=elrepo-kernel install kernel-ml -y
	
安装完后检查一下是否安装成功：

	awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
	
如果没有其他问题一般来说新安装的内核会出现在第一行：

	0 : CentOS Linux (4.11.0-1.el7.elrepo.x86_64) 7 (Core)
	1 : CentOS Linux 7 Rescue f4cdc05ef89d44228e2623a70209bbce (3.10.0-327.28.3.el7.x86_64)
	2 : CentOS Linux (3.10.0-327.28.3.el7.x86_64) 7 (Core)
	3 : CentOS Linux (3.10.0-327.28.2.el7.x86_64) 7 (Core)
	4 : CentOS Linux (0-rescue-3839f3a1ba354857903e239a272e6cec) 7 (Core)
	
然后将最新的内核（编号为0的）设为默认内核：

	grub2-set-default 0
	
然后`reboot`重启就可以了；如果是DigitalOcean的VPS建议先`poweroff`关机，然后到控制台把Kernel改成`DigitalOcean GrubLoader v0.2`，然后再开机：

![](/img/bbrkernel.png)

# 开启BBR
开机后先`uname -r`确认一下内核是否更换成功，如果没问题就编辑`/etc/sysctl.conf`加入以下内容：

```
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr
```

保存后执行`sysctl -p`生效。然后查看TCP配置：

	sysctl net.ipv4.tcp_available_congestion_control
	sysctl net.ipv4.tcp_congestion_control

如果`=`后面都有`bbr`出现则说明设置成功。执行：

	lsmod | grep tcp_bbr
	
如果有`tcp_bbr`则说明已开启。