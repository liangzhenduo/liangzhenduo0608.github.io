title: GoAgent科学上网攻略
date: 2015-01-08 23:33:33
tags: [GoAgent, 科学上网, 代理]
categories: [网络, 科学上网]
photos:
	- /img/gabanner.png
---
***目前该项目已停止维护，并被开发者删除。有兴趣的童鞋请参考我fork下来的[3.2.3版本](https://github.com/liangzhenduo0608/goagent)。***

> 翻出长城，我有思想准备。是要触及一些人的利益，是会触及一些人的利益，是会有不同的观点和看法的，而且，已经形成防火长城的这些机构社会联系蛮广泛的，是有舆论能力的。我们敢于翻墙，也就是说呀，像古人讲的，**“敢同恶鬼争高下，不向霸王让寸分”**，就是要有这种精神。在此呢，你比如说，也有不少人给Google泼脏水，包括给Twitter、给Facebook泼脏水。甚至，说到一〇四师从广场上路过，怎么开59式坦克，一派胡言！我感到非常气愤，啊，一派胡言。

> 嗯，方滨兴，啊，本来是，这个工程院，这个很早以前就认可的院士，在北邮期间，当时当校长就当得很成功。清华著名教授唐泽圣，啊，那是他的老师，啊，对他非常欣赏。结果，有的这些头衔，就是怕说，担心会不会有人给人家造谣，说他通过当校长还想出点名，把他的几个职位一朝就全辞掉了，啊那是前年的事儿了，就全不干了。现在就几乎啊，嗯，在工程院，就是与病魔做一做斗争，啊，我对他做出的这种牺牲我都很感动的，啊。

具体GoAgent怎么用呢，请参照以下步骤：

# 创建GAE应用
## 登录GAE
GoAgent是使用跨平台语言Python开发、基于GPL自由软件协议的代理软件。它利用`Google App Engine (GAE)`的服务器充当代理。因此要使用GoAgent就需要一个Google帐户，前往[GAE](http://appengine.google.com)登录（有Google账号或者关联Google的账号直接登录即可，比如我的Google帐号就是hotmail的邮箱，深藏功与名）。

其实这一步就是需要翻墙的，有些人到这一步就因为无法翻墙登陆不了GAE，从而无法使用GoAgent，陷入了死循环。

## 创建应用
成功登录后就可以点击上图中的`Create Application`创建新应用。每个账户可以创建至多25个应用（现在网上说10个的都是几年前的版本了）。

首次创建还要验证一下手机号，格式为`+86XXXXXXXXXXX`，不久会收到一条验证短信，把验证码填进去就可以激活GAE账号了。

接下来就可以创建应用了，填入二级域名的Appid和应用名称。Appid要求为6～30个字符，可以包含小写字母、数字和`-`，必须以字母开头，不得以`-`结尾。`[your_appid].appspot.com`就是你的应用地址了。Appid一定要牢牢记住。

![创建新应用](/img/gacreate.png)

每一个应用提供1GB的流量，月流量是60GB（传出带宽是1GB/天，传入带宽1GB/天），虽然有如此的限制，但只是上网页用起来毫无压力，从来没有用超过呢。如果觉得一个应用的每天1G不够用，可以多创建几个。

# 本地配置
## 下载GoAgent客户端
GoAgent的项目主页已经从[Google Code](https://code.google.com/p/goagent/)转移到[GitHub](https://github.com/goagent/goagent)了，但是GitHub上的项目也被移除了，所以还想尝试的童鞋请到我fork的分支上下载[GoAgent 3.2.3](https://github.com/liangzhenduo0608/goagent)。

![GitHub上的GoAgent项目](/img/gagithub.png)

可以把这个项目clone到本地：
	
	git clone https://github.com/liangzhenduo0608/goagent

或者Download ZIP并解压出来。

## 上传Python服务
进到server目录下，Windows用户以管理员身份运行`uploader.bat`，Mac/Linux用户用Python运行`uploader.py`，按照提示依次填入Appid、Email地址和口令（如果app创建时开启了两步验证，口令需要填入两步验证设置的密码，但现在创建的app基本上都跳过设置两步验证了，所以填邮Google帐户密码就行了）。上传成功会出现如下界面：

	警告：建议先启动 goagent 客户端或者 VPN 然后再上传，如果您的 VPN 已经打开的话，请按回车键继续。
	
	===============================================================
	 GoAgent服务端部署程序, 开始上传 gae 应用文件夹
	 Linux/Mac 用户, 请使用 python uploader.py 来上传应用
	===============================================================

	请输入您的appid, 多个appid请用|号隔开
	注意：appid 请勿包含 ios/android/mobile 等字样，否则可能被某些网站识别成移动设备。
	APPID: your_appid
	Application: your_appid
	Host: appengine.google.com
	Rolling back the update.
	Email: your_google_account
	Password for your_google_account: 
	Application: your_appid; version: 1
	Host: appengine.google.com
	
	Starting update of app: your_appid, version 1
	Scanning files on local disk.
	Cloning 1 static file.
	Cloning 3 application files.
	Compilation starting.
	Compilation completed.
	Starting deployment.
	Checking if deployment succeeded.
	Deployment successful.
	Checking if updated app verion is serving.
	Completed update of app: your_appid, version 1
	
	上传成功，请不要忘记编辑proxy.ini把你的appid填进去，谢谢。按回车键退出程序。

验证是否成功也可以打开`https://[your_appid].appspot.com/_gh/ `查看状态，像下面一样就说明成功了：

> GoAgent Python Server 3.2.0 works, deployed at 2015-01-08 23:33:33

这里请注意一下，如果你用的是老版本的goagent比如2.x.x的域名后缀应为`*.appspot.com/2`，而新版本的3.x.x的域名后缀应为`*.appspot.com/_gh/`，因此之前用老版本而现在更新到新版本的用户需要重新上传。

## 配置proxy.ini
这一步做的就是上一步终端中最后一行说的，修改`/local/proxy.ini`中`gae`下的`appid`和`password`并保存：

```ini
[gae]
enable = 1
appid = your_appid
password = your_password
path = /_gh/
mode = https
ipv6 = 0
sslversion = TLSv1
window = 7
cachesock = 1
headfirst = 1
keepalive = 0
obfuscate = 0
validate = 0
transport = 0
options =
regions =
```
# 启动服务
## 运行GoAgent
如果以上步骤都正确的话，Windows以管理员身份运行local下的goagent.exe了，Mac/Linux用户用Python运行proxy.py，应该会出现如下界面：

	------------------------------------------------------
	GoAgent Version    : 3.2.3 (python/2.7.1 gevent/1.0 pyopenssl/0.13.1)
	Listen Address     : 127.0.0.1:8087
	GAE Mode           : https (TLSv1)
	GAE APPID          : your_appid
	Pac Server         : http://192.168.1.101:8086/proxy.pac
	Pac File           : file:///goagent-3.0/local/proxy.pac
	------------------------------------------------------ 

如果没有出现其他警告或错误，就说明配置成功了。

## 安装Chrome插件	
GoAgent可以设置全局代理，也可以设置浏览器代理。因此下面提供的是使用Chrome浏览器插件代理的方法。

从Chrome浏览器打开[Proxy SwitchyOmega](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?hl=cn-ZH)并添加到浏览器。如果被墙了就到[GitHub](https://github.com/FelisCatus/SwitchyOmega/releases)下载`crx`文件手动添加。在其配置界面`Import/Export`里把`/local/SwitchyOptions.bak`导入进去：

![导入配置](/img/gaimport.png)

可以从浏览器右上角小圈圈插件那切换各种模式：

+ Direct是不通过代理直接连接
+ GoAgent是完全通过代理访问
+ Auto Switch是自动切换，根据设置判定哪些网站通过代理，哪些网站不通过代理。

个人比较倾向使用自动切换模式，也比较省流量，也防止有些内地的网站因为代理而打不开。也可以在`Switch rules`里添加需要自动代理的网站。

## 导入证书
打开chrome设置-管理证书-受信任的根证书颁发机构，将`/local/CA.crt`导入到进去：

![导入证书](/img/gacert.png)
 
至此，以后每次需要代理的时候只要运行`goagent.exe`或`proxy.py`就行了，此时你就可以通过Google公司加州山景城的服务器畅游墙外的世界了。

> 这个大家啊，如果，对翻墙有什么想法，有什么看法，尽可以提。我觉得，我相信，广大记者朋友，是客观的。这个也欢迎大家，有机会，到墙外去，墙外人非常热心，而且这些年的这个发展，这个大家团结一致、同心同德，已经取得了很大的进步。我相信，我们这些这个记者朋友们，你们对今天翻墙，放出干货的报道，会是客观的，准确的。好，谢谢大家。