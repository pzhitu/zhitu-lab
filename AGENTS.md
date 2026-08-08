# AGENTS.md

**知途的研习室（Zhitu's Lab）** —— 纯静态博客 / 知识库（Node 构建脚本 + markdown-it + Phycat 主题引擎）。

请先阅读 `CLAUDE.md` 获取完整说明（架构、内容体系、品牌约束、用户偏好）。核心要点：

1. `npm run build` 生成 `dist/`；`npm run serve` 本地预览（:8765）
2. 写文章 = 在 `content/posts/` 新建 `.md`，frontmatter 写 `title/date/category/tags`；分类是 frontmatter 驱动，不硬编码
3. 当前分类：课题研究 / 论文笔记 / 技术笔记 / 读书笔记 / 拾光
4. 不要 push 到 GitHub；完成大任务后输出总结