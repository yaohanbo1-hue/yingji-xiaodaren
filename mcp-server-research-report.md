# MCP 服务器调研报告 — 游戏开发方向

> **调研日期**：2026年6月  
> **调研范围**：GitHub MCP、浏览器自动化、图像/设计、文件系统、游戏引擎等  
> **适用项目**：应急小达人（GitHub Pages 部署的防灾教育互动游戏）

---

## 一、GitHub MCP（核心推荐 ⭐）

### 1. GitHub 官方 MCP Server（强烈推荐）

| 属性 | 详情 |
|------|------|
| **仓库** | https://github.com/github/github-mcp-server |
| **Stars** | 30,651 |
| **语言** | Go |
| **安装方式** | Docker / 本地二进制 / 远程 HTTP |
| **授权方式** | OAuth 或 GitHub Personal Access Token |

**功能**：
- 仓库管理（浏览代码、搜索文件、分析项目结构）
- Issue & PR 自动化（创建、更新、管理、审阅代码变更）
- CI/CD & Workflow Intelligence（监控 GitHub Actions、分析构建失败、管理 Release）
- 代码分析（安全扫描、Dependabot 告警、代码模式分析）
- 团队协作（讨论、通知、团队活动分析）
- 远程版特有：`create_pull_request_with_copilot`（Copilot 编码代理）

**两种部署模式**：
- **Remote（远程版）**：由 GitHub 托管，最省心，支持 OAuth 自动授权
  - URL: `https://api.githubcopilot.com/mcp/`
- **Local（本地版）**：需 Docker 或本地编译，使用 PAT 令牌
  - Docker 镜像: `ghcr.io/github/github-mcp-server`

**Token 权限建议**：
- `repo` — 仓库操作（读写）
- `read:packages` — Docker 镜像访问
- `read:org` — 组织团队访问
- 安全提示：使用最小权限原则，不要提交 Token 到 Git

**工具集（Toolsets）**：可自定义启用哪些工具，避免模型被过多工具干扰：
```bash
# 启用全部工具
GITHUB_TOOLSETS="all"

# 只启用仓库 + Issue + PR + Actions
GITHUB_TOOLSETS="repos,issues,pull_requests,actions,code_security"
```

**配置示例（OAuth 远程版）**：
```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

**配置示例（PAT 本地版）**：
```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

---

### 2. GitHub Repos Manager MCP Server（第三方）

| 属性 | 详情 |
|------|------|
| **仓库** | 第三方（Token-based） |
| **特点** | 无需 Docker，80+ 工具，直接 API 集成 |
| **授权** | GitHub Token |

---

### 3. GitMCP（通用远程 GitHub MCP）

| 属性 | 详情 |
|------|------|
| **网址** | gitmcp.io |
| **特点** | 可连接**任何 GitHub 仓库**或项目文档，无需本地部署 |
| **授权** | 无需 Token（只读公开仓库） |

**适用场景**：让 AI 读取任意开源项目的文档和代码，作为参考。

---

## 二、浏览器自动化 MCP（游戏测试利器）

### 1. Playwright MCP（微软官方）⭐ 推荐

| 属性 | 详情 |
|------|------|
| **仓库** | https://github.com/microsoft/playwright-mcp |
| **Stars** | 33,879 |
| **语言** | TypeScript |
| **安装** | `npm install -g @playwright/mcp` |
| **授权** | ❌ 无需授权，本地运行 |

**功能**：
- 多浏览器支持（Chromium、Firefox、WebKit）
- 页面导航、点击、填写表单
- 截图、执行 JavaScript
- 生成测试代码、网页抓取
- 跨浏览器测试、网络拦截、移动端模拟
- **优势**：自动等待（auto-wait），90%+ 首次操作成功率

