const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Simple test: trace string state at pos 8298
let inString = false, quoteChar = null;

for (let i = 0; i <= 8298; i++) {
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

console.log('inString at pos 8298:', inString);
console.log('quoteChar at pos 8298:', quoteChar);

// Now trace from pos 8298 to 8331
for (let i = 8298; i <= 8331; i++) {
  const c = line[i];
  const oldInString = inString;
  const oldQuoteChar = quoteChar;
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
  console.log('pos', i, ':', JSON.stringify(c), 'old inString:', oldInString, 'old quoteChar:', oldQuoteChar, 'new inString:', inString, 'new quoteChar:', quoteChar);
}
