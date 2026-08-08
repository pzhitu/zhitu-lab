'use strict';
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');
const anchor = require('markdown-it-anchor');
const footnote = require('markdown-it-footnote');
const taskLists = require('markdown-it-task-lists');
const container = require('markdown-it-container');
/* ============ 数学公式：MathJax（与 Typora 一致，构建时渲染为 SVG） ============ */
const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');

const MATH_ADAPTOR = liteAdaptor();
RegisterHTMLHandler(MATH_ADAPTOR);
const MATH_TEX = new TeX({ packages: AllPackages });
const MATH_SVG = new SVG({ fontCache: 'none' });
const MATH_HTML = mathjax.document('', { InputJax: MATH_TEX, OutputJax: MATH_SVG });

function renderMath(latex, display) {
  try {
    const node = MATH_HTML.convert(latex, { display });
    return MATH_ADAPTOR.outerHTML(node);
  } catch (e) {
    return `<span class="math-error">${MarkdownIt.prototype.utils.escapeHtml(latex)}</span>`;
  }
}

/* 提取公式为占位符（跳过代码围栏），避免 markdown-it 破坏 $...$ 内部语法 */
const MATH_PLACEHOLDER = /[\uE000]MATH(\d+)[\uE000]/g;
function extractMath(src) {
  // 不跳过任何反引号代码：`$..$` 一律按公式渲染（用户要求）
  const math = [];
  const processed = processMathSegment(src, math);
  return { src: processed, math };
}
function processMathSegment(seg, math) {
  // 块级 $$...$$
  seg = seg.replace(/\$\$([\s\S]*?)\$\$/g, (mm, tex) => {
    const i = math.length;
    math.push({ tex: tex.trim(), display: true });
    return `\uE000MATH${i}\uE000`;
  });
  // 行内 $...$（逐字符扫描，支持 \$ 转义、避免货币符号误判）
  // 兼容 Typora 写法：允许 "$ x $"（内容首尾空格自动裁剪）、允许 "$" 与中文/标点紧贴
  const isAsciiWord = (ch) => /[A-Za-z0-9_]/.test(ch);
  let out = '';
  let i = 0;
  while (i < seg.length) {
    const ch = seg[i];
    if (ch !== '$') { out += ch; i++; continue; }
    let j = i + 1;
    let tex = '';
    let closed = -1;
    while (j < seg.length) {
      if (seg[j] === '\\' && j + 1 < seg.length) { tex += seg[j] + seg[j + 1]; j += 2; continue; }
      if (seg[j] === '$') { closed = j; break; }
      tex += seg[j]; j++;
    }
    const trimmed = tex.trim();
    if (closed > i + 1 && trimmed) {
      const prev = i === 0 ? ' ' : seg[i - 1];
      const next = closed + 1 < seg.length ? seg[closed + 1] : ' ';
      const canOpen = prev !== '$' && prev !== '\\' && (i === 0 || !isAsciiWord(prev));
      const canClose = next !== '$' && (closed + 1 === seg.length || !isAsciiWord(next));
      if (canOpen && canClose) {
        const k = math.length;
        math.push({ tex: trimmed, display: false });
        out += `\uE000MATH${k}\uE000`;
        i = closed + 1;
        continue;
      }
    }
    out += '$';
    i++;
  }
  return out;
}

