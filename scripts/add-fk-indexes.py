"""Add @@index([col]) to target models, inserted before each model's
@@map line. Line-based — models are bounded by the next '^model ' /
'^enum ' / '^type ' line, so no brace ambiguity."""
import io, re

path = 'packages/db/prisma/schema.prisma'
with io.open(path, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

targets = {
    'Technician': ['userId'],
    'Wallet': ['userId'],
    'Booking': ['serviceId', 'addressId'],
    'Review': ['bookingId'],
    'Dispute': ['bookingId'],
    'ZatcaInvoice': ['bookingId'],
    'CustomerAiSubscription': ['planId'],
    'Streak': ['customerId'],
    'Vendor': ['userId'],
    'EventCertificate': ['registrationId'],
    'KindnessAccount': ['userId'],
    'ClassPassPurchase': ['passId'],
    'SeasonalService': ['categoryId'],
}

BOUNDARY = re.compile(r'^(model|enum|type) ')

def block_end(start):
    for i in range(start + 1, len(lines)):
        if BOUNDARY.match(lines[i]):
            return i
    return len(lines)

out = []
i = 0
done = set()
while i < len(lines):
    m = re.match(r'^model (\w+) \{', lines[i])
    if m and m.group(1) in targets and m.group(1) not in done:
        name = m.group(1)
        end = block_end(i)
        block = lines[i:end]
        # find @@map line index within block; insert indexes before it
        map_idx = next((j for j, l in enumerate(block) if '@@map' in l), None)
        idx_lines = [f'  @@index([{c}])' for c in targets[name]]
        if map_idx is not None:
            block = block[:map_idx] + idx_lines + block[map_idx:]
        else:
            # no @@map — insert before closing brace
            close = max(j for j, l in enumerate(block) if l.strip() == '}')
            block = block[:close] + idx_lines + block[close:]
        out.extend(block)
        done.add(name)
        i = end
    else:
        out.append(lines[i])
        i += 1

with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(out))
print('done:', sorted(done))
