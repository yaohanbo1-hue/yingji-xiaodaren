import re, json

def extract_engine(content, name):
    pattern = r'(?:const\s+)?' + re.escape(name) + r'\s*=\s*\{'
    match = re.search(pattern, content)
    if not match:
        return None
    start = match.start()
    brace_count = 0
    in_string = False
    string_char = None
    i = start
    while i < len(content):
        c = content[i]
        if not in_string:
            if c in '"\'`':
                in_string = True
                string_char = c
            elif c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
                if brace_count == 0:
                    break
        else:
            if c == string_char and content[i-1] != '\\':
                in_string = False
        i += 1
    return content[start:i+1]

def extract_method_body(code, method_name):
    match = re.search(r'\b' + re.escape(method_name) + r'\b\s*[:\(][^\)]*\)?\s*\{', code)
    if not match:
        return None
    start = match.end()
    brace_count = 1
    in_string = False
    string_char = None
    i = start
    while i < len(code) and brace_count > 0:
        c = code[i]
        if not in_string:
            if c in '"\'`':
                in_string = True
                string_char = c
            elif c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
        else:
            if c == string_char and code[i-1] != '\\':
                in_string = False
        i += 1
    return code[start:i]

with open(r'C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren\game.js', 'r', encoding='utf-8') as f:
    content = f.read()

with open(r'C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open(r'C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren\real-cases.js', 'r', encoding='utf-8') as f:
    rc = f.read()

results = {}

# StoryEngine chapters
story = extract_engine(content, 'StoryEngine')
ch_match = re.search(r'chapters\s*:\s*\[', story)
chapters_count = 0
if ch_match:
    start = ch_match.end() - 1
    bc = 0
    in_s = False
    sc = None
    i = start
    while i < len(story):
        c = story[i]
        if not in_s:
            if c in '"\'`':
                in_s = True
                sc = c
            elif c == '[':
                bc += 1
            elif c == ']':
                bc -= 1
                if bc == 0:
                    break
        else:
            if c == sc and story[i-1] != '\\':
                in_s = False
        i += 1
    arr = story[start:i+1]
    chapters_count = len(re.findall(r'title\s*:', arr))

results['StoryEngine'] = {
    'chapters_count': chapters_count,
    'has_chapters': 'chapters' in story,
    'has_underscore_chapters': '_chapters' in story,
    'methods': list(set(re.findall(r'([a-zA-Z_][a-zA-Z0-9_]*)\s*[:\(][^\)]*\)?\s*\{', story)))
}

# BossRushEngine
boss = extract_engine(content, 'BossRushEngine')
end_body = extract_method_body(boss, 'end')
victory_body = extract_method_body(boss, 'victory')
startBoss_body = extract_method_body(boss, 'startBoss')

results['BossRushEngine'] = {
    'has_end': end_body is not None,
    'has_victory': victory_body is not None,
    'has_startBoss': startBoss_body is not None,
    'end_body': (end_body[:200] if end_body else ''),
    'victory_body': (victory_body[:200] if victory_body else ''),
    'startBoss_body': (startBoss_body[:200] if startBoss_body else '')
}

# RealCasesEngine
rc_ids = re.findall(r'getElementById\(["\']([^"\']+)["\']\)', rc)
rc_nav = re.findall(r'PageManager\.navigate\(["\']([^"\']+)["\']\)', rc)
rc_missing = [id for id in rc_ids if f'id="{id}"' not in html and f"id='{id}'" not in html]

results['RealCasesEngine'] = {
    'dom_ids': rc_ids,
    'missing_ids': rc_missing,
    'navigate_calls': rc_nav
}

with open(r'C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren\reports\final_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print('Done')
