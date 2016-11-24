title: 使用dd命令制作启动盘
date: 2015-12-21 21:11:11
tags: [macOS, Unix, Linux]
categories: [奇技淫巧, ＊nix]
photos: 
	- /img/ddbanner.png
---
双十二期间因为有十几块钱的代金券用不出去剁手了一个**树莓派2代**~~为了二两醋买一斤螃蟹~~。货到了以后就要往micro SD卡里装一个系统。之前用Windows的时候一直用软碟通往U盘之类的介质中写入镜像文件，换了rMBP之后还没干过这类事，所以一时摸不着头脑。后来发现有`dd`这样一个命令可以用来制作启动盘。

在Unix上，硬件的设备驱动器和特殊设备文件就像普通文件一样，出现在文件系统中；只要在各自的驱动程序中实现了对应的功能，dd也可以读取或写入到这些文件。这样，dd也可以用在备份硬件的引导扇区、获取一定数量的随机数据等任务中。dd程序也可以在复制时处理数据，例如转换字节序、或在ASCII与EBCDIC编码间互换。

# 查询驱动器名
插入U盘或读卡器后首先需要知道其在当前系统下的驱动器名，可以使用`diskutil list`命令：

	/dev/disk0 (internal, physical):
	   #:                       TYPE NAME                    SIZE       IDENTIFIER
	   0:      GUID_partition_scheme                        *251.0 GB   disk0
	   1:                        EFI EFI                     209.7 MB   disk0s1
	   2:          Apple_CoreStorage Macintosh HD            250.1 GB   disk0s2
	   3:                 Apple_Boot Recovery HD             650.0 MB   disk0s3
	/dev/disk1 (internal, virtual):
	   #:                       TYPE NAME                    SIZE       IDENTIFIER
	   0:                  Apple_HFS Macintosh HD           +249.8 GB   disk1
                                 Logical Volume on disk0s2
                                 6507AD0A-D7FF-4641-AC5C-012CCD75AA23
                                 Unlocked Encrypted
	/dev/disk2 (external, physical):
	   #:                       TYPE NAME                    SIZE       IDENTIFIER
	   0:     FDisk_partition_scheme                        *4.0 GB     disk2
	   1:                 DOS_FAT_32 UNTITLED                4.0 GB     disk2s1
	   
可以看到`disk0`当然是电脑的内置物理磁盘，`disk1`是内置虚拟磁盘，`disk2`才是要写入的U盘。然后通过`diskutil unmountDisk /dev/disk2`命令卸载刚才插入的驱动器，出现：

	Unmount of all volumes on disk2 was successful
	
说明卸载成功。

# 写入镜像文件
使用命令：

	sudo dd if=disk_image_file of=/dev/rdisk2 bs=1m
	
注意使用`sudo`，中间`of`参数中的盘符中记得改成`rdisk`（据我测试这里如果没加`r`写入过程会非常缓慢）。还有`bs`参数代表的是块大小~~学过体系结构的都知道~~，单位可以使用b、k、m、g等，默认是512字节，但不知道在这里不同大小会影响什么。

写入成功后会返回一个报告：

	501+1 records in
	501+1 records out
	526260224 bytes transferred in 82.961110 secs (6343457 bytes/sec)
	
这里看到写入到一个2.0的U盘速度大概6兆/秒，如果上面`of`中没加`r`的话速度则不到1兆/秒：

	526260224 bytes transferred in 552.306611 secs (952841 bytes/sec)
	
到这里写入完成，使用`diskutil eject /dev/disk2`弹出驱动器即可，出现：

	Disk /dev/disk2 ejected

说明弹出成功，全部完成。