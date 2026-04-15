// Capture hero Variants B and C in the lab.
const { chromium, devices } = require('playwright');

async function shotSection(page, selector, outPath) {
  // Scroll the section to the top of the viewport so its top edge is at y=0
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    el.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -1); // nudge so the section's top is exactly at 0
  }, selector);
  // Get the section's full size (including any overflow past viewport)
  const box = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    return { x: 0, y: 0, width: r.width, height: el.offsetHeight };
  }, selector);
  // Resize the viewport so the whole section fits, then clip
  const vp = page.viewportSize();
  const targetH = Math.ceil(box.height) + 20;
  if (targetH > vp.height) {
    await page.setViewportSize({ width: vp.width, height: targetH });
    await page.waitForTimeout(150);
  }
  await page.screenshot({
    path: outPath,
    clip: { x: 0, y: 0, width: Math.ceil(box.width), height: Math.ceil(box.height) },
  });
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] });

  // ── Desktop ──
  const dctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const dp = await dctx.newPage();
  dp.on('pageerror', e => console.error('[pageerror]', e.message));
  await dp.goto('http://localhost:8765/lab.html', { waitUntil: 'domcontentloaded' });

  // Variant C
  await dp.evaluate(() => document.querySelector('.hero-c').scrollIntoView({ block: 'start' }));
  await dp.waitForTimeout(14000);
  await shotSection(dp, '.hero-c', '.screenshots/hero-lab-C-desktop.png');
  console.log('captured C desktop');

  // Reset desktop viewport for Variant B
  await dp.setViewportSize({ width: 1280, height: 900 });
  await dp.waitForTimeout(150);

  // Variant B (build already complete since same page)
  await dp.evaluate(() => document.querySelector('.hero-asym').scrollIntoView({ block: 'start' }));
  await dp.waitForTimeout(1500);
  await shotSection(dp, '.hero-asym', '.screenshots/hero-lab-B-desktop.png');
  console.log('captured B desktop');

  // ── Mobile ──
  const mctx = await browser.newContext({ ...devices['iPhone 13'] });
  const mp = await mctx.newPage();
  await mp.goto('http://localhost:8765/lab.html', { waitUntil: 'domcontentloaded' });

  await mp.evaluate(() => document.querySelector('.hero-c').scrollIntoView({ block: 'start' }));
  await mp.waitForTimeout(14000);
  await shotSection(mp, '.hero-c', '.screenshots/hero-lab-C-mobile.png');
  console.log('captured C mobile');

  // Reset mobile viewport for Variant B
  await mp.setViewportSize({ width: 390, height: 844 });
  await mp.waitForTimeout(150);

  await mp.evaluate(() => document.querySelector('.hero-asym').scrollIntoView({ block: 'start' }));
  await mp.waitForTimeout(1500);
  await shotSection(mp, '.hero-asym', '.screenshots/hero-lab-B-mobile.png');
  console.log('captured B mobile');

  await browser.close();
  console.log('done');
})();
