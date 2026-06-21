const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

console.log('Raw bytes from 8566 to 8640:');
for (let i = 8566; i < 8640; i++) {
  const c = line[i];
  const code = line.charCodeAt(i);
  console.log('pos', i, ':', JSON.stringify(c), 'code:', code, 'hex:', code.toString(16));
}

console.log('\nContext:', JSON.stringify(line.slice(8566, 8640)));
