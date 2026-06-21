const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Check brace/bracket balance, ignoring braces inside strings
let braces = 0, brackets = 0, parens = 0;
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
    } else if (c === '[') {
      brackets++;
    } else if (c === ']') {
      brackets--;
    } else if (c === '(') {
      parens++;
    } else if (c === ')') {
      parens--;
    }
  }
  
  if (braces < 0 || brackets < 0 || parens < 0) {
    console.log('Unbalanced at position', i, ':', JSON.stringify(c), 'braces:', braces, 'brackets:', brackets, 'parens:', parens);
    console.log('Context:', line.slice(Math.max(0, i-50), i+50));
    break;
  }
}

console.log('Final braces:', braces);
console.log('Final brackets:', brackets);
console.log('Final parens:', parens);

// Find the last 100 chars
console.log('Last 100 chars:', line.slice(-100));
console.log('Ends with ;:', line.endsWith(';'));

// Check if the SCENARIOS section is properly closed
const scenariosIdx = line.indexOf('SCENARIOS:');
const startIdx = line.indexOf(',start:');
const renderIdx = line.indexOf(',render:');
console.log('SCENARIOS at:', scenariosIdx);
console.log('start at:', startIdx);
console.log('render at:', renderIdx);

// Check between SCENARIOS and start
const scenariosSection = line.slice(scenariosIdx, startIdx);
console.log('SCENARIOS section braces:', (scenariosSection.match(/\{/g) || []).length, (scenariosSection.match(/\}/g) || []).length);
