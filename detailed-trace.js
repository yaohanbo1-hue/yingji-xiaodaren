const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Detailed trace of string state in the last 200 chars
let inString = false, quoteChar = null;
const start = line.length - 200;
for (let i = start; i < line.length; i++) {
  const c = line[i];
  const oldState = inString;
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
  
  if (c === '{' || c === '}' || c === '"' || c === "'") {
    console.log('pos', i, ':', JSON.stringify(c), 
      'was in string:', oldState, 
      'now in string:', inString,
      'quoteChar:', quoteChar,
      'context:', JSON.stringify(line.slice(Math.max(start, i-10), Math.min(line.length, i+10))));
  }
}
