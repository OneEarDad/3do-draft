// Capture the lab page foot build animation at multiple time points
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] });

  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1100 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  page.on('console', msg => console.log('[browser]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[pageerror]', err));

  await page.goto('http://localhost:8765/lab.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000); // wait for OBJ + shader compile

  const stamps = [0.5, 2.5, 4.5, 6.5, 8.5, 10.5, 12.5];
  for (let i = 0; i < stamps.length; i++) {
    const target = stamps[i];
    const wait = (i === 0) ? 500 : (stamps[i] - stamps[i-1]) * 1000;
    await page.waitForTimeout(wait);
    try {
      await page.screenshot({
        path: `.screenshots/lab-build-${String(i+1).padStart(2,'0')}-t${target}s.png`,
        fullPage: false,
        timeout: 10000,
      });
      console.log(`captured frame ${i+1} at ~${target}s`);
    } catch (e) {
      console.error(`frame ${i+1} failed:`, e.message);
    }
  }

  await browser.close();
  console.log('done');
})();
