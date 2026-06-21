const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

let inString = false, quoteChar = null;
for (let i = 0; i <= 8674; i++) {
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

console.log('inString at 8674:', inString);
console.log('quoteChar at 8674:', quoteChar);

// Trace back to find when the string at pos 8674 started
if (inString) {
  let start = 0;
  let inStr = false, qChar = null;
  for (let i = 0; i <= 8674; i++) {
    const c = line[i];
    if (inStr) {
      if (c === '\\') {
        i++;
      } else if (c === qChar) {
        inStr = false;
        qChar = null;
      }
    } else {
      if (c === '"' || c === "'") {
        inStr = true;
        qChar = c;
        start = i;
      }
    }
  }
  console.log('String at pos 8674 started at:', start);
  console.log('String content (last 50 chars):', JSON.stringify(line.slice(Math.max(0, start), 8675).slice(-50)));
}

// Check braces at key positions
let braces = 0;
inString = false; quoteChar = null;
for (let i = 0; i <= 8674; i++) {
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
    } else if (c === '{') {
      braces++;
    } else if (c === '}') {
      braces--;
    }
  }
}

console.log('Braces at 8674:', braces);

// Show braces at pos 8639, 8673, 8674
braces = 0;
inString = false; quoteChar = null;
for (let i = 0; i <= 8674; i++) {
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
    } else if (c === '{') {
      braces++;
    } else if (c === '}') {
      braces--;
    }
  }
  if (i === 8639 || i === 8673 || i === 8674) {
    console.log('Braces at pos', i, ':', braces, 'inString:', inString, 'char:', JSON.stringify(c));
  }
}
