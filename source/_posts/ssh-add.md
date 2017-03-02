title: macOS自动添加ssh密钥
date: 2017-01-23 22:22:22
tags: [ssh, macOS]
categories: [奇技淫巧, macOS]
photos: 
	- /img/sshaddbanner.png
toc: false
---
本来是没有这种问题的，但是自从macOS升级到**Sierra 10.12**以后`ssh-agent`不会自动加载密码短语了，每次重启后ssh登机器时总是提示输入密钥的密码短语，所以每次开机都要用`ssh-add -K ~/.ssh/id_rsa`将它手动添加到钥匙串中才行。

后来在[GitHub](https://github.com/lionheart/openradar-mirror/issues/15361#issuecomment-270242512)找到了解决方案，其实就是简单配置了一下`~/.ssh/config`：

```nginx
Host *
    UseKeychain yes
    AddKeysToAgent yes
    IdentityFile ~/.ssh/id_rsa
    IdentityFile ~/.ssh/github_rsa
```

用`IdentityFile`指定要自动添加的密钥即可。

