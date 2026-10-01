"""Trim leading/trailing spaces in ar/en values across ALL i18n catalog
files. block_bounds-based (handles single-line AND multi-line entries —
the previous line-collector skipped single-line blocks). One value per
block per pass; idempotent — run until it reports 0."""
import io, re, glob

files = sorted(glob.glob('packages/shared/src/i18n/messages/**/*.ts', recursive=True))

def extract_val(block, label):
    i = block.find(label)
    if i < 0:
        return None
    q1 = block.find("'", i)
    q2 = block.find('"', i)
    if q1 < 0 or (0 <= q2 < q1):
        quote = '"'
        q = q2
    else:
        quote = "'"
        q = q1
    if q < 0:
        return None
    out = []
    j = q + 1
    while j < len(block):
        ch = block[j]
        if ch == '\\' and j + 1 < len(block):
            out.append(block[j + 1])
            j += 2
            continue
        if ch == quote:
            return (q, j, ''.join(out))
        out.append(ch)
        j += 1
    return None

def block_bounds(content, key):
    m = re.search(re.escape(f"'{key}':") + r"\s*\{", content)
    if not m:
        return None
    i = m.end() - 1
    depth = 0
    j = i
    while j < len(content):
        ch = content[j]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                break
        j += 1
    k = j + 1
    while k < len(content) and content[k] in ' \t':
        k += 1
    if k < len(content) and content[k] == ',':
        j = k
    return (m.start(), j + 1)

total_trimmed = 0
for path in files:
    with io.open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    keys = [m.group(1) for m in re.finditer(r"'([^']+)':\s*\{", src)]
    changed = False
    for key in keys:
        b = block_bounds(src, key)
        if not b:
            continue
        block = src[b[0]:b[1]]
        open_idx = block.find('{')
        # trim at most one value per block per pass
        for label in ('ar:', 'en:'):
            v = extract_val(block[open_idx + 1:], label)
            if v is None:
                continue
            q, end, val = v
            stripped = val.strip()
            if stripped == val:
                continue
            abs_q = open_idx + 1 + q
            abs_end = open_idx + 1 + end
            block = block[:abs_q + 1] + stripped + block[abs_end:]
            src = src[:b[0]] + block + src[b[1]:]
            changed = True
            total_trimmed += 1
            break
    if changed:
        with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(src)
        print(f"trimmed {path}")

print(f"total values trimmed: {total_trimmed}")
