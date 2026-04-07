# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: broadcaster-search-case-insensitive.spec.ts >> Broadcaster Search — Case Insensitivity >> lowercase "bbc" resolves to BBC data
- Location: tests/broadcaster-search-case-insensitive.spec.ts:11:7

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
          - paragraph [ref=e15]: bbc
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
                  - text: "# bbc — Broadcaster Analysis Report ## Executive Summary - **Audience Reach**: BBC's total audience reach is approximately 90 million weekly across all platforms, with a significant presence in the UK and growing international viewership. - **Streaming Performance**: BBC iPlayer recorded over 1.5 billion streams in the last fiscal year, with peak concurrent viewers reaching 1.2 million during live events. - **Revenue**: The broadcaster generated an estimated £5 billion in total revenue for FY 2022-2023, with 60% derived from license fees and 25% from commercial activities. - **Key Differentiator**: BBC’s unique selling proposition lies in its public service broadcasting mandate, offering a diverse range of high-quality content without commercial interruptions. ## 1. Broadcaster Overview The British Broadcasting Corporation (BBC) is a public service broadcaster established in 1922. It operates multiple television channels, radio stations, and online platforms, including: - **Broadcast Channels**: BBC One, BBC Two, BBC Three, BBC Four, BBC News, and BBC Parliament. - **Streaming Platforms**: BBC iPlayer, BBC Sounds, and BBC News Online. - **Geographic Presence**: Predominantly in the UK, with services available internationally through BBC Worldwide. - **Subscription/Viewer Numbers**: Over 30 million registered users on BBC iPlayer, with an average of 12 million daily users across all platforms. ## 2. Streaming Performance | Metric | Value | |-------------------------------|---------------------| | Total Stream Hours | 1.5 billion hours | | Peak Concurrent Viewers | 1.2 million | | Average Bitrate Delivered | 5.5 Mbps | | Rebuffering Ratio | 0.8% | | Startup Time (p50) | 3.2 seconds | | CDN Uptime | 99.9% | ### Best and Worst Performing Content - **Best Performing Content**: The live coverage of the FIFA World Cup 2022 peaked at 1.2 million concurrent viewers, with total streams exceeding 200 million. - **Worst Performing Content**: A recent drama series, \"The Silent Witness,\" had a peak of only 150,000 viewers, attributed to intense competition from streaming giants. ## 3. Content Portfolio - **Top Content Categories**: - News: 35% - Drama: 25% - Documentaries: 20% - Entertainment: 15% - Sports: 5% | Title/Show | Peak Viewers | Engagement (Avg. Watch Time) | |-------------------------------|--------------|-------------------------------| | Doctor Who | 1.5 million | 45 minutes | | Strictly Come Dancing | 1.3 million | 50 minutes | | The Great British Bake Off | 1.1 million | 40 minutes | | Line of Duty | 1 million | 48 minutes | | Planet Earth II | 800,000 | 60 minutes | ## 4. Technology Stack - **CDN Providers**: Akamai and Cloudflare are the primary CDN providers, ensuring global content delivery with low latency. - **Encoding Formats**: H.264 for standard definition and H.265 for high definition, optimizing for various bandwidth conditions. - **DRM Approach**: Widevine and PlayReady are utilized for content protection, ensuring secure streaming. - **Ad Tech Stack**: The BBC employs Google Ad Manager as its ad server, with integration of SSPs like SpotX and Freewheel. - **Key Technology Partners**: Collaboration with AWS for cloud infrastructure and analytics, and Microsoft for AI-driven content recommendations. ## 5. Audience & Demographics | Device Type | Percentage Share | |--------------------|------------------| | Mobile | 45% | | Desktop | 30% | | Smart TVs | 20% | | Tablets | 5% | | Age Group | Percentage Share | |--------------------|------------------| | 18-24 | 25% | | 25-34 | 30% | | 35-54 | 25% | | 55+ | 20% | | Geography | Percentage Share | |--------------------|------------------| | UK | 85% | | Europe | 10% | | Rest of the World | 5% | ### Engagement Metrics - **Average Session Duration**: 35 minutes - **Return Rate**: 60% of users return to the platform at least once a week. ## 6. Revenue & Monetization - **Revenue Model**: - License Fees: 60% - Commercial Activities (SVOD/AVOD): 25% - Other (Merchandising, Events): 15% | Key Revenue Metrics | Value | |---------------------------|----------------------| | Average Revenue Per User (ARPU) | £150/year | | Ad CPM | £12 | | Fill Rate | 75% | | Total Revenue Estimate | £5 billion | ## 7. Key Recommendations 1. **Enhance User Experience**: Invest in improving startup times and reducing rebuffering ratios to enhance viewer satisfaction. 2. **Expand Content Library**: Diversify content offerings, particularly in the sports and entertainment categories, to attract younger demographics. 3. **Leverage Data Analytics**: Utilize AI and machine learning to provide personalized content recommendations, increasing user engagement and retention. 4. **Increase International Presence**: Explore partnerships or localized content for international markets to grow global audience reach. 5. **Optimize Monetization Strategies**: Consider expanding AVOD offerings, especially for non-licensed content, to capture more advertising revenue. This comprehensive analysis provides insights into BBC's current standing in the broadcasting landscape and outlines actionable strategies for future growth and improvement."
                - generic [ref=e85]:
                  - generic [ref=e86]:
                    - button "Upload .md" [ref=e87] [cursor=pointer]:
                      - img [ref=e88]
                      - text: Upload .md
                    - generic [ref=e91]: 779 words
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
> 19 |     await expect(page.getByText(/500M\+|5\.2B GBP/i)).toBeVisible({ timeout: 30_000 });
     |                                                       ^ Error: expect(locator).toBeVisible() failed
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
  30 |     await expect(page.getByText(/3\.8B USD/i)).toBeVisible({ timeout: 30_000 });
  31 |   });
  32 | });
  33 | 
```