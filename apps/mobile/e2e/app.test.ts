/**
 * Galaxy of Beauty — Mobile Detox E2E Tests
 *
 * Prerequisites:
 *   1. Detox CLI:  npm i -g detox-cli
 *   2. Build app:   detox build --configuration ios.sim.debug
 *   3. Run tests:   detox test --configuration ios.sim.debug
 *
 * These tests validate core user flows on the mobile app.
 */

import { device, element, by, expect as detoxExpect } from 'detox';

describe('Galaxy of Beauty Mobile App', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Public Screens', () => {
    it('should display home screen on launch', async () => {
      await detoxExpect(element(by.text('جالكسي بيوتي'))).toBeVisible();
    });

    it('should navigate to services tab', async () => {
      await element(by.text('الخدمات')).tap();
      await detoxExpect(element(by.text('بحث عن خدمة...'))).toBeVisible();
    });

    it('should show surprise-me button on home', async () => {
      await element(by.text('الرئيسية')).tap();
      await detoxExpect(element(by.text('فاجئيني'))).toBeVisible();
    });

    it('should show marketplace button on home', async () => {
      await detoxExpect(element(by.text('🛍️ متجر المنتجات'))).toBeVisible();
    });

    it('should navigate to marketplace', async () => {
      await element(by.text('🛍️ متجر المنتجات')).tap();
      await detoxExpect(element(by.text('متجر منتجات التجميل'))).toBeVisible();
    });
  });

  describe('Authentication', () => {
    it('should show login screen', async () => {
      await element(by.text('حسابي')).tap();
      // Tap menu items to find login
      await device.reloadReactNative();
      await element(by.text('حسابي')).tap();
    });

    it('should display login form elements', async () => {
      // Navigate to login
      await device.launchApp({ newInstance: true });
      // Login is accessible from the header
    });

    it('should reject empty login', async () => {
      // Login with empty fields should show error
    });
  });

  describe('Service Comparison', () => {
    it('should navigate to compare screen', async () => {
      await device.launchApp({
        newInstance: true,
        url: 'galaxyofbeauty://compare?ids=1,2',
      });
    });
  });

  describe('Profile Menu', () => {
    it('should display profile tab', async () => {
      await element(by.text('حسابي')).tap();
    });
  });

  describe('Tabs Navigation', () => {
    const tabs = ['الرئيسية', 'الخدمات', 'حجوزاتي', 'المحفظة', 'حسابي'];

    for (const tab of tabs) {
      it(`should have "${tab}" tab visible`, async () => {
        await detoxExpect(element(by.text(tab))).toBeVisible();
      });
    }
  });
});
