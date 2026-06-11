const fs = require('fs');

// 读取 cards.js
const code = fs.readFileSync('cards.js', 'utf8');

// 提取 ALL_CARDS 数组
const match = code.match(/const ALL_CARDS = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Cannot find ALL_CARDS');
  process.exit(1);
}

const cards = JSON.parse(match[1]);
console.log(`Total cards: ${cards.length}`);

// 统计当前分布
const dist = [0, 0, 0, 0];
cards.forEach(c => {
  if (c.zh && c.zh.ans !== undefined) {
    dist[c.zh.ans]++;
  }
});
const total = dist.reduce((a, b) => a + b, 0);
console.log('\n=== Before ===');
['A', 'B', 'C', 'D'].forEach((label, i) => {
  console.log(`  ${label}: ${dist[i]} (${(dist[i] / total * 100).toFixed(1)}%)`);
});

// 为每张卡分配新答案位置，确保均匀分布
const targetPerAnswer = Math.floor(total / 4);
const remainder = total % 4;

// 创建目标答案列表
const newAnswers = [];
for (let i = 0; i < 4; i++) {
  const count = targetPerAnswer + (i < remainder ? 1 : 0);
  for (let j = 0; j < count; j++) {
    newAnswers.push(i);
  }
}

// 随机打乱
for (let i = newAnswers.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [newAnswers[i], newAnswers[j]] = [newAnswers[j], newAnswers[i]];
}

// 对每张卡：将正确答案移到新位置（交换 opts 中的对应项）
let changed = 0;
cards.forEach((card, idx) => {
  if (!card.zh || card.zh.ans === undefined) return;
  
  const oldAns = card.zh.ans;
  const newAns = newAnswers[idx];
  
  if (oldAns !== newAns && card.zh.opts && card.zh.opts.length > Math.max(oldAns, newAns)) {
    // 交换 zh.opts
    const temp = card.zh.opts[oldAns];
    card.zh.opts[oldAns] = card.zh.opts[newAns];
    card.zh.opts[newAns] = temp;
    card.zh.ans = newAns;
    
    // 同步交换 en.opts（如果有）
    if (card.en && card.en.opts && card.en.opts.length > Math.max(oldAns, newAns)) {
      const tempEn = card.en.opts[oldAns];
      card.en.opts[oldAns] = card.en.opts[newAns];
      card.en.opts[newAns] = tempEn;
      // en.ans 也同步
      if (card.en.ans !== undefined) {
        card.en.ans = newAns;
      }
    }
    
    changed++;
  }
});

// 统计新分布
const newDist = [0, 0, 0, 0];
cards.forEach(c => {
  if (c.zh && c.zh.ans !== undefined) {
    newDist[c.zh.ans]++;
  }
});

console.log('\n=== After ===');
['A', 'B', 'C', 'D'].forEach((label, i) => {
  console.log(`  ${label}: ${newDist[i]} (${(newDist[i] / total * 100).toFixed(1)}%)`);
});

console.log(`\nChanged ${changed} cards`);

// 重建 cards.js
const newCode = code.replace(match[1], JSON.stringify(cards));
fs.writeFileSync('cards.js', newCode, 'utf8');
console.log('Saved to cards.js');
