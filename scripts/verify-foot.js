// Smoke test: verify the new shader-based foot-3d.js loads and runs
// without console errors on both homepage and AccuScan DP.
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });

  const pages = [
    { url: 'http://localhost:8765/index.html',       name: 'home' },
    { url: 'http://localhost:8765/accuscan-dp.html', name: 'accuscan' },
  ];

  for (const p of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => {
      if (m.type() === 'error') errors.push(`[${p.name} console error] ${m.text()}`);
    });
    page.on('pageerror', e => errors.push(`[${p.name} page error] ${e.message}`));

    console.log(`\n→ loading ${p.url}`);
    await page.goto(p.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    if (errors.length === 0) {
      console.log(`  ✓ ${p.name}: no errors`);
    } else {
      errors.forEach(e => console.log(`  ✗ ${e}`));
    }

    await page.close();
  }

  await browser.close();
  console.log('\ndone');
})();
