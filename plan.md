# 应急小达人 30-Agent 稳定循环计划

## 目标
通过30个专业化agent的分工协作循环，全面测试、修复、优化游戏，确保所有功能稳定可用。

## 工作目录
`C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren`

## 阶段划分

### 阶段1：全面检查（10个Agent并行）
每个agent负责一个独立检查维度，输出详细的bug报告。

| # | Agent名称 | 职责 | 检查范围 | 输出 |
|---|-----------|------|----------|------|
| 1 | Inspector_HTML | HTML结构检查 | index.html页面结构、页面定义、容器嵌套、script顺序 | 结构问题报告 |
| 2 | Inspector_CSS | CSS样式检查 | 所有.css文件、样式冲突、z-index、pointer-events、display | 样式冲突报告 |
| 3 | Inspector_GameCore | 游戏核心引擎 | game.js _refreshPage、PageManager、navigate、全局变量 | 引擎bug报告 |
| 4 | Inspector_Menu | 菜单与导航 | menu-manager.js、工具栏、按钮事件、data-nav映射 | 导航问题报告 |
| 5 | Inspector_Engine_1 | 游戏引擎检查A | 盲盒、卡牌、答题、擂台、自由模式 | 引擎A bug报告 |
| 6 | Inspector_Engine_2 | 游戏引擎检查B | 故事、案例、挑战、生存、Boss | 引擎B bug报告 |
| 7 | Inspector_Engine_3 | 游戏引擎检查C | PK、速答、记忆、每日、音乐、扭蛋 | 引擎C bug报告 |
| 8 | Inspector_SW | Service Worker | sw.js、缓存策略、版本更新、离线可用 | SW问题报告 |
| 9 | Inspector_Storage | 本地存储 | LocalStorage、数据持久化、导入导出 | 数据问题报告 |
| 10 | Inspector_WebBridge | WebBridge测试 | 使用WebBridge打开页面、点击所有按钮、截图 | 交互测试报告 |

### 阶段2：修复执行（10个Agent并行）
根据阶段1报告，分配修复任务。每个agent负责修复一类问题。

| # | Agent名称 | 职责 | 修复范围 | 输入 |
|---|-----------|------|----------|------|
| 11 | Fixer_HTML | HTML修复 | 修复页面结构、容器嵌套、script顺序 | Inspector_HTML报告 |
| 12 | Fixer_CSS | CSS修复 | 修复样式冲突、z-index、pointer-events | Inspector_CSS报告 |
| 13 | Fixer_GameCore | 核心引擎修复 | 修复game.js导航、_refreshPage、引擎调用 | Inspector_GameCore报告 |
| 14 | Fixer_Menu | 菜单修复 | 修复菜单按钮、data-nav、事件绑定 | Inspector_Menu报告 |
| 15 | Fixer_Engine_1 | 引擎修复A | 修复盲盒、卡牌、答题、擂台引擎 | Inspector_Engine_1报告 |
| 16 | Fixer_Engine_2 | 引擎修复B | 修复故事、案例、挑战、生存引擎 | Inspector_Engine_2报告 |
| 17 | Fixer_Engine_3 | 引擎修复C | 修复PK、速答、记忆、每日引擎 | Inspector_Engine_3报告 |
| 18 | Fixer_SW | SW修复 | 修复缓存策略、版本更新逻辑 | Inspector_SW报告 |
| 19 | Fixer_Storage | 存储修复 | 修复数据持久化、导入导出 | Inspector_Storage报告 |
| 20 | Fixer_WebBridge | WebBridge修复 | 根据WebBridge测试修复交互问题 | Inspector_WebBridge报告 |

### 阶段3：优化提升（5个Agent并行）

| # | Agent名称 | 职责 | 优化范围 | 输出 |
|---|-----------|------|----------|------|
| 21 | Optimizer_Performance | 性能优化 | 懒加载、代码分割、减少重绘、图片优化 | 性能优化报告 |
| 22 | Optimizer_Visual | 视觉优化 | 动画流畅度、过渡效果、响应式适配、字体加载 | 视觉优化报告 |
| 23 | Optimizer_Code | 代码重构 | 重复代码提取、模块化、命名规范、注释 | 重构报告 |
| 24 | Optimizer_Accessibility | 无障碍优化 | ARIA标签、键盘导航、屏幕阅读器、高对比度 | 无障碍报告 |
| 25 | Optimizer_Mobile | 移动端优化 | 触摸反馈、手势支持、视口适配、虚拟键盘 | 移动端报告 |

### 阶段4：验证确认（5个Agent并行）

| # | Agent名称 | 职责 | 验证范围 | 输出 |
|---|-----------|------|----------|------|
| 26 | Verifier_HTML | HTML验证 | 验证所有页面结构修复 | 验证报告 |
| 27 | Verifier_CSS | CSS验证 | 验证所有样式修复 | 验证报告 |
| 28 | Verifier_JS | JS验证 | 验证所有JS修复，语法检查 | 验证报告 |
| 29 | Verifier_Functional | 功能验证 | 使用WebBridge测试所有功能按钮 | 功能验证报告 |
| 30 | Verifier_Integration | 集成验证 | 端到端测试，完整游戏流程 | 集成验证报告 |

## 执行规则

1. **阶段隔离**：每阶段完成后，主agent汇总报告，确认问题已修复，再进入下一阶段
2. **报告传递**：每阶段输出写入 `reports/` 目录，下一阶段agent读取对应报告
3. **GitHub推送**：每完成一个阶段，推送新版本到GitHub
4. **版本递增**：每阶段结束，版本号+1（v50 → v51 → v52 → v53 → v54）

## 报告格式

每个agent输出必须包含：
```
## Agent: [名称]
## 检查/修复/优化范围: [描述]
## 状态: [✅完成 / ⚠️部分完成 / ❌失败]
## 发现的问题:
1. [问题描述] - 位置: [文件:行号] - 优先级: [🔴致命/🟡警告/🟢建议]
## 修复内容:
1. [修复描述] - 文件: [文件名]
## 验证结果:
- [验证项]: [通过/失败]
## 遗留问题:
- [如有]
```

## 关键注意事项
- 所有修改必须基于实际文件内容，不要假设
- 修复前必须Read文件，确认old_string存在
- 修复后必须语法检查（node -c）
- 版本号必须同步更新（index.html + sw.js）
- 所有文件路径使用绝对路径

## 技能加载
- 阶段1: 无需加载技能
- 阶段2: 无需加载技能
- 阶段3: 可加载 theme-factory 进行视觉优化
- 阶段4: 无需加载技能
- 最终: 加载 docx 技能输出报告文档（可选）
