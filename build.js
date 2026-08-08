'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const grayMatter = require('gray-matter');
const { THEMES, DEFAULT_THEME, mergeTheme } = require('./lib/themes');
const { renderMarkdown } = require('./lib/renderer');

const ROOT = __dirname;
const CONTENT_POSTS = path.join(ROOT, 'content', 'posts');
const CONTENT_PAGES = path.join(ROOT, 'content', 'pages');
const SITE_DIR = path.join(ROOT, 'site');
const TEMPLATE_DIR = path.join(ROOT, 'templates');
const PHYCAT_DIR = path.join(ROOT, 'phycat');
const DIST = path.join(ROOT, 'dist');

const SITE_NAME = '知途的研习室';
const SITE_DESC = '知途的个人知识库：知途以明向，格物以致知。';
// 构建时间戳：给静态资源加 ?v= 缓存破坏，避免浏览器/SW 用旧缓存
const BUILD_STAMP = Date.now();
// 站点 Logo：印章「知」（朱砂红印 + 纸底，白文「知」字；资源由 tools/generate-icons.py 生成）
const LOGO_SVG = fs.readFileSync(path.join(SITE_DIR, 'icons', 'logo-inline.svg'), 'utf-8').trim();

/* ---------- 工具 ---------- */
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function slugify(s) {
  // \u4e00-\u9fa5 = 汉字，\u0370-\u03ff = 希腊字母（如 π）
  const out = String(s).trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5\u0370-\u03ff]+/g, '-').replace(/^-+|-+$/g, '');
  return out || 'untitled';
}
function formatDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, name), 'utf8');
}
function renderTemplate(tpl, data) {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (data[k] !== undefined ? data[k] : ''));
}
function writeFile(rel, content) {
  const abs = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}
