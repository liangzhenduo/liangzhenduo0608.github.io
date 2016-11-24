title: Mac上进行Verilog仿真
date: 2016-04-11 21:11:11
tags: [macOS, Verilog]
categories: [手帐, 课程]
photos: 
	- /img/vlbanner.png
---
这学期上VLSI系统设计这门课，同时顺带着把计算机设计与调试的课程设计做了。往FPGA上烧写之前要用Verilog进行仿真，在实验室直接用机房的ModelSim仿真了，但是课下在虚拟机上做有诸多的不便，于是就研究了一下在Mac下写Verilog的方法。

# 配置Sublime代码高亮
Sublime Text默认是不支持Verilog代码高亮的，可以通过安装插件增加对其的支持。首先要安装Sublime包管理工具，按``control+` ``打开控制台，并运行以下代码（以Sublime Text 2为例）：

```py
import urllib2,os,hashlib; h = '2915d1851351e5ee549c20394736b442' + '8bc59f460fa1548d1514676163dafc88'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); os.makedirs( ipp ) if not os.path.exists(ipp) else None; urllib2.install_opener( urllib2.build_opener( urllib2.ProxyHandler()) ); by = urllib2.urlopen( 'http://packagecontrol.io/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); open( os.path.join( ipp, pf), 'wb' ).write(by) if dh == h else None; print('Error validating download (got %s instead of %s), please try manual install' % (dh, h) if dh != h else 'Please restart Sublime Text to finish installation')
```

安装完后重启，按`command+shift+P`唤出命令面板，打开`Install Package`包管理工具：

![Install Package](/img/vlinstall.png)

然后查找`Verilog`，将搜到的自动补全和代码高亮插件装上重启就可以了：

![Verilog](/img/vlverilog.png)

# 安装Icarus Verilog
Icarus Verilog是Verilog硬件描述语言的实现工具之一。该软件以GNU通用公共许可协议发布，是一个自由软件。它支持Verilog对应的的IEEE 1995、IEEE 2001和IEEE 2005三个不同的版本，并对SystemVerilog的部分内容提供支持。

首先保证已经安装了Homebrew，然后通过brew安装：

	brew install icarus-verilog
	
# 安装Scansion
Scansion是Mac平台下的一个VCD文件查看工具，可以去[http://www.logicpoet.com/downloads/](http://www.logicpoet.com/downloads/)下载其最新版本并安装。

# 编译仿真
随便新建一个测试文件叫test.v：

```verilog
module vaddsws( vra, vrb, vrt, sat );

input  [31 : 0] vra;
input  [31 : 0] vrb;
output [31 : 0] vrt;
output          sat;

wire   [31 : 0] sum;
wire   [31 : 0] vrt;
wire            sat;

assign {sat, sum}	= vra + vrb;
assign vrt = (vra[31]^vrb[31]) ? sum : (vra[31]&&vrb[31] ? (sum[31] ? sum : 32'h80000000) : (sum[31] ? 32'h7fffffff : sum));

endmodule
```

再对其新建testbench文件test_tb.v：

```verilog
`timescale 1ns/100ps
`include "test.v"

module vaddsws_tb;

reg	[31: 0]	vra;
reg	[31: 0]	vrb;
wire	[31: 0]	vrt;
wire	sat;

initial
begin
	$dumpfile("test.vcd");
	$dumpvars(0, vaddsws_tb);
	assign vra=32'hffffffff;
	assign vrb=32'hffffffff;
	#100
	assign vra=32'h01234567;
	assign vrb=32'h76543210;
	#100
	$finish;
end

vaddsws add( .vra(vra), .vrb(vrb), .vrt(vrt), .sat(sat) );

endmodule
```

注意testbench文件的第二行中`include`宏是为了引用前一个文件的模块定义，如果在Windows下用ModelSim时把它注释掉就可以了。第13行是为了生成波形文件以便在Scansion里查看。

源码编辑好后执行以下命令编译执行：

	iverilog -o test.vvp test_tb.v
	./test.vvp
	
生成vcd格式的波形文件用Scansion打开即可（也可以使用命令`open -a Scansion test.vcd`）：

![输出波形](/img/vltest.png)