title: Digital Ocean开通VPS
date: 2015-11-01 23:33:33
tags: [VPS, 服务器, 代理, Linux, ssh]
categories: [网络, 网站部署]
photos:
	- /img/dobanner.png
---
目前使用体验较好的VPS服务商大概有[Linode](https://www.linode.com/)、[ConoHa](https://www.conoha.jp/en/)、[Digital Ocean](https://www.digitalocean.com/)、[Vultr](https://www.vultr.com/)等等，由于GitHub的[Student Developer Pack](https://education.github.com/pack)有DO家的50美刀优惠，~~但到了三个月后才申请下来，由于注册时已经输过优惠码所以就坑了，~~于是本文使用的是DO的服务。

# 注册DO帐号
通过[邀请地址](https://www.digitalocean.com/?refcode=bbb0bdba1c4e)注册的新账户将获得10美刀的优惠。

按照步骤填完个人信息后，需要绑定支付方式并往新账户里充5美元来激活DO账户。个人建议先绑定PayPal账户，至于PayPal如果没有信用卡的话，绑定储蓄卡也是可以的，个人亲测学校办的交行卡可用。

激活账户后，如果你有GitHub教育优惠就使用它给的优惠码，如果没有可以搜一个最近的10美元或20美元优惠码，注意这样的优惠码**只能输一次**。

![输入优惠码](/img/sspromo.png)

账户余额基本就有15美元了，这足够使用最便宜的套餐3个月了。

# 新建服务器
首先要给服务器取一个Hostname，按个人喜好随意命名。

然后选择套餐，我选择的是最便宜的$5套餐，包含**512M的内存、20G的SSD和1000G流量**每个月。

![选择配置](/img/ssch1.png)

数据中心任意选择，考虑到国际光缆的走向，建议选择位于美国西海岸或者亚太地区的，我选择的是旧金山机房。

选择镜像的时候选一个自己熟悉的系统就可以了，也可以选择带一键安装应用的，按需选择即可。

![选择配置](/img/ssch2.png)

附加选项里**记得选上IPv6**，因为在本文的需求中这是必不可少的。

SSH公钥可以现在添加，也可以以后再添加。之后点创建就可以等着创建完成了。~~DO宣传最少只用55秒就可以创建完成，但是我好像用了几分钟的样子？~~

创建成功后，就会进入到这个VPS的管理界面，从设置中可以看到你的公网地址。同时DO会发送首次登录的密码到你的邮箱中，请注意查收。姑且将这台服务器的地址记作`IP`，然后就可以在DO提供的网页版控制台或本地终端SSH登录了：

	ssh root@remote_host

成功登录后，首先要求更改root密码。如果希望以后本机登录不再输入密码，可以将本地的公钥上传到服务器端：

	cat ~/.ssh/id_rsa.pub | ssh root@remote_host 'cat >> .ssh/authorized_keys'

如果本地`~/.ssh`目录下没有`id_rsa`这样的文件，可以使用`ssh-keygen`命令在该目录下生成。这样以后每次ssh连接时就不用再输密码了，然后就可以随意折腾了。