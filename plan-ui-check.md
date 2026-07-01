# 应急小达人 全局 UI/UX 检查计划

## 目标
全面检查所有模块、按钮、界面，找出 bug、排版错误、对比度问题、截断问题等并修复。

## 阶段

### Stage 1 — 并行代码审查（当前）
- **Agent A（引擎检查员）**: 读取 game-engines.js，检查 6 个之前空白页引擎（firstaid/survival/bossrush/timed/eggs/memory-card）的 init/start 逻辑是否完整
- **Agent B（样式检查员）**: 读取 critical.css + all-styles-v55.css，检查 grid 布局、padding-bottom、文字对比度、工具栏高亮逻辑
- **Agent C（WebBridge 截图员）**: 使用 WebBridge 打开 GitHub Pages 部署页面，截图所有 P1/P2 问题页面，确认修复状态

### Stage 2 — 修复
- 汇总 Stage 1 发现的所有问题
- 按严重度排序修复
- 修改对应 CSS/JS 文件

### Stage 3 — 验证
- 重新截图验证修复
- 推送至 GitHub

## 检查页面清单（47个页面）
P1（严重）: firstaid, survival, bossrush, timed, eggs, memory-card, calendar, minigame
P2（重要）: free, speed, battle-lobby, leaderboard, wrong-book, museum, codex, achievements, shop, toolbar
P3（一般）: stats, character, certification, settings, encyclopedia, music, base
正常（参考）: menu, disaster-sim, real-cases, report, daily, story, precision, reaction, gacha
