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
