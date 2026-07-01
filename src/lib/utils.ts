import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind class merger (shadcn/ui standard) ───────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Slot ↔ Time conversions ─────────────────────────────────────────────
// slot = minutes_from_midnight / 5  (0 = 00:00, 96 = 08:00, 228 = 19:00)

export function slotToTime(slot: number): string {
  const totalMinutes = slot * 5;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToSlot(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h * 60 + m) / 5;
}

export function slotToLabel(slot: number): string {
  const time = slotToTime(slot);
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ─── Day bitmask helpers ─────────────────────────────────────────────────
// Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32, Sun=64

export const DAY_BITS = {
  Mon: 1,
  Tue: 2,
  Wed: 4,
  Thu: 8,
  Fri: 16,
  Sat: 32,
  Sun: 64,
} as const;

export const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  4: "Wednesday",
  8: "Thursday",
  16: "Friday",
  32: "Saturday",
  64: "Sunday",
};

export const DAY_SHORT: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  4: "Wed",
  8: "Thu",
  16: "Fri",
  32: "Sat",
  64: "Sun",
};

export function daysCodeToLabels(daysCode: number): string[] {
  return Object.entries(DAY_BITS)
    .filter(([, bit]) => (daysCode & bit) !== 0)
    .map(([day]) => day);
}

export function daysCodeToString(daysCode: number): string {
  return daysCodeToLabels(daysCode).join(", ");
}

/** Check if two assignments clash (same day + overlapping slots) */
export function slotsOverlap(
  daysA: number,
  startA: number,
  slotsA: number,
  daysB: number,
  startB: number,
  slotsB: number
): boolean {
  if ((daysA & daysB) === 0) return false; // no common day
  const endA = startA + slotsA;
  const endB = startB + slotsB;
  return startA < endB && startB < endA;
}

// ─── Batch prefix ↔ semester info ────────────────────────────────────────
// F22 → { type: "FALL", year: 2022 }
// S22 → { type: "SPRING", year: 2022 }

export function parseBatchPrefix(prefix: string): {
  type: "FALL" | "SPRING";
  year: number;
} {
  const type = prefix.startsWith("F") ? "FALL" : "SPRING";
  const yearShort = parseInt(prefix.slice(1), 10);
  const year = yearShort >= 0 && yearShort <= 30 ? 2000 + yearShort : 1900 + yearShort;
  return { type, year };
}

// ─── CGPA / grade helpers ────────────────────────────────────────────────

export function gradeToPoint(grade: string): number {
  const map: Record<string, number> = {
    "A+": 4.0, A: 4.0, "A-": 3.7,
    "B+": 3.3, B: 3.0, "B-": 2.7,
    "C+": 2.3, C: 2.0, "C-": 1.7,
    "D+": 1.3, D: 1.0, F: 0.0, W: 0.0, I: 0.0,
  };
  return map[grade] ?? 0;
}

export function formatCgpa(cgpa: number): string {
  return cgpa.toFixed(2);
}

// ─── Date utilities ──────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Misc ────────────────────────────────────────────────────────────────

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}