**配置示例**：
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}
```

**首次使用需安装浏览器驱动**：
```bash
npx playwright install
```

**对游戏开发的价值**：
- 自动测试网页游戏的交互流程（点击、拖拽、输入）
- 跨浏览器兼容性测试（Chrome、Firefox、Safari）
- 截图对比视觉回归测试
- 模拟不同分辨率下的游戏表现

---

### 2. Puppeteer MCP（Anthropic 官方参考实现）

| 属性 | 详情 |
|------|------|
| **包名** | `@modelcontextprotocol/server-puppeteer` |
| **语言** | TypeScript |
| **安装** | `npx -y @modelcontextprotocol/server-puppeteer` |
| **授权** | ❌ 无需授权 |

**功能**：
- 无头 Chrome/Chromium 控制
- 导航、截图、PDF 生成
- Cookie 管理、DOM 操作、JS 执行
- 网络请求拦截（CDP 深度集成）

**特点**：
- 更轻量、安装更小
- 只支持 Chromium（单浏览器）
- 需要显式等待（非自动等待），AI 需要更多提示

**配置示例**：
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

---

### 3. Chrome DevTools MCP（Google Chrome 团队）

| 属性 | 详情 |
|------|------|
| **仓库** | https://github.com/ChromeDevTools/chrome-devtools-mcp |
| **Stars** | 43,544 |
| **安装** | `npx -y chrome-devtools-mcp@latest` |
| **授权** | ❌ 无需授权 |

**功能**：
- 实时 Chrome 调试（控制台、网络请求、性能分析）
- 性能追踪（Performance Trace）
- Core Web Vitals 评分
- 截图、Accessibility Tree 快照

**适用场景**：需要调试证据（控制台错误、网络请求失败、性能瓶颈）时使用。

---

### 4. Browserbase MCP（云端浏览器）

| 属性 | 详情 |
|------|------|
| **包名** | `@browserbasehq/mcp` |
| **特点** | 云端托管浏览器，持久 Cookie、会话回放、反指纹 |
| **授权** | 🔴 需要 API Key（`BROWSERBASE_API_KEY`） |

**适用场景**：生产级爬虫、需要隔离会话、长期运行的自动化任务。

---

### 5. BrowserMCP（本地 Chrome 控制）

| 属性 | 详情 |
|------|------|
| **仓库** | BrowserMCP/mcp |
| **Stars** | 6,700 |
| **特点** | 自动化控制本地 Chrome 浏览器 |
| **授权** | ❌ 无需授权 |

---

## 三、图像/设计 MCP（游戏素材生成）

### 1. AI Image-Gen MCP Server（DALL-E / GPT-Image）

| 属性 | 详情 |
|------|------|
| **包名** | `krystian-ai-ai-image-gen-mcp` |
| **模型** | DALL-E 3、DALL-E 2、GPT-Image-1（实验性） |
| **授权** | 🔴 需要 `OPENAI_API_KEY` |

**功能**：
- 文本生成图像（`generate_image`）
- 模型选择、尺寸、风格选项
- 批量生成（n=5 支持）
- 提示词模板（产品样机、概念艺术）

---

### 2. GPT Image Generator MCP Server（gpt-image-1.5）

| 属性 | 详情 |
|------|------|
| **包名** | `@singularity2045/image-generator-mcp-server` |
| **模型** | OpenAI GPT Image (gpt-image-1.5) |
| **授权** | 🔴 需要 `OPENAI_API_KEY` |

**功能**：
- 图像生成（支持多种尺寸）
- 图像编辑（风格迁移、物体移除、合成）
- AI 放大（可选 Topaz Labs）
- 提示词优化指南

---

### 3. Gemini Image Generator MCP（Google Gemini）

| 属性 | 详情 |
|------|------|
| **包名** | `collactivelabs-gemini-image-gen-mcp` |
| **模型** | Gemini 2.0 Flash（图像）+ Veo 2.0（视频） |
| **授权** | 🔴 需要 `GEMINI_API_KEY` |

**功能**：
- 图像生成
- 视频生成
- 图像转视频（Image-to-Video）
- 本地自动存储

---

### 4. Image Generation MCP Server（Flux 模型）

| 属性 | 详情 |
|------|------|
| **包名** | `@GongRzhe/Image-Generation-MCP-Server` |
| **模型** | Replicate Flux |
| **授权** | 🔴 需要 Replicate API Key（或免费额度） |

**功能**：
- 文本生成图像（Flux 模型）
- 纵横比、输出格式、数量控制
- 支持 WebP、JPG、PNG

**配置示例**：
```json
{
  "mcpServers": {
    "image-gen": {
      "command": "npx",
      "args": ["-y", "@gongrzhe/image-gen-server"]
    }
  }
}
```

---

### 5. ImageGen MCP Server（多模型）

| 属性 | 详情 |
|------|------|
| **包名** | ImageGen MCP Server |
| **模型** | GPT-Image-1、Google Imagen 4、Flux 1.1 等 |
| **特点** | 一个服务器切换多个模型 |

---

### 6. Cloudflare Image MCP（免费额度）

| 属性 | 详情 |
|------|------|
| **特点** | 使用 Cloudflare Workers AI 生成图像 |
| **授权** | 🔴 需要 Cloudflare API Key |
| **优势** | 有免费额度 |

---

## 四、其他推荐 MCP

### 1. Filesystem MCP（文件系统）⭐ 核心推荐

| 属性 | 详情 |
|------|------|
| **包名** | `@modelcontextprotocol/server-filesystem` |
| **官方仓库** | https://github.com/modelcontextprotocol/servers |
| **授权** | ❌ 无需授权 |

**功能**：
- 读取/写入文件
- 创建/列出/删除目录
- 移动/复制文件
- 搜索文件、获取文件元数据
- **安全限制**：只允许操作通过 `args` 指定的目录

**配置示例**：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/Users/hambu/Documents/kimi/workspace"]
    }
  }
}
```

