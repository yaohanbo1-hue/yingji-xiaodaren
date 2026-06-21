const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Show raw bytes around the onclick part
const start = 8310;
const end = 8340;
console.log('Raw bytes from', start, 'to', end, ':');
for (let i = start; i < end; i++) {
  const c = line[i];
  const code = line.charCodeAt(i);
  console.log('pos', i, ':', JSON.stringify(c), 'code:', code, 'hex:', code.toString(16));
}

console.log('\nContext:', JSON.stringify(line.slice(start, end)));
