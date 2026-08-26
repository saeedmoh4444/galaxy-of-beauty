import { prisma } from '../db/src/client';
import { SMALL_PAGE_SIZE } from '../shared/src/constants';

async function main() {
  const now = Date.now();
  const mk = async (offset: number, label: string) => {
    const user = await prisma.user.create({
      data: {
        email: `debug-${label}-${Date.now()}-${Math.random()}@example.com`,
        phone: `+9665${Math.floor(10000000 + Math.random() * 89999999)}`,
        name: label,
        role: 'TECHNICIAN',
        passwordHash: 'x',
        isActive: true,
        emailVerified: true,
      },
    });
    const tech = await prisma.technician.create({
      data: {
        userId: user.id,
        city: 'x',
        bioJson: { ar: 'dbg', en: 'dbg' },
        createdAt: new Date(now + offset * 60_000),
      },
    });
    console.log(label, 'profile id', tech.id, 'createdAt', tech.createdAt.toISOString());
    return tech.id;
  };
  const t1 = await mk(3, 'T1');
  const t2 = await mk(2, 'T2');
  const t3 = await mk(1, 'T3');
  const rows = await prisma.technician.findMany({
    take: SMALL_PAGE_SIZE,
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true },
  });
  console.log(
    'top5:',
    rows.map((r) => `${r.id}@${r.createdAt.toISOString()}`),
  );
  console.log(
    't1 in top5:',
    rows.some((r) => r.id === t1),
  );
  console.log(
    'slice1 contains t1:',
    rows.slice(1).some((r) => r.id === t1),
  );
  await prisma.user.deleteMany({ where: { id: { in: [t1, t2, t3].map((id) => id) } } });
  void prisma;
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
