#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""霞鹜文楷字体子集化：GB2312 一级常用字 + 通用标点 + ASCII + 站点内容用字。

用法：
  python tools/subset-font.py
输出：
  覆盖 phycat/LXGWWenKai-Regular.woff2（构建时自动使用）

依赖：fontTools + brotli
  pip install fonttools brotli
"""
import os
import sys
from fontTools.subset import Subsetter
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TTF = os.path.join(ROOT, 'phycat', 'LXGWWenKai-Regular.ttf')
OUT = os.path.join(ROOT, 'phycat', 'LXGWWenKai-Regular.woff2')
CONTENT_DIR = os.path.join(ROOT, 'content')


def collect_chars():
    chars = set()
    # ASCII 可打印字符
    for cp in range(0x20, 0x7F):
        chars.add(chr(cp))
    # 常见中英文标点
    for rng in [(0x2013, 0x201F), (0x2026, 0x2026), (0x3000, 0x303F), (0xFF00, 0xFFEF)]:
        for cp in range(rng[0], rng[1] + 1):
            chars.add(chr(cp))
    # GB2312 一级汉字（区 16-55，首字节 B0-D7）
    for cp in range(0x4E00, 0x9FFF + 1):
        ch = chr(cp)
        try:
            b = ch.encode('gb2312')
        except UnicodeEncodeError:
            continue
        if 0xB0 <= b[0] <= 0xD7:
            chars.add(ch)
    # 站点内容用字（保证当前所有文章都能正常显示）
    for base, _, files in os.walk(CONTENT_DIR):
        for fn in files:
            if not fn.lower().endswith(('.md', '.mdx')):
                continue
            p = os.path.join(base, fn)
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    chars.update(f.read())
            except Exception as e:
                print('跳过', p, e)
    return ''.join(sorted(chars))


def main():
    if not os.path.exists(TTF):
        sys.exit('未找到字体源: ' + TTF)
    text = collect_chars()
    print('字符集大小:', len(text), '字')
    font = TTFont(TTF)
    ss = Subsetter()
    ss.populate(text=text)
    ss.subset(font)
    font.flavor = 'woff2'
    font.save(OUT)
    old = os.path.getsize(TTF)
    new = os.path.getsize(OUT)
    print('✔ 子集化完成: TTF %d KB -> woff2 %d KB (%.1f%% 缩减)' % (old // 1024, new // 1024, (1 - new / old) * 100))


if __name__ == '__main__':
    main()