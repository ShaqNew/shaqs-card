import {
  detectTimezoneOffset,
  parseDurationMinutes,
  resolveActivityUtcRange,
  escapeIcsText,
  foldIcsLine,
  buildActivityIcsContent,
  buildDayIcsContent,
  buildMasterTripIcsContent,
  buildGoogleCalendarUrl,
} from "../calendar";
import { ItineraryActivity, TripDay } from "@/lib/thailandTripData";

describe("Thailand 2027 Calendar Utility", () => {
  describe("detectTimezoneOffset", () => {
    it("detects GMT (UTC+0) for London Gatwick departure", () => {
      expect(detectTimezoneOffset("16:40 GMT", "2027-02-04", "LGW North")).toBe(
        0
      );
    });

    it("detects GST (UTC+4) for Sharjah transit layover", () => {
      expect(
        detectTimezoneOffset("03:50 – 07:50 GST", "2027-02-05", "SHJ Airport")
      ).toBe(4);
    });

    it("detects ICT (UTC+7) for Thailand activities", () => {
      expect(
        detectTimezoneOffset(
          "19:30 ICT",
          "2027-02-05",
          "Shangri-La Bangkok"
        )
      ).toBe(7);
      expect(
        detectTimezoneOffset("12:00", "2027-02-08", "The Pavilions Phuket")
      ).toBe(7);
    });

    it("defaults to 0 for Feb 4 outbound date if unspecified", () => {
      expect(detectTimezoneOffset("16:00", "2027-02-04")).toBe(0);
    });

    it("defaults to 7 for Thailand trip days if unspecified", () => {
      expect(detectTimezoneOffset("14:00", "2027-02-06")).toBe(7);
    });
  });

  describe("parseDurationMinutes", () => {
    it("extracts hours and minutes correctly", () => {
      expect(
        parseDurationMinutes("Duration: 7h 10m • Lands 03:50 GST (+1 day)")
      ).toBe(430);
      expect(parseDurationMinutes("Duration: 6h 15m")).toBe(375);
      expect(parseDurationMinutes("Duration: 1h")).toBe(60);
    });

    it("returns null when no duration is present", () => {
      expect(parseDurationMinutes("No duration specified")).toBeNull();
      expect(parseDurationMinutes(undefined)).toBeNull();
    });
  });

  describe("resolveActivityUtcRange", () => {
    it("converts London departure flight accurately to UTC", () => {
      const act = {
        time: "16:40 GMT",
        subtitle: "Duration: 7h 10m • Lands 03:50 GST (+1 day)",
        category: "flight" as const,
        location: "LGW North Terminal",
      };
      const { startUtc, endUtc } = resolveActivityUtcRange("2027-02-04", act);
      expect(startUtc).toBe("20270204T164000Z");
      expect(endUtc).toBe("20270204T235000Z");
    });

    it("converts Sharjah transit layover (GST, UTC+4) accurately to UTC across midnight", () => {
      const act = {
        time: "03:50 – 07:50 GST",
        subtitle: "Connect to Bangkok Gate",
        category: "transit" as const,
        location: "Sharjah International (SHJ)",
      };
      // 03:50 GST on 2027-02-05 is 23:50 UTC on 2027-02-04
      const { startUtc, endUtc } = resolveActivityUtcRange("2027-02-05", act);
      expect(startUtc).toBe("20270204T235000Z");
      expect(endUtc).toBe("20270205T035000Z");
    });

    it("converts Bangkok hotel check-in (ICT, UTC+7) accurately to UTC", () => {
      const act = {
        time: "19:30 ICT",
        subtitle: "Shangri-La Wing Deluxe King Room",
        category: "hotel" as const,
        location: "Shangri-La Bangkok",
      };
      // 19:30 ICT on 2027-02-05 is 12:30 UTC
      const { startUtc, endUtc } = resolveActivityUtcRange("2027-02-05", act);
      expect(startUtc).toBe("20270205T123000Z");
      // Default hotel duration 90 minutes -> 14:00 UTC
      expect(endUtc).toBe("20270205T140000Z");
    });

    it("converts dining reservations with default 2-hour duration", () => {
      const act = {
        time: "20:00 ICT",
        category: "dining" as const,
        location: "Siam Tea Room",
      };
      // 20:00 ICT on 2027-02-06 is 13:00 UTC
      const { startUtc, endUtc } = resolveActivityUtcRange("2027-02-06", act);
      expect(startUtc).toBe("20270206T130000Z");
      expect(endUtc).toBe("20270206T150000Z");
    });
  });

  describe("escapeIcsText & foldIcsLine", () => {
    it("escapes semicolons, commas, backslashes, and newlines", () => {
      const raw = "Dinner, wine; relax \\ enjoy\nNext line";
      expect(escapeIcsText(raw)).toBe(
        "Dinner\\, wine\\; relax \\\\ enjoy\\nNext line"
      );
    });

    it("folds lines exceeding 75 characters", () => {
      const longLine =
        "DESCRIPTION:This is a very long description intended to test RFC 5545 line folding in the Thailand 2027 calendar utility";
      const folded = foldIcsLine(longLine);
      expect(folded).toContain("\r\n ");
    });
  });

  describe("buildGoogleCalendarUrl", () => {
    it("builds a valid Google Calendar template URL with encoded parameters", () => {
      const day = {
        dateIso: "2027-02-05",
        dateLabel: "Friday, 5 February 2027",
      };
      const act: ItineraryActivity = {
        id: "d1-shangrila-checkin",
        time: "19:30 ICT",
        title: "Check-in at Shangri-La Bangkok",
        subtitle: "Shangri-La Wing Deluxe King Room • Ref: 12891938794",
        category: "hotel",
        location: "89 Soi Wat Suan Plu, Bangrak, Bangkok",
        notes: "Unpack and freshen up.",
        mapUrl: "https://maps.google.com/?q=Shangri-La+Bangkok",
      };

      const url = buildGoogleCalendarUrl(day, act);
      expect(url).toContain("https://calendar.google.com/calendar/render?");
      expect(url).toContain("action=TEMPLATE");
      expect(url).toContain("text=Check-in+at+Shangri-La+Bangkok");
      expect(url).toContain("dates=20270205T123000Z%2F20270205T140000Z");
      expect(url).toContain("location=89+Soi+Wat+Suan+Plu%2C+Bangrak%2C+Bangkok");
      expect(url).toContain("Shaq+%26+Naana");
    });
  });

  describe("iCalendar Export Generation", () => {
    const mockDay: TripDay = {
      dayNumber: 1,
      dateIso: "2027-02-05",
      dateLabel: "Friday, 5 February 2027",
      shortDate: "Fri 5 Feb",
      phase: "bangkok",
      locationBadge: "Bangkok",
      title: "Touchdown in Bangkok",
      vibe: "Warm breeze",
      weatherSummary: "33°C",
      defaultActivities: [
        {
          id: "d1-arrival",
          time: "17:05 – 18:15 ICT",
          title: "Clear BKK Immigration",
          category: "transit",
          location: "BKK Airport",
        },
      ],
    };

    it("generates a single activity .ics with VCALENDAR wrapper", () => {
      const ics = buildActivityIcsContent(
        mockDay,
        mockDay.defaultActivities[0]
      );
      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("VERSION:2.0");
      expect(ics).toContain("PRODID:-//Shaq and Naana//Thailand 2027 Trip Planner//EN");
      expect(ics).toContain("BEGIN:VEVENT");
      expect(ics).toContain("SUMMARY:Clear BKK Immigration");
      expect(ics).toContain("LOCATION:BKK Airport");
      expect(ics).toContain("DTSTART:20270205T100500Z");
      expect(ics).toContain("DTEND:20270205T111500Z");
      expect(ics).toContain("END:VEVENT");
      expect(ics).toContain("END:VCALENDAR");
    });

    it("generates a day schedule .ics", () => {
      const ics = buildDayIcsContent(mockDay, mockDay.defaultActivities);
      expect(ics).toContain("X-WR-CALNAME:Thailand 2027 • Day 1 (Fri 5 Feb)");
      expect(ics).toContain("SUMMARY:Clear BKK Immigration");
    });

    it("generates a master trip .ics including custom activities", () => {
      const customActs = {
        1: [
          {
            id: "custom-dinner",
            time: "20:30 ICT",
            title: "Private Riverside Dinner",
            category: "romance" as const,
            location: "Salathip Pavilion",
          },
        ],
      };

      const masterIcs = buildMasterTripIcsContent([mockDay], customActs);
      expect(masterIcs).toContain(
        "X-WR-CALNAME:Thailand 2027: Naana's Birthday Escape (Master Itinerary)"
      );
      expect(masterIcs).toContain("SUMMARY:Clear BKK Immigration");
      expect(masterIcs).toContain("SUMMARY:Private Riverside Dinner");
      expect(masterIcs).toContain("LOCATION:Salathip Pavilion");
    });
  });
});
