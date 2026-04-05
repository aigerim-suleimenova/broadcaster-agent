export interface SampleDocument {
  id: string
  title: string
  icon: string
  category: string
  content: string
  description: string
  /** Optional broadcaster name this document belongs to */
  broadcaster?: string
}

export const sampleDocuments: SampleDocument[] = [
  {
    id: 'performance-report',
    title: 'Channel Performance',
    icon: '📊',
    category: 'Analytics',
    description: 'Monthly broadcaster channel performance analysis',
    content: `# Broadcaster Channel Performance Report — March 2026

## Executive Summary

This report analyzes the performance of **BroadcastHQ Network** across all live and VOD channels for March 2026. Overall viewership grew **18% month-over-month**, with peak concurrent viewers reaching **2.4 million** during the March 15 prime-time live event.

**Key Highlights**:
- Total stream hours delivered: **1.2 billion minutes**
- Average concurrent viewers (ACV): **340,000**
- Peak concurrent viewers: **2,400,000** (March 15 — Championship Night)
- Overall rebuffering ratio: **0.42%** (industry benchmark: <0.5%)
- Average bitrate delivered: **4.8 Mbps**

---

## 1. Viewership Metrics

### Monthly Trend

| Month | ACV | Peak CCV | Total Minutes | MoM Growth |
|-------|-----|----------|---------------|------------|
| Jan 2026 | 288,000 | 1,800,000 | 980M | +8% |
| Feb 2026 | 312,000 | 2,100,000 | 1.05B | +8.3% |
| Mar 2026 | 340,000 | 2,400,000 | 1.2B | +18% |

### Audience Breakdown

**By Device**:
- Smart TV: 41%
- Mobile (iOS/Android): 28%
- Web Browser: 19%
- Connected TV (Roku, Fire TV, Apple TV): 12%

**By Geography**:
- North America: 54%
- Europe: 26%
- Asia-Pacific: 14%
- Rest of World: 6%

**By Content Type**:
- Live Sports: 48%
- Live News & Events: 23%
- VOD (Movies & Series): 18%
- Live Talk Shows: 11%

---

## 2. Stream Quality Analysis

### Delivery Performance

| Metric | Mar 2026 | Feb 2026 | Target | Status |
|--------|----------|----------|--------|--------|
| Rebuffering Ratio | 0.42% | 0.51% | <0.5% | ✅ Met |
| Startup Time (avg) | 1.8s | 2.1s | <2s | ✅ Met |
| Bitrate Stability | 96.2% | 94.8% | >95% | ✅ Met |
| Error Rate | 0.08% | 0.12% | <0.1% | ✅ Met |
| Uptime (SLA) | 99.97% | 99.94% | 99.95% | ✅ Met |

### CDN Performance by Region

**North America (Akamai + CloudFront)**:
- Avg latency: 12ms
- Cache hit ratio: 94%
- Error rate: 0.05%

**Europe (Fastly + Akamai)**:
- Avg latency: 18ms
- Cache hit ratio: 91%
- Error rate: 0.09%

**Asia-Pacific (AWS CloudFront + Alibaba CDN)**:
- Avg latency: 31ms
- Cache hit ratio: 88%
- Error rate: 0.14%

---

## 3. Engagement Metrics

### Viewer Retention

- **Average watch time per session**: 42 minutes (up from 38 min in Feb)
- **Live event completion rate**: 67% (viewers who stay until the end)
- **VOD completion rate**: 54%
- **Return viewer rate (30-day)**: 71%

### Top Performing Content (March)

| Rank | Title | Type | Peak CCV | Total Minutes |
|------|-------|------|----------|---------------|
| 1 | Championship Night Finals | Live Sports | 2,400,000 | 148M |
| 2 | Election Results Special | Live News | 1,850,000 | 87M |
| 3 | Weekend Sports Recap | Live Sports | 920,000 | 62M |
| 4 | Late Night Live | Talk Show | 780,000 | 44M |
| 5 | Thriller Series S2E8 | VOD | N/A | 38M |

---

## 4. Monetization Performance

### Ad Revenue

- **Total ad impressions served**: 4.2 billion
- **CPM (average)**: $8.40
- **Fill rate**: 92%
- **Ad completion rate**: 84%
- **Estimated ad revenue**: $35.3M

### Subscription Metrics

- **Total paid subscribers**: 1.84 million
- **New subscriber additions**: 127,000
- **Churn rate**: 4.2%
- **MRR**: $18.4M (avg $10/month)

---

## 5. Key Recommendations

1. **Scale CDN capacity in Asia-Pacific**: Latency (31ms) and error rates are above target — evaluate additional PoP in Singapore and Mumbai
2. **Increase mobile bitrate cap**: 41% of Smart TV viewers are getting 6Mbps+ while mobile is capped at 3.5Mbps — test adaptive profiles for 5G mobile users
3. **Reduce VOD startup time**: 1.8s average is within target, but 8% of sessions experience >4s startup — investigate cold cache scenarios
4. **Expand live event slate**: Championship Night drove 18% MoM growth — propose 2 additional premium live events in Q2
5. **Optimize ad fill for APAC**: Fill rate in Asia-Pacific is 81% vs 94% globally — expand programmatic partnerships in region`
  },
  {
    id: 'broadcast-ops-notes',
    title: 'Broadcast Ops Notes',
    icon: '📝',
    category: 'Operations',
    description: 'Weekly broadcast operations team sync notes',
    content: `# Broadcast Operations Weekly Sync — April 2, 2026
**Time**: 9:00 AM – 10:30 AM UTC
**Attendees**: Priya Nair (Head of Broadcast Ops), Tom Eriksson (Live Production), Layla Hassan (CDN & Delivery), Marcus Bell (QA/Testing), Dani Osei (Data & Analytics)

## Agenda
1. Last Week's Incident Review
2. Upcoming Live Event Readiness
3. Infrastructure Upgrade Status
4. Quality KPI Review
5. Action Items

---

## 1. Last Week's Incident Review

### INC-2026-0331 — Rebuffering Spike (March 31, 18:42–19:08 UTC)
- **Impact**: Rebuffering ratio spiked to 3.8% for 26 minutes during the 7 PM primetime slot
- **Affected viewers**: ~180,000 concurrent viewers (North America)
- **Root cause**: Akamai edge node failure in Chicago PoP caused routing to overloaded Dallas nodes
- **Resolution**: Traffic re-routed to CloudFront within 11 minutes; Akamai failover reconfigured
- **Customer impact**: 1,240 support tickets, 87 social media complaints
- **Follow-up**: ⚠️ Tom to confirm updated failover SLA with Akamai by April 7

### INC-2026-0329 — Ingest Encoder Stall (March 29, 14:15 UTC)
- **Impact**: Channel 4 (Sports) went offline for 4 minutes
- **Root cause**: Elemental Live encoder process crash; watchdog restart took 4 min
- **Resolution**: Failover encoder activated manually; watchdog timeout reduced to 90 seconds
- **Follow-up**: ✅ Resolved — watchdog config deployed to all encoders April 1

---

## 2. Upcoming Live Event Readiness

### April 10 — International Esports Championship (Estimated Peak: 3.5M CCV)
- **Status**: 🟡 On track with caveats

**Checklist**:
- ✅ CDN pre-positioning confirmed (Akamai + CloudFront)
- ✅ Origin ingest capacity upgraded to 40 Gbps (from 20 Gbps)
- ✅ Ad serving load test completed — 98.5% fill rate at 4M concurrent
- ⚠️ APAC edge nodes not yet provisioned — Layla to complete by April 6
- ⚠️ Backup encoder for Tokyo feed not confirmed — Tom to follow up with local vendor
- ❌ Disaster recovery runbook not updated since Q3 2025 — Marcus to update by April 8

**Risk Assessment**: Medium-High. APAC node gap is the primary concern given APAC audience expected at 22% of total.

### April 18 — Awards Ceremony Live (Estimated Peak: 1.2M CCV)
- **Status**: ✅ Green
- All infrastructure pre-confirmed
- Ad packages sold out (100% fill for 4-hour window)
- Encoding profiles tuned for ceremony content (low-motion, high-detail)

---

## 3. Infrastructure Upgrade Status

### Project: Multi-CDN Orchestration Platform (Phase 2)
- **Owner**: Layla Hassan
- **Target completion**: April 30
- **Current status**: 72% complete
- **Remaining work**: Real-time CDN switching logic; integration with monitoring dashboard
- **Blocker**: API contract from Fastly still pending — Layla escalating to account manager

### Project: Low-Latency HEVC Encoding Pipeline
- **Owner**: Tom Eriksson
- **Target completion**: May 15
- **Current status**: 45% complete
- **Notes**: Transcoding farm hardware delivered; software config in progress
- **Expected benefit**: 30% reduction in encoding latency, 20% bandwidth savings

### Project: Viewer Quality Score (VQS) Dashboards
- **Owner**: Dani Osei
- **Target completion**: April 15
- **Current status**: 90% complete — in UAT
- **Notes**: New per-channel and per-event quality heatmaps live in staging

---

## 4. Quality KPI Review — Week of March 24–30

| KPI | This Week | Last Week | Target | Status |
|-----|-----------|-----------|--------|--------|
| Rebuffering Ratio | 0.51% | 0.44% | <0.5% | 🔴 Miss |
| Startup Time (p50) | 1.7s | 1.8s | <2.0s | ✅ |
| Startup Time (p95) | 4.8s | 4.3s | <5.0s | ✅ |
| Error Rate | 0.11% | 0.08% | <0.1% | 🔴 Miss |
| CDN Uptime | 99.96% | 99.97% | 99.95% | ✅ |

**Note**: The rebuffering miss is primarily attributed to INC-2026-0331 on March 31. Excluding the incident window, weekly average was 0.39%.

---

## 5. Action Items

| Owner | Action | Deadline | Status |
|-------|--------|----------|--------|
| Tom | Confirm Akamai failover SLA update | Apr 7 | Open |
| Layla | Provision APAC edge nodes for Esports event | Apr 6 | Open |
| Tom | Confirm Tokyo backup encoder | Apr 5 | Open |
| Marcus | Update DR runbook for Esports event | Apr 8 | Open |
| Layla | Escalate Fastly API contract | Apr 4 | Open |
| Dani | Deploy VQS dashboards to production | Apr 15 | On Track |
| All | Complete event readiness checklist review | Apr 9 | Open |

---

## Next Meeting
**Date**: April 9, 2026 — Pre-event readiness review
**Focus**: Final go/no-go for Esports Championship, APAC node confirmation`
  },
  {
    id: 'channel-launch-plan',
    title: 'Channel Launch Plan',
    icon: '🚀',
    category: 'Strategy',
    description: 'Go-to-market plan for launching a new broadcast channel',
    content: `# SportsPulse 24/7 — Channel Launch Plan
## Executive Summary

**Channel**: SportsPulse 24/7 — A dedicated live sports streaming channel
**Launch Date**: June 1, 2026
**Target Audience**: Sports fans aged 18–45, cord-cutters and streaming-first viewers
**Revenue Goal**: $15M ARR by end of Q4 2026
**Launch Budget**: $3.2M

---

## 1. Channel Overview

### Value Proposition
SportsPulse 24/7 delivers round-the-clock live sports coverage, highlights, analysis, and exclusive behind-the-scenes content — all at ultra-low latency with 4K HDR quality where available.

### Content Portfolio at Launch

| Content Type | Hours/Week | Rights Acquired |
|--------------|------------|-----------------|
| Live Sports (Tier 1 leagues) | 22h | ✅ Regional NFL, NBA, NHL |
| Live Sports (Tier 2/International) | 18h | ✅ Serie A, Bundesliga, MLS |
| Live Studio Shows (Analysis/Debate) | 30h | ✅ Original production |
| Sports News & Highlights | 40h | ✅ Wire service partnerships |
| Classic/Archival Matches | 58h (VOD) | ✅ 3,000+ archived events |

### Technical Specifications
- **Resolution**: Up to 4K HDR (primary events), 1080p60 (standard)
- **Latency target**: <5 seconds (live) — critical for sports betting integrations
- **Audio**: Dolby Atmos on flagship events
- **Simultaneous streams**: Up to 6 concurrent live feeds

---

## 2. Go-to-Market Strategy

### Phase 1: Soft Launch — May 15–31 (Beta)
**Objective**: Validate technical infrastructure, gather early feedback

**Activities**:
- Invite 5,000 beta testers (from existing subscriber waitlist)
- 3 live beta events: Regional NBA game, Bundesliga fixture, College basketball
- Bug bounty for quality issues: Gift cards and free subscriptions
- NPS survey after each event

**Success Metrics**:
- Rebuffering ratio <0.5% across all beta events
- NPS >50
- Startup time p95 <3 seconds
- Zero major outages during beta events

### Phase 2: Public Launch — June 1
**Objective**: Drive subscriber acquisition, generate media coverage

**Activities**:
- Live launch event: NBA Playoffs game (expected 800K–1.2M viewers)
- Press embargo lift (SportsBusiness Journal, Variety, The Verge)
- Social media campaign: #WatchSportsPulse (influencer seeding — 20 sports creators)
- Free 30-day trial for first 100,000 sign-ups
- Launch on all major platforms simultaneously (iOS, Android, Roku, Fire TV, Apple TV, Samsung TV, Web)

**Success Metrics**:
- 100,000 trial activations in first 7 days
- 30,000 paid conversions in first 30 days
- 50+ media mentions
- App store rating >4.3

### Phase 3: Growth — July–December 2026
**Objective**: Scale subscribers, secure additional rights, establish brand

**Activities**:
- Expand live rights (targeting UEFA Champions League, MLB)
- Launch interactive features (multi-angle camera, real-time stats overlay)
- Sports betting data integration (partnership with DraftKings/FanDuel)
- Loyalty program: watch streaks, exclusive content for long-term subscribers
- Affiliate and influencer program (10% revenue share for first 90 days)

---

## 3. Distribution Strategy

### Platform Rollout Priority

| Platform | Launch Day | Expected Share |
|----------|------------|---------------|
| iOS (App Store) | June 1 | 22% |
| Android (Google Play) | June 1 | 19% |
| Roku | June 1 | 14% |
| Amazon Fire TV | June 1 | 12% |
| Web (Desktop/Mobile) | June 1 | 18% |
| Apple TV | June 1 | 8% |
| Samsung Smart TV | June 1 | 5% |
| LG TV (webOS) | June 15 | 2% |

### CDN & Infrastructure

- **Primary CDN**: Akamai (North America + Europe)
- **Secondary CDN**: Amazon CloudFront (global overflow, APAC primary)
- **Origin ingest**: Dual-region (US-East, EU-West) with automatic failover
- **Encoding**: Cloud-based (AWS Elemental) + hardware backup for flagship events
- **Target availability SLA**: 99.95% (escalates to 99.99% for Tier 1 events)

---

## 4. Pricing Strategy

### Subscription Tiers

**Standard ($9.99/month)**
- HD (1080p60), 2 simultaneous streams
- All live sports, VOD library
- Mobile + web

**Premium ($14.99/month)**
- 4K HDR, Dolby Atmos on select events
- 4 simultaneous streams
- Offline downloads (VOD)
- Multi-angle camera on flagship events

**Family ($19.99/month)**
- All Premium features
- 6 simultaneous streams
- 6 user profiles
- Parental controls

**Annual discount**: 20% off (e.g., Standard = $95.88/year)

---

## 5. Success Metrics & KPIs

### Launch Week (June 1–7)
- App installs: 250,000
- Trial activations: 100,000
- Concurrent viewers (NBA Playoffs): 800,000+
- Rebuffering ratio: <0.5%
- Startup time (p95): <3 seconds

### Month 1 (June)
- Paid subscribers: 30,000
- Trial-to-paid conversion: 30%
- MRR: $370,000
- CSAT: >4.3/5

### Q4 2026 Targets
- Total paid subscribers: 120,000
- ARR: $15M
- Average watch time/session: 55 minutes
- Monthly churn: <4%
- NPS: >60

---

## 6. Risk Mitigation

### Technical Risks
**Risk**: Infrastructure overwhelmed during NBA Playoffs launch event
**Mitigation**: Load-tested to 3× expected capacity; auto-scaling with manual override; dedicated war room during event

**Risk**: CDN failover too slow during outage
**Mitigation**: Multi-CDN switching <30 seconds; pre-warmed CloudFront as backup; Akamai SLA updated to <15 min escalation

### Content Rights Risks
**Risk**: Regional blackout compliance failure
**Mitigation**: Geo-fencing tested across all 50 states + 20 international regions; legal review completed April 15

### Market Risks
**Risk**: Incumbent sports streamers launch competing offer
**Mitigation**: Differentiate on ultra-low latency + interactive features; secure exclusive regional rights where possible

---

## 7. Launch Timeline

**April 2026**
- Week 1: Platform certification submissions (App Store, Google Play, Roku)
- Week 2–3: Infrastructure load testing
- Week 4: Beta tester recruitment

**May 2026**
- Week 1–2: Beta onboarding + first beta events
- Week 3: Press briefings under embargo
- Week 4: Final QA and launch readiness review

**June 2026**
- June 1: Public launch (NBA Playoffs live)
- Week 2–3: Monitor, optimize, respond to feedback
- Week 4: Post-launch retrospective + Phase 3 planning`
  },
  {
    id: 'streaming-tech-guide',
    title: 'Streaming Tech Guide',
    icon: '⚙️',
    category: 'Technical',
    description: 'Technical guide to live video streaming infrastructure',
    content: `# Live Video Streaming Infrastructure: A Technical Guide for Broadcast Engineers

## Introduction

Modern broadcast streaming infrastructure must deliver high-quality video to millions of concurrent viewers across heterogeneous networks, devices, and geographies — with minimal latency and maximum reliability. This guide covers the end-to-end technical architecture used in production-scale broadcasting.

### Core Challenges in Live Broadcasting

- **Latency**: Live sports require <10 seconds glass-to-glass; real-time interaction requires <500ms
- **Scale**: Peak events (sports finals, breaking news) can spike from 50K to 5M viewers in minutes
- **Quality consistency**: Rebuffering and startup failures directly drive viewer churn
- **Codec efficiency**: 4K HDR at scale requires aggressive compression without quality degradation
- **Rights enforcement**: Real-time geo-blocking and concurrency limits

---

## Core Architecture

### 1. Ingest Pipeline

The ingest layer receives the live signal from production and converts it into a format suitable for adaptive delivery.

**Signal path**:
\`\`\`
Camera/Source → Vision Mixer → Broadcast Encoder (SDI/HDMI) → IP Gateway → Cloud Ingest Point
\`\`\`

**Key components**:

**Hardware Encoders** (primary path for Tier 1 events):
- Elemental Live, Harmonic VOS, Envivio
- Encode to H.264/H.265 at multiple bitrates simultaneously
- Built-in redundancy (active/passive pairs)

**Software Encoders** (cloud-native path):
- AWS Elemental MediaLive, Azure Media Services
- Elastic scaling for variable workloads
- Cost-effective for Tier 2/3 content

**Ingest Protocols**:
- **SRT (Secure Reliable Transport)**: Preferred for contribution over public internet — low latency, error correction
- **RTMP**: Legacy protocol, still widely used by production tools
- **RIST (Reliable Internet Stream Transport)**: Emerging standard for bonded cellular and satellite feeds
- **HLS/DASH push**: For cloud-native origin workflows

**Redundancy pattern**:
\`\`\`yaml
primary_ingest:
  endpoint: ingest-us-east-1.broadcast.example.com
  protocol: SRT
  port: 9000
  passphrase: "{{secure_key}}"
  latency_ms: 120

backup_ingest:
  endpoint: ingest-us-east-2.broadcast.example.com
  protocol: SRT
  port: 9000
  passphrase: "{{secure_key}}"
  latency_ms: 120

failover_trigger: primary_silent_for_5s
\`\`\`

---

### 2. Transcoding & Packaging

**Adaptive Bitrate (ABR) ladder** — standard profile:

| Profile | Resolution | Bitrate | Frame Rate | Codec |
|---------|------------|---------|------------|-------|
| 4K HDR | 3840×2160 | 15 Mbps | 60fps | HEVC (H.265) |
| 1080p60 | 1920×1080 | 6 Mbps | 60fps | H.264/HEVC |
| 1080p | 1920×1080 | 4 Mbps | 30fps | H.264 |
| 720p | 1280×720 | 2.5 Mbps | 30fps | H.264 |
| 480p | 854×480 | 1.2 Mbps | 30fps | H.264 |
| 360p | 640×360 | 600 Kbps | 30fps | H.264 |
| Audio only | N/A | 128 Kbps | N/A | AAC |

**Packaging formats**:
- **HLS (HTTP Live Streaming)**: Required for iOS, Apple TV; dominant on web
- **MPEG-DASH**: Required for Android, broad device support
- **CMAF**: Common Media Application Format — single packaged file for both HLS and DASH (reduces storage by ~40%)

**Segment configuration**:
\`\`\`
Segment duration: 2 seconds (live) / 4–6 seconds (low-latency threshold)
Playlist window: 6 segments (DVR: 4 hours)
Low-latency HLS: LHLS with 0.5s partial segments
\`\`\`

---

### 3. Origin & CDN Architecture

**Origin cluster design**:

\`\`\`
[Packager] → [Origin Cache (Varnish/Nginx)] → [Shield PoP (Fastly/Akamai Origin Shield)] → [Edge CDN]
\`\`\`

**Why origin shield matters**: Without shielding, during a 2M-viewer spike, the origin receives millions of segment requests. An origin shield collapses these to a single authoritative pull per CDN, protecting origin capacity.

**Multi-CDN strategy**:

\`\`\`json
{
  "routing_policy": "performance_weighted",
  "cdns": [
    {
      "provider": "akamai",
      "weight": 60,
      "regions": ["NA", "EU"],
      "fallback_threshold_rebuffer_pct": 1.5
    },
    {
      "provider": "cloudfront",
      "weight": 30,
      "regions": ["APAC", "NA"],
      "fallback_threshold_rebuffer_pct": 1.5
    },
    {
      "provider": "fastly",
      "weight": 10,
      "regions": ["EU"],
      "fallback_threshold_rebuffer_pct": 1.5
    }
  ],
  "real_time_switching": true,
  "switching_cooldown_seconds": 30
}
\`\`\`

---

### 4. Low-Latency Streaming

Standard HLS has 15–30 second latency due to segment buffering. For sports (and especially betting integrations), targets are 3–8 seconds.

**Low-Latency HLS (LHLS)**:
- Uses "Partial Segments" (0.5–1s chunks) within a regular segment
- Server push via HTTP/2 reduces round-trip polling
- Requires CDN support — Akamai SureRoute, Fastly LL, CloudFront enable this

**WebRTC** (for <1 second latency):
- Used for interactive applications (live auctions, interactive shows)
- Not scalable to millions of viewers without a broadcast relay layer (Millicast, Dolby.io, Wowza)

**DASH-LL (Low-Latency DASH)**:
- Chunked transfer encoding delivers segment chunks as they are produced
- Supported by Shaka Player, dash.js

**Latency monitoring**:
\`\`\`bash
# Measure end-to-end glass-to-glass latency with a timecode overlay
ffprobe -v quiet -print_format json -show_streams https://stream.example.com/live/index.m3u8

# Calculate segment age from EXT-X-PROGRAM-DATE-TIME
# Target: last segment timestamp should be within 4–8s of wall clock
\`\`\`

---

### 5. DRM & Rights Enforcement

**DRM systems by platform**:

| DRM | Platforms |
|-----|-----------|
| Widevine | Android, Chrome, Edge |
| FairPlay | iOS, Safari, Apple TV |
| PlayReady | Windows, Xbox, Smart TVs |

**Multi-DRM workflow**:
\`\`\`
[Packager] → [DRM Key Server (CPIX)] → [License Server (BuyDRM/Irdeto/Axinom)]
                                           ↓
                               Player requests license at playback start
\`\`\`

**Geo-blocking** (rights compliance):
\`\`\`nginx
# Nginx geo-block example
geo $block_access {
  default 0;
  # Block specific regions based on MaxMind GeoIP2
  include /etc/nginx/geoip_blocks.conf;
}

if ($block_access) {
  return 451 "Content not available in your region";
}
\`\`\`

---

## Monitoring & Observability

### Key Metrics to Track

**Player-side (client telemetry)**:
- Rebuffering ratio (target: <0.5%)
- Startup time p50/p95/p99
- Bitrate delivered vs. available
- Error rate by type (network, DRM, format)
- Exit-before-start rate

**Infrastructure-side**:
- CDN cache hit ratio (target: >90%)
- Origin request rate
- Segment error rate at CDN edge
- Encoder output health (bitrate, keyframe interval, PTS continuity)

**Alerting thresholds**:

\`\`\`yaml
alerts:
  rebuffer_spike:
    condition: rebuffering_ratio_5min_avg > 1.5%
    severity: P1
    escalation: oncall_pager

  startup_time_degradation:
    condition: startup_time_p95_5min > 5s
    severity: P2
    escalation: slack_broadcast_ops

  encoder_silence:
    condition: ingest_bitrate == 0 for 10s
    severity: P0
    escalation: oncall_pager + sms
\`\`\`

---

## Best Practices

### Encoding
- Always encode with consistent keyframe intervals (2 seconds) — critical for ABR switching
- Monitor encoder output PTS/DTS continuity — gaps cause player errors
- Use two-pass or constrained VBR, not CBR — better quality at same bitrate

### Delivery
- Pre-warm CDN caches before large events (hit the manifest + first N segments 10 min before start)
- Use origin shield to protect packager/origin during spike
- Test failover paths before every Tier 1 event

### Player
- Implement client-side telemetry for QoE measurement
- Use ABR with buffer occupancy + bandwidth estimation (BOLA, DYNAMIC)
- Test startup across slow networks (simulate 500Kbps, 1Mbps, 3G)

### Operations
- Maintain a war room for all Tier 1 events (>500K expected CCV)
- Runbooks for every known failure mode
- Post-incident reviews within 48 hours of any P0/P1`
  },
  {
    id: 'market-analysis',
    title: 'Streaming Market Report',
    icon: '📈',
    category: 'Business',
    description: 'Analysis of the live streaming and broadcast market',
    content: `# Live Streaming & Broadcasting Market Analysis — Q1 2026 Report

## Executive Summary

The global live streaming and broadcast technology market reached **$94 billion** in 2025, growing **31% year-over-year**. Sports broadcasting remains the dominant revenue driver, while creator-driven live content and enterprise broadcasting are the fastest-growing segments. OTT (over-the-top) platforms now account for **58% of total broadcast consumption**, overtaking traditional linear TV for the first time.

**Key Findings**:
- Global live streaming market: **$94B** (2025), projected **$218B by 2030** (18% CAGR)
- OTT streaming surpassed linear TV in total viewer hours for the first time in Q3 2025
- Sports rights costs increased **22%** year-over-year due to streamer competition
- Low-latency streaming (<5 seconds) now required by **74% of major sports broadcasters**
- AI-powered production tools reducing live production costs by **35%** on average
- Ad-supported streaming (AVOD/FAST) growing at **44% CAGR**, outpacing SVOD

---

## Market Segmentation

### By Content Category

| Category | Market Size (2025) | YoY Growth | Share |
|----------|--------------------|------------|-------|
| Live Sports | $42B | 28% | 45% |
| Live News & Events | $18B | 19% | 19% |
| Entertainment/Scripted | $14B | 12% | 15% |
| Live Gaming & Esports | $9B | 54% | 10% |
| Enterprise/B2B Live | $7B | 61% | 7% |
| Creator/UGC Live | $4B | 78% | 4% |

**Analysis**:
- **Live sports** remains the anchor — rights cost escalation is the primary margin pressure
- **Live gaming** and **creator content** are the fastest-growing segments, driven by Gen Z audiences
- **Enterprise broadcasting** (town halls, product launches, virtual events) is quietly growing as remote-first culture persists
- **Entertainment scripted** slowing — audiences shifting time to live and interactive content

### By Business Model

**SVOD (Subscription)**:
- 41% of streaming revenue
- Growing 14% YoY (slowest segment)
- Trend: bundling and "super-app" strategies to reduce churn

**AVOD (Ad-Supported Video On Demand)**:
- 33% of streaming revenue
- Growing 44% YoY
- Driver: price sensitivity; advertisers following audiences away from linear TV

**FAST (Free Ad-Supported Streaming TV)**:
- 11% of streaming revenue
- Growing 67% YoY
- Key players: Pluto TV, Tubi, Peacock (free tier), Samsung TV Plus

**Pay-Per-View / Transactional**:
- 9% of streaming revenue
- Stable — primarily boxing, MMA, combat sports

**Hybrid**:
- 6% of streaming revenue
- All major streamers moving toward hybrid SVOD+AVOD

---

## Competitive Landscape

### Global Streaming Platforms

**1. StreamMax (Disney+, Hulu, ESPN+)**
- Combined subscribers: **210M**
- Live sports rights portfolio: NFL, NBA, MLB, NHL (domestic); Premier League (international)
- Key differentiator: Disney IP + live sports in a single bundle
- 2025 revenue: $28B
- Weakness: High rights cost structure; profitability pressure

**2. PrimeStream (Amazon Prime Video + Twitch)**
- Combined subscribers: **190M**
- Strategy: Live sports (NFL Thursday Night, Premier League) + creator ecosystem
- Key differentiator: Integration with Amazon retail and Alexa devices
- 2025 revenue: $22B
- Strength: AWS infrastructure advantage — lowest CDN costs of any major streamer

**3. NetView (Netflix)**
- Subscribers: **310M** (includes ad tier)
- Live strategy: Boxing, tennis, NFL Christmas games (2025 successful)
- Key differentiator: Global subscriber base; moving into live cautiously
- 2025 revenue: $38B
- Weakness: Live infrastructure less mature than sports-native competitors

**4. Regional Champions**
- **DAZN** (Europe/APAC): $4.5B revenue, 30M subscribers; pure-play sports
- **Sky Sports / NOW** (UK/Europe): $6B; deep Premier League rights
- **Hotstar** (India/Southeast Asia): 100M+ subscribers; IPL cricket dominant

### Technology Vendor Landscape

**CDN & Delivery**:
- Akamai: 38% market share (live streaming)
- Cloudflare: 18% (fastest growing, primarily VOD and smaller live)
- Amazon CloudFront: 22%
- Fastly: 12%
- Others: 10%

**Encoding & Transcoding**:
- AWS Elemental: 35% of cloud encoding
- Harmonic VOS360: 22% (broadcast-grade)
- Bitmovin: 18% (developer-focused)
- Others: 25%

**Player Technology**:
- Video.js: 28% of web players (open source)
- Shaka Player (Google): 22%
- HLS.js: 19%
- THEOplayer: 12% (premium, low-latency focused)
- BitMovin Player: 10%

---

## Audience Behavior Trends

### Device Preferences

**2025 Live Streaming Device Share**:
- Smart TV (CTV): 39% (up from 31% in 2023) — fastest growing
- Mobile (iOS/Android): 27% (stable)
- Web/Desktop: 18% (declining)
- Connected TV Sticks (Roku, Fire TV, Chromecast): 16% (growing)

**Implications**:
- CTV growth requires TV-optimized UX (lean-back navigation, remote-first)
- Mobile remains critical for out-of-home viewing and younger demographics
- Web investment should focus on performance, not feature parity

### Viewing Patterns

**Average weekly live streaming hours per active user**: 7.4 hours (up from 5.9 in 2024)

**Live vs. VOD split**: 52% live / 48% VOD (live crossed the 50% threshold in Q4 2025)

**Concurrent viewing peaks**:
- Sports finals (NFL Super Bowl, FIFA World Cup) — 50M+ concurrent globally
- Major news events — 30M+ concurrent
- Esports championships — 8M+ concurrent

### Quality Expectations

**% of viewers who abandon if rebuffering >3 seconds**: 68%
**% of viewers who abandon if startup takes >5 seconds**: 52%
**Willingness to pay premium for 4K**: 41% of sports viewers
**Demand for <5s latency (to avoid social media spoilers)**: 77% of sports viewers

---

## Technology Trends

### 1. AI-Powered Production

**Applications gaining adoption**:
- **Automated highlights**: Real-time clip extraction without human editors — reduces post-production costs by 40%
- **AI commentary**: Automated commentary for Tier 2/3 sports content in multiple languages
- **Smart cameras**: AI-tracked robotic cameras replacing fixed camera operators for lower-tier events
- **Content metadata**: Automatic tagging, chaptering, and SEO for VOD from live recordings

### 2. HEVC / AV1 Adoption

| Codec | 2024 Adoption | 2025 Adoption | 2026 Target |
|-------|--------------|--------------|-------------|
| H.264 | 71% | 58% | 45% |
| HEVC (H.265) | 24% | 33% | 40% |
| AV1 | 5% | 9% | 15% |

**AV1 advantage**: 30–40% bandwidth saving vs. H.264 at same quality — major cost driver for large-scale deployment

**Barrier**: Encoding cost (AV1 encode is 5–15× slower than H.264 without hardware acceleration)

### 3. Low-Latency as Baseline

What was a premium feature in 2023 is now table stakes:
- **74% of major sports broadcasters** now require <5 second latency in RFPs
- **LHLS (Low-Latency HLS)** adoption up from 31% to 58% of live platforms
- **WebRTC broadcast** emerging for <1 second interactive use cases

### 4. FAST Channel Explosion

Free ad-supported channels are becoming the new linear TV:
- **3,200+ FAST channels** now operating in North America (up from 1,800 in 2024)
- Broadcasters launching FAST versions of archive content to monetize without SVOD investment
- Pluto TV and Tubi each exceeding 80 million monthly active users

---

## Outlook & Projections

### 5-Year Market Forecast

| Year | Market Size | Growth |
|------|------------|--------|
| 2025 | $94B | 31% |
| 2026 | $115B | 22% |
| 2027 | $138B | 20% |
| 2028 | $163B | 18% |
| 2029 | $190B | 17% |
| 2030 | $218B | 15% |

### Key Bets for 2026

1. **FAST will overtake SVOD in active user hours** by Q3 2026 — ad-supported is winning the mass market
2. **AI production tools become standard** — expect 60% of Tier 2/3 events produced with AI assistance
3. **Sports rights consolidation** — 2–3 major rights deals expected to shift from linear TV to streaming-only
4. **CTV becomes the primary screen** — Smart TV share projected to exceed 45% of streaming hours
5. **Latency arms race intensifies** — <3 second latency will be required for any tier-1 sports rights RFP by 2027`
  },

  // ─── Broadcaster-specific documents ───────────────────────────────────────

  {
    id: 'bbc-performance',
    title: 'BBC Performance Report',
    icon: '📊',
    category: 'Analytics',
    broadcaster: 'BBC',
    description: 'Monthly streaming performance report for BBC',
    content: `# BBC Streaming Performance Report — March 2026

## Executive Summary

BBC iPlayer and BBC Sounds delivered **1.4 billion streaming requests** in March 2026, with peak concurrent viewers of **3.1 million** during the BBC One live election results broadcast on March 12.

**Key Highlights**:
- Total stream requests: **1.4 billion**
- Peak concurrent viewers: **3,100,000** (March 12 — Election Results Live)
- Average rebuffering ratio: **0.38%** (below 0.5% target)
- iPlayer average startup time: **1.6 seconds**
- BBC Sounds monthly active listeners: **12.4 million**

---

## 1. Viewership by Platform

| Platform | Monthly Users | Share | YoY Growth |
|----------|--------------|-------|-----------|
| iPlayer Web | 18.2M | 34% | +9% |
| iPlayer iOS | 14.1M | 26% | +18% |
| iPlayer Android | 11.3M | 21% | +22% |
| Smart TVs (HbbTV/App) | 9.8M | 18% | +31% |
| BBC Sounds | 12.4M | — | +14% |

---

## 2. Top Content — March 2026

| Rank | Title | Channel | Peak CCV | Total Requests |
|------|-------|---------|----------|---------------|
| 1 | Election Results Live | BBC One | 3,100,000 | 210M |
| 2 | The Traitors S3 Finale | BBC One | 2,400,000 | 178M |
| 3 | Match of the Day | BBC One | 1,800,000 | 124M |
| 4 | Panorama: AI Special | BBC Two | 890,000 | 67M |
| 5 | Radio 1 Live Lounge | BBC Sounds | N/A | 43M |

---

## 3. Stream Quality

| Metric | BBC | Industry Avg | Status |
|--------|-----|-------------|--------|
| Rebuffering ratio | 0.38% | 0.52% | ✅ |
| Startup time (p50) | 1.6s | 2.1s | ✅ |
| Error rate | 0.06% | 0.11% | ✅ |
| CDN uptime | 99.98% | 99.95% | ✅ |

---

## 4. CDN & Infrastructure

BBC Global iPlayer uses a hybrid CDN strategy with Akamai as primary and Fastly for European overflow. The HbbTV rollout to Samsung and LG TVs drove a 31% YoY increase in Smart TV viewing.

**CDN Performance by Region**:
- UK: 8ms avg latency, 96% cache hit ratio
- Europe: 19ms avg latency, 93% cache hit ratio
- Rest of World: 42ms avg latency, 87% cache hit ratio

---

## 5. Recommendations

1. **Accelerate HbbTV 2.0 rollout** — Smart TV growth at 31% YoY is the fastest segment; prioritise LG webOS 6.0+ support
2. **Reduce p95 startup time** — currently 4.1s on mobile; target <3s by Q3 2026
3. **Expand APAC CDN footprint** — 42ms latency for international users is above target for BBC World Service audiences
4. **Increase peak capacity buffer** — Election Night hit 3.1M; next event (potential Royal event) could exceed 4M`
  },

  {
    id: 'sky-performance',
    title: 'Sky Stream Quality',
    icon: '📡',
    category: 'Quality',
    broadcaster: 'Sky',
    description: 'Sky streaming quality and CDN performance analysis',
    content: `# Sky Streaming Quality Report — March 2026

## Executive Summary

Sky Glass and Sky Go delivered industry-leading stream quality in March 2026 with a rebuffering ratio of **0.29%** — the lowest in Sky's history — driven by the rollout of the new multi-CDN orchestration platform completed in Q1 2026.

**Key Quality Metrics**:
- Rebuffering ratio: **0.29%** (record low)
- Average startup time: **1.4 seconds**
- 4K HDR stream ratio: **38%** of total viewing hours
- Peak CCV: **4,200,000** (Sky Sports Premier League, March 8)
- CDN availability: **99.99%**

---

## 1. Quality KPIs vs. Targets

| Metric | Actual | Target | vs Target |
|--------|--------|--------|----------|
| Rebuffering ratio | 0.29% | <0.5% | ✅ +42% better |
| Startup time (p50) | 1.4s | <2.0s | ✅ +30% better |
| Startup time (p95) | 3.1s | <5.0s | ✅ +38% better |
| Error rate | 0.04% | <0.1% | ✅ +60% better |
| 4K delivery success | 97.2% | >95% | ✅ |

---

## 2. CDN Performance

Sky uses a three-CDN strategy: Akamai (primary, 55%), Fastly (secondary, 30%), Amazon CloudFront (overflow/APAC, 15%).

| CDN | Traffic Share | Rebuffer Rate | Avg Latency | Cache Hit |
|-----|--------------|--------------|-------------|----------|
| Akamai | 55% | 0.27% | 11ms | 95.8% |
| Fastly | 30% | 0.31% | 14ms | 94.2% |
| CloudFront | 15% | 0.35% | 28ms | 91.6% |

**Multi-CDN switching events**: 3 in March (all automatic, avg switch time: 18 seconds)

---

## 3. Device Breakdown

| Device | Share | Avg Rebuffer | Startup (p50) |
|--------|-------|-------------|--------------|
| Sky Glass (TV) | 41% | 0.22% | 1.1s |
| Sky Stream (dongle) | 18% | 0.28% | 1.3s |
| Sky Go iOS | 16% | 0.31% | 1.5s |
| Sky Go Android | 13% | 0.35% | 1.7s |
| Web | 12% | 0.38% | 1.9s |

---

## 4. Top Events — March 2026

| Event | Channel | Peak CCV | Rebuffer Rate | Notes |
|-------|---------|----------|--------------|-------|
| Premier League MD29 | Sky Sports PL | 4,200,000 | 0.24% | Record quality at record audience |
| F1 Saudi Arabian GP | Sky Sports F1 | 2,800,000 | 0.26% | |
| Box Office: Fury vs. Joshua | Sky Sports Box Office | 1,600,000 | 0.31% | PPV event |
| Game of Thrones: House S3 | Sky Atlantic | 980,000 | 0.29% | |

---

## 5. Recommendations

1. **Target 0.25% rebuffering** — at 0.29% we're close; tuning Akamai ABR configuration could achieve this
2. **Expand Sky Glass 4K to 50%** — currently 38%; upgrade ABR ladder to prioritise 4K on Glass devices
3. **Reduce CloudFront latency** — 28ms is above our 20ms target; evaluate Akamai edge nodes in Singapore and Sydney`
  },

  {
    id: 'paramount-launch',
    title: 'Paramount+ Strategy',
    icon: '🚀',
    category: 'Strategy',
    broadcaster: 'Paramount',
    description: 'Paramount+ European streaming expansion strategy',
    content: `# Paramount+ European Expansion — Q2 2026 Strategy

## Executive Summary

**Initiative**: Paramount+ Phase 2 European market expansion
**Launch Markets**: Germany, France, Italy, Spain (simultaneous)
**Launch Date**: June 15, 2026
**Revenue Target**: €180M ARR by end of Q4 2026
**Budget**: €45M (marketing + infrastructure)

---

## 1. Market Opportunity

| Market | OTT Penetration | Streaming ARPU | Target Subscribers |
|--------|----------------|---------------|-------------------|
| Germany | 64% | €9.20/month | 800,000 |
| France | 71% | €8.80/month | 950,000 |
| Italy | 58% | €7.60/month | 680,000 |
| Spain | 62% | €7.90/month | 570,000 |
| **Total** | | | **3,000,000** |

**Competitive landscape**: Netflix (38% share), Disney+ (21%), Amazon Prime Video (19%), local players (22%)

---

## 2. Content Strategy

### Day-1 Content Library
- **Paramount Pictures**: 500+ titles including Mission Impossible, Transformers, Top Gun franchises
- **MTV & Comedy Central**: 2,000+ hours of reality and comedy
- **Nickelodeon**: Kids content (key differentiator vs. competitors)
- **CBS & Showtime**: 300+ premium drama series
- **Live Sports**: UEFA Champions League highlights (licensed), Bundesliga (Germany-specific)

### Exclusive European Originals (2026)
- 3 German-language originals (€15M production budget)
- 2 French-language originals (€12M)
- 1 Italian original (€6M)

---

## 3. Pricing Strategy

| Tier | Price | Features |
|------|-------|---------|
| Essential (Ad-supported) | €4.99/month | HD, 2 streams, ads |
| Standard | €9.99/month | FHD, 2 streams, downloads |
| Premium | €14.99/month | 4K HDR, 4 streams, Dolby Atmos |
| Annual (Standard) | €89.99/year | 25% saving |

---

## 4. Technical Infrastructure

**CDN Strategy**: Primary — Akamai (EU-optimised), Secondary — Fastly
**Streaming formats**: CMAF/DASH-LL for live, HLS for VOD
**DRM**: Widevine (Android/Chrome), FairPlay (iOS/Safari), PlayReady (Windows)
**Target latency**: <8 seconds live, <2 second VOD startup
**Languages**: Subtitles and audio in 8 languages on all originals

---

## 5. Go-to-Market

### Phase 1 (May): Pre-launch
- Press briefings and influencer seeding in all 4 markets
- Waitlist campaign (target: 500K registrations)
- App store submissions and TV platform certifications

### Phase 2 (June 15): Launch Day
- Simultaneous launch across iOS, Android, web, smart TVs
- Anchor content: Premiere of Paramount original + live UEFA final preview show
- 30-day free trial for first 1M subscribers

### Phase 3 (July–December): Growth
- Localised content calendar (1 new European original per month)
- Bundle partnerships with telcos (Deutsche Telekom, Orange, TIM, Movistar)
- Student and family plan promotions

---

## 6. KPIs

| Metric | 30 Days | 90 Days | EOY 2026 |
|--------|---------|---------|---------|
| Subscribers | 400,000 | 1,200,000 | 3,000,000 |
| Trial conversion | — | 35% | — |
| Monthly churn | — | — | <5% |
| ARR | — | — | €180M |`
  },

  {
    id: 'tf1-analysis',
    title: 'TF1 Group Analysis',
    icon: '📈',
    category: 'Analysis',
    broadcaster: 'TF1',
    description: 'TF1 Group digital and streaming channel analysis',
    content: `# TF1 Group — Digital & Streaming Analysis — Q1 2026

## Executive Summary

TF1 Group's digital transformation accelerated in Q1 2026, with **TF1+** (formerly MYTF1) reaching **24.3 million monthly unique visitors** — a 27% increase year-over-year. The group's FAST channel strategy and live streaming investments have positioned it as the leading free-to-air digital broadcaster in France.

**Q1 2026 Highlights**:
- TF1+ monthly unique visitors: **24.3 million** (+27% YoY)
- Total video views: **1.8 billion** (+34% YoY)
- Live streaming peak CCV: **2,900,000** (TF1 Eurovision Semi-Final)
- FAST channel revenue: **€18.2M** (+89% YoY)
- Digital advertising revenue: **€142M** (+22% YoY)

---

## 1. Platform Performance

### TF1+ Audience

| Platform | Monthly Unique Users | YoY Growth |
|----------|---------------------|-----------|
| Web (Desktop) | 9.8M | +8% |
| iOS App | 7.2M | +31% |
| Android App | 5.4M | +28% |
| Smart TV (Samsung/LG) | 1.9M | +67% |
| **Total** | **24.3M** | **+27%** |

### Content Consumption

- **Live TV streaming**: 38% of total viewing (up from 29% in Q1 2025)
- **VOD (Replay)**: 51% of total viewing
- **FAST Channels**: 11% of total viewing

---

## 2. Top Programs — Q1 2026

| Program | Type | Peak CCV | Total Views | Revenue |
|---------|------|----------|-------------|---------|
| Eurovision Semi-Final | Live | 2,900,000 | 87M | €4.2M ad revenue |
| Koh-Lanta S25 Finale | VOD | — | 62M | €3.8M |
| TF1 Journal 20h | Daily Live | 1,200,000 avg | 180M | — |
| Danse avec les Stars | VOD | — | 44M | €2.1M |
| Champions League (TF1) | Live | 2,100,000 | 58M | €5.6M |

---

## 3. FAST Channel Strategy

TF1 Group operates 8 FAST channels under the TF1+ umbrella:

| Channel | Theme | Monthly Viewers | Ad Revenue Q1 |
|---------|-------|----------------|--------------|
| TF1 Séries Films | Drama series | 3.2M | €4.8M |
| TCM Cinéma | Classic movies | 2.1M | €2.9M |
| Histoire TV | Documentaries | 1.8M | €2.4M |
| Ushuaïa TV | Nature/Adventure | 1.4M | €1.9M |
| TV Breizh | Regional/Celtic | 0.9M | €1.2M |
| TF1 News | 24h news | 2.8M | €3.6M |
| TF1 Kids | Children | 1.6M | €1.4M |
| TF1 Sport+ | Sports clips | 1.1M | — (launching ads Q2) |

---

## 4. Advertising & Monetisation

**Digital Advertising Revenue**: €142M in Q1 2026 (+22% YoY)

| Format | Revenue | Share | CPM |
|--------|---------|-------|-----|
| Pre-roll video | €58M | 41% | €8.20 |
| Mid-roll video | €39M | 27% | €7.80 |
| Branded content | €24M | 17% | — |
| Display/banner | €12M | 8% | €2.10 |
| Sponsorship | €9M | 7% | — |

**Programmatic share**: 63% of video inventory now sold programmatically (up from 51% in Q1 2025)

---

## 5. Technical Infrastructure

- **CDN**: Akamai (primary), OVH Cloud (French sovereign cloud for live news)
- **Live encoding**: Harmonic VOS360 cloud encoder (8 simultaneous live feeds)
- **Ad server**: FreeWheel (Comcast subsidiary)
- **DRM**: Widevine + FairPlay (multi-DRM via Irdeto)
- **Target live latency**: <8 seconds (HLS LL)
- **Rebuffering ratio Q1 avg**: 0.44%

---

## 6. Strategic Priorities H2 2026

1. **CTV acceleration**: Smart TV at 67% YoY growth but still only 8% of users — aggressive Samsung/LG partnership
2. **Live sports rights**: Secure Ligue 1 highlights package (decision Q2 2026)
3. **Ad-tech stack modernisation**: Migrate from FreeWheel to in-house programmatic by Q4 2026
4. **FAST international**: Launch TF1+ FAST channels in Belgium, Switzerland, Canada (Q3 2026)`
  },

  {
    id: 'netflix-tech',
    title: 'Netflix Tech Overview',
    icon: '⚙️',
    category: 'Technical',
    broadcaster: 'Netflix',
    description: 'Netflix streaming infrastructure and technology overview',
    content: `# Netflix Streaming Infrastructure Overview — 2026

## Introduction

Netflix operates the world's largest streaming infrastructure, delivering content to **302 million subscribers** across 190 countries. This document covers Netflix's technical architecture, encoding strategy, CDN approach, and quality engineering practices.

---

## 1. Open Connect CDN

Netflix built its own CDN — **Open Connect** — rather than relying on commercial CDN providers. Open Connect Appliances (OCAs) are deployed directly inside ISP networks globally.

### Architecture

\`\`\`
[Netflix Origin (AWS)]
       ↓
[Open Connect Exchange (IX) Servers]
       ↓
[ISP-embedded Open Connect Appliances]
       ↓
[Subscriber device]
\`\`\`

### Scale (2026 figures)
- **17,000+** Open Connect Appliances deployed globally
- **1,000+** ISP partners in 100+ countries
- **95%** of Netflix traffic served from OCAs (only 5% hits Netflix origin)
- **700+ Tbps** peak delivery capacity

### Benefits vs. Commercial CDN
- Zero CDN egress cost (Netflix owns the infrastructure)
- Better cache hit ratios (99%+ for popular titles)
- Lower latency (appliances inside ISP networks, often <5ms)
- ISP relationships enable pre-positioning of content

---

## 2. Encoding: VMAF & Per-Title Optimization

Netflix uses **per-title encoding** — each title gets a custom ABR ladder rather than a one-size-fits-all ladder.

### Per-Title Encoding Flow

\`\`\`
Title → Shot complexity analysis → VMAF quality scoring
      → Custom bitrate ladder generation
      → Encode at optimal bitrate per resolution
\`\`\`

**Result**: Animated content (simple scenes) encoded at 1/3 the bitrate of live-action at same quality. Savings: ~20% bandwidth reduction fleet-wide.

### VMAF (Video Multimethod Assessment Fusion)
Netflix's open-source perceptual quality metric — now industry standard.

\`\`\`python
# Simplified VMAF scoring concept
vmaf_score = model.predict(
    reference_frame=original,
    distorted_frame=encoded,
    features=['vif', 'adm', 'motion']
)
# Score 0-100; Netflix targets >93 for streaming
\`\`\`

### Codec Strategy

| Codec | Usage | Saving vs H.264 |
|-------|-------|----------------|
| H.264 | Legacy devices, low-end | baseline |
| HEVC (H.265) | 4K/HDR, mid-high tier | ~40% |
| AV1 | New devices, all quality tiers | ~30% vs HEVC |
| Dolby Vision | HDR premium tier | N/A |

**AV1 milestone**: As of Q1 2026, 62% of Netflix streams on supported devices use AV1.

---

## 3. Adaptive Bitrate: BOLA

Netflix uses **BOLA (Buffer Occupancy based Lyapunov Algorithm)** for ABR decisions — a buffer-based approach rather than pure bandwidth estimation.

Key advantage: BOLA makes fewer quality switches, prioritising buffer stability over chasing instantaneous bandwidth, resulting in fewer rebuffering events.

### ABR Ladder (Standard 2026)

| Quality | Resolution | AV1 Bitrate | H.264 Bitrate |
|---------|------------|-------------|--------------|
| Ultra HD | 3840×2160 | 8 Mbps | 15 Mbps |
| Full HD | 1920×1080 | 3.5 Mbps | 5 Mbps |
| HD | 1280×720 | 1.8 Mbps | 3 Mbps |
| SD | 854×480 | 800 Kbps | 1.5 Mbps |
| Low | 640×360 | 350 Kbps | 600 Kbps |

---

## 4. Live Streaming Infrastructure (2026 Expansion)

Netflix launched live events in 2023 (boxing, comedy specials) and significantly expanded in 2025–2026.

### Live Architecture (differs from VOD)

\`\`\`
[Live venue encoder (SRT/RTMP)]
    → [Netflix ingest PoP (x6 globally)]
    → [Cloud transcoder (AWS Elemental)]
    → [CMAF packager]
    → [Open Connect (live edge cache)]
    → [Subscriber]
\`\`\`

**Live latency target**: <8 seconds (glass-to-glass)
**Peak live events handled**: 70M+ concurrent (WWE Raw, NFL Christmas 2025)

### Key Differences from VOD
- No per-title encoding (real-time constraint)
- Smaller ABR ladder (5 profiles vs 12 for VOD)
- Lower cache hit ratio (~70% vs 99% for popular VOD)
- Requires larger origin capacity buffer

---

## 5. Quality Engineering

### Key Metrics Netflix Tracks

| Metric | Netflix 2026 | Industry Avg |
|--------|-------------|-------------|
| Rebuffering ratio | 0.08% | 0.52% |
| Startup delay (p50) | 0.8s | 2.1s |
| Startup delay (p95) | 2.1s | 5.8s |
| Video quality (VMAF avg) | 96.2 | ~88 |

### Chaos Engineering
Netflix applies chaos engineering to streaming:
- **Chaos Monkey**: randomly kills streaming microservices in production
- **Chaos Kong**: simulates entire AWS region failure
- Result: 99.99% availability despite constant failure injection

---

## 6. 2026 Technical Roadmap

1. **100% AV1**: Target full AV1 fleet by Q4 2026 (currently 62% of eligible streams)
2. **Neural network upscaling**: AI-based 1080p→4K upscaling for older catalogue titles
3. **Spatial audio expansion**: Dolby Atmos available on 90% of originals by Q3 2026
4. **Live latency reduction**: Target <5 seconds for live sports (down from <8 seconds today)
5. **Edge ML inference**: Move content recommendation inference to Open Connect appliances for <10ms personalisation`
  },
]
