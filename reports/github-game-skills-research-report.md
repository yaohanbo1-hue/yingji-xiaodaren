# GitHub Agent Skills 游戏开发调研报告

> 调研日期：2026-06-18
> 调研范围：GitHub 上公开的游戏开发 / 网页游戏 / 教育游戏 / 游戏设计 / 游戏引擎相关 Agent Skills
> 目标项目匹配：「应急小达人」—— 防灾教育互动网页游戏（GitHub Pages 部署，HTML/CSS/JS）

---

## 一、调研概述

通过 9 组关键词搜索（覆盖 `kimi skill game`、`agent skill game development`、`browser game`、`educational game`、`game design` 等），在 GitHub 上共发现 **17 个**与游戏开发相关的开源 Agent Skills。这些技能主要面向 Claude Code、Codex、Kimi Code CLI 等 Agent 平台，以 `SKILL.md` 文件形式提供可复用的工作流指导。

**核心发现**：
- 专门针对"教育游戏"或"防灾教育"的 Agent Skill **几乎为零**。
- 最相关的技能集中在 **通用游戏设计原则**、**网页游戏开发**、**游戏美术管道** 和 **项目管理** 四个方向。
- 大部分技能是英文社区维护，中文游戏技能极为稀缺。

---

## 二、全部相关技能评估表

