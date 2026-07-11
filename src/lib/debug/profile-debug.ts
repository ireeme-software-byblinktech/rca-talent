const ENABLED =
  process.env.NEXT_PUBLIC_DEBUG_PROFILE === "true" ||
  process.env.NODE_ENV === "development";

export function debugProfile(stage: string, payload: unknown): void {
  if (!ENABLED) return;
  console.groupCollapsed(`[ProfileDebug] ${stage}`);
  console.log(payload);
  console.groupEnd();
}
