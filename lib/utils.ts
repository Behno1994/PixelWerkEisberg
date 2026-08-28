import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-bewusstes `className`-Merging (Magic-UI-Konvention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Begrenzt `value` auf das Intervall [min, max]. */
export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/** Nummer mit deutschem Tausendertrennzeichen. */
export function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE").format(value);
}
