def main(ctx):
    import os
    path = r'C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren\game.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    start = content.find(',_refreshPage(pageId){')
    if start == -1:
        start = content.find('_refreshPage(pageId){')
    if start == -1:
        return {'error': 'not found'}

    brace = content.find('{', start)
    depth = 0
    end = brace
    for i in range(brace, len(content)):
        if content[i] == '{':
            depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0:
                end = i
                break

    func_code = content[start:end+1]
    out_path = os.path.join(ctx['runDir'], '_refreshPage.txt')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(func_code)
    return {'out_path': out_path, 'length': len(func_code)}
