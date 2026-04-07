# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: broadcaster-search-pipeline.spec.ts >> Broadcaster Search — End-to-End Pipeline >> pipeline progresses through all 4 stages for BBC
- Location: tests/broadcaster-search-pipeline.spec.ts:11:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/500M\+|5\.2B GBP/i)
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByText(/500M\+|5\.2B GBP/i)

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
    - generic [ref=e22]:
      - generic [ref=e24]:
        - tablist "Pipeline stages" [ref=e25]:
          - 'tab "Stage 1: Research (complete)" [selected] [ref=e26] [cursor=pointer]'
          - 'tab "Stage 2: Compatibility (pending)" [disabled] [ref=e27]'
          - 'tab "Stage 3: Decision Makers (pending)" [disabled] [ref=e28]'
          - 'tab "Stage 4: Outreach Plan (pending)" [disabled] [ref=e29]'
          - 'tab "Stage 5: Review (pending)" [disabled] [ref=e30]'
        - generic [ref=e31]:
          - generic [ref=e32]:
            - paragraph [ref=e33]: Stage 1 of 5
            - paragraph [ref=e34]: Research
          - generic [ref=e35]: Researching broadcaster...
      - generic [ref=e40]:
        - generic [ref=e42]:
          - generic [ref=e46]: "HTTP 502: {\"error\":\"Failed to proxy request to AG-UI backend\"}"
          - button "×" [ref=e47] [cursor=pointer]
        - generic [ref=e48]:
          - banner [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]:
                - img [ref=e53]
                - generic [ref=e58]:
                  - heading "Signal" [level=1] [ref=e59]
                  - paragraph [ref=e60]: Research intelligence for the media industry
              - button "Close Signal" [ref=e61] [cursor=pointer]:
                - img [ref=e62]
                - text: Hide Signal
          - generic [ref=e65]:
            - main [ref=e66]:
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - generic [ref=e71]: "Samples:"
                  - generic [ref=e72]:
                    - button "📊 Channel Performance" [ref=e73] [cursor=pointer]
                    - button "📝 Broadcast Ops Notes" [ref=e74] [cursor=pointer]
                    - button "🚀 Channel Launch Plan" [ref=e75] [cursor=pointer]
                    - button "⚙️ Streaming Tech Guide" [ref=e76] [cursor=pointer]
                    - button "📈 Streaming Market Report" [ref=e77] [cursor=pointer]
                    - button "📊 BBC Performance Report" [ref=e78] [cursor=pointer]
                    - button "📡 Sky Stream Quality" [ref=e79] [cursor=pointer]
                    - button "🚀 Paramount+ Strategy" [ref=e80] [cursor=pointer]
                    - button "📈 TF1 Group Analysis" [ref=e81] [cursor=pointer]
                    - button "⚙️ Netflix Tech Overview" [ref=e82] [cursor=pointer]
                - 'textbox "# Your Research Title ## Introduction Enter your research content here... ## Key Findings - Finding 1 - Finding 2 ## Data & Statistics - 85% improvement in efficiency - $2.5M cost savings ## Code Examples ```python def analyze_data(content): return insights ``` ## Conclusion Your conclusions here..." [ref=e84]':
                  - /placeholder: "# Your Research Title\n## Introduction\nEnter your research content here...\n\n## Key Findings\n- Finding 1\n- Finding 2\n\n## Data & Statistics\n- 85% improvement in efficiency\n- $2.5M cost savings\n\n## Code Examples\n```python\ndef analyze_data(content):\n  return insights\n```\n\n## Conclusion\nYour conclusions here..."
                  - text: "# BBC — Broadcaster Analysis Report ## Executive Summary - **Audience Reach**: BBC reaches approximately 80% of the UK population weekly, with 42 million unique visitors to its digital platforms. - **Streaming Performance**: In the last quarter, BBC iPlayer recorded 1.5 billion stream hours, with a peak of 1.2 million concurrent viewers during a major sporting event. - **Revenue**: BBC reported an annual revenue of £5.2 billion for FY 2022/23, with 25% derived from commercial activities and licensing. - **Key Differentiator**: The BBC's unique position as a publicly funded broadcaster allows it to prioritize quality content over advertising revenue, fostering a diverse content portfolio. ## 1. Broadcaster Overview The British Broadcasting Corporation (BBC) is a public service broadcaster established in 1922. It operates multiple television channels, radio stations, and digital platforms, including: - **Broadcast Channels**: BBC One, BBC Two, BBC Three, BBC Four, CBBC, CBeebies, BBC News, and BBC Parliament. - **Streaming Platforms**: BBC iPlayer, BBC Sounds. - **Geographic Presence**: Primarily in the UK, with international reach through BBC World News and BBC iPlayer (select content available globally). - **Subscription/Viewer Numbers**: Approximately 10 million active users on BBC iPlayer, with 26 million registered accounts. ## 2. Streaming Performance | Metric | Value | |---------------------------|-------------------------| | Total Stream Hours | 1.5 billion hours | | Peak Concurrent Viewers | 1.2 million viewers | | Average Bitrate Delivered | 4.5 Mbps | | Rebuffering Ratio | 0.8% | | Startup Time (p50) | 3.2 seconds | | CDN Uptime | 99.98% | **Context**: - **Best Performing Content**: The final of \"Strictly Come Dancing\" generated 1.2 million concurrent viewers, showcasing the platform's capability to handle high traffic. - **Worst Performing Content**: A lesser-known documentary series attracted only 50,000 views, indicating a need for better promotion and audience targeting. ## 3. Content Portfolio - **Top Content Categories**: - Drama: 35% - Documentary: 25% - News: 20% - Children’s: 10% - Sports: 10% | Title/Show | Peak Viewers | Engagement Rate | |----------------------------|--------------|------------------| | Strictly Come Dancing | 1.2 million | 85% | | Doctor Who | 800,000 | 78% | | The Great British Bake Off | 700,000 | 80% | | Blue Planet II | 600,000 | 75% | | Match of the Day | 500,000 | 70% | ## 4. Technology Stack - **CDN Providers**: Akamai and Cloudflare for content delivery, ensuring global reach and low latency. - **Encoding Formats**: H.264 and H.265 for video compression, ensuring high quality at lower bitrates. - **DRM Approach**: Widevine and PlayReady for secure content delivery, protecting against piracy. - **Ad Tech Stack**: Google Ad Manager as the ad server, with integration of SSPs like SpotX and FreeWheel for programmatic advertising. - **Key Technology Partners**: AWS for cloud services, Microsoft Azure for data analytics, and Brightcove for video hosting. ## 5. Audience & Demographics | Device | Percentage of Audience | Age Group | Percentage of Audience | Geography | Percentage of Audience | |-------------------|------------------------|--------------------|-----------------------|-------------------|-----------------------| | Mobile | 45% | 18-24 | 20% | England | 70% | | Desktop | 30% | 25-34 | 25% | Scotland | 10% | | Smart TV | 25% | 35-44 | 20% | Wales | 10% | | | | 45-54 | 15% | Northern Ireland | 10% | **Engagement Metrics**: - Average Session Duration: 45 minutes - Return Rate: 60% ## 6. Revenue & Monetization - **Revenue Model**: - License Fee: 75% - Commercial Activities (SVOD/AVOD): 25% | Metric | Value | |-------------------|------------------------| | ARPU | £15.00 | | Ad CPM | £10.00 | | Fill Rate | 75% | | Total Revenue Estimate | £5.2 billion | ## 7. Key Recommendations 1. **Enhance Content Promotion**: Invest in targeted marketing strategies to boost viewership for underperforming content, especially documentaries. 2. **Optimize Streaming Infrastructure**: Continue to refine CDN strategies to further reduce startup times and rebuffering ratios, enhancing user experience. 3. **Expand International Footprint**: Increase availability of BBC iPlayer content in international markets to grow subscriber base and diversify revenue. 4. **Leverage Data Analytics**: Utilize advanced analytics to better understand viewer preferences and tailor content offerings accordingly. 5. **Innovate Ad Solutions**: Explore interactive and personalized advertising solutions to increase ad engagement and revenue from commercial activities."
                - generic [ref=e85]:
                  - generic [ref=e86]:
                    - button "Upload .md" [ref=e87] [cursor=pointer]:
                      - img [ref=e88]
                      - text: Upload .md
                    - generic [ref=e91]: 698 words
                  - button "Generate Dashboard" [ref=e92] [cursor=pointer]
            - complementary [ref=e93]:
              - generic [ref=e95]:
                - generic [ref=e96]:
                  - generic [ref=e97]:
                    - img [ref=e98]
                    - generic [ref=e103]: Signal
                  - button "Close chat" [ref=e104] [cursor=pointer]:
                    - img [ref=e105]
                - generic [ref=e109]:
                  - generic [ref=e111]:
                    - complementary "Navigation" [ref=e112]:
                      - button "Expand navigation" [ref=e114] [cursor=pointer]:
                        - img [ref=e116]
                      - navigation [ref=e118]:
                        - button [ref=e119] [cursor=pointer]:
                          - img [ref=e120]
                        - button [ref=e123] [cursor=pointer]:
                          - img [ref=e124]
                        - button [ref=e130] [cursor=pointer]:
                          - img [ref=e131]
                    - generic [ref=e134]:
                      - img [ref=e136]
                      - generic [ref=e143]:
                        - heading "Hi, I'm Signal." [level=1] [ref=e144]
                        - paragraph [ref=e145]:
                          - text: Research intelligence
                          - text: for the media industry.
                      - generic [ref=e146]:
                        - button "Research BBC's ad tech stack" [ref=e147] [cursor=pointer]
                        - button "Analyze Paramount compatibility" [ref=e148] [cursor=pointer]
                        - button "Find decision makers at Sky" [ref=e149] [cursor=pointer]
                        - button "Draft outreach for Al Jazeera" [ref=e150] [cursor=pointer]
                    - generic [ref=e153]:
                      - textbox "Ask me about a broadcaster..." [ref=e154]
                      - button "Voice input" [ref=e155] [cursor=pointer]:
                        - img [ref=e156]
                      - button "Send" [disabled] [ref=e159]:
                        - img [ref=e160]
                  - generic [ref=e165]:
                    - heading "How can I help you today?" [level=1] [ref=e167]
                    - generic [ref=e169]:
                      - generic [ref=e172]:
                        - generic [ref=e173]:
                          - button [disabled]:
                            - img
                        - textbox "Type a message..." [ref=e175]
                        - generic [ref=e177]:
                          - button [disabled]:
                            - img
                      - generic [ref=e178]: AI can make mistakes. Please verify important information.
        - button "Web Inspector" [ref=e180]:
          - note [ref=e181]:
            - generic [ref=e182]: CopilotKit v1.50 is now live!
          - img "Inspector logo" [ref=e184]
      - generic [ref=e187]:
        - paragraph [ref=e188]: Stage complete. Ready to continue?
        - generic [ref=e189]:
          - button "Exit Pipeline" [ref=e190] [cursor=pointer]
          - button "Next Stage" [ref=e191] [cursor=pointer]:
            - img [ref=e192]
            - text: Next Stage
  - generic [ref=e198] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e199]:
      - img [ref=e200]
    - generic [ref=e203]:
      - button "Open issues overlay" [ref=e204]:
        - generic [ref=e205]:
          - generic [ref=e206]: "0"
          - generic [ref=e207]: "1"
        - generic [ref=e208]: Issue
      - button "Collapse issues badge" [ref=e209]:
        - img [ref=e210]
  - alert [ref=e212]
