const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Check around position 7800-8200
console.log('Position 7800-8200:');
console.log(line.slice(7800, 8200));

console.log('\n---\n');

// Check around position 8200-8676
console.log('Position 8200-end:');
console.log(line.slice(8200));

console.log('\n---\n');

// Find the exact syntax issue by looking for the forEach or loop
const idx = line.lastIndexOf('forEach', 8200);
console.log('Last forEach before 8200:', idx);
if (idx > 0) {
  console.log('Context:', line.slice(idx, idx + 200));
}

// Check for "for" loops
const forIdx = line.lastIndexOf('for(', 8200);
console.log('Last for( before 8200:', forIdx);
if (forIdx > 0) {
  console.log('Context:', line.slice(forIdx, forIdx + 200));
}

// Check for "Object.keys"
const keysIdx = line.lastIndexOf('Object.keys', 8200);
console.log('Last Object.keys before 8200:', keysIdx);

// Check the exact transition from the string to the loop
const rewardIdx = line.indexOf('答对所有步骤获得奖励');
console.log('Reward index:', rewardIdx);
console.log('Context:', line.slice(rewardIdx, rewardIdx + 200));