function copyTree(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyTree(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ---------- 内容 ---------- */
function loadPosts() {
  if (!fs.existsSync(CONTENT_POSTS)) return [];
  const files = fs.readdirSync(CONTENT_POSTS).filter((f) => f.toLowerCase().endsWith('.md')).sort();
  const posts = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(CONTENT_POSTS, f), 'utf8');
    const { data, content } = grayMatter(raw);
    const slug = slugify(data.slug || path.basename(f, '.md'));
    const date = data.date ? new Date(data.date) : new Date(0);
    const updated = data.updated ? new Date(data.updated) : null;
    const updatedOk = updated && !isNaN(updated.getTime());
    posts.push({
      slug,
      title: data.title || path.basename(f, '.md'),
      date,
      dateText: formatDate(date),
      updated: updatedOk ? updated : null,
      updatedText: updatedOk ? formatDate(updated) : formatDate(date),
      category: data.category || '未分类',
      categorySlug: slugify(data.category || '未分类'),
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? String(data.tags).split(/[,，\s]+/) : [],
      excerpt: data.excerpt || '',
      toc: data.toc === undefined ? true : !!data.toc,
      tocnum: data.tocnum === undefined ? true : !!data.tocnum,
      headnum: data.headnum === undefined ? true : !!data.headnum,
      content,
    });
  }
  posts.sort((a, b) => b.date - a.date);
  // 字数与阅读时长（中文约 350 字/分钟）
  for (const pp of posts) {
    const text = pp.content
      .replace(/\`\`\`[\s\S]*?\`\`\`/g, ' ')
      .replace(/\`[^\`]*\`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/[#>*_\-|~]/g, ' ')
      .replace(/\s+/g, '');
    pp.wordCount = text.length;
    pp.readingTime = Math.max(1, Math.ceil(text.length / 350));
  }
  return posts;
}

function loadPages() {
  if (!fs.existsSync(CONTENT_PAGES)) return [];
  const files = fs.readdirSync(CONTENT_PAGES).filter((f) => f.toLowerCase().endsWith('.md')).sort();
  const pages = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(CONTENT_PAGES, f), 'utf8');
    const { data, content } = grayMatter(raw);
    pages.push({
      slug: slugify(data.slug || path.basename(f, '.md')),
      title: data.title || path.basename(f, '.md'),
      toc: data.toc === undefined ? true : !!data.toc,
      tocnum: data.tocnum === undefined ? true : !!data.tocnum,
      headnum: data.headnum === undefined ? true : !!data.headnum,
      content,
    });
  }
  return pages;
}

function loadCategoriesMeta() {
  const file = path.join(ROOT, 'content', 'categories.md');
  if (!fs.existsSync(file)) return {};
  const raw = fs.readFileSync(file, 'utf8');
  const { data } = grayMatter(raw);
  return data && data.categories && typeof data.categories === 'object' ? data.categories : {};
}

function categoriesOf(posts, meta) {
  const map = new Map();
  for (const p of posts) {
    if (!map.has(p.categorySlug)) map.set(p.categorySlug, { name: p.category, slug: p.categorySlug, count: 0 });
    map.get(p.categorySlug).count++;
  }
  return [...map.values()]
    .map((c) => ({ ...c, desc: (meta && meta[c.name]) || '' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'));
}

function tagsOf(posts) {
  const map = new Map();
  for (const p of posts) {
    for (const t of p.tags || []) {
      const key = slugify(t);
      if (!key) continue;
      if (!map.has(key)) map.set(key, { name: t, slug: key, count: 0 });
      map.get(key).count++;
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));
}

/* 搜索索引：正文转纯文本 */
function plainText(content) {
  return String(content)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_\-|~\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function buildSearchIndex(posts) {
  return posts.map((p) => ({
    t: p.title,
    u: `posts/${p.slug}.html`,
    c: p.category,
    g: p.tags || [],
    d: p.dateText,
    w: p.wordCount || 0,
    s: plainText(p.content),
  }));
}

/* ---------- 目录大纲（与 Typora 导出一致的多级嵌套树） ---------- */
function buildOutline(toc) {
  if (!toc || !toc.length) return '';
  // 依据 heading 层级构建嵌套树
  const root = { level: 0, children: [] };
  const stack = [root];
  for (const t of toc) {
    const node = { level: t.level, text: t.text, id: t.id, children: [] };
    while (stack.length > 1 && stack[stack.length - 1].level >= t.level) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }

  function renderNodes(nodes, top) {
    const inner = nodes
      .map((n) => {
        const hasChildren = n.children.length > 0;
        const wrapperCls =
          `outline-item-wrapper outline-h${Math.min(n.level, 6)} ` +
          (hasChildren ? 'outline-item-open' : 'outline-item-single');
        const children = hasChildren ? renderNodes(n.children, false) : '';
        return (
          `<li class="${wrapperCls}">` +
          `<div class="outline-item"><span class="outline-expander"></span>` +
          `<a class="outline-label" href="#${n.id}">${escapeHtml(n.text)}</a></div>` +
          children +
          `</li>`
        );
      })
      .join('\n');
    return top ? inner : `<ul class="outline-children">${inner}</ul>`;
  }

  return (
    `<nav class="typora-export-sidebar" aria-label="文章目录">` +
    `<div class="outline-title"><span class="outline-title-text">目录</span><button class="outline-collapse" id="outlineCollapse" type="button" title="收起/展开目录" aria-label="收起目录">&laquo;</button></div>` +
    `<div class="outline-content">${renderNodes(root.children, true)}</div>` +
    `</nav>`
  );
}

/* ---------- 页面内容块 ---------- */
function homeContent(posts, cats, tags) {
  const totalWords = posts.reduce((s, p) => s + (p.wordCount || 0), 0);
  const wan = Math.round((totalWords / 10000) * 10) / 10;
  const latestMs = posts.reduce((m, p) => {
    const t = (p.updated && !isNaN(p.updated.getTime()) ? p.updated : p.date).getTime();
    return t > m ? t : m;
  }, 0);
  const updatedText = latestMs > 0 ? formatDate(new Date(latestMs)) : '';
  const hero = `
  <section class="home-hero">
    <div class="home-avatar" aria-hidden="true">${LOGO_SVG}</div>
    <h1 class="home-title">你好，我是知途。</h1>
    <p class="home-sub">欢迎来到我的研习室——这儿有点乱，但很舒服，随便坐。</p>
    <p class="home-motto">知途以明向，格物以致知。</p>
    <div class="home-stats">
      <span>📄 ${posts.length} 篇文章</span>
      <span>🗂 ${cats.length} 个分类</span>
      <span>🏷 ${tags.length} 个标签</span>
      <span>✍️ 约 ${wan} 万字</span>
      ${updatedText ? `<span>🕒 最近更新 ${updatedText}</span>` : ''}
    </div>
    <div class="home-cta">
      <a class="btn btn-primary" href="#latest">↓ 开始阅读</a>
      <a class="btn" href="about.html">关于我</a>
    </div>
  </section>`;
  const catCards = `<section class="home-section">
    <h2 class="home-section-title">🗂 分类</h2>
    <div class="cat-cards">
      ${cats.map((c) => `
        <a class="cat-card" href="category/${c.slug}.html">
          <span class="cat-name">${escapeHtml(c.name)}</span>
          <span class="cat-count">${c.count} 篇</span>
          <span class="cat-arrow">→</span>
        </a>`).join('\n')}
    </div>
  </section>`;
  const tagCloud = `<section class="home-section">
    <h2 class="home-section-title">🏷 标签</h2>
    <div class="tag-cloud">
      ${tags.map((t) => {
        const tier = t.count >= 3 ? 's3' : t.count === 2 ? 's2' : 's1';
        return `<a class="tag-chip ${tier}" href="tag/${t.slug}.html"><span class="tag">#${escapeHtml(t.name)}</span><em>${t.count}</em></a>`;
      }).join('\n')}
    </div>
  </section>`;
  const recent = posts.slice(0, 6);
  const list = recent.map((p) => postCard(p, '')).join('\n');
  const latest = `<section class="home-section" id="latest">
    <h2 class="home-section-title">📄 最新文章</h2>
    <div class="post-list">${list}</div>
    <div class="home-more"><a href="archive.html">查看全部文章 →</a></div>
  </section>`;
  return `<main class="site-main"><div class="home-wrap">${hero}${catCards}${tagCloud}${latest}</div></main>`;
}

function categoryContent(posts, cat) {
  const list = posts
    .filter((p) => p.categorySlug === cat.slug)
    .map((p) => postCard(p, '../'))
    .join('\n');
  const intro = cat.desc ? `<p class="cat-intro">${escapeHtml(cat.desc)}</p>` : '';
  return `<main class="site-main"><div class="category-wrap"><div class="hero"><h1>${escapeHtml(cat.name)}</h1><p>共 ${cat.count} 篇文章</p>${intro}</div><div class="cat-back"><a href="../categories.html">← 返回全部分类</a></div><div class="post-list">${list}</div></div></main>`;
}

function categoriesContent(cats, posts) {
  const cards = cats.map((c) => {
    const recent = posts
      .filter((p) => p.categorySlug === c.slug)
      .slice(0, 2)
      .map((p) => `<li><a href="posts/${p.slug}.html">${escapeHtml(p.title)}</a></li>`)
      .join('');
    return `
    <article class="cat-index-card">
      <a class="cat-index-link" href="category/${c.slug}.html">
        <span class="cat-name">${escapeHtml(c.name)}</span>
        <span class="cat-count">${c.count} 篇</span>
        <span class="cat-arrow">→</span>
      </a>
      ${c.desc ? `<p class="cat-index-desc">${escapeHtml(c.desc)}</p>` : ''}
      ${recent ? `<ul class="cat-index-recent">${recent}</ul>` : ''}
    </article>`;
  }).join('\n');
  return `<main class="site-main"><div class="category-wrap">
    <div class="hero"><h1>笔记分类</h1><p>共 ${cats.length} 个分类 · ${posts.length} 篇文章</p></div>
    <div class="cat-index-grid">${cards || '<p>暂无分类</p>'}</div>
  </div></main>`;
}

function tagContent(posts, tag) {
  const list = posts
    .filter((p) => (p.tags || []).some((t) => slugify(t) === tag.slug))
    .map((p) => postCard(p, '../'))
    .join('\n');
  return `<main class="site-main"><div class="category-wrap"><div class="hero"><h1>#${escapeHtml(tag.name)}</h1><p>共 ${tag.count} 篇文章</p></div><div class="post-list">${list}</div></div></main>`;
}

function tagsContent(tags) {
  const chips = tags
    .map((t) => `<a class="tag-chip" href="tag/${t.slug}.html"><span class="tag">#${escapeHtml(t.name)}</span><em>${t.count}</em></a>`)
    .join('\n');
  return `<main class="site-main"><div class="category-wrap"><div class="hero"><h1>标签</h1><p>共 ${tags.length} 个标签</p></div><div class="tag-cloud">${chips || '<p>暂无标签</p>'}</div></div></main>`;
}

function archiveContent(posts, cats, tags) {
  const totalWords = posts.reduce((s, p) => s + (p.wordCount || 0), 0);
  const wan = Math.round((totalWords / 10000) * 10) / 10;
  const years = new Map();
  for (const p of posts) {
    const y = p.date.getFullYear();
    if (!years.has(y)) years.set(y, []);
    years.get(y).push(p);
  }
  const sortedYears = [...years.keys()].sort((a, b) => b - a);
  const minYear = sortedYears.length ? sortedYears[sortedYears.length - 1] : null;
  const span = minYear ? `${minYear} 年至今` : '';
  const html = sortedYears.map((y) => {
    const list = years.get(y).map((p) => {
      const wc = (p.wordCount || 0) >= 10000 ? ((p.wordCount / 10000).toFixed(1) + ' 万字') : ((p.wordCount || 0) + ' 字');
      const tags = (p.tags || []).map((t) => `<a class="tag" href="tag/${slugify(t)}.html">#${escapeHtml(t)}</a>`).join('');
      return `
      <li class="arch-item">
        <span class="arch-meta">
          <time>${p.dateText}</time>
          <a class="arch-badge" href="category/${p.categorySlug}.html">${escapeHtml(p.category)}</a>
          ${tags ? `<span class="arch-tags">${tags}</span>` : ''}
          <span class="arch-read">${wc}</span>
        </span>
        <a class="arch-title" href="posts/${p.slug}.html">${escapeHtml(p.title)}</a>
      </li>`;
    }).join('\n');
    return `<section class="arch-year">
      <h2 class="arch-year-title">${y} 年 <em>${years.get(y).length} 篇</em></h2>
      <ul class="arch-timeline">${list}</ul>
    </section>`;
  }).join('\n');
  return `<main class="site-main"><div class="archive-wrap">
    <div class="hero"><h1>文章汇总</h1><p>共 ${posts.length} 篇文章 · 约 ${wan} 万字 · ${cats.length} 个分类 · ${tags.length} 个标签 · ${span}</p></div>
    ${html || '<p>暂无文章</p>'}
  </div></main>`;
}

function postCard(p, root) {
  const tags = (p.tags || [])
    .map((t) => `<a class="tag" href="${root}tag/${slugify(t)}.html">#${escapeHtml(t)}</a>`)
    .join(' ');
  return `
  <article class="post-card">
    <a class="post-card-link" href="${root}posts/${p.slug}.html">
      <a class="badge" href="${root}category/${p.categorySlug}.html">${escapeHtml(p.category)}</a>
      <h2>${escapeHtml(p.title)}</h2>
      <p class="excerpt">${escapeHtml(p.excerpt || '（暂无摘要）')}</p>
    </a>
    <div class="meta"><time>${p.dateText}</time>${tags}</div>
  </article>`;
}

function postContent(p, prev, next) {
  const { body, toc } = renderMarkdown(p.content);
  const sidebar = p.toc === false ? '' : buildOutline(toc);
  const mainCls = ['site-main'];
  if (p.tocnum === false) mainCls.push('no-tocnum');
  if (p.headnum === false) mainCls.push('no-headnum');
  const meta = [
    `<time>${p.dateText}</time>`,
    ...(p.updatedText && p.updatedText !== p.dateText ? [`<span class="updated">更新于 ${p.updatedText}</span>`] : []),
    `<a class="badge" href="../category/${p.categorySlug}.html">${escapeHtml(p.category)}</a>`,
    ...(p.tags || []).map((t) => `<a class="tag" href="../tag/${slugify(t)}.html">#${escapeHtml(t)}</a>`),
    `<span class="read-meta">约 ${p.readingTime || 1} 分钟 · ${p.wordCount || 0} 字</span>`,
  ].join('\n    ');
  const navPrev = prev
    ? `<a class="post-nav-item post-nav-prev" href="../posts/${prev.slug}.html"><span class="nav-dir">← 上一篇</span><span class="nav-title">${escapeHtml(prev.title)}</span></a>`
    : '<span class="post-nav-item post-nav-empty"></span>';
  const navNext = next
    ? `<a class="post-nav-item post-nav-next" href="../posts/${next.slug}.html"><span class="nav-dir">下一篇 →</span><span class="nav-title">${escapeHtml(next.title)}</span></a>`
    : '';
  return `
  <main class="${mainCls.join(' ')}">
    <div class="site-post">
      ${sidebar}
      <article class="post-article">
        <header class="post-head">
          <h1>${escapeHtml(p.title)}</h1>
          <div class="meta">${meta}</div>
        </header>
        <div id="write" class="post-write">${body}</div>
        <nav class="post-nav">${navPrev}${navNext}</nav>
      </article>
    </div>
  </main>`;
}

function pageContent(p) {
  const { body, toc } = renderMarkdown(p.content);
  const sidebar = p.toc === false ? '' : buildOutline(toc);
  const mainCls = ['site-main'];
  if (p.tocnum === false) mainCls.push('no-tocnum');
  if (p.headnum === false) mainCls.push('no-headnum');
  return `
  <main class="${mainCls.join(' ')}">
    <div class="site-post">
      ${sidebar}
      <article class="post-article">
        <header class="post-head"><h1>${escapeHtml(p.title)}</h1></header>
        <div id="write" class="post-write">${body}</div>
      </article>
    </div>
  </main>`;
}

/* 生成导航：固定 4 项，active 在构建时直接加入 */
function buildNav(cats, pages, activeNav, root) {
  const link = (href, label, key, cls) => {
    const c = cls ? ` class="${cls}${activeNav === key ? ' active' : ''}"` : (activeNav === key ? ' class="active"' : '');
    return `<a href="${href}" data-nav="${key}"${c}>${label}</a>`;
  };
  return [
    link(`${root}index.html`, '首页', 'home'),
    link(`${root}categories.html`, '笔记分类', 'categories'),
    link(`${root}archive.html`, '文章汇总', 'archive'),
    ...pages.map((p) => link(`${root}${p.slug}.html`, escapeHtml(p.title), `page-${p.slug}`)),
  ].join('\n      ');
}
/* ---------- 构建 ---------- */
function build() {
  // 清理旧产物，避免删除的文章/页面留下旧文件
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  const posts = loadPosts();
  const pages = loadPages();
  const catMeta = loadCategoriesMeta();
  const cats = categoriesOf(posts, catMeta);
  const tags = tagsOf(posts);
  const layout = readTemplate('layout.html');



  function renderPage(block, root, extra) {
    const data = Object.assign(
      {
        pageTitle: `${extra.title} · ${SITE_NAME}`,
        pageDesc: extra.desc || SITE_DESC,
        siteName: SITE_NAME,
        assetStamp: BUILD_STAMP,
        // 带目录页面：初始即折叠（避免首次进入时“展开→收起”动画）
        bodyClass: block.indexOf('typora-export-sidebar') >= 0 ? ' has-toc toc-collapsed' : '',
        categoryNav: buildNav(cats, pages, extra.activeNav || '', root),
content: block,
        root,
        defaultTheme: DEFAULT_THEME,
        activeNav: extra.activeNav || '',
      },
      extra
    );
    return renderTemplate(layout, data);
  }

  // 首页
  writeFile('index.html', renderPage(homeContent(posts, cats, tags), '', { title: '首页', activeNav: 'home' }));

  // 分类页
  for (const c of cats) {
    writeFile(
      `category/${c.slug}.html`,
      renderPage(categoryContent(posts, c), '../', { title: c.name, desc: `分类：${c.name}`, activeNav: 'categories' })
    );
  }

  // 标签页 + 标签索引页
  for (const t of tags) {
    writeFile(
      `tag/${t.slug}.html`,
      renderPage(tagContent(posts, t), '../', { title: `#${t.name}`, desc: `标签：${t.name}`, activeNav: 'tags' })
    );
  }
  writeFile('tags.html', renderPage(tagsContent(tags), '', { title: '标签', activeNav: 'tags' }));
  writeFile('categories.html', renderPage(categoriesContent(cats, posts), '', { title: '笔记分类', activeNav: 'categories' }));
  writeFile('archive.html', renderPage(archiveContent(posts, cats, tags), '', { title: '文章汇总', activeNav: 'archive' }));

  // 文章页
  posts.forEach((pp, idx) => {
      writeFile(
        `posts/${pp.slug}.html`,
        renderPage(postContent(pp, posts[idx + 1] || null, posts[idx - 1] || null), '../', {
          title: pp.title,
          desc: pp.excerpt || pp.title,
          activeNav: 'categories',
        })
      );
  });

  // 独立页面
  for (const p of pages) {
    writeFile(`${p.slug}.html`, renderPage(pageContent(p), '', { title: p.title, activeNav: `page-${p.slug}` }));
  }

  // 文章附属资源：把 content/posts 下除 .md 外的一切（如 images/<文档名>/）复制到 dist/posts/，保持相对路径
  for (const entry of fs.readdirSync(CONTENT_POSTS, { withFileTypes: true })) {
    if (entry.isFile() && /\.md$/i.test(entry.name)) continue;
    copyTree(path.join(CONTENT_POSTS, entry.name), path.join(DIST, 'posts', entry.name));
  }

  // 主题 CSS（引擎 + 配色合并）
  for (const t of THEMES) {
    writeFile(`assets/themes/theme-${t.id}.css`, mergeTheme(PHYCAT_DIR, t));
  }

  // 字体
  fs.mkdirSync(path.join(DIST, 'assets', 'phycat'), { recursive: true });
  for (const f of ['Cascadia-Code-Regular.ttf', 'Cascadia-Code-Regular.woff2', 'LXGWWenKai-Regular.ttf', 'LXGWWenKai-Regular.woff2']) {
    if (fs.existsSync(path.join(PHYCAT_DIR, f))) {
      fs.copyFileSync(path.join(PHYCAT_DIR, f), path.join(DIST, 'assets', 'phycat', f));
    }
  }

  // 站点资源
  for (const f of ['site.css', 'app.js', 'studio.css', 'studio.js', 'favicon.svg', 'mermaid.min.js']) {
    if (fs.existsSync(path.join(SITE_DIR, f))) {
      fs.copyFileSync(path.join(SITE_DIR, f), path.join(DIST, 'assets', f));
    }
  }

  // 配色工坊导出模板：提取配色文件的静态变量块（标题图标/背景图案/自动编号）
  const staticSrc = fs.readFileSync(path.join(PHYCAT_DIR, 'phycat-forest.css'), 'utf8');
  const staticMatch = staticSrc.match(/:root\s*\{([\s\S]*?)(?=--head-title-color)/);
  const staticBlock = staticMatch ? staticMatch[1].trim() : '';
  writeFile('assets/studio-static.js', `window.PHYCAT_STUDIO_STATIC = ${JSON.stringify(staticBlock)};\n`);

  // 站点元数据
  const meta = {
    siteName: SITE_NAME,
    defaultTheme: DEFAULT_THEME,
    themes: THEMES.map((t) => ({ id: t.id, name: t.name, series: t.series, accent: t.accent })),
  };
  writeFile('assets/site-meta.js', `window.PHYCAT_SITE_META = ${JSON.stringify(meta)};\n`);

  // PWA：图标（预渲染资源，由 tools/generate-icons.py 生成） / manifest / service worker
  fs.mkdirSync(path.join(DIST, 'assets', 'icons'), { recursive: true });
  for (const f of ['icon-192.png', 'icon-512.png', 'icon.svg']) {
    const src = path.join(SITE_DIR, 'icons', f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, 'assets', 'icons', f));
  }
  for (const f of ['sw.js', 'manifest.webmanifest']) {
    if (fs.existsSync(path.join(SITE_DIR, f))) {
      if (f === 'sw.js') {
        // 每次构建给 SW 缓存名打新版本号，避免重新构建后浏览器用旧缓存
        let swSrc = fs.readFileSync(path.join(SITE_DIR, f), 'utf8');
        swSrc = swSrc.replace(/phycat-blog-v[\w.-]*/, 'phycat-blog-v' + Date.now());
        fs.writeFileSync(path.join(DIST, f), swSrc);
      } else {
        fs.copyFileSync(path.join(SITE_DIR, f), path.join(DIST, f));
      }
    }
  }

  // 全文搜索索引（客户端渲染时拉取）
  writeFile('assets/search-index.js', `window.PHYCAT_SEARCH_INDEX = ${JSON.stringify(buildSearchIndex(posts))};\n`);

  console.log(`✔ 构建完成：${posts.length} 篇文章、${cats.length} 个分类、${tags.length} 个标签、${pages.length} 个页面、${THEMES.length} 套主题`);
  console.log(`  输出目录：${DIST}`);
}

/* ---------- 本地预览服务器 ---------- */
function serve(port) {
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
  };
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(DIST, urlPath);
    if (!filePath.startsWith(DIST)) { res.writeHead(403); return res.end('Forbidden'); }
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not Found'); }
      const ext = path.extname(filePath).toLowerCase();
      const headers = { 'Content-Type': mime[ext] || 'application/octet-stream' };
      // 静态资源长缓存，避免每次翻页重新下载字体（字体闪现的主要原因）
      if (/\.(ttf|woff2?|css|js|png|jpg|jpeg|svg|ico)$/.test(filePath)) {
        headers['Cache-Control'] = 'public, max-age=604800, immutable';
      } else {
        headers['Cache-Control'] = 'no-cache';
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // 端口被占用：探测占用方是否就是本站的预览服务（构建已完成，旧服务每次请求都会从磁盘读取最新文件）
      const probe = http.get({ host: 'localhost', port, path: '/', timeout: 1500 }, (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => {
          if (/Phycat/.test(body)) {
            console.log(`ℹ️ 端口 ${port} 已被本站的预览服务占用（无需重启，旧服务会自动提供最新构建内容）`);
            console.log(`   → 直接打开 http://localhost:${port} 即可。`);
          } else {
            console.log(`❌ 端口 ${port} 已被其他程序占用。`);
            console.log(`   → 换个端口：node build.js --serve 8766`);
          }
        });
      });
      probe.on('timeout', () => probe.destroy());
      probe.on('error', () => {
        console.log(`❌ 端口 ${port} 被占用，且无法确认是否为本站预览服务。`);
        console.log(`   → 换个端口：node build.js --serve 8766`);
      });
      return;
    }
    console.error('预览服务器错误：', err);
  });
  server.listen(port, () => {
    console.log(`✔ 本地预览：http://localhost:${port}`);
  });
}

/* ---------- 入口 ---------- */
build();
if (process.argv.includes('--serve')) {
  // 支持：node build.js --serve 8766 与 npm run serve -- --serve 8766
  let port = 8765;
  const args = process.argv;
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i] === '--serve') {
      const n = Number(args[i + 1]);
      if (Number.isInteger(n) && n > 0 && n < 65536) port = n;
    }
  }
  serve(port);
}