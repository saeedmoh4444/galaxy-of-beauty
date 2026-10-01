"""S3 dedupe — duplicate i18n keys between misc.ts and mobile/customerA.ts.

Rule (per-platform split is intentional — web = domain files, mobile =
domain + overlays):
- identical values          -> remove the customerA duplicate (redundancy)
- corrupted mobile values   -> repair customerA in place: trim leading
  spaces; if truncated (starts mid-word), copy misc's value
- genuine distinct copy     -> KEPT (platform-specific phrasing /
  interpolation signatures must not be unified)
"""
import io, re

MISC = 'packages/shared/src/i18n/messages/misc.ts'
CUSTA = 'packages/shared/src/i18n/messages/mobile/customerA.ts'

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

misc = load(MISC)
custa = load(CUSTA)

dups = [k for k in misc if k in custa]
print(f"duplicates: {len(dups)}")

identical, corrupted, kept = [], [], []
for k in dups:
    ma, me = misc[k]
    ca, ce = custa[k]
    if (ma, me) == (ca, ce):
        identical.append(k)
        continue
    c_corrupt = (ca is not None and ca != ca.lstrip()) or (ce is not None and ce != ce.lstrip())
    c_trunc = (
        (ce is not None and len(ce) < 20 and re.match(r'^[a-z][a-z]?\s', ce) is not None)
        or (ca is not None and len(ca) < 20 and re.match(r'^[؀-ۿ]\s', ca) is not None)
    )
    if c_corrupt or c_trunc:
        corrupted.append(k)
    else:
        kept.append(k)

print(f"identical-removed: {len(identical)}, corrupted-repaired: {len(corrupted)}, kept-distinct: {len(kept)}")

with io.open(CUSTA, 'r', encoding='utf-8') as f:
    custa_src = f.read()

report = []

# repair corrupted in customerA: use misc value (trimmed)
for k in corrupted:
    b = block_bounds(custa_src, k)
    if not b:
        report.append(f"NOTE {k}: block not found in customerA")
        continue
    ma, me = misc[k]
    new_block = f"'{k}': {{ ar: '{ma}', en: '{me}' }},"
    custa_src = custa_src[:b[0]] + new_block + custa_src[b[1]:]
    report.append(f"repaired {k}")

# remove identical duplicates from customerA
bounds_list = [b for k in identical if (b := block_bounds(custa_src, k))]
for start, end in sorted(bounds_list, reverse=True):
    custa_src = custa_src[:start] + custa_src[end:]

with io.open(CUSTA, 'w', encoding='utf-8', newline='\n') as f:
    f.write(custa_src)

with io.open('scripts/dedupe-report.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(report))
print(f"done: {len(corrupted)} repaired, {len(bounds_list)} identical blocks removed")
