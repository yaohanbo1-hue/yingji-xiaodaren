const fs = require('fs');
const content = fs.readFileSync('game-engines.js', 'utf-8');

// Find pkResultPlayers innerHTML using search for the string pattern
const searchStr = 'pkResultPlayers';
const idx = content.indexOf(searchStr);
if (idx !== -1) {
  console.log('=== pkResultPlayers context ===');
  console.log(content.substring(idx - 50, idx + 1200));
}

// Find pkResultDetail
const searchStr2 = 'pkResultDetail';
const idx2 = content.indexOf(searchStr2);
if (idx2 !== -1) {
  console.log('\n=== pkResultDetail context ===');
  console.log(content.substring(idx2 - 50, idx2 + 1200));
}

// Find all innerHTML uses with user input patterns in game-engines.js
const innerHtmlMatches = content.match(/innerHTML\s*=\s*[^;]+/g);
if (innerHtmlMatches) {
  console.log('\n=== All innerHTML assignments in game-engines.js ===');
  innerHtmlMatches.forEach((m, i) => {
    if (m.length > 200) {
      console.log(`${i}: ${m.substring(0, 200)}...`);
    } else {
      console.log(`${i}: ${m}`);
    }
  });
}
