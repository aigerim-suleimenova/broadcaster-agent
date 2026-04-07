# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: broadcaster-search-validation.spec.ts >> Broadcaster Search — Input Validation >> whitespace-only input does not start the pipeline
- Location: tests/broadcaster-search-validation.spec.ts:41:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /run|start|search/i })
    - locator resolved to <button disabled class="inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none bg-primary hover:bg-primary/90 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-12 px-6 sm:px-8 gap-2 shrink-0 rounded-lg font-medium text-base shadow-lg shadow-purple-500/30 disabled:opacity-50">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
      - waiting 100ms
    111 × waiting for element to be visible, enabled and stable
        - element is not enabled
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e9]:
      - heading "Pipeline Agent" [level=1] [ref=e10]
      - paragraph [ref=e11]: Multi-step broadcaster discovery & outreach
    - generic [ref=e15]:
      - generic [ref=e16]:
        - heading "Multi-Step Pipeline Agent" [level=2] [ref=e17]
        - paragraph [ref=e18]: Enter a broadcaster name to launch an intelligent discovery, analysis, and outreach pipeline.
      - generic [ref=e20]:
        - generic [ref=e21]: Broadcaster name
        - textbox "Broadcaster name" [active] [ref=e22]:
          - /placeholder: e.g. BBC, Paramount, TF1 Group, Sky...
        - button "Start Pipeline" [disabled]:
          - img
          - text: Start Pipeline
      - generic [ref=e23]:
        - heading "Discovery Pipeline" [level=3] [ref=e24]
        - generic [ref=e25]:
          - generic [ref=e27]:
            - img [ref=e29]
            - generic [ref=e32]:
              - generic [ref=e34]: "0"
              - heading "Research" [level=4] [ref=e35]
            - paragraph [ref=e36]: Broadcaster profile & tech stack
          - generic [ref=e38]:
            - img [ref=e40]
            - generic [ref=e43]:
              - generic [ref=e45]: "1"
              - heading "Compatibility" [level=4] [ref=e46]
            - paragraph [ref=e47]: Smartclip fit analysis
          - generic [ref=e49]:
            - img [ref=e51]
            - generic [ref=e56]:
              - generic [ref=e58]: "2"
              - heading "Decision Makers" [level=4] [ref=e59]
            - paragraph [ref=e60]: Key contact identification
          - generic [ref=e62]:
            - img [ref=e64]
            - generic [ref=e67]:
              - generic [ref=e69]: "3"
              - heading "Outreach Plan" [level=4] [ref=e70]
            - paragraph [ref=e71]: Personalized strategy
          - generic [ref=e73]:
            - img [ref=e75]
            - generic [ref=e79]:
              - generic [ref=e81]: "4"
              - heading "Review" [level=4] [ref=e82]
            - paragraph [ref=e83]: Final approval checkpoint
  - button "Open Next.js Dev Tools" [ref=e89] [cursor=pointer]:
    - img [ref=e90]
  - alert [ref=e93]
```

# Test source

```ts
  1  | // spec: specs/broadcaster-search.md
  2  | // seed: seed.spec.ts
  3  | 
  4  | import { test, expect } from '@playwright/test';
  5  | 
  6  | test.describe('Broadcaster Search — Input Validation', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/');
  9  |   });
  10 | 
  11 |   test('empty input does not start the pipeline', async ({ page }) => {
  12 |     // 1. Leave the broadcaster name input empty
  13 |     const input = page.getByRole('textbox');
  14 |     await expect(input).toBeVisible();
  15 |     await expect(input).toHaveValue('');
  16 | 
  17 |     // 2. Intercept any fetch to /api/pipeline or /api/agent-chat to confirm no request fires
  18 |     let requestFired = false;
  19 |     page.on('request', (req) => {
  20 |       if (req.url().includes('/api/pipeline') || req.url().includes('/api/agent-chat')) {
  21 |         requestFired = true;
  22 |       }
  23 |     });
  24 | 
  25 |     // 3. Attempt to submit with empty input
  26 |     const submitButton = page.getByRole('button', { name: /run|start|search/i });
  27 |     if (await submitButton.isDisabled()) {
  28 |       // Submit button is disabled — validation is enforced at the control level
  29 |       await expect(submitButton).toBeDisabled();
  30 |     } else {
  31 |       await submitButton.click();
  32 |       // If button is not disabled, pipeline must still not start
  33 |       await page.waitForTimeout(1000);
  34 |       expect(requestFired).toBe(false);
  35 |     }
  36 | 
  37 |     // 4. No stage indicators are rendered
  38 |     await expect(page.getByText(/researching broadcaster/i)).not.toBeVisible();
  39 |   });
  40 | 
  41 |   test('whitespace-only input does not start the pipeline', async ({ page }) => {
  42 |     // 1. Type spaces only into the input
  43 |     await page.getByRole('textbox').fill('   ');
  44 | 
  45 |     // 2. Attempt to submit
  46 |     let requestFired = false;
  47 |     page.on('request', (req) => {
  48 |       if (req.url().includes('/api/pipeline') || req.url().includes('/api/agent-chat')) {
  49 |         requestFired = true;
  50 |       }
  51 |     });
  52 | 
  53 |     const submitButton = page.getByRole('button', { name: /run|start|search/i });
> 54 |     await submitButton.click();
     |                        ^ Error: locator.click: Test timeout of 60000ms exceeded.
  55 | 
  56 |     // 3. No pipeline activity after 1 second
  57 |     await page.waitForTimeout(1000);
  58 |     expect(requestFired).toBe(false);
  59 |     await expect(page.getByText(/researching broadcaster/i)).not.toBeVisible();
  60 |   });
  61 | });
  62 | 
```