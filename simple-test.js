const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

let inString = false, quoteChar = null;
for (let i = 0; i <= 8327; i++) {
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
    }
  }
}

console.log('inString at 8327:', inString);
console.log('quoteChar at 8327:', quoteChar);
console.log('char at 8327:', JSON.stringify(line[8327]));

// Now process pos 8327
const c = line[8327];
console.log('c === quoteChar:', c === quoteChar);
console.log('c === backslash:', c === '\\');

if (inString && c === quoteChar) {
  console.log('Would close string');
} else if (inString && c === '\\') {
  console.log('Would skip next char');
} else {
  console.log('Would do nothing');
}
