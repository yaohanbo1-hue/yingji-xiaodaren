# localStorage 兼容性检查报告

**检查项目：** `check-localstorage-compat`  
**检查范围：** 应急小达人游戏项目  
**检查时间：** 2025-07-03

---

## 一、GameState 数据结构与兼容性

### 1.1 存储键与数据结构

| 属性 | 详情 |
|------|------|
| 存储键 | `disasterGachaState` |
| 当前版本 | `_version: 2` |
| 字段总数 | 38 个（`_keys` 数组定义） |
| 默认值 | `_defaults` 提供完整默认值树 |
| 存储格式 | `JSON.stringify(this._data)` |
| 读取格式 | `JSON.parse(saved)` |

### 1.2 迁移逻辑分析

`GameState._ensureDefaults()` 提供以下迁移能力：

| 迁移能力 | 状态 | 说明 |
|----------|------|------|
| 版本号检查 | ✅ 存在 | 当 `version < 2` 时更新到 2 |
| 新增字段填充 | ✅ 自动 | 遍历 `_keys`，缺失字段用 `_defaults` 深拷贝填充 |
| 二级对象合并 | ✅ 支持 | 对 `stats` 和 `settings` 使用 `Object.assign` 浅合并 |
| 更深嵌套合并 | ⚠️ 有限 | 仅支持两级深度（`sub` 和 `sub2`），三级以上嵌套对象不会自动填充缺失字段 |
| 字段重命名迁移 | ❌ 缺失 | 无字段重命名或删除的旧数据清理逻辑 |
| 数据校验 | ❌ 缺失 | 不对存储值类型进行校验（如 `coins` 应为 number） |

### 1.3 风险点

| 风险 | 严重程度 | 说明 |
|------|----------|------|
| 版本迁移逻辑较浅 | 中 | 只处理 `version → 2` 和 `level/exp` 的补全。如果未来升级到版本 3，需要手动扩展 `_ensureDefaults()` |
| 深拷贝只到两级 | 低 | 目前 `_defaults` 中不存在三级以上的嵌套，短期内无风险 |
| `save()` 失败静默 | 中 | catch 块为空，localStorage 写失败（如隐私模式/超出配额）时无提示，用户可能丢失进度 |
| `init()` 解析失败静默 | 低 | 如果 JSON 损坏，回退到默认数据，但旧数据丢失无提示 |

---

## 二、localStorage 使用全景

### 2.1 所有存储键列表

| 序号 | 存储键 | 用途 | 所在文件 |
|------|--------|------|----------|
| 1 | `disasterGachaState` | GameState 主存档（核心） | `game-engines.js`, `patch-v75.js` |
| 2 | `disasterSeason` | 赛季数据 | `game-engines.js` |
| 3 | `tutorialDone` | 新手引导完成标记 | `game-engines.js`, `patch-v75.js` |
| 4 | `disaster_hq_guide_completed` | 引导增强版完成标记 | `guide-enhance.js` |
| 5 | `aiTutorData` | AI 导师答题数据 | `ai-tutor-v55.js`, `ai-tutor-llm-v55.js` |
| 6 | `aitutor_profile` | AI 导师用户档案 | `ai-tutor-llm-v55.js` |
| 7 | `aitutor_model` | AI 模型选择 | `ai-tutor-llm-v55.js` |
| 8 | `aitutor_cache` | AI 对话缓存 | `ai-tutor-llm-v55.js` |
| 9 | `deepseek_proxy_url` | AI 代理 URL | `ai-tutor-llm-v55.js` |
| 10 | `certificationData` | 认证等级数据 | `certification.js` |
| 11 | `disaster_hq_wrong_book` | 错题本数据 | `wrong-book.js` |
| 12 | `disasterHQ_language` | 界面语言 | `i18n.js` |
| 13 | `bg_theme` | 背景主题 | `bg-themes.js` |
| 14 | `disaster_hq_loading_shown` | 加载动画已展示标记 | `loading.js` |
| 15 | `disaster_hq_voice_enabled` | 语音开关 | `voice.js` |
| 16 | `disaster_hq_voice_rate` | 语音语速 | `voice.js` |
| 17 | `disaster_hq_voice_pitch` | 语音音调 | `voice.js` |

