// spec: specs/broadcaster-search.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Broadcaster Search — End-to-End Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('pipeline progresses through all 4 stages for BBC', async ({ page }) => {
    // 1. Enter broadcaster name and start
    await page.getByRole('textbox').fill('BBC');
    await page.getByRole('button', { name: /run|start|search/i }).click();

    // 2. Stage 0 (Research) completes
    await expect(page.getByText(/500M\+|5\.2B GBP/i)).toBeVisible({ timeout: 30_000 });

    // 3. Proceed to Stage 1 (Compatibility Analysis)
    await page.getByRole('button', { name: /proceed|next|continue/i }).click();
    await expect(page.getByText(/analyzing compatibility/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/compatibility|score/i)).toBeVisible({ timeout: 30_000 });

    // 4. Proceed to Stage 2 (Decision Makers)
    await page.getByRole('button', { name: /proceed|next|continue/i }).click();
    await expect(page.getByText(/finding contacts|decision maker/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/decision maker|contact/i)).toBeVisible({ timeout: 30_000 });

    // 5. Proceed to Stage 3 (Outreach Plan)
    await page.getByRole('button', { name: /proceed|next|continue/i }).click();
    await expect(page.getByText(/preparing outreach/i)).toBeVisible({ timeout: 10_000 });

    // 6. Email draft is produced (subject and body)
    await expect(page.getByText(/subject|email draft/i)).toBeVisible({ timeout: 30_000 });

    // 7. Reach the final Review stage
    await page.getByRole('button', { name: /proceed|next|continue/i }).click();
    await expect(page.getByText(/ready for review|review/i)).toBeVisible({ timeout: 10_000 });
  });

  test('localStorage thread ID persists across page reloads', async ({ page }) => {
    // 1. First load — thread ID is generated and stored
    const threadId = await page.evaluate(() => localStorage.getItem('copilotkit-thread-id'));
    expect(threadId).not.toBeNull();

    // 2. Reload the page
    await page.reload();

    // 3. Same thread ID is reused
    const threadIdAfterReload = await page.evaluate(() =>
      localStorage.getItem('copilotkit-thread-id')
    );
    expect(threadIdAfterReload).toBe(threadId);
  });
});
