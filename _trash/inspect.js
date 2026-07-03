const fs = require('fs');
const path = require('path');

const files = [
  'archive/QuizEngine.js',
  'archive/UniversalSystemViewer.js',
  'archive/TimedChallengeEngine.js',
  'archive/TutorialEngine.js',
  'archive/SupplyDropGame.js',
  'archive/SurvivalEngine.js',
  'archive/ThemeEngine.js',
  'archive/TimeEscapeEngine.js',
  'archive/ScratchEngine.js',
  'archive/SeasonEngine.js',
  'archive/SetBonusEngine.js',
  'archive/ShopEngine.js',
  'archive/StatsEngine.js',
  'archive/StoryAdventureEngine.js',
  'archive/StoryChallengeEngine.js'
];

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  // 1. 重复声明分析 (var / function / let / const)
  const declared = { var: new Map(), let: new Map(), const: new Map(), function: new Map() };
  const scopeStack = [];
  let currentScope = { var: new Map(), let: new Map(), const: new Map(), function: new Map() };
  scopeStack.push(currentScope);

  // 2. 未定义变量引用分析 (简单启发式)
  const assigned = new Set();  // 已赋值变量
  const used = new Set();      // 使用变量
  const lineMap = new Map();   // 变量名 -> 行号

  const varPattern = /\b(var|let|const)\s+(\w+)(?:\s*,\s*(\w+))*\s*[;=]/g;
  const funcPattern = /\bfunction\s+(\w+)\s*\(/g;
  const classPattern = /\bclass\s+(\w+)\b/g;
  const assignPattern = /\b(\w+)\s*=[^=]/g;
  const usePattern = /\b(\w+)\b/g;
  const commonGlobal = new Set(['window', 'document', 'console', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'JSON', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'fetch', 'Promise', 'Error', 'undefined', 'null', 'true', 'false', 'this', 'arguments', 'event', 'localStorage', 'sessionStorage', 'navigator', 'location', 'history', 'screen', 'alert', 'confirm', 'prompt', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent', 'eval', 'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Symbol', 'Proxy', 'Reflect', 'Intl', 'Blob', 'URL', 'URLSearchParams', 'FormData', 'Request', 'Response', 'Headers', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'IntersectionObserver', 'MutationObserver', 'ResizeObserver', 'CustomEvent', 'Event', 'Node', 'Element', 'HTMLElement', 'Document', 'ShadowRoot', 'NodeList', 'HTMLCollection', 'querySelector', 'querySelectorAll', 'addEventListener', 'removeEventListener', 'dispatchEvent', 'getElementById', 'getElementsByClassName', 'getElementsByTagName', 'createElement', 'createTextNode', 'appendChild', 'removeChild', 'insertBefore', 'cloneNode', 'innerHTML', 'outerHTML', 'textContent', 'className', 'classList', 'style', 'dataset', 'getAttribute', 'setAttribute', 'removeAttribute', 'hasAttribute', 'styleSheet', 'CSSStyleSheet', 'CSSRule', 'MediaQueryList', 'matchMedia', 'Audio', 'Image', 'XMLHttpRequest', 'WebSocket', 'Worker', 'SharedArrayBuffer', 'Atomics', 'BigInt', 'Infinity', 'NaN', 'Function', 'Object', 'Array', 'String', 'Boolean', 'Number', 'Date', 'RegExp', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'ArrayBuffer', 'DataView', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'Object', 'Function', 'Boolean', 'Symbol', 'Error', 'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'Array', 'Date', 'RegExp', 'String', 'Map', 'Set', 'WeakMap', 'WeakSet', 'ArrayBuffer', 'SharedArrayBuffer', 'Atomics', 'DataView', 'JSON', 'Promise', 'Generator', 'GeneratorFunction', 'AsyncFunction', 'Reflect', 'Proxy', 'Intl', 'WebAssembly']);

  const reserved = new Set(['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'throw', 'try', 'catch', 'finally', 'function', 'class', 'var', 'let', 'const', 'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'void', 'with', 'yield', 'await', 'async', 'import', 'export', 'default', 'from', 'as', 'super', 'extends', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static', 'abstract', 'final', 'native', 'synchronized', 'transient', 'volatile', 'strictfp', 'const', 'goto', 'enum', 'debugger', 'true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

  const lineUses = new Map();  // lineNum -> set of used vars
  const lineAssigns = new Map(); // lineNum -> set of assigned vars
  const lineDecls = new Map();   // lineNum -> set of declared vars

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    // skip comments and strings (simple approach)
    const codeLine = line.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, '""');
    // skip single-line comments
    const cleanLine = codeLine.replace(/\/\/.*$/, '');

    // 检测重复声明
    let m;
    const varRegex = /\b(var|let|const)\s+(\w+)/g;
    while ((m = varRegex.exec(cleanLine)) !== null) {
      const kind = m[1];
      const name = m[2];
      if (!lineDecls.has(lineNum)) lineDecls.set(lineNum, new Set());
      lineDecls.get(lineNum).add(name);
      // 检查重复
      if (currentScope[kind].has(name)) {
        issues.push({ level: 'P1', type: 'duplicate-declaration', name, line: lineNum, msg: `Duplicate ${kind} declaration: '${name}'` });
      } else if (kind === 'var' && (currentScope.let.has(name) || currentScope.const.has(name))) {
        issues.push({ level: 'P1', type: 'redeclared-with-var', name, line: lineNum, msg: `var '${name}' redeclares existing let/const` });
      } else if ((kind === 'let' || kind === 'const') && (currentScope.var.has(name) || currentScope.let.has(name) || currentScope.const.has(name))) {
        issues.push({ level: 'P1', type: 'redeclared-block', name, line: lineNum, msg: `Duplicate ${kind} declaration: '${name}'` });
      }
      currentScope[kind].set(name, lineNum);
    }

    const funcRegex = /\bfunction\s+(\w+)\s*\(/g;
    while ((m = funcRegex.exec(cleanLine)) !== null) {
      const name = m[1];
      if (!lineDecls.has(lineNum)) lineDecls.set(lineNum, new Set());
      lineDecls.get(lineNum).add(name);
      if (currentScope.function.has(name)) {
        issues.push({ level: 'P1', type: 'duplicate-function', name, line: lineNum, msg: `Duplicate function declaration: '${name}'` });
      }
      currentScope.function.set(name, lineNum);
    }

    // 检测赋值给未声明变量
    const assignRegex = /\b(\w+)\s*=(?!=)/g;
    while ((m = assignRegex.exec(cleanLine)) !== null) {
      const name = m[1];
      if (!reserved.has(name) && !commonGlobal.has(name) && !/\d/.test(name[0])) {
        if (!lineAssigns.has(lineNum)) lineAssigns.set(lineNum, new Set());
        lineAssigns.get(lineNum).add(name);
        assigned.add(name);
      }
    }

    // 收集使用变量
    const useRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    while ((m = useRegex.exec(cleanLine)) !== null) {
      const name = m[1];
      if (!reserved.has(name) && !commonGlobal.has(name) && !/\d/.test(name[0])) {
        if (!lineUses.has(lineNum)) lineUses.set(lineNum, new Set());
        lineUses.get(lineNum).add(name);
        used.add(name);
      }
    }
  }

  // 检测未声明即使用 (简单启发：使用了但从未在当前scope中声明，且不是全局已知变量)
  // 更保守地：只检查那些出现在赋值左侧但又未声明的变量
  // 以及那些作为函数调用参数但看起来没有声明的
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const usedVars = lineUses.get(lineNum) || new Set();
    const declaredVars = lineDecls.get(lineNum) || new Set();
    const assignedVars = lineAssigns.get(lineNum) || new Set();

    for (const v of usedVars) {
      // 如果这行之前就声明了，或者这行声明了，跳过
      // 简单检查：看是否在所有声明集合中
      let isDeclared = false;
      for (const scope of scopeStack) {
        if (scope.var.has(v) || scope.let.has(v) || scope.const.has(v) || scope.function.has(v)) {
          isDeclared = true;
          break;
        }
      }
      if (isDeclared) continue;
      // 如果已赋值但无声明 → 隐式全局变量 (P1)
      if (assignedVars.has(v) && !declaredVars.has(v)) {
        issues.push({ level: 'P1', type: 'implicit-global', name: v, line: lineNum, msg: `Implicit global variable assignment: '${v}'` });
      }
    }
  }

  return { file: filePath, issues };
}

