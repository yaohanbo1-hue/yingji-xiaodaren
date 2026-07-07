/**
 * 应急小达人 — 资源打包与压缩构建脚本 (v1.3.5)
 *
 * 策略（安全优先）：
 *  - JS：严格保留 index.html 中的加载顺序，逐文件用 terser 压缩（仅 compress，不 mangle/重命名），
 *        以避免破坏 HTML 内联脚本对全局函数（如 PageManager.navigate）的调用。
 *        顺序拼接为单个 js/app.min.js，与原“多个独立 <script> 共享全局作用域”的语义完全一致。
 *  - CSS：保留 critical.css 单独（首屏关键），其余非关键样式按原顺序用 csso 压缩后合并为 css/all.min.css。
 *        csso 能正确处理 calc()/url() 等，避免正则压缩导致的样式错乱。
 *
 * 用法：node tools/build-bundle.cjs
 */
const fs = require('fs');
const path = require('path');
const terser = require('terser');
const csso = require('csso');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}
function write(p, c) {
  fs.writeFileSync(path.join(ROOT, p), c);
}

// ---------- JS 打包 ----------
// 使用固定有序清单（与原始 index.html 的 45 个 defer <script> 顺序一致）。
// 注意：不再解析 index.html，因为其中现仅引用打包产物 js/app.min.js 本身，解析会导致自引用。
const JS_FILES = [
  'js/core/optimized/ErrorBoundary.js',
  'js/core/optimized/DOMCache.js',
  'js/core/optimized/EventDelegate.js',
  'js/core/utils.js',
  'js/core/utils-enhanced.js',
  'js/core/game-core.js',
  'cards.js',
  'scenarios.js',
  'kit_data.js',
  'game-engines.js',
  'js/core/performance-patch.js',
  'loading.js',
  'menu-manager.js',
  'juice.js',
  'visual-fx.js',
  'v10-interactions.js',
  'menu-enhance.js',
  'share.js',
  'i18n.js',
  'bg-themes.js',
  'liquid-glass.js',
  'optimizer-mobile.js',
  'encyclopedia_extra.js',
  'encyclopedia_final.js',
  'bg-premium.js',
  'ui-polish.js',
  'tilt3d.js',
  'sfx.js',
  'bgm-enhanced.js',
  'audio-integration.js',
  'ai-tutor-llm-v55.js',
  'ai-tutor-v55.js',
  'ai-float-v55.js',
  'certification.js',
  'cert-enhance.js',
  'disaster-sim.js',
  'disaster-particles.js',
  'real-cases.js',
  'wrong-book.js',
  'report.js',
  'voice.js',
  'guide-enhance.js',
  'accessibility.js',
  'performance.js',
  'patch-v75.js',
  'runtime-hardening.js'
];
console.log(`[JS] 按固定清单打包 ${JS_FILES.length} 个源文件...`);

let rawTotal = 0;
let minTotal = 0;
const parts = [];
for (const rel of JS_FILES) {
  const file = rel.split('?')[0];
  const src = read(file);
  rawTotal += src.length;
  let out = src;
  try {
    // 安全压缩：保留顶层声明与全局名（不重命名），仅做死代码/常量折叠等安全变换
    const res = terser.minify_sync(src, {
      compress: { toplevel: false, passes: 2, unsafe: false, typeofs: false },
      mangle: false,
      format: { comments: false }
    });
    if (res && res.error) throw res.error;
    out = (res && typeof res.code === 'string') ? res.code : src;
  } catch (e) {
    console.warn(`  ⚠  terser 跳过(${rel})，使用原始内容: ${e.message}`);
  }
  minTotal += out.length;
  parts.push(out);
}
const bundle = parts.join('\n;\n');
write('js/app.min.js', bundle);
console.log(`[JS] 原始 ${ (rawTotal/1024).toFixed(1) } KB -> 压缩 ${ (minTotal/1024).toFixed(1) } KB  (js/app.min.js ${(bundle.length/1024).toFixed(1)} KB)`);

// ---------- CSS 打包 ----------
// 严格按 index.html 顺序（critical.css 除外）
const cssList = [
  'css-variables.css',
  'all-styles-v55.css',
  'settings.css',
  'optimizer-mobile.css',
  'animation-optimize.css',
  'fix-interaction.css',
  'ai-float.css',
  'visual-enhance.css',
  'scroll-fix.css',
  'a11y-polish.css',
  'study-card-v2.css'
];
console.log(`[CSS] 合并 ${cssList.length} 个样式表...`);
let cssRaw = 0, cssMin = 0;
const cssParts = [];
for (const rel of cssList) {
  const src = read(rel);
  cssRaw += src.length;
  let out = src;
  try {
    out = csso.minify(src, { restructure: false }).css;
  } catch (e) {
    console.warn(`  ⚠  csso 跳过(${rel}): ${e.message}`);
  }
  cssMin += out.length;
  cssParts.push(out);
}
const cssBundle = cssParts.join('\n');
write('css/all.min.css', cssBundle);
console.log(`[CSS] 原始 ${ (cssRaw/1024).toFixed(1) } KB -> 压缩 ${ (cssMin/1024).toFixed(1) } KB  (css/all.min.css ${(cssBundle.length/1024).toFixed(1)} KB)`);

console.log('\n✅ 打包完成。请在 index.html 中替换对应引用为 js/app.min.js 与 css/all.min.css。');
