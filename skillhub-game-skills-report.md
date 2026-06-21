# SkillHub 游戏开发相关 Skills 调研报告

> **调研说明**：由于 Kimi WebBridge 浏览器扩展未连接（`no extension connected`），本次调研通过 `kimi_search_v2`（站内搜索）和 `kimi_fetch_v2`（页面抓取）完成对 https://skillhub.cn/ 的数据收集。所有信息均来自实时检索结果。

---

## 一、搜索方法概述

| 搜索关键词 | 检索方式 |
|-----------|---------|
| `site:skillhub.cn 游戏` | kimi_search_v2 |
| `site:skillhub.cn game` | kimi_search_v2 |
| `site:skillhub.cn 网页游戏` | kimi_search_v2 |
| `site:skillhub.cn 互动` | kimi_search_v2 |
| `site:skillhub.cn 教育游戏` | kimi_search_v2 |
| `site:skillhub.cn 桌游` | kimi_search_v2 |
| `site:skillhub.cn Phaser Canvas WebGL` | kimi_search_v2 |
| 直接抓取 `/skills/game-engine` | kimi_fetch_v2 |
| 直接抓取 `/skills/the-27th-hour` | kimi_fetch_v2 |
| 直接抓取 `/skills/play-heartclaws` | kimi_fetch_v2 |

---

## 二、找到的所有游戏相关 Skills（共 6 个）

### 1. Game Engine ⭐ 最推荐（直接相关）

| 字段 | 内容 |
|-----|------|
| **名称** | Game Engine |
| **链接** | https://skillhub.cn/skills/game-engine |
| **描述** | 使用 HTML5 Canvas、WebGL 和 JavaScript 构建基于 Web 的游戏和游戏引擎。包含入门模板、参考文档以及使用 **Phaser、Three.js、Babylon.js 和 A-Frame** 等框架进行 2D/3D 游戏开发。支持实现游戏循环、物理、碰撞检测、渲染、游戏控制（键盘、鼠标、触摸、手柄）。 |
| **下载量** | 1.6 千 |
| **收藏** | 3 |
| **AI 评分** | 4.4 / 5.0 |
| **安全检测** | 科恩实验室安全 / 云鼎实验室安全 |
| **来源** | ClawHub（作者 jhauga） |
| **相关度** | ⭐⭐⭐⭐⭐ 直接相关 — 专用于网页游戏开发，技术栈完全匹配「应急小达人」的 HTML5 + JS + Canvas 架构 |

---

### 2. 第 27 小时 — AI Agent 的赛博自留地 ⭐ 高度推荐

| 字段 | 内容 |
|-----|------|
| **名称** | 第 27 小时（the-27th-hour） |
| **链接** | https://skillhub.cn/skills/the-27th-hour |
| **描述** | 一个为 AI Agent 设计的《行动代号》**线上桌游平台**，提供 **网页游戏大厅 + RESTful API + AI Agent Skill**，让 Agent 和人类可以在同一局游戏中对战。人类围观地址：https://the-27th-hour.spacekid.me/ |
| **下载量** | 113 |
| **收藏** | 1 |
| **AI 评分** | 4.5 / 5.0 |
| **安全检测** | 通过 |
| **来源** | SkillHub |
| **相关度** | ⭐⭐⭐⭐⭐ 高度相关 — 提供了完整的「网页游戏 + AI Agent 对战」架构参考，与「应急小达人」的"互动游戏 + AI 模块"设计理念高度一致 |

---

### 3. Play Heartclaws ⭐ 中度推荐

| 字段 | 内容 |
|-----|------|
| **名称** | Play Heartclaws |
| **链接** | https://skillhub.cn/skills/play-heartclaws |
| **描述** | 玩 **HeartClaws** —— 一款无界面 AI 策略游戏。通过 **REST API** 连接，进行策略推理并提交行动。支持两种模式：双人对战（对抗 AI）或持久模式。 |
| **下载量** | 603 |
| **收藏** | 0 |
| **AI 评分** | 4.3 / 5.0 |
| **安全检测** | 通过 |
| **来源** | Clawhub |
| **相关度** | ⭐⭐⭐⭐ 中度相关 — 展示了"AI Agent 通过 API 玩游戏"的架构模式，可作为「应急小达人」AI 对战/协作模块的参考 |

---

### 4. TRAE 指挥官（trae-orchestrator）

| 字段 | 内容 |
|-----|------|
| **名称** | TRAE 指挥官 |
| **链接** | https://skillhub.cn/skills/trae-orchestrator |
| **描述** | 编排 TRAE IDE 进行自动化软件开发，支持多智能体协作。示例中展示了用自然语言描述创建 **多人联机 3D 篝火游戏**（3D 星空场景 + 多人联机 + 聊天系统）。 |
| **下载量** | 682 |
| **收藏** | 2 |
| **AI 评分** | 4.4 / 5.0 |
| **安全检测** | 通过 |
| **来源** | ClawHub（作者 vichard998） |
| **相关度** | ⭐⭐⭐ 参考相关 — 展示了一个"用 AI 编排快速生成多人联机游戏"的案例，可作为「应急小达人」扩展多人联机模式时的参考 |

