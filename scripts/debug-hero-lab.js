const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  // Test BOTH iPhone 13 (664h) and a real-device 844h viewport
  const profiles = [
    { name: 'pw-iphone13', viewport: { width: 390, height: 664 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { name: 'real-iphone13', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  ];
  for (const prof of profiles) {
    const ctx = await browser.newContext({
      viewport: prof.viewport,
      deviceScaleFactor: prof.deviceScaleFactor,
      isMobile: prof.isMobile, hasTouch: prof.hasTouch,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    const page = await ctx.newPage();
    await page.goto('http://localhost:8765/lab.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.querySelector('.hero-asym').scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(13000);
    await page.screenshot({ path: `.screenshots/debug-${prof.name}.png`, fullPage: false });
    const dims = await page.evaluate(() => {
      const sec = document.querySelector('.hero-asym');
      const stream = document.querySelector('.hero-asym__stream');
      const content = document.querySelector('.hero-asym__content');
      const award = document.querySelector('.hero-asym__award');
      return {
        vh: window.innerHeight,
        sectionH: sec.offsetHeight,
        contentBottom: content.getBoundingClientRect().bottom,
        awardBottom: award.getBoundingClientRect().bottom,
        streamTop: stream.getBoundingClientRect().top,
        streamBottom: stream.getBoundingClientRect().bottom,
        gap: stream.getBoundingClientRect().top - award.getBoundingClientRect().bottom,
      };
    });
    console.log(prof.name, JSON.stringify(dims));
    await ctx.close();
  }
  await browser.close();
})();
