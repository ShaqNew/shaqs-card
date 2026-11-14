import {
  TRIP_DAYS,
  HOTEL_BOOKINGS,
  ItineraryActivity,
} from "@/lib/thailandTripData";
import { parseActivitySortMinutes } from "./formatters";

export interface DualTimezoneClock {
  londonTime: string;
  bangkokTime: string;
  londonMinutes: number;
  bangkokMinutes: number;
  fullLabel: string;
}

export interface ActivityTimelineWindow {
  startMinutes: number;
  endMinutes: number;
  sortMinutes: number;
  hasClockTime: boolean;
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

const TZ_OFFSETS_HOURS: Record<string, number> = {
  GMT: 0,
  GST: 4,
  ICT: 7,
};

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
 * - Remainder of 14 Feb 2027 in Europe/London (GMT) -> Day 10 (D10)
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

  if (london.dateIso === "2027-02-14") {
    return 10;
  }

  return null;
}

/**
 * Transit / flight days when dual London GMT & Thailand ICT clock is most useful:
 * D00 (4 Feb outbound), D01 (5 Feb BKK landing), D04 (8 Feb BKK -> HKT),
 * D09 (13 Feb return depart), D10 (14 Feb LGW landing).
 */
export function isTravelTransitDay(dayNumber: number | null): boolean {
  return (
    dayNumber === 0 ||
    dayNumber === 1 ||
    dayNumber === 4 ||
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
  if (dayNumber === 0) {
    return getTimeZoneDateParts(now, "Europe/London").totalMinutes;
  }
  const bangkok = getTimeZoneDateParts(now, "Asia/Bangkok");
  if (dayNumber === 10 && bangkok.dateIso > "2027-02-14") {
    return bangkok.totalMinutes + 1440;
  }
  return bangkok.totalMinutes;
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

function toTargetZoneMinutes(
  hours: number,
  minutes: number,
  sourceTz: string,
  targetTzOffsetHours: number
): number {
  const sourceOffset = TZ_OFFSETS_HOURS[sourceTz] ?? targetTzOffsetHours;
  return hours * 60 + minutes + (targetTzOffsetHours - sourceOffset) * 60;
}

/**
 * Converts activity time/subtitle metadata (including GMT/GST/ICT tags,
 * previous-day dates like "(13 Feb)", range endpoints, and flight landing
 * subtitles) into a unified start/end minute window in the day's timeline.
 */
export function parseActivityTimelineWindow(
  activity: Pick<ItineraryActivity, "time" | "subtitle">,
  dayNumber: number,
  fallbackIndex: number
): ActivityTimelineWindow {
  const timeStr = activity.time || "";
  const subtitleStr = activity.subtitle || "";
  const targetTz = dayNumber === 0 ? "GMT" : "ICT";
  const targetOffsetHours = TZ_OFFSETS_HOURS[targetTz];

  const timeMatches = [...timeStr.matchAll(/(\d{1,2}):(\d{2})/g)];
  if (timeMatches.length === 0) {
    const sortMin = parseActivitySortMinutes(timeStr, fallbackIndex);
    return {
      startMinutes: sortMin,
      endMinutes: sortMin + 30,
      sortMinutes: sortMin,
      hasClockTime: false,
    };
  }

  const trailingTzMatch = timeStr.match(/\b(GMT|GST|ICT)\b/i);
  const trailingTz = trailingTzMatch ? trailingTzMatch[1].toUpperCase() : targetTz;

  const landsMatch = subtitleStr.match(
    /Lands\s+(\d{1,2}):(\d{2})\s+(GMT|GST|ICT)(\s*\(\+1 day\))?/i
  );
  const durationMatch = subtitleStr.match(/Duration:\s*(\d+)h\s*(\d+)m/i);

  const firstMatch = timeMatches[0];
  let startMinutes = toTargetZoneMinutes(
    parseInt(firstMatch[1], 10),
    parseInt(firstMatch[2], 10),
    trailingTz,
    targetOffsetHours
  );

  // Previous-day start note e.g. "22:05 (13 Feb) – 03:40 GST" on D10 (14 Feb)
  if (/\(\s*1[0-9]\s*Feb\s*\)/i.test(timeStr) || startMinutes >= 1440) {
    if (/\(\s*1[0-9]\s*Feb\s*\)/i.test(timeStr)) {
      startMinutes -= 1440;
    }
  }

  let endMinutes: number;

  if (landsMatch && durationMatch) {
    const landsHour = parseInt(landsMatch[1], 10);
    const landsMin = parseInt(landsMatch[2], 10);
    const landsTz = landsMatch[3].toUpperCase();
    const hasPlusOneDay = Boolean(landsMatch[4]);
    let computedEnd = toTargetZoneMinutes(
      landsHour,
      landsMin,
      landsTz,
      targetOffsetHours
    );
    if (hasPlusOneDay && computedEnd < startMinutes) {
      computedEnd += 1440;
    }
    const durationMins =
      parseInt(durationMatch[1], 10) * 60 + parseInt(durationMatch[2], 10);

    // Handle multi-timezone range where departure airport is in another zone (e.g. D10 "03:40 – 07:45 GMT" departing SHJ in GST)
    if (
      timeMatches.length >= 2 &&
      Math.abs(computedEnd - startMinutes - durationMins) > 60
    ) {
      startMinutes = computedEnd - durationMins;
    } else if (computedEnd < startMinutes) {
      computedEnd += 1440;
    }
    endMinutes = computedEnd;
  } else if (timeMatches.length >= 2) {
    const secondMatch = timeMatches[1];
    endMinutes = toTargetZoneMinutes(
      parseInt(secondMatch[1], 10),
      parseInt(secondMatch[2], 10),
      trailingTz,
      targetOffsetHours
    );
    if (endMinutes < startMinutes) {
      endMinutes += 1440;
    }
  } else {
    endMinutes = startMinutes + 30;
  }

  return {
    startMinutes,
    endMinutes,
    sortMinutes: startMinutes,
    hasClockTime: true,
  };
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

  const enriched = activities.map((act, idx) => {
    const win = parseActivityTimelineWindow(act, dayNumber, idx);
    return {
      act,
      idx,
      ...win,
    };
  });

  const uncompleted = enriched.filter(
    (entry) => !completedActivityIds.includes(entry.act.id)
  );

  const upNextEntry =
    uncompleted.find(
      (entry) => !entry.hasClockTime || entry.endMinutes > currentMinutes
    ) ||
    uncompleted[0] ||
    null;

  let minutesUntilUpNext: number | null = null;
  let countdownLabel = "All movements complete";

  if (upNextEntry) {
    if (!upNextEntry.hasClockTime) {
      countdownLabel = "Flexible timing";
    } else {
      minutesUntilUpNext = upNextEntry.startMinutes - currentMinutes;
      if (
        currentMinutes >= upNextEntry.startMinutes &&
        currentMinutes < upNextEntry.endMinutes
      ) {
        countdownLabel = "Happening now";
      } else if (upNextEntry.endMinutes <= currentMinutes) {
        countdownLabel = "Earlier today";
      } else {
        countdownLabel = formatCountdownMinutes(minutesUntilUpNext);
      }
    }
  }

  let nowMarkerIndex = -1;
  if (enriched.length > 0) {
    const firstUpcomingIdx = enriched.findIndex(
      (entry) => entry.endMinutes > currentMinutes
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
  act: Pick<ItineraryActivity, "time" | "subtitle">,
  idx: number,
  currentMinutes: number,
  dayNumber: number = 1
): boolean {
  const win = parseActivityTimelineWindow(act, dayNumber, idx);
  if (!win.hasClockTime) return false;
  return win.endMinutes <= currentMinutes;
}

/**
 * Resolves the relevant Thai hotel booking id (`shangri-la-bangkok` or
 * `pavilions-phuket`) for the given day and upcoming leg, returning `null`
 * on UK departure/return legs (`D00`, `D10`).
 */
export function resolveHotelIdForDay(
  dayNumber: number,
  upNextActivity?: Pick<ItineraryActivity, "id" | "title" | "location"> | null,
  currentMinutes?: number
): string | null {
  if (dayNumber === 0 || dayNumber === 10) {
    return null;
  }
  if (dayNumber >= 1 && dayNumber <= 3) {
    return "shangri-la-bangkok";
  }
  if (dayNumber === 4) {
    if (upNextActivity) {
      if (
        upNextActivity.id === "d4-checkout-bkk" ||
        upNextActivity.id === "d4-grab-to-bkk" ||
        upNextActivity.id === "d4-vietjet-bagdrop"
      ) {
        return "shangri-la-bangkok";
      }
      const combined = `${upNextActivity.title} ${upNextActivity.location || ""}`;
      if (
        /bangkok|shangri-la|\bbkk\b/i.test(combined) &&
        !/phuket|pavilions|\bhkt\b/i.test(upNextActivity.location || "")
      ) {
        return "shangri-la-bangkok";
      }
      return "pavilions-phuket";
    }
    if (currentMinutes !== undefined && currentMinutes < 15 * 60 + 25) {
      return "shangri-la-bangkok";
    }
    return "pavilions-phuket";
  }
  return "pavilions-phuket";
}

export interface CompanionGrabTarget {
  label: string;
  script: string;
  toastLabel: string;
}

export function resolveCompanionGrabTarget(
  dayNumber: number,
  upNextActivity: Pick<ItineraryActivity, "id" | "title" | "location" | "category"> | null,
  hotelId: string | null
): CompanionGrabTarget | null {
  if (dayNumber === 0 || dayNumber === 10 || !hotelId) {
    return null;
  }

  const activeHotel = HOTEL_BOOKINGS.find((h) => h.id === hotelId);
  const loc = upNextActivity?.location?.trim();

  if (
    loc &&
    !/shangri-la|pavilions|lgw|shj|gatwick|sharjah|→/i.test(loc) &&
    upNextActivity?.category !== "flight" &&
    upNextActivity?.category !== "hotel"
  ) {
    return {
      label: "Copy Venue Grab",
      script: loc,
      toastLabel: `Grab destination (${loc})`,
    };
  }

  if (!activeHotel) return null;

  return {
    label: "Copy Hotel Grab",
    script: `${activeHotel.thaiName} - ${activeHotel.thaiAddress}`,
    toastLabel: `Grab script (${activeHotel.name})`,
  };
}
