'use strict';
const zlib = require('zlib');

/* ==========================================================================
   Zhitu's Lab — Logo 图标生成（纯 Node，无第三方依赖）
   设计：蜿蜒小径 + 终点光点
   （绿色渐变圆角方块 + 白色蜿蜒小路 + 琥珀光点，寓意「路的尽头有光」）
   ========================================================================== */

/* ---------------- 简易 PNG 编码器（RGBA） ---------------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------- 颜色 ---------------- */
function hexRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const GRAD_TOP = hexRgb('#3ad49a');
const GRAD_BOT = hexRgb('#0a7f49');
const PATH_RGB = hexRgb('#ffffff');
const DOT_RGB = hexRgb('#ffb347');

/* ---------------- 蜿蜒小径：三次贝塞尔采样为折线（512 坐标系） ---------------- */
const PATH_BEZIER = [
  [120, 392, 190, 396, 216, 360, 216, 316], // 左下起步，向右上蜿蜒
  [216, 316, 216, 272, 168, 256, 176, 216], // 回旋向左
  [176, 216, 182, 184, 226, 170, 262, 158], // 折向右上
  [262, 158, 316, 140, 356, 118, 392, 100], // 向终点攀升
];
function sampleBezier(seg, n) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = seg;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
    pts.push([a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3]);
  }
  return pts;
}
function buildPathPolyline() {
  const poly = [];
  for (const seg of PATH_BEZIER) poly.push(...sampleBezier(seg, 32));
  return poly;
}
const POLYLINE = buildPathPolyline();
/* ---------------- 人物：沿小径前行（本地坐标：脚底在原点、朝向 +x） ---------------- */
const FIG_RGB = hexRgb('#0b5d33');   // 深森林绿（与白路径、绿背景区分）
const FIG_STROKE = 16;
const FIG_SEGS = [
  [[0, -70], [0, -10]],   // 躯干
  [[0, -55], [22, -34]],  // 前臂
  [[0, -55], [-20, -40]], // 后臂
  [[0, -10], [18, 8]],    // 前腿
  [[0, -10], [-12, 10]],  // 后腿
];
const FIG_HEAD = [0, -95, 24];       // 头：圆心 x,y + 半径
const FIG_POS = [320, 140];          // 脚底落点（小径上，t≈0.40 处）
const FIG_ANGLE = 25 * Math.PI / 180; // 沿路径上坡方向前倾
const FIG_COS = Math.cos(FIG_ANGLE);
const FIG_SIN = Math.sin(FIG_ANGLE);
function figTransform(x, y) {
  return [FIG_POS[0] + x * FIG_COS - y * FIG_SIN, FIG_POS[1] + x * FIG_SIN + y * FIG_COS];
}
function buildFigPolyline() {
  return FIG_SEGS.map(([a, b]) => [figTransform(a[0], a[1]), figTransform(b[0], b[1])]);
}
const FIG_POLYLINE = buildFigPolyline();
const FIG_HEAD_CENTER = figTransform(FIG_HEAD[0], FIG_HEAD[1]);
const FIG_HEAD_R = FIG_HEAD[2];
const figHalf = FIG_STROKE / 2 + 0.5;
function figCoverage(px, py, scale) {
  let bestLine = 0;
  for (const [a, b] of FIG_POLYLINE) {
    const d = segDist(px / scale, py / scale, a[0], a[1], b[0], b[1]);
    bestLine = Math.max(bestLine, Math.max(0, Math.min(1, figHalf - d)));
  }
  const hd = Math.sqrt((px / scale - FIG_HEAD_CENTER[0]) ** 2 + (py / scale - FIG_HEAD_CENTER[1]) ** 2);
  const covHead = Math.max(0, Math.min(1, FIG_HEAD_R + 0.5 - hd));
  return Math.max(bestLine, covHead);
}

function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const l2 = vx * vx + vy * vy;
  const t = l2 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / l2)) : 0;
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}
function polyDist(px, py, scale) {
  let best = Infinity;
  for (let i = 0; i < POLYLINE.length - 1; i++) {
    const a = POLYLINE[i], b = POLYLINE[i + 1];
    const d = segDist(px / scale, py / scale, a[0], a[1], b[0], b[1]);
    if (d < best) best = d;
  }
  return best;
}

