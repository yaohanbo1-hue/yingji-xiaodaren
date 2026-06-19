# Cloudflare Workers 部署指南

## 为什么选择 Cloudflare Workers？

| 特性 | Cloudflare Workers |
|------|-------------------|
| 免费额度 | 每天 10 万次请求 |
| 注册方式 | 邮箱注册（无需 GitHub） |
| 全球节点 | 300+ 边缘节点，速度快 |
| 稳定性 | 大厂，不会被随意封号 |
| 自定义域名 | 支持免费域名 |

## 部署步骤

### 1. 注册 Cloudflare 账号

1. 访问 https://dash.cloudflare.com/sign-up
2. 用 **邮箱注册**（不要用 GitHub 关联）
3. 验证邮箱，完成注册

### 2. 创建 Worker

1. 登录后点击 **Workers & Pages**
2. 点击 **Create**
3. 选择 **Create Worker**
4. 给 Worker 起个名字，如 `yingji-xiaodaren-ai`
5. 点击 **Deploy**（先部署默认代码）

### 3. 编辑 Worker 代码

1. 进入 Worker 详情页，点击 **Edit Code**
2. 把左侧代码全部删除
3. 粘贴 `cloudflare-worker.js` 的内容
4. 点击 **Deploy**

### 4. 设置环境变量

1. 在 Worker 详情页，点击 **Settings** → **Variables**
2. 添加变量：
   - **Variable name**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-4cdcfcde0e1343789c07266c23efd371`
   - 勾选 **Encrypt**（加密存储）
3. 点击 **Save**

### 5. 获取 Worker URL

1. 在 Worker 详情页，点击 **Triggers**
2. 你会看到类似这样的 URL：
   ```
   https://yingji-xiaodaren-ai.your-username.workers.dev
   ```
3. 这个 URL 就是你的代理地址

### 6. 配置前端

打开你的 GitHub Pages 版本，在浏览器控制台执行：

```javascript
localStorage.setItem('deepseek_proxy_url', 'https://你的-worker-名字.用户名.workers.dev');
```

刷新页面，AI 就会通过 Cloudflare Workers 调用真正的 DeepSeek！

## 验证是否成功

1. 打开浏览器 F12 → **Network** 标签
2. 向AI提问
3. 查看请求是否发送到你的 Workers URL
4. 查看 Response 是否有 `answer` 字段

## 备选方案（如果 Cloudflare 也被封）

### 方案 A：Netlify Functions（免费）
- 注册: https://netlify.com
- 类似 Vercel，但平台不同
- 使用 `api/chat.js` 即可

### 方案 B：Railway（免费额度）
- 注册: https://railway.app
- 支持 Docker 部署
- 免费额度每月 5 美元

### 方案 C：腾讯云函数（国内推荐）
- 注册: https://cloud.tencent.com
- 云函数 SCF，每月有免费额度
- 国内访问速度快

### 方案 D：阿里云函数计算（国内推荐）
- 注册: https://aliyun.com
- 函数计算 FC，每月有免费额度
- 国内访问速度快

## 常见问题

**Q: Workers URL 被墙了怎么办？**
A: Cloudflare Workers 在国内访问通常没问题。如果确实被墙，可以绑定自定义域名（免费版支持）。

**Q: 免费额度够用吗？**
A: 每天 10 万次请求完全够用，一个用户正常使用一天不会超过 100 次。

**Q: 如何查看用量？**
A: Cloudflare Dashboard → Workers → 选择你的 Worker → 查看 Analytics。

