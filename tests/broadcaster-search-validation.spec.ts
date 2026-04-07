// spec: specs/broadcaster-search.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Broadcaster Search — Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('empty input does not start the pipeline', async ({ page }) => {
    // 1. Leave the broadcaster name input empty
    const input = page.getByRole('textbox');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('');

    // 2. Intercept any fetch to /api/pipeline or /api/agent-chat to confirm no request fires
    let requestFired = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/pipeline') || req.url().includes('/api/agent-chat')) {
        requestFired = true;
      }
    });

    // 3. Attempt to submit with empty input
    const submitButton = page.getByRole('button', { name: /run|start|search/i });
    if (await submitButton.isDisabled()) {
      // Submit button is disabled — validation is enforced at the control level
      await expect(submitButton).toBeDisabled();
    } else {
      await submitButton.click();
      // If button is not disabled, pipeline must still not start
      await page.waitForTimeout(1000);
      expect(requestFired).toBe(false);
    }

    // 4. No stage indicators are rendered
    await expect(page.getByText(/researching broadcaster/i)).not.toBeVisible();
  });

  test('whitespace-only input does not start the pipeline', async ({ page }) => {
    // 1. Type spaces only into the input
    await page.getByRole('textbox').fill('   ');

    // 2. Attempt to submit
    let requestFired = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/pipeline') || req.url().includes('/api/agent-chat')) {
        requestFired = true;
      }
    });

    const submitButton = page.getByRole('button', { name: /run|start|search/i });
    await submitButton.click();

    // 3. No pipeline activity after 1 second
    await page.waitForTimeout(1000);
    expect(requestFired).toBe(false);
    await expect(page.getByText(/researching broadcaster/i)).not.toBeVisible();
  });
});