> ⚠️ Windows 用户注意：如果 `npx` 调用失败，可用 `cmd /c` 包裹：
> ```json
> "command": "cmd", "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem", "C:/path/to/allowed/dir"]
> ```

---

### 2. Git MCP（本地 Git 操作）

| 属性 | 详情 |
|------|------|
| **包名** | `mcp-server-git`（Python）或官方 `server-git` |
| **安装** | `uvx mcp-server-git` 或 `npx @modelcontextprotocol/server-git` |
| **授权** | ❌ 无需授权（本地 Git 操作） |

**功能**：
- 读取、搜索、操作本地 Git 仓库
- 可选 push 支持

---

### 3. Godot MCP（游戏引擎集成）

| 属性 | 详情 |
|------|------|
| **仓库** | 多个实现可选（见下） |
| **适用** | Godot 4.x 游戏引擎 |

**可选方案**：

| 方案 | 仓库 | 工具数 | 特点 |
|------|------|--------|------|
| **GoPeak** | github.com/HaD0Yun/Gopeak-godot-mcp | 95+ | 最全面，含 DAP 调试、截图、输入注入 |
| **better-godot-mcp** | github.com/n24q02m/better-godot-mcp | 17 | 复合工具，无需认证 |
| **godot-mcp-runtime** | github.com/Erodenn/godot-mcp-runtime | 轻量 | 零安装，npx 直接运行 |
| **Godot-MCP (IvanMurzak)** | github.com/IvanMurzak/Godot-MCP | - | C# 插件，支持 Cloud 模式 |
| **tugcantopaloglu/godot-mcp** | github.com/tugcantopaloglu/godot-mcp | 149 | 完整 Godot 4.x 控制 |

**对「应急小达人」的价值**：
- 如果未来考虑用 Godot 引擎做桌面/移动端版本，这些 MCP 可以让 AI 直接操作 Godot 编辑器
- 场景管理、脚本读写、节点操作、项目运行/停止

---

### 4. Fetch MCP（网页内容获取）

| 属性 | 详情 |
|------|------|
| **包名** | `@modelcontextprotocol/server-fetch` |
| **官方仓库** | modelcontextprotocol/servers |
| **授权** | ❌ 无需授权 |

**功能**：
- 获取网页内容并转换为适合 LLM 阅读的格式
- 用于参考文档、教程、API 说明

---

### 5. Sequential Thinking MCP（思维链）

| 属性 | 详情 |
|------|------|
| **包名** | `@modelcontextprotocol/server-sequential-thinking` |
| **官方仓库** | modelcontextprotocol/servers |
| **授权** | ❌ 无需授权 |

**功能**：
- 动态反思式问题解决
- 帮助 AI 进行复杂逻辑推理和规划

---

### 6. Memory MCP（知识图谱持久记忆）

| 属性 | 详情 |
|------|------|
| **包名** | `@modelcontextprotocol/server-memory` |
| **官方仓库** | modelcontextprotocol/servers |
| **授权** | ❌ 无需授权 |

**功能**：
- 基于知识图谱的跨会话记忆
- 存储项目信息、偏好设置、历史决策

---

### 7. Brave Search MCP（网络搜索）

| 属性 | 详情 |
|------|------|
| **包名** | `@modelcontextprotocol/server-brave-search` |
| **特点** | 隐私优先搜索，返回干净 JSON |
| **授权** | 🔴 需要 `BRAVE_API_KEY`（每月 2k 免费） |

---

## 五、授权提醒汇总 🔐

| MCP 服务器 | 是否需要授权 | 所需凭证 | 获取方式 |
|-----------|------------|---------|---------|
| **GitHub 官方 MCP（远程 OAuth）** | ⚠️ 需要 | OAuth 登录 | VS Code / Cursor 一键授权 |
| **GitHub 官方 MCP（本地 PAT）** | ⚠️ 需要 | GitHub Personal Access Token | GitHub Settings → Developer settings → Tokens |
| **Playwright MCP** | ✅ 无需 | 无 | 本地运行 |
| **Puppeteer MCP** | ✅ 无需 | 无 | 本地运行 |
| **Chrome DevTools MCP** | ✅ 无需 | 无 | 本地运行 |
| **Browserbase MCP** | 🔴 需要 | `BROWSERBASE_API_KEY` | Browserbase 官网注册 |
| **DALL-E / GPT Image MCP** | 🔴 需要 | `OPENAI_API_KEY` | OpenAI 官网 |
| **Gemini Image MCP** | 🔴 需要 | `GEMINI_API_KEY` | Google AI Studio |
| **Flux Image MCP** | 🔴 需要 | Replicate API Key | Replicate 官网 |
| **Filesystem MCP** | ✅ 无需 | 无 | 本地运行 |
| **Git MCP** | ✅ 无需 | 无 | 本地运行 |
| **Godot MCP** | ✅ 无需 | 无（部分可选 `GODOT_PATH`） | 本地运行 |
| **Fetch MCP** | ✅ 无需 | 无 | 本地运行 |
| **Memory MCP** | ✅ 无需 | 无 | 本地运行 |
| **Brave Search MCP** | 🔴 需要 | `BRAVE_API_KEY` | Brave Search API 官网 |

