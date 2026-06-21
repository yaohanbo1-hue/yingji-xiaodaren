const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Show the exact string boundaries
let inString = false, quoteChar = null;
let strings = [];
let start = 0;

for (let i = 0; i < line.length; i++) {
  const c = line[i];
  if (inString) {
    if (c === '\\') {
      i++;
    } else if (c === quoteChar) {
      strings.push({start: start, end: i, content: line.slice(start+1, i)});
      inString = false;
      quoteChar = null;
    }
  } else {
    if (c === '"' || c === "'") {
      inString = true;
      quoteChar = c;
      start = i;
    }
  }
}

// Show last 5 strings
console.log('Last 5 strings:');
strings.slice(-5).forEach(s => {
  console.log('pos', s.start, '-', s.end, ':', JSON.stringify(s.content.slice(0, 100)));
});

// Show all strings from position 8200 onwards
console.log('Strings from pos 8200:');
strings.filter(s => s.start >= 8200).forEach(s => {
  console.log('pos', s.start, '-', s.end, ':', JSON.stringify(s.content.slice(0, 100)));
});

// Check if there are any unclosed strings
console.log('In string at end:', inString, 'quoteChar:', quoteChar);

// Show the string that contains the problematic part
const lastString = strings[strings.length - 1];
console.log('Last string end:', lastString ? lastString.end : 'none');
console.log('Last string content (last 50 chars):', lastString ? JSON.stringify(lastString.content.slice(-50)) : 'none');
