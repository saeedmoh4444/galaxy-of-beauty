/**
 * Smoke test: mobile HTTP contract (no Origin, Bearer auth, opaque idempotency).
 * Uses the real tRPC client (superjson transformer) to exercise the runtime
 * auth paths built on 2026-08-15. Requires the dev server on :3000.
 */
import { createTRPCClient, httpBatchLink, httpLink } from '@trpc/client';
import superjson from 'superjson';

const url = 'http://localhost:3000/api/trpc';

// ── 1. Mobile login: no Origin, no CSRF (publicMutation must be origin-exempt) ──
const anon = createTRPCClient({ links: [httpLink({ url, transformer: superjson })] });
let result = { pass: false, note: '' };
try {
  const login = await anon.auth.login.mutate({
    email: 'customer@test.com',
    password: 'Admin@123456',
  });
  console.log(
    '1. mobile login (no Origin, no CSRF): OK — token:',
    login.accessToken?.slice(0, 16) + '...',
  );
  result = { pass: true, note: login.accessToken };
} catch (e) {
  console.log('1. mobile login: FAIL —', e.message);
  process.exit(1);
}

// ── 2-5. Bearer-authenticated mobile client (no Origin) ──
const bearer = createTRPCClient({
  links: [
    httpBatchLink({
      url,
      transformer: superjson,
      headers: () => ({ authorization: `Bearer ${result.note}` }),
    }),
  ],
});

try {
  const bal = await bearer.wallet.getBalance.query();
  console.log('2. getBalance (Bearer, no Origin): OK — balance:', bal.balance);
} catch (e) {
  console.log('2. getBalance: FAIL —', e.message);
  process.exit(1);
}

const key = `mob_${Date.now()}_smoke`;
try {
  const top = await bearer.wallet.topUp.mutate({ amount: 25, idempotencyKey: key });
  console.log(
    '3. topUp opaque key (Bearer, no Origin): OK —',
    top.message,
    '| balance:',
    top.balance,
  );
} catch (e) {
  console.log('3. topUp: FAIL —', e.message);
  process.exit(1);
}

try {
  const replay = await bearer.wallet.topUp.mutate({ amount: 25, idempotencyKey: key });
  const ok = replay.message === 'Already processed';
  console.log(
    '4. topUp replay idempotency:',
    ok ? 'OK — Already processed' : 'FAIL — ' + replay.message,
  );
  if (!ok) process.exit(1);
} catch (e) {
  console.log('4. replay: FAIL —', e.message);
  process.exit(1);
}

// ── 5. Browser CSRF still enforced: authenticated client with Origin, no CSRF pair ──
// (Anonymous requests are rejected by the auth middleware first — UNAUTHORIZED —
// so the CSRF property is asserted with an authenticated browser-like request.)
const browserSim = createTRPCClient({
  links: [
    httpBatchLink({
      url,
      transformer: superjson,
      headers: () => ({ authorization: `Bearer ${result.note}`, origin: 'http://localhost:3000' }),
    }),
  ],
});
try {
  await browserSim.wallet.topUp.mutate({ amount: 25, idempotencyKey: `mob_browser_${Date.now()}` });
  console.log('5. browser CSRF enforcement: FAIL — request succeeded');
  process.exit(1);
} catch (e) {
  const code = e?.data?.code;
  console.log(
    '5. browser CSRF (Origin, no CSRF):',
    code === 'FORBIDDEN' ? 'OK — FORBIDDEN' : 'FAIL — ' + code,
  );
  if (code !== 'FORBIDDEN') process.exit(1);
}

console.log('\nALL SMOKE TESTS PASSED');
