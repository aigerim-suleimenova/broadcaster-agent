# Test Plan: Broadcaster Search Flow

## Scope

Covers the broadcaster name entry, search resolution, and pipeline initialisation (Stage 0) in the Pipeline UI, plus the underlying `/api/agent-chat` search endpoint.

## Prerequisites

- App running at `http://localhost:3000` (`npm run dev`)
- Python agent running at `http://localhost:8000`
- Fresh browser session (localStorage cleared between runs)

---

## Scenarios

### 1. Happy Path — Known Broadcaster (BBC)

**Starting state:** Fresh page load, empty input field.

**Steps:**
1. Navigate to `http://localhost:3000`.
2. Locate the broadcaster name input field.
3. Type `BBC` (exact case).
4. Submit the form (click Run / press Enter).

**Expected outcomes:**
- Pipeline initialises with 5 stages; Stage 0 becomes active immediately.
- Stage 0 status indicator shows "active" / loading state.
- A research markdown report for BBC is generated and rendered inside Stage 0 (audience size `500M+`, revenue `5.2B GBP` visible).
- Stage 0 transitions to "complete" status automatically.
- "Proceed" / next-stage control becomes available.

---

### 2. Happy Path — Known Broadcaster (Paramount)

**Starting state:** Fresh page load.

**Steps:**
1. Type `Paramount` in the broadcaster input.
2. Submit.

**Expected outcomes:**
- Same pipeline initialisation as Scenario 1.
- Stage 0 report reflects Paramount data (revenue `3.8B USD`, regions include North America).

---

### 3. Happy Path — Known Broadcaster (Al Jazeera)

**Starting state:** Fresh page load.

**Steps:**
1. Type `Al Jazeera` in the broadcaster input.
2. Submit.

**Expected outcomes:**
- Pipeline launches; Stage 0 report reflects Al Jazeera data (MENA region, engagement rate `57%`).

---

### 4. Case-Insensitive Input — Lowercase

**Starting state:** Fresh page load.

**Steps:**
1. Type `bbc` (all lowercase).
2. Submit.

**Expected outcomes:**
- Same results as Scenario 1. The API normalises input via `.toLowerCase().trim()` before lookup.

---

### 5. Case-Insensitive Input — Mixed Case

**Starting state:** Fresh page load.

**Steps:**
1. Type `pArAmOuNt`.
2. Submit.

**Expected outcomes:**
- Same results as Scenario 2 (Paramount data returned, not the generic fallback).

---

### 6. Unknown Broadcaster — Fallback Path

**Starting state:** Fresh page load.

**Steps:**
1. Type `Netflix` (not in the seeded database).
2. Submit.

**Expected outcomes:**
- Pipeline launches without error.
- Stage 0 report uses generic fallback values: audience `250M+`, revenue `1.5B USD`, risk level `medium`.
- Domain is auto-derived as `netflix.com`.

---

### 7. Partial Keyword Match

**Starting state:** Fresh page load.

**Steps:**
1. Type `al` (partial match for "Al Jazeera").
2. Submit.

**Expected outcomes:**
- If the UI passes input directly as `keyword` to `search_broadcasters`, Al Jazeera is matched and returned.
- Stage 0 report reflects Al Jazeera data.

---

### 8. Empty Input — Validation

**Starting state:** Fresh page load.

**Steps:**
1. Leave the broadcaster name input empty.
2. Attempt to submit (click Run / press Enter).

**Expected outcomes:**
- Pipeline does **not** start.
- An inline validation message or the submit button remains disabled.
- No network request is made to `/api/agent-chat` or `/api/pipeline/invoke-llm`.

---

### 9. Whitespace-Only Input — Validation

**Starting state:** Fresh page load.

**Steps:**
1. Type several spaces into the broadcaster input.
2. Attempt to submit.

**Expected outcomes:**
- Same as Scenario 8 — pipeline blocked, validation error shown.
- Input should be treated as empty after trimming.

---

