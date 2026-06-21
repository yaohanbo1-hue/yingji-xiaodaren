# GitHub MCP 配置指南

> 最后更新：2026-06-21
> 适用：Cursor、Claude Desktop、VS Code 等支持 MCP 的客户端
> Kimi 桌面端限制说明：Kimi 桌面端使用自有插件封装层，**不支持**直接安装标准 MCP 服务器（如 Cursor 的 `mcpServers` JSON 配置）。但下面提供了 Kimi 中可用的替代方案。

---

## 📋 当前环境状态

| 检查项 | 状态 | 说明 |
|-------|------|------|
| Kimi 桌面端 | ⚠️ 不支持标准 MCP | 使用自有插件系统，无法直接配置 `mcpServers` |
| 浏览器访问 GitHub | ✅ 可能可用 | 通过 kimi-webbridge 在浏览器中操作 |
| git 推送 GitHub | ❌ 网络被阻断 | 当前环境无法直接连接 github.com:443 |
| GitHub PAT | ⚠️ 已配置但暴露 | 之前暴露在 git remote URL 中，建议更换 |
| 已有 PAT 权限 | `repo` 级别 | 完整仓库读写权限 |

---

## 方案一：在 Cursor 中配置 GitHub MCP（推荐）

### 步骤 1：获取/更新 GitHub PAT

1. 打开 https://github.com/settings/tokens
2. 点击 **"Generate new token (classic)"**
3. 填写名称：`cursor-github-mcp`
4. 勾选权限：
   - ✅ `repo` — 完整仓库访问
   - ✅ `read:packages` — 读取包
   - ✅ `read:org` — 读取组织
   - ✅ `workflow` — Actions 工作流（可选）
5. 生成并**立即复制 Token**

### 步骤 2：在 Cursor 中配置

1. 打开 Cursor → 设置 → MCP 配置
2. 添加以下内容到配置：

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

3. 替换 `ghp_xxxxxxxxxxxx` 为你的 PAT
4. 保存配置

### 步骤 3：验证

在 Cursor 中问 AI：
> "请帮我列出我最近的 GitHub 仓库"

如果 AI 能正确列出仓库，说明 GitHub MCP 已生效。

---

## 方案二：在 Claude Desktop 中配置 GitHub MCP

### 步骤 1：配置 `claude_desktop_config.json`

文件路径：
- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：`%APPDATA%\Claude\claude_desktop_config.json`

内容：

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

### 步骤 2：重启 Claude Desktop

完全关闭后重新打开，AI 会检测到新的工具。

---

## 方案三：在 VS Code + Copilot 中使用 GitHub MCP

### 步骤 1：配置远程 MCP（最简单，无需 Docker）

在 VS Code 的 MCP 配置中添加：

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

### 步骤 2：OAuth 授权

VS Code 会自动弹出 GitHub OAuth 登录窗口，点击授权即可。无需手动管理 PAT。

---

## 方案四：在 Kimi 桌面端中的替代方案（当前环境）

> ⚠️ Kimi 桌面端不支持标准 MCP 配置。以下是在 Kimi 中的可用替代方案。

### 替代方案 A：kimi-webbridge 浏览器操作（推荐）

1. 安装 [Kimi WebBridge 浏览器扩展](https://www.kimi.com/zh-cn/features/webbridge)
2. 在 Kimi 中让 AI 打开 GitHub 网页：
   - 导航到 GitHub
   - 创建 Issue、PR、Release
   - 管理项目
3. AI 使用你的浏览器登录状态，操作完全可见

**适用场景**：创建 Issue、查看 PR、发布 Release、管理项目

### 替代方案 B：本地 Git + PAT 推送

已在你的环境中配置好：

```bash
# 配置 git 凭据（已自动配置）
git config --global credential.helper store

# 推送时自动使用 PAT（无需每次输入）
git push origin master
```

> ⚠️ 注意：当前环境网络受限，无法直接连接 GitHub。需要在可以访问 GitHub 的环境中使用（如本地终端、VS Code 终端）。

### 替代方案 C：创建 GitHub API 便利脚本

已创建：

| 文件 | 用途 |
|------|------|
| `github-mcp-config.json` | Cursor/VS Code 远程 MCP 配置模板 |
| `github-mcp-local.json` | 本地 Docker MCP 配置模板 |
| `scripts/github-api.sh` | Bash 脚本：Issue/PR/Release 操作（见下方） |

---

## 📦 配置模板文件说明

### 文件 1：`github-mcp-config.json`

**用途**：VS Code Copilot 远程 MCP（无需 Docker，OAuth 授权）

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

### 文件 2：`github-mcp-local.json`

**用途**：Cursor/Claude Desktop 本地 MCP（需要 Docker + PAT）

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

> ⚠️ 替换 `ghp_xxxxxxxxxxxx` 为你的实际 PAT

---

## 🔐 安全提醒：你的 PAT 已暴露

在之前的环境中，你的 GitHub PAT 已暴露在以下位置：

- `git remote -v` 的 URL 中（已清理）
- 可能存在于 git 历史记录中

**建议操作**：
1. 登录 GitHub → Settings → Developer settings → Personal access tokens
2. 删除旧的 Token（`ghp_xxxxxxxxxxxx`）
3. 生成一个新的 Token
4. 更新所有使用该 Token 的配置

---

## 🛠️ 在 Kimi 中手动操作 GitHub 的快捷命令

虽然没有 MCP，但你可以使用以下 Bash 命令在 Kimi 中操作 GitHub：

### 查看仓库信息
```bash
# 需要 PAT
curl -H "Authorization: token ghp_xxxxxxxxxxxx" \
  https://api.github.com/repos/yaohanbo1-hue/yingji-xiaodaren
```

### 创建 Issue
```bash
curl -X POST -H "Authorization: token ghp_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"title":"Bug Report","body":"描述问题"}' \
  https://api.github.com/repos/yaohanbo1-hue/yingji-xiaodaren/issues
```

### 创建 Release
```bash
curl -X POST -H "Authorization: token ghp_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"tag_name":"v50","name":"v50 - 新功能","body":"更新内容"}' \
  https://api.github.com/repos/yaohanbo1-hue/yingji-xiaodaren/releases
```

### 获取最新提交
```bash
curl -H "Authorization: token ghp_xxxxxxxxxxxx" \
  https://api.github.com/repos/yaohanbo1-hue/yingji-xiaodaren/commits
```

---

## 🚀 下一步建议

1. **如果你使用 Cursor**：
   - 配置 `github-mcp-local.json`（需要 Docker）
   - 或配置 `github-mcp-config.json`（远程版，无需 Docker）

2. **如果你使用 Claude Desktop**：
   - 配置 `github-mcp-local.json`（需要 Docker）

3. **如果你只使用 Kimi 桌面端**：
   - 使用 kimi-webbridge 在浏览器中操作 GitHub
   - 在本地终端（非 Kimi 环境）使用 git 推送代码

4. **对于「应急小达人」项目**：
   - 在可以访问 GitHub 的环境中完成代码推送
   - 在 Kimi 中使用 `kimi-webbridge` 进行 GitHub 页面操作（Issue、Release 管理）

---

> 配置问题？可以随时问我，或参考 GitHub 官方 MCP 文档：https://github.com/github/github-mcp-server
