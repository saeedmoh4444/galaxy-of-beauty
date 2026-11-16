// W6-5 one-shot: wrap each interval sweep's handler calls in withHeartbeat
// so scheduled work emits Sentry cron-monitor check-ins.
// Run: node scripts/w6-heartbeat-sweeps.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'packages/api/src/workers';

// file → { slug, calls: [exact call strings to wrap] }
const SWEEPS = {
  'tokenCleanup.ts': { slug: 'token-cleanup', calls: ['cleanupTokens'] },
  'subscriptionRenewal.ts': {
    slug: 'subscription-renewal',
    calls: ['renewDueSubscriptions', 'sendRenewalReminders'],
  },
  'insightsSweep.ts': { slug: 'insights-sweep', calls: ['generateInsightsSweep'] },
  'loyaltyExpiry.ts': {
    slug: 'loyalty-expiry',
    calls: ['sweepExpiredLoyaltyPoints', 'sendLoyaltyExpiryReminders'],
  },
  'welcomeSeries.ts': { slug: 'welcome-series', calls: ['sendWelcomeSeriesEmails'] },
  'reengagement.ts': { slug: 'reengagement', calls: ['sendReengagementEmails'] },
  'abandonedCart.ts': { slug: 'abandoned-cart', calls: ['sendAbandonedCartEmails'] },
  'postBooking.ts': { slug: 'post-booking', calls: ['sendPostBookingEmails'] },
  'birthday.ts': { slug: 'birthday', calls: ['sendBirthdayEmails'] },
  'seasonalMarketing.ts': { slug: 'seasonal-marketing', calls: ['sendSeasonalEmails'] },
  'checkoutExpiry.ts': { slug: 'checkout-expiry', calls: ['expireAbandonedCheckouts'] },
};

for (const [file, { slug, calls }] of Object.entries(SWEEPS)) {
  const p = join(ROOT, file);
  let src = readFileSync(p, 'utf8');
  if (src.includes('withHeartbeat')) {
    console.log(`skip ${file} (already wired)`);
    continue;
  }
  for (const fn of calls) {
    // void handler();  and  void handler().then(...) — wrap the call, not the .then chain
    src = src.split(`void ${fn}()`).join(`void withHeartbeat('${slug}', () => ${fn}())`);
  }
  // Insert the import after the first import block line
  const marker = "import { prisma } from '@galaxy/db';";
  if (src.includes(marker)) {
    src = src.replace(marker, `${marker}\nimport { withHeartbeat } from '../lib/sentry';`);
  } else {
    const firstImport = src.match(/^import [^;]+;\n/m);
    if (!firstImport) throw new Error(`${file}: no import anchor`);
    src = src.replace(
      firstImport[0],
      `${firstImport[0]}import { withHeartbeat } from '../lib/sentry';\n`,
    );
  }
  writeFileSync(p, src);
  console.log(`wired ${file} (${calls.length} call sites, slug=${slug})`);
}
