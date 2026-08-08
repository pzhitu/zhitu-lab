/* ==========================================================================
   Phycat Blog - 在线配色工坊
   移植自 Phycat Theme Studio（亮色 + 暗色 Neon）：
   - 主色 → HSL 自动推导整套配色
   - 实时应用到全站（CSS 变量覆盖）
   - 保存到 localStorage（刷新保持）
   - 导出 / 下载为新的主题配色文件
   ========================================================================== */
(function () {
  'use strict';

  var root = (document.body && document.body.getAttribute('data-root')) || '';
  var STORAGE_KEY = 'phycat-custom-theme';

  /* ---------------- ColorUtils（移植自 Theme Studio） ---------------- */
  var ColorUtils = {
    hexToRgb: function (hex) {
      var r = 0, g = 0, b = 0, a = 1;
      hex = hex.replace('#', '');
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else if (hex.length === 8) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        a = parseInt(hex.substring(6, 8), 16) / 255;
      }
      return { r: r, g: g, b: b, a: a };
    },
    rgbToHex: function (r, g, b, a) {
      var toHex = function (n) {
        var h = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return h.length === 1 ? '0' + h : h;
      };
      var hex = '#' + toHex(r) + toHex(g) + toHex(b);
      if (a !== undefined && a < 1) hex += toHex(a * 255);
      return hex;
    },
    rgbToHsl: function (r, g, b) {
      r /= 255; g /= 255; b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    },
    hslToRgb: function (h, s, l) {
      h /= 360; s /= 100; l /= 100;
      var r, g, b;
      if (s === 0) { r = g = b = l; }
      else {
        var hue2rgb = function (p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },
  };

  /* ---------------- 变量配置 ---------------- */
  var LIGHT_CONFIG = [
    { key: '--head-title-color', label: '标题主色(H1/H3)' },
    { key: '--head-title-h2-color', label: 'H2 文字色' },
    { key: '--h2-grad-start', label: 'H2 渐变-左' },
    { key: '--h2-grad-mid', label: 'H2 渐变-中' },
    { key: '--h2-grad-end', label: 'H2 渐变-右' },
    { key: '--element-color', label: '元素主色' },
    { key: '--element-color-deep', label: '深色强调' },
    { key: '--element-color-shallow', label: '浅色装饰' },
    { key: '--element-color-so-shallow', label: '高亮背景' },
    { key: '--element-color-soo-shallow', label: '极浅背景' },
    { key: '--glass-bg-color', label: '毛玻璃底色', alpha: true },
    { key: '--element-color-linecode', label: '行内代码字' },
    { key: '--element-color-linecode-background', label: '行内代码底' },
    { key: '--appui-color-text', label: 'UI 文字色' },
    { key: '--primary-color', label: '链接/强调色' },
  ];
  var DARK_CONFIG = [
    { key: '--primary-color', label: '主题主色' },
    { key: '--hover-background-color', label: '悬停背景' },
    { key: '--secondary-color', label: '次色' },
    { key: '--bg-color', label: '页面背景' },
    { key: '--text-color', label: '正文文字' },
    { key: '--text-color-secondary', label: '次要文字' },
    { key: '--border-color', label: '边框色' },
    { key: '--code-block-bg', label: '代码块背景', alpha: true },
    { key: '--glass-border-color', label: '玻璃边框', alpha: true },
    { key: '--code-keyword', label: '代码-关键字' },
    { key: '--code-variable', label: '代码-变量' },
    { key: '--code-function', label: '代码-函数' },
    { key: '--code-param', label: '代码-参数' },
    { key: '--code-string', label: '代码-字符串' },
    { key: '--code-comment', label: '代码-注释' },
    { key: '--code-type', label: '代码-类型' },
    { key: '--code-property', label: '代码-属性' },
    { key: '--code-number', label: '代码-数字' },
    { key: '--code-meta', label: '代码-元' },
    { key: '--code-selected-bg', label: '代码-选中底', alpha: true },
  ];

  /* ---------------- 颜色说明词典 ---------------- */
  var VAR_DOCS = {
    '--head-title-color': { label: '标题主色', desc: 'h1 悬停变色、h3–h6 标题装饰' },
    '--head-title-h2-color': { label: 'H2 文字色', desc: 'H2 标题文字（渐变底上的字）' },
    '--h2-grad-start': { label: 'H2 渐变-左', desc: 'H2 渐变左端' },
    '--h2-grad-mid': { label: 'H2 渐变-中', desc: 'H2 渐变中间（通常=主色）' },
    '--h2-grad-end': { label: 'H2 渐变-右', desc: 'H2 渐变右端' },
    '--head-title-h2-background': { label: 'H2 渐变背景', desc: 'H2 渐变 + h1 下划线（由左/中/右自动合成）' },
    '--element-color': { label: '元素主色', desc: '正文中绝大部分主题色元素：勾选框、引用、代码块阴影、hover 等' },
    '--element-color-deep': { label: '深色强调', desc: 'hover 文字、边框、强调元素' },
    '--element-color-shallow': { label: '浅色装饰', desc: 'h3–h6 尾部小图标、分隔线、虚线' },
    '--element-color-so-shallow': { label: '很浅色', desc: 'hover 高亮渐变、阴影' },
    '--element-color-soo-shallow': { label: '极浅色', desc: '引用块、表格、光晕背景' },
    '--glass-bg-color': { label: '毛玻璃底色', desc: '目录侧栏毛玻璃底色（含透明度；暗色主题未定义）' },
    '--element-color-linecode': { label: '行内代码字', desc: '行内代码文字色' },
    '--element-color-linecode-background': { label: '行内代码底', desc: '行内代码背景色' },
    '--appui-color-text': { label: '图内文字', desc: 'mermaid / 流程图标签文字' },
    '--primary-color': { label: '主题主色', desc: '链接/强调色（也驱动站点外壳与光晕）' },
    '--hover-background-color': { label: '悬停背景', desc: '引用块聚焦时的背景与光晕' },
    '--secondary-color': { label: '次色', desc: '文字描边、链接下划线、装饰、mermaid' },
    '--bg-color': { label: '页面背景', desc: '页面背景色（暗色底）' },
    '--text-color': { label: '正文文字', desc: '正文与标题文字色' },
    '--text-color-secondary': { label: '次要文字', desc: '段落、目录等次要文字' },
    '--border-color': { label: '边框色', desc: '表格/图边框、分隔线' },
    '--glow-color': { label: '光晕色', desc: '霓虹光晕色（自动由主色派生）' },
    '--glow-shadow-text': { label: '标题光晕', desc: '标题文字霓虹阴影（自动派生）' },
    '--glow-shadow-box': { label: '盒子光晕', desc: '元素盒子霓虹阴影（自动派生）' },
    '--select-text-bg-color': { label: '选中文字底', desc: '选中文字背景（自动派生）' },
    '--h2-bg-image': { label: 'H2 光晕背景', desc: 'H2 径向光晕背景（自动由主色派生）' },
    '--code-block-bg': { label: '代码块背景', desc: '预留变量，引擎当前未使用' },
    '--glass-border-color': { label: '玻璃边框', desc: '预留变量，引擎当前未使用' },
    '--code-keyword': { label: '代码-关键字', desc: '代码高亮关键字' },
    '--code-variable': { label: '代码-变量', desc: '代码高亮变量' },
    '--code-function': { label: '代码-函数', desc: '代码高亮函数' },
    '--code-param': { label: '代码-参数', desc: '代码高亮参数' },
    '--code-string': { label: '代码-字符串', desc: '代码高亮字符串' },
    '--code-comment': { label: '代码-注释', desc: '代码高亮注释' },
    '--code-type': { label: '代码-类型', desc: '代码高亮类型' },
    '--code-property': { label: '代码-属性', desc: '代码高亮属性' },
    '--code-number': { label: '代码-数字', desc: '代码高亮数字' },
    '--code-meta': { label: '代码-元', desc: '代码高亮元信息' },
    '--code-selected-bg': { label: '代码选中底', desc: '代码选中文字背景（编辑器态，静态页基本不可见）' },
  };
  var LIGHT_DERIVED = ['--head-title-h2-background'];
  var DARK_DERIVED = ['--glow-color', '--glow-shadow-text', '--glow-shadow-box', '--select-text-bg-color', '--h2-bg-image'];

  /* ---------------- 推导 ---------------- */
  function generateLight(base) {
    var rgb = ColorUtils.hexToRgb(base);
    var hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    var H = hsl.h, S = hsl.s, L = hsl.l;
    var deep = ColorUtils.hslToRgb(H, Math.min(100, S + 10), Math.max(20, L - 15));
    var shallow = ColorUtils.hslToRgb(H, Math.max(0, S - 10), Math.min(90, L + 25));
    var soShallow = ColorUtils.hslToRgb(H, Math.max(0, S - 5), Math.min(96, L + 38));
    var sooShallow = ColorUtils.hslToRgb(H, 40, 98);
    var code = ColorUtils.hslToRgb((H - 10 + 360) % 360, 80, 40);
    var codeBg = ColorUtils.hslToRgb((H - 10 + 360) % 360, 50, 96);
    return {
      '--head-title-color': base,
      '--head-title-h2-color': '#ffffff',
      '--h2-grad-start': ColorUtils.rgbToHex(shallow.r, shallow.g, shallow.b),
      '--h2-grad-mid': base,
      '--h2-grad-end': ColorUtils.rgbToHex(shallow.r, shallow.g, shallow.b),
      '--head-title-h2-background':
        'linear-gradient(to right, ' + ColorUtils.rgbToHex(shallow.r, shallow.g, shallow.b) + ', ' + base + ', ' + ColorUtils.rgbToHex(shallow.r, shallow.g, shallow.b) + ')',
      '--element-color': base,
      '--element-color-deep': ColorUtils.rgbToHex(deep.r, deep.g, deep.b),
      '--element-color-shallow': ColorUtils.rgbToHex(shallow.r, shallow.g, shallow.b),
      '--element-color-so-shallow': ColorUtils.rgbToHex(soShallow.r, soShallow.g, soShallow.b),
      '--element-color-soo-shallow': ColorUtils.rgbToHex(sooShallow.r, sooShallow.g, sooShallow.b),
      '--glass-bg-color': ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b, 0.02),
      '--element-color-linecode': ColorUtils.rgbToHex(code.r, code.g, code.b),
      '--element-color-linecode-background': ColorUtils.rgbToHex(codeBg.r, codeBg.g, codeBg.b),
      '--appui-color-text': '#333333',
      '--primary-color': base,
    };
  }

  function generateDark(base) {
    var rgb = ColorUtils.hexToRgb(base);
    var hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    var sec = ColorUtils.hslToRgb((hsl.h + 200) % 360, 90, 80);
    var g = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ';
    return {
      '--primary-color': base,
      '--hover-background-color': base,
      '--secondary-color': ColorUtils.rgbToHex(sec.r, sec.g, sec.b),
      '--bg-color': '#282a36',
      '--text-color': '#f8f8f2',
      '--text-color-secondary': '#7e8c9f',
      '--border-color': '#44475a',
      '--glow-color': g + '0.6)',
      '--select-text-bg-color': g + '0.3)',
      '--h2-bg-image': 'radial-gradient(ellipse at center bottom, ' + g + '0.15), transparent 70%)',
      '--glow-shadow-text': '0 0 8px ' + g + '0.6)',
      '--glow-shadow-box': '0 0 8px ' + g + '0.6)',
      '--code-block-bg': '#0000004d',
      '--glass-border-color': '#ffffff0d',
      '--code-keyword': '#ff79c6',
      '--code-variable': '#f8f8f2',
      '--code-function': '#50fa7b',
      '--code-param': '#f1fa8c',
      '--code-string': '#f1fa8c',
      '--code-comment': '#6272a4',
      '--code-type': '#8be9fd',
      '--code-property': '#66d9ef',
      '--code-number': '#bd93f9',
      '--code-meta': '#ffb86c',
      '--code-selected-bg': '#44475a',
    };
  }

  /* ---------------- 应用 / 保存 / 清除 ---------------- */
  function applyCustom(mode, vars) {
    var base = mode === 'dark' ? 'vampire' : 'forest';
    var link = document.getElementById('theme-css');
    var stamp = (document.body && document.body.getAttribute('data-stamp')) || '';
    if (link) link.href = root + 'assets/themes/theme-' + base + '.css?v=' + stamp;
    var style = document.getElementById('custom-theme');
    if (!style) {
      style = document.createElement('style');
      style.id = 'custom-theme';
      document.head.appendChild(style);
    }
    var css = ':root{' + Object.keys(vars).map(function (k) { return k + ':' + vars[k] + ';'; }).join('') + '}';
    style.textContent = css;
    document.body.setAttribute('data-theme-series', mode === 'dark' ? 'neon' : 'color');
    if (window.PhycatThemeUI && PhycatThemeUI.markCustom) PhycatThemeUI.markCustom(true);
  }
  function getCustom() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveCustom(mode, vars, mainColor) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: mode, vars: vars, mainColor: mainColor })); } catch (e) {}
  }
  function clearCustom() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    try { localStorage.removeItem('phycat-studio-state'); } catch (e) {}
    var style = document.getElementById('custom-theme');
    if (style) style.remove();
    if (window.PhycatThemeUI && PhycatThemeUI.markCustom) PhycatThemeUI.markCustom(false);
  }

  /* ---------------- 导出 ---------------- */
  function buildExportCss(mode, vars) {
    var engine = mode === 'dark' ? 'phycat.dark.css' : 'phycat.light.css';
    var staticBlock = (window.PHYCAT_STUDIO_STATIC || '').trim();
    var varsCss = Object.keys(vars).map(function (k) { return '  ' + k + ': ' + vars[k] + ';'; }).join('\n');
    return '@import url(./phycat/' + engine + ');\n\n:root {\n' + staticBlock + '\n' + varsCss + '\n}';
  }
  function copyCss(css) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(css);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = css;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }
  function downloadCss(css, name) {
    var blob = new Blob([css], { type: 'text/css;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name || 'phycat-custom.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------------- UI ---------------- */
  var state = { mode: 'light', mainColor: '#ff7096', vars: null, autoCalc: true, _prev: null, _saved: false };
  var els = {};

  function currentConfig() { return state.mode === 'dark' ? DARK_CONFIG : LIGHT_CONFIG; }
  function generate(mode, base) { return mode === 'dark' ? generateDark(base) : generateLight(base); }

  function buildModal() {
    var ov = document.createElement('div');
    ov.className = 'studio-overlay';
    ov.id = 'studioOverlay';
    ov.hidden = true;
    ov.innerHTML =
      '<div class="studio-box">' +
        '<header class="studio-head"><span>🎨 自定义主题</span><button type="button" class="studio-close" id="studioClose" aria-label="关闭">×</button></header>' +
        '<div class="studio-body">' +
          '<div class="studio-modes">' +
            '<button type="button" class="studio-mode" data-mode="light">亮色系</button>' +
            '<button type="button" class="studio-mode" data-mode="dark">暗色系</button>' +
          '</div>' +
          '<div class="studio-main">' +
            '<label>主色</label>' +
            '<input type="color" id="studioMainColor" value="#ff7096">' +
            '<input type="text" id="studioMainColorText" value="#ff7096">' +
            '<label class="check"><input type="checkbox" id="studioAutoCalc" checked> 自动计算衍生色</label>' +
          '</div>' +
          '<div class="studio-fine-head">' +
            '<span class="t">衍生色微调</span>' +
            '<div class="studio-fine-btns">' +
              '<button type="button" class="studio-fine-toggle" id="studioDocsToggle">📖 颜色说明</button>' +
              '<button type="button" class="studio-fine-toggle" id="studioFineToggle">展开</button>' +
            '</div>' +
          '</div>' +
          '<div class="studio-fine-grid" id="studioFineGrid" hidden></div>' +
          '<div class="studio-docs" id="studioDocs" hidden>' +
            '<table><thead><tr><th>变量</th><th>作用 / 说明</th></tr></thead><tbody id="studioDocsBody"></tbody></table>' +
          '</div>' +
          '<div class="studio-preview-note">实时预览：当前页面即为应用效果；点「保存配色」后刷新仍会保留，未保存关闭将恢复原主题。</div>' +
          '<div class="studio-export-area">' +
            '<div class="studio-export-head">' +
              '<span class="t">导出 / 注册为新主题</span>' +
              '<label class="name">主题名称 <input type="text" id="studioThemeName" spellcheck="false" placeholder="默认取自主色"></label>' +
            '</div>' +
            '<textarea class="studio-export" id="studioExportBox" hidden spellcheck="false"></textarea>' +
            '<div class="studio-register" id="studioRegister" hidden>' +
              '<ol>' +
                '<li>把下载的 CSS 文件放入项目 <code>phycat/</code> 目录</li>' +
                '<li>在 <code>lib/themes.js</code> 的 THEMES 数组加入：<pre id="studioRegisterCode"></pre></li>' +
                '<li>重新运行 <code>npm run build</code></li>' +
              '</ol>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<footer class="studio-actions">' +
          '<button type="button" class="primary" id="studioSave">💾 保存配色</button>' +
          '<button type="button" id="studioCopy">📋 复制 CSS</button>' +
          '<button type="button" id="studioDownload">⬇️ 下载 .css</button>' +
          '<button type="button" id="studioCopyRegister">📝 注册代码</button>' +
          '<span class="spacer"></span>' +
          '<button type="button" id="studioReset">♻️ 重置</button>' +
          '<button type="button" id="studioClose2">关闭</button>' +
        '</footer>' +
      '</div>';
    document.body.appendChild(ov);

    els.overlay = ov;
    els.close = ov.querySelector('#studioClose');
    els.close2 = ov.querySelector('#studioClose2');
    els.modes = Array.prototype.slice.call(ov.querySelectorAll('.studio-mode'));
    els.mainColor = ov.querySelector('#studioMainColor');
    els.mainColorText = ov.querySelector('#studioMainColorText');
    els.autoCalc = ov.querySelector('#studioAutoCalc');
    els.fineGrid = ov.querySelector('#studioFineGrid');
    els.fineToggle = ov.querySelector('#studioFineToggle');
    els.docs = ov.querySelector('#studioDocs');
    els.docsBody = ov.querySelector('#studioDocsBody');
    els.docsToggle = ov.querySelector('#studioDocsToggle');
    els.exportBox = ov.querySelector('#studioExportBox');
    els.save = ov.querySelector('#studioSave');
    els.copy = ov.querySelector('#studioCopy');
    els.download = ov.querySelector('#studioDownload');
    els.copyRegister = ov.querySelector('#studioCopyRegister');
    els.reset = ov.querySelector('#studioReset');
    els.themeName = ov.querySelector('#studioThemeName');
    els.register = ov.querySelector('#studioRegister');
    els.registerCode = ov.querySelector('#studioRegisterCode');

    els.close.addEventListener('click', close);
    els.close2.addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });

    els.modes.forEach(function (btn) {
      btn.addEventListener('click', function () { setMode(btn.getAttribute('data-mode')); });
    });
    els.mainColor.addEventListener('input', function () { onMainColor(els.mainColor.value); });
    els.mainColorText.addEventListener('change', function () {
      var v = els.mainColorText.value.trim();
      if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
        v = (v[0] === '#' ? v : '#' + v).toLowerCase();
        // 主色未变化时不重新生成，避免失焦时把微调过的衍生色冲掉
        if (v !== state.mainColor) onMainColor(v);
      }
    });
    els.autoCalc.addEventListener('change', function () { state.autoCalc = els.autoCalc.checked; onMainColor(els.mainColor.value); });
    els.fineToggle.addEventListener('click', function () {
      els.fineGrid.hidden = !els.fineGrid.hidden;
      els.fineToggle.textContent = els.fineGrid.hidden ? '展开' : '收起';
    });
    els.docsToggle.addEventListener('click', function () {
      els.docs.hidden = !els.docs.hidden;
      els.docsToggle.textContent = els.docs.hidden ? '📖 颜色说明' : '📖 收起说明';
    });

    els.save.addEventListener('click', save);
    els.copy.addEventListener('click', copy);
    els.download.addEventListener('click', download);
    els.copyRegister.addEventListener('click', copyRegister);
    els.reset.addEventListener('click', reset);
    if (els.themeName) {
      els.themeName.addEventListener('input', function () { state.autoName = false; });
    }
  }

  function setMode(mode) {
    state.mode = mode;
    els.modes.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-mode') === mode); });
    buildFineGrid();
    buildDocs(mode);
    onMainColor(els.mainColor.value, true);
  }

  function buildFineGrid() {
    els.fineGrid.innerHTML = '';
    currentConfig().forEach(function (conf) {
      var item = document.createElement('div');
      item.className = 'studio-fine-item';
      var isAlpha = !!conf.alpha;
      item.innerHTML =
        '<span class="swatch" title="点击取色"></span>' +
        (isAlpha ? '<input type="range" class="alpha" min="0" max="100" value="100" title="透明度">' : '') +
        '<input type="color">' +
        '<input type="text" spellcheck="false">' +
        '<span class="lbl"></span>';
      var swatch = item.querySelector('.swatch');
      var alphaRange = item.querySelector('input[type=range]');
      var colorIn = item.querySelector('input[type=color]');
      var textIn = item.querySelector('input[type=text]');
      var lbl = item.querySelector('.lbl');
      lbl.textContent = conf.label;
      item.title = conf.key;
      var setVal = function (v) {
        var hex6 = (v || '').substring(0, 7);
        if (/^#?[0-9a-fA-F]{6}$/.test(hex6)) {
          swatch.style.background = hex6;
          colorIn.value = hex6;
        }
        textIn.value = v || '';
        if (isAlpha && alphaRange) {
          var a = 255;
          if (v && v.length === 9) a = parseInt(v.substring(7), 16);
          alphaRange.value = String(Math.round((a / 255) * 100));
        }
      };
      // 点击色块 → 打开原生取色器
      swatch.addEventListener('click', function () { colorIn.click(); });
      colorIn.addEventListener('input', function () {
        var hex = colorIn.value;
        // 保留原 alpha（若有）
        var old = textIn.value || '';
        textIn.value = old.length === 9 ? hex + old.substring(7) : hex;
        setVar(conf.key, textIn.value);
      });
      // alpha 滑块（仅 alpha 变量）
      if (isAlpha && alphaRange) {
        alphaRange.addEventListener('input', function () {
          var a = Math.round((Number(alphaRange.value) / 100) * 255);
          var hex6 = (textIn.value || '').substring(0, 7);
          if (!/^#?[0-9a-fA-F]{6}$/.test(hex6)) hex6 = '#000000';
          if (hex6[0] !== '#') hex6 = '#' + hex6;
          var aHex = a.toString(16);
          if (aHex.length === 1) aHex = '0' + aHex;
          setVar(conf.key, hex6 + aHex);
        });
      }
      textIn.addEventListener('change', function () {
        var v = textIn.value.trim();
        if (/^#?[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(v)) {
          v = (v[0] === '#' ? v : '#' + v).toLowerCase();
          setVar(conf.key, v);
        }
      });
      item._setVal = setVal;
      item._conf = conf;
      els.fineGrid.appendChild(item);
    });
  }

  function updateFineGrid(vars) {
    Array.prototype.forEach.call(els.fineGrid.children, function (item) {
      var v = vars[item._conf.key];
      if (v !== undefined) item._setVal(v);
    });
  }

  /* 颜色说明表：当前模式的微调变量 + 自动派生变量 */
  function buildDocs(mode) {
    if (!els.docsBody) return;
    var keys = currentConfig().map(function (c) { return c.key; });
    keys = keys.concat(mode === 'dark' ? DARK_DERIVED : LIGHT_DERIVED);
    els.docsBody.innerHTML = '';
    keys.forEach(function (k) {
      var d = VAR_DOCS[k] || { label: k, desc: '' };
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + k + '</td><td><b>' + d.label + '</b>' + (d.desc ? '：' + d.desc : '') + '</td>';
      els.docsBody.appendChild(tr);
    });
  }

  /* 记住工坊工作状态：关闭后再打开显示上次内容 */
  function persistStudioState() {
    try {
      localStorage.setItem('phycat-studio-state', JSON.stringify({
        mode: state.mode,
        mainColor: state.mainColor,
        vars: state.vars,
        autoCalc: state.autoCalc,
      }));
    } catch (e) {}
  }

  function setVar(key, value) {
    if (!state.vars) return;
    state.vars[key] = value;
    // 亮色 H2：三个渐变拆分变量改动时，自动合成引擎使用的完整渐变
    if (state.mode === 'light' && (key === '--h2-grad-start' || key === '--h2-grad-mid' || key === '--h2-grad-end')) {
      var gs = state.vars['--h2-grad-start'] || '#ffb7cd';
      var gm = state.vars['--h2-grad-mid'] || '#ff7096';
      var ge = state.vars['--h2-grad-end'] || '#ffb7cd';
      state.vars['--head-title-h2-background'] = 'linear-gradient(to right, ' + gs + ', ' + gm + ', ' + ge + ')';
    }
    applyCustom(state.mode, state.vars);
    persistStudioState();
    // 同步该变量的色块
    Array.prototype.forEach.call(els.fineGrid.children, function (item) {
      if (item._conf.key === key) item._setVal(value);
    });
  }

  function onMainColor(hex, force) {
    hex = hex || state.mainColor;
    if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return;
    hex = (hex[0] === '#' ? hex : '#' + hex).toLowerCase();
    state.mainColor = hex;
    els.mainColor.value = hex;
    els.mainColorText.value = hex;
    refreshName(false);
    if (state.autoCalc || force) {
      state.vars = generate(state.mode, hex);
      applyCustom(state.mode, state.vars);
      updateFineGrid(state.vars);
    } else {
      // 只更新主色相关变量
      if (!state.vars) state.vars = generate(state.mode, hex);
      setVar('--element-color', hex);
      setVar('--head-title-color', hex);
      setVar('--appui-color', hex);
      setVar('--primary-color', hex);
    }
    persistStudioState();
  }

  function save() {
    if (!state.vars) return;
    saveCustom(state.mode, state.vars, state.mainColor);
    state._saved = true;
    var btn = els.save;
    var old = btn.textContent;
    btn.textContent = '✓ 已保存';
    setTimeout(function () { btn.textContent = old; }, 1500);
    setTimeout(close, 800);
  }

  /* ---------- 导出：按色命名 + 注册代码 ---------- */
  function slugName(s) {
    return String(s || '').trim().replace(/[^\w\u4e00-\u9fa5-]+/g, '-').replace(/^-+|-+$/g, '') || 'custom';
  }
  function getThemeName() {
    return slugName(els.themeName ? els.themeName.value : '');
  }
  function getExportFileName() {
    return 'phycat-' + getThemeName() + '-' + (state.mode === 'dark' ? 'neon' : 'color') + '.css';
  }
  function buildRegistrationSnippet() {
    var name = getThemeName();
    var series = state.mode === 'dark' ? 'neon' : 'color';
    var accent = state.mainColor || '#11aa63';
    return "{ id: 'custom-" + name + "', name: '" + name + "', series: '" + series +
      "', file: 'phycat-" + name + "-" + series + ".css', accent: '" + accent + "' }";
  }
  function refreshName(force) {
    if (!els.themeName) return;
    if (force || state.autoName) {
      els.themeName.value = (state.mainColor || '').replace('#', '').substring(0, 6);
      state.autoName = true;
    }
  }

  function copy() {
    if (els.register) els.register.hidden = true;
    var css = buildExportCss(state.mode, state.vars);
    els.exportBox.hidden = false;
    els.exportBox.value = css;
    copyCss(css).then(function () {
      var btn = els.copy;
      var old = btn.textContent;
      btn.textContent = '✓ 已复制';
      setTimeout(function () { btn.textContent = old; }, 1500);
    });
  }

  function download() {
    var css = buildExportCss(state.mode, state.vars);
    downloadCss(css, getExportFileName());
  }

  function copyRegister() {
    var snippet = buildRegistrationSnippet();
    if (els.registerCode) els.registerCode.textContent = snippet;
    if (els.register) els.register.hidden = false;
    els.exportBox.hidden = true;
    copyCss(snippet).then(function () {
      var btn = els.copyRegister;
      var old = btn.textContent;
      btn.textContent = '✓ 已复制';
      setTimeout(function () { btn.textContent = old; }, 1500);
    });
  }

  function reset() {
    clearCustom();
    state._saved = true;
    if (window.PhycatThemeUI && PhycatThemeUI.applyPreset) PhycatThemeUI.applyPreset();
    close();
  }

  function open() {
    // 记录打开前的主题：关闭且未保存时恢复（避免实时预览拓不回去）
    var prevCustom = getCustom();
    var prevPreset = null;
    try { prevPreset = localStorage.getItem('phycat-theme'); } catch (e) {}
    state._prev = { custom: prevCustom, preset: prevPreset };
    state._saved = false;
    // 优先恢复上次工坊工作状态；其次用已保存的自定义；否则默认值
    var studio = null;
    try { studio = JSON.parse(localStorage.getItem('phycat-studio-state') || 'null'); } catch (e) {}
    var saved = getCustom();
    var restore = null;
    if (studio && studio.mode && studio.vars) {
      restore = studio;
    } else if (saved && saved.mode && saved.vars) {
      restore = { mode: saved.mode, vars: saved.vars, autoCalc: false };
    }
    if (restore) {
      state.mode = restore.mode;
      // 主色优先取保存值；旧数据缺失时从变量反推（--primary-color 亮/暗两模式都存在）
      state.mainColor = restore.mainColor || restore.vars['--primary-color'] || restore.vars['--head-title-color'] || '#ff7096';
      state.vars = restore.vars;
      state.autoCalc = !!restore.autoCalc;
    } else {
      state.mode = 'light';
      state.mainColor = '#ff7096';
      state.vars = null;
      state.autoCalc = true;
    }
    els.autoCalc.checked = !!state.autoCalc;
    els.modes.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-mode') === state.mode); });
    buildFineGrid();
    buildDocs(state.mode);
    if (restore) {
      // 恢复上次的变量（不再重新生成，保留微调值）
      updateFineGrid(state.vars);
      applyCustom(state.mode, state.vars);
    } else {
      onMainColor(state.mainColor, true);
    }
    // 还原路径不会触发 onMainColor，需手动回填主色输入框，否则会显示默认粉色
    els.mainColor.value = state.mainColor;
    els.mainColorText.value = state.mainColor;
    els.fineGrid.hidden = true;
    els.fineToggle.textContent = '展开';
    els.exportBox.hidden = true;
    if (els.register) els.register.hidden = true;
    refreshName(true);
    els.overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    // 未保存关闭：恢复打开前的主题（已保存的自定义或当前预设）
    if (!state._saved && state._prev) {
      var prev = state._prev;
      if (prev.custom && prev.custom.mode && prev.custom.vars) {
        applyCustom(prev.custom.mode, prev.custom.vars);
      } else if (window.PhycatThemeUI && window.PhycatThemeUI.applyPreset) {
        window.PhycatThemeUI.applyPreset();
      }
    }
    state._prev = null;
    state._saved = false;
    els.overlay.hidden = true;
    document.body.style.overflow = '';
  }

  /* ---------------- 对外 API ---------------- */
  window.PhycatStudio = {
    open: open,
    close: close,
    applyCustom: applyCustom,
    getCustom: getCustom,
    saveCustom: saveCustom,
    clearCustom: clearCustom,
    buildExportCss: buildExportCss,
  };

  document.addEventListener('DOMContentLoaded', function () { buildModal(); });
})();