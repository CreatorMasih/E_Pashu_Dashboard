export function formatDisplayDate(value: string, fallback = "-"): string {
  const text = String(value || "").trim();
  if (!text) {
    return fallback;
  }

  const normalized = text.match(/^(\d{4})-(\d{2})-(\d{2})/) ? `${text.slice(0, 10)}T00:00:00` : text;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return text;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}