/* ============ 代码高亮：highlight.js 类名 → CodeMirror token 类名（Typora 导出使用） ============ */
const HLJS_TO_CM = {
  keyword: 'cm-keyword',
  built_in: 'cm-builtin',
  type: 'cm-type',
  string: 'cm-string',
  comment: 'cm-comment',
  number: 'cm-number',
  title: 'cm-def',
  function: 'cm-def',
  params: 'cm-variable-2',
  variable: 'cm-variable',
  property: 'cm-property',
  operator: 'cm-operator',
  meta: 'cm-meta',
  literal: 'cm-atom',
  symbol: 'cm-atom',
  regexp: 'cm-string',
  name: 'cm-tag',
  tag: 'cm-tag',
  attr: 'cm-attribute',
  attribute: 'cm-attribute',
  'selector-tag': 'cm-keyword',
  'selector-class': 'cm-property',
  'selector-id': 'cm-property',
  bullet: 'cm-variable-2',
  section: 'cm-variable-2',
  'variable-2': 'cm-variable-2',
  'variable-3': 'cm-variable-3',
  'title.function_': 'cm-def',
  'title.class_': 'cm-type',
  'string-2': 'cm-string',
  addition: 'cm-string',
  deletion: 'cm-comment',
  emphasis: 'cm-em',
  strong: 'cm-strong',
  link: 'cm-link',
  doctag: 'cm-comment',
  'meta-keyword': 'cm-keyword',
  'meta-string': 'cm-string',
  quoted: 'cm-string',
  'template-variable': 'cm-variable-2',
  'selector-pseudo': 'cm-attribute',
  'selector-attr': 'cm-attribute',
};

function hljsToCm(className) {
  const classes = String(className || '')
    .split(/\s+/)
    .map((c) => c.replace(/^hljs-/, ''))
    .filter(Boolean);
  const mapped = [];
  for (const c of classes) {
    if (HLJS_TO_CM[c]) mapped.push(HLJS_TO_CM[c]);
  }
  return mapped.join(' ');
}

function highlightCode(code, lang) {
  let html = '';
  try {
    if (lang && hljs.getLanguage(lang)) {
      html = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    } else {
      html = hljs.highlightAuto(code).value;
    }
  } catch (e) {
    html = MarkdownIt.prototype.utils.escapeHtml(code);
  }
  // hljs-* span -> cm-* span
  return html.replace(/<span class="(hljs-[^"]+)">/g, (m, cls) => {
    const mapped = hljsToCm(cls);
    return mapped ? `<span class="${mapped}">` : '<span>';
  });
}

