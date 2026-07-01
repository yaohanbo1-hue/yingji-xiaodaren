#!/bin/bash
# 应急小达人 页面截图检查脚本

SESSION="check-yingji"
OUTDIR="C:/Users/hambu/Documents/kimi/workspace/check"

# WebBridge 命令发送函数
wb_cmd() {
    local action="$1"
    local args="$2"
    curl.exe -s -X POST "http://127.0.0.1:10086/command" \
        -H "Content-Type: application/json" \
        --data-binary "{\"action\":\"$action\",\"args\":$args,\"session\":\"$SESSION\"}"
}

# 截图页面函数
screenshot_page() {
    local page_id="$1"
    local page_name="$2"
    local priority="$3"
    local out_name="$4"
    local out_path="$OUTDIR/$out_name.jpg"
    
    echo ""
    echo "[$priority] $page_name ($page_id)"
    
    # 导航到页面
    local nav_result
    nav_result=$(wb_cmd "evaluate" "{\"code\":\"PageManager.navigate('$page_id');\"}")
    echo "  Navigate result: $nav_result"
    
    # 等待渲染
    sleep 4
    
    # 截图
    local ss_result
    ss_result=$(wb_cmd "screenshot" "{\"format\":\"jpeg\",\"quality\":80,\"path\":\"$out_path\"}")
    echo "  Screenshot: $ss_result"
    
    sleep 2
}

echo "========================================"
echo "应急小达人 页面截图检查"
echo "========================================"

# P1 页面
echo ""
echo "--- P1 页面 ---"
screenshot_page "page-firstaid"      "急救工坊"     "P1" "check-firstaid"
screenshot_page "page-survival"      "生存挑战"     "P1" "check-survival"
screenshot_page "page-bossrush"      "Boss挑战"    "P1" "check-bossrush"
screenshot_page "page-timed"         "限时挑战"     "P1" "check-timed"
screenshot_page "page-eggs"          "彩蛋探索"     "P1" "check-eggs"
screenshot_page "page-memory-card"   "记忆卡片"     "P1" "check-memory-card"
screenshot_page "page-calendar"      "日历"        "P1" "check-calendar"
screenshot_page "page-minigame"      "游戏中心"     "P1" "check-minigame"

# P2 页面
echo ""
echo "--- P2 页面 ---"
screenshot_page "page-free"          "自由模式"     "P2" "check-free"
screenshot_page "page-speed"         "极速模式"     "P2" "check-speed"
screenshot_page "page-battle-lobby"  "对战大厅"     "P2" "check-battle-lobby"
screenshot_page "page-leaderboard"   "排行榜"       "P2" "check-leaderboard"
screenshot_page "page-wrong-book"    "错题本"       "P2" "check-wrong-book"
screenshot_page "page-museum"        "灾害博物馆"   "P2" "check-museum"
screenshot_page "page-codex"         "灾害图鉴"     "P2" "check-codex"
screenshot_page "page-achievements"  "成就"         "P2" "check-achievements"
screenshot_page "page-shop"          "商城"         "P2" "check-shop"

# P3 页面
echo ""
echo "--- P3 页面 ---"
screenshot_page "page-stats"         "统计"         "P3" "check-stats"
screenshot_page "page-character"     "角色"         "P3" "check-character"
screenshot_page "page-certification" "认证"         "P3" "check-certification"
screenshot_page "page-settings"      "设置"         "P3" "check-settings"
screenshot_page "page-encyclopedia"  "百科全书"     "P3" "check-encyclopedia"
screenshot_page "page-music"         "音乐中心"     "P3" "check-music"
screenshot_page "page-base"          "安全基地"     "P3" "check-base"

echo ""
echo "========================================"
echo "截图完成！"
echo "========================================"
ls -la "$OUTDIR"
