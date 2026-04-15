const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:3000/accuscan-dp.html", { waitUntil: "networkidle" });

  for (let i = 0; i < 4; i++) {
    await page.click(`[data-proto-step="${i}"]`);
    await page.waitForTimeout(350);
    const device = page.locator('.ipad-proto__device').first();
    await device.screenshot({ path: `.screenshots/device-step-${i+1}.png` });
  }

  await browser.close();
  console.log("Saved device screenshots");
})();
