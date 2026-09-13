/**
 * Mobile onboarding tour (§3.6 — RN walkthrough engine).
 *
 * Mirrors the web acceptance contract (apps/web/e2e/onboarding-tour.spec.ts):
 * the tour auto-opens once on the beauty dashboard, is 100% skippable,
 * persists the dismissal across relaunches, and can be replayed to
 * completion.
 *
 * Prerequisites (same as app.test.ts):
 *   1. Detox CLI:  npm i -g detox-cli
 *   2. Build app:   detox build --configuration ios.sim.debug
 *   3. Run tests:   detox test --configuration ios.sim.debug
 *
 * NOTE: launchApp({ delete: true }) clears app storage so the first-run
 * gate is fresh on every suite run; the suite then logs back in with the
 * seeded customer account.
 */

import { device, element, by, waitFor, expect as detoxExpect } from 'detox';

const DEMO_EMAIL = 'customer@test.com';
const DEMO_PASSWORD = 'Admin@123456';

async function ensureLoggedIn() {
  await element(by.text('حسابي')).tap();
  try {
    await detoxExpect(element(by.id('profile-menu'))).toBeVisible();
    return; // already logged in (persisted session)
  } catch {
    // fall through to the login flow
  }
  await element(by.text('تسجيل الدخول')).tap();
  await element(by.id('login-email')).typeText(DEMO_EMAIL);
  await element(by.id('login-password')).typeText(DEMO_PASSWORD);
  await element(by.id('login-submit')).tap();
  await detoxExpect(element(by.id('profile-menu'))).toBeVisible();
}

async function openBeautyDashboard() {
  await element(by.text('حسابي')).tap();
  await waitFor(element(by.text('لوحة الجمال')))
    .toBeVisible()
    .whileElement(by.id('profile-menu'))
    .scroll(200, 'down');
  await element(by.text('لوحة الجمال')).tap();
  await detoxExpect(element(by.id('beauty-dashboard'))).toBeVisible();
}

describe('Onboarding tour (§3.6 mobile)', () => {
  beforeAll(async () => {
    // Fresh install state → the first-run gate re-arms for every suite run.
    await device.launchApp({ newInstance: true, delete: true });
    await ensureLoggedIn();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('auto-opens on first dashboard visit and skip hides it', async () => {
    await openBeautyDashboard();
    await detoxExpect(element(by.id('tour-card'))).toBeVisible();
    await element(by.id('tour-skip')).tap();
    await detoxExpect(element(by.id('tour-card'))).not.toBeVisible();
  });

  it('dismissal persists across relaunch', async () => {
    await device.relaunchApp();
    await openBeautyDashboard();
    // Longer than the auto-open settle delay — the card must stay hidden.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await detoxExpect(element(by.id('tour-card'))).not.toBeVisible();
  });

  it('replay re-opens and completing the tour closes it', async () => {
    await element(by.id('tour-replay')).tap();
    await detoxExpect(element(by.id('tour-card'))).toBeVisible();

    // 5 stops: advance to the last one, then finish.
    for (let i = 0; i < 4; i += 1) {
      await element(by.id('tour-next')).tap();
    }
    await element(by.id('tour-done')).tap();
    await detoxExpect(element(by.id('tour-card'))).not.toBeVisible();
  });
});
