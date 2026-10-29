import { test, expect } from '@playwright/test';

/**
 * P1 — full-screen swipe feed (REELS_SHOPPABLE_PLAN Phase 2).
 * /beauty-shorts becomes a vertical snap feed: the active slide plays
 * autoplay-muted, only slides near the viewport mount real <video>
 * elements (virtualization — never N videos for N reels), and a tap
 * toggles mute. The page header stays for the home-reels spec.
 */

test.setTimeout(120_000);

test('feed mounts a snap container with the header intact', async ({ page }) => {
  await page.goto('/beauty-shorts');
  await expect(page.getByRole('heading', { name: 'جمال شورتس' })).toBeVisible();
  await expect(page.getByTestId('reels-feed')).toBeVisible();
  await expect(page.getByTestId('reel-slide').first()).toBeVisible();
});

test('feed virtualizes videos — at most 3 <video> elements in the DOM', async ({ page }) => {
  await page.goto('/beauty-shorts');
  await expect(page.getByTestId('reel-slide').first()).toBeVisible();
  // Seeded reels number well above 3; the feed must not mount them all.
  const videoCount = await page.locator('video').count();
  expect(videoCount).toBeGreaterThanOrEqual(1);
  expect(videoCount).toBeLessThanOrEqual(3);
});

test('the active slide mounts an autoplay-muted video and the mute button toggles', async ({
  page,
}) => {
  await page.goto('/beauty-shorts');
  await expect(page.getByTestId('reel-slide').first()).toBeVisible();
  const firstVideo = page.locator('video').first();
  await expect(firstVideo).toBeAttached();
  // Playback itself is browser-guaranteed for muted+autoplay+playsinline;
  // CI egress to the seeded sample-video bucket can be slow/blocked, so
  // assert the structural contract instead of the live play state.
  // (playsInline has no JS property in Firefox — attributes only.)
  await expect(firstVideo).toHaveJSProperty('autoplay', true);
  await expect(firstVideo).toHaveJSProperty('muted', true);

  const muteBtn = page.getByTestId('reel-mute').first();
  await muteBtn.click();
  await expect
    .poll(async () => firstVideo.evaluate((v) => (v as HTMLVideoElement).muted), {
      timeout: 5000,
    })
    .toBe(false);
});

test('scrolling two slides swaps the playing video', async ({ page }) => {
  await page.goto('/beauty-shorts');
  await expect(page.getByTestId('reel-slide').first()).toBeVisible();
  await expect(page.locator('video').first()).toBeAttached();
  const slides = page.getByTestId('reel-slide');
  const count = await slides.count();
  test.skip(count < 3, 'needs at least three seeded reels');

  // The ±1 window keeps slide 0 mounted at active=1 — its video only
  // unmounts once the active slide is two positions away. Assert the
  // unmount (element identity), NOT a src change: several seeded reels
  // share the same sample video URL, so src comparisons are data-fragile
  // (feed order is tie-shuffled by createMany's equal timestamps).
  const firstSlideVideo = slides.first().locator('video');
  test.skip((await firstSlideVideo.count()) === 0, 'first slide has no video to swap');
  const feed = page.getByTestId('reels-feed');
  await feed.hover();
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 400);
  }
  await page.waitForTimeout(400);

  await expect(firstSlideVideo).toBeDetached({ timeout: 10_000 });
});