---

## 六、Kimi 桌面端配置方法

### 当前环境说明

Kimi 桌面端（Kimi Work / Daimon）的 MCP 配置方式与其他客户端（如 Cursor、Claude Desktop）**有所不同**。Kimi Work 的 MCP 服务器以**插件（Plugin）形式**提供，通过 `SystemList` 和 `SystemInvoke` 工具调用。

### 通用配置原则

如果 Kimi 桌面端支持标准 MCP 配置（JSON 格式），典型配置如下：

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/Users/hambu/Documents/kimi/workspace"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

### Windows 特殊处理

Windows 上 `npx` 可能无法直接执行，需要 `cmd /c` 包裹：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem", "C:/Users/hambu/Documents/kimi/workspace"]
    }
  }
}
```

### 前置依赖检查

在配置前，确保系统已安装：

```bash
# 检查 Node.js（需 v18+）
node --version

# 检查 npm
npm --version

# 检查 Docker（如使用 GitHub MCP 本地版）
docker --version

# 检查 npx
npx --version
```

### 安装 Playwright 浏览器（首次使用）

```bash
npx playwright install
```

---

## 七、针对「应急小达人」的推荐配置

### 阶段 1：核心开发（当前最适用）

| 优先级 | MCP | 用途 |
|-------|-----|------|
| ⭐⭐⭐ | **GitHub MCP** | 代码推送、Issue 管理、PR 创建、Actions 监控 |
| ⭐⭐⭐ | **Filesystem MCP** | 本地文件读写、项目结构管理 |
| ⭐⭐ | **Git MCP** | 本地 Git 操作、提交历史查看 |
| ⭐⭐ | **Playwright MCP** | 网页游戏测试、跨浏览器兼容性验证 |
| ⭐ | **Fetch MCP** | 获取参考文档、API 说明 |

### 阶段 2：素材增强（可选）

| 优先级 | MCP | 用途 |
|-------|-----|------|
| ⭐⭐ | **DALL-E / Gemini Image MCP** | 生成游戏插图、背景、图标 |
| ⭐ | **Brave Search MCP** | 搜索设计灵感、参考素材 |

### 阶段 3：引擎迁移（远期）

| 优先级 | MCP | 用途 |
|-------|-----|------|
| ⭐⭐ | **Godot MCP** | 如迁移到 Godot 引擎，AI 直接操作编辑器 |

---

## 八、MCP 服务器资源列表

### 官方资源

| 资源 | 链接 |
|------|------|
| MCP 官方文档 | https://modelcontextprotocol.io |
| 官方参考服务器 | https://github.com/modelcontextprotocol/servers |
| GitHub 官方 MCP | https://github.com/github/github-mcp-server |
| Playwright MCP（微软） | https://github.com/microsoft/playwright-mcp |
| Chrome DevTools MCP | https://github.com/ChromeDevTools/chrome-devtools-mcp |

### 第三方聚合列表

| 资源 | 链接 |
|------|------|
| Awesome MCP Servers | https://github.com/punkpeye/awesome-mcp-servers |
| MCP Servers Directory | https://mcpservers.org |
| MCP Registry | https://registry.modelcontextprotocol.io |
| LobeHub MCP 目录 | https://lobehub.com/mcp |
| Glama MCP 目录 | https://glama.ai/mcp/servers |
| PulseMCP 搜索 | https://www.pulsemcp.com/servers |
| best-of-mcp-servers | https://github.com/tolkonepiu/best-of-mcp-servers |

---

## 九、快速行动清单

1. **获取 GitHub PAT** → https://github.com/settings/tokens → 生成 `repo` 权限的 Token
2. **安装 Node.js** → https://nodejs.org（如未安装）
3. **安装 Docker** → https://docker.com（如未安装，用于 GitHub MCP 本地版）
4. **测试 Filesystem MCP** → 零配置，直接添加路径即可使用
5. **测试 Playwright MCP** → 运行 `npx playwright install` 安装浏览器后配置
6. **配置 GitHub MCP** → 使用 OAuth 远程版（最简单）或 PAT + Docker 本地版
7. **验证连接** → 问 AI "你有什么 MCP 工具？" 或 "帮我查看当前目录"

---

> **报告生成说明**：本报告基于 2026 年 6 月的公开信息整理，MCP 生态快速迭代，建议定期查看上述资源列表获取最新服务器。
