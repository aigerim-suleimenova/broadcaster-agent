/**
 * Deterministic ads.txt analyzer - replaces AI research with real data
 * Fast, accurate, and free of token costs
 */

export interface AdsTxtAnalysis {
  domain: string;
  foundSSPs: string[];
  primaryAdServer: string;
  isSmartclipPresent: boolean;
  rawCount: number;
  fetched: boolean;
  error?: string;
}

interface SSPMap {
  [domain: string]: string;
}

const SSP_MAP: SSPMap = {
  "rubiconproject.com": "Magnite",
  "appnexus.com": "Xandr",
  "pubmatic.com": "PubMatic",
  "indexexchange.com": "Index Exchange",
  "smartclip.net": "smartclip",
  "google.com": "Google Ad Manager",
  "improvado.io": "Improvado",
  "spotx.tv": "SpotX",
  "openx.com": "OpenX",
  "prebid.org": "Prebid",
  "emxdmp.com": "EMX Digital",
  "contextweb.com": "Contextual Media",
  "tremor.com": "Tremor International",
  "freewheel.tv": "FreeWheel",
  "brightroll.com": "BrightRoll",
  "advertising.com": "AOL Advertising",
};

export async function analyzeAdsTxt(
  broadcasterDomain: string,
): Promise<AdsTxtAnalysis> {
  const url = `https://${broadcasterDomain}/ads.txt`;

  const result: AdsTxtAnalysis = {
    domain: broadcasterDomain,
    foundSSPs: [],
    primaryAdServer: "Unknown",
    isSmartclipPresent: false,
    rawCount: 0,
    fetched: false,
  };

  try {
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      result.error = `HTTP ${response.status}: Could not fetch ads.txt`;
      return result;
    }

    const text = await response.text();
    const lines = text.split("\n");
    result.rawCount = lines.length;
    result.fetched = true;

    const foundSSPs = new Set<string>();

    lines.forEach((line: string) => {
      // Remove comments and trim
      const cleanLine = line.split("#")[0].trim().toLowerCase();
      if (!cleanLine) return;

      // Check for known SSPs
      for (const [domain, name] of Object.entries(SSP_MAP)) {
        if (cleanLine.includes(domain)) {
          foundSSPs.add(name);

          // Detect primary ad server
          if (domain === "google.com" && result.primaryAdServer === "Unknown") {
            result.primaryAdServer = "Google Ad Manager";
          }
          if (domain === "freewheel.tv") {
            result.primaryAdServer = "FreeWheel";
          }

          // Flag smartclip presence
          if (domain === "smartclip.net") {
            result.isSmartclipPresent = true;
          }
        }
      }
    });

    result.foundSSPs = Array.from(foundSSPs);

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.error = `Failed to fetch ads.txt: ${errorMsg}`;
    result.fetched = false;
    return result;
  }
}

/**
 * Generate human-readable messages from ads.txt analysis
 * Used to populate Stage 1 pipeline display
 */
export function generateAdsTxtMessages(analysis: AdsTxtAnalysis): string[] {
  if (!analysis.fetched && analysis.error) {
    return [
      `Searching for ${analysis.domain} ads.txt...`,
      `Unable to fetch ads.txt: ${analysis.error}`,
      "Compatibility assessment requires available ads.txt data.",
    ];
  }

  const sspList =
    analysis.foundSSPs.length > 0
      ? analysis.foundSSPs.join(", ")
      : "None detected";

  const smartclipNote = analysis.isSmartclipPresent
    ? "✓ smartclip detected in ads.txt!"
    : "⚠ smartclip not currently in ads.txt";

  return [
    `Analyzing ${analysis.domain}/ads.txt...`,
    `Detected ad server: ${analysis.primaryAdServer}\nFound SSPs: ${sspList}`,
    `${smartclipNote}\nTotal entries: ${analysis.rawCount}`,
  ];
}
