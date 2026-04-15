import { test, expect } from '@playwright/test';

const keyPages = ['/', '/contact.html', '/accuscan-dp.html'];

for (const path of keyPages) {
  test(`HTTP 200 and shell: ${path}`, async ({ page }) => {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(res?.ok(), `expected 2xx for ${path}`).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });
}

test('contact page has form', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('#contact-form')).toBeVisible();
});

test('navigation: Home from contact', async ({ page }) => {
  await page.goto('/contact.html');
  await page.getByRole('navigation').getByRole('link', { name: 'Home' }).first().click();
  await expect(page).toHaveURL(/index\.html|\/$/);
});
