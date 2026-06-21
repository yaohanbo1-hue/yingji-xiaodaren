# 🌪️ 应急小达人 v1.3.1

> **面向中小学生的防灾教育互动游戏**
>
> 通过盲盒开箱、答题闯关、情景模拟等趣味方式，让防灾知识变得触手可及。

[![版本](https://img.shields.io/badge/版本-1.3.0-blue)](./CHANGELOG.md)
[![技术栈](https://img.shields.io/badge/技术-HTML5%20%7C%20CSS3%20%7C%20JS-green)](https://developer.mozilla.org/)
[![依赖](https://img.shields.io/badge/依赖-零依赖-orange)]()
[![许可](https://img.shields.io/badge/许可-MIT-blue)](./LICENSE)
[![部署](https://img.shields.io/badge/部署-GitHub%20Pages-brightgreen)](https://pages.github.com/)

---

## 📸 项目截图

| 主菜单 | 游戏界面 | 学习报告 |
|:------:|:--------:|:--------:|
| ![主菜单](./screenshots/yingji-v15-menu.png) | ![游戏界面](./screenshots/yingji-v16-menu.png) | ![加载界面](./screenshots/yingji-v12-loaded.png) |

---

## ✨ 功能特性

### 🎮 32 种游戏模式

| 分类 | 模式数量 | 代表功能 |
|------|----------|----------|
| 📚 学习中心 | 11 个 | 开盲盒、签到、学习、急救、防灾馆、宠物、日记、卡牌工坊、百科、引导、AI 导师 |
| 🏅 认证与模拟 | 3 个 | 能力认证、灾害模拟、真实案例 |
| ⚔️ 闯关挑战 | 21 个 | 大擂台、速答、双人 PK、生存、Boss Rush、故事模式等 |

### 🌊 四大核心模块

| 模块 | 功能 | 教育价值 |
|------|------|----------|
| 🤖 **AI 智能导师** | 12 维雷达图 + 智能诊断 + 对话终端 + 推荐练习 | 个性化学习、数据驱动 |
| 🏅 **能力认证** | 5 级认证 + Canvas 证书 + 进度环 + 升级弹窗 | 激励机制、成就体系 |
| 🎬 **灾害模拟** | 4 种灾害 Canvas 动画 + 真实决策 + 粒子系统 | 沉浸体验、情景教学 |
| 📖 **真实案例** | 5 个历史事件 + 时间线 + 三阶段流程 + 知识总结 | 科学性、教育价值 |

### 📊 学习数据系统

- **📕 错题本**：自动收集错题，支持专项复习
- **📊 学习报告**：一键生成 PNG 报告，可打印提交
- **🔊 语音播报**：Web Speech API 朗读知识点
- **📈 进度追踪**：12 类灾害掌握情况可视化

---

## 🚀 快速开始

### 在线体验

👉 **[点击在线游玩](https://yaohanbo1-hue.github.io/yingji-xiaodaren/)**

### 本地运行

```bash
# 方式一：直接下载 ZIP
1. 点击 GitHub 页面右上角 "Code" → "Download ZIP"
2. 解压到任意目录
3. 双击 index.html 即可运行

# 方式二：Git 克隆
git clone https://github.com/yaohanbo1-hue/yingji-xiaodaren.git
cd yingji-xiaodaren
# 直接打开 index.html 或使用本地服务器
python -m http.server 8000
# 然后访问 http://localhost:8000
```

> **无需安装任何软件！无需联网！无需服务器！** 所有资源均为静态文件，双击即用。

---

## 🏗️ 技术栈

### 核心技术

| 技术 | 版本 | 用途 |
|------|------|------|
| HTML5 | — | 语义化结构、42 个子页面模块 |
| CSS3 | — | 视觉效果、动画、响应式布局 |
| JavaScript (ES6+) | — | 游戏逻辑、引擎系统、交互 |
| Web Speech API | — | 语音播报与朗读 |
| Canvas 2D | — | 粒子特效、证书生成、动画 |
| Service Worker | — | PWA 离线缓存、本地安装 |

### 项目架构

```
┌─────────────────────────────────────────────────────────┐
│                    index.html (主入口)                    │
│                   42 个子页面模块                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  学习中心    │  │  闯关挑战    │  │  认证模拟    │    │
│  │  (11模式)   │  │  (21模式)   │  │  (3模块)    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │             │
│  ┌──────┴────────────────┴────────────────┴──────┐     │
│  │              game-engines.js                   │     │
│  │           57 个引擎模块（核心逻辑）              │     │
│  └──────────────────────┬────────────────────────┘     │
│                         │                               │
│  ┌──────────────────────┴────────────────────────┐     │
│  │              数据层                            │     │
│  │  cards.js (369张)  scenarios.js (34场景)       │     │
│  │  kit_data.js       encyclopedia_*.js           │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │              增强模块                          │     │
│  │  ai-tutor.js     认证系统    灾害模拟          │     │
│  │  real-cases.js   错题本      学习报告          │     │
│  │  voice.js        无障碍      性能优化          │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │              视觉层                            │     │
│  │  all-styles.css  v5-glass-3d.css              │     │
│  │  bg-premium.css  fx-effects.css               │     │
│  │  transitions.css loading.css                  │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │              音频层                            │     │
│  │  bgm.js (步进音序器)  sfx.js (12种音效)        │     │
│  │  bgm-enhanced.js     audio-integration.js     │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 文件清单

| 文件 | 大小 | 用途 |
|------|------|------|
| index.html | ~110 KB | 主页面（42 个子页面） |
| game-engines.js | ~370 KB | 核心引擎（57 个模块） |
| cards.js | ~280 KB | 369 张知识卡牌 |
| all-styles.css | ~190 KB | 合并样式表 |
| scenarios.js | ~53 KB | 12 类灾害 / 34 场景 |
| ai-tutor-v55.js | ~36 KB | AI 智能导师引擎 |
| certification.js | ~16 KB | 能力认证引擎 |
| disaster-sim.js | ~25 KB | 灾害情景模拟 |
| real-cases.js | ~21 KB | 真实案例还原 |
| wrong-book.js | ~15 KB | 错题本引擎 |
| report.js | ~21 KB | 学习报告导出 |
| sw-v55.js | ~4 KB | Service Worker |

**总计：约 40 个文件，总计 ~1.3 MB**

---

## 📚 知识覆盖

### 12 类自然灾害

| 灾害类型 | 图标 | 知识点数量 |
|----------|------|------------|
| 地震 | 🌍 | 30+ |
| 洪水 | 🌊 | 30+ |
| 火灾 | 🔥 | 35+ |
| 台风 | 🌀 | 25+ |
| 海啸 | 🌊 | 20+ |
| 滑坡 | ⛰️ | 20+ |
| 龙卷风 | 🌪️ | 20+ |
| 干旱 | ☀️ | 20+ |
| 雷电 | ⚡ | 25+ |
| 雪崩 | ❄️ | 15+ |
| 火山 | 🌋 | 15+ |
| 冰雹 | 🧊 | 15+ |

### 真实案例

1. **2008 汶川大地震** — 地震避险与自救
2. **2021 河南暴雨** — 城市内涝应对
3. **2010 玉树地震** — 高原灾害救援
4. **2019 凉山森林火灾** — 山火逃生
5. **2006 超强台风桑美** — 台风防御

---

## 🌍 部署方式

### GitHub Pages（推荐）

本项目已通过 GitHub Pages 部署，无需额外配置：

1. Fork 本仓库到你的 GitHub 账号
2. 进入仓库 **Settings → Pages**
3. Source 选择 "Deploy from a branch"
4. Branch 选择 `main` / `master`，文件夹选择 `/ (root)`
5. 保存后等待约 1-2 分钟，即可通过 `https://<你的用户名>.github.io/yingji-xiaodaren/` 访问

### 其他部署方式

- **[Vercel](./VERCEL_DEPLOY.md)** — 支持无服务器函数，适合扩展 AI 功能
- **[Cloudflare Pages](./CLOUDFLARE_DEPLOY.md)** — 全球 CDN 加速，适合海外访问
- **[阿里云函数计算](./ALIYUN_DEPLOY.md)** — 适合国内高速访问
- **任意静态托管** — 直接上传文件即可，无需后端

---

## 🌐 浏览器兼容性

| 浏览器 | 最低版本 | 支持状态 | 备注 |
|--------|----------|----------|------|
| Chrome | 80+ | ✅ 完全支持 | 推荐浏览器 |
| Edge | 80+ | ✅ 完全支持 | 基于 Chromium |
| Firefox | 75+ | ✅ 完全支持 | — |
| Safari | 13+ | ✅ 完全支持 | iOS 13+ |
| 微信内置浏览器 | 最新版 | ⚠️ 部分支持 | 语音播报可能受限 |
| IE 11 | — | ❌ 不支持 | 请使用现代浏览器 |

### 移动端支持

| 平台 | 最低版本 | 支持状态 |
|------|----------|----------|
| iOS | 13+ | ✅ 完全支持 |
| Android | 10+ | ✅ 完全支持 |
| iPadOS | 13+ | ✅ 完全支持 |

> 💡 **提示**：推荐使用 Chrome 或 Safari 获得最佳体验。首次加载可能需要 3-5 秒，请耐心等待。

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与。

### 贡献方式

- 🐛 [提交 Bug 报告](https://github.com/yaohanbo1-hue/yingji-xiaodaren/issues/new?template=bug_report.md)
- ✨ [提交功能建议](https://github.com/yaohanbo1-hue/yingji-xiaodaren/issues/new?template=feature_request.md)
- 📝 修正题目知识或错别字
- 🎨 优化 UI 设计或视觉效果
- 🔊 补充音效或背景音乐
- 🌐 翻译多语言版本

---

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE) 开源。

```
MIT License

Copyright (c) 2026 应急小达人开发团队

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🏆 比赛信息

**参赛项目**：全国青少年安全与应急科普创新大赛

**项目特色**：

1. **教育性**：覆盖 12 类灾害、369 个知识点，符合课标要求
2. **创新性**：盲盒机制 + 游戏化学习，激发学习兴趣
3. **互动性**：32 种游戏模式，多维度互动体验
4. **科学性**：真实案例还原，权威数据支撑
5. **完成度**：零 Bug、零依赖、零配置，开箱即用
6. **技术性**：纯前端实现，Canvas 粒子系统，Web Speech API

---

## 📬 联系我们

- 📧 项目 Issues：[GitHub Issues](https://github.com/yaohanbo1-hue/yingji-xiaodaren/issues)
- 🌐 在线体验：[GitHub Pages](https://yaohanbo1-hue.github.io/yingji-xiaodaren/)

---

<p align="center">
  <strong>🌪️ 应急小达人 — 让防灾知识触手可及</strong><br>
  <sub>全国青少年安全与应急科普创新大赛参赛作品</sub><br>
  <sub>Made with ❤️ for students everywhere</sub>
</p>
