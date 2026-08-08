# CLAUDE.md

本项目说明，供 Codex / Claude Code 在此仓库工作时参考。

## 项目概述

**知途的研习室（Zhitu's Lab）** —— 知途的个人博客 / 知识库。纯静态站点生成器：Node.js 构建脚本 + markdown-it 渲染 + Phycat 主题引擎。

- **站名**：知途的研习室（英文 Zhitu's Lab，域名 zhi-tu.me）
- **副标语**：知途以明向，格物以致知。
- **欢迎语**：你好，我是知途。欢迎来到我的研习室——这儿有点乱，但很舒服，随便坐。
- **Logo**：星轨（彗星）——渐隐渐亮的绿色轨迹 + 琥珀四角星，寓意「知途的轨迹，路的尽头有光」；纯几何、纯 Node 生成（lib/icon.js），无字体依赖
- **技术栈**：Node.js + markdown-it + highlight.js + MathJax（构建期 SVG）+ 原生前端 JS
- **部署**：`dist/` 纯静态，部署到自有服务器（Nginx/Caddy），无后端、无框架、无 CDN 依赖

## 命令

```bash
npm run build        # 构建静态站点到 dist/
npm run serve        # 构建 + 本地预览 http://localhost:8765（可追加端口号）
node build.js        # 等同 npm run build
```

## 架构

- `build.js`：唯一入口。读 `content/posts/*.md`（gray-matter 解析 frontmatter）→ `lib/renderer.js` 渲染 → 按 `templates/layout.html` 模板生成全部 HTML 到 `dist/`
- `lib/renderer.js`：markdown-it 渲染管线，输出与 Typora 导出兼容的 DOM 类名（`md-fences` / `CodeMirror` / `md-heading` / `table-wrap` / `md-alert`），数学公式用 MathJax 在构建期转为 SVG
- `lib/themes.js`：11 套主题 = 引擎 CSS（`phycat.light.css` / `phycat.dark.css`）+ 配色变量文件，构建期合并为 `dist/assets/themes/theme-<id>.css`
- `lib/icon.js`：纯 Node 生成 Logo PNG/SVG（无第三方依赖）
- `site/`：前端资源（`site.css` 外壳样式、`app.js` 主题切换/搜索/目录/灯箱/PWA、`studio.js` 配色工坊、`sw.js` Service Worker）
- `templates/layout.html`：页面骨架，`{{var}}` 占位符由 `renderTemplate` 替换

## 内容体系（重要）

- 文章放 `content/posts/*.md`，**分类由 frontmatter 驱动**（不硬编码），构建时自动汇总生成分类页/标签页/归档/搜索索引
- 当前分类：课题研究 / 论文笔记 / 技术笔记 / 读书笔记 / 拾光（介绍在 `content/categories.md`）
- frontmatter：`title` 必填；`date`、`updated`、`category`、`tags`、`excerpt`；可选 `toc / tocnum / headnum`（默认 true）
- 图片约定：`content/posts/images/<文档名>/`，正文相对路径引用；构建时自动复制到 `dist/posts/`
- 独立页面放 `content/pages/*.md`，生成到站点根目录
- **「拾光」**是普通分类，但首页有「拾光·短笺」展示位（取该分类最新数篇），改动首页时保持该约定

## 品牌约束

- 站名 / 副标语 / 欢迎语见上文，全局统一（`build.js` 的 SITE_NAME/SITE_DESC、`templates/layout.html` 页脚、`manifest.webmanifest`）
- 不要使用「π」或文字/字符作为品牌标识（已弃用，Logo 为星轨图形）
- 无评论系统、无 RSS（用户明确不要）；不引入后端

## 用户偏好

- **不要 push 到 GitHub**：只做本地提交，推送命令输出给用户手动执行
- 每完成一项任务输出总结
- 同一命令连续两次结果相同则停止并询问
- 用户使用中文读写：代码注释与界面文案用中文，技术标识符用英文