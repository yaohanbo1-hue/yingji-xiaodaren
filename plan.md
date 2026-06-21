# 应急小达人 - 多Agent测试+修复+验证计划

## 项目信息
- **GitHub Pages**: https://yaohanbo1-hue.github.io/yingji-xiaodaren/
- **本地路径**: C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren\
- **AI后端**: 阿里云百炼 Qwen 3.7 Plus（前端直连）
- **当前版本**: 阿里云百炼 + 安全锁 + 20次/3秒限制

## Stage 1: 并行测试（5个Agent）

### 测试Agent_1: 主页面与导航测试
- 测试标题显示、居中、动画
- 测试菜单导航（所有工具栏按钮）
- 测试页面切换（PageManager）
- 测试加载界面和引导弹窗
- 测试Edge/Chrome兼容性

### 测试Agent_2: AI功能测试
- 测试AI按钮显示和点击
- 测试AI面板打开/关闭
- 测试发送消息（只调1次API）
- 测试快速提问按钮
- 测试API安全锁（3秒间隔、20次限制）
- 测试F12控制台报错

### 测试Agent_3: 游戏模块测试
- 测试学习模式（开盲盒、每日签到等）
- 测试战斗模式（答题、生存挑战等）
- 测试辅助功能（急救、知识竞赛等）
- 测试按钮点击和页面切换
- 测试游戏逻辑是否正常运行

### 测试Agent_4: 设置与辅助功能测试
- 测试设置页面（音效、难度等）
- 测试角色系统
- 测试图鉴、成就、统计
- 测试商店、宠物、日记
- 测试博物馆、工坊、扭蛋

### 测试Agent_5: 响应式与兼容性测试
- 测试不同分辨率下的布局
- 测试Edge浏览器显示（白色背景问题）
- 测试移动端适配
- 测试CSS加载和JS错误
- 测试控制台报错信息

## Stage 2: 并行修复（3-5个Agent）
- 根据Stage 1报告，分配修复任务
- 每个Agent修复1-2个bug
- 修复后立即本地验证

## Stage 3: 并行验证（3-5个Agent）
- 重新测试Stage 1发现的所有问题
- 验证修复是否生效
- 测试是否有新引入的bug
- 最终集成测试

## 文件清单（关键文件）
- index.html（主页面）
- all-styles-v55.css（主样式）
- clean-ui.css（UI样式）
- ai-float.css（AI按钮样式）
- ai-float-v55.js（AI浮动面板）
- ai-tutor-v55.js（AI导师）
- ai-tutor-llm-v55.js（AI LLM后端）
- js/engines/PageManager.js（页面管理）
- game-engines.js（游戏引擎）
