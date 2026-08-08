#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成「知」字印章 Logo 资源（知途的研习室 / Zhitu's Lab）。

依赖：fontTools（提取字形轮廓）+ Pillow（渲染 PNG）。
用法：
  python tools/generate-icons.py                # 朱砂红印（默认）
  python tools/generate-icons.py --color green  # 深绿印

输出：
  site/favicon.svg               favicon（无阴影，扁平）
  site/icons/icon.svg            PWA 图标 SVG（含柔和阴影）
  site/icons/icon-192.png        PWA 图标 192
  site/icons/icon-512.png        PWA 图标 512
  site/icons/logo-inline.svg     页面内联版（无阴影，供首页头像/导航使用）
"""
import argparse
import os
import sys

try:
    from fontTools.ttLib import TTFont
    from fontTools.pens.basePen import BasePen
    from fontTools.pens.boundsPen import BoundsPen
except ImportError:
    sys.exit('缺少 fontTools，请先执行：pip install fonttools')
try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    sys.exit('缺少 Pillow，请先执行：pip install pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_FONT = os.path.join(ROOT, 'phycat', 'LXGWWenKai-Regular.ttf')
CHAR = '知'

PAPER = (253, 249, 240)
PAPER_HEX = '#fdf9f0'
WHITE = (255, 255, 255)
COLORS = {
    'red':   {'rgb': (184, 64, 47), 'hex': '#b8402f', 'label': '朱砂红'},
    'green': {'rgb': (11, 93, 51),  'hex': '#0b5d33', 'label': '深森林绿'},
}


class PathPen(BasePen):
    def __init__(self, glyphSet):
        super().__init__(glyphSet)
        self.contours = []
        self._cur = None

    def _moveTo(self, pt):
        self._cur = [('M', pt)]
        self.contours.append(self._cur)

    def _lineTo(self, pt):
        self._cur.append(('L', pt))

    def _qCurveToOne(self, p1, pt):
        self._cur.append(('Q', p1, pt))

    def _closePath(self):
        self._cur.append(('Z', None))


def load_glyph(font_path):
    font = TTFont(font_path)
    gname = font.getBestCmap()[ord(CHAR)]
    gs = font.getGlyphSet()
    b = BoundsPen(gs)
    gs[gname].draw(b)
    x0, y0, x1, y1 = b.bounds
    p = PathPen(gs)
    gs[gname].draw(p)
    return p.contours, (x0, y0, x1, y1)


def glyph_path_svg(contours, x_off, y_off, s):
    out = []
    for c in contours:
        for cmd, *pts in c:
            if cmd == 'M':
                x, y = pts[0]
                out.append('M%.2f %.2f' % (x_off + x * s, y_off - y * s))
            elif cmd == 'L':
                x, y = pts[0]
                out.append('L%.2f %.2f' % (x_off + x * s, y_off - y * s))
            elif cmd == 'Q':
                x1, y1 = pts[0]
                x, y = pts[1]
                out.append('Q%.2f %.2f %.2f %.2f' % (x_off + x1 * s, y_off - y1 * s, x_off + x * s, y_off - y * s))
            elif cmd == 'Z':
                out.append('Z')
    return ' '.join(out)


def layout(font_path):
    contours, (x0, y0, x1, y1) = load_glyph(font_path)
    H = 206.0                      # 字形目标高度（512 坐标系）
    s = H / (y1 - y0)
    w = (x1 - x0) * s
    cx, cy = 256.0, 251.0          # 光学中心略偏上
    x_off = cx - w / 2.0
    y_off = (cy - H / 2.0) + y1 * s
    d = glyph_path_svg(contours, x_off, y_off, s)
    return d


def build_svg(seal_hex, d, shadow):
    if shadow:
        head = ('<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%">'
                '<feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000" flood-opacity="0.14"/>'
                '</filter></defs><g filter="url(#sh)">')
        tail = '</g>'
    else:
        head = ''
        tail = ''
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' + head +
            '<rect x="0" y="0" width="512" height="512" rx="112" fill="' + PAPER_HEX + '"/>' +
            '<rect x="95" y="95" width="322" height="322" rx="22" fill="' + seal_hex + '"/>' +
            '<rect x="121" y="121" width="270" height="270" rx="10" fill="none" stroke="#ffffff" stroke-width="6"/>' +
            '<path d="' + d + '" fill="#ffffff"/>' + tail + '</svg>')


def render_png(size, seal_rgb, font_path, out):
    S4 = size * 4
    img = Image.new('RGBA', (S4, S4), (0, 0, 0, 0))
    # 纸块阴影
    sh = Image.new('RGBA', (S4, S4), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([int(S4 * 0.02), int(S4 * 0.02), S4 - 1, S4 - 1],
                                         radius=int(S4 * 0.22), fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(S4 * 0.022))
    img.alpha_composite(sh)
    d = ImageDraw.Draw(img)
    # 纸块
    d.rounded_rectangle([0, 0, S4 - 1, S4 - 1], radius=int(S4 * 0.22), fill=PAPER)
    # 印章
    d.rounded_rectangle([int(S4 * 0.1855), int(S4 * 0.1855), int(S4 * 0.8145), int(S4 * 0.8145)],
                        radius=int(S4 * 0.043), fill=seal_rgb)
    # 内框
    d.rounded_rectangle([int(S4 * 0.236), int(S4 * 0.236), int(S4 * 0.764), int(S4 * 0.764)],
                        radius=int(S4 * 0.0195), outline=WHITE, width=int(S4 * 0.0117))
    # 「知」字（迭代校准字号，使实际墨迹高度≈目标）
    target_h = 206.0 / 512.0 * S4
    size_px = int(S4 * 0.42)
    for _ in range(8):
        font = ImageFont.truetype(font_path, size_px)
        tmp = Image.new('L', (S4, S4), 0)
        ImageDraw.Draw(tmp).text((S4 // 2, int(S4 * 0.490)), CHAR, font=font, fill=255, anchor='mm')
        bbox = tmp.getbbox()
        if bbox is None:
            break
        h = bbox[3] - bbox[1]
        if abs(h - target_h) < 2:
            break
        size_px = max(10, int(size_px * target_h / h))
    font = ImageFont.truetype(font_path, size_px)
    d.text((S4 // 2, int(S4 * 0.490)), CHAR, font=font, fill=WHITE, anchor='mm')
    img = img.resize((size, size), Image.LANCZOS)
    img.save(out)
    return size_px


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--font', default=DEFAULT_FONT)
    ap.add_argument('--color', default='red', choices=list(COLORS))
    args = ap.parse_args()
    c = COLORS[args.color]
    d = layout(args.font)
    site = os.path.join(ROOT, 'site')
    icons = os.path.join(site, 'icons')
    os.makedirs(icons, exist_ok=True)
    # SVG
    open(os.path.join(site, 'favicon.svg'), 'w', encoding='utf-8').write(build_svg(c['hex'], d, shadow=False))
    open(os.path.join(icons, 'icon.svg'), 'w', encoding='utf-8').write(build_svg(c['hex'], d, shadow=True))
    open(os.path.join(icons, 'logo-inline.svg'), 'w', encoding='utf-8').write(build_svg(c['hex'], d, shadow=False))
    # PNG
    render_png(192, c['rgb'], args.font, os.path.join(icons, 'icon-192.png'))
    render_png(512, c['rgb'], args.font, os.path.join(icons, 'icon-512.png'))
    print('✔ 已生成 ' + args.color + '（' + c['label'] + '）印章「知」Logo：')
    for f in ['site/favicon.svg', 'site/icons/icon.svg', 'site/icons/logo-inline.svg',
              'site/icons/icon-192.png', 'site/icons/icon-512.png']:
        p = os.path.join(ROOT, f)
        print('  -', f, os.path.getsize(p), 'bytes')


if __name__ == '__main__':
    main()