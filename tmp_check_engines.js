const fs = require('fs');
const s = fs.readFileSync('yingji-xiaodaren/game.js', 'utf8');
for (const e of ['DisasterMuseumEngine', 'MusicEngine', 'BaseEngine', 'EggEngine']) {
  const idx = s.indexOf(e + '=');
  const snip = s.slice(idx, idx + 5000);
  const methods = ['render()', 'show()', 'init()', 'start()', 'showMenu()', 'showZone()', 'open()'];
  for (const m of methods) {
    const mi = snip.indexOf(m);
    if (mi >= 0 && mi < 2000) {
      console.log(e + ' -> ' + m + ' at offset ' + mi);
      console.log(snip.slice(mi, mi + 80));
      console.log();
    }
  }
  console.log('---');
}