### 10. Pipeline Abort — Reset Mid-Run

**Starting state:** Pipeline actively running (Stage 0 in progress).

**Steps:**
1. Enter a broadcaster name and submit.
2. While Stage 0 is loading, click the Reset / Stop button.

**Expected outcomes:**
- In-flight fetch requests are aborted (`AbortController` fires).
- Stage statuses reset to initial state.
- Broadcaster input is cleared or the UI returns to the initial entry screen.
- No error toast or uncaught exception appears in the console.

---

### 11. Rapid Re-Submission

**Starting state:** Fresh page load.

**Steps:**
1. Enter `BBC` and submit.
2. Immediately enter `Paramount` and submit again before Stage 0 completes.

**Expected outcomes:**
- The first pipeline run is cleanly aborted.
- Only the Paramount pipeline run proceeds.
- UI does not show mixed data from both runs.

---

### 12. Region-Filtered Search via API

**Starting state:** Direct API test (no UI involvement).

**Steps:**
1. POST to `/api/agent-chat`:
   ```json
   {
     "action": "callMCPTool",
     "toolName": "search_broadcasters",
     "args": { "keyword": "", "region": "MENA" }
   }
   ```

**Expected outcomes:**
- Response includes only Al Jazeera (whose `geographicReach` contains `"MENA"`).
- `resultCount` is `1`.

---

### 13. Limit Parameter — API Boundary

**Starting state:** Direct API test.

**Steps:**
1. POST to `/api/agent-chat`:
   ```json
   {
     "action": "callMCPTool",
     "toolName": "search_broadcasters",
     "args": { "keyword": "", "limit": 1 }
   }
   ```

**Expected outcomes:**
- `results` array contains exactly 1 entry regardless of how many match.
- `resultCount` equals 1.

---

### 14. Invalid Tool Name — API Error Handling

**Starting state:** Direct API test.

**Steps:**
1. POST to `/api/agent-chat`:
   ```json
   {
     "action": "callMCPTool",
     "toolName": "nonexistent_tool",
     "args": {}
   }
   ```

**Expected outcomes:**
- HTTP 400 response.
- Body contains `{ "error": "Unknown tool: nonexistent_tool" }`.

---

### 15. Pipeline Continues Through All Stages

**Starting state:** Fresh page load.

**Steps:**
1. Enter `BBC` and submit.
2. Wait for Stage 0 to complete.
3. Click "Proceed" to advance to Stage 1 (Compatibility Analysis).
4. Wait for Stage 1 to complete; click "Proceed".
5. Repeat through Stage 2 (Decision Makers) and Stage 3 (Outreach Plan).
6. Reach the final Review checkpoint (Stage 4).

**Expected outcomes:**
- Each stage transitions from `active` → `complete` before advancing.
- Stage 3 produces an email draft with a `subject` and `body`.
- Stage 4 (Review) presents the full context: broadcaster name, compatibility score, decision makers, email draft.
- No console errors throughout.

---

### 16. LocalStorage Thread ID Persistence

**Starting state:** Fresh page with no prior localStorage entry.

**Steps:**
1. Load the page; note the thread ID stored in localStorage under `copilotkit-thread-id`.
2. Reload the page.

**Expected outcomes:**
- The same thread ID is reused across reloads (not regenerated).
- A new UUID is only generated on first visit.

---

## API Contract Reference

| Tool | Required args | Optional args |
|------|--------------|---------------|
| `search_broadcasters` | `keyword` | `region`, `limit` (default 10) |
| `analyze_broadcaster` | `broadcasterName` | — |
| `generate_metrics` | `query` | `includeRiskAssessment` (default true) |
| `fetch_broadcaster_data` | `domain` | `includeSSPs`, `includeAdServers` |
| `get_dashboard_summary` | `broadcasterName` | — |

Seeded broadcasters: `bbc`, `paramount`, `aljazeera` (all lowercase keys). Any other name triggers `generateDefaultMetrics()`.
