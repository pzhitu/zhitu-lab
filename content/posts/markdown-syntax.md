---
title: Markdown 语法速查
date: 2026-07-28
updated: 2026-07-28
category: 技术笔记
tags: [Markdown, 教程]
excerpt: 一份覆盖标题、列表、表格、代码、引用、提示块等常用语法的速查手册。
---

## 标题与强调

Markdown 支持 **加粗**、*斜体*、~~删除线~~、`行内代码` 以及 <kbd>KBD</kbd> 键盘键样式。

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 列表

### 无序列表

- 苹果
- 香蕉
- 橘子

### 有序列表

1. 第一步：收集
2. 第二步：整理
3. 第三步：输出

### 任务列表

- [x] 阅读完本文
- [x] 尝试写一篇自己的文章
- [ ] 把文章发布到博客

## 引用

> 好看的样式可以提升写作体验。
>
> —— Phycat 主题标语

## 表格

| 语法        | 作用         | 示例            |
| ----------- | ------------ | --------------- |
| `#`         | 标题         | `# 标题`        |
| `**`        | 加粗         | `**重要**`      |
| `` ` ``     | 行内代码     | `` `code` ``    |
| `[文本](url)` | 链接       | `[Phycat](url)` |

## 代码块

```python
def hello(name: str) -> str:
    """问候函数"""
    greeting = f"Hello, {name}!"
    print(greeting)
    return greeting

if __name__ == "__main__":
    hello("Phycat")
```

```javascript
// JavaScript 示例
const themes = ['forest', 'vampire', 'sakura'];
themes.forEach((t) => console.log(`theme: ${t}`));
```

```bash
npm run build      # 构建静态站点
npm run serve      # 本地预览 http://localhost:8765
```

## 提示块

支持 GitHub 风格的提示块语法 `> [!NOTE]`，也支持容器语法 `:::tip`。

:::note
备注：提示块有五种类型：note、tip、important、warning、caution。
:::

:::warning
警告：部署到公网前请确认内容无误，知识库属于个人资产。
:::

:::caution
小心：不要在文章中放置敏感的个人信息。
:::

## 脚注

这里是一个脚注示例[^1]，点击可跳转到文末。

[^1]: 这是脚注内容，Typora 导出的 HTML 同样支持脚注样式。