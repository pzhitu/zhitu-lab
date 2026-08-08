/* ==========================================================================
   Phycat Blog — 前端脚本：主题切换 / mermaid / 目录 / 回到顶部 / 移动端目录
   ========================================================================== */
(function () {
  'use strict';

  var META = window.PHYCAT_SITE_META || { themes: [], defaultTheme: 'forest' };
  var root = (document.body && document.body.getAttribute('data-root')) || '';

  function findTheme(id) {
    for (var i = 0; i < META.themes.length; i++) {
      if (META.themes[i].id === id) return META.themes[i];
    }
    return null;
  }

  /* ---------- 主题切换 ---------- */
  var STORAGE_KEY = 'phycat-theme';

  function getSavedTheme() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved) return saved;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        var neon = null;
        for (var i = 0; i < META.themes.length; i++) {
          if (META.themes[i].series === 'neon') { neon = META.themes[i]; break; }
        }
        if (neon) return neon.id;
      }
    } catch (e) {}
    return META.defaultTheme;
  }

  function setSavedTheme(id) {
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
  }

  function updateThemeColor(color) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m && color) m.setAttribute('content', color);
  }

  function applyTheme(id) {
    var link = document.getElementById('theme-css');
    var stamp = (document.body && document.body.getAttribute('data-stamp')) || '';
    if (link) link.href = root + 'assets/themes/theme-' + id + '.css?v=' + stamp;
    setSavedTheme(id);
    var th = findTheme(id);
    if (th) updateThemeColor(th.accent);
    var cstyle = document.getElementById('custom-theme');
    if (cstyle) cstyle.remove();
    var theme = findTheme(id);
    var dot = document.getElementById('themeBtnDot');
    var label = document.getElementById('themeBtnLabel');
    if (dot && theme) dot.style.background = theme.accent;
    if (label && theme) label.textContent = theme.name;
    var opts = document.querySelectorAll('.theme-opt');
    for (var j = 0; j < opts.length; j++) {
      opts[j].classList.toggle('active', opts[j].getAttribute('data-theme') === id);
    }
    document.body.setAttribute('data-theme-series', theme ? theme.series : 'color');
  }

  function initThemeSwitcher() {
    var btn = document.getElementById('themeBtn');
    var panel = document.getElementById('themePanel');
    if (!btn || !panel) return;

    var grids = {
      color: document.getElementById('themeGridColor'),
      neon: document.getElementById('themeGridNeon'),
    };
    (META.themes || []).forEach(function (t) {
      var g = grids[t.series];
      if (!g) return;
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'theme-opt';
      opt.setAttribute('data-theme', t.id);
      opt.innerHTML = '<span class="swatch" style="background:' + t.accent + '"></span>' + t.name;
      opt.addEventListener('click', function () {
        if (window.PhycatStudio) window.PhycatStudio.clearCustom();
        applyTheme(t.id);
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      });
      g.appendChild(opt);
    });

    // 自定义配色入口
    var customBtn = document.createElement('button');
    customBtn.type = 'button';
    customBtn.className = 'theme-opt';
    customBtn.id = 'themeCustomBtn';
    customBtn.innerHTML = '<span class="swatch" style="background:linear-gradient(135deg,#ff7096,#11aa63,#4a9eff)"></span>自定义';
    customBtn.title = '打开配色工坊，自制主题色';
    customBtn.addEventListener('click', function () {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (window.PhycatStudio) window.PhycatStudio.open();
    });
    var customRow = document.createElement('div');
    customRow.className = 'theme-custom-row';
    customRow.appendChild(customBtn);
    panel.appendChild(customRow);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', String(!panel.hidden));
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) {
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    var custom = window.PhycatStudio ? window.PhycatStudio.getCustom() : null;
    if (custom && custom.mode && custom.vars) {
      window.PhycatStudio.applyCustom(custom.mode, custom.vars);
    } else {
      applyTheme(getSavedTheme());
    }
  }

  /* ---------- Mermaid（按明暗主题选择配色） ---------- */
  function initMermaid() {
    if (typeof window.mermaid === 'undefined' || !document.querySelector('.md-diagram.mermaid')) return;
    try {
      var theme = findTheme(getSavedTheme());
      var mermaidTheme = theme && theme.series === 'neon' ? 'dark' : 'default';
      window.mermaid.initialize({ startOnLoad: false, theme: mermaidTheme, securityLevel: 'loose' });
      window.mermaid.run({ querySelector: '.md-diagram.mermaid' });
    } catch (e) {
      // 渲染失败时保留原始代码文本
    }
  }
  window.PhycatMermaid = { init: initMermaid };

  /* ---------- 目录（多级树）跟随滚动高亮 ---------- */
  function initOutline() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.typora-export-sidebar .outline-label'));
    if (!links.length) return;

    var headings = Array.prototype.slice.call(document.querySelectorAll('#write .md-heading[id]'));
    if (!headings.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        var match = a.getAttribute('href') === '#' + id;
        a.classList.toggle('outline-item-active', match);
        var wrapper = a.closest('.outline-item-wrapper');
        if (wrapper) wrapper.classList.toggle('outline-item-active', match);
      });
    }

    var current = null;
    function update() {
      var id = null;
      var scrollY = window.scrollY + 100;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top + window.scrollY <= scrollY) id = headings[i].id;
      }
      if (id !== current) {
        current = id;
        setActive(id);
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- 回到顶部 ---------- */
  function initBackTop() {
    var btn = document.getElementById('backTop');
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle('show', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 移动端目录抽屉 ---------- */
  function initTocToggle() {
    var btn = document.getElementById('tocToggle');
    var sidebar = document.querySelector('.typora-export-sidebar');
    if (!btn || !sidebar) return;
    var mqDesktop = window.matchMedia('(min-width: 1201px)');
    btn.addEventListener('click', function () {
      if (mqDesktop.matches) {
        document.body.classList.toggle('toc-collapsed');
      } else {
        sidebar.classList.toggle('open');
      }
    });
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.outline-label')) sidebar.classList.remove('open');
    });
    document.addEventListener('click', function (e) {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== btn) {
        sidebar.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) sidebar.classList.remove('open');
    });
  }
  /* ---------- 代码复制 ---------- */
  function initCodeCopy() {
    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
    var pres = document.querySelectorAll('pre.md-fences:not([lang=mermaid])');
    Array.prototype.forEach.call(pres, function (pre) {
      if (pre.querySelector('.code-copy')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = '复制';
      btn.addEventListener('click', function () {
        var lines = Array.prototype.map.call(pre.querySelectorAll('.CodeMirror-line'), function (l) { return l.textContent; });
        var code = lines.join('\n');
        var done = function () {
          btn.textContent = '✓ 已复制';
          setTimeout(function () { btn.textContent = '复制'; }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(done).catch(function () { fallbackCopy(code); done(); });
        } else { fallbackCopy(code); done(); }
      });
      pre.appendChild(btn);
    });
  }

  /* ---------- 目录收起/展开（桌面端） ---------- */
  function initTocCollapse() {
    var btn = document.getElementById('outlineCollapse');
    if (!btn) return;
    // 桌面端默认折叠（先不显示目录），点右下角“目录”按钮展开
    if (window.matchMedia('(min-width: 1201px)').matches) {
      document.body.classList.add('toc-collapsed');
    }
    btn.addEventListener('click', function () {
      document.body.classList.add('toc-collapsed');
    });
  }
  /* ---------- 侧栏吸顶偏移：跟随导航栏实际高度，避免长文滚动时目录盖住导航栏 ---------- */
  function initStickySidebar() {
    var header = document.querySelector('.site-header');
    var sidebar = document.querySelector('.typora-export-sidebar');
    if (!header || !sidebar) return;
    var mq = window.matchMedia('(min-width: 1201px)');
    function update() {
      var h = header.getBoundingClientRect().height;
      if (mq.matches) {
        sidebar.style.top = (h + 20) + 'px';
      } else {
        // 移动端抽屉：从导航栏下方开始，不遮住导航
        sidebar.style.top = (h + 10) + 'px';
      }
    }
    update();
    window.addEventListener('resize', update);
  }


  /* ---------- 阅读进度条 ---------- */
  function initReadingProgress() {
    var bar = document.getElementById('readingProgress');
    if (!bar) return;
    function update() {
      var doc = document.documentElement;
      var total = doc.scrollHeight - window.innerHeight;
      var pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = pct.toFixed(2) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- 全文搜索 ---------- */
  function initSearch() {
    var btn = document.getElementById('searchBtn');
    var overlay = document.getElementById('searchOverlay');
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var hint = document.getElementById('searchHint');
    var closeBtn = document.getElementById('searchClose');
    if (!btn || !overlay || !input || !results) return;

    var root = (document.body && document.body.getAttribute('data-root')) || '';
    var index = null;
    var loading = false;
    var timer = null;
    var selected = -1;

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function hl(text, tokens) {
      var out = esc(text);
      tokens.forEach(function (tok) {
        if (!tok) return;
        var re = new RegExp('(' + tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        out = out.replace(re, '<mark>$1</mark>');
      });
      return out;
    }
    function loadIndex(cb) {
      if (index) return cb();
      if (loading) return;
      loading = true;
      var s = document.createElement('script');
      var stamp = (document.body && document.body.getAttribute('data-stamp')) || '';
      s.src = root + 'assets/search-index.js?v=' + stamp;
      s.onload = function () { index = window.PHYCAT_SEARCH_INDEX || []; cb(); };
      s.onerror = function () { index = []; cb(); };
      document.head.appendChild(s);
    }
    function open() {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      loadIndex(function () {
        input.focus();
        runSearch();
      });
    }
    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      input.value = '';
      results.innerHTML = '';
      if (hint) hint.textContent = '支持标题 / 正文 / 分类 / 标签搜索';
      selected = -1;
    }
    function search(q) {
      if (!index || !q) return [];
      var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!tokens.length) return [];
      var out = [];
      for (var i = 0; i < index.length; i++) {
        var it = index[i];
        var title = (it.t || '').toLowerCase();
        var cat = (it.c || '').toLowerCase();
        var tags = (it.g || []).join(' ').toLowerCase();
        var body = (it.s || '').toLowerCase();
        var ok = true;
        var score = 0;
        for (var k = 0; k < tokens.length; k++) {
          var tok = tokens[k];
          var inTitle = title.indexOf(tok) >= 0;
          var inTags = tags.indexOf(tok) >= 0;
          var inCat = cat.indexOf(tok) >= 0;
          var inBody = body.indexOf(tok) >= 0;
          if (!(inTitle || inTags || inCat || inBody)) { ok = false; break; }
          if (inTitle) {
            score += 80;
            if (title.indexOf(tok) === 0) score += 20;
          }
          if (inTags) score += 40;
          if (inCat) score += 20;
          var pos = 0, cnt = 0;
          while (pos < body.length && cnt < 5) {
            pos = body.indexOf(tok, pos);
            if (pos < 0) break;
            cnt++; pos += tok.length;
          }
          score += cnt * 4;
        }
        if (ok) out.push({ item: it, score: score, tokens: tokens });
      }
      out.sort(function (a, b) { return b.score - a.score || (a.item.d < b.item.d ? 1 : -1); });
      return out.slice(0, 20);
    }
    function snippet(it, tokens) {
      var text = it.s || '';
      var lc = text.toLowerCase();
      var first = -1, tok = '';
      for (var i = 0; i < tokens.length; i++) {
        var p = lc.indexOf(tokens[i]);
        if (p >= 0 && (first < 0 || p < first)) { first = p; tok = tokens[i]; }
      }
      if (first < 0) {
        var t = text.length > 90 ? text.slice(0, 90) + '…' : text;
        return esc(t);
      }
      var start = Math.max(0, first - 28);
      var end = Math.min(text.length, first + tok.length + 66);
      return (start > 0 ? '…' : '') + hl(text.slice(start, end), tokens) + (end < text.length ? '…' : '');
    }
    function render(list) {
      if (!list.length) {
        results.innerHTML = '<div class="search-empty">没有找到相关文章，换个关键词试试</div>';
        selected = -1;
        return;
      }
      selected = -1;
      results.innerHTML = list.map(function (r, idx) {
        var meta = '<time>' + esc(r.item.d) + '</time>' +
          '<span class="badge">' + esc(r.item.c) + '</span>' +
          (r.item.g || []).map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join('') +
          '<span class="read-meta">' + (r.item.w || 0) + ' 字</span>';
        return '<a class="search-item" href="' + root + r.item.u + '">' +
          '<h3>' + hl(r.item.t, r.tokens) + '</h3>' +
          '<p>' + snippet(r.item, r.tokens) + '</p>' +
          '<div class="meta">' + meta + '</div></a>';
      }).join('');
    }
    function runSearch() {
      var q = input.value.trim();
      if (hint) hint.textContent = q ? '' : '支持标题 / 正文 / 分类 / 标签搜索';
      if (!q) { results.innerHTML = ''; selected = -1; return; }
      render(search(q));
    }
    function setSelected(n) {
      var items = results.querySelectorAll('.search-item');
      if (!items.length) return;
      if (n < 0) n = items.length - 1;
      if (n >= items.length) n = 0;
      selected = n;
      Array.prototype.forEach.call(items, function (el, i) {
        el.classList.toggle('active', i === n);
        if (i === n) el.scrollIntoView({ block: 'nearest' });
      });
    }

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(runSearch, 120);
    });
    input.addEventListener('keydown', function (e) {
      var items = results.querySelectorAll('.search-item');
      if (e.key === 'Enter') {
        e.preventDefault();
        if (items.length) {
          if (selected >= 0 && items[selected]) items[selected].click();
          else items[0].click();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(selected + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(selected - 1);
      }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay.hidden) open(); else input.focus();
      } else if (e.key === 'Escape' && !overlay.hidden) {
        close();
      }
    });
  }


  /* ---------- PWA：注册 Service Worker ---------- */
  function initPwa() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    var root = (document.body && document.body.getAttribute('data-root')) || '';
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(root + 'sw.js').catch(function () {});
    });
  }

  /* ---------- 图片灯箱（缩放 + 平移） ---------- */
  function initLightbox() {
    var write = document.querySelector('#write');
    if (!write) return;
    var overlay = null, imgEl = null, viewport = null, label = null;
    var zoom = 1, tx = 0, ty = 0;
    var dragging = false, startX = 0, startY = 0, origTx = 0, origTy = 0;
    var ZMIN = 1, ZMAX = 5;

    function apply(animate) {
      if (!imgEl) return;
      imgEl.style.transition = animate ? 'transform .18s ease' : 'none';
      imgEl.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + zoom + ')';
      if (label) label.textContent = Math.round(zoom * 100) + '%';
    }
    function clamp() {
      if (!viewport || !imgEl) return;
      var vw = viewport.clientWidth, vh = viewport.clientHeight;
      var iw = (imgEl.naturalWidth || vw) * zoom;
      var ih = (imgEl.naturalHeight || vh) * zoom;
      var maxX = Math.max(0, (iw - vw) / 2);
      var maxY = Math.max(0, (ih - vh) / 2);
      tx = Math.max(-maxX, Math.min(maxX, tx));
      ty = Math.max(-maxY, Math.min(maxY, ty));
    }
    function resetView() { zoom = 1; tx = 0; ty = 0; apply(true); }
    function zoomAt(factor, cx, cy) {
      if (!viewport) return;
      var rect = viewport.getBoundingClientRect();
      var cxp = (cx === undefined) ? rect.width / 2 : (cx - rect.left);
      var cyp = (cy === undefined) ? rect.height / 2 : (cy - rect.top);
      var old = zoom;
      var nz = Math.max(ZMIN, Math.min(ZMAX, zoom * factor));
      var k = nz / old;
      tx = (cxp - rect.width / 2) * (1 - k) + tx * k;
      ty = (cyp - rect.height / 2) * (1 - k) + ty * k;
      zoom = nz;
      clamp();
      apply(true);
    }
    function close() {
      if (overlay) { overlay.remove(); overlay = null; }
      imgEl = null; viewport = null; label = null;
      zoom = 1; tx = 0; ty = 0;
      document.body.style.overflow = '';
    }
    function open(el) {
      close();
      overlay = document.createElement('div');
      overlay.className = 'lightbox';
      var box = document.createElement('div');
      box.className = 'lightbox-box';
      var bar = document.createElement('div');
      bar.className = 'lightbox-toolbar';
      label = document.createElement('span');
      label.className = 'lightbox-zoom-label';
      label.textContent = '100%';
      function mk(text, title) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = text;
        b.title = title;
        b.setAttribute('aria-label', title);
        b.className = 'lightbox-btn';
        return b;
      }
      var btnOut = mk('−', '缩小');
      var btnReset = mk('⟲', '重置大小');
      var btnIn = mk('＋', '放大');
      var closeBtn = mk('×', '关闭');
      closeBtn.className = 'lightbox-btn lightbox-close';
      var spacer = document.createElement('span');
      spacer.className = 'lightbox-spacer';
      bar.appendChild(label);
      bar.appendChild(btnOut);
      bar.appendChild(btnReset);
      bar.appendChild(btnIn);
      bar.appendChild(spacer);
      bar.appendChild(closeBtn);
      viewport = document.createElement('div');
      viewport.className = 'lightbox-viewport';
      var figure = document.createElement('figure');
      imgEl = document.createElement('img');
      imgEl.src = el.currentSrc || el.src;
      imgEl.alt = el.alt || '';
      figure.appendChild(imgEl);
      if (el.alt) {
        var cap = document.createElement('figcaption');
        cap.textContent = el.alt;
        figure.appendChild(cap);
      }
      viewport.appendChild(figure);
      box.appendChild(bar);
      box.appendChild(viewport);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      apply(false);

      btnOut.addEventListener('click', function () { zoomAt(0.8); });
      btnReset.addEventListener('click', function () { resetView(); });
      btnIn.addEventListener('click', function () { zoomAt(1.25); });
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
      viewport.addEventListener('wheel', function (e) {
        e.preventDefault();
        zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY);
      }, { passive: false });
      viewport.addEventListener('dblclick', function () {
        if (zoom > 1) resetView(); else zoomAt(2);
      });
      viewport.addEventListener('pointerdown', function (e) {
        if (zoom <= 1) return;
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        origTx = tx; origTy = ty;
        try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
        viewport.classList.add('dragging');
      });
      viewport.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        tx = origTx + (e.clientX - startX);
        ty = origTy + (e.clientY - startY);
        clamp();
        apply(false);
      });
      viewport.addEventListener('pointerup', function () {
        dragging = false;
        viewport.classList.remove('dragging');
      });
      viewport.addEventListener('pointercancel', function () {
        dragging = false;
        viewport.classList.remove('dragging');
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay) close();
    });
    write.addEventListener('click', function (e) {
      var el = e.target;
      if (!el || el.tagName !== 'IMG') return;
      if (el.closest && el.closest('a')) return;
      open(el);
    });
  }

  /* ---------- 自定义主题入口（配色工坊）与切换器联动 ---------- */
  function initStudioEntry() {
    var customBtn = document.getElementById('themeCustomBtn');
    if (customBtn && window.PhycatStudio) {
      var custom = window.PhycatStudio.getCustom();
      if (custom && custom.mode) customBtn.classList.add('active');
    }
  }

  window.PhycatThemeUI = {
    markCustom: function (active) {
      var cb = document.getElementById('themeCustomBtn');
      if (cb) cb.classList.toggle('active', !!active);
      var label = document.getElementById('themeBtnLabel');
      var dot = document.getElementById('themeBtnDot');
      if (active) {
        var cc = window.PhycatStudio ? window.PhycatStudio.getCustom() : null;
        if (cc && cc.mainColor) updateThemeColor(cc.mainColor);
        if (label) label.textContent = '自定义';
        if (dot) dot.style.background = 'linear-gradient(135deg,#ff7096,#11aa63,#4a9eff)';
      } else {
        var theme = findTheme(getSavedTheme());
        if (label && theme) label.textContent = theme.name;
        if (dot && theme) dot.style.background = theme.accent;
      }
    },
    applyPreset: function () {
      applyTheme(getSavedTheme());
    },
  };

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initThemeSwitcher();
    initMermaid();
    initOutline();
    initBackTop();
    initTocToggle();
    initTocCollapse();
    initCodeCopy();
    initStickySidebar();
    initReadingProgress();
    initSearch();
    initPwa();
    initLightbox();
    initStudioEntry();
  });
})();