#!/usr/bin/env python3
"""应急小达人WebBridge截图检查脚本"""
import subprocess
import json
import time
import os

SESSION = "check-yingji"
URL = "https://yaohanbo1-hue.github.io/yingji-xiaodaren/"
OUTDIR = "C:/Users/hambu/Documents/kimi/workspace/check"

# 页面列表
P1_PAGES = [
    ("page-firstaid", "急救工坊"),
    ("page-survival", "生存挑战"),
    ("page-bossrush", "Boss挑战"),
    ("page-timed", "限时挑战"),
    ("page-eggs", "彩蛋探索"),
    ("page-memory-card", "记忆卡片"),
    ("page-calendar", "日历"),
    ("page-minigame", "游戏中心"),
]

P2_PAGES = [
    ("page-free", "自由模式"),
    ("page-speed", "极速模式"),
    ("page-battle-lobby", "对战大厅"),
    ("page-leaderboard", "排行榜"),
    ("page-wrong-book", "错题本"),
    ("page-museum", "灾害博物馆"),
    ("page-codex", "灾害图鉴"),
    ("page-achievements", "成就"),
    ("page-shop", "商城"),
]

P3_PAGES = [
    ("page-stats", "统计"),
    ("page-character", "角色"),
    ("page-certification", "认证"),
    ("page-settings", "设置"),
    ("page-encyclopedia", "百科全书"),
    ("page-music", "音乐中心"),
    ("page-base", "安全基地"),
]

def wb_command(action, args, session=SESSION):
    """发送WebBridge命令"""
    body = json.dumps({"action": action, "args": args, "session": session}, ensure_ascii=False)
    result = subprocess.run(
        ["curl.exe", "-s", "-X", "POST", "http://127.0.0.1:10086/command",
         "-H", "Content-Type: application/json", "--data-binary", body],
        capture_output=True, text=True, encoding="utf-8"
    )
    try:
        return json.loads(result.stdout)
    except:
        return {"raw": result.stdout, "err": result.stderr}

def screenshot_page(page_id, page_name, priority):
    """截图单个页面"""
    out_path = f"{OUTDIR}/check-{page_id.replace('page-', '')}.jpg"
    
    # 导航到页面
    nav_code = f"PageManager.navigate('{page_id}');"
    result = wb_command("evaluate", {"code": nav_code})
    print(f"[{priority}] {page_name} ({page_id}) navigate: {result}")
    
    # 等待渲染
    time.sleep(3)
    
    # 截图
    result = wb_command("screenshot", {
        "format": "jpeg", "quality": 80, "path": out_path
    })
    
    if result.get("ok") and result.get("data", {}).get("path"):
        path = result["data"]["path"]
        size = result["data"].get("sizeBytes", 0)
        print(f"  ✓ Screenshot saved: {path} ({size} bytes)")
        return path
    else:
        print(f"  ✗ Screenshot failed: {result}")
        return None

def main():
    print("=" * 60)
    print("应急小达人 页面截图检查")
    print("=" * 60)
    
    # 确保主页已经加载
    print("\n主页已加载，开始截图P1页面...")
    
    # P1 页面
    p1_paths = []
    for page_id, page_name in P1_PAGES:
        path = screenshot_page(page_id, page_name, "P1")
        if path:
            p1_paths.append((page_id, page_name, path))
        time.sleep(2)
    
    # P2 页面
    print("\n开始截图P2页面...")
    p2_paths = []
    for page_id, page_name in P2_PAGES:
        path = screenshot_page(page_id, page_name, "P2")
        if path:
            p2_paths.append((page_id, page_name, path))
        time.sleep(2)
    
    # P3 页面
    print("\n开始截图P3页面...")
    p3_paths = []
    for page_id, page_name in P3_PAGES:
        path = screenshot_page(page_id, page_name, "P3")
        if path:
            p3_paths.append((page_id, page_name, path))
        time.sleep(2)
    
    # 汇总报告
    print("\n" + "=" * 60)
    print("截图完成汇总")
    print("=" * 60)
    print(f"\nP1 页面 ({len(p1_paths)}):")
    for page_id, page_name, path in p1_paths:
        print(f"  - {page_name}: {path}")
    print(f"\nP2 页面 ({len(p2_paths)}):")
    for page_id, page_name, path in p2_paths:
        print(f"  - {page_name}: {path}")
    print(f"\nP3 页面 ({len(p3_paths)}):")
    for page_id, page_name, path in p3_paths:
        print(f"  - {page_name}: {path}")
    
    return {"p1": p1_paths, "p2": p2_paths, "p3": p3_paths}

if __name__ == "__main__":
    main()
