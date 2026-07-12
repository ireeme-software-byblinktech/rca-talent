/**
 * Centralized frontend environment configuration.
 * All NEXT_PUBLIC_* variables should be read through this module.
 */
export const env = {
  /** Backend API base URL (includes /api/v1 prefix) */
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1",

  /**
   * When true (default), API modules use in-memory mock data.
   * Set NEXT_PUBLIC_USE_MOCK=false to connect to the real backend.
   */
  useMock: process.env.NEXT_PUBLIC_USE_MOCK !== "false",
} as const;

export function isMockMode(): boolean {
  return env.useMock;
}

/** Origin of the API host (without /api/v1), e.g. https://rca-talent.onrender.com */
export function getApiOrigin(): string {
  try {
    const url = new URL(env.apiUrl);
    return url.origin;
  } catch {
    return "http://localhost:5000";
  }
}

/**
 * Rewrite media URLs that incorrectly point at localhost (common when
 * STORAGE_PUBLIC_URL was missing on Render) to the current API origin.
 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1"
    ) {
      const origin = getApiOrigin();
      return `${origin}${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    return url;
  }
}
