const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

let braces = 0;
let inString = false, quoteChar = null;
let changes = [];

for (let i = 0; i < line.length; i++) {
  const c = line[i];
  if (inString) {
    if (c === '\\') {
      i++;
    } else if (c === quoteChar) {
      inString = false;
      quoteChar = null;
    }
  } else {
    if (c === '"' || c === "'") {
      inString = true;
      quoteChar = c;
    } else if (c === '{' || c === '}') {
      changes.push({pos: i, char: c, braces: braces + (c === '{' ? 1 : -1)});
      braces += (c === '{' ? 1 : -1);
    }
  }
}

console.log('Total changes:', changes.length);
console.log('Changes from pos 1328 to 3425:');
changes.filter(c => c.pos >= 1328 && c.pos <= 3425).forEach(c => {
  console.log('  pos', c.pos, ':', c.char, '-> braces =', c.braces);
});

console.log('Final braces:', braces);
console.log('Open braces:', changes.filter(c => c.char === '{').length);
console.log('Close braces:', changes.filter(c => c.char === '}').length);
