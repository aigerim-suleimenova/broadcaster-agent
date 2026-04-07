# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: broadcaster-search-happy-path.spec.ts >> Broadcaster Search — Happy Path >> known broadcaster BBC returns rich data in Stage 0
- Location: tests/broadcaster-search-happy-path.spec.ts:12:7

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
                  - text: "# BBC — Broadcaster Analysis Report ## Executive Summary - **Audience Reach**: BBC's total audience reach stands at approximately 42 million weekly viewers across all platforms in the UK, with a global reach of 476 million. - **Streaming Performance**: BBC iPlayer recorded 1.5 billion streams in 2023, with a 15% increase in total stream hours compared to the previous year. - **Revenue**: The BBC generated an estimated £5.5 billion in revenue in 2023, with 70% derived from the TV license fee and 30% from commercial activities. - **Key Differentiator**: BBC's commitment to public service broadcasting and diverse content offerings, including award-winning documentaries and news coverage, sets it apart from competitors. ## 1. Broadcaster Overview The BBC (British Broadcasting Corporation) is a public service broadcaster established in 1922. It operates multiple channels, including BBC One, BBC Two, BBC Three, and BBC Four, along with radio services such as BBC Radio 1 and BBC Radio 4. ### Broadcast Channels - **Television**: BBC One, BBC Two, BBC Three, BBC Four, CBBC, CBeebies, BBC News. - **Radio**: BBC Radio 1, Radio 2, Radio 3, Radio 4, Radio 5 Live, BBC Asian Network. ### Streaming Platforms - **BBC iPlayer**: The primary streaming service for on-demand content. - **BBC Sounds**: A platform for audio content, including podcasts and live radio. ### Geographic Presence - Primarily UK-based, with international services such as BBC World News and BBC iPlayer available in select countries. ### Subscription/Viewer Numbers - **iPlayer Users**: Approximately 10 million registered users, with 40% of the UK population accessing the platform monthly. ## 2. Streaming Performance | Metric | Value | |---------------------------|-----------------------------| | Total Stream Hours | 1.5 billion hours | | Peak Concurrent Viewers | 1.2 million | | Average Bitrate Delivered | 4.5 Mbps | | Rebuffering Ratio | 0.5% | | Startup Time (p50) | 3.2 seconds | | CDN Uptime | 99.9% | ### Content Performance Context - **Best Performing Content**: \"Doctor Who\" Season 13 finale garnered 3.5 million peak viewers on iPlayer, contributing to a 20% increase in engagement during its release week. - **Worst Performing Content**: A documentary series on niche historical events saw less than 100,000 streams, indicating a mismatch with audience interests. ## 3. Content Portfolio ### Top Content Categories - **Drama**: 35% - **Documentary**: 25% - **News**: 20% - **Children's Programming**: 10% - **Entertainment**: 10% ### Top 5 Performing Titles/Shows | Title | Peak Viewers | Engagement Rate (%) | |---------------------------|--------------|---------------------| | Doctor Who | 3.5 million | 85 | | Strictly Come Dancing | 2.8 million | 90 | | Blue Planet II | 2.5 million | 80 | | Line of Duty | 2.2 million | 75 | | The Great British Bake Off| 2.0 million | 78 | ## 4. Technology Stack - **CDN Providers**: Akamai and Cloudflare, ensuring robust global content delivery. - **Encoding Formats**: H.264 and H.265 for video, AAC for audio, optimizing for both quality and bandwidth. - **DRM Approach**: Widevine and PlayReady for secure content distribution. - **Ad Tech Stack**: Google Ad Manager as the ad server, with integration of multiple SSPs including Rubicon Project and OpenX. - **Key Technology Partners**: AWS for cloud services, Microsoft Azure for data analytics. ## 5. Audience & Demographics | Demographic Breakdown | Percentage (%) | |---------------------------|----------------| | Mobile Devices | 45 | | Smart TVs | 30 | | Desktop/Laptop | 20 | | Tablets | 5 | | Age Group | Percentage (%) | |---------------------------|----------------| | 18-24 | 20 | | 25-34 | 25 | | 35-54 | 30 | | 55+ | 25 | | Geography | Percentage (%) | |---------------------------|----------------| | UK | 85 | | Europe | 10 | | Rest of the World | 5 | ### Engagement Metrics - **Average Session Duration**: 45 minutes - **Return Rate**: 60% ## 6. Revenue & Monetization ### Revenue Model - **TV License Fee**: 70% - **Commercial Activities (including BBC Studios)**: 30% ### Key Revenue Metrics - **Average Revenue Per User (ARPU)**: £150 per year - **Ad CPM**: £8.50 - **Fill Rate**: 75% - **Total Revenue Estimate**: £5.5 billion ## 7. Key Recommendations 1. **Enhance Content Personalization**: Implement advanced AI-driven algorithms to provide tailored recommendations, improving user engagement and retention. 2. **Expand International Reach**: Increase the availability of BBC iPlayer in more international markets to capture a broader audience base. 3. **Invest in Original Content**: Allocate a larger budget for original programming to compete with global streaming giants and attract diverse viewer demographics. 4. **Optimize Streaming Infrastructure**: Continue to monitor and enhance streaming performance metrics, focusing on reducing startup time and rebuffering ratios. 5. **Leverage Data Analytics**: Utilize viewer data to refine content strategy and advertising effectiveness, ensuring higher engagement and monetization opportunities."
                - generic [ref=e85]:
                  - generic [ref=e86]:
                    - button "Upload .md" [ref=e87] [cursor=pointer]:
                      - img [ref=e88]
                      - text: Upload .md
                    - generic [ref=e91]: 782 words
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
  6  | test.describe('Broadcaster Search — Happy Path', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.context().clearCookies();
  9  |     await page.goto('/');
  10 |   });
  11 | 
  12 |   test('known broadcaster BBC returns rich data in Stage 0', async ({ page }) => {
  13 |     // 1. Type BBC into the broadcaster name input
  14 |     await page.getByRole('textbox').fill('BBC');
  15 | 
  16 |     // 2. Submit the form
  17 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  18 | 
  19 |     // 3. Stage 0 should become active
  20 |     await expect(page.getByText(/researching broadcaster/i)).toBeVisible({ timeout: 10_000 });
  21 | 
  22 |     // 4. Stage 0 completes and BBC-specific data appears
> 23 |     await expect(page.getByText(/500M\+|5\.2B GBP/i)).toBeVisible({ timeout: 30_000 });
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  24 |   });
  25 | 
  26 |   test('known broadcaster Paramount returns rich data in Stage 0', async ({ page }) => {
  27 |     // 1. Type Paramount into the broadcaster name input
  28 |     await page.getByRole('textbox').fill('Paramount');
  29 | 
  30 |     // 2. Submit the form
  31 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  32 | 
  33 |     // 3. Stage 0 completes with Paramount data
  34 |     await expect(page.getByText(/3\.8B USD|North America/i)).toBeVisible({ timeout: 30_000 });
  35 |   });
  36 | 
  37 |   test('known broadcaster Al Jazeera returns rich data in Stage 0', async ({ page }) => {
  38 |     // 1. Type Al Jazeera into the broadcaster name input
  39 |     await page.getByRole('textbox').fill('Al Jazeera');
  40 | 
  41 |     // 2. Submit the form
  42 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  43 | 
  44 |     // 3. Stage 0 completes with Al Jazeera data
  45 |     await expect(page.getByText(/MENA|57%/i)).toBeVisible({ timeout: 30_000 });
  46 |   });
  47 | });
  48 | 
```