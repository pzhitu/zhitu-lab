const fs = require('fs');
const path = require('path');
const wawoff2 = require('wawoff2');
(async () => {
  const base = __dirname + '/phycat';
  for (const name of ['LXGWWenKai-Regular.ttf', 'Cascadia-Code-Regular.ttf']) {
    const t0 = Date.now();
    const ttf = fs.readFileSync(path.join(base, name));
    const woff2 = await wawoff2.compress(ttf);
    const out = path.join(base, name.replace('.ttf', '.woff2'));
    fs.writeFileSync(out, woff2);
    console.log(name, ttf.length, '->', woff2.length, Math.round((Date.now()-t0)/1000) + 's');
  }
})();
