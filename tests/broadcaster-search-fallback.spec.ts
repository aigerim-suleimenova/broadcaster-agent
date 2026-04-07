// spec: specs/broadcaster-search.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Broadcaster Search — Unknown Broadcaster Fallback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('unknown broadcaster triggers generic default metrics', async ({ page }) => {
    // 1. Enter a name not in the seeded database
    await page.getByRole('textbox').fill('Netflix');

    // 2. Submit
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 3. Pipeline launches without error — fallback data appears
    await expect(page.getByText(/250M\+|1\.5B USD/i)).toBeVisible({ timeout: 30_000 });
  });

  test('partial keyword "al" matches Al Jazeera', async ({ page }) => {
    // 1. Enter a partial keyword
    await page.getByRole('textbox').fill('al');

    // 2. Submit
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 3. Al Jazeera data is returned (keyword substring match in search_broadcasters)
    await expect(page.getByText(/MENA|Al Jazeera/i)).toBeVisible({ timeout: 30_000 });
  });
});