/* ============ GitHub 提示块（Alert）============ */
const ALERT_TYPES = [
  { type: 'note',      label: 'NOTE',      labelZh: '备注',
    icon: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/></svg>' },
  { type: 'tip',       label: 'TIP',       labelZh: '提示',
    icon: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"/></svg>' },
  { type: 'important', label: 'IMPORTANT', labelZh: '重要',
    icon: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>' },
  { type: 'warning',  label: 'WARNING',   labelZh: '警告',
    icon: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>' },
  { type: 'caution',  label: 'CAUTION',   labelZh: '小心',
    icon: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>' },
];

/* 将 GitHub 风格提示块（> [!NOTE] ...）预处理为 :::note ... ::: 容器语法 */
function githubAlertsToContainers(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i);
    if (m) {
      out.push(':::' + m[1].toLowerCase());
      i++;
      while (i < lines.length) {
        const bm = lines[i].match(/^>\s?(.*)$/);
        if (bm) { out.push(bm[1]); i++; } else { break; }
      }
      out.push(':::');
    } else {
      out.push(line);
      i++;
    }
  }
  return out.join('\n');
}

/* ============ 渲染入口 ============ */
function renderMarkdown(mdText, options) {
  const opts = options || {};
  const env = { toc: [], mermaid: [] };

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: highlightCode,
  });

  // 数学公式：MathJax 在渲染后生成 SVG（见 renderMarkdown 尾部）

  // 标题锚点（中文标题用 encodeURIComponent 生成稳定 id）
  md.use(anchor, {
    level: [1, 2, 3, 4, 5, 6],
    slugify: (s) =>
      encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-')),
    uniqueSlug: true,
  });
  md.use(footnote);
  md.use(taskLists, { enabled: false, label: true });

  // 提示块容器 :::note :::tip :::important :::warning :::caution
  for (const a of ALERT_TYPES) {
    md.use(container, a.type, {
      validate: (params) => params.trim().toLowerCase() === a.type,
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          return (
            `<div class="md-alert md-alert-${a.type}">` +
            `<p class="md-alert-text-container">` +
            `<span class="md-alert-text md-alert-text-${a.type}">${a.icon}${a.label}</span>` +
            `</p>\n`
          );
        }
        return '</div>\n';
      },
    });
  }

  // 标题 → 加 md-heading 类（引擎用它做 H3~H6 尾部图标），同时收集目录
  md.renderer.rules.heading_open = (tokens, idx) => {
    const t = tokens[idx];
    const id = t.attrGet('id');
    const cls = t.attrGet('class');
    const attrs = [];
    if (id) attrs.push(`id="${id}"`);
    attrs.push(`class="md-heading${cls ? ' ' + cls : ''}"`);
    const inline = tokens[idx + 1];
    const text = inline ? inline.content : '';
    if (id) env.toc.push({ level: Number(t.tag.slice(1)), text, id });
    return `<${t.tag} ${attrs.join(' ')}>`;
  };

  // 代码块 → 与 Typora 导出一致：pre.md-fences > div.CodeMirror.cm-s-inner > .CodeMirror-code > .CodeMirror-line
  // （不包含 <code> 元素，因此不会触发「行内代码」的 hover 效果）
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const lang = (token.info || '').trim().split(/\s+/)[0] || '';
    const esc = md.utils.escapeHtml;

    if (lang.toLowerCase() === 'mermaid') {
      env.mermaid.push(token.content);
      return (
        `<pre class="md-fences" lang="mermaid">` +
        `<div class="md-diagram mermaid">${esc(token.content)}</div>` +
        `</pre>\n`
      );
    }

    const code = token.content.replace(/\r\n?/g, '\n');
    const highlighted = md.options.highlight
      ? md.options.highlight(code, lang)
      : esc(code);
    const lines = highlighted.split('\n').map((l) => `<div class="CodeMirror-line">${l || ' '}</div>`).join('\n');
    return (
      `<pre class="md-fences" lang="${esc(lang)}">` +
      `<div class="CodeMirror cm-s-inner CodeMirror-wrap" lang="${esc(lang)}">` +
      `<div class="CodeMirror-code">${lines}</div>` +
      `</div>` +
      `</pre>\n`
    );
  };

  // 表格 → 包一层 .table-wrap 以便窄屏横向滚动
  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
  md.renderer.rules.table_close = () => '</table></div>\n';

  // 脚注上标：补 md-footnote 类（引擎会渲染成圆形小徽标）
  const defaultFootnoteRef = md.renderer.rules.footnote_ref;
  if (defaultFootnoteRef) {
    md.renderer.rules.footnote_ref = (tokens, idx, options, env2, self) =>
      defaultFootnoteRef(tokens, idx, options, env2, self).replace(
        '<sup class="footnote-ref"',
        '<sup class="footnote-ref md-footnote"'
      );
  }

  // 数学公式：先提取为占位符 → markdown-it 渲染 → 还原为 MathJax SVG
  const extracted = extractMath(githubAlertsToContainers(mdText));
  let body = md.render(extracted.src, env);
  // 块级公式：逐个把占位符从其所在 <p> 中拆出，独立成 .math-block（display 公式）
  for (let n = 0; n < extracted.math.length; n++) {
    const item = extracted.math[n];
    if (!item || !item.display) continue;
    const ph = `\uE000MATH${n}\uE000`;
    const re = new RegExp(`<p>([\\s\\S]*?)${ph}([\\s\\S]*?)<\\/p>`);
    const svg = `<div class="math-block">${renderMath(item.tex, true)}</div>`;
    if (re.test(body)) {
      body = body.replace(re, (mm, pre, post) => {
        const preP = pre.trim() ? `<p>${pre.trim()}</p>` : '';
        const postP = post.trim() ? `<p>${post.trim()}</p>` : '';
        return `${preP}${svg}${postP}`;
      });
    } else {
      body = body.split(ph).join(svg);
    }
  }
  // 行内公式：占位符原位替换为 MathJax SVG
  for (let n = 0; n < extracted.math.length; n++) {
    const item = extracted.math[n];
    if (!item || item.display) continue;
    body = body.split(`\uE000MATH${n}\uE000`).join(renderMath(item.tex, false));
  }
  return { body, toc: env.toc, mermaid: env.mermaid };
}

module.exports = { renderMarkdown, highlightCode };