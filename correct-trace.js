const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

let inString = false, quoteChar = null;

for (let i = 0; i <= 8331; i++) {
  const c = line[i];
  const beforeInString = inString;
  const beforeQuoteChar = quoteChar;
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
  if (i >= 8000 && i <= 8100) {
    console.log('pos', i, ':', JSON.stringify(c), 
      'before:', beforeInString, beforeQuoteChar,
      'after:', inString, quoteChar,
      'context:', JSON.stringify(line.slice(Math.max(0, i-5), Math.min(line.length, i+5))));
  }
}