### 2.2 键名一致性评估

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 拼写错误 | ✅ 无 | 未发现键名拼写错误 |
| 大小写一致性 | ⚠️ 存在 | `disaster_hq_*`（蛇形）与 `disasterHQ_*`（驼峰）混用，如 `disaster_hq_loading_shown` vs `disasterHQ_language` |
| 前缀一致性 | ⚠️ 存在 | 核心数据用 `disasterGachaState`，辅助数据用 `disaster_hq_*`，AI 数据用 `aiTutor*` / `aitutor_*`，语言用 `disasterHQ_*`。建议统一前缀 |
| 重复键风险 | ⚠️ 存在 | `tutorialDone` 和 `disaster_hq_guide_completed` 都标记"引导完成"，可能导致逻辑不一致 |

---

## 三、localStorage 使用问题列表

### 3.1 高优先级问题

| 编号 | 问题描述 | 位置 | 影响 | 修复建议 |
|------|----------|------|------|----------|
| LS-01 | `tutorialDone` 与 `disaster_hq_guide_completed` 双键并存，两个引导系统（`TutorialEngine` / `GuideEnhancer`）各自使用不同键，互相不知道对方状态 | `game-engines.js` (TutorialEngine), `guide-enhance.js` | 用户可能重复看到新手引导，或引导状态不同步 | 统一使用一个键；或在 `GuideEnhancer.init()` 中同时检查 `tutorialDone` |
| LS-02 | `patch-v75.js` 的 `GameState.reset()` 只清除 `disasterGachaState` 和 `tutorialDone`，但不清除 `aiTutorData`、`certificationData`、`disaster_hq_wrong_book` 等 15 个其他键 | `patch-v75.js:26` | "重置所有数据"不彻底，用户可能发现其他数据仍然残留 | 重置时遍历并清除所有已知的 localStorage 键 |
| LS-03 | `patch-v75.js` 的 `beforeunload` 监听器直接调用 `localStorage.setItem`，不检查 `GameState._data` 是否为 null。若 GameState 未初始化，会写入 `"null"` 字符串 | `patch-v75.js:105-109` | 损坏存档数据，下次加载时 `JSON.parse("null")` 得到 `null`，触发回退逻辑但旧数据丢失 | 增加 `GameState._data !== null && typeof GameState._data === 'object'` 检查 |
| LS-04 | `patch-v75.js` 的 `beforeunload` 与 `game-engines.js` 的 `beforeunload` 重复保存同一键，冗余且可能在极端情况下竞态 | `game-engines.js:378`, `patch-v75.js:105-109` | 虽然值相同，但增加不必要的 IO；若 `_data` 在其中一个回调中被修改，可能保存不一致状态 | 移除 `patch-v75.js` 中的冗余 `beforeunload`；依赖 `GameState.save()` 即可 |

### 3.2 中优先级问题

| 编号 | 问题描述 | 位置 | 影响 | 修复建议 |
|------|----------|------|------|----------|
| LS-05 | `GameState.save()` 和 `init()` 的 catch 块为空，localStorage 失败时完全静默 | `game-engines.js` / `js/engines/GameState_formatted.js:185-186, 244-245` | 用户无法知道存档失败，可能因隐私模式/存储配额耗尽导致进度丢失 | 在 catch 中添加 `console.warn` 或调用 UI 提示（如 `V10Toast.warning('存档失败，请检查浏览器隐私设置')`） |
| LS-06 | `ai-tutor-llm-v55.js` 在模块顶层（非函数内）直接读取 `localStorage.getItem('deepseek_proxy_url')` 和 `localStorage.getItem('aitutor_model')` | `ai-tutor-llm-v55.js:498, 501` | 如果脚本加载时 localStorage 不可用（如某些隐私模式下 `localStorage` 对象存在但 `getItem` 抛出异常），模块初始化失败，整个 `DeepSeekAPI` 对象可能无法创建 | 将读取逻辑移到 `init()` 或 getter 函数中，配合 try-catch |
| LS-07 | `voice.js` 的 `init()` 中 `localStorage.getItem` 调用未包裹 try-catch | `voice.js:33-35` | 若 `SafeStorage` monkey-patch 未生效（加载顺序问题），直接调用原生 `getItem` 在隐私模式下可能抛异常，导致语音引擎初始化失败 | 添加 try-catch，或使用 `StorageUtils.get()`（来自 `js/core/utils.js`） |
| LS-08 | `bg-themes.js` 的 `init()` 中 `localStorage.getItem('bg_theme')` 未包裹 try-catch | `bg-themes.js:14` | 同 LS-07，可能导致主题初始化失败 | 添加 try-catch |

