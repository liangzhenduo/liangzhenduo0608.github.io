title: LINE：大规模信息网络嵌入
date: 2017-04-15 15:15:15
tags: [机器学习]
categories: [机器学习, 论文]
photos:
	- /img/linebanner.png
---
> 原文：[LINE: Large-scale Information Network Embedding](https://arxiv.org/pdf/1503.03578.pdf)
> 源码：[tangjianpku/LINE](https://github.com/tangjianpku/LINE)

# 摘要
这篇论文提出了一种将大规模信息网络嵌入到低维向量空间中的方法，适用于有向、无向、有权、无权图。该方法用了精心设计的目标函数，保留了局部和全局网络结构。边采样方法克服了传统梯度下降法的局限性，提高了效率和效果。

# 问题定义

## 信息网络
信息网络定义为\\(G=(V, E)\\)，\\(V\\)是点集，\\(E\\)是边集。每条边是有序对\\(e=(u, v)\\)且有大于0的权重\\(w_{u,v}\\)来表示关系强度（该问题中不考虑负权）。无向图认为双向边相等。
把信息网络嵌入到低维空间非常有用，但要执行嵌入必须先保留网络结构。

## 一阶相似度
网络中的一阶相似度是指两点间的局部结对相似度。连接点对的**边之权重表示两点间的一阶相似度**，若无边则一阶相似度是0。
一阶相似度通常暗含真实网络中两点的相似度，但被观测到的边只占很小一部分，未观测到的一阶相似度被视作0，因此一阶相似度不足以保留网络结构。

## 二阶相似度
点对间的二阶相似度是它们邻居网络结构的相似度。用\\(p_u=(w_{u,1},\ldots,w_{u,|V|})\\)表示\\(u\\)到其他节点的一阶相似度，**二阶相似度就是\\(p_u\\)和\\(p_v\\)（一阶相似度）的相似度**。如果没有节点与\\(u\\)和\\(v\\)相连，则二阶相似度为0。

## 大规模信息网络嵌入
给出大型网络\\(G=(V, E)\\)，信息网络嵌入旨在把每个节点\\(v\\)表示到低维空间\\(R^d\\)中，学习一个函数\\(f_G:V\to R^d\\)其中\\(d\ll |V|\\)。在空间\\(R^d\\)中一阶相似度和二阶相似度都保留着。

# LINE模型
合格的真实世界信息网络嵌入模型要满足以下条件：

+ 保留节点间的一阶相似度和二阶相似度
+ 可用于大型网络
+ 可以处理有向／无向／有权／无权图

## 模型描述
### 一阶相似度的LINE
对于每条无向边\\((i, j)\\)，定义\\(v_i\\)和\\(v_j\\)的连接概率为：$$p_1(v_i, v_j)=\frac{1}{1+\exp(-\overrightarrow{u_i}^T\cdot\overrightarrow{u_j})}$$
其中\\(\overrightarrow{u_i}\\)是\\(v_i\\)的低维向量表示。上式定义的\\(V \times V\\)空间内的分布，经验分布\\(\hat{p_1}(i, j)=\frac{w_{ij}}{W}\\)，其中\\(W=\sum_{(i,j)\in{E}}{w_{ij}}\\)。为了保留一阶相似度，简单的方法是减小以下目标函数：$$O_1=d(\hat{p_1}(\cdot, \cdot), {p_1}(\cdot, \cdot))$$

其中\\(d(\cdot, \cdot)\\)是两个分布之间的距离。减小两个概率分布的[KL散度](https://zh.wikipedia.org/zh-hans/%E7%9B%B8%E5%AF%B9%E7%86%B5)，用KL散度替换距离函数并去掉常量后得到：$$O_1=-\sum_{(i,j)\in{E}}{w_{ij}\log{p_1(v_i,v_j)}}$$
注意**一阶相似度仅适用于无向图**。找到减小上式的\\(\left\\{\overrightarrow{u_i}\right\\}_{i=1..|V|}\\)就可以表示d维空间内的每个点。

### 二阶相似度的LINE
**二阶相似度适用于有向图和无向图**。给出一般网络，假设其有向。二阶相似度假设节点与其他节点共享多条连接，这种情况下每个节点都有独特的*环境（context）*且在*环境*上分布相似的节点被假设为相似的。因此每个节点扮演两种角色：节点本身和其他节点的外部*环境*。引入两个向量\\(\overrightarrow{u_i}\\)和\\(\overrightarrow{u_i}'\\)，其中\\(\overrightarrow{u_i}\\)表示作为节点的\\(v_i\\)，\\(\overrightarrow{u_i}'\\)表示作为*环境*的\\(v_i\\)。对于每个有向边\\((i,j)\\)首先定义*环境*\\(v_j\\)生成节点\\(v_i\\)的概率：$$p_2(v_j\mid v_i)=\frac{\exp({\overrightarrow{u_j}'}^T\cdot\overrightarrow{u_i})}{\sum_{k=1}^{|V|}\exp({\overrightarrow{u_k}'^T\cdot\overrightarrow{u_i})}}$$
其中\\(|V|\\)是节点或*环境*的数量。对于每个节点\\(v_i\\)，上式确定了环境上的条件分布。为保留二阶相似度，应当由低维表示确定条件分布来接近经验分布\\(\hat{p_2}(\cdot|v_i)\\)，因此减小以下目标函数：$$O_2=\sum_{i\in{V}}\lambda_{i}d(\hat{p_2}(\cdot\mid v_i),p_2(\cdot\mid v_i))$$

其中\\(d(\cdot, \cdot)\\)是两个分布之间的距离，由于网络中节点的重要性可能不同，引入\\(\lambda_i\\)来表示网络中节点\\(i\\)可通过算法用度或相似度来衡量的重要性。经验分布\\(\hat{p_2}(\cdot\mid v_i)\\)定义为\\(\hat{p_2}(v_j\mid v_i)=\frac{w_{ij}}{d_i}\\)，其中\\(w_{ij}\\)是边\\((i, j)\\)的权重，\\(d_i\\)是节点\\(i\\)的出度。为了简化，引入KL散度作为距离函数，将\\(\lambda_i\\)设为度\\(d_i\\)并去掉常量后得到：$$O_2=-\sum_{(i,j)\in{E}}w_{ij}\log{p_2(v_j\mid v_i)}$$

通过学习\\(\left\\{\overrightarrow{u_i}\right\\}_{i=1..|V|}\\)和\\(\left\\{\overrightarrow{u_i}'\right\\}_{i=1..|V|}\\)减小这项，就可以用d维向量\\(\overrightarrow{u_i}\\)表示每个节点\\(v_i\\)。
### 结合一阶二阶相似度
简单有效的方法是分别求出一阶二阶相似度，然后对每个节点把两种方法的嵌入训练组合起来。更正规的方法是结合两个相似度联合训练两个目标函数。

## 模型优化
优化\\(O_2\\)计算代价很高，因为在计算条件概率\\(p_2\\)时要累加全部节点。于是引入[mikolov2013distributed](http://papers.nips.cc/paper/5021-distributed-representations-of-words-and-phrases-and-their-compositionality.pdf)中提出的*负采样（negative sampling）*，根据每个边\\((i, j)\\)的噪声分布取样多个负边，特别对每个边指定了以下函数：$$\log\sigma(\overrightarrow{u_j}'^T\cdot\overrightarrow{u_i})+\sum_{i=1}^K E_{v_n\sim P_n(v)}[\log\sigma(-\overrightarrow{u_n}'^T\cdot\overrightarrow{u_i})]$$

其中\\(\sigma(x)=1/(1+\exp(-x))\\)。第一项构造观测边，第二项构造由噪声分布画出的负边，\\(K\\)是负边数。令\\(P_n(v)\propto d_v^{3/4}\\)，其中\\(d_v\\)是节点\\(v\\)的出度。
对于\\(O_1\\)存在[平凡解](https://zh.wikipedia.org/wiki/%E5%B9%B3%E5%87%A1_%28%E6%95%B8%E5%AD%B8%29#.E5.B9.B3.E5.87.A1.E8.A7.A3)：当\\(i\\)取\\(1,\ldots,|V|\\)，\\(k\\)取\\(1,\ldots,d\\)时\\(u_{ik}=\infty\\)。为了避免平凡解可以使用把\\(\overrightarrow{u_j}'^T\\)改为\\(\overrightarrow{u_i}\\)的负采样方法。
引用[recht2011hogwild](http://papers.nips.cc/paper/4390-hogwild-a-lock-free-approach-to-parallelizing-stochastic-gradient-descent.pdf)中提出的*异步随机梯度算法（ASGD）*来优化上式。每一步算法采样少量边然后更新模型参数。如果边\\((i, j)\\)被采样了，节点\\(i\\)的嵌入向量\\(\overrightarrow{u_i}\\)是：$$\frac{\partial O_2}{\partial \overrightarrow{u_i}}=w_{ij}\cdot\frac{\partial\log{p_2}(v_j\mid v_i)}{\partial \overrightarrow{u_i}}$$

注意梯度要乘边权，当边权差距很大时会难以找到好的学习速率。如果根据小权边确定了大的学习速率，会造成大权边的梯度爆炸，因为在根据大权边选择学习速率时梯度会变得很小。

### 通过边采样优化
简单的解决方案是将权为\\(w\\)的边展开成\\(w\\)个*二元边（binary edges）*，但是会显著提高内存需求，尤其是当边权非常大时。解决这种问题的一种方法是从原始边进行采样并转换为*二元*边，通过采样率按比例还原原始边。然后问题就退化成了如何根据权重采样边。
令\\(W=(w_1,\ldots,w_{|E|})\\)表示边权序列，边权和\\(w_{sum}=\sum_{i=1}^{|E|}w_i\\)，然后在\\(\left[0,w_{sum}\right]\\)取随机数，看它落在\\(\left[\sum_{j=0}^{i-1}w_j,\sum_{j=0}^iw_j\right)\\)的哪个区间内。这种方法用\\(O(|E|)\\)的复杂度，当边数非常大时会很耗时。所以引用[li2014reducing](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.675.8158&rep=rep1&type=pdf)中提出的*别名法（alias method）*只用\\(O(1)\\)的复杂度就能从同一离散分布中刻画样本。用负采样可以将常数时间优化到\\(O(d(K+1))\\)次，其中\\(K\\)是负采样数量，因此每步要做\\(O(dK)\\)次。在实践中发现优化步数和边数是成比例的，所以LINE的总体复杂度是\\(O(dK|E|)\\)，和边数是线性相关并与节点数无关。这种边采样方法提高了随机梯度下降法的效率。

## 讨论
### 低度节点
一个实际问题是如何准确嵌入度很小的节点。由于其邻居节点很少，难以推断其表达式，特别是依赖其环境的二阶相似度。于是这里考虑对每个节点扩张其二阶邻居节点，也就是邻居的邻居。节点\\(i\\)和其二阶邻居\\(j\\)间的权重是：$$w_{ij}=\sum_{k\in N(i)}w_{ik}\frac{w_{kj}}{d_k}$$

在实践中只能增加与低度节点\\(i\\)有最大相似度\\(w_{ij}\\)的节点\\(\{j\}\\)的子集。

### 新节点
另一个实际问题是如何表示新加节点。对于新节点\\(i\\)，如果所连节点已知就可以获得已知节点经验分布\\(\hat{p_1}(\cdot, v_i)\\)和\\(\hat{p_2}(\cdot\mid v_i)\\)。为了获得新节点的嵌入，根据\\(O_1\\)和\\(O_2\\)通过更新新节点嵌入并保持已有节点的嵌入来直接减小$$-\sum_{j\in{N(i)}}{w_{ji}\log{p_1(v_j,v_i)}},\quad或\quad -\sum_{j\in{N(i)}}{w_{ji}\log{p_2(v_j,v_i)}},$$

如果没有观测到新节点和已有节点的连接就需要其他信息，比如节点的文本信息。

