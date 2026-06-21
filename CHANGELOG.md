# 📋 更新日志

本项目所有显著变更均记录于此。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，并遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.3.1] - 2026-06-21

### 修复

- 修复 **Certificate.show()** playerName 直接拼接 innerHTML 导致的 XSS 漏洞（转义后插入）
- 修复 **PKEngine** pkResultPlayers innerHTML 模板中 p1Name/p2Name 未转义的 XSS 漏洞（新增 `_h()` HTML 转义函数）
- 修复 **DiaryEngine.render()** e.text 用户日记内容未转义的存储型 XSS 漏洞
- 修复 **LeaderboardEngine.render()** entry.name 排行榜玩家名称未转义的存储型 XSS 漏洞
- 修复 **index.html** 引用不存在的 `shuffle-fix.js` 文件（404 错误）
- 修复 **index.html** 4 处 inline onclick 未检查引擎全局变量是否存在（`typeof TimeEscapeEngine !== 'undefined'` / `typeof ReactionEngine !== 'undefined'`）
- 版本统一：所有资源从 `?v=62` 升级至 `?v=63`，Service Worker 缓存名更新至 `yingji-xiaodaren-v63`

### 内部迭代

| v63 | 1.3.1 | 安全修复：Critical XSS + High inline onclick + 404 清理 |

---

## [1.3.0] - 2026-06-21

### ✨ 新增

- 新增 **PWA 支持**：支持添加到主屏幕、离线运行（Service Worker）
- 新增 **critical.css**：首屏关键 CSS 内联，提升首屏加载速度
- 新增 **CSS 变量系统**：统一色彩、间距、字体层级管理
- 新增 **引擎运行时补丁**：修复引擎切换时的状态残留问题
- 新增 **性能监控**：FPS 监控、内存泄漏检测、自动降级策略
- 新增 **html-escape.js**：统一 XSS 防护工具函数
- 新增 **engine-cleanup.js**：定时器统一清理工具

### 🔧 修复

- 修复 **Service Worker** `cache.addAll()` 安装失败问题（逐资源容错）
- 修复 **8 处引擎定时器泄漏**：QuizEngine、PKEngine、KnowledgeRaceEngine、TimeEscapeEngine、TimedChallengeEngine、MemoryCardEngine、DisasterQuizGame、ReactionGameV2
- 修复 **8 处洗牌算法分布不均**：统一替换为 Fisher-Yates 洗牌
- 修复 **PKEngine 与 ai-tutor** 两处 XSS 漏洞（innerHTML 注入）
- 修复 `allEngines` 数组中 `TimeEscapeEngine` 和 `PrecisionEngine` 重复引用
- 修复 `wrong-book.js` `document.write` + `window.open` XSS 风险（HTML 转义）
- 修复多处 `parseInt` 缺少 radix 参数问题

### 🎨 优化

- 优化 CSS 架构：提取关键样式、优化选择器性能、减少重排重绘
- 优化代码质量：提取公共工具函数（`utils-enhanced.js`）、减少 86% 的 `getElementById` 调用
- 优化魔法数字：提取为 `CONSTANTS` 常量对象
- 优化 JSDoc 注释：前 22 个引擎添加完整类型注释
- 优化 `.gitignore`：排除开发文件和缓存文件
- 优化资源版本控制：从 v56 升级至 v57，强制 CDN 刷新

### ♿ 无障碍

- 增强 ARIA 标签覆盖
- 优化键盘导航体验
- 提升高对比度模式兼容性

---

## [1.2.0] - 2026-06-06

### ✨ 新增

- 新增 **AI 智能导师**：12 维雷达图 + 智能诊断 + 对话终端 + 推荐练习
- 新增 **能力认证体系**：5 级认证 + Canvas 证书 + 进度环 + 升级弹窗
- 新增 **灾害情景沉浸模拟**：4 种灾害 Canvas 动画 + 真实决策 + 粒子系统
- 新增 **真实案例还原**：5 个历史事件（汶川、河南暴雨、玉树、凉山、桑美）+ 时间线 + 三阶段流程
- 新增 **错题本引擎**：自动收集错题 + 专项复习模式
- 新增 **学习报告导出**：Canvas 渲染 + PNG 下载 + 打印支持
- 新增 **语音播报引擎**：Web Speech API 朗读知识点
- 新增 **品牌加载动画**：3 秒品牌展示加载页
- 新增 **无障碍支持**：ARIA 标签 + 键盘导航 + 高对比度模式
- 新增 **性能优化引擎**：帧率限制 + 后台暂停 + 自动降级策略
- 新增 **i18n 国际化框架**：多语言支持基础架构
- 新增 **BGM 增强引擎**：混响效果 + 和弦进行
- 新增 **12 种增强音效**：覆盖交互、反馈、成就等场景
- 新增 **分享功能**：学习成果分享 + 社交媒体集成
- 新增 ** liquid-glass 特效**：流体玻璃视觉风格
- 新增 **tilt3d 效果**：3D 倾斜交互
- 新增 **settings 系统**：音量、动画、难度、语言偏好设置

