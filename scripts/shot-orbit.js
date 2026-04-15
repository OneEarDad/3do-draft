// Capture the orbit hero on accuscan-dp.html
const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Desktop 1280x900
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const dp = await desktop.newPage();
  await dp.goto('http://localhost:8765/accuscan-dp.html', { waitUntil: 'networkidle' });
  await dp.waitForTimeout(1500); // let orbit + scan settle
  await dp.screenshot({ path: '.screenshots/orbit-desktop.png', fullPage: false });

  // Desktop 1440 for a roomier view
  const big = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });
  const bp = await big.newPage();
  await bp.goto('http://localhost:8765/accuscan-dp.html', { waitUntil: 'networkidle' });
  await bp.waitForTimeout(1500);
  await bp.screenshot({ path: '.screenshots/orbit-desktop-1440.png', fullPage: false });

  // Mobile
  const mobile = await browser.newContext({ ...devices['iPhone 13'] });
  const mp = await mobile.newPage();
  await mp.goto('http://localhost:8765/accuscan-dp.html', { waitUntil: 'networkidle' });
  await mp.waitForTimeout(1500);
  await mp.screenshot({ path: '.screenshots/orbit-mobile.png', fullPage: false });

  await browser.close();
  console.log('done');
})();
