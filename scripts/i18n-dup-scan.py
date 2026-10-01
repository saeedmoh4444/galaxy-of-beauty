import io, re

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

def load(path):
    with io.open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    keys = {}
    for m in re.finditer(r"'([^']+)':\s*\{", content):
        key = m.group(1)
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
        block = content[i + 1:j]
        keys[key] = (extract_after(block, 'ar:'), extract_after(block, 'en:'))
    return keys

misc = load('packages/shared/src/i18n/messages/misc.ts')
custA = load('packages/shared/src/i18n/messages/mobile/customerA.ts')

identical, conflict = [], []
for k in misc:
    if k in custA:
        if misc[k] == custA[k]:
            identical.append(k)
        else:
            conflict.append((k, misc[k], custA[k]))
print(f"misc={len(misc)} customerA={len(custA)}")
print(f"identical: {len(identical)}, conflicting: {len(conflict)}")
with io.open('scripts/dup-conflicts.txt', 'w', encoding='utf-8') as f:
    for k, m, c in conflict:
        f.write(f"{k}\t{m[0]}\t{m[1]}\t{c[0]}\t{c[1]}\n")
with io.open('scripts/dup-identical.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(identical))
print("written to scripts/dup-conflicts.txt and scripts/dup-identical.txt")
