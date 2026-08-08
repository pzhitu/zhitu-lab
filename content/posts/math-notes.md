---
title: 公式渲染：当数学遇上 Markdown
date: 2026-07-10
updated: 2026-07-10
category: 技术笔记
tags: [公式, KaTeX, Markdown]
excerpt: 本站支持 KaTeX 公式渲染：行内公式 $E=mc^2$ 与独立公式块。
---

本站使用 **KaTeX** 渲染数学公式，支持行内公式与独立公式块，效果与 Typora 导出的公式一致。

## 行内公式

爱因斯坦质能方程 $E = mc^2$ 是最著名的行内公式。欧拉恒等式 $e^{i\pi} + 1 = 0$ 被称为数学中最美的等式。

## 独立公式块

等比数列求和公式：

$$
S_n = \frac{a_1(1 - q^n)}{1 - q} \quad (q \neq 1)
$$

正态分布的概率密度函数：

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

## 公式与文字混排

当 $a > 0$ 时，二次函数 $y = ax^2 + bx + c$ 开口向上；当 $a < 0$ 时开口向下。顶点坐标为 $\left(-\frac{b}{2a}, \frac{4ac - b^2}{4a}\right)$。

:::tip
行内公式用 `$...$` 包裹，独立公式块用 `$$...$$` 独占一行。注意 `$` 两侧不要有空格。
:::

## 矩阵与分段函数

$$
\begin{pmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{pmatrix}
\quad
f(x) = \begin{cases}
x^2, & x \ge 0 \\
-x^2, & x < 0
\end{cases}
$$