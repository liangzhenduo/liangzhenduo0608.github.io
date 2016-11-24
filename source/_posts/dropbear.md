title: OpenWrt上的ssh免密登录
date: 2016-06-18 18:18:18
tags: [OpenWrt, ssh, Linux, 路由器]
categories: [奇技淫巧, ＊nix]
photos: 
	- /img/dbbanner.png
---

一般在用OpenSSH服务器的系统上进行ssh登录时，我们只需要在本地生成密钥（yuè）对，将私钥（yuè）留在本地，将公钥（yuè）上传到目标服务器上就可以了，具体如下：

	ssh-keygen
	cat ~/.ssh/id_rsa.pub | ssh remote_username@remote_host 'cat >> .ssh/authorized_keys'
	
然而OpenWrt上的ssh服务器却用的[Dropbear](https://matt.ucc.asn.au/dropbear/dropbear.html)，它是一种在较低内存和处理器资源的嵌入式系统中替代OpenSSH的软件，因此使用起来用诸多的不同。

# 免密登录到OpenWrt
如果本地是用`ssh-keygen`生成的密钥对，那么只需要将公钥上传到路由器的`/etc/dropbear/authorized_keys`中就行了：

	cat ~/.ssh/id_rsa.pub | ssh root@192.168.1.1 'cat >> /etc/dropbear/authorized_keys'

# 从OpenWrt登录到其他机器
首先登入到OpenWrt。但想从OpenWrt免密登录其他机器，也要先生成密钥对并将公钥上传。由于无法使用`ssh-keygen`，我们可以直接用`dropbearkey`生成：

	dropbearkey -t rsa -f ~/.ssh/id_rsa
	Generating key, this may take a while...
	Public key portion is:
	ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCn02fMyD2T1ECmDZso8EG1m/4eo5LJtNlbqCMu0SkABsOUvmTHozrPzoJ10SlcAhjnc84S//VGEAbNJxUTaYn0M7f7M8Q4NBSyPF9DMcNAWKM01OSll8BWLQafZeZneW+UOwO6h1LOd6UEaLS8lhKQUD05+dSzKhPHimZudlhkV2bO7KOkiFh3P4K1GakHBuXitB1V9QH144BKKlSqNXy7TZcJf5/oRkB76ZmdSDDMQtvfCHF1BZwggStgBsu9K6nAl8lz9MOVHCYs9AkEIurldrHLUKvoGJ4QA5yc3bEMQaMH7vu3G5YMysIY4w5+aVuZh5Wg4THoh6yXPfGUc7Mh root@OpenWrt
	Fingerprint: md5 2d:8f:e9:e7:31:75:f0:f4:ba:b8:54:4c:2f:43:9b:33
	
这样就将私钥生成到`~/.ssh/id_rsa`了，并将公钥打印到了屏幕上。建议将公钥也保存下来，以便以后使用：

	echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCn02fMyD2T1ECmDZso8EG1m/4eo5LJtNlbqCMu0SkABsOUvmTHozrPzoJ10SlcAhjnc84S//VGEAbNJxUTaYn0M7f7M8Q4NBSyPF9DMcNAWKM01OSll8BWLQafZeZneW+UOwO6h1LOd6UEaLS8lhKQUD05+dSzKhPHimZudlhkV2bO7KOkiFh3P4K1GakHBuXitB1V9QH144BKKlSqNXy7TZcJf5/oRkB76ZmdSDDMQtvfCHF1BZwggStgBsu9K6nAl8lz9MOVHCYs9AkEIurldrHLUKvoGJ4QA5yc3bEMQaMH7vu3G5YMysIY4w5+aVuZh5Wg4THoh6yXPfGUc7Mh root@OpenWrt" > ~/.ssh/id_rsa.pub
	
然后就和原来一样，将公钥上传到目标服务器就可以了：

	cat ~/.ssh/id_rsa.pub | ssh remote_username@remote_host 'cat >> .ssh/authorized_keys'
	
但是在登录的时候要注意，使用`ssh`命令需要加`-i`参数指定所用的私钥：
	
	ssh -i ~/.ssh/id_rsa remote_username@remote_host
	
记得使用`scp`等类似命令也要这样。