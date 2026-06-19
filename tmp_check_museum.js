const fs = require('fs');
const s = fs.readFileSync('yingji-xiaodaren/game.js', 'utf8');
const idx = s.indexOf('DisasterMuseumEngine=');
const snip = s.slice(idx, idx + 8000);
const methods = ['render()', 'show()', 'init()', 'start()', 'showMenu()', 'showZone(', 'open(', 'showList(', 'enter('];
for (const m of methods) {
  const mi = snip.indexOf(m);
  if (mi >= 0 && mi < 8000) {
    console.log('DisasterMuseumEngine -> ' + m + ' at offset ' + mi);
    console.log(snip.slice(mi, mi + 100));
    console.log();
  }
}
