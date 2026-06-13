import re
import sys
import io

# 修复 Windows cmd 编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 读取 game.js
with open('game.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换 navigate('firstaid') 为 navigate('minigame')
content = content.replace("PageManager.navigate(\\'firstaid\\')", "PageManager.navigate(\\'minigame\\')")

# 替换 navigate('museum') 为 navigate('minigame')
content = content.replace("PageManager.navigate(\\'museum\\')", "PageManager.navigate(\\'minigame\\')")

# 写回 game.js
with open('game.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
print("- navigate('firstaid') -> navigate('minigame')")
print("- navigate('museum') -> navigate('minigame')")
