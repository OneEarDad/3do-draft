// Capture the "From scan to sole" bubble section on accuscan-dp.html
const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Desktop
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const dp = await desktop.newPage();
  await dp.goto('http://localhost:8765/accuscan-dp.html', { waitUntil: 'networkidle' });
  // Scroll to the bubble section
  await dp.evaluate(() => {
    const s = document.querySelector('.bubble-wave-wrap');
    if (s) s.scrollIntoView({ block: 'center' });
  });
  await dp.waitForTimeout(1200);
  await dp.screenshot({ path: '.screenshots/bubbles-accuscan-desktop.png', fullPage: false });

  // Full page capture to see everything in context
  await dp.evaluate(() => window.scrollTo(0, 0));
  await dp.waitForTimeout(400);
  await dp.screenshot({ path: '.screenshots/bubbles-accuscan-desktop-full.png', fullPage: true });

  // Mobile
  const mobile = await browser.newContext({
    ...devices['iPhone 13'],
  });
  const mp = await mobile.newPage();
  await mp.goto('http://localhost:8765/accuscan-dp.html', { waitUntil: 'networkidle' });
  await mp.evaluate(() => {
    const s = document.querySelector('.bubble-wave-wrap');
    if (s) s.scrollIntoView({ block: 'center' });
  });
  await mp.waitForTimeout(1200);
  await mp.screenshot({ path: '.screenshots/bubbles-accuscan-mobile.png', fullPage: false });

  await browser.close();
  console.log('done');
})();
