---
title: 大型属性网络的语义社团识别
tags:
  - 机器学习
categories:
  - 机器学习
  - 论文
photos:
  - /img/scibanner.png
date: 2017-04-28 15:15:15
---

> 原文：[Semantic community identification in large attribute networks](http://www.cse.wustl.edu/~zhang/publications/aaai16-attributenetworks.pdf)

# 摘要
网络的模块或社团结构的识别是理解网络语义和功能的关键。虽然已经开发了许多主要探索网络拓扑的社区检测方法，但它们只提供了少量语义信息的社团发现。尽管结构和语义密切相关，但在一起发现并分析这两个基本网络属性上只做了很少的工作。通过在节点上整合网络拓扑和语义信息，如节点属性，研究了社团检测并同时推断其语义的问题。本文提出了一种具有两组参数，社团成员矩阵和社团属性矩阵的新型[非负矩阵因式分解](https://en.wikipedia.org/wiki/Non-negative_matrix_factorization)（NMF）模型，并提出了有效的更新规则保证收敛地评估参数。节点属性的使用改进了社团检测，并为所得到的网络社团提供了语义解释。在人造和真实的世界网络上的广泛实验结果不仅显示了新方法较先进方法的优越性能，而且还展示了其对社团的语义注释能力。

# SCI模型
考虑一个有\\(n\\)个节点\\(V\\)和\\(e\\)条边\\(E\\)的无向网络\\(G=(V,E)\\)，用二值邻接矩阵\\(\mathbf{A}\in\mathbb{R}^{n\times n}\\)表示。与每个节点\\(i\\)相关联的是其属性\\(\mathbf{S}_i\\)，其可以是节点的语义特征。节点的属性是\\(m\\)维二值向量形式的，所有节点的属性可以由节点属性矩阵\\(\mathbf{S}\in\mathbb{R}^{n\times m}\\)表示。社团识别的问题是将网络\\(G\\)划分为\\(k\\)个社团，并推断每个社团的相关属性或语义。

## 建模网络拓扑
将属于社团\\(j\\)的节点\\(i\\)的先验定义为\\(U_{ij}\\)。网络中所有节点的社团成员为\\(\mathbf{U}=(U_{ij})\\)，其中\\(i=1,2,\ldots,n\\)且\\(j=1,2,\ldots,k\\)。因此\\(U_{ir}U_{pr}\\)表示社团\\(r\\)中节点\\(i\\)和\\(p\\)之间边数的期望。对所有社团求和，\\(i\\)和\\(p\\)之间边数的期望是\\(\sum_{r=1}^kU_{ir}U_{pr}\\)。 这种生成边的过程意味着如果两个节点具有相似的社团关系，则它们具有更高的连接倾向。节点对之间的期望边数应尽可能与由\\(\mathbf{A}\\)表示的网络拓扑一致，在矩阵行列式上产生以下函数：
$$\min\limits_{\mathbf{U}\ge0}\|\mathbf{A}-\mathbf{UU}^T\|_F^2$$

## 建模节点属性
定义社团\\(r\\)具有属性\\(q\\)的倾向为\\(C_{qr}\\)。因此对于所有社团，有一个社团属性矩阵\\(\mathbf{C}=(C_{qr})\\)，对于\\(q=1,2,\ldots,m\\)和\\(r=1,2,\ldots,k\\)，其中第\\(r\\)列\\(\mathbf{C}_r\\)是社团\\(r\\)的属性成员。如果节点的属性与社团的属性高度相似，那么该节点可能更倾向于在这个社团中。 因此，在\\(S_i\\)中描述的具有相似属性的节点可能形成一个社团，其可由节点的一般属性来描述。特别地，节点\\(i\\)属于社团\\(r\\)的倾向可表示为\\(U_{ir}=\mathbf{S}_i\mathbf{C}_r\\)。注意如果节点\\(i\\)和社团\\(r\\)的属性完全不一致，则节点\\(i\\)一定不属于社团\\(r\\)，即\\(U_{ir}=0\\)。由于所有节点\\(mathbf{U}\\)的社团成员为结合节点和社团的属性提供了指导，有以下优化函数：
$$\min\limits_{\mathbf{C}\ge0}\|\mathbf{U}-\mathbf{SC}\|_F^2$$
为了给每个社团选择最相关的属性，为矩阵\\(\mathbf{C}\\)的每列添加一个\\(l_1\\)稀疏范数。另外为了防止\\(\mathbf{C}\\)的一些列的值过大（每个社团都有一些有意义的属性），对\\(\mathbf{C}\\)有约束\\(\sum_{j=1}^k\|\mathbf{C}(:,j)\|_1^2\\)，产生以下目标函数：
$$\min\limits_{\mathbf{C}\ge0}\|\mathbf{U}-\mathbf{SC}\|_F^2+\alpha\sum_{j=1}^k\|\mathbf{C}(:,j)\|_1^2$$
其中\\(\alpha\\)是权衡第一误差项和第二稀疏项的非负参数。

## 统一模型
通过结合网络拓扑模型和节点属性模型的目标函数，有以下完整函数：
$$\min\limits_{\mathbf{U}\ge0,\mathbf{C}\ge0}L=\|\mathbf{U}-\mathbf{SC}\|_F^2+\alpha\sum_{j=1}^k\|\mathbf{C}(:,j)\|_1^2+\beta\|\mathbf{A}-\mathbf{UU}^T\|_F^2$$
其中\\(\beta\\)是调整网络拓扑权重的正参数。

# 优化
由于上面的目标函数不是凸的，所以获得最优解不切实际。局部最小值可以使用[专门化-最小化](https://en.wikipedia.org/wiki/MM_algorithm)框架来实现。这里描述一个固定\\(\mathbf{C}\\)迭代更新\\(\mathbf{U}\\)然后固定\\(\mathbf{U}\\)迭代更新\\(\mathbf{C}\\)的算法，这保证在每次迭代之后不增加目标函数。具体公式展示为如下两个子问题。

## *U*问题
当固定\\(\mathbf{C}\\)更新\\(\mathbf{U}\\)时，需要解决以下问题：
$$\min\limits_{\mathbf{U}\ge0}L(\mathbf{U})=\|\mathbf{U}-\mathbf{SC}\|_F^2+\beta\|\mathbf{A}-\mathbf{UU}^T\|_F^2$$
为此为\\(\mathbf{U}\\)上的非负约束引入拉格朗日乘数矩阵\\(\mathbf{\Theta}=(\Theta_{ij})\\)，得到以下等价目标函数：
$$L(\mathbf{U})=tr(\mathbf{UU}^T-\mathbf{UC}^T\mathbf{S}^T-\mathbf{SCU}^T+\mathbf{SCC}^T\mathbf{S}^T)+\beta tr(\mathbf{AA}-\mathbf{AUU}^T-\mathbf{UU}^T\mathbf{A}+\mathbf{UU}^T\mathbf{UU}^T)+tr(\mathbf{\Theta U}^T)$$
将对\\(\mathbf{U}\\)的导数\\(L(\mathbf{U})\\)设为0，有：
$$\mathbf{\Theta}=-2\mathbf{U}+2\mathbf{SC}+4\beta\mathbf{AU}-4\beta\mathbf{UU}^T\mathbf{U}$$
根据对非负\\(\mathbf{U}\\)的[卡罗需-库恩-塔克条件](https://zh.wikipedia.org/wiki/%E5%8D%A1%E7%BE%85%E9%9C%80%EF%BC%8D%E5%BA%AB%E6%81%A9%EF%BC%8D%E5%A1%94%E5%85%8B%E6%A2%9D%E4%BB%B6)（KKT条件）有如下等式：
$$(-2\mathbf{U}+2\mathbf{SC}+4\beta\mathbf{AU}-4\beta\mathbf{UU}^T\mathbf{U})_{ij}U_{ij}=\Theta_{ij}U_{ij}=0$$
这是解收敛时必须满足的固定点方程。给定\\(\mathbf{U}\\)的初始值，\\(\mathbf{U}\\)的连续更新为：
$$U_{ij}\gets U_{ij}\big(\frac{(\mathbf{SC}+2\beta\mathbf{AU}-\mathbf{U})_{ij}}{2\beta(\mathbf{UU}^T\mathbf{U})_{ij}}\big)^\frac{1}{4}$$
为了保证\\(\mathbf{U}\\)非负的属性，将\\(\mathbf{A}\\)中的对角元素设置为大于\\(\frac{1}{2\beta}\\)。\\(\mathbf{U}\\)的更新规则满足以下定理以保证规则的正确性。

+ **定理1**
> 如果U的更新规则收敛，则最终解满足KKT最优条件。

+ **定义1**
> 当函数\\(Q(\mathbf{U},\mathbf{U}')\ge L(\mathbf{U})\\)，\\(Q(\mathbf{U},\mathbf{U})=L(\mathbf{U})\\)时，\\(Q(\mathbf{U},\mathbf{U}')\\)是\\(L(\mathbf{U})\\)的辅助函数。

+ **引理1**
> 如果\\(Q\\)是\\(L\\)的辅助函数，则\\(L\\)在更新规则\\(\mathbf{U}^{(t+1)}=arg\min_\mathbf{U}Q(\mathbf{U},\mathbf{U}^{(t)})\\)下不增加。

+ **引理2**
> 函数
$$Q(\mathbf{U},\mathbf{U}')=tr(\mathbf{SCC}^T\mathbf{S}^T+\beta\mathbf{AA})-\beta tr(\mathbf{RU'}^T\mathbf{U'U'}^T)-tr(\mathbf{U'}^T\mathbf{A'Z})\\\\\quad\quad\quad\quad\quad-tr(\mathbf{Z}^T\mathbf{A'U'})-tr(\mathbf{U'}^T\mathbf{A'U'})-2tr(\mathbf{C}^T\mathbf{S}^T\mathbf{Z})-2tr(\mathbf{C}^T\mathbf{S}^T\mathbf{U'})$$
是\\(L(\mathbf{U})\\)的辅助函数，其中\\(R_{ij}=\frac{U_{ij}^4}{U_{ij}'^3}\\)，\\(Z_{ij}=U'_{ij}\ln\frac{U_{ij}}{U'_{ij}}\\)，\\(\mathbf{A}'=2\beta\mathbf{A}-\mathbf{I}\\)，且\\(\mathbf{I}\\)是单位矩阵。

+ **定理2**
> 在\\(\mathbf{U}\\)的迭代更新下*U*问题是非增的。

## *C*问题
当固定\\(\mathbf{U}\\)更新\\(\mathbf{C}\\)时，需要解决以下问题：
$$\min\limits_{\mathbf{C}\ge0}L(\mathbf{C})=\|\mathbf{U}-\mathbf{SC}\|_F^2+\alpha\sum_{j=1}^k\|\mathbf{C}(:,j)\|_1^2$$
它等价于如下优化问题：
$$\min\limits_{\mathbf{C}\ge0}L(\mathbf{C})=\|\dbinom{\mathbf{S}}{\sqrt{\alpha}\mathbf{e}_{1\times m}}\mathbf{C}-\dbinom{\mathbf{U}}{\mathbf{0}_{1\times k}}\|_F^2$$
其中\\(\mathbf{e}_{1\times m}\\)是一个所有分量为1行向量，\\(\mathbf{0}_{1\times k}\\)是0向量。因此对上面的问题有以下规则：
$$\mathbf{C}_{ij}\gets\mathbf{C}_{ij}\frac{(\mathbf{S'}^T\mathbf{U'})_{ij}}{(\mathbf{S'}^T\mathbf{S'C})_{ij}}$$
其中\\(\mathbf{S'}=\dbinom{\mathbf{S}}{\sqrt{\alpha}\mathbf{e}_{1\times m}}\\)且\\(\mathbf{U'}=\dbinom{\mathbf{U}}{\mathbf{0}_{1\times k}}\\)。

在融合中，由于\\(\mathbf{U}\\)表达了社团成员软关系分布，可以直接使用\\(\mathbf{U}\\)或\\(\mathbf{U}=\mathbf{SC}\\)来获得最终的不相交或重叠的社团。每列\\(\mathbf{C}\\)表示社团与属性之间的关系，值越大表示与社团对应的属性越相关。
