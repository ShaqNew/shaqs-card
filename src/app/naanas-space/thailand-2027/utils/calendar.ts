import { ItineraryActivity, TripDay } from "@/lib/thailandTripData";

/**
 * Detects timezone offset in hours based on time string, date, and location.
 * - London departure (LGW): GMT (UTC+0)
 * - Sharjah layover (SHJ): GST (UTC+4)
 * - Thailand (Bangkok BKK / Phuket HKT): ICT (UTC+7)
 */
export function detectTimezoneOffset(
  timeStr: string,
  dateIso: string,
  location?: string
): number {
  const combined = `${timeStr} ${location || ""}`.toUpperCase();
  if (
    combined.includes("GMT") ||
    combined.includes("UTC") ||
    combined.includes("LGW") ||
    combined.includes("GATWICK") ||
    combined.includes("LONDON")
  ) {
    return 0;
  }
  if (
    combined.includes("GST") ||
    combined.includes("SHJ") ||
    combined.includes("SHARJAH")
  ) {
    return 4;
  }
  if (
    combined.includes("ICT") ||
    combined.includes("BKK") ||
    combined.includes("BANGKOK") ||
    combined.includes("HKT") ||
    combined.includes("PHUKET") ||
    combined.includes("THAILAND")
  ) {
    return 7;
  }
  // Date-based defaults
  if (dateIso === "2027-02-04") {
    return 0; // London departure day
  }
  return 7; // Default to Thailand time (ICT UTC+7)
}

/**
 * Parses duration in minutes from subtitle string (e.g. "Duration: 7h 10m").
 */
export function parseDurationMinutes(subtitle?: string): number | null {
  if (!subtitle) return null;
  const match = subtitle.match(/Duration:\s*(\d+)\s*h(?:\s*(\d+)\s*m)?/i);
  if (match) {
    const hours = parseInt(match[1], 10);
    const mins = match[2] ? parseInt(match[2], 10) : 0;
    return hours * 60 + mins;
  }
  return null;
}

/**
 * Formats a Date object to RFC 5545 UTC timestamp (YYYYMMDDTHHmmssZ).
 */
export function formatUtcTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

/**
 * Resolves start and end UTC timestamps for an activity.
 */
export function resolveActivityUtcRange(
  dateIso: string,
  act: Pick<ItineraryActivity, "time" | "subtitle" | "category" | "location">
): { startUtc: string; endUtc: string } {
  const [yearStr, monthStr, dayStr] = dateIso.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const tzOffset = detectTimezoneOffset(act.time, dateIso, act.location);

  // Check for time range e.g. "17:05 – 18:15" or "03:50 – 07:50"
  const rangeMatch = act.time.match(
    /(\d{1,2}):(\d{2})\s*(?:–|-|to)\s*(\d{1,2}):(\d{2})/
  );

  let startHours = 10;
  let startMinutes = 0;
  let endHours = 11;
  let endMinutes = 0;
  let hasExplicitEnd = false;

  if (rangeMatch) {
    startHours = parseInt(rangeMatch[1], 10);
    startMinutes = parseInt(rangeMatch[2], 10);
    endHours = parseInt(rangeMatch[3], 10);
    endMinutes = parseInt(rangeMatch[4], 10);
    hasExplicitEnd = true;
  } else {
    const singleMatch = act.time.match(/(\d{1,2}):(\d{2})/);
    if (singleMatch) {
      startHours = parseInt(singleMatch[1], 10);
      startMinutes = parseInt(singleMatch[2], 10);
    } else {
      const lower = act.time.toLowerCase();
      if (lower.includes("morning") || lower.includes("breakfast")) {
        startHours = 9;
      } else if (
        lower.includes("midday") ||
        lower.includes("lunch") ||
        lower.includes("noon")
      ) {
        startHours = 12;
      } else if (lower.includes("afternoon")) {
        startHours = 14;
      } else if (lower.includes("sunset")) {
        startHours = 17;
        startMinutes = 30;
      } else if (lower.includes("evening") || lower.includes("dinner")) {
        startHours = 19;
      } else if (lower.includes("night")) {
        startHours = 21;
        startMinutes = 30;
      }
    }
  }

  // Construct start date in UTC
  const startDate = new Date(
    Date.UTC(year, month - 1, day, startHours - tzOffset, startMinutes, 0)
  );

  let endDate: Date;
  if (hasExplicitEnd) {
    let rawEndMs = Date.UTC(
      year,
      month - 1,
      day,
      endHours - tzOffset,
      endMinutes,
      0
    );
    // If end time is before start time (e.g. crossing midnight), add 24h
    if (rawEndMs < startDate.getTime()) {
      rawEndMs += 24 * 60 * 60 * 1000;
    }
    endDate = new Date(rawEndMs);
  } else {
    // Check flight duration in subtitle
    const durationMins = parseDurationMinutes(act.subtitle);
    if (durationMins) {
      endDate = new Date(startDate.getTime() + durationMins * 60 * 1000);
    } else {
      // Default durations by category
      let defaultMins = 60;
      if (
        act.category === "dining" ||
        act.category === "spa" ||
        act.category === "culture"
      ) {
        defaultMins = 120;
      } else if (act.category === "hotel") {
        defaultMins = 90;
      } else if (act.category === "flight") {
        defaultMins = 180;
      }
      endDate = new Date(startDate.getTime() + defaultMins * 60 * 1000);
    }
  }

  return {
    startUtc: formatUtcTimestamp(startDate),
    endUtc: formatUtcTimestamp(endDate),
  };
}

