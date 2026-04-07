# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: broadcaster-search-happy-path.spec.ts >> Broadcaster Search — Happy Path >> known broadcaster Al Jazeera returns rich data in Stage 0
- Location: tests/broadcaster-search-happy-path.spec.ts:37:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/MENA|57%/i)
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByText(/MENA|57%/i)

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
          - paragraph [ref=e15]: Al Jazeera
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
                  - text: "# Al Jazeera — Broadcaster Analysis Report ## Executive Summary - **Audience Reach**: Al Jazeera boasts a global audience of approximately 300 million viewers, with strong penetration in the Middle East, North Africa, and growing presence in Europe and North America. - **Streaming Performance**: The network recorded over 2 billion total stream hours in the past year, with peak concurrent viewers reaching 1.5 million during major news events. - **Revenue**: Estimated total revenue for 2023 is around $500 million, with approximately 40% derived from advertising and 60% from subscription services. - **Key Differentiator**: Al Jazeera's commitment to in-depth reporting and diverse perspectives on global news sets it apart from competitors, particularly in regions with limited media freedom. ## 1. Broadcaster Overview Al Jazeera Media Network, founded in 1996, is a state-funded broadcaster based in Doha, Qatar. It operates multiple channels, including: - **Al Jazeera Arabic**: The flagship channel, reaching over 100 million viewers. - **Al Jazeera English**: Launched in 2006, it has gained significant traction, especially in the US and UK markets. - **Al Jazeera Balkans**: Targeting the Balkan region. - **Al Jazeera Documentary**: Focused on documentary filmmaking. ### Streaming Platforms - Al Jazeera operates its streaming service via its website and mobile applications, with over 10 million monthly active users. ### Geographic Presence - Strong presence in the Middle East and North Africa, with growing audiences in Europe, North America, and Asia. ### Subscription/Viewer Numbers - Al Jazeera English has approximately 50 million subscribers globally, while Al Jazeera Arabic has around 80 million. ## 2. Streaming Performance | Metric | Value | |---------------------------|----------------------| | Total Stream Hours | 2 billion hours | | Peak Concurrent Viewers | 1.5 million | | Average Bitrate Delivered | 4.5 Mbps | | Rebuffering Ratio | 0.5% | | Startup Time (p50) | 3.2 seconds | | CDN Uptime | 99.9% | ### Best and Worst Performing Content - **Best Performing Content**: Major events like the Arab Spring coverage and the COVID-19 pandemic updates saw peak concurrent viewers surpassing 1 million. - **Worst Performing Content**: Some niche documentaries struggled to reach 50,000 concurrent viewers, indicating a need for improved marketing strategies. ## 3. Content Portfolio ### Top Content Categories - **News**: 55% - **Documentaries**: 25% - **Talk Shows**: 10% - **Current Affairs**: 10% ### Top 5 Performing Titles/Shows | Title | Peak Viewers | Engagement Rate (%) | |---------------------------|--------------|----------------------| | Inside Story | 1.2 million | 75% | | Al Jazeera Investigates | 800,000 | 68% | | The Stream | 600,000 | 70% | | News Hour | 1 million | 80% | | Fault Lines | 500,000 | 65% | ## 4. Technology Stack - **CDN Providers**: Akamai and Cloudflare, providing a robust delivery strategy with global reach. - **Encoding Formats**: H.264 and H.265 for video delivery, ensuring high quality and efficiency. - **DRM Approach**: Widevine and PlayReady are utilized to protect content across platforms. - **Ad Tech Stack**: Google Ad Manager for ad serving, with partnerships with major SSPs like SpotX and FreeWheel. - **Key Technology Partners**: Amazon Web Services (AWS) for cloud infrastructure and analytics. ## 5. Audience & Demographics | Device Type | Percentage of Audience | |-------------------|------------------------| | Mobile | 60% | | Desktop | 25% | | Smart TVs | 15% | | Age Group | Percentage of Audience | |-------------------|------------------------| | 18-24 | 20% | | 25-34 | 35% | | 35-54 | 30% | | 55+ | 15% | | Geography | Percentage of Audience | |-------------------|------------------------| | Middle East | 40% | | North America | 25% | | Europe | 20% | | Asia | 15% | ### Engagement Metrics - **Average Session Duration**: 15 minutes - **Return Rate**: 45% ## 6. Revenue & Monetization ### Revenue Model - **AVOD (Advertising Video on Demand)**: 40% - **SVOD (Subscription Video on Demand)**: 30% - **Linear TV**: 30% ### Key Revenue Metrics - **ARPU**: $10 per subscriber - **Ad CPM**: $25 - **Fill Rate**: 85% - **Total Revenue Estimate**: $500 million ## 7. Key Recommendations 1. **Enhance Marketing Strategies**: Focus on promoting niche content to increase viewership and engagement. 2. **Expand Subscription Offerings**: Introduce tiered subscription models to cater to different audience segments. 3. **Optimize Streaming Technology**: Invest in further reducing startup times and rebuffering ratios to improve user experience. 4. **Leverage Data Analytics**: Utilize viewer data to tailor content recommendations and improve engagement metrics. 5. **Diversify Content Portfolio**: Explore partnerships with local content creators to enhance regional offerings and attract new audiences."
                - generic [ref=e85]:
                  - generic [ref=e86]:
                    - button "Upload .md" [ref=e87] [cursor=pointer]:
                      - img [ref=e88]
                      - text: Upload .md
                    - generic [ref=e91]: 749 words
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
  23 |     await expect(page.getByText(/500M\+|5\.2B GBP/i)).toBeVisible({ timeout: 30_000 });
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
> 45 |     await expect(page.getByText(/MENA|57%/i)).toBeVisible({ timeout: 30_000 });
     |                                               ^ Error: expect(locator).toBeVisible() failed
  46 |   });
  47 | });
  48 | 
```