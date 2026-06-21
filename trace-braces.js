const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Trace brace depth at different positions
let braces = 0;
let inString = false, quoteChar = null;

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
    } else if (c === '{') {
      braces++;
    } else if (c === '}') {
      braces--;
    }
  }
  
  // Print depth at key positions
  if (i % 1000 === 0 || i === line.length - 1) {
    console.log('Position', i, ': braces =', braces, 'char =', JSON.stringify(c));
  }
  
  if (braces < 0) {
    console.log('Negative braces at', i, ':', JSON.stringify(c));
    console.log('Context:', line.slice(Math.max(0, i-50), i+50));
    break;
  }
}

console.log('Final braces:', braces);

// Find the last few positions where braces change
let lastChanges = [];
braces = 0;
inString = false;
quoteChar = null;
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
      lastChanges.push({pos: i, char: c, braces: braces + (c === '{' ? 1 : -1)});
      braces += (c === '{' ? 1 : -1);
    }
  }
}

console.log('Last 10 brace changes:');
lastChanges.slice(-10).forEach(c => {
  console.log('  pos', c.pos, ':', c.char, '-> braces =', c.braces);
});

// Count all braces
let openCount = 0, closeCount = 0;
lastChanges.forEach(c => {
  if (c.char === '{') openCount++;
  else closeCount++;
});
console.log('Open braces:', openCount);
console.log('Close braces:', closeCount);
console.log('Final braces:', braces);

// Show all brace changes from position 8000 onwards
console.log('Brace changes from pos 8000:');
lastChanges.filter(c => c.pos >= 8000).forEach(c => {
  console.log('  pos', c.pos, ':', c.char, '-> braces =', c.braces);
});

// Check if there are negative braces at any point
console.log('Checking for negative braces...');
braces = 0;
inString = false;
quoteChar = null;
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
    } else if (c === '{') {
      braces++;
    } else if (c === '}') {
      braces--;
    }
  }
  
  if (braces < 0) {
    console.log('Negative at', i, ':', JSON.stringify(c));
    console.log('Context:', line.slice(Math.max(0, i-50), i+50));
    break;
  }
}

if (braces >= 0) {
  console.log('No negative braces found. Final:', braces);
}

// Show the last 200 chars with positions
console.log('Last 200 chars:');
for (let i = line.length - 200; i < line.length; i++) {
  const c = line[i];
  if (c === '{' || c === '}') {
    console.log('  pos', i, ':', c);
  }
}

console.log('Last 200 chars content:');
console.log(line.slice(-200));
