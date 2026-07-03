const fs = require('fs');
const path = require('path');
const files = [
  'archive/QuizEngine.js','archive/UniversalSystemViewer.js','archive/TimedChallengeEngine.js','archive/TutorialEngine.js',
  'archive/SupplyDropGame.js','archive/SurvivalEngine.js','archive/ThemeEngine.js','archive/TimeEscapeEngine.js',
  'archive/ScratchEngine.js','archive/SeasonEngine.js','archive/SetBonusEngine.js','archive/ShopEngine.js',
  'archive/StatsEngine.js','archive/StoryAdventureEngine.js','archive/StoryChallengeEngine.js'
];

const results = [];
for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  const issues = [];

  // 1. eval / new Function / with / arguments.callee
  if (/\beval\s*\(/.test(code)) issues.push({level:'P1', msg:'Uses eval() - security risk'});
  if (/\bnew\s+Function\b/.test(code)) issues.push({level:'P1', msg:'Uses new Function() - security risk'});
  if (/\bwith\s*\(/.test(code)) issues.push({level:'P1', msg:'Uses with statement - deprecated'});
  if (/arguments\.callee/.test(code)) issues.push({level:'P2', msg:'Uses arguments.callee - deprecated'});

  // 2. setInterval / clearInterval 平衡
  const si = (code.match(/\bsetInterval\b/g) || []).length;
  const ci = (code.match(/\bclearInterval\b/g) || []).length;
  if (si > ci) {
    issues.push({level:'P2', msg:'Potential interval leak: ' + si + ' setInterval vs ' + ci + ' clearInterval'});
  }

  // 3. setTimeout / clearTimeout 平衡
  const st = (code.match(/\bsetTimeout\b/g) || []).length;
  const ct = (code.match(/\bclearTimeout\b/g) || []).length;
  if (st > ct) {
    issues.push({level:'P2', msg:'Potential timeout leak: ' + st + ' setTimeout vs ' + ct + ' clearTimeout'});
  }

  // 4. 检测全局未保护引用（引用了不在 commonGlobal 中的变量）
  const commonGlobal = new Set(['window','document','console','Math','Date','JSON','Promise','Array','Object','String','Number','Boolean','RegExp','Error','Map','Set','WeakMap','WeakSet','Symbol','Proxy','Reflect','Intl','parseInt','parseFloat','isNaN','isFinite','encodeURI','decodeURI','encodeURIComponent','decodeURIComponent','Infinity','NaN','undefined','setTimeout','setInterval','clearTimeout','clearInterval','fetch','requestAnimationFrame','cancelAnimationFrame','alert','confirm','prompt','eval','Function','localStorage','sessionStorage','navigator','location','history','screen','innerWidth','innerHeight','devicePixelRatio','addEventListener','removeEventListener','dispatchEvent','getElementById','getElementsByClassName','getElementsByTagName','createElement','createTextNode','appendChild','removeChild','insertBefore','cloneNode','innerHTML','outerHTML','textContent','className','classList','style','dataset','getAttribute','setAttribute','removeAttribute','hasAttribute','querySelector','querySelectorAll','matchMedia','Audio','Image','XMLHttpRequest','WebSocket','Worker','Event','CustomEvent','KeyboardEvent','MouseEvent','TouchEvent','PointerEvent','IntersectionObserver','MutationObserver','ResizeObserver','performance','Blob','URL','URLSearchParams','FormData','Request','Response','Headers','FileReader','CanvasRenderingContext2D','OffscreenCanvas','WebGLRenderingContext','WebGL2RenderingContext']);
  // 提取所有标识符引用
  const idPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
  let m;
  const allIds = new Set();
  while ((m = idPattern.exec(code)) !== null) allIds.add(m[1]);
  const unprotected = [];
  for (const id of allIds) {
    if (commonGlobal.has(id)) continue;
    if (/^(true|false|null|undefined|NaN|Infinity)$/.test(id)) continue;
    if (/^(var|let|const|function|return|throw|if|else|for|while|do|switch|case|break|continue|try|catch|finally|class|new|delete|typeof|instanceof|in|of|void|with|yield|await|async|import|export|default|from|as|super|extends|implements|interface|package|private|protected|public|static|abstract|final|native|synchronized|transient|volatile|strictfp|goto|enum|debugger|this|arguments)$/.test(id)) continue;
    if (/^\d/.test(id)) continue;
    unprotected.push(id);
  }
  if (unprotected.length > 0) {
    // 这些是文件引用的全局变量，可能是未定义的外部依赖
    // 但压缩代码大量引用外部对象，这不算真正的问题
    // 只报告明显可疑的（单字母变量且未在代码中声明）
    const suspicious = unprotected.filter(id => id.length <= 2 && !commonGlobal.has(id));
    if (suspicious.length > 0) {
      issues.push({level:'P2', msg:'Suspicious short identifiers (possible undefined): ' + suspicious.slice(0,8).join(', ')});
    }
  }

  results.push({ file: path.basename(f), issues });
}

console.log('='.repeat(65));
console.log('INSPECTOR1-ARCHIVE-BATCH1 深度检查结果');
console.log('='.repeat(65));

let totalP0=0, totalP1=0, totalP2=0;
for (const r of results) {
  const p0 = r.issues.filter(i=>i.level==='P0');
  const p1 = r.issues.filter(i=>i.level==='P1');
  const p2 = r.issues.filter(i=>i.level==='P2');
  totalP0 += p0.length; totalP1 += p1.length; totalP2 += p2.length;

  console.log('\n--- ' + r.file + ' ---');
  if (p0.length===0 && p1.length===0 && p2.length===0) {
    console.log('  (OK) 无问题');
  } else {
    p0.forEach(i=>console.log('  P0: ' + i.msg));
    p1.forEach(i=>console.log('  P1: ' + i.msg));
    p2.forEach(i=>console.log('  P2: ' + i.msg));
  }
}

console.log('\n'+'='.repeat(65));
console.log('总计: P0=' + totalP0 + '  P1=' + totalP1 + '  P2=' + totalP2);
console.log('='.repeat(65));

// 保存 JSON
fs.writeFileSync('archive_batch1_inspection.json', JSON.stringify(results, null, 2));
