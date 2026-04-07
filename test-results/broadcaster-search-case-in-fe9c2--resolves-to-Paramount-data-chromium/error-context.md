# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: broadcaster-search-case-insensitive.spec.ts >> Broadcaster Search — Case Insensitivity >> mixed-case "pArAmOuNt" resolves to Paramount data
- Location: tests/broadcaster-search-case-insensitive.spec.ts:22:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/3\.8B USD/i)
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByText(/3\.8B USD/i)

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
          - paragraph [ref=e15]: pArAmOuNt
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
                  - text: "# pArAmOuNt — Broadcaster Analysis Report ## Executive Summary - **Audience Reach**: pArAmOuNt has an estimated global audience reach of 80 million subscribers across its streaming services and traditional broadcast channels. - **Streaming Performance**: The platform recorded a total of 1.2 billion stream hours in Q3 2023, with peak concurrent viewers reaching 5 million during the release of a major original series. - **Revenue**: Total revenue for the fiscal year 2023 is projected to be approximately $6.5 billion, with a 20% increase year-over-year driven by subscription growth and ad revenues. - **Key Differentiator**: pArAmOuNt's unique selling proposition lies in its extensive library of premium content, including exclusive sports broadcasting rights and a diverse range of original programming. ## 1. Broadcaster Overview pArAmOuNt, a subsidiary of Paramount Global, is a major player in the entertainment industry, offering a wide array of content through various channels and platforms. - **Broadcast Channels**: pArAmOuNt Network, CBS, MTV, Nickelodeon, and Showtime. - **Streaming Platforms**: Paramount+, CBS All Access, and Pluto TV. - **Geographic Presence**: Strong presence in North America, Europe, and growing markets in Latin America and Asia. - **Subscription/Viewer Numbers**: As of Q3 2023, Paramount+ has approximately 55 million subscribers, while Pluto TV boasts around 25 million active users. ## 2. Streaming Performance | Metric | Value | |-------------------------------|---------------------| | Total Stream Hours | 1.2 billion hours | | Peak Concurrent Viewers | 5 million | | Average Bitrate Delivered | 5.5 Mbps | | Rebuffering Ratio | 1.2% | | Startup Time (p50) | 3.5 seconds | | CDN Uptime | 99.9% | **Best Performing Content**: The series \"Star Trek: Strange New Worlds\" averaged 3 million peak concurrent viewers during its season finale. **Worst Performing Content**: The reality show \"The Challenge: All Stars\" had a disappointing average viewership of 500,000, attributed to stiff competition from other reality formats. ## 3. Content Portfolio - **Top Content Categories**: - Drama: 35% - Comedy: 25% - Sports: 20% - Reality: 15% - Documentaries: 5% | Title/Show | Peak Viewers | Engagement Rate (%) | |---------------------------------|--------------|---------------------| | Star Trek: Strange New Worlds | 3 million | 85% | | Yellowstone | 2.5 million | 75% | | The Good Fight | 1.8 million | 70% | | Survivor | 1.5 million | 65% | | The Challenge: All Stars | 500,000 | 40% | ## 4. Technology Stack - **CDN Providers**: Akamai and Cloudflare are the primary CDN providers, ensuring robust content delivery. - **Encoding Formats**: Uses H.264 and H.265 codecs for video streaming to optimize quality and bandwidth usage. - **DRM Approach**: Widevine and PlayReady for content protection, ensuring secure delivery of premium content. - **Ad Tech Stack**: Ad server powered by FreeWheel, with SSPs including SpotX and Magnite for programmatic advertising. - **Key Technology Partners**: AWS for cloud services and analytics, and Brightcove for video hosting solutions. ## 5. Audience & Demographics | Device Type | Percentage of Audience | |-------------------|------------------------| | Mobile | 40% | | Smart TVs | 30% | | Desktop | 20% | | Tablets | 10% | | Age Group | Percentage of Audience | |-------------------|------------------------| | 18-24 | 25% | | 25-34 | 30% | | 35-44 | 20% | | 45+ | 25% | | Geography | Percentage of Audience | |-------------------|------------------------| | North America | 50% | | Europe | 30% | | Latin America | 10% | | Asia | 10% | **Engagement Metrics**: - Average Session Duration: 45 minutes - Return Rate: 60% ## 6. Revenue & Monetization - **Revenue Model**: - SVOD: 60% - AVOD: 25% - FAST: 10% - Linear: 5% - **Key Revenue Metrics**: - ARPU (Average Revenue Per User): $12.50 - Ad CPM (Cost Per Mille): $25 - Fill Rate: 85% - Total Revenue Estimate: $6.5 billion for FY 2023 ## 7. Key Recommendations 1. **Enhance User Experience**: Invest in optimizing startup time and rebuffering ratios to improve overall user satisfaction and retention. 2. **Content Diversification**: Expand the portfolio in underrepresented genres such as documentaries and international programming to attract a broader audience. 3. **Targeted Advertising**: Leverage data analytics to enhance targeted advertising strategies, thereby increasing ad CPM and overall ad revenue. 4. **Partnership Expansion**: Explore partnerships with emerging social media platforms to promote content and increase engagement among younger demographics. 5. **Technology Upgrades**: Consider adopting next-gen codecs like AV1 for better compression and quality, which can enhance streaming performance on lower bandwidth connections."
                - generic [ref=e85]:
                  - generic [ref=e86]:
                    - button "Upload .md" [ref=e87] [cursor=pointer]:
                      - img [ref=e88]
                      - text: Upload .md
                    - generic [ref=e91]: 733 words
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
  6  | test.describe('Broadcaster Search — Case Insensitivity', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/');
  9  |   });
  10 | 
  11 |   test('lowercase "bbc" resolves to BBC data', async ({ page }) => {
  12 |     // 1. Enter all-lowercase name
  13 |     await page.getByRole('textbox').fill('bbc');
  14 | 
  15 |     // 2. Submit
  16 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  17 | 
  18 |     // 3. BBC-specific data appears — confirms normalisation via .toLowerCase().trim()
  19 |     await expect(page.getByText(/500M\+|5\.2B GBP/i)).toBeVisible({ timeout: 30_000 });
  20 |   });
  21 | 
  22 |   test('mixed-case "pArAmOuNt" resolves to Paramount data', async ({ page }) => {
  23 |     // 1. Enter mixed-case name
  24 |     await page.getByRole('textbox').fill('pArAmOuNt');
  25 | 
  26 |     // 2. Submit
  27 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  28 | 
  29 |     // 3. Paramount data appears — not the generic fallback
> 30 |     await expect(page.getByText(/3\.8B USD/i)).toBeVisible({ timeout: 30_000 });
     |                                                ^ Error: expect(locator).toBeVisible() failed
  31 |   });
  32 | });
  33 | 
```