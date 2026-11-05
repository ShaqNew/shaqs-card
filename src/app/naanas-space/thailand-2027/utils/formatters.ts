export function formatDayNumber(dayNumber: number): string {
  return String(dayNumber).padStart(2, "0");
}

export function parseActivitySortMinutes(
  timeStr: string,
  fallbackIndex: number
): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    return hours * 60 + mins;
  }
  const lower = timeStr.toLowerCase();
  if (lower.includes("morning") || lower.includes("breakfast")) return 9 * 60;
  if (lower.includes("midday") || lower.includes("noon")) return 12 * 60;
  if (lower.includes("afternoon")) return 14 * 60;
  if (lower.includes("sunset")) return 17 * 60 + 30;
  if (lower.includes("evening") || lower.includes("dinner")) return 19 * 60;
  if (lower.includes("night")) return 21 * 60 + 30;
  return 23 * 60 + fallbackIndex;
}
