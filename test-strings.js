const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

let inString = false, quoteChar = null;
let start = 0;
let strings = [];

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

// Show strings around pos 8200
strings.filter(s => s.start >= 8100 && s.start <= 8300).forEach(s => {
  console.log('pos', s.start, '-', s.end, ':', JSON.stringify(s.content.slice(0, 100)));
});

console.log('In string at end:', inString, 'quoteChar:', quoteChar);

// Show all strings that contain code
console.log('Strings with JS code:');
strings.filter(s => s.content.includes('for') || s.content.includes('var') || s.content.includes('html') || s.content.includes('SCENARIOS')).forEach(s => {
  console.log('pos', s.start, '-', s.end, ':', JSON.stringify(s.content.slice(0, 100)));
});
