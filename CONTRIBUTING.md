# 🤝 贡献指南

感谢你对应急小达人项目的关注！本项目是一个面向中小学生的防灾教育互动游戏，我们欢迎所有形式的贡献。

---

## 📋 目录

- [如何贡献](#如何贡献)
- [开发环境](#开发环境)
- [提交规范](#提交规范)
- [代码风格](#代码风格)
- [测试要求](#测试要求)
- [内容规范](#内容规范)
- [报告问题](#报告问题)
- [联系方式](#联系方式)

---

## 如何贡献

### 你可以做这些

| 贡献类型 | 说明 | 示例 |
|----------|------|------|
| 🐛 Bug 修复 | 修复代码或内容错误 | 修复题目答案错误、修复 UI 显示问题 |
| ✨ 新功能 | 添加新的游戏模式或功能 | 新增灾害类型、新增游戏模式 |
| 📝 内容完善 | 修正或补充知识内容 | 修正题目解析、补充灾害知识 |
| 🎨 UI 优化 | 改进视觉设计或交互 | 优化动画效果、改进移动端适配 |
| 🔊 音频资源 | 补充音效或背景音乐 | 添加新的交互音效 |
| 🌐 翻译 | 添加多语言支持 | 添加英文版、繁体中文版 |
| 📖 文档 | 改进项目文档 | 完善 README、添加教程 |

### 贡献流程

```
1. Fork 本仓库
2. 创建你的功能分支 (git checkout -b feature/你的功能)
3. 提交你的更改 (git commit -m 'feat: 添加某功能')
4. 推送到分支 (git push origin feature/你的功能)
5. 创建 Pull Request
```

---

## 开发环境

### 要求

- **操作系统**：Windows / macOS / Linux 均可
- **浏览器**：Chrome 90+（推荐）
- **编辑器**：任意文本编辑器（推荐 VS Code）
- **Git**：2.30+

### 本地开发

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/你的用户名/yingji-xiaodaren.git
cd yingji-xiaodaren

# 2. 直接打开 index.html（方式一）
# 双击 index.html 即可在浏览器中打开

# 3. 或使用本地服务器（方式二，推荐）
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# 然后访问 http://localhost:8000
```

> 💡 **提示**：由于本项目是纯静态网页，无需安装任何依赖或构建工具。

---

## 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (type)

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 新增地震模拟动画` |
| `fix` | Bug 修复 | `fix: 修复错题本打印 XSS 漏洞` |
| `docs` | 文档更新 | `docs: 更新 README 部署说明` |
| `style` | 样式调整（不影响功能） | `style: 优化按钮圆角` |
| `refactor` | 代码重构 | `refactor: 提取公共工具函数` |
| `perf` | 性能优化 | `perf: 减少 DOM 查询次数` |
| `test` | 测试相关 | `test: 添加洗牌算法单元测试` |
| `chore` | 构建/工具相关 | `chore: 更新 .gitignore` |
| `content` | 知识内容更新 | `content: 修正洪水自救知识点` |

### 范围 (scope)

可选，标识影响的模块：

- `engine` — 游戏引擎
- `ui` — 用户界面
- `css` — 样式表
- `audio` — 音频系统
- `content` — 知识内容（卡牌、场景、题目）
- `docs` — 文档
- `sw` — Service Worker
- `ai` — AI 导师模块

### 示例

```
feat(engine): 新增泥石流灾害模拟场景

- 添加泥石流 Canvas 动画
- 添加 3 个决策分支
- 添加 5 道相关题目

Closes #42
```

---

## 代码风格

### JavaScript

- 使用 **2 空格** 缩进
- 使用 **单引号** 字符串（`'`）
- 语句末尾 **加分号**
- 优先使用 `const`，需要重赋值时用 `let`，避免 `var`
- 函数使用 **箭头函数** 或 **方法简写**
- 添加 JSDoc 注释说明函数用途和参数

**正确示例：**

```javascript
/**
 * 按难度选择卡牌
 * @param {number} count 需要的卡牌数量
 * @returns {Object[]} 选中的卡牌数组
 */
function selectCards(count) {
  const cards = getKnowledgeCards();
  const shuffled = shuffleArray(cards);
  return shuffled.slice(0, count);
}

// 常量使用全大写
const MAX_LEVEL = 999;
const DEFAULT_TIME_LIMIT = 15;
```

**错误示例：**

```javascript
function selectCards(count){  // 缺少空格
  var cards=getKnowledgeCards();  // 使用 var，缺少空格
  return cards.sort(()=>Math.random()-0.5).slice(0,count);  // 不安全的洗牌
}
```

### CSS

- 使用 **2 空格** 缩进
- 选择器使用 **小写 kebab-case**
- 属性按 **字母顺序** 或 **逻辑分组** 排列
- 使用 CSS 变量管理颜色和间距

```css
/* 正确 */
.quiz-option {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  color: var(--color-text-primary);
  padding: 12px 16px;
  transition: background-color 0.2s ease;
}

/* 错误 */
.quizOption {  /* 使用驼峰命名 */
  padding:12px 16px;  /* 缺少空格 */
  background-color:#fff;  /* 缺少空格 */
}
```

### HTML

- 使用 **2 空格** 缩进
- 属性使用 **双引号**
- 语义化标签（`header`、`main`、`section`、`footer`）
- 添加 ARIA 标签提升无障碍性

---

## 测试要求

### 手动测试清单

提交 PR 前，请确认以下项目：

- [ ] 游戏能在 Chrome 中正常加载和运行
- [ ] 移动端（iOS Safari / Android Chrome）显示正常
- [ ] 修改的功能在桌面端和移动端都能正常工作
- [ ] 没有新的控制台报错或警告
- [ ] 修改的知识内容经过事实核查
- [ ] 没有引入新的 XSS 或安全漏洞

### 性能检查

- [ ] 首屏加载时间没有明显变慢
- [ ] 切换页面/模式没有明显卡顿
- [ ] 内存使用没有异常增长（可通过 Chrome DevTools 检查）

---

## 内容规范

### 知识内容（卡牌、题目、场景）

- **准确性**：所有防灾知识必须来自权威来源（如应急管理部、中国地震局、气象局等）
- **适龄性**：语言适合中小学生理解，避免过于专业的术语
- **实用性**：强调可操作的自救互救技能
- **中立性**：客观描述灾害，避免引发恐慌
- **引用来源**：新增知识点请标注参考来源

### 内容审核清单

- [ ] 题目答案经过交叉验证（至少 2 个权威来源）
- [ ] 解析清晰、易懂，适合中小学生阅读
- [ ] 没有政治敏感或不当内容
- [ ] 没有可能引起误解或恐慌的表述

---

## 报告问题

### 提交 Bug

使用 [Bug 报告模板](https://github.com/yaohanbo1-hue/yingji-xiaodaren/issues/new?template=bug_report.md) 创建 Issue，包含：

- 问题描述
- 复现步骤
- 期望行为 vs 实际行为
- 环境信息（浏览器、操作系统、设备）
- 截图（如有）

### 提交功能建议

使用 [功能请求模板](https://github.com/yaohanbo1-hue/yingji-xiaodaren/issues/new?template=feature_request.md) 创建 Issue，包含：

- 功能描述
- 使用场景
- 预期收益
- 实现思路（可选）

---

## 联系方式

- 📧 项目 Issues：[GitHub Issues](https://github.com/yaohanbo1-hue/yingji-xiaodaren/issues)
- 🌐 在线体验：[GitHub Pages](https://yaohanbo1-hue.github.io/yingji-xiaodaren/)

---

<p align="center">
  感谢你的贡献！每一行代码、每一道题目，都在让防灾知识触达更多孩子。 🌟
</p>
