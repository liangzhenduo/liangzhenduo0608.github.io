---
title: Hexo博客使用MathJax公式
tags:
  - JavaScript
  - Node.js
categories:
  - 网络
  - 网站部署
photos:
  - /img/mathjaxbanner.png
date: 2019-01-20 14:14:14
---

最近手贱将Hexo的博客的版本升到了3.8.0，顺便将npm组件也都升级了。一开始没有发现什么问题，后来打开一篇带公式的文章发现里面的部分[MathJax](https://www.mathjax.org/)公式渲染失败了。想到之前曾经因为Markdown里面的下划线`_`表示斜体，和MathJax里的下标冲突了，之前改过的node_modules被更新覆盖了，这次索性重新搞一遍。

# 更换渲染引擎
卸载原来的`hexo-renderer-marked`，换成专门对MathJax魔改过的`hexo-renderer-kramed`（注意`kram`这个单词的拼写）：

    npm uninstall hexo-renderer-marked --save
    npm install hexo-renderer-kramed --save

再安装`hexo-renderer-mathjax`渲染器：

    npm install hexo-renderer-mathjax --save

# 更改字符集
为了避免语义冲突，修改`node_modules/kramed/lib/rules/inline.js`文件的`escape`和`em`：
```js
  //escape: /^\\([\\`*{}\[\]()#$+\-.!_>])/,
  escape: /^\\([`*\[\]()#$+\-.!_>])/,
```

```js
  //em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  em: /^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
```

# 更改cdn链接
修改`node_modules/hexo-renderer-mathjax/mathjax.html`的最后一行，将`http`改成`https`：
```html
<!--script src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script-->
<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
```

这样是为了避免在网站为https协议时请求http的内容时被浏览器block。使用`hexo s`预览是否已生效。
