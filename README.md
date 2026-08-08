# 知途的研习室（Zhitu's Lab）

个人博客 / 知识库。基于 **Phycat** 主题配色构建的纯静态站点，文章渲染效果与 **Typora 导出 HTML** 一致。

> 知途以明向，格物以致知。

## 特性

- 🎨 渲染效果对齐 Typora 导出：标题图标、渐变 H2、毛玻璃卡片、Mac 风格代码块、任务列表动画、提示块、Mermaid 图表、KaTeX/MathJax 公式
- 🎨 **11 套 Phycat 配色一键切换**（8 亮色 + 3 暗色），选择存 `localStorage`；内置「配色工坊」可自制主题并导出为新主题文件
- 🔤 **字体切换**：霞鹜文楷 / 思源宋体 / 阿里巴巴普惠体 + Cascadia Code（全部自托管）
- 🔍 **站内全文搜索**（标题 / 正文 / 分类 / 标签），<kbd>Ctrl+K</kbd> 随时唤起
- 📊 阅读体验：阅读进度条、字数 / 预计阅读时长、多级目录侧栏、图片灯箱、代码一键复制
- 📦 PWA：可安装到桌面 / 手机主屏，Service Worker 缓存支持离线阅读
- 📱 响应式布局；纯静态站点，零后端依赖，`dist/` 可直接部署

## 快速开始

```bash
npm install        # 安装依赖
npm run build      # 构建站点到 dist/
npm run serve      # 构建 + 本地预览 http://localhost:8765
```

## 写文章

在 `content/posts/` 新建 `.md` 文件，头部用 YAML front matter 声明元信息：

```markdown
---
title: 文章标题
date: 2026-08-08
updated: 2026-08-08
category: 课题研究
tags: [强化学习, 综述]
excerpt: 一句话摘要（可选，用于首页卡片）
---
```

- `title` 必填；`date` 用于排序（不填则视为最早）；`updated` 用于显示"更新于"
- `category` 必填，从当前分类中选择；`tags` 支持数组或逗号分隔
- 可选开关（文章与独立页面通用，默认全开）：
  - `toc: false` —— 不显示目录侧栏；
  - `tocnum: false` —— 保留目录侧栏但不显示编号；
  - `headnum: false` —— 正文标题不显示编号
- 图片约定：放在 `content/posts/images/<文档名>/` 下，正文用相对路径引用；构建时自动复制 `content/posts/` 下除 `.md` 外的一切资源

### 当前分类

| 分类 | 定位 |
| ---- | ---- |
| 课题研究 | 为推进自己的课题而写：文献综述、方法设计、实验记录与算法学习 |
| 论文笔记 | 以阅读某篇论文为起点的总结、理解与思考 |
| 技术笔记 | 建站、开发、工具与排错过程中的技术记录 |
| 读书笔记 | 以阅读某本书为起点的摘录、思考与输出 |
| 拾光 | 与学习无关的短句、随想与语录 |

分类是 **frontmatter 驱动**的：新增分类只需在文章里写新的 `category`，分类介绍维护在 `content/categories.md`。

## 主题与字体

- 11 套配色来自 [Phycat](https://github.com/sumruler/typora-theme-phycat)（MIT）：亮色 `cherry / caramel / forest / mint / sky / prussian / sakura / mauve`，暗色 `vampire / radiation / abyss`
- 构建时 `lib/themes.js` 将「引擎样式 + 配色变量」合并为 `dist/assets/themes/theme-<id>.css`
- 调色：直接改 `phycat/phycat-<name>.css` 里的 CSS 变量；新增主题：复制一个配色文件并加入 `lib/themes.js` 清单
- 字体：霞鹜文楷 LXGW WenKai、思源宋体 Source Han Serif SC、阿里巴巴普惠体、Cascadia Code（均本地自托管 woff2）

## 目录结构

```
zhitu-lab/
├── build.js              # 构建脚本：读内容 → 渲染 → 生成页面与主题
├── lib/
│   ├── renderer.js       # markdown-it 渲染管线（输出 Typora 兼容 DOM）
│   ├── themes.js         # 主题清单与「引擎+配色」合并逻辑
│   └── icon.js           # Logo 图标生成（蜿蜒小径 + 终点光点，纯 Node）
├── templates/
│   └── layout.html       # 页面骨架模板
├── site/
│   ├── site.css          # 站点外壳样式
│   ├── app.js            # 主题切换 / 搜索 / 目录 / 灯箱 / PWA
│   ├── studio.js         # 在线配色工坊
│   └── sw.js             # Service Worker
├── phycat/               # Phycat 原始资源（引擎 CSS + 配色 CSS + 字体）
├── content/
│   ├── posts/            # 文章（.md），图片放 images/<文档名>/
│   ├── pages/            # 独立页面（如关于）
│   └── categories.md     # 分类介绍
└── dist/                 # 构建产物（可整体部署）
```

## 部署

`dist/` 为纯静态站点，可部署到任意静态托管或自有服务器（Nginx / Caddy 指向 `dist/`）。站点默认主题为 `forest`。

## 许可与致谢

- 主题：[Phycat](https://github.com/sumruler/typora-theme-phycat)（MIT，来自 sumruler）
- 字体：霞鹜文楷 LXGW WenKai、Cascadia Code（SIL OFL 1.1）
- 本项目为个人自用示例，基于上述开源资源构建。