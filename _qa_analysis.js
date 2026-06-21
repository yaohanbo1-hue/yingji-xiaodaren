const fs = require('fs');
const path = require('path');

const results = {
  innerHtmlXss: [],
  localStorageKeys: new Set(),
  undefinedVars: [],
  missingFiles: []
};

// Files to check (excluding archive, reports, yingji-xiaodaren duplicate)
const files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!['archive','reports','yingji-xiaodaren','node_modules'].includes(f)) {
        walk(full);
      }
    } else if (/\.(js|html)$/.test(f)) {
      files.push(full);
    }
  }
}
walk('.');

for (const file of files) {
  const rel = path.relative('.', file).replace(/\\/g, '/');
  if (rel.startsWith('archive/') || rel.startsWith('reports/') || rel.startsWith('yingji-xiaodaren/')) continue;
  
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Check localStorage keys
    const lsMatch = line.match(/localStorage\.(?:get|set|remove)Item\(['"']([^'"']+)/);
    if (lsMatch) {
      results.localStorageKeys.add(lsMatch[1]);
    }
  }
}

console.log('=== localStorage Keys (source files only) ===');
for (const k of Array.from(results.localStorageKeys).sort()) {
  console.log(k);
}

// Check for potential XSS via innerHTML with user input patterns in game-engines.js
const gameEngines = fs.readFileSync('game-engines.js', 'utf-8');
const xssMatches = [];
// Find innerHTML with template literals containing player names
const pattern1 = /innerHTML\s*=\s*`[^`]*\$\{[^}]*(?:p1Name|p2Name|playerName)[^}]*\}`/g;
let m1;
while ((m1 = pattern1.exec(gameEngines)) !== null) {
  xssMatches.push(m1[0]);
}
// Find innerHTML with concatenation containing player names
const pattern2 = /innerHTML\s*=\s*[^;]*(?:p1Name|p2Name|playerName)[^;]*;/g;
let m2;
while ((m2 = pattern2.exec(gameEngines)) !== null) {
  if (m2[0].length < 500) xssMatches.push(m2[0]);
  else xssMatches.push(m2[0].substring(0, 300) + '...');
}

if (xssMatches.length > 0) {
  console.log('\n=== POTENTIAL XSS: innerHTML with player names in game-engines.js ===');
  xssMatches.forEach((m, i) => console.log(`${i+1}: ${m}`));
} else {
  console.log('\nNo innerHTML with player names found in game-engines.js');
}

// Check ai-tutor-v55.js for innerHTML with text from LLM
const aiTutor = fs.readFileSync('ai-tutor-v55.js', 'utf-8');
const aiMatches = [];
const pattern3 = /innerHTML\s*=\s*[^;]*text[^;]*;/g;
let m3;
while ((m3 = pattern3.exec(aiTutor)) !== null) {
  if (m3[0].length < 300) aiMatches.push(m3[0]);
  else aiMatches.push(m3[0].substring(0, 200) + '...');
}
if (aiMatches.length > 0) {
  console.log('\n=== ai-tutor-v55.js innerHTML with text variable ===');
  aiMatches.forEach((m, i) => console.log(`${i+1}: ${m}`));
}

// Check certification.js for innerHTML with user input
const cert = fs.readFileSync('certification.js', 'utf-8');
const certMatches = [];
const pattern4 = /innerHTML\s*=\s*[^;]*(?:name|user|player)[^;]*;/g;
let m4;
while ((m4 = pattern4.exec(cert)) !== null) {
  if (m4[0].length < 300) certMatches.push(m4[0]);
  else certMatches.push(m4[0].substring(0, 200) + '...');
}
if (certMatches.length > 0) {
  console.log('\n=== certification.js innerHTML with name/user/player ===');
  certMatches.forEach((m, i) => console.log(`${i+1}: ${m}`));
}

// Check for Modal.show with user input
const modalPattern = /Modal\.show\([^)]*\+[^)]*\)/g;
const modalMatches = gameEngines.match(modalPattern);
if (modalMatches) {
  console.log('\n=== Modal.show with concatenation (potential XSS) ===');
  modalMatches.forEach((m, i) => console.log(`${i+1}: ${m}`));
}

console.log('\n=== Analysis complete ===');
