import { TRIP_DAYS, ItineraryActivity } from "@/lib/thailandTripData";
import { parseActivitySortMinutes } from "./formatters";

export interface DualTimezoneClock {
  londonTime: string;
  bangkokTime: string;
  londonMinutes: number;
  bangkokMinutes: number;
  fullLabel: string;
}

export interface DayCompanionStatus {
  upNextActivity: ItineraryActivity | null;
  minutesUntilUpNext: number | null;
  countdownLabel: string;
  nowMarkerIndex: number;
  currentTimeLabel: string;
  currentMinutes: number;
}

interface TimeZoneDateParts {
  dateIso: string;
  hourStr: string;
  minuteStr: string;
  timeStr: string;
  totalMinutes: number;
}

function getTimeZoneDateParts(
  date: Date,
  timeZone: string
): TimeZoneDateParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      lookup[part.type] = part.value;
    }
  }

  const rawHour = parseInt(lookup.hour || "0", 10);
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = parseInt(lookup.minute || "0", 10);
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");

  return {
    dateIso: `${lookup.year}-${lookup.month}-${lookup.day}`,
    hourStr,
    minuteStr,
    timeStr: `${hourStr}:${minuteStr}`,
    totalMinutes: hour * 60 + minute,
  };
}

/**
 * Resolves the active trip day (0..10) when the device timestamp falls
 * within the itinerary window (4–14 Feb 2027):
 * - 4 Feb 2027 in Europe/London (GMT) -> Day 0 (D00)
 * - 5–14 Feb 2027 in Asia/Bangkok (ICT, UTC+7) -> Days 1..10 (D01..D10)
 */
export function detectActiveTripDay(now: Date = new Date()): number | null {
  const london = getTimeZoneDateParts(now, "Europe/London");
  if (london.dateIso === "2027-02-04") {
    return 0;
  }

  const bangkok = getTimeZoneDateParts(now, "Asia/Bangkok");
  if (bangkok.dateIso >= "2027-02-05" && bangkok.dateIso <= "2027-02-14") {
    const matched = TRIP_DAYS.find(
      (day) => day.dateIso === bangkok.dateIso && day.dayNumber >= 1
    );
    return matched ? matched.dayNumber : null;
  }

  return null;
}

export function isTravelTransitDay(dayNumber: number | null): boolean {
  return (
    dayNumber === 0 ||
    dayNumber === 1 ||
    dayNumber === 3 ||
    dayNumber === 9 ||
    dayNumber === 10
  );
}

export function formatDualTimezoneClock(
  now: Date = new Date()
): DualTimezoneClock {
  const london = getTimeZoneDateParts(now, "Europe/London");
  const bangkok = getTimeZoneDateParts(now, "Asia/Bangkok");

  return {
    londonTime: london.timeStr,
    bangkokTime: bangkok.timeStr,
    londonMinutes: london.totalMinutes,
    bangkokMinutes: bangkok.totalMinutes,
    fullLabel: `London (GMT) ${london.timeStr} | Bangkok/Phuket (ICT) ${bangkok.timeStr}`,
  };
}

export function getCurrentMinutesForDay(
  dayNumber: number,
  now: Date = new Date()
): number {
  const zone = dayNumber === 0 ? "Europe/London" : "Asia/Bangkok";
  return getTimeZoneDateParts(now, zone).totalMinutes;
}

export function getCurrentTimeLabelForDay(
  dayNumber: number,
  now: Date = new Date()
): string {
  const isGmt = dayNumber === 0;
  const parts = getTimeZoneDateParts(
    now,
    isGmt ? "Europe/London" : "Asia/Bangkok"
  );
  return `${parts.timeStr} ${isGmt ? "GMT" : "ICT"}`;
}

function formatCountdownMinutes(diffMinutes: number): string {
  if (diffMinutes < 60) {
    return `in ${diffMinutes}m`;
  }
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return mins === 0 ? `in ${hours}h` : `in ${hours}h ${mins}m`;
}

export function resolveDayCompanionStatus(
  activities: ItineraryActivity[],
  completedActivityIds: string[],
  dayNumber: number,
  now: Date = new Date()
): DayCompanionStatus {
  const currentMinutes = getCurrentMinutesForDay(dayNumber, now);
  const currentTimeLabel = getCurrentTimeLabelForDay(dayNumber, now);

  const enriched = activities.map((act, idx) => ({
    act,
    idx,
    sortMinutes: parseActivitySortMinutes(act.time, idx),
    hasClockTime: /\d{1,2}:\d{2}/.test(act.time),
  }));

  const uncompleted = enriched.filter(
    (entry) => !completedActivityIds.includes(entry.act.id)
  );

  const upNextEntry =
    uncompleted.find(
      (entry) =>
        !entry.hasClockTime || entry.sortMinutes >= currentMinutes - 30
    ) ||
    uncompleted[0] ||
    null;

  let minutesUntilUpNext: number | null = null;
  let countdownLabel = "All movements complete";

  if (upNextEntry) {
    if (!upNextEntry.hasClockTime) {
      countdownLabel = "Flexible timing";
    } else {
      minutesUntilUpNext = upNextEntry.sortMinutes - currentMinutes;
      if (minutesUntilUpNext <= 0 && minutesUntilUpNext >= -30) {
        countdownLabel = "Happening now";
      } else if (minutesUntilUpNext < -30) {
        countdownLabel = "Earlier today";
      } else {
        countdownLabel = formatCountdownMinutes(minutesUntilUpNext);
      }
    }
  }

  let nowMarkerIndex = -1;
  if (enriched.length > 0) {
    const firstUpcomingIdx = enriched.findIndex(
      (entry) => entry.sortMinutes >= currentMinutes
    );
    nowMarkerIndex =
      firstUpcomingIdx >= 0 ? firstUpcomingIdx : enriched.length;
  }

  return {
    upNextActivity: upNextEntry ? upNextEntry.act : null,
    minutesUntilUpNext,
    countdownLabel,
    nowMarkerIndex,
    currentTimeLabel,
    currentMinutes,
  };
}

export function isActivityPast(
  act: ItineraryActivity,
  idx: number,
  currentMinutes: number
): boolean {
  return parseActivitySortMinutes(act.time, idx) < currentMinutes - 30;
}

export function resolveHotelIdForDay(dayNumber: number): string {
  return dayNumber <= 3 ? "shangri-la-bangkok" : "pavilions-phuket";
}
