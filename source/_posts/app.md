title: 将jar程序打包成app
date: 2016-05-20 20:00:00
tags: [macOS, Minecraft]
categories: [奇技淫巧, macOS]
photos: 
	- /img/appbanner.png
---
Mac下的Minecraft启动器是jar文件，每次需要启动的时候都要进入到它所在的目录下双击用**Jar Launcher**运行，或者使用`jawa -jar`命令启动，非常麻烦。所以想了一个办法，用**Automator**将它打包成app文件放到`Application`目录下就会出现在**Launchpad**里了。

# 新建app
首先打开Automator创建一个Application：

![Application](/img/appnew.png)

选择`Run Shell Script`并将jar的运行命令填进去：

	java -jar /Applications/Minecraft.app/Contents/Jar/Minecraft\ Launcher.jar
	
![Run Shell Script](/img/appshell.png)

然后改个名字保存到Application下。

# 打包jar
打开新建好的app的Contents，在里面新建一个Jar目录，并将启动器的jar文件移进去（只要跟上面命令的路径自洽即可）：

![Jar](/img/appjar.png)

然后可以用Automator右上角的Run测试一下是否可以正常执行：

![Run](/img/apprun.png)

# 更改图标
打开app的Info，点击图标后会出现一个蓝圈：

![Info](/img/appicon.png)

这时将复制好的图片粘贴到这里就可以更改图标了。

现在就可以到Launchpad里启动Minecraft的启动器了：

![Launchpad](/img/applaunch.png)