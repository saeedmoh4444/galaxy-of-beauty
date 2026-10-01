"""Scan customerA.ts for leading-space / truncated-value defects."""
import io, re

path = 'packages/shared/src/i18n/messages/mobile/customerA.ts'
with io.open(path, 'r', encoding='utf-8') as f:
    src = f.read()

def extract_after(block, label):
    i = block.find(label)
    q = block.find("'", i)
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
        if ch == "'":
            break
        out.append(ch)
        j += 1
    return ''.join(out)

suspects = []
for m in re.finditer(r"'([^']+)':\s*\{", src):
    key = m.group(1)
    i = m.end() - 1
    depth = 0
    j = i
    while j < len(src):
        ch = src[j]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                break
        j += 1
    block = src[i + 1:j]
    ar = extract_after(block, 'ar:')
    en = extract_after(block, 'en:')
    if ar and ar != ar.lstrip():
        suspects.append((key, 'ar-leading-space', ar[:40]))
    if en and en != en.lstrip():
        suspects.append((key, 'en-leading-space', en[:40]))
    if en and re.match(r'^[a-z][a-z]?\s', en):
        suspects.append((key, 'en-lowercase-start', en[:60]))
    if ar and re.match(r'^[a-z][a-z]?\s', ar):
        suspects.append((key, 'ar-lowercase-start', ar[:60]))

print(f"suspects: {len(suspects)}")
for s in suspects:
    print(s)
