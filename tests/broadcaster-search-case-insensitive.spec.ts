// spec: specs/broadcaster-search.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Broadcaster Search — Case Insensitivity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('lowercase "bbc" resolves to BBC data', async ({ page }) => {
    // 1. Enter all-lowercase name
    await page.getByRole('textbox').fill('bbc');

    // 2. Submit
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 3. BBC-specific data appears — confirms normalisation via .toLowerCase().trim()
    await expect(page.getByText(/500M\+|5\.2B GBP/i)).toBeVisible({ timeout: 30_000 });
  });

  test('mixed-case "pArAmOuNt" resolves to Paramount data', async ({ page }) => {
    // 1. Enter mixed-case name
    await page.getByRole('textbox').fill('pArAmOuNt');

    // 2. Submit
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 3. Paramount data appears — not the generic fallback
    await expect(page.getByText(/3\.8B USD/i)).toBeVisible({ timeout: 30_000 });
  });
});
