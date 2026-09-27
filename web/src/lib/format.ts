import type { ProductStatus } from "./types";

export const statusLabel: Record<ProductStatus, string> = {
  concept: "Concept",
  validating: "In validation",
  coming_soon: "Coming soon",
  drop_soon: "Dropping soon",
  selected: "Going into production",
  archived: "Archived",
};

/** What a visitor is told about where the piece stands. */
export const statusLine: Record<ProductStatus, string> = {
  concept: "Still a sketch. Tell us if it should be more.",
  validating: "Not made yet. Enough yeses and it will be.",
  coming_soon: "It's being made. Get on the list to hear first.",
  drop_soon: "Dropping soon. The list hears first.",
  selected: "You wanted it. It's going into production.",
  archived: "This one stays in the archive.",
};

export const statusOptions = Object.keys(statusLabel) as ProductStatus[];

export function formatPrice(minor: number | null, currency = "INR") {
  if (minor == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

export function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return formatDate(iso, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
