'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Phycat 主题清单。
 * 每个主题 = 一个配色文件（只含 CSS 变量），构建时与对应的引擎样式合并。
 * series: 'color' = 亮色系(Phycat-color)，'neon' = 暗色系(Phycat-neon)
 * accent: 用于站点 UI 的示意主色（仅用于主题切换器按钮等装饰）
 */
const THEMES = [
  { id: 'cherry',    name: '樱桃红',   series: 'color', file: 'phycat-cherry.css',    accent: '#ff7096' },
  { id: 'caramel',   name: '焦糖橙',   series: 'color', file: 'phycat-caramel.css',   accent: '#ff8c42' },
  { id: 'forest',    name: '森绿',     series: 'color', file: 'phycat-forest.css',    accent: '#11aa63' },
  { id: 'mint',      name: '薄荷青',   series: 'color', file: 'phycat-mint.css',      accent: '#1abc9c' },
  { id: 'sky',       name: '天蓝',     series: 'color', file: 'phycat-sky.css',       accent: '#4a9eff' },
  { id: 'prussian',  name: '普鲁士蓝', series: 'color', file: 'phycat-prussian.css',  accent: '#24466e' },
  { id: 'sakura',    name: '樱花粉',   series: 'color', file: 'phycat-sakura.css',    accent: '#ff9bb6' },
  { id: 'mauve',     name: '淡紫',     series: 'color', file: 'phycat-mauve.css',     accent: '#a78bfa' },
  { id: 'vampire',   name: '吸血鬼',   series: 'neon',  file: 'phycat-vampire.css',   accent: '#ff5555' },
  { id: 'radiation', name: '辐射',     series: 'neon',  file: 'phycat-radiation.css', accent: '#50fa7b' },
  { id: 'abyss',     name: '深渊',     series: 'neon',  file: 'phycat-abyss.css',     accent: '#4fc3f7' },
];

const DEFAULT_THEME = 'forest';

/** 根据配色文件里的 @import 判断使用亮色还是暗色引擎 */
function engineForColorCss(colorCss) {
  const m = colorCss.match(/@import\s+url\(([^)]+)\)/);
  const file = m ? m[1] : '';
  return /dark/i.test(file) ? 'phycat.dark.css' : 'phycat.light.css';
}

/**
 * 合并「引擎样式 + 配色变量」生成一个可直接用于网页的主题 CSS。
 * phycatDir: 存放 phycat.light/dark.css 与 11 个配色文件的目录
 */
function mergeTheme(phycatDir, theme) {
  const colorCss = fs.readFileSync(path.join(phycatDir, theme.file), 'utf8');
  const engineFile = engineForColorCss(colorCss);
  const engineCss = fs.readFileSync(path.join(phycatDir, engineFile), 'utf8');

  // 去掉配色文件开头的 @import 行，仅保留 :root { ... } 变量块
  const varsBlock = colorCss.replace(/@import[^;]+;/g, '').trim();

  // 引擎中的字体引用改为相对「生成主题文件位置」的路径（dist/assets/themes/ -> ../phycat/）
  let merged = engineCss
    .replace(/url\((Cascadia-Code-Regular\.ttf)\)/g, 'url(../phycat/$1)')
    .replace(/url\((LXGWWenKai-Regular\.ttf)\)/g, 'url(../phycat/$1)');

  // font-display: swap —— 避免页面加载时字体闪现（FOUT）
  // woff2 为主，ttf 作为兼容备用；font-display: swap 避免字体闪现
  merged = merged.replace(
    /src: url\(\.\.\/phycat\/Cascadia-Code-Regular\.ttf\)/g,
    'src: url(../phycat/Cascadia-Code-Regular.woff2) format("woff2"), url(../phycat/Cascadia-Code-Regular.ttf) format("truetype"); font-display: swap'
  );
  merged = merged.replace(
    /src: url\(\.\.\/phycat\/LXGWWenKai-Regular\.ttf\)/g,
    'src: url(../phycat/LXGWWenKai-Regular.woff2) format("woff2"), url(../phycat/LXGWWenKai-Regular.ttf) format("truetype"); font-display: swap'
  );

  merged += '\n\n' + varsBlock + '\n';

  // 页面级配色：暗色系定义了 --bg-color/--text-color，亮色系没有 → 提供回退（浅色底）
  merged +=
    '\n/* ===== 站点页面级配色（site shell）===== */\n' +
    'body { background-color: var(--bg-color, var(--page-bg, #fffdf7)); color: var(--text-color, #333); }\n';

  return merged;
}

module.exports = { THEMES, DEFAULT_THEME, mergeTheme, engineForColorCss };