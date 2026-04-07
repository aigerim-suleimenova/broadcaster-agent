# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: broadcaster-search-abort.spec.ts >> Broadcaster Search — Abort & Reset >> rapid re-submission uses only the latest broadcaster
- Location: tests/broadcaster-search-abort.spec.ts:34:7

# Error details

```
Error: locator.fill: Error: strict mode violation: getByRole('textbox') resolved to 4 elements:
    1) <input value="BBC" id="broadcaster-input" placeholder="e.g. BBC, Paramount, TF1 Group, Sky..." class="flex w-full py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-500/50 h-12 text-base rounded-lg px-4 backdrop-blur-sm"/> aka getByRole('textbox', { name: 'Broadcaster name' })
    2) <textarea rows="12" class="flex w-full border-input px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[260px] resize-y font-mono text-sm border-0 bg-transparent focus-visible:ring-0 rounded-xl" placeholder="# Your Research Title↵## Introduction↵Enter your research content here...↵↵## Key Findings↵- Finding 1↵- Finding 2↵↵## Data & Statistics↵- 85% improvement in efficiency↵- $2.5M cost savings↵↵#…></textarea> aka getByRole('textbox', { name: '# Your Research Title ##' })
    3) <textarea rows="1" placeholder="Ask me about a broadcaster..." class="flex-1 bg-transparent resize-none outline-none leading-snug"></textarea> aka getByRole('textbox', { name: 'Ask me about a broadcaster...' })
    4) <textarea rows="1" placeholder="Type a message..." data-testid="copilot-chat-textarea" class="cpk:bg-transparent cpk:outline-none cpk:antialiased cpk:font-regular cpk:text-[16px] cpk:placeholder:text-[#00000077] cpk:dark:placeholder:text-[#fffc] cpk:w-full cpk:py-3 cpk:pr-5"></textarea> aka getByTestId('copilot-chat-textarea')

Call log:
  - waiting for getByRole('textbox')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - generic [ref=e9]:
        - heading "Pipeline Agent" [level=1] [ref=e10]
        - paragraph [ref=e11]: Multi-step broadcaster discovery & outreach
      - generic [ref=e12]:
        - generic [ref=e13]:
          - paragraph [ref=e14]: Processing
          - paragraph [ref=e15]: BBC
        - button "Reset" [ref=e16] [cursor=pointer]:
          - img [ref=e17]
          - generic [ref=e20]: Reset
    - generic [ref=e21]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - heading "Multi-Step Pipeline Agent" [level=2] [ref=e26]
          - paragraph [ref=e27]: Enter a broadcaster name to launch an intelligent discovery, analysis, and outreach pipeline.
        - generic [ref=e29]:
          - generic [ref=e30]: Broadcaster name
          - textbox "Broadcaster name" [ref=e31]:
            - /placeholder: e.g. BBC, Paramount, TF1 Group, Sky...
            - text: BBC
          - button "Start Pipeline" [ref=e32] [cursor=pointer]:
            - img [ref=e33]
            - text: Start Pipeline
        - generic [ref=e35]:
          - heading "Discovery Pipeline" [level=3] [ref=e36]
          - generic [ref=e37]:
            - generic [ref=e39]:
              - img [ref=e41]
              - generic [ref=e44]:
                - generic [ref=e46]: "0"
                - heading "Research" [level=4] [ref=e47]
              - paragraph [ref=e48]: Broadcaster profile & tech stack
            - generic [ref=e50]:
              - img [ref=e52]
              - generic [ref=e55]:
                - generic [ref=e57]: "1"
                - heading "Compatibility" [level=4] [ref=e58]
              - paragraph [ref=e59]: Smartclip fit analysis
            - generic [ref=e61]:
              - img [ref=e63]
              - generic [ref=e68]:
                - generic [ref=e70]: "2"
                - heading "Decision Makers" [level=4] [ref=e71]
              - paragraph [ref=e72]: Key contact identification
            - generic [ref=e74]:
              - img [ref=e76]
              - generic [ref=e79]:
                - generic [ref=e81]: "3"
                - heading "Outreach Plan" [level=4] [ref=e82]
              - paragraph [ref=e83]: Personalized strategy
            - generic [ref=e85]:
              - img [ref=e87]
              - generic [ref=e91]:
                - generic [ref=e93]: "4"
                - heading "Review" [level=4] [ref=e94]
              - paragraph [ref=e95]: Final approval checkpoint
      - generic [ref=e96]:
        - generic [ref=e98]:
          - tablist "Pipeline stages" [ref=e99]:
            - 'tab "Stage 1: Research (active)" [selected] [ref=e100] [cursor=pointer]'
            - 'tab "Stage 2: Compatibility (pending)" [disabled] [ref=e101]'
            - 'tab "Stage 3: Decision Makers (pending)" [disabled] [ref=e102]'
            - 'tab "Stage 4: Outreach Plan (pending)" [disabled] [ref=e103]'
            - 'tab "Stage 5: Review (pending)" [disabled] [ref=e104]'
          - generic [ref=e105]:
            - generic [ref=e106]:
              - paragraph [ref=e107]: Stage 1 of 5
              - paragraph [ref=e108]: Research
            - generic [ref=e109]: Researching broadcaster...
        - generic [ref=e113]:
          - banner [ref=e114]:
            - generic [ref=e115]:
              - generic [ref=e116]:
                - img [ref=e118]
                - generic [ref=e123]:
                  - heading "Signal" [level=1] [ref=e124]
                  - paragraph [ref=e125]: Research intelligence for the media industry
              - button "Close Signal" [ref=e126] [cursor=pointer]:
                - img [ref=e127]
                - text: Hide Signal
          - generic [ref=e130]:
            - main [ref=e131]:
              - generic [ref=e134]:
                - generic [ref=e135]:
                  - generic [ref=e136]: "Samples:"
                  - generic [ref=e137]:
                    - button "📊 Channel Performance" [ref=e138] [cursor=pointer]
                    - button "📝 Broadcast Ops Notes" [ref=e139] [cursor=pointer]
                    - button "🚀 Channel Launch Plan" [ref=e140] [cursor=pointer]
                    - button "⚙️ Streaming Tech Guide" [ref=e141] [cursor=pointer]
                    - button "📈 Streaming Market Report" [ref=e142] [cursor=pointer]
                    - button "📊 BBC Performance Report" [ref=e143] [cursor=pointer]
                    - button "📡 Sky Stream Quality" [ref=e144] [cursor=pointer]
                    - button "🚀 Paramount+ Strategy" [ref=e145] [cursor=pointer]
                    - button "📈 TF1 Group Analysis" [ref=e146] [cursor=pointer]
                    - button "⚙️ Netflix Tech Overview" [ref=e147] [cursor=pointer]
                - 'textbox "# Your Research Title ## Introduction Enter your research content here... ## Key Findings - Finding 1 - Finding 2 ## Data & Statistics - 85% improvement in efficiency - $2.5M cost savings ## Code Examples ```python def analyze_data(content): return insights ``` ## Conclusion Your conclusions here..." [ref=e149]':
                  - /placeholder: "# Your Research Title\n## Introduction\nEnter your research content here...\n\n## Key Findings\n- Finding 1\n- Finding 2\n\n## Data & Statistics\n- 85% improvement in efficiency\n- $2.5M cost savings\n\n## Code Examples\n```python\ndef analyze_data(content):\n  return insights\n```\n\n## Conclusion\nYour conclusions here..."
                - generic [ref=e150]:
                  - button "Upload .md" [ref=e152] [cursor=pointer]:
                    - img [ref=e153]
                    - text: Upload .md
                  - button "Generate Dashboard" [disabled]
            - complementary [ref=e156]:
              - generic [ref=e158]:
                - generic [ref=e159]:
                  - generic [ref=e160]:
                    - img [ref=e161]
                    - generic [ref=e166]: Signal
                  - button "Close chat" [ref=e167] [cursor=pointer]:
                    - img [ref=e168]
                - generic [ref=e172]:
                  - generic [ref=e174]:
                    - complementary "Navigation" [ref=e175]:
                      - button "Expand navigation" [ref=e177] [cursor=pointer]:
                        - img [ref=e179]
                      - navigation [ref=e181]:
                        - button [ref=e182] [cursor=pointer]:
                          - img [ref=e183]
                        - button [ref=e186] [cursor=pointer]:
                          - img [ref=e187]
                        - button [ref=e193] [cursor=pointer]:
                          - img [ref=e194]
                    - generic [ref=e197]:
                      - img [ref=e199]
                      - generic [ref=e206]:
                        - heading "Hi, I'm Signal." [level=1] [ref=e207]
                        - paragraph [ref=e208]:
                          - text: Research intelligence
                          - text: for the media industry.
                      - generic [ref=e209]:
                        - button "Research BBC's ad tech stack" [ref=e210] [cursor=pointer]
                        - button "Analyze Paramount compatibility" [ref=e211] [cursor=pointer]
                        - button "Find decision makers at Sky" [ref=e212] [cursor=pointer]
                        - button "Draft outreach for Al Jazeera" [ref=e213] [cursor=pointer]
                    - generic [ref=e216]:
                      - textbox "Ask me about a broadcaster..." [ref=e217]
                      - button "Voice input" [ref=e218] [cursor=pointer]:
                        - img [ref=e219]
                      - button "Send" [disabled] [ref=e222]:
                        - img [ref=e223]
                  - generic [ref=e228]:
                    - heading "How can I help you today?" [level=1] [ref=e230]
                    - generic [ref=e232]:
                      - generic [ref=e235]:
                        - generic [ref=e236]:
                          - button [disabled]:
                            - img
                        - textbox "Type a message..." [ref=e238]
                        - generic [ref=e240]:
                          - button [disabled]:
                            - img
                      - generic [ref=e241]: AI can make mistakes. Please verify important information.
  - button "Open Next.js Dev Tools" [ref=e247] [cursor=pointer]:
    - img [ref=e248]
  - alert [ref=e251]
```