/* ---------------- 生成 ---------------- */
function generatePng(size) {
  const radius = size * 0.22;
  const stroke = size * 0.078;
  const dotR = size * 0.066;
  const dotCx = 414, dotCy = 82;
  const half = stroke / 2 + 0.5;
  const scale = size / 512;
  const rgba = Buffer.alloc(size * size * 4);
  const halfS = size / 2, inner = halfS - radius;
  for (let y = 0; y < size; y++) {
    const cy = y + 0.5;
    for (let x = 0; x < size; x++) {
      const cx = x + 0.5;
      const i = (y * size + x) * 4;
      // 圆角矩形 SDF（背景）
      const ddx = Math.max(Math.abs(cx - halfS) - inner, 0);
      const ddy = Math.max(Math.abs(cy - halfS) - inner, 0);
      const d = Math.sqrt(ddx * ddx + ddy * ddy);
      if (d > radius) { rgba[i + 3] = 0; continue; }
      // 背景对角渐变（左上浅绿 → 右下深绿）
      const t = ((cx + cy) / 2) / size;
      let r = GRAD_TOP[0] + (GRAD_BOT[0] - GRAD_TOP[0]) * t;
      let g = GRAD_TOP[1] + (GRAD_BOT[1] - GRAD_TOP[1]) * t;
      let b = GRAD_TOP[2] + (GRAD_BOT[2] - GRAD_TOP[2]) * t;
      // 白色蜿蜒小径覆盖度
      const pathDist = polyDist(cx, cy, scale);
      const covPath = Math.max(0, Math.min(1, half - pathDist));
      // 琥珀光点覆盖度
      const dotDist = Math.sqrt((cx / scale - dotCx) ** 2 + (cy / scale - dotCy) ** 2);
      const covDot = Math.max(0, Math.min(1, dotR + 0.5 - dotDist));
      const covFig = figCoverage(cx, cy, scale);
      // 混合：背景 → 白色路径 → 人物 → 琥珀光点（顺序叠加，避免下溢）
      r = r + (PATH_RGB[0] - r) * covPath;
      g = g + (PATH_RGB[1] - g) * covPath;
      b = b + (PATH_RGB[2] - b) * covPath;
      r = r + (FIG_RGB[0] - r) * covFig;
      g = g + (FIG_RGB[1] - g) * covFig;
      b = b + (FIG_RGB[2] - b) * covFig;
      r = r + (DOT_RGB[0] - r) * covDot;
      g = g + (DOT_RGB[1] - g) * covDot;
      b = b + (DOT_RGB[2] - b) * covDot;
      rgba[i] = Math.round(r);
      rgba[i + 1] = Math.round(g);
      rgba[i + 2] = Math.round(b);
      rgba[i + 3] = 255;
    }
  }
  return encodePng(size, size, rgba);
}

function generateSvg() {
  const segs = FIG_SEGS.map(([a, b]) => {
    const p1 = figTransform(a[0], a[1]);
    const p2 = figTransform(b[0], b[1]);
    return 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + 'L' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }).join('');
  const head = figTransform(FIG_HEAD[0], FIG_HEAD[1]);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#3ad49a"/><stop offset="1" stop-color="#0a7f49"/>' +
    '</linearGradient></defs>' +
    '<rect x="24" y="24" width="464" height="464" rx="112" fill="url(#g)"/>' +
    '<path d="M120 392 C190 396 216 360 216 316 C216 272 168 256 176 216 C182 184 226 170 262 158 C316 140 356 118 392 100" fill="none" stroke="#ffffff" stroke-width="40" stroke-linecap="round"/>' +
    '<g stroke="#0b5d33" stroke-width="16" stroke-linecap="round" fill="none">' + segs + '</g>' +
    '<circle cx="' + head[0].toFixed(1) + '" cy="' + head[1].toFixed(1) + '" r="24" fill="#0b5d33"/>' +
    '<circle cx="414" cy="82" r="34" fill="#ffb347"/>' +
    '</svg>';
}

module.exports = { generatePng, generateSvg };