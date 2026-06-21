const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Try to find the exact position by binary search on the line
function findErrorPosition(code) {
  let low = 0, high = code.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const test = code.slice(0, mid + 1);
    try {
      new Function(test + ';');
      low = mid + 1;
    } catch(e) {
      if (e.message.includes('Unexpected end') || e.message.includes('Unexpected token')) {
        // Incomplete, might be OK if extended
        try {
          new Function(test + '});');
          low = mid + 1;
        } catch(e2) {
          high = mid;
        }
      } else {
        high = mid;
      }
    }
  }
  return low;
}

const pos = findErrorPosition(line);
console.log('Error position:', pos);
console.log('Context:', JSON.stringify(line.slice(Math.max(0, pos-30), pos+30)));

// Check for unmatched quotes before this position
let singleQuotes = 0, doubleQuotes = 0;
for (let i = 0; i < pos; i++) {
  const c = line[i];
  if (c === '\\') {
    i++; // skip escaped
  } else if (c === "'") {
    singleQuotes++;
  } else if (c === '"') {
    doubleQuotes++;
  }
}
console.log('Single quotes before error:', singleQuotes);
console.log('Double quotes before error:', doubleQuotes);

// Check for specific problematic characters
for (let i = Math.max(0, pos-50); i < Math.min(line.length, pos+50); i++) {
  const c = line[i];
  const code = line.charCodeAt(i);
  if (code > 127) {
    console.log('Non-ASCII at', i, ':', JSON.stringify(c), 'code:', code.toString(16));
  }
}
