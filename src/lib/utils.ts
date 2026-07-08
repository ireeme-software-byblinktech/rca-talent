import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Format a count for marketing/landing pages (e.g. 0, 3, 45+, 120+). */
export function formatPublicStat(value: number): string {
  if (value <= 0) return "0";
  if (value >= 100) return `${Math.floor(value / 10) * 10}+`;
  if (value >= 10) return `${value}+`;
  return String(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

export function orderByIds<T extends { id: string }>(items: T[], order: string[]): T[] {
  const ids = order.length ? order : items.map((i) => i.id);
  const sorted = ids
    .map((id) => items.find((i) => i.id === id))
    .filter((x): x is T => !!x);
  return [...sorted, ...items.filter((i) => !ids.includes(i.id))];
}
