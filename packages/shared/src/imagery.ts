/**
 * Imagery library — curated, license-free (Unsplash) photo pools keyed by
 * platform category, used by the seed and the imagery applier so every
 * service, category, product and venue carries a category-matched photo.
 *
 * Every URL in this file was verified live (HTTP 200) on 2026-11-21 — see
 * the pool unit tests for the shape gate. Replace dead IDs with verified
 * alternates only.
 *
 * Kept OUT of the root barrel on purpose: the URL strings would fatten the
 * web client bundle. Import via `@galaxy/shared/imagery` (server/data only).
 *
 * Rotation rule: `imageFor(key, i)` cycles deterministically through the
 * pool, so consecutive services in one category get different photos while
 * re-seeds stay stable.
 */

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const IMAGERY_POOLS: Record<string, string[]> = {
  haircare: [
    U('1560066984-138dadb4c035'),
    U('1560869713-7d0a29430803'),
    U('1562322140-8baeececf3df'),
    U('1519699047748-de8e457a634e'),
    U('1595476108010-b4d1f102b1b1'),
    U('1605497788044-5a32c7078486'),
    U('1633681926022-84c23e8cb2d6'),
    U('1580618672591-eb180b1a973f'),
  ],
  makeup: [
    U('1487412947147-5cebf100ffc2'),
    U('1522337660859-02fbefca4702'),
    U('1457972729786-0411a3b2b626'),
    U('1526045478516-99145907023c'),
    U('1596462502278-27bfdc403348'),
    U('1516975080664-ed2fc6a32937'),
    U('1522335789203-aabd1fc54bc9'),
    U('1571875257727-256c39da42af'),
  ],
  bridal: [
    U('1583939003579-730e3918a45a'),
    U('1594552072238-b8a33785b261'),
    U('1519741497674-611481863552'),
    U('1465495976277-4387d4b0b4c6'),
    U('1519225421980-715cb0215aed'),
    U('1595152772835-219674b2a8a6'),
    U('1520854221256-17451cc331bf'),
    U('1511285560929-80b456fea0bc'),
  ],
  nails: [
    U('1604654894610-df63bc536371'),
    U('1632345031435-8727f6897d53'),
    U('1604902396830-aca29e19b067'),
    U('1519014816548-bf5fe059798b'),
    U('1522337660859-02fbefca4702'),
    U('1607779097040-26e80aa78e66'),
    U('1610992015732-2449b76344bc'),
    U('1522337360788-8b13dee7a37e'),
  ],
  skincare: [
    U('1570172619644-dfd03ed5d881'),
    U('1616394584738-fc6e612e71b9'),
    U('1556228720-195a672e8a03'),
    U('1612817288484-6f916006741a'),
    U('1620916566398-39f1143ab7be'),
    U('1598440947619-2c35fc9aa908'),
    U('1552046122-03184de85e08'),
    U('1616683693504-3ea7e9ad6fec'),
  ],
  massage: [
    U('1544161515-4ab6ce6db874'),
    U('1519823551278-64ac92734fb1'),
    U('1540555700478-4be289fbecef'),
    U('1600334129128-685c5582fd35'),
    U('1515377905703-c4788e51af15'),
    U('1512290923902-8a9f81dc236c'),
    U('1583209814683-c023dd293cc6'),
    U('1571902943202-507ec2618e8f'),
  ],
  spa: [
    U('1540555700478-4be289fbecef'),
    U('1600334129128-685c5582fd35'),
    U('1570172619644-dfd03ed5d881'),
    U('1616394584738-fc6e612e71b9'),
    U('1519823551278-64ac92734fb1'),
    U('1519501025264-65ba15a82390'),
    U('1616683693504-3ea7e9ad6fec'),
    U('1583209814683-c023dd293cc6'),
  ],
  henna: [
    U('1594736797933-d0501ba2fe65'),
    U('1596462502278-27bfdc403348'),
    U('1583001931096-959e9a1a6223'),
    U('1487412947147-5cebf100ffc2'),
    U('1601758228041-f3b2795255f1'),
    U('1596704017254-9b121068fb31'),
  ],
  'waxing-threading': [
    U('1583001931096-959e9a1a6223'),
    U('1570172619644-dfd03ed5d881'),
    U('1596178060671-7a80dc8059ea'),
    U('1616394584738-fc6e612e71b9'),
    U('1598440947619-2c35fc9aa908'),
    U('1552046122-03184de85e08'),
  ],
  lashes: [
    U('1583001931096-959e9a1a6223'),
    U('1596462502278-27bfdc403348'),
    U('1487412947147-5cebf100ffc2'),
    U('1522335789203-aabd1fc54bc9'),
    U('1519415943484-9fa1873496d4'),
    U('1620331311520-246422fd82f9'),
  ],
  kids: [
    U('1502086223501-7ea6ecd79368'),
    U('1544005313-94ddf0286df2'),
    U('1602002418082-a4443e081dd1'),
    U('1503454537195-1dcabb73ffb9'),
    U('1562004760-aceed7bb0fe3'),
    U('1519699047748-de8e457a634e'),
  ],
  mens: [
    U('1503951914875-452162b0f3f1'),
    U('1585747860715-2ba37e788b70'),
    U('1605497788044-5a32c7078486'),
    U('1560066984-138dadb4c035'),
    U('1622286342621-4bd786c2447c'),
    U('1621605815971-fbc98d665033'),
  ],
  'products-fragrance': [
    U('1541643600914-78b084683601'),
    U('1592945403244-b3fbafd7f539'),
    U('1523293182086-7651a899d37f'),
    U('1588405748880-12d1d2a59f75'),
    U('1594035910387-fea47794261f'),
    U('1615634260167-c8cdede054de'),
  ],
  'products-makeup': [
    U('1586495777744-4413f21062fa'),
    U('1596704017254-9b121068fb31'),
    U('1571781926291-c477ebfd024b'),
    U('1522337660859-02fbefca4702'),
    U('1516975080664-ed2fc6a32937'),
    U('1620331311520-246422fd82f9'),
  ],
  'products-skincare': [
    U('1556228578-8c89e6adf883'),
    U('1620916566398-39f1143ab7be'),
    U('1608248543803-ba4f8c70ae0b'),
    U('1611930022073-b7a4ba5fcccd'),
    U('1556228720-195a672e8a03'),
    U('1556228453-efd6c1ff04f6'),
  ],
  'products-haircare': [
    U('1526947425960-945c6e72858f'),
    U('1535585209827-a15fcdbc4c2d'),
    U('1631729371254-42c2892f0e6e'),
    U('1585751119414-ef2636f8aede'),
    U('1522337660859-02fbefca4702'),
    U('1605497788044-5a32c7078486'),
  ],
  venues: [
    U('1560066984-138dadb4c035'),
    U('1562322140-8baeececf3df'),
    U('1633681926022-84c23e8cb2d6'),
    U('1600948836101-f9ffda59d250'),
    U('1519501025264-65ba15a82390'),
    U('1540555700478-4be289fbecef'),
    U('1600334129128-685c5582fd35'),
    U('1580618672591-eb180b1a973f'),
  ],
  beauty: [
    U('1487412947147-5cebf100ffc2'),
    U('1596462502278-27bfdc403348'),
    U('1522337660859-02fbefca4702'),
    U('1457972729786-0411a3b2b626'),
    U('1512290923902-8a9f81dc236c'),
    U('1583001931096-959e9a1a6223'),
    U('1570172619644-dfd03ed5d881'),
    U('1519415943484-9fa1873496d4'),
  ],
};