# Test source

```ts
  1  | // spec: specs/broadcaster-search.md
  2  | // seed: seed.spec.ts
  3  | 
  4  | import { test, expect } from '@playwright/test';
  5  | 
  6  | test.describe('Broadcaster Search — Abort & Reset', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/');
  9  |   });
  10 | 
  11 |   test('reset mid-run aborts the pipeline and clears stage state', async ({ page }) => {
  12 |     // 1. Start the pipeline
  13 |     await page.getByRole('textbox').fill('BBC');
  14 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  15 | 
  16 |     // 2. Wait for Stage 0 to be active (loading indicator appears)
  17 |     await expect(page.getByText(/researching broadcaster/i)).toBeVisible({ timeout: 10_000 });
  18 | 
  19 |     // 3. Click the Reset / Stop button while Stage 0 is in progress
  20 |     await page.getByRole('button', { name: /reset|stop|cancel/i }).click();
  21 | 
  22 |     // 4. Stage indicators disappear — UI returns to initial state
  23 |     await expect(page.getByText(/researching broadcaster/i)).not.toBeVisible({ timeout: 5_000 });
  24 | 
  25 |     // 5. No uncaught console errors
  26 |     const errors: string[] = [];
  27 |     page.on('console', (msg) => {
  28 |       if (msg.type() === 'error') errors.push(msg.text());
  29 |     });
  30 |     await page.waitForTimeout(500);
  31 |     expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  32 |   });
  33 | 
  34 |   test('rapid re-submission uses only the latest broadcaster', async ({ page }) => {
  35 |     // 1. Submit BBC
  36 |     const input = page.getByRole('textbox');
  37 |     await input.fill('BBC');
  38 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  39 | 
  40 |     // 2. Immediately clear and submit Paramount before Stage 0 finishes
> 41 |     await input.fill('Paramount');
     |                 ^ Error: locator.fill: Error: strict mode violation: getByRole('textbox') resolved to 4 elements:
  42 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  43 | 
  44 |     // 3. Only Paramount data should appear — not BBC data
  45 |     await expect(page.getByText(/3\.8B USD/i)).toBeVisible({ timeout: 30_000 });
  46 |     await expect(page.getByText(/5\.2B GBP/i)).not.toBeVisible();
  47 |   });
  48 | });
  49 | 
```