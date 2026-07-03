import os
import re

def check_css_file(filepath):
    """检查单个CSS文件的语法问题"""
    issues = []
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    lines = content.split('\n')
    
    # 1. 检查大括号匹配（去除注释和字符串后）
    brace_open = 0
    brace_close = 0
    in_string = False
    string_char = None
    for line in lines:
        # 移除单行注释
        clean_line = re.sub(r'//.*', '', line)
        # 移除多行注释（简单处理）
        clean_line = re.sub(r'/\*.*?\*/', '', clean_line)
        
        i = 0
        while i < len(clean_line):
            ch = clean_line[i]
            if not in_string and ch in ('"', "'"):
                in_string = True
                string_char = ch
            elif in_string and ch == string_char:
                # 检查是否是转义
                if i > 0 and clean_line[i-1] != '\\':
                    in_string = False
                    string_char = None
            elif not in_string:
                if ch == '{':
                    brace_open += 1
                elif ch == '}':
                    brace_close += 1
            i += 1
    
    if brace_open != brace_close:
        issues.append(f"brace_mismatch: {brace_open} vs {brace_close}")
    
    # 2. 检查url()中未闭合的引号
    for i, line in enumerate(lines, 1):
        # 查找 url(" 或 url('
        url_start_double = line.find('url("')
        url_start_single = line.find("url('")
        if url_start_double >= 0:
            substr = line[url_start_double:]
            if not re.search(r'url\s*\(\s*"[^"]*"\s*\)', substr):
                issues.append(f"unclosed_url_quote at line {i}")
        if url_start_single >= 0:
            substr = line[url_start_single:]
            if not re.search(r"url\s*\(\s*'[^']*'\s*\)", substr):
                issues.append(f"unclosed_url_quote at line {i}")
    
    # 3. 检查calc()中未闭合的括号
    for i, line in enumerate(lines, 1):
        if 'calc(' in line:
            # 统计从calc(开始的括号
            calc_pos = line.find('calc(')
            if calc_pos >= 0:
                depth = 0
                for j, ch in enumerate(line[calc_pos:]):
                    if ch == '(':
                        depth += 1
                    elif ch == ')':
                        depth -= 1
                        if depth == 0:
                            break
                if depth != 0:
                    # 可能跨行，检查下一行
                    if i < len(lines):
                        next_line = lines[i]
                        for ch in next_line:
                            if ch == '(':
                                depth += 1
                            elif ch == ')':
                                depth -= 1
                                if depth == 0:
                                    break
                    if depth != 0:
                        issues.append(f"calc_unclosed_parens at line {i}")
    
    # 4. 检查 -webkit- 前缀的无效属性组合
    for i, line in enumerate(lines, 1):
        if '-webkit-text-fill-color' in line and 'transparent' not in line:
            # 这不是错误，只是可疑，先不报告
            pass
    
    return issues

def main(ctx):
    root_dir = r'C:\Users\hambu\Documents\kimi\workspace'
    css_files = sorted([f for f in os.listdir(root_dir) if f.endswith('.css')])
    
    results = {}
    for css_file in css_files:
        filepath = os.path.join(root_dir, css_file)
        issues = check_css_file(filepath)
        results[css_file] = issues
    
    # 输出汇总
    output_lines = []
    output_lines.append(f"Found {len(css_files)} CSS files\n")
    output_lines.append("=" * 60)
    
    total_issues = 0
    for css_file, issues in results.items():
        if issues:
            output_lines.append(f"\n[FILE] {css_file}")
            output_lines.append("-" * 40)
            for issue in issues:
                output_lines.append(f"  ISSUE: {issue}")
            total_issues += len(issues)
        else:
            output_lines.append(f"\n[OK] {css_file}")
    
    output_lines.append("\n" + "=" * 60)
    output_lines.append(f"TOTAL ISSUES: {total_issues}")
    
    return "\n".join(output_lines)
