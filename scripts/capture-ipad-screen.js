const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:3000/accuscan-dp.html", { waitUntil: "networkidle" });

  const screen = page.locator('.ipad-proto__screen').first();
  await screen.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  for (let i = 0; i < 4; i++) {
    await page.click(`[data-proto-step="${i}"]`);
    await page.waitForTimeout(350);
    await screen.screenshot({ path: `.screenshots/screen-step-${i+1}.png` });
  }

  await browser.close();
  console.log('Saved screen screenshots');
})();