---

### 5. 全面测试用例编写器（functional-use-cases）

| 字段 | 内容 |
|-----|------|
| **名称** | 全面测试用例编写器 |
| **链接** | https://skillhub.cn/skills/functional-use-cases |
| **描述** | 全面测试用例编写和优化技能。覆盖功能、性能、安全、易用性、界面、兼容性、异常场景等测试维度。**特别适用于游戏测试场景**，包括《原神》、《崩坏：星穹铁道》等米哈游游戏的玩法、平衡性、角色技能、道具系统、多人联机、付费系统等测试。 |
| **下载量** | 625 |
| **收藏** | 4 |
| **AI 评分** | 4.3 / 5.0 |
| **安全检测** | 通过 |
| **来源** | SkillHub |
| **相关度** | ⭐⭐⭐ 辅助相关 — 可用于「应急小达人」的测试用例编写，确保游戏各模块（问答引擎、灾害场景、得分系统）质量稳定 |

---

### 6. UAPI 查询 MC 服务器（uapi-get-game-minecraft-serverstatus）

| 字段 | 内容 |
|-----|------|
| **名称** | UAPI 查询 MC 服务器接口 |
| **链接** | https://skillhub.cn/skills/uapi-get-game-minecraft-serverstatus |
| **描述** | 使用 UAPI 的"查询 MC 服务器"单接口 skill，处理查询 Minecraft 服务器状态、MC 服务器状态等请求。 |
| **下载量** | 564 |
| **收藏** | 0 |
| **AI 评分** | 4.5 / 5.0 |
| **安全检测** | 通过 |
| **来源** | Clawhub |
| **相关度** | ⭐⭐ 弱相关 — 仅适用于 Minecraft 服务器查询，与「应急小达人」当前架构关联不大 |

---

## 三、Top 3 最推荐技能

| 排名 | 技能名称 | 推荐理由 | 适用场景 |
|-----|---------|---------|---------|
| 🥇 | **Game Engine** | 技术栈完全匹配（HTML5 + Canvas + JS + Phaser），直接可用于构建和优化「应急小达人」的游戏引擎、物理碰撞、渲染和交互控制 | 游戏核心开发、引擎优化、新增游戏模式 |
| 🥈 | **第 27 小时** | 提供了"网页游戏大厅 + AI Agent 对战"的完整架构，与「应急小达人」的"防灾教育 + AI 互动"理念高度契合 | 设计 AI 对战模块、多人联机架构、Agent 交互机制 |
| 🥉 | **Play Heartclaws** | 展示了"AI Agent 通过 REST API 玩游戏"的成熟模式，可为 AI 模块的接口设计提供参考 | AI 模块 API 设计、策略推理算法、人机对战逻辑 |

---

## 四、SkillHub 技能安装方法

所有 SkillHub 上的技能均通过以下方式安装：

### 步骤 1：安装 SkillHub CLI

```bash
# 根据官方文档安装 SkillHub 商店（仅 CLI）
# 文档地址：https://skillhub.cn/install/skillhub.md
```

### 步骤 2：安装具体技能

以安装 **Game Engine** 为例：

```bash
# 将以下提示词发送给你的 AI 代理：
# "请先检查是否已安装 SkillHub 商店，若未安装，请根据 https://skillhub.cn/install/skillhub.md 
#  安装 SkillHub 商店，但是只安装 CLI，然后安装 game-engine 技能。若已安装，则直接安装 game-engine 技能。"
```

或在已安装 CLI 后，直接命令：

```bash
skillhub install game-engine
skillhub install the-27th-hour
skillhub install play-heartclaws
skillhub install functional-use-cases
```

### 步骤 3：验证安装

安装完成后，在 AI 对话中可以通过 `@skill://game-engine` 或 `使用 game-engine 技能` 来调用。

---

## 五、对「应急小达人」项目的建议

1. **立即安装 `Game Engine`** — 该技能包含 Phaser.js 框架的最佳实践，可直接用于优化当前项目的 Canvas 渲染、游戏循环和触摸交互。

2. **参考 `第 27 小时` 的架构** — 如果计划扩展"AI 防灾助手"或"多人联机对战"功能，该技能提供的"网页游戏大厅 + REST API + Agent"架构是极佳的参考。

3. **引入 `functional-use-cases` 进行测试** — 在项目 v50+ 迭代中，可使用该技能生成全面的测试用例，覆盖问答引擎、灾害场景模拟、得分系统等核心模块。

---

> **报告生成时间**：基于 2026-06-21 的实时检索数据
> **数据来源**：SkillHub (https://skillhub.cn/) 公开页面
> **检索工具**：kimi_search_v2 + kimi_fetch_v2
