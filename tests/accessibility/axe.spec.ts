import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const urls = ['/', '/contact.html', '/accuscan-dp.html'];

for (const url of urls) {
  test(`axe: no serious violations on ${url}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    // Let Three.js / WebGL settle so axe does not block on long tasks
    await page.waitForTimeout(2000);
    const results = await new AxeBuilder({ page })
      .exclude('iframe')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help} — ${v.nodes.length} node(s)`).join('\n'),
    ).toHaveLength(0);
  });
}
