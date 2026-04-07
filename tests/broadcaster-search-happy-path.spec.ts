// spec: specs/broadcaster-search.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Broadcaster Search — Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('known broadcaster BBC returns rich data in Stage 0', async ({ page }) => {
    // 1. Type BBC into the broadcaster name input
    await page.getByRole('textbox').fill('BBC');

    // 2. Submit the form
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 3. Stage 0 should become active
    await expect(page.getByText(/researching broadcaster/i)).toBeVisible({ timeout: 10_000 });

    // 4. Stage 0 completes and BBC-specific data appears
    await expect(page.getByText(/500M\+|5\.2B GBP/i)).toBeVisible({ timeout: 30_000 });
  });

  test('known broadcaster Paramount returns rich data in Stage 0', async ({ page }) => {
    // 1. Type Paramount into the broadcaster name input
    await page.getByRole('textbox').fill('Paramount');

    // 2. Submit the form
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 3. Stage 0 completes with Paramount data
    await expect(page.getByText(/3\.8B USD|North America/i)).toBeVisible({ timeout: 30_000 });
  });

  test('known broadcaster Al Jazeera returns rich data in Stage 0', async ({ page }) => {
    // 1. Type Al Jazeera into the broadcaster name input
    await page.getByRole('textbox').fill('Al Jazeera');

    // 2. Submit the form
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 3. Stage 0 completes with Al Jazeera data
    await expect(page.getByText(/MENA|57%/i)).toBeVisible({ timeout: 30_000 });
  });
});
