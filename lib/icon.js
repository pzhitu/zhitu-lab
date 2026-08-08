'use strict';
const zlib = require('zlib');

/* ==========================================================================
   Zhitu's Lab — Logo 图标生成（纯 Node，无第三方依赖）
   设计：星轨（彗星）—— 一条渐隐渐亮的蜿蜒轨迹，尽头是一颗琥珀四角星
   寓意：知途的轨迹，路的尽头有光（格物致知）
   - generatePng(size)            生成 PNG（透明背景，轨迹带渐隐/渐粗/变色）
   - generateSvg({ inline })      生成 SVG；inline=true 时轨迹用 currentColor（随主题）
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
const TRAIL_A = [10, 127, 73];   // 轨迹起点（深绿）
const TRAIL_B = [58, 212, 154];  // 轨迹终点（亮绿）
const STAR_RGB = [245, 166, 35]; // 琥珀四角星
const TRAIL_A_HEX = '#0a7f49';
const TRAIL_B_HEX = '#3ad49a';
const STAR_HEX = '#f5a623';

/* ---------------- 几何（512 坐标系） ---------------- */
const TRAIL_P0 = [150, 402];
const TRAIL_C1 = [330, 428];
const TRAIL_C2 = [252, 218];
const TRAIL_P1 = [392, 124];
const TRAIL_R0 = 6;    // 起点半径（细）
const TRAIL_R1 = 22;   // 终点半径（粗，贴星处）
const TRAIL_A0 = 0;    // 起点透明度（渐隐）
const TRAIL_A1 = 1;
const STAR_CX = 404, STAR_CY = 108;
const STAR_R = 56, STAR_r = 20;

function sampleBezier(n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
    pts.push([
      a * TRAIL_P0[0] + b * TRAIL_C1[0] + c * TRAIL_C2[0] + d * TRAIL_P1[0],
      a * TRAIL_P0[1] + b * TRAIL_C1[1] + c * TRAIL_C2[1] + d * TRAIL_P1[1],
    ]);
  }
  return pts;
}
const TRAIL_PTS = sampleBezier(80);

/* ---------------- 四角星 ---------------- */
function starVerts() {
  const v = [];
  for (let k = 0; k < 8; k++) {
    const ang = Math.PI / 180 * (90 + k * 45);
    const rad = k % 2 === 0 ? STAR_R : STAR_r;
    v.push([STAR_CX + rad * Math.cos(ang), STAR_CY - rad * Math.sin(ang)]);
  }
  return v;
}
const STAR_VERTS = starVerts();

function pointInPoly(px, py, verts) {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i][0], yi = verts[i][1];
    const xj = verts[j][0], yj = verts[j][1];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* ---------------- 覆盖度 / 距离 ---------------- */
function dist(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}
function edgeDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const l2 = vx * vx + vy * vy;
  const t = l2 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / l2)) : 0;
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

