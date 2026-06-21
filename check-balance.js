const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Check brace/bracket balance
let braces = 0, brackets = 0, parens = 0;
let inString = false, quoteChar = null;
let maxBrace = 0, maxBracket = 0, maxParen = 0;

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
      if (braces > maxBrace) maxBrace = braces;
    } else if (c === '}') {
      braces--;
    } else if (c === '[') {
      brackets++;
      if (brackets > maxBracket) maxBracket = brackets;
    } else if (c === ']') {
      brackets--;
    } else if (c === '(') {
      parens++;
      if (parens > maxParen) maxParen = parens;
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
console.log('Max brace depth:', maxBrace);
console.log('Max bracket depth:', maxBracket);
console.log('Max paren depth:', maxParen);