### 🎨 优化

- 优化深空背景系统：6 层渐变 + 光球 + 网格
- 优化 8 层 CSS 特效系统：光尘 / 扫描 / 脉冲 / 流星
- 优化音频系统：步进音序器 + 混响 + 和弦进行
- 优化移动端适配：响应式布局 + 触摸优化
- 优化加载性能：资源预加载 + 懒加载 + 压缩
- 优化内存使用：图片懒加载 + 引擎按需初始化

---

## [1.1.0] - 2026-06-05

### ✨ 新增

- 初版发布，包含 32 种游戏模式
- 学习中心：开盲盒、签到、学习、急救、防灾馆、宠物、日记、卡牌工坊、百科、引导
- 闯关挑战：大擂台、速答、双人 PK、生存、Boss Rush、故事模式等 21 种模式
- 369 张知识卡牌，覆盖 12 类自然灾害
- 34 个情景场景，12 类灾害分类
- 基础排行榜系统
- 基础成就系统
- 金币与道具系统
- 卡牌升级、合成、碎片系统
- 深空背景视觉效果
- 基础 BGM 和音效系统
- 基础动画系统（淡入淡出、滑动、缩放）

---

## [1.0.0] - 2026-05-28

### ✨ 新增

- 项目原型开发，基础框架搭建
- 核心引擎架构设计（GameState、PageManager、Modal、AudioManager）
- 卡牌数据结构设计（cards.js）
- 场景数据结构设计（scenarios.js）
- 基础 HTML 页面结构
- 基础 CSS 样式系统
- 基础 JavaScript 游戏逻辑
- 基础答题引擎（QuizEngine）
- 基础对战引擎（BattleEngine）
- 基础盲盒引擎（BlindBoxEngine）
- 基础签到引擎（CheckinEngine）

---

## 版本对比

| 版本 | 发布日期 | 引擎数 | 卡牌数 | 场景数 | 游戏模式 | 关键特性 |
|------|----------|--------|--------|--------|----------|----------|
| 1.0.0 | 2026-05-28 | 10 | 200+ | 20 | 5 | 原型框架 |
| 1.1.0 | 2026-06-05 | 32 | 369 | 34 | 32 | 初版完整功能 |
| 1.2.0 | 2026-06-06 | 50+ | 369 | 34 | 32 | AI导师、认证、模拟、案例 |
| 1.3.0 | 2026-06-21 | 57 | 369 | 34 | 32 | PWA、性能优化、安全修复 |

---

## 内部迭代记录

以下为开发过程中的内部迭代编号，已合并至上述正式版本中：

| 内部版本 | 对应正式版本 | 说明 |
|----------|--------------|------|
| v51 | 1.2.x | 第一轮关键 Bug 修复 |
| v52 | 1.2.x | 第二轮 Bug 修复 |
| v53 | 1.2.x | 第三轮 Bug 修复 |
| v54 | 1.2.x | 第四轮 Bug 修复 |
| v55 | 1.2.x | 全面 Bug 检查与修复 |
| v56 | 1.3.0 | parseInt radix 修复 + 资源版本升级 |
| v57 | 1.3.0 | XSS 补丁 + UI 优化 |
| v58 | 1.3.0 | 全面优化（UI + 代码 + AI + 内容）|
| v59 | 1.3.0 | 清理 + critical.css + preload + gitignore |
| v60 | 1.3.0 | 整合所有优化文件到 index.html |
| v61 | 1.3.0 | 引擎运行时优化补丁 |
| v62 | 1.3.0 | 仓库清理 + 版本统一 + Bug 修复 |
| v63 | 1.3.1 | 安全修复：Critical XSS + High inline onclick + 404 清理 |

---

[1.3.0]: https://github.com/yaohanbo1-hue/yingji-xiaodaren/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/yaohanbo1-hue/yingji-xiaodaren/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/yaohanbo1-hue/yingji-xiaodaren/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yaohanbo1-hue/yingji-xiaodaren/releases/tag/v1.0.0
