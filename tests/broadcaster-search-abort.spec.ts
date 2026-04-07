// spec: specs/broadcaster-search.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Broadcaster Search — Abort & Reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('reset mid-run aborts the pipeline and clears stage state', async ({ page }) => {
    // 1. Start the pipeline
    await page.getByRole('textbox').fill('BBC');
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 2. Wait for Stage 0 to be active (loading indicator appears)
    await expect(page.getByText(/researching broadcaster/i)).toBeVisible({ timeout: 10_000 });

    // 3. Click the Reset / Stop button while Stage 0 is in progress
    await page.getByRole('button', { name: /reset|stop|cancel/i }).click();

    // 4. Stage indicators disappear — UI returns to initial state
    await expect(page.getByText(/researching broadcaster/i)).not.toBeVisible({ timeout: 5_000 });

    // 5. No uncaught console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForTimeout(500);
    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('rapid re-submission uses only the latest broadcaster', async ({ page }) => {
    // 1. Submit BBC
    const input = page.getByRole('textbox');
    await input.fill('BBC');
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 2. Immediately clear and submit Paramount before Stage 0 finishes
    await input.fill('Paramount');
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 3. Only Paramount data should appear — not BBC data
    await expect(page.getByText(/3\.8B USD/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/5\.2B GBP/i)).not.toBeVisible();
  });
});