```

# Test source

```ts
  1  | // spec: specs/broadcaster-search.md
  2  | // seed: seed.spec.ts
  3  | 
  4  | import { test, expect } from '@playwright/test';
  5  | 
  6  | test.describe('Broadcaster Search — End-to-End Pipeline', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/');
  9  |   });
  10 | 
  11 |   test('pipeline progresses through all 4 stages for BBC', async ({ page }) => {
  12 |     // 1. Enter broadcaster name and start
  13 |     await page.getByRole('textbox').fill('BBC');
  14 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  15 | 
  16 |     // 2. Stage 0 (Research) completes
> 17 |     await expect(page.getByText(/500M\+|5\.2B GBP/i)).toBeVisible({ timeout: 30_000 });
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  18 | 
  19 |     // 3. Proceed to Stage 1 (Compatibility Analysis)
  20 |     await page.getByRole('button', { name: /proceed|next|continue/i }).click();
  21 |     await expect(page.getByText(/analyzing compatibility/i)).toBeVisible({ timeout: 10_000 });
  22 |     await expect(page.getByText(/compatibility|score/i)).toBeVisible({ timeout: 30_000 });
  23 | 
  24 |     // 4. Proceed to Stage 2 (Decision Makers)
  25 |     await page.getByRole('button', { name: /proceed|next|continue/i }).click();
  26 |     await expect(page.getByText(/finding contacts|decision maker/i)).toBeVisible({ timeout: 10_000 });
  27 |     await expect(page.getByText(/decision maker|contact/i)).toBeVisible({ timeout: 30_000 });
  28 | 
  29 |     // 5. Proceed to Stage 3 (Outreach Plan)
  30 |     await page.getByRole('button', { name: /proceed|next|continue/i }).click();
  31 |     await expect(page.getByText(/preparing outreach/i)).toBeVisible({ timeout: 10_000 });
  32 | 
  33 |     // 6. Email draft is produced (subject and body)
  34 |     await expect(page.getByText(/subject|email draft/i)).toBeVisible({ timeout: 30_000 });
  35 | 
  36 |     // 7. Reach the final Review stage
  37 |     await page.getByRole('button', { name: /proceed|next|continue/i }).click();
  38 |     await expect(page.getByText(/ready for review|review/i)).toBeVisible({ timeout: 10_000 });
  39 |   });
  40 | 
  41 |   test('localStorage thread ID persists across page reloads', async ({ page }) => {
  42 |     // 1. First load — thread ID is generated and stored
  43 |     const threadId = await page.evaluate(() => localStorage.getItem('copilotkit-thread-id'));
  44 |     expect(threadId).not.toBeNull();
  45 | 
  46 |     // 2. Reload the page
  47 |     await page.reload();
  48 | 
  49 |     // 3. Same thread ID is reused
  50 |     const threadIdAfterReload = await page.evaluate(() =>
  51 |       localStorage.getItem('copilotkit-thread-id')
  52 |     );
  53 |     expect(threadIdAfterReload).toBe(threadId);
  54 |   });
  55 | });
  56 | 
```