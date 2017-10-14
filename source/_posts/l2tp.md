title: 搭建L2TP/IPSec VPN
date: 2017-09-10 23:33:33
tags: [VPN, 科学上网, 服务器, 代理, Linux, VPS]
categories: [网络, 科学上网]
photos:
	- /img/l2tpbanner.png
---
之前曾经介绍过[SoftEthern VPN](/posts/softether/)的搭建，最近换了新的VPS，需要重新搭建VPN，由于除了iOS以外的其他平台都可以用[ShadowSocks](/posts/shadowsocks/)的梯子，就想搭建一个最简单的无需安装第三方App的VPN给iOS使用。想到系统自带的VPN可以连接`L2TP over IPSec`，就决定搭一个L2TP的VPN。

由于新VPS装的是CentOS 6，所以CentOS 7风格的命令就写在注释里了。

# 安装
先安装`openswan`和`xl2tpd`：

	yum install openswan xl2tpd
	
如果没有`ppp`也要安装。
	
# 配置IPSec

在`/etc/ipsec.d`中新建一个`vpn.conf`文件，内容如下：

```
conn L2TP-PSK-NAT
    rightsubnet=vhost:%priv
    also=L2TP-PSK-noNAT

conn L2TP-PSK-noNAT
    authby=secret
    pfs=no
    auto=add
    keyingtries=3
    rekey=no
    ikelifetime=8h
    keylife=1h
    type=transport
    left=YOUR_PUBLIC_IP_ADDRESS
    leftprotoport=17/1701
    right=%any
    rightprotoport=17/%any
```

其中`left`的值改为VPS的公网IP。

再新建一个`vpn.secrets`文件，里面写一行：

```
YOUR_PUBLIC_IP_ADDRESS %any: PSK "YOUR_PRE_SHARED_KEY"
```

前面还是公网IP，后面引号里面是自己设置的预共享密钥。

# 更改系统参数
编辑`/etc/sysctl.conf`文件，修改或添加成以下配置：

```
net.ipv4.ip_forward = 1
net.ipv4.conf.default.rp_filter = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.log_martians = 0
net.ipv4.conf.default.log_martians = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.icmp_ignore_bogus_error_responses = 1
```

用`sysctl -p`命令使更改生效。

然后用以下脚本将`/proc/sys/net/ipv4/conf`下配置的值都改为`0`：

```sh
for each in /proc/sys/net/ipv4/conf/*
do
    echo 0 > $each/accept_redirects
    echo 0 > $each/send_redirects
done
```

# 启动IPSec

启动IPSec并加入开机启动：

	service ipsec start		#systemctl start ipsec
	chkconfig ipsec on		#systemctl enable ipsec
	
然后用`ipsec verify`检查一下是否配置正确，正常如下：


	Version check and ipsec on-path                   		[OK]
	Libreswan 3.15 (netkey) on 4.12.9-1.el6.elrepo.x86_64
	Checking for IPsec support in kernel              		[OK]
	 NETKEY: Testing XFRM related proc values
         ICMP default/send_redirects              			[OK]
         ICMP default/accept_redirects            			[OK]
         XFRM larval drop                         			[OK]
	Pluto ipsec.conf syntax                           		[OK]
	Hardware random device                            		[N/A]
	Two or more interfaces found, checking IP forwarding	  [OK]
	Checking rp_filter                                		[OK]
	Checking that pluto is running                    		[OK]
	 Pluto listening for IKE on udp 500               		[OK]
	 Pluto listening for IKE/NAT-T on udp 4500        		[OK]
	 Pluto ipsec.secret syntax                        		[OK]
	Checking 'ip' command                             		[OK]
	Checking 'iptables' command                       		[OK]
	Checking 'prelink' command does not interfere with FIPSChecking for obsolete ipsec.conf options          		[OK]
	Opportunistic Encryption                          		[DISABLED]

如果有异常请检查之前的配置。

# 配置xl2tpd
编辑`/etc/xl2tpd/xl2tpd.conf`配置如下：

```
[global]
listen-addr = YOUR_PUBLIC_IP_ADDRESS
ipsec saref = yes

[lns default]
ip range = 192.168.1.128-192.168.1.254
local ip = 192.168.1.99
require chap = yes
refuse pap = yes
require authentication = yes
name = LinuxVPNserver
ppp debug = yes
pppoptfile = /etc/ppp/options.xl2tpd
length bit = yes
```

其实主要注意监听地址和几个`yes`就行了，其他基本不用动。

然后编辑`/etc/ppp/options.xl2tpd`配置如下：

```
ipcp-accept-local
ipcp-accept-remote
ms-dns	8.8.8.8
ms-dns	8.8.4.4
noccp
auth
crtscts
idle 1800
mtu 1410
mru 1410
nodefaultroute
debug
lock
proxyarp
connect-delay 5000
```

在`/etc/ppp/chap-secrets`里添加帐号密码：

```
# client	server	secret			IP addresses
username1	*	password1		*
username2	*	password2		*
```

按照对应格式填上帐号密码即可。

启动`xl2tpd`并加入开机启动：

	service xl2tpd start		#systemctl start xl2tpd
	chkconfig xl2tpd on		#systemctl enable xl2tpd
	
最后在本地设备上填上地址、预共享密钥、用户名、密码就可以连接了。