"""Rewrite the beautyBundle createMany block in seed.ts to per-row creates
with nested bundle_services rows (stage 8b)."""
import io

p = 'packages/db/prisma/seed.ts'
with io.open(p, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

start = next(i for i, l in enumerate(lines) if 'await db.beautyBundle.createMany({' in l)
end = next(i for i, l in enumerate(lines) if i > start and l.rstrip() == '    });')

rows = []
cur = None
depth = 0
for i in range(start + 2, end):
    line = lines[i]
    stripped = line.strip()
    if stripped.startswith('{') and cur is None:
        cur = [line]
        depth = line.count('{') - line.count('}')
        continue
    if cur is None:
        continue
    cur.append(line)
    depth += line.count('{') - line.count('}')
    if depth == 0 and len(cur) > 1:
        rows.append('\n'.join(cur))
        cur = None

print(f"parsed rows: {len(rows)}")

def convert(row):
    import re
    m = re.search(r"serviceIds: \[([^\]]+)\]", row)
    ids = [x.strip() for x in m.group(1).split(',')]
    nested = ", ".join(f"{{ serviceId: {i}, sortOrder: {n} }}" for n, i in enumerate(ids))
    return row[:m.start()] + f"services: {{ create: [{nested}] }}" + row[m.end():]

converted = [convert(r) for r in rows]

out = []
out.append("    // serviceIds moved to the bundle_services join table (stage 8b).")
out.append("    const beautyBundleRows = [")
for i, r in enumerate(converted):
    comma = "," if i < len(converted) - 1 else ""
    out.append(r.rstrip().rstrip(',') + comma)
out.append("    ];")
out.append("    for (const row of beautyBundleRows) {")
out.append("      await db.beautyBundle.create({ data: row });")
out.append("    }")

new_lines = lines[:start] + out + lines[end + 1:]
with io.open(p, 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(new_lines))
print("seed rewritten")
