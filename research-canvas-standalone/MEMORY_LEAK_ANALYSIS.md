# Memory Leak Analysis Report

## Critical Issues Found

### 1. **Unbounded Global Cache in `download.ts`** ⚠️ CRITICAL
**File:** [agents/typescript/src/download.ts](agents/typescript/src/download.ts#L13)
**Problem:** The `RESOURCE_CACHE` object grows infinitely with no eviction policy.
```typescript
const RESOURCE_CACHE: Record<string, string> = {};
```
**Impact:** High - Each downloaded resource (potentially full HTML page content) is stored forever in memory.

**Fix:**
```typescript
// Add cache size limit and LRU eviction
const MAX_CACHE_SIZE = 50; // Maximum entries
const RESOURCE_CACHE = new Map<string, { content: string; timestamp: number }>();

export function getResource(url: string): string {
  const cached = RESOURCE_CACHE.get(url);
  if (cached) {
    cached.timestamp = Date.now();
    return cached.content;
  }
  return "";
}

async function downloadResource(url: string): Promise<string> {
  try {
    // ... fetch logic ...
    const markdownContent = htmlToText(htmlContent);

    // Evict oldest entry if cache full
    if (RESOURCE_CACHE.size >= MAX_CACHE_SIZE) {
      const oldestKey = Array.from(RESOURCE_CACHE.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      RESOURCE_CACHE.delete(oldestKey);
    }

    RESOURCE_CACHE.set(url, { content: markdownContent, timestamp: Date.now() });
    return markdownContent;
  } catch (error) {
    RESOURCE_CACHE.set(url, { content: "ERROR", timestamp: Date.now() });
    return `Error downloading resource: ${error}`;
  }
}
```

---

### 2. **Pipeline Stage Async Operations Not Cancelled on Unmount** ⚠️ HIGH
**File:** [src/components/Pipeline.tsx](src/components/Pipeline.tsx#L145-L250)
**Problem:** The `runPipeline` async function spawns multiple fetch requests and timers that continue even after component unmounts.

**Impact:** High - Pending API requests, fetch operations, and state updates on unmounted components.

**Fixes Needed:**

1. Add AbortController to fetch operations:
```typescript
const runPipeline = async (name: string) => {
  const abortController = new AbortController();

  // Store abort controller to cleanup later
  const abortControllerRef = useRef<AbortController | null>(null);
  abortControllerRef.current = abortController;

  if (i === 1) {
    const adsTxtResponse = await fetch('/api/pipeline/analyze-ads-txt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
      signal: abortController.signal, // Add abort signal
    }).then(async res => {
      if (!res.ok) {
        // ... error handling ...
      }
      return res.json();
    });
  }
};
```

2. Cleanup AbortController on unmount:
```typescript
useEffect(() => {
  return () => {
    // Cancel all pending requests when component unmounts
    abortControllerRef.current?.abort();
  };
}, []);
```

---

### 3. **PipelineStage Timer Cleanup Incomplete** ⚠️ MEDIUM
**File:** [src/components/pipeline/PipelineStage.tsx](src/components/pipeline/PipelineStage.tsx#L45-L60)
**Problem:** Timers array is properly cleaned up, but if component unmounts during active timing, pending timers may still fire.

**Current code:**
```typescript
useEffect(() => {
  if (status !== "active" && status !== "complete") {
    setDisplayedMessages([]);
    return;
  }

  const messageTimers: NodeJS.Timeout[] = [];

  messages.forEach((_, index) => {
    const timer = setTimeout(() => {
      setDisplayedMessages((prev) => [...prev, messages[index]]);
    }, messageBaseDelay * (index + 1));
    messageTimers.push(timer);
  });

  return () => messageTimers.forEach(clearTimeout); // ✓ Correct cleanup
}, [status, messages, messageBaseDelay]);
```

**Status:** Actually correct, but ensure no warnings on dependencies.

---

### 4. **useEffect Scroll Cleanup Dependency Issue** ⚠️ MEDIUM
**File:** [src/components/Pipeline.tsx](src/components/Pipeline.tsx#L139-L144)
**Problem:** `scrollToBottom` is recreated and dependencies change frequently.

**Current code:**
```typescript
useEffect(() => {
  const timer = setTimeout(scrollToBottom, 300);
  return () => clearTimeout(timer);
}, [stages, stageStatuses, scrollToBottom]); // scrollToBottom changes every render
```

**Fix:**
```typescript
useEffect(() => {
  const timer = setTimeout(scrollToBottom, 300);
  return () => clearTimeout(timer);
}, [stages, stageStatuses]); // Remove scrollToBottom from deps since it's memoized

// Make sure scrollToBottom is memoized above
const scrollToBottom = useCallback(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
}, []); // No dependencies needed
```

---

### 5. **Missing Prompt Event Listener Cleanup** ⚠️ MEDIUM
**File:** [src/app/Main.tsx](src/app/Main.tsx)
**Problem:** The background animation elements never clean up listeners if the page unmounts during animation.

**Note:** This is less critical in Next.js but could cause issues with animated GSAP or custom animations.

---

### 6. **Potential Memory Leak in useCopilotChatSuggestions** ⚠️ LOW
**File:** [src/app/Main.tsx](src/app/Main.tsx#L17-L43)
**Problem:** If this hook maintains internal event listeners or subscriptions, unmount won't clean them.

**Status:** Depends on CopilotKit implementation - verify with their changelog.

---

## Summary Table

| Issue | Severity | File | Type | Fix Effort |
|-------|----------|------|------|-----------|
| Unbounded cache | CRITICAL | download.ts | Memory growth | Medium |
| Pipeline async cleanup | HIGH | Pipeline.tsx | Dangling promises | Medium |
| Timer dependencies | MEDIUM | Pipeline.tsx | Minor inefficiency | Low |
| State updates on unmount | MEDIUM | Multiple | React warnings | Low-Medium |
| Animation cleanup | LOW | Main.tsx | Edge case | Low |

---

## Action Items (Priority Order)

1. ✅ **Implement cache eviction** in `download.ts` (15 min)
2. ✅ **Add AbortController** to fetch operations in `Pipeline.tsx` (20 min)
3. ✅ **Fix useEffect dependencies** in `Pipeline.tsx` (10 min)
4. ✅ **Add cleanup for pending setState** on unmount (15 min)
5. ✅ **Test with React DevTools Profiler** to verify fixes

---

## Testing

Use Chrome DevTools to verify:
```javascript
// Open DevTools Console and monitor:
// 1. Memory growth over time
// 2. Number of pending requests (Network tab)
// 3. React component unmounting (React DevTools > Profiler)

// Simulate the issue:
// - Load pipeline
// - Start processing
// - Navigate away before completion
// - Check memory increase
```
