title: 终端开发终极配置
date: 2016-11-11 21:11:11
tags: [macOS, Unix, Linux, shell]
categories: [奇技淫巧, ＊nix]
photos:
	- /img/terbanner.png
---
终端是每天要用到的工具，所以一定要配置成自己顺手的，才能发挥更高的效率。**iTerm2+zsh+vim**是我目前用过的感觉最强大的配置方案了。

# iTerm2
[iTerm2](https://www.iterm2.com/)是默认终端的终极替代方案，个性化、热键等方面表现非常出色，兼容性也非常好。

![iTerm2](/img/teriterm.png)

直接到其[官网](https://www.iterm2.com/downloads.html)下载安装即可。

对于终端里的特殊字符可能有的无法显示，要安装`powerline`字体：

	git clone https://github.com/powerline/fonts.git --depth=1
	cd fonts && ./install.sh

然后在Preferences - Profiles - Text - Font里选择powerline字体就可以了。

# zsh
**zsh**在命令补全等很多方面上比bash智能很多，首先切换到zsh：

	chsh -s /bin/zsh

[oh-my-zsh](http://ohmyz.sh/)是一个管理zsh配置的框架，包含各种插件和主题，可用以下脚本安装：

	sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

![oh-my-zsh](/img/terzsh.png)

安装完成后编辑`~/.zshrc`，可以编辑`ZSH_THEME`修改主题，或者编辑`plugins`增加插件，对应的文件分别在`~/.oh-my-zsh/themes`和`~/.oh-my-zsh/plugins`下。

# vim
[spf13-vim](http://vim.spf13.com/)是vim的终极配置之一，用以下脚本安装：

	curl https://j.mp/spf13-vim3 -L > spf13-vim.sh && sh spf13-vim.sh

![spf13-vim](/img/tervim.png)

配色文件在`~/.vim/bundle/vim-colorschemes/colors`下，指定名称修改配色：

	echo colorscheme $colorscheme_name  >> ~/.vimrc.local
