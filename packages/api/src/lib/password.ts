import bcrypt from 'bcryptjs';

// B5 — cost 12 is the production default (~250ms per hash/compare — the
// deliberate login slowdown), but it is ~36s under parallel DB contention
// and has historically flaked the E2E suite. Test environments (CI E2E,
// local dev) can set BCRYPT_COST=4 to keep logins fast; production never
// overrides it.
const SALT_ROUNDS = (() => {
  const raw = process.env['BCRYPT_COST'];
  if (raw === undefined || raw === '') return 12;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 4 && n <= 15 ? n : 12;
})();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