### 3.3 低优先级问题（建议优化）

| 编号 | 问题描述 | 位置 | 影响 | 修复建议 |
|------|----------|------|------|----------|
| LS-09 | 项目同时使用 `StorageUtils`（安全）、`SafeStorage`（安全）、`localStorage` 直接调用（不安全）三种模式，未统一 | 全项目 | 维护成本高，部分代码容易遗漏错误处理 | 统一使用 `StorageUtils` 或 `SafeStorage` 进行所有 localStorage 访问 |
| LS-10 | `guide-enhance.js` 多处调用 `localStorage.setItem/removeItem` 但错误处理仅打印 `console.error(e)`，缺少用户反馈 | `guide-enhance.js:137, 152, 159, 167, 453, 463` | 用户无法感知存储失败 | 使用 `StorageUtils` 替代，或至少提供降级行为（如默认行为） |
| LS-11 | `GameState._ensureDefaults()` 的 `_data.version = 2` 更新后，如果用户未触发任何修改并关闭页面，`save()` 可能不会被调用（依赖 beforeunload）。在部分浏览器中（尤其是移动端），`beforeunload` 事件不可靠 | `game-engines.js` | 版本号可能无法持久化到 localStorage | 在 `init()` 末尾主动调用一次 `save()`，确保迁移后的版本号被写入 |
| LS-12 | `i18n.js` 的 `setLanguage` 在 `catch` 中仅打印 `console.error`，无 UI 反馈 | `i18n.js:345` | 用户切换语言时若存储失败，下次进入仍显示旧语言，但用户不知道为什么 | 添加 `V10Toast` 提示或静默降级 |
| LS-13 | `certification.js` 的 `loadData()` 在 `JSON.parse` 失败时使用空数据，但不清除损坏的 localStorage 条目。下次加载仍然尝试解析相同的损坏数据 | `certification.js:70-79` | 无限循环解析失败，用户认证数据始终无法加载 | 在 catch 中执行 `localStorage.removeItem('certificationData')` 清除脏数据 |
| LS-14 | `share.js` 的 `SafeStorage.get()` 当 `localStorage.getItem` 返回 `"null"`（字符串）时，`JSON.parse("null")` 返回 `null`，然后返回 `defaultVal`（符合预期）。但如果返回 `"undefined"` 字符串，`JSON.parse` 会报错，被 catch 后返回 `defaultVal`，也正确。但如果返回的是损坏的 JSON（如不完整的字符串），`JSON.parse` 会报错，被 catch 返回 `defaultVal`。这里有一个小问题：`get()` 的 `return v ? JSON.parse(v) : defaultVal` —— 如果 `v` 是 `"0"` 或 `"false"`，`v ? ...` 会将其视为 truthy，解析为 `0` 或 `false`，这是正确的。但如果 `v` 是 `""`（空字符串），`v ? ...` 是 falsy，返回 `defaultVal`，这也是合理的。但如果 `v` 是 `"null"`，`JSON.parse` 返回 `null`，然后返回 `null`，而不是 `defaultVal`。这不是问题，因为 `null` 是合法的值。但如果 `v` 是 `"[]"`，`JSON.parse` 返回 `[]`，这也是正确的。所以 `SafeStorage` 的实现基本正确。但有一个边缘情况：如果 `v` 是 `""`（空字符串），意味着 localStorage 中存在空字符串键，`SafeStorage.get()` 会返回 `defaultVal`。但如果实际意图就是存储空字符串，就会丢失。不过这在当前项目中不是大问题。 | `share.js:22` | 理论上可能导致存储空字符串的读取异常，但当前项目无此场景 | 无需修复 |

---

## 四、数据兼容性风险汇总

### 4.1 跨版本兼容性

