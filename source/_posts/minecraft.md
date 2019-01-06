title: Linux上搭建Minecraft服务器
date: 2016-02-14 21:11:11
tags: [Linux, Minecraft, 服务器, 游戏]
categories: [ACG, Minecraft]
photos: 
	- /img/mcbanner.png
---
之前想在树莓派上搭建一个Minecraft服务器，但是只限于局域网内玩有点不爽，所以才想在VPS上开服。这个服务器的地址是**mc.shintaku.xyz**~~，一般时候都是宕机~~，欢迎大家过来乱搞。

# 环境配置
Minecraft是基于Java运行的，所以首先要安装Java环境：

	yum install java

好像比其他平台的安装简单得多。然后为了让Minecraft在后台运行而不受终端操作的干扰，要装一个screen：

	yum install screen

# 启动游戏
因为最开始要安装到**树莓派**上，硬件资源有限，所以这里介绍一个叫[SpigotMC](https://getbukkit.org/download/spigot)的轻量级MC服务器端，是Bukkit的优化版，但是可能游戏中有些材质无法使用。新建一个目录将下载的spigot.jar放进去，然后用以下命令启动：

	java -Xms256M -Xmx512M -jar spigot.jar nogui

后来发现[微软官网](https://minecraft.net/zh-hans/download/server/)有了服务器版的下载，所以服务器配置足够好的话运行这个也是没有问题的，同样是先下载对应版本的server.jar，启动命令相同：

	java -Xms512M -Xmx1024M -jar server.jar nogui

其中前两个参数是指定MC运行的内存范围，然后会出现一系列启动信息，最后就是`Stopping server`。	
# 修改配置文件
启动之后MC的目录下会生成一些其他的文件，先编辑`eula.txt`，将`eula`的值改为`true`：

	eula=true

然后编辑`server.properties`，开始里面应除了一些注释没有其他内容，将以下内容加进去：

```ini
generator-settings=                 #用于设置超平坦世界的函数，留空即可
op-permission-level=4               #设置OP的许可权等级
allow-nether=true                   #是否允许生成/进入下界
level-name=world                    #世界名称及其文件夹名
enable-query=false                  #允许使用GameSpy4协议的服务器监听器
allow-flight=false                  #是否允许玩家在生存模式透过MOD飞行
announce-player-achievements=true   #是否公开显示玩家成就
server-port=25565                   #服务器端口（默认为25565）
level-type=DEFAULT                  #世界类型
enable-rcon=false                   #是否允许远程访问服务器仪表盘
level-seed=                         #世界种子
force-gamemode=false                #玩家是否总是以默认游戏模式进入服务器
server-ip=                          #服务器IP，一般来说留空即可
max-build-height=256                #最高建筑高度（最高256）
spawn-npcs=true                     #是否生成村民NPC
white-list=false                    #是否开启白名单认证
spawn-animals=true                  #是否生成动物
hardcore=false                      #是否开启极限模式
snooper-enabled=true                #是否允许服务器定期发送统计数据
online-mode=false                   #是否开启正版认证（开启后只有正版玩家可进入）
resource-pack=                      #资源包URL（可让玩家选择是否使用服务器提供的资源包）
pvp=true                            #可否PVP
difficulty=1                        #难度
enable-command-block=false          #是否可以使用命令方块
gamemode=0                          #默认游戏模式
player-idle-timeout=0               #如果该玩家无反应超过这个分钟数将会被踢出
max-players=20                      #最大玩家数量
spawn-monsters=true                 #是否生成怪物
generate-structures=true            #是否生成建筑物
view-distance=10                    #客户端视野距离的上限
motd=A Minecraft Server             #服务器在服务器列表页所显示的信息
```
可以按照注释自己进行修改，注意如果没有购买正版需要将`online-mode`一项改为`false`。

一切完成后新开一个screen来启动MC：

	screen -S mc

这时相当于进入一个新终端，`mc`是这个screen的名字。在里面继续执行之前的java启动命令就可以正常启动游戏了。在screen中只要按下`Ctrl+A`再按下`Ctrl+D`就可以回到原来的终端了。再想进入这个screen的话运行`screen -r mc`就可以了。想要停止游戏的话输入`stop`就可以了。

然后在本地启动游戏，选多人游戏并输入服务器地址就能连接了。

另外附上基本的OP命令，就可以方便地管(zhuō)理(nòng)其他玩家了：

```ini
/achievement <give|take> <stat_name|*> [player]
/ban <name> [reason ...]
/ban-ip <address|name> [reason ...]
/banlist [ips|players]
/blockdata <x> <y> <z> <dataTag>
/clear [player] [item] [data] [maxCount] [dataTag]
/clone <x1> <y1> <z1> <x2> <y2> <z2> <x> <y> <z> [maskMode] [cloneMode]
/debug <start|stop>
/defaultgamemode <mode>
/deop <player>
/difficulty <new difficulty>
/effect <player> <effect> [seconds] [amplifier] [hideParticles] OR /effect <player> clear
/enchant <player> <enchantment ID> [level]
/entitydata <entity> <dataTag>
/execute <entity> <x> <y> <z> <command> OR /execute <entity> <x> <y> <z> detect <x> <y> <z> <block> <data> <command>
/fill <x1> <y1> <z1> <x2> <y2> <z2> <TileName> [dataValue] [oldBlockHandling] [dataTag]
/gamemode <mode> [player]
/gamerule <rule name> [value]
/give <player> <item> [amount] [data] [dataTag]
/help [page|command name]
/kick <player> [reason ...]
/kill [player|entity]
/list
/me <action ...>
/op <player>
/pardon <name>
/pardon-ip <address>
/particle <name> <x> <y> <z> <xd> <yd> <zd> <speed> [count] [mode]
/playsound <sound> <player> [x] [y] [z] [volume] [pitch] [minimumVolume]
/replaceitem <entity|block> ...
/save-all
/save-off
/save-on
/say <message ...>
/scoreboard <objectives|players|teams> ...
/seed
/setblock <x> <y> <z> <TileName> [dataValue] [oldBlockHandling] [dataTag]
/setidletimeout <Minutes until kick>
/setworldspawn [<x> <y> <z>]
/spawnpoint [player] [<x> <y> <z>]
/spreadplayers <x> <z> <spreadDistance> <maxRange> <respectTeams true|false> <player ...>
/stats <entity|block> ...
/stop
/summon <EntityName> [x] [y] [z] [dataTag]
/tell <player> <private message ...>
/tellraw <player> <raw json message>
/testfor <player> [dataTag]
/testforblock <x> <y> <z> <TileName> [dataValue] [dataTag]
/testforblocks <x1> <y1> <z1> <x2> <y2> <z2> <x> <y> <z> [mode]
/time <set|add|query> <value>
/title <player> <title|subtitle|clear|reset|times> ...
/toggledownfall
/tp [target player] <destination player> OR /tp [target player] <x> <y> <z> [<y-rot> <x-rot>]
/trigger <objective> <add|set> <value>
/weather <clear|rain|thunder> [duration in seconds]
/whitelist <on|off|list|add|remove|reload>
/worldborder <set|center|damage|warning|get|add> ...
/xp <amount> [player] OR /xp <amount>L [player]
```