/**
 * Escapes special characters for RFC 5545 iCalendar values.
 */
export function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Folds lines longer than 75 characters per RFC 5545.
 */
export function foldIcsLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, maxLength));
  remaining = remaining.slice(maxLength);
  while (remaining.length > 0) {
    parts.push(" " + remaining.slice(0, maxLength - 1));
    remaining = remaining.slice(maxLength - 1);
  }
  return parts.join("\r\n");
}

/**
 * Generates an RFC 5545 VEVENT block for an activity.
 */
export function generateIcsVEvent(
  day: { dateIso: string; dateLabel: string },
  act: ItineraryActivity,
  dtstamp = "20270204T000000Z"
): string {
  const { startUtc, endUtc } = resolveActivityUtcRange(day.dateIso, act);
  const cleanId = act.id.replace(/[^a-zA-Z0-9_-]/g, "");
  const dateKey = day.dateIso.replace(/-/g, "");
  const uid = `${cleanId}-${dateKey}@thailand2027.naanaspace`;

  const descParts: string[] = [];
  if (act.subtitle) descParts.push(act.subtitle);
  if (act.notes) descParts.push(`\nNotes: ${act.notes}`);
  descParts.push(`\nLocal Scheduled Time: ${act.time} (${day.dateLabel})`);
  if (act.mapUrl) descParts.push(`\nMap: ${act.mapUrl}`);
  descParts.push(
    "\n---\nThailand 2027: Naana's Birthday Escape • Curated for Shaq & Naana"
  );

  const fullDescription = descParts.join("\n");

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    foldIcsLine(`SUMMARY:${escapeIcsText(act.title)}`),
    foldIcsLine(`DESCRIPTION:${escapeIcsText(fullDescription)}`),
  ];

  if (act.location) {
    lines.push(foldIcsLine(`LOCATION:${escapeIcsText(act.location)}`));
  }

  lines.push("STATUS:CONFIRMED", "TRANSP:OPAQUE", "END:VEVENT");
  return lines.join("\r\n");
}

/**
 * Generates an .ics file string for a single activity.
 */
export function buildActivityIcsContent(
  day: { dateIso: string; dateLabel: string },
  act: ItineraryActivity
): string {
  const dtstamp = formatUtcTimestamp(new Date());
  const vevent = generateIcsVEvent(day, act, dtstamp);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shaq and Naana//Thailand 2027 Trip Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Thailand 2027: ${escapeIcsText(act.title)}`,
    "X-WR-TIMEZONE:Asia/Bangkok",
    vevent,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Generates an .ics file string for an entire day's schedule.
 */
export function buildDayIcsContent(
  day: TripDay,
  activities: ItineraryActivity[]
): string {
  const dtstamp = formatUtcTimestamp(new Date());
  const vevents = activities.map((act) =>
    generateIcsVEvent(day, act, dtstamp)
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shaq and Naana//Thailand 2027 Trip Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Thailand 2027 • Day ${day.dayNumber} (${day.shortDate})`,
    "X-WR-TIMEZONE:Asia/Bangkok",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Generates a master .ics file containing all days and scheduled activities.
 */
export function buildMasterTripIcsContent(
  days: TripDay[],
  customActivitiesByDay: Record<number, ItineraryActivity[]>
): string {
  const dtstamp = formatUtcTimestamp(new Date());
  const vevents: string[] = [];

  for (const day of days) {
    const customActs = customActivitiesByDay[day.dayNumber] || [];
    const allActs = [...day.defaultActivities, ...customActs];
    for (const act of allActs) {
      vevents.push(generateIcsVEvent(day, act, dtstamp));
    }
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shaq and Naana//Thailand 2027 Trip Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Thailand 2027: Naana's Birthday Escape (Master Itinerary)",
    "X-WR-TIMEZONE:Asia/Bangkok",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Builds a direct Google Calendar template link.
 */
export function buildGoogleCalendarUrl(
  day: { dateIso: string; dateLabel: string },
  act: ItineraryActivity
): string {
  const { startUtc, endUtc } = resolveActivityUtcRange(day.dateIso, act);

  const descParts: string[] = [];
  if (act.subtitle) descParts.push(act.subtitle);
  if (act.notes) descParts.push(`\nNotes: ${act.notes}`);
  descParts.push(`\nLocal Scheduled Time: ${act.time} (${day.dateLabel})`);
  if (act.mapUrl) descParts.push(`\nMap: ${act.mapUrl}`);
  descParts.push(
    "\n---\nThailand 2027: Naana's Birthday Escape • Curated for Shaq & Naana"
  );

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: act.title,
    dates: `${startUtc}/${endUtc}`,
    details: descParts.join("\n"),
    location: act.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Triggers a client-side download of an .ics file.
 */
export function downloadIcsFile(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
