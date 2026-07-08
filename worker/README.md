# 应急小达人 · AI 代理（Cloudflare Worker）

前端（浏览器）**无法直连** DeepSeek API（CORS 限制，且会把 Key 暴露给用户）。
本 Worker 作为安全代理：持有服务端 `DEEPSEEK_API_KEY`，前端只把题目/对话发过来，Worker 代为调用 DeepSeek 并返回结果。

## 部署步骤（约 3 分钟）

### 方式一：Cloudflare 控制台（无需本地环境）

1. 登录 <https://dash.cloudflare.com> → **Workers & Pages** → **创建 Worker**。
2. 把 `worker.js` 的内容完整粘贴进去。
3. **Settings → Variables** → 添加环境变量（Encrypt 类型）：
   - 名称：`DEEPSEEK_API_KEY`
   - 值：你的 DeepSeek API Key（<https://platform.deepseek.com> 获取，新用户免费额度充足）
4. **Deploy** 后获得地址，形如 `https://yingji-ai-proxy.<你的子域>.workers.dev`。

### 方式二：Wrangler 命令行

```bash
cd worker
npm install -g wrangler        # 若未安装
wrangler login                 # 浏览器授权
wrangler secret put DEEPSEEK_API_KEY   # 按提示粘贴 Key
wrangler deploy                # 部署，终端会输出 Worker 地址
```

## 让全站免配置启用 AI（关键一步）

部署拿到 Worker 地址后，打开前端文件 `ai-tutor-llm-v55.js`，把顶部的：

```js
const AI_TUTOR_DEFAULT_PROXY_URL = '';
```

改成你的地址：

```js
const AI_TUTOR_DEFAULT_PROXY_URL = 'https://yingji-ai-proxy.xxx.workers.dev';
```

改完重新构建并部署站点即可。**所有访客无需任何设置，AI 导师的开题/对话直接可用。**

> 若不想改源码，也可在游戏内点击 AI 导师面板的 ☁️ / 🔑 按钮，手动填入 Worker 地址（`localStorage` 持久化）。

## 接口约定

**请求（POST，JSON）：**
```json
{
  "message": "请出一道新的防灾选择题，严格按系统要求的 JSON 格式返回，只返回 JSON。",
  "history": [ { "role": "user", "content": "..." } ],
  "model": "deepseek-chat",
  "system": "你是中国防灾教育游戏《应急小达人》的 AI 出题官……（出题专用 prompt）"
}
```

**响应（200，JSON）：**
```json
{ "answer": "{\n  \"question\": \"...\",\n  \"options\": [\"A...\"" ]\n  ...}" }
```

- `system` 字段可选：传入则优先使用（AI 出题场景），不传则使用默认防灾导师 prompt（普通对话）。
- 出错时返回 `{ "error": "..." }` 及对应 HTTP 状态码（401/402/429/500）。
