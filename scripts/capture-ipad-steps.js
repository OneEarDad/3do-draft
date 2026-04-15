const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();

  const shots = async (page, prefix) => {
    await page.goto("http://localhost:3000/accuscan-dp.html", { waitUntil: "networkidle" });
    for (let i = 0; i < 4; i++) {
      const sel = `[data-proto-step="${i}"]`;
      await page.click(sel);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `.screenshots/${prefix}-step-${i + 1}.png`, fullPage: true });
    }
  };

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await shots(desktop, "desktop");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await shots(mobile, "mobile");

  await browser.close();
  console.log("Saved step screenshots");
})();