/* ---------------- 生成 PNG ---------------- */
function generatePng(size) {
  const scale = size / 512;
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const cy = (y + 0.5) / scale; // 512 空间
    for (let x = 0; x < size; x++) {
      const cx = (x + 0.5) / scale;
      const i = (y * size + x) * 4;
      // 轨迹：沿线采样圆，半径渐粗、透明度渐增、颜色由深绿转亮绿
      let trailA = 0, trailR = 0, trailG = 0, trailB = 0;
      for (let k = 0; k < TRAIL_PTS.length; k++) {
        const t = k / (TRAIL_PTS.length - 1);
        const r = TRAIL_R0 + (TRAIL_R1 - TRAIL_R0) * t;
        const alpha = TRAIL_A0 + (TRAIL_A1 - TRAIL_A0) * t;
        const d = dist(cx, cy, TRAIL_PTS[k][0], TRAIL_PTS[k][1]);
        const cov = Math.max(0, Math.min(1, r - d + 0.5 / scale));
        const a = cov * alpha;
        if (a > trailA) {
          trailA = a;
          trailR = TRAIL_A[0] + (TRAIL_B[0] - TRAIL_A[0]) * t;
          trailG = TRAIL_A[1] + (TRAIL_B[1] - TRAIL_A[1]) * t;
          trailB = TRAIL_A[2] + (TRAIL_B[2] - TRAIL_A[2]) * t;
        }
      }
      // 四角星（硬边 + 边缘抗锯齿）
      let starA = 0;
      if (pointInPoly(cx, cy, STAR_VERTS)) {
        starA = 1;
      } else {
        let minD = Infinity;
        for (let e = 0; e < STAR_VERTS.length; e++) {
          const a = STAR_VERTS[e], b = STAR_VERTS[(e + 1) % STAR_VERTS.length];
          const d = edgeDist(cx, cy, a[0], a[1], b[0], b[1]);
          if (d < minD) minD = d;
        }
        starA = Math.max(0, Math.min(1, 0.5 - minD * scale));
      }
      // 合成：星在上，轨迹在下
      let outA, outR, outG, outB;
      if (starA > 0) {
        const a = starA + trailA * (1 - starA);
        outA = a;
        outR = (STAR_RGB[0] * starA + trailR * trailA * (1 - starA)) / a;
        outG = (STAR_RGB[1] * starA + trailG * trailA * (1 - starA)) / a;
        outB = (STAR_RGB[2] * starA + trailB * trailA * (1 - starA)) / a;
      } else {
        outA = trailA;
        outR = trailR; outG = trailG; outB = trailB;
      }
      rgba[i] = Math.round(outR);
      rgba[i + 1] = Math.round(outG);
      rgba[i + 2] = Math.round(outB);
      rgba[i + 3] = Math.round(outA * 255);
    }
  }
  return encodePng(size, size, rgba);
}

/* ---------------- 生成 SVG ---------------- */
function generateSvg(opts) {
  const o = opts || {};
  const inline = !!o.inline;
  // 轨迹：采样贝塞尔，按垂直方向偏移构造锥形多边形（细→粗）
  const n = 48;
  const right = [], left = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const r = TRAIL_R0 + (TRAIL_R1 - TRAIL_R0) * t;
    // 切线与法线
    const idx = Math.round(t * (TRAIL_PTS.length - 1));
    const p = TRAIL_PTS[idx];
    const q = TRAIL_PTS[Math.min(TRAIL_PTS.length - 1, idx + 1)];
    let dx = q[0] - p[0], dy = q[1] - p[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len; dy /= len;
    const nx = -dy, ny = dx;
    right.push([p[0] + nx * r, p[1] + ny * r]);
    left.push([p[0] - nx * r, p[1] - ny * r]);
  }
  const poly = right.concat(left.slice().reverse());
  const pts = poly.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const starPts = STAR_VERTS.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  let defs = '', trailFill = '';
  if (inline) {
    trailFill = 'fill="currentColor"';
  } else {
    defs = '<defs><linearGradient id="tg" x1="' + TRAIL_P0[0] + '" y1="' + TRAIL_P0[1] + '" x2="' + TRAIL_P1[0] + '" y2="' + TRAIL_P1[1] + '" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="' + TRAIL_A_HEX + '" stop-opacity="0"/>' +
      '<stop offset="0.45" stop-color="' + TRAIL_A_HEX + '" stop-opacity="0.5"/>' +
      '<stop offset="1" stop-color="' + TRAIL_B_HEX + '" stop-opacity="1"/>' +
      '</linearGradient></defs>';
    trailFill = 'fill="url(#tg)"';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' + defs +
    '<polygon points="' + pts + '" ' + trailFill + '/>' +
    '<polygon points="' + starPts + '" fill="' + STAR_HEX + '"/>' +
    '</svg>';
}

module.exports = { generatePng, generateSvg };