const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Check for full-width punctuation outside strings
const strings = [];
let inString = false;
let quoteChar = null;
let stringStart = 0;

for (let i = 0; i < line.length; i++) {
  const c = line[i];
  if (!inString) {
    if (c === '"' || c === "'") {
      inString = true;
      quoteChar = c;
      stringStart = i;
    }
  } else {
    if (c === '\\') {
      i++; // skip escaped char
    } else if (c === quoteChar) {
      strings.push({start: stringStart, end: i});
      inString = false;
      quoteChar = null;
    }
  }
}

// Now check characters outside strings for full-width punctuation
const fullWidth = /[\uFF01-\uFF5E\u3000-\u303F\uFF00-\uFFEF]/;
for (let i = 0; i < line.length; i++) {
  const inStr = strings.some(s => i >= s.start && i <= s.end);
  if (!inStr && fullWidth.test(line[i])) {
    console.log('Full-width char outside string at', i, ':', line[i], 'code:', line.charCodeAt(i).toString(16));
    console.log('Context:', JSON.stringify(line.slice(Math.max(0, i-20), i+20)));
  }
}

console.log('String count:', strings.length);
console.log('Last string ends at:', strings.length > 0 ? strings[strings.length-1].end : 'none');
console.log('Line length:', line.length);
console.log('Last 20 chars:', JSON.stringify(line.slice(-20)));
console.log('First 100 chars:', JSON.stringify(line.slice(0, 100)));