const SLUG_POOL_MAP: Record<string, string> = {
  hairstyling: 'haircare',
  'pixie-cut': 'haircare',
  'layered-bob': 'haircare',
  'under-hijab-scalp-treatment': 'haircare',
  'nursing-safe-hair-care': 'haircare',
  'postpartum-recovery-massage': 'massage',
  'mommy-and-me-hair': 'haircare',
  'kids-haircut': 'kids',
  makeup: 'makeup',
  'evening-makeup': 'makeup',
  'bridal-makeup': 'bridal',
  'mommy-and-me-wedding': 'bridal',
  manicure: 'nails',
  pedicure: 'nails',
  'nail-care': 'nails',
  'kid-safe-nail-care': 'nails',
  'mommy-and-me-mani': 'nails',
  'facial-cleansing': 'skincare',
  'skin-care': 'skincare',
  'postpartum-skin-care': 'skincare',
  'mommy-and-me-skin': 'skincare',
  'swedish-massage': 'massage',
  massage: 'massage',
  'spa-wellness': 'spa',
  'black-henna': 'henna',
  waxing: 'waxing-threading',
  'waxing-sub': 'waxing-threading',
  threading: 'waxing-threading',
  lashes: 'lashes',
  'lashes-brows': 'lashes',
  'kids-care': 'kids',
  'mens-grooming': 'mens',
  'home-service': 'beauty',
  'womens-services': 'beauty',
  yoga: 'spa',
  pilates: 'spa',
  'personal-training': 'spa',
};

export function resolvePoolKey(slug: string | null | undefined): string {
  if (!slug) return 'beauty';
  if (slug.startsWith('product-')) {
    const suffix = slug.slice('product-'.length);
    return `products-${suffix}` in IMAGERY_POOLS ? `products-${suffix}` : 'products-skincare';
  }
  return SLUG_POOL_MAP[slug] ?? 'beauty';
}

export function imageFor(poolKey: string, index: number): string | null {
  const pool = IMAGERY_POOLS[poolKey];
  if (!pool || pool.length === 0) return null;
  return pool[index % pool.length]!;
}