| 风险项 | 等级 | 说明 |
|--------|------|------|
| 版本 1 → 2 迁移 | ✅ 安全 | `_ensureDefaults()` 已处理 `version < 2` 的情况 |
| 版本 2 → 3 预留 | ⚠️ 需关注 | 当前迁移逻辑硬编码为 `version < 2`，若升级到版本 3 需要手动扩展逻辑 |
| 新增字段 | ✅ 安全 | `_ensureDefaults()` 会自动填充任何缺失的 `_keys` 字段 |
| 删除字段 | ⚠️ 需注意 | 旧数据中若有多余字段，不会被清理。长期积累可能导致存档体积膨胀 |
| 字段类型变更 | ❌ 无保障 | 如 `coins` 从 `number` 改为 `string`，`_ensureDefaults()` 不会修正类型 |

### 4.2 跨模块数据一致性

| 风险项 | 等级 | 说明 |
|--------|------|------|
| `GameState` 与其他模块数据分离 | ⚠️ 中 | 认证数据、错题本、AI 导师数据各自独立存储，不纳入 `GameState._data`。导出/导入时可能遗漏 |
| `share.js` 读取多源数据 | ⚠️ 低 | `ShareEngine._getUserData()` 尝试从 `disasterGachaState`、`aiTutorData`、`CertificationEngine._data`、`GameState._data` 四个源读取，逻辑健壮但维护成本高 |
| `certification.js` 读取 `aiTutorData` | ⚠️ 中 | 在 `certification.js:103, 171` 直接读取 `localStorage.getItem('aiTutorData')`，耦合了另一个模块的存储键。如果 `aiTutorData` 的键名变更，此处会静默失败 | 应改为通过 `AITutor.getData()` 等公共 API 读取，而非直接访问 localStorage |

### 4.3 隐私模式与存储禁用风险

| 场景 | 当前处理 | 风险 |
|------|----------|------|
| `localStorage` 被完全禁用（Safari 隐私模式等） | `js/core/game-core.js` 的 `SafeStorage` monkey-patch 提供有限保护 | 如果 `game-core.js` 在引发错误的脚本之后加载，保护失效。且 `ai-tutor-llm-v55.js` 的模块顶层调用无法被保护 |
| 存储超出配额（5MB / 10MB） | `SafeStorage` 会捕获 `QuotaExceededError` 并返回 `null`（get）或静默失败（set） | 用户进度无法保存，但无任何提示 |
| `localStorage` 被第三方清理工具删除 | `init()` 会回退到默认数据，用户看到"全新账户" | 用户可能误以为数据丢失，体验差 |

---

## 五、修复建议优先级清单

```
【高优先级】
1. 统一 "引导完成" 标记：TutorialEngine 和 GuideEnhancer 使用同一 localStorage 键
2. 完善 GameState.reset()：清除所有已知的 localStorage 键，而非仅 2 个
3. 修复 patch-v75.js beforeunload 中的 null 检查，避免写入 "null" 字符串
4. 移除 patch-v75.js 冗余的 beforeunload 监听器

【中优先级】
5. 为 GameState.save() 和 init() 添加有意义的错误日志 / 用户提示
6. 将 ai-tutor-llm-v55.js 的模块顶层 localStorage 读取移入函数内，并加 try-catch
7. 为 voice.js 和 bg-themes.js 的 localStorage 调用添加 try-catch
8. certification.js 的 loadData() 在解析失败时清理脏数据

【低优先级】
9. 全项目统一使用 StorageUtils 或 SafeStorage，消除直接调用 localStorage
10. 在 GameState.init() 末尾主动调用 save()，确保版本号持久化
11. 考虑引入统一的 localStorage 键前缀（如 `yjxdr_`），避免与其他网站冲突
12. 在 _ensureDefaults() 中添加版本 3 的预留检查逻辑（如 switch-case）
```

---

## 六、检查结论

- **问题总数：** 14 项（高优先级 4 项，中优先级 4 项，低优先级 4 项）
- **数据兼容性：** 基础版本迁移（1→2）有保障，但预留不足。新增字段自动填充机制完善。
- **隐私模式兼容性：** 有 `SafeStorage` 兜底，但存在加载顺序依赖和模块顶层调用的漏网之鱼。
- **键名一致性：** 整体无拼写错误，但前缀和命名规范不统一，存在重复键（`tutorialDone` / `disaster_hq_guide_completed`）。

**整体评估：** 项目 localStorage 使用基本可用，但边缘场景（隐私模式、重置逻辑、跨模块一致性）存在可修复的隐患。建议优先处理高优先级 4 项。