| # | 技能名称 | 仓库链接 | Stars | 最后更新 | 描述 | 匹配度 |
|---|---------|---------|-------|---------|------|-------|
| 1 | **game-dev-skills** | [Yuki001/game-dev-skills](https://github.com/Yuki001/game-dev-skills) | ~20+ | 2026-01 | 含 game-architect（架构设计）、game-agent-team（Agent团队协作）、animation-shader（二次元着色器）、gpt-image（AI画图） | ⭐⭐⭐⭐⭐ |
| 2 | **game-design (agent-skills-hub)** | [agent-skills-hub/agent-skills-hub](https://github.com/agent-skills-hub/agent-skills-hub) | ~50+ | 2026-02 | 游戏设计原则：核心循环、GDD、玩家心理学、难度平衡、进度设计、反模式 | ⭐⭐⭐⭐⭐ |
| 3 | **threejs-game-skills** | [majidmanzarpour/threejs-game-skills](https://github.com/majidmanzarpour/threejs-game-skills) | ~100+ | 2026-06 | Three.js 浏览器游戏技能集：gameplay、图形、UI、QA、音频、AI资产生成，含 Vite+TS 脚手架 | ⭐⭐⭐⭐ |
| 4 | **ai-game-art-pipeline-skill** | [ybuild-ai/ai-game-art-pipeline-skill](https://github.com/ybuild-ai/ai-game-art-pipeline-skill) | ~80+ | 2026-05 | AI游戏美术管道：精灵图、图标、背景、视频转帧动画、运行时质量检查 | ⭐⭐⭐⭐ |
| 5 | **air-game-dev-pm-skill** | [Sttrevens/air-game-dev-pm-skill](https://github.com/Sttrevens/air-game-dev-pm-skill) | ~30+ | 2026-05 | 游戏开发项目管理：Experience→Mainstay→Feature→Level→Task→Iter 分层结构 | ⭐⭐⭐⭐ |
| 6 | **claude-code-game-development** | [HermeticOrmus/claude-code-game-development](https://github.com/HermeticOrmus/claude-code-game-development) | ~200+ | 2026-01 | 游戏开发模式大全：游戏循环、碰撞检测、物理、动画、AI寻路、网络、ECS、性能优化 | ⭐⭐⭐ |
| 7 | **learn-claude-skills** | [Koushik1161/learn-claude-skills](https://github.com/Koushik1161/learn-claude-skills) | ~15+ | 2025-12 | **本身就是教育互动游戏！** 用 Phaser 3 做教室场景，教玩家学习 Claude Skills，含测验机制 | ⭐⭐⭐⭐ |
| 8 | **game-developer-skill** | [majiayu000/claude-skill-registry](https://github.com/majiayu000/claude-skill-registry) | ~10+ | 2026-01 | 通用游戏开发专家：Unity/Unreal/Godot，2D/3D，网络，VR/AR，关卡设计 | ⭐⭐⭐ |
| 9 | **claude-skills-threejs-ecs-ts** | [Nice-Wolf-Studio/claude-skills-threejs-ecs-ts](https://github.com/Nice-Wolf-Studio/claude-skills-threejs-ecs-ts) | ~25+ | 2025-10 | Three.js + ECS + TypeScript 游戏技能：移动优化、React Three Fiber、输入系统 | ⭐⭐⭐ |
| 10 | **pyxel-skill** | [kitao/pyxel-skill](https://github.com/kitao/pyxel-skill) | ~40+ | 2026-03 | Pyxel 复古游戏引擎技能：8-bit风格、chiptune音乐，含 pyxel-mcp 调试工具 | ⭐⭐ |
| 11 | **agent-skill-rpg-game-demo** | [mave99a/agent-skill-rpg-game-demo](https://github.com/mave99a/agent-skill-rpg-game-demo) | 2 | 2026-01 | RPG 多角色 Agent Skill 演示：用 AIGNE CLI 运行互动叙事游戏，每轮给玩家选择 | ⭐⭐⭐ |
| 12 | **roblox-game-skill** | [brockmartin/roblox-game-skill](https://github.com/brockmartin/roblox-game-skill) | ~50+ | 2026-03 | Roblox/Luau 游戏开发：宠物模拟器、数据存储、商店系统、GamePass | ⭐⭐ |
| 13 | **claude-sbox** | [gavogavogavo/claude-sbox](https://github.com/gavogavogavo/claude-sbox) | ~30+ | 2026-04 | s&box (Source 2) 游戏开发：C#组件、Razor UI、物理、网络 | ⭐ |
| 14 | **fs25-claude-skill** | [70th-starter999/fs25-claude-skill](https://github.com/70th-starter999/fs25-claude-skill) | ~15+ | 2026-04 | Farming Simulator 25 Mod 开发：Lua/Giants Engine | ⭐ |
| 15 | **solana-game-skill** | [solanabr/solana-game-skill](https://github.com/solanabr/solana-game-skill) | ~10+ | 2026-01 | Solana 区块链游戏：Unity SDK、NFT、钱包、链上状态 | ⭐ |
| 16 | **mud-agent** | [onlyfeng/mud-agent](https://github.com/onlyfeng/mud-agent) | ~5+ | 2026-03 | MUD 文字游戏 Agent：OpenClaw 插件，自动探索/战斗/决策 | ⭐⭐ |
| 17 | **unity-game-ugui-design** | [majiayu000/claude-skill-registry](https://github.com/majiayu000/claude-skill-registry) | ~10+ | 2026-01 | Unity UGUI 设计技能：移动端UI、SafeArea、Canvas 布局 | ⭐ |

---

## 三、Top 3 推荐技能（与「应急小达人」最匹配）

### 🥇 第一名：game-design（agent-skills-hub）⭐⭐⭐⭐⭐

- **链接**：https://github.com/agent-skills-hub/agent-skills-hub/blob/main/skills/game-development/game-design/SKILL.md
- **Stars**：~50+
- **为什么推荐**：
  - 提供**教育游戏最需要的核心设计框架**：核心循环（30秒测试）、GDD结构、玩家动机心理学（Achiever/Explorer/Socializer/Killer）、奖励机制、难度平衡、进度设计。
  - 「应急小达人」作为**教育游戏**，需要让玩家在"学习防灾知识"和"获得游戏成就感"之间找到平衡。此技能中的 **Flow State 设计**、**难度平衡策略**、**进度节奏** 直接适用。
  - 包含**反模式清单**：避免过度惩罚、强制单一玩法等，对 Quiz 类互动游戏尤其重要。
- **适用场景**：优化游戏设计文档、平衡答题难度曲线、设计成就系统、规划关卡进度。

### 🥈 第二名：game-dev-skills（Yuki001）⭐⭐⭐⭐⭐

- **链接**：https://github.com/Yuki001/game-dev-skills
- **Stars**：~20+
- **为什么推荐**：
  - 包含 **`game-architect`**：全面的游戏项目架构指南、需求分析与逻辑设计。对于「应急小达人」的模块划分（灾害选择→知识学习→Quiz→评分）有直接帮助。
  - 包含 **`game-agent-team`**：以文档驱动的极简工作流（设计→里程碑→计划→实现），含四个角色和五个技能。这与当前项目使用多 Agent 协作开发的模式高度契合。
  - 包含 **`animation-shader`** 和 **`gpt-image`**：可用于生成灾害场景图标、视觉特效素材。
- **适用场景**：重构游戏架构、规划多 Agent 协作开发流程、生成游戏美术素材。

### 🥉 第三名：air-game-dev-pm-skill（Sttrevens）⭐⭐⭐⭐

- **链接**：https://github.com/Sttrevens/air-game-dev-pm-skill
- **Stars**：~30+
- **为什么推荐**：
  - 提供**分层项目管理词汇**：Experience → Mainstay → Feature → Level(L1概念/L2原型/L3实现/L4打磨) → Task → Iter。
  - 「应急小达人」目前处于快速迭代阶段，可以用此技能来**结构化规划每个版本的目标**：当前 v49 的"灾害标题视觉特效"属于哪个 Level？下一个可玩迭代（Iter）应该包含什么？
  - 强制"关注下一个可玩里程碑"（playable stone），避免过度设计。
- **适用场景**：版本规划、功能优先级排序、定义下一个可玩迭代目标。

---

## 四、值得关注的补充技能

| 技能 | 推荐理由 |
|-----|---------|
| **threejs-game-skills** | 虽然是 Three.js，但其中的 **游戏玩法系统**、**UI模式**、**QA检查清单**、**发布验证** 等通用内容可直接借鉴到任何网页游戏。 |
| **learn-claude-skills** | **本身是教育互动游戏的范例！** 用 Phaser 3 在浏览器中实现"教室探索+学习+测验"的循环，与「应急小达人」的"灾害选择+知识学习+答题"结构高度相似。可参考其交互设计和测验机制。 |
| **ai-game-art-pipeline-skill** | 如果项目需要生成灾害场景插画、图标、背景图，此技能提供完整的 AI 美术工作流（生成→清理→打包→QA）。 |
| **claude-code-game-development** | 通用游戏开发百科全书，涵盖游戏循环、碰撞检测、输入处理、音频、UI、性能优化等。虽然偏向传统游戏，但其中的 **Web Worker 并行化**、**移动端优化**、**资源加载策略** 对网页游戏直接有用。 |

---

## 五、为什么没有直接找到"防灾教育游戏"专属 Skill？

1. **领域过于细分**："防灾教育" + "网页游戏" + "Agent Skill" 是三个圈子的交集，目前 GitHub 上几乎无人专门为此领域创建 Skill。
2. **Skill 生态尚处早期**：Agent Skills（SKILL.md 格式）在 2025-2026 年才快速兴起，社区技能主要集中在通用开发、DevOps、设计等热门领域，垂直教育领域覆盖不足。
3. **语言壁垒**：大部分 Skill 是英文社区创建，中文教育类技能几乎空白。
4. **通用技能可迁移**：虽然没有"防灾教育游戏专属 Skill"，但 **游戏设计 + 网页开发 + 项目管理** 三个通用方向的技能组合，完全可以覆盖「应急小达人」的开发需求。

---

## 六、对「应急小达人」的建议

1. **优先适配 `game-design` 技能**：将其中的核心循环、难度平衡、进度设计原则应用到 Quiz 引擎和关卡设计中。
2. **参考 `game-dev-skills` 的 `game-agent-team`**：将当前的 Agent 协作流程（Agent_1 优化、AI 模块等）结构化，形成可复用的团队工作流。
3. **借鉴 `learn-claude-skills` 的交互模式**：它是浏览器教育游戏的实例，其"场景探索→学习→测验"的循环可直接参考。
4. **考虑自研一个 `yingji-game-design` Skill**：将「应急小达人」在防灾教育游戏领域的经验沉淀为 SKILL.md，回馈社区，也可能成为该细分领域的首个开源技能。