// 主函数
function main() {
  const allResults = [];
  for (const file of files) {
    const fullPath = path.resolve(file);
    if (!fs.existsSync(fullPath)) {
      allResults.push({ file, issues: [{ level: 'P0', type: 'missing', line: 0, msg: 'File not found' }] });
      continue;
    }
    const result = analyzeFile(fullPath);
    allResults.push(result);
  }

  // 输出汇总
  let P0 = 0, P1 = 0, P2 = 0;
  const summaries = [];
  for (const r of allResults) {
    const p0 = r.issues.filter(i => i.level === 'P0');
    const p1 = r.issues.filter(i => i.level === 'P1');
    const p2 = r.issues.filter(i => i.level === 'P2');
    P0 += p0.length;
    P1 += p1.length;
    P2 += p2.length;
    summaries.push({ file: r.file, p0: p0.length, p1: p1.length, p2: p2.length, details: r.issues });
  }

  console.log('='.repeat(60));
  console.log('INSPECTOR1-ARCHIVE-BATCH1 检查结果汇总');
  console.log('='.repeat(60));
  console.log(`\n总计: P0=${P0}  P1=${P1}  P2=${P2}\n`);

  for (const s of summaries) {
    const fileName = path.basename(s.file);
    console.log(`--- ${fileName} ---`);
    if (s.p0 === 0 && s.p1 === 0 && s.p2 === 0) {
      console.log('  ✅ 无问题');
    } else {
      if (s.p0 > 0) {
        console.log(`  🔴 P0 (${s.p0}):`);
        s.details.filter(i => i.level === 'P0').forEach(i => console.log(`    Line ${i.line}: ${i.msg}`));
      }
      if (s.p1 > 0) {
        console.log(`  🟠 P1 (${s.p1}):`);
        s.details.filter(i => i.level === 'P1').forEach(i => console.log(`    Line ${i.line}: ${i.msg}`));
      }
      if (s.p2 > 0) {
        console.log(`  🟡 P2 (${s.p2}):`);
        s.details.filter(i => i.level === 'P2').forEach(i => console.log(`    Line ${i.line}: ${i.msg}`));
      }
    }
    console.log('');
  }

  // 详细JSON输出到文件
  fs.writeFileSync('archive_batch1_inspection.json', JSON.stringify(summaries, null, 2));
  console.log('详细结果已保存到 archive_batch1_inspection.json');
}

main();
