# DeepSeek 代理部署指南

## 问题背景

浏览器有 **CORS（跨域）安全限制**，前端无法直接调用 `api.deepseek.com`，必须通过后端代理中转。

## 解决方案：Vercel Serverless Function（免费）

### 步骤 1：推送代码到 GitHub

确保 `api/chat.js` 和 `vercel.json` 已提交到仓库。

### 步骤 2：注册 Vercel 账号

1. 访问 https://vercel.com
2. 点击 "Sign Up"，用 GitHub 账号登录（推荐）
3. 完成注册流程

### 步骤 3：导入项目

1. 在 Vercel Dashboard 点击 "Add New Project"
2. 选择 "Import Git Repository"
3. 找到你的 `yingji-xiaodaren` 仓库，点击 "Import"
4. 配置：
   - **Framework Preset**: 选择 "Other"
   - **Root Directory**: 保持默认（`.`）
5. 点击 "Deploy"

### 步骤 4：设置环境变量

1. 部署完成后，进入项目设置（Project Settings → Environment Variables）
2. 添加变量：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-4cdcfcde0e1343789c07266c23efd371`
3. 点击 "Save"，然后重新部署（Redeploy）

### 步骤 5：获取域名

1. 部署成功后，Vercel 会分配一个域名，如：
   ```
   https://yingji-xiaodaren.vercel.app
   ```
2. 你也可以在 Vercel 设置自定义域名

### 步骤 6：配置前端代理地址

**方案 A：全部部署到 Vercel（推荐）**

前端和后端同域名，无需额外配置，代理地址默认为 `/api/chat`。

**方案 B：前端保持 GitHub Pages，后端用 Vercel**

1. 打开你的 GitHub Pages 版本：`https://yaohanbo1-hue.github.io/yingji-xiaodaren/`
2. 在浏览器控制台执行：
   ```javascript
   localStorage.setItem('deepseek_proxy_url', 'https://你的vercel域名.vercel.app/api/chat');
   ```
3. 刷新页面即可

### 验证是否成功

1. 打开浏览器开发者工具（F12）
2. 进入 Network 标签
3. 向AI提问，查看是否有 `/api/chat` 请求
4. 检查 Response 是否返回了 DeepSeek 的回复

## 常见问题

**Q: 部署后提示 "代理地址未配置"？**
A: 检查 `localStorage` 中的 `deepseek_proxy_url` 是否设置正确。

**Q: 代理返回 500 错误？**
A: 检查 Vercel 的环境变量 `DEEPSEEK_API_KEY` 是否正确设置，并重新部署。

**Q: 提示 "API Key 无效"？**
A: 检查你的 DeepSeek API Key 是否有效，或额度是否用完。

## 文件说明

| 文件 | 作用 |
|------|------|
| `api/chat.js` | Vercel Serverless Function，中转 DeepSeek API 请求 |
| `vercel.json` | Vercel 部署配置 |
| `ai-tutor-llm-v55.js` | 前端代码，已修改为调用代理地址 |
