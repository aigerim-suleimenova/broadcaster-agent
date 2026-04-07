# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: broadcaster-search-fallback.spec.ts >> Broadcaster Search — Unknown Broadcaster Fallback >> unknown broadcaster triggers generic default metrics
- Location: tests/broadcaster-search-fallback.spec.ts:11:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/250M\+|1\.5B USD/i)
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByText(/250M\+|1\.5B USD/i)

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
          - paragraph [ref=e15]: Netflix
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
                  - text: "# Netflix — Broadcaster Analysis Report ## Executive Summary - **Audience Reach**: As of Q3 2023, Netflix boasts over 247 million global subscribers, with a significant presence in North America, Europe, and APAC. - **Streaming Performance**: The platform recorded a total of 1.2 billion stream hours in Q3 2023, with peak concurrent viewers reaching 30 million during the premiere of \"The Crown\" Season 6. - **Revenue**: Netflix generated approximately $8.5 billion in revenue for Q3 2023, with an average revenue per user (ARPU) of $34.40. - **Key Differentiator**: Netflix's investment in original content, accounting for 60% of its library, continues to set it apart from competitors, driving user engagement and retention. ## 1. Broadcaster Overview Netflix, founded in 1997, transitioned from a DVD rental service to a leading streaming platform in the early 2000s. The company operates solely through its streaming platform, available on various devices including smart TVs, mobile devices, and gaming consoles. - **Geographic Presence**: Netflix is available in over 190 countries, with significant market penetration in North America (70 million subscribers), Europe (80 million), and Asia-Pacific (50 million). - **Subscriber Numbers**: As of Q3 2023, Netflix has approximately 247 million subscribers worldwide. ## 2. Streaming Performance | Metric | Q3 2023 | |----------------------------|----------------| | Total Stream Hours | 1.2 billion | | Peak Concurrent Viewers | 30 million | | Average Bitrate Delivered | 4.5 Mbps | | Rebuffering Ratio | 0.5% | | Startup Time (p50) | 2.5 seconds | | CDN Uptime | 99.99% | **Context**: - **Best Performing Content**: \"The Crown\" Season 6 led the charts with 30 million peak concurrent viewers, showcasing Netflix's strength in original programming. - **Worst Performing Content**: The animated series \"Inside Job\" Season 2 struggled, averaging only 1 million views, indicating potential issues with audience engagement or marketing. ## 3. Content Portfolio - **Top Content Categories**: - Drama: 35% - Comedy: 25% - Action/Thriller: 20% - Documentary: 10% - Family/Kids: 10% | Title/Show | Peak Viewers (millions) | Engagement (hours) | |--------------------------|-------------------------|---------------------| | The Crown (Season 6) | 30 | 500 million | | Stranger Things (Season 4)| 28 | 450 million | | Bridgerton (Season 2) | 25 | 400 million | | Money Heist (Final Part) | 20 | 350 million | | The Witcher (Season 3) | 18 | 300 million | ## 4. Technology Stack - **CDN Providers**: Netflix utilizes its proprietary Open Connect CDN, ensuring efficient content delivery and reduced latency. - **Encoding Formats**: The platform primarily uses H.264 and HEVC (H.265) codecs for video delivery, optimizing for quality and bandwidth. - **DRM Approach**: Netflix employs Widevine DRM for content protection, ensuring secure streaming across devices. - **Ad Tech Stack**: Currently, Netflix operates a subscription-based model (SVOD) but is exploring AVOD options. It utilizes a proprietary ad server with partnerships with major SSPs for potential ad inventory. - **Key Technology Partners**: Collaborations with AWS for cloud services and Akamai for additional CDN support. ## 5. Audience & Demographics | Demographic Breakdown | Percentage Share | |---------------------------|------------------| | Mobile Devices | 45% | | Smart TVs | 30% | | Desktop | 15% | | Gaming Consoles | 10% | | Age Group | Percentage Share | |---------------------------|------------------| | 18-24 | 25% | | 25-34 | 35% | | 35-44 | 20% | | 45+ | 20% | **Engagement Metrics**: - Average Session Duration: 2 hours 15 minutes - Return Rate: 75% ## 6. Revenue & Monetization - **Revenue Model**: - SVOD: 90% - AVOD: 5% - Other (merchandising, licensing): 5% - **Key Revenue Metrics**: - ARPU: $34.40 - Ad CPM (if applicable): $20 - Fill Rate: 80% - Total Revenue Estimate (Q3 2023): $8.5 billion ## 7. Key Recommendations 1. **Enhance Content Personalization**: Invest in AI-driven algorithms to improve content recommendations, increasing engagement and reducing churn. 2. **Expand AVOD Offerings**: Explore ad-supported subscription tiers to attract budget-conscious consumers and diversify revenue streams. 3. **Optimize Streaming Quality**: Continue to refine bitrate delivery and reduce startup times to enhance user experience, particularly in regions with slower internet speeds. 4. **Strengthen International Content**: Increase investment in localized content to appeal to diverse global audiences, particularly in emerging markets. 5. **Leverage Data Analytics**: Utilize viewer data to inform content creation and marketing strategies, ensuring alignment with audience preferences and trends. This comprehensive report highlights Netflix's current standing in the broadcasting landscape, providing insights into its performance, content strategy, technology, and audience engagement, along with actionable recommendations for future growth."
                - generic [ref=e85]:
                  - generic [ref=e86]:
                    - button "Upload .md" [ref=e87] [cursor=pointer]:
                      - img [ref=e88]
                      - text: Upload .md
                    - generic [ref=e91]: 741 words
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
  6  | test.describe('Broadcaster Search — Unknown Broadcaster Fallback', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/');
  9  |   });
  10 | 
  11 |   test('unknown broadcaster triggers generic default metrics', async ({ page }) => {
  12 |     // 1. Enter a name not in the seeded database
  13 |     await page.getByRole('textbox').fill('Netflix');
  14 | 
  15 |     // 2. Submit
  16 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  17 | 
  18 |     // 3. Pipeline launches without error — fallback data appears
> 19 |     await expect(page.getByText(/250M\+|1\.5B USD/i)).toBeVisible({ timeout: 30_000 });
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  20 |   });
  21 | 
  22 |   test('partial keyword "al" matches Al Jazeera', async ({ page }) => {
  23 |     // 1. Enter a partial keyword
  24 |     await page.getByRole('textbox').fill('al');
  25 | 
  26 |     // 2. Submit
  27 |     await page.getByRole('button', { name: /run|start|search/i }).click();
  28 | 
  29 |     // 3. Al Jazeera data is returned (keyword substring match in search_broadcasters)
  30 |     await expect(page.getByText(/MENA|Al Jazeera/i)).toBeVisible({ timeout: 30_000 });
  31 |   });
  32 | });
  33 | 
```