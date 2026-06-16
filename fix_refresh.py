
import re
import os

os.chdir(r'C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren')

def main(ctx):
    # Read v41 game.js
    with open('game_v41.js', 'r', encoding='utf-8') as f:
        v41_content = f.read()
    
    # Read current v43 game.js
    with open('game.js', 'r', encoding='utf-8') as f:
        current_content = f.read()
    
    # Extract _refreshPage from v41
    v41_idx = v41_content.find('_refreshPage(pageId){')
    v41_start = v41_idx + len('_refreshPage(pageId){')
    v41_brace_count = 1
    v41_end = v41_start
    in_string = False
    string_char = None
    escape = False
    
    for i in range(v41_start, len(v41_content)):
        c = v41_content[i]
        if escape:
            escape = False
            continue
        if c == '\\':
            escape = True
            continue
        if c == '"' or c == "'":
            if not in_string:
                in_string = True
                string_char = c
            elif string_char == c:
                in_string = False
                string_char = None
            continue
        if in_string:
            continue
        if c == '{':
            v41_brace_count += 1
        elif c == '}':
            v41_brace_count -= 1
            if v41_brace_count == 0:
                v41_end = i
                break
    
    v41_refresh_body = v41_content[v41_start:v41_end]
    print(f'v41 _refreshPage body length: {len(v41_refresh_body)}')
    
    # Extract _refreshPage from current
    curr_idx = current_content.find('_refreshPage(pageId){')
    curr_start = curr_idx + len('_refreshPage(pageId){')
    curr_brace_count = 1
    curr_end = curr_start
    in_string = False
    string_char = None
    escape = False
    
    for i in range(curr_start, len(current_content)):
        c = current_content[i]
        if escape:
            escape = False
            continue
        if c == '\\':
            escape = True
            continue
        if c == '"' or c == "'":
            if not in_string:
                in_string = True
                string_char = c
            elif string_char == c:
                in_string = False
                string_char = None
            continue
        if in_string:
            continue
        if c == '{':
            curr_brace_count += 1
        elif c == '}':
            curr_brace_count -= 1
            if curr_brace_count == 0:
                curr_end = i
                break
    
    curr_refresh_body = current_content[curr_start:curr_end]
    print(f'Current _refreshPage body length: {len(curr_refresh_body)}')
    
    # Add engine calls to v41 body
    # Find the right position to insert - after "music" page check
    # Look for "music"===pageId pattern in v41 body
    insert_pos = v41_refresh_body.rfind('"music"===pageId')
    if insert_pos < 0:
        insert_pos = len(v41_refresh_body)
    
    # Get the context after insert_pos to see if there's a comma
    context_after = v41_refresh_body[insert_pos:insert_pos+50]
    print(f'Context after insert point: {context_after}')
    
    # Build new engine calls string
    engine_calls = 'void 0!==StoryEngine&&StoryEngine._renderChapterSelect(),"timed-escape"===pageId&&void 0!==TimedEscapeEngine&&(TimedEscapeEngine.init(),TimedEscapeEngine._showQuestion()),"precision-strike"===pageId&&void 0!==PrecisionStrikeEngine&&(PrecisionStrikeEngine.init(),PrecisionStrikeEngine._showQuestion()),'
    
    # Insert the engine calls
    new_refresh_body = v41_refresh_body[:insert_pos] + engine_calls + v41_refresh_body[insert_pos:]
    
    # Replace current _refreshPage with new one
    new_content = current_content[:curr_start] + new_refresh_body + current_content[curr_end:]
    
    with open('game.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'New _refreshPage body length: {len(new_refresh_body)}')
    print('Fixed _refreshPage!')
    
    return "done"
