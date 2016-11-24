title: Qt5.5程序的打包与发布
date: 2015-10-18 21:11:11
tags: [Qt, Windows]
categories: [奇技淫巧, Windows]
photos: 
	- /img/qtbanner.png
---
因为要做C＋＋软件实习的大作业，所以选择了易于上手的Qt作为图形化界面程序开发框架，IDE自然就是Qt Creator了。但是Qt程序的打包发布却是不接地气，因为依赖实在是太多了。有的时候加好依赖后在自己的开发环境上可以运行，但脱离开发环境却依旧报
> This application failed to start because it could not find or load the Qt platform plugin "windows".

![无法加载qwindows](/img/qtwindows.png)

甚至

![Runtime](/img/qtruntime.png)
于是现在亟待解决的问题就是如何能够找到所有所需依赖并能够将其打包引用。

# 查找依赖工具
通过阅读[官方文档](http://doc.qt.io/qt-5/windows-deployment.html#application-dependencies)发现，Qt里面内置了一个dll依赖性检查工具——`windeploy.exe`。这个程序应当在`~/Qt/Qt5.5.0/5.5/mingw492_32/bin/`下，通过命令提示符执行它可以得到使用方法：

	C:\Users\Shintaku>C:\Qt\Qt5.5.0\5.5\mingw492_32\bin\windeployqt.exe
    Please specify the binary or folder.

    Usage: C:\Qt\Qt5.5.0\5.5\mingw492_32\bin\windeployqt.exe [options] [files]
    Qt Deploy Tool 5.5.0

    The simplest way to use windeployqt is to add the bin directory of your Qt installation 
    (e.g. <QT_DIR\bin>) to the PATH variable and then run:
      windeployqt <path-to-app-binary>
    If ICU, ANGLE, etc. are not in the bin directory, they need to be in the PATH variable. 
    If your application uses Qt Quick, run:
      windeployqt --qmldir <path-to-app-qml-files> <path-to-app-binary>

    Options:
      -?, -h, --help             Displays this help.
      -v, --version              Displays version information.
      --dir <directory>          Use directory instead of binary directory.
      --libdir <path>            Copy libraries to path.
      --debug                    Assume debug binaries.
      --release                  Assume release binaries.
      --release-with-debug-info  Assume release binaries with debug information.
      --force                    Force updating files.
      --dry-run                  Simulation mode. Behave normally, but do not
                                 copy/update any files.
      --no-plugins               Skip plugin deployment.
      --no-libraries             Skip library deployment.
      --qmldir <directory>       Scan for QML-imports starting from directory.
      --no-quick-import          Skip deployment of Qt Quick imports.
      --no-translations          Skip deployment of translations.
      --no-system-d3d-compiler   Skip deployment of the system D3D compiler.
      --compiler-runtime         Deploy compiler runtime (Desktop only).
      --no-compiler-runtime      Do not deploy compiler runtime (Desktop only).
      --webkit2                  Deployment of WebKit2 (web process).
      --no-webkit2               Skip deployment of WebKit2.
      --json                     Print to stdout in JSON format.
      --angle                    Force deployment of ANGLE.
      --no-angle                 Disable deployment of ANGLE.
      --list <option>            Print only the names of the files copied.
                                 Available options:
                                  source:   absolute path of the source files
                                  target:   absolute path of the target files
                                  relative: paths of the target files, relative
                                            to the target directory
                                  mapping:  outputs the source and the relative
                                            target, suitable for use within an
                                            Appx mapping file
      --verbose <level>          Verbose level.

    Qt libraries can be added by passing their name (-xml) or removed 
    by passing the name prepended by --no- (--no-xml). Available libraries:
    bluetooth clucene concurrent core declarative designer designercomponents
    enginio gui qthelp multimedia multimediawidgets multimediaquick network nfc
    opengl positioning printsupport qml qmltooling quick quickparticles quickwidgets

    script scripttools sensors serialport sql svg test webkit webkitwidgets
    websockets widgets winextras xml xmlpatterns webenginecore webengine
    webenginewidgets 3dcore 3drenderer 3dquick 3dquickrenderer 3dinput geoservices

    Arguments:
      [files]                    Binaries or directory containing the binary.


发现当`windeploy`有一个参数为`二进制文件`时，会在其所在目录下生成该文件所依赖的所有文件。

# 提取依赖文件
于是我们可以在任意目录下新建一个文件夹，然后将Qt编译生成的`可执行文件`复制到新文件夹下。
接下来在命令提示符里执行`windeploy yourProgram.exe`便可以将其所需依赖加入到新文件夹中了。

    > C:\Qt\Qt5.5.0\5.5\mingw492_32\bin\windeployqt.exe Library.exe
    Library.exe 32 bit, release executable
    Adding Qt5Svg for qsvgicon.dll
    Direct dependencies: Qt5Core Qt5Gui Qt5Sql Qt5Widgets
    All dependencies   : Qt5Core Qt5Gui Qt5Sql Qt5Widgets
    To be deployed     : Qt5Core Qt5Gui Qt5Sql Qt5Svg Qt5Widgets
    Updating Qt5Core.dll.
    Updating Qt5Gui.dll.
    Updating Qt5Sql.dll.
    Updating Qt5Svg.dll.
    Updating Qt5Widgets.dll.
    Updating libGLESV2.dll.
    Updating libEGL.dll.
    Updating D3Dcompiler_47.dll.
    Creating directory iconengines.
    Updating qsvgicon.dll.
    Creating directory imageformats.
    Updating qdds.dll.
    Updating qgif.dll.
    Updating qicns.dll.
    Updating qico.dll.
    Updating qjp2.dll.
    Updating qjpeg.dll.
    Updating qmng.dll.
    Updating qsvg.dll.
    Updating qtga.dll.
    Updating qtiff.dll.
    Updating qwbmp.dll.
    Updating qwebp.dll.
    Creating directory platforms.
    Updating qwindows.dll.
    Creating directory sqldrivers.
    Updating qsqlite.dll.
    Updating qsqlmysql.dll.
    Updating qsqlodbc.dll.
    Updating qsqlpsql.dll.
    Creating C:\Users\Shintaku\Desktop\release\translations...
    Creating qt_ca.qm...
    Creating qt_cs.qm...
    Creating qt_de.qm...
    Creating qt_fi.qm...
    Creating qt_fr.qm...
    Creating qt_hu.qm...
    Creating qt_it.qm...
    Creating qt_ja.qm...
    Creating qt_ko.qm...
    Creating qt_lv.qm...
    Creating qt_ru.qm...
    Creating qt_sk.qm...
    Creating qt_uk.qm...

强烈建议在此文件夹下运行一下程序试试，因为这个工具并不一定能将所有必需的依赖加进来，这时运行极有可能还会报
![系统错误](/img/qterror.png)
如果这样，请移步`~/Qt/Qt5.5.0/5.5/mingw492_32/bin`下找到缺少的`.dll`文件将它们移到新文件夹下。经过这步检查，在开发环境下应该可以正常运行可执行文件了。

# 修改引用路径
这时请把这个文件夹拷贝到其他运行环境上测试程序是否能成功运行：如果可以成功运行，那么请跳过这一步；如果不能成功运行，而且依旧报
> This application failed to start because it could not find or load the Qt platform plugin "windows".

则说明程序没有成功引用到动态链接库，这时应当修改源代码。
找到工程中的`main.cpp`文件，在主函数开头中加入一句
``` cpp
QApplication::addLibraryPath(".");
```
重新编译并替换新文件夹中的.exe文件，再放到其他运行环境上就应该可以成功引用到链接库了。

# 打包程序发布
这时我们就可以打包程序了。我使用的是一款叫做[Enigma Virtual Box](http://enigmaprotector.com/en/aboutvb.html)的封装工具，这个软件的名字和当年图灵破译的英格玛机一样。
软件装好后运行，从主界面选择输入目标文件和输出文件的路径，然后在下面`Files`里添加所有需要的链接库
![添加文件](/img/qt3.png)
然后有一个`Files Options`里可选是否压缩文件，压缩后会比较小，然后点`Process`就行了
![压缩文件](/img/qt4.png)
不久后会在选择的输出路径中生成最终打包好的程序，大功告成。