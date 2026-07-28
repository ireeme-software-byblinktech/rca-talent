export const MAX_CUSTOM_SKILL_LENGTH = 40;

function expandSkillValue(value: unknown): unknown[] {
  if (Array.isArray(value)) return flattenSkillValues(value);
  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").map((part) => part.trim()).filter(Boolean);
  }
  return [value];
}

function flattenSkillValues(values: unknown): unknown[] {
  if (!Array.isArray(values)) return expandSkillValue(values);
  return values.flatMap((value) => expandSkillValue(value));
}

function toSkillString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (Array.isArray(value)) return "";
  return String(value);
}

export function normalizeSkillName(value: unknown): string {
  return toSkillString(value).trim().replace(/\s+/g, " ");
}

export function skillsEqual(a: unknown, b: unknown): boolean {
  const left = normalizeSkillName(a);
  const right = normalizeSkillName(b);
  if (!left || !right) return false;
  return left.toLowerCase() === right.toLowerCase();
}

export function sanitizeSkillList(values: unknown): string[] {
  const merged = new Map<string, string>();
  for (const value of flattenSkillValues(values)) {
    const normalized = normalizeSkillName(value);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (!merged.has(key)) merged.set(key, normalized);
  }
  return Array.from(merged.values());
}

export function mergeSkillOptions(...sources: unknown[]): string[] {
  return sanitizeSkillList(sources).sort((a, b) => a.localeCompare(b));
}

export function buildListedSkillsMap(skills: unknown): Map<string, string> {
  const merged = new Map<string, string>();
  for (const normalized of sanitizeSkillList(skills)) {
    merged.set(normalized.toLowerCase(), normalized);
  }
  return merged;
}
