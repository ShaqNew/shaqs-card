"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  TRIP_METADATA,
  FLIGHT_BOOKINGS,
  HOTEL_BOOKINGS,
  FINANCIAL_MATRIX,
  TRIP_DAYS,
  PREP_CHECKLIST,
  ESSENTIAL_APPS,
  DEFAULT_PACKING_ITEMS,
  DEFAULT_PLANNED_EXPENSES,
  EMERGENCY_CONTACTS,
  INTERNATIONAL_HOSPITALS,
  ItineraryActivity,
  PackingItem,
  PlannedExpense,
} from "@/lib/thailandTripData";

type ActiveTab =
  | "itinerary"
  | "bookings"
  | "prep"
  | "packing"
  | "guide"
  | "budget";

type PhaseFilter =
  | "all"
  | "outbound"
  | "bangkok"
  | "transfer"
  | "phuket"
  | "return";

const STORAGE_KEY = "naanas_space_thailand_2027_v1";
const ACTOR_STORAGE_KEY = "naanas_space_thailand_2027_actor";

export interface ChangeLogEntry {
  id: string;
  timestamp: number;
  actor: "Shaq" | "Naana";
  section: "itinerary" | "bookings" | "prep" | "packing" | "budget";
  action: string;
  detail: string;
}

interface PersistedTripState {
  completedPrepIds: string[];
  installedAppIds: string[];
  packedItemIds: string[];
  customPackingItems: PackingItem[];
  completedActivityIds: string[];
  customActivitiesByDay: Record<number, ItineraryActivity[]>;
  dayNotes: Record<number, string>;
  pavilionsBalancePaid: boolean;
  plannedExpenses: PlannedExpense[];
  exchangeRate: number;
  changeLog?: ChangeLogEntry[];
  updatedAt?: number;
}

const DEFAULT_PERSISTED_STATE: PersistedTripState = {
  completedPrepIds: [],
  installedAppIds: [],
  packedItemIds: [],
  customPackingItems: [],
  completedActivityIds: [],
  customActivitiesByDay: {},
  dayNotes: {},
  pavilionsBalancePaid: false,
  plannedExpenses: DEFAULT_PLANNED_EXPENSES,
  exchangeRate: TRIP_METADATA.exchangeRateBenchmark,
  changeLog: [],
};

const CATEGORY_EDITORIAL_STYLES: Record<
  ItineraryActivity["category"],
  { tag: string; label: string }
> = {
  flight: {
    tag: "border-[#13382E]/30 bg-[#13382E]/8 text-[#13382E]",
    label: "Aviation",
  },
  hotel: {
    tag: "border-[#9E7B3B]/40 bg-[#9E7B3B]/10 text-[#6E521F]",
    label: "Residence",
  },
  transit: {
    tag: "border-[#5C5248]/30 bg-[#EFE7D8] text-[#433A31]",
    label: "Passage",
  },
  dining: {
    tag: "border-[#A8442A]/35 bg-[#A8442A]/10 text-[#8F351E]",
    label: "Gastronomy",
  },
  culture: {
    tag: "border-[#9E7B3B]/45 bg-[#9E7B3B]/12 text-[#735520]",
    label: "Heritage & Temple",
  },
  beach: {
    tag: "border-[#1D4E40]/35 bg-[#1D4E40]/10 text-[#13382E]",
    label: "Andaman Coast",
  },
  spa: {
    tag: "border-[#2D5A47]/35 bg-[#2D5A47]/10 text-[#1E4233]",
    label: "Sanctuary & Spa",
  },
  romance: {
    tag: "border-[#A8442A]/45 bg-[#A8442A]/12 text-[#8F351E]",
    label: "Celebration",
  },
  custom: {
    tag: "border-[#1F1A16]/25 bg-[#EFE7D8] text-[#1F1A16]",
    label: "Bespoke Note",
  },
};

const serifStyle = {
  fontFamily: "var(--font-editorial-serif), Georgia, serif",
  fontVariantNumeric: "lining-nums tabular-nums" as const,
};

const monoStyle = {
  fontFamily: "var(--font-editorial-mono), monospace",
  fontVariantNumeric: "lining-nums tabular-nums" as const,
};

const chronometerDigitalStyle = {
  fontFamily:
    "'DS-Digital', var(--font-digital), var(--font-editorial-mono), monospace",
  fontVariantNumeric: "tabular-nums" as const,
  letterSpacing: "0.06em",
};

const ExternalArrow = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block w-3 h-3 ml-1 -mt-0.5 shrink-0"
  >
    <path d="M3 9L9 3M9 3H4.5M9 3V7.5" />
  </svg>
);

function formatDayNumber(dayNumber: number): string {
  return String(dayNumber).padStart(2, "0");
}

function parseActivitySortMinutes(
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

export default function ThailandTripDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("itinerary");
  const [tripState, setTripState] = useState<PersistedTripState>(
    DEFAULT_PERSISTED_STATE
  );
  const [syncStatus, setSyncStatus] = useState<"local" | "syncing" | "synced">(
    "local"
  );
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Itinerary filters, day collapse & custom activity drawer/edit state
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [collapsedDayNums, setCollapsedDayNums] = useState<number[]>([]);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [openSuggestionInfoKey, setOpenSuggestionInfoKey] = useState<
    string | null
  >(null);
  const [newActTime, setNewActTime] = useState("19:00 ICT");
  const [newActTitle, setNewActTitle] = useState("");
  const [newActLocation, setNewActLocation] = useState("");
  const [newActCategory, setNewActCategory] =
    useState<ItineraryActivity["category"]>("romance");
  const [newActNotes, setNewActNotes] = useState("");

  // Inline editing state for custom activities
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );
  const [editActTime, setEditActTime] = useState("");
  const [editActTitle, setEditActTitle] = useState("");
  const [editActLocation, setEditActLocation] = useState("");
  const [editActCategory, setEditActCategory] =
    useState<ItineraryActivity["category"]>("romance");
  const [editActNotes, setEditActNotes] = useState("");

  // Prep & Packing filters
  const [prepAssigneeFilter, setPrepAssigneeFilter] = useState<
    "all" | "both" | "shaq" | "naana"
  >("all");
  const [packingOwnerFilter, setPackingOwnerFilter] = useState<
    "all" | "both" | "shaq" | "naana"
  >("all");
  const [showUnpackedOnly, setShowUnpackedOnly] = useState(false);
  const [dressCodeTab, setDressCodeTab] = useState<
    "temple" | "rooftop" | "daytime" | "beach"
  >("temple");

  // New custom packing item state
  const [newPackLabel, setNewPackLabel] = useState("");
  const [newPackCategory, setNewPackCategory] = useState<
    PackingItem["category"]
  >("Daytime & Temple Wear");
  const [newPackForWho, setNewPackForWho] =
    useState<PackingItem["forWho"]>("both");

  // Currency converter state
  const [thbInput, setThbInput] = useState<string>("1000");
  const [gbpInput, setGbpInput] = useState<string>(
    (1000 / TRIP_METADATA.exchangeRateBenchmark).toFixed(2)
  );

  // On-the-ground quick drawer, Thai taxi driver card modal & Change Log drawer state
  const [isQuickDeskOpen, setIsQuickDeskOpen] = useState(false);
  const [driverModalHotelId, setDriverModalHotelId] = useState<string | null>(
    null
  );
  const [activeActor, setActiveActor] = useState<"Shaq" | "Naana">("Shaq");
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);
  const [logSectionFilter, setLogSectionFilter] = useState<
    "all" | ChangeLogEntry["section"]
  >("all");

  // New planned expense state
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpCurrency, setNewExpCurrency] = useState<"THB" | "GBP">("THB");
  const [newExpCity, setNewExpCity] = useState<"Bangkok" | "Phuket" | "Both">(
    "Phuket"
  );
  const [newExpCategory, setNewExpCategory] =
    useState<PlannedExpense["category"]>("Birthday Treat");

  // Countdown clock
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    statusLabel: string;
  }>({
    days: 96,
    hours: 17,
    minutes: 0,
    statusLabel: "Until Departure • London Gatwick",
  });

  const handleSetActiveActor = (actor: "Shaq" | "Naana") => {
    setActiveActor(actor);
    try {
      localStorage.setItem(ACTOR_STORAGE_KEY, actor);
    } catch {
      // Ignore storage errors
    }
  };

  const fetchFromCloud = useCallback(async () => {
    if (typeof fetch === "undefined") return;
    try {
      const res = await fetch("/api/naanas-space/thailand-2027", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data?.configured) {
        setSyncStatus("local");
        return;
      }
      if (data.state) {
        setTripState((prev) => {
          const cloudUpdated = data.state.updatedAt || 0;
          const localUpdated = prev.updatedAt || 0;
          if (cloudUpdated >= localUpdated) {
            const merged = { ...prev, ...data.state };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch {
              // Ignore storage errors
            }
            return merged;
          }
          return prev;
        });
        setSyncStatus("synced");
      } else {
        setTripState((current) => {
          fetch("/api/naanas-space/thailand-2027", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: current }),
          }).catch(() => {});
          return current;
        });
        setSyncStatus("synced");
      }
    } catch {
      setSyncStatus("local");
    }
  }, []);

  const updateTripState = useCallback(
    (
      updater: (prev: PersistedTripState) => PersistedTripState,
      logMeta?: {
        section: ChangeLogEntry["section"];
        action: string;
        detail: string;
      }
    ) => {
      setTripState((prev) => {
        const now = Date.now();
        const updatedBase = updater(prev);
        const existingLogs = updatedBase.changeLog || prev.changeLog || [];
        const nextLogs = logMeta
          ? [
              {
                id: `log-${now}-${Math.random().toString(36).slice(2, 6)}`,
                timestamp: now,
                actor: activeActor,
                section: logMeta.section,
                action: logMeta.action,
                detail: logMeta.detail,
              },
              ...existingLogs,
            ].slice(0, 150)
          : existingLogs;

        const next: PersistedTripState = {
          ...updatedBase,
          changeLog: nextLogs,
          updatedAt: now,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
        if (typeof fetch !== "undefined") {
          setSyncStatus("syncing");
          fetch("/api/naanas-space/thailand-2027", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: next }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.configured && data?.saved) {
                setSyncStatus("synced");
              } else {
                setSyncStatus("local");
              }
            })
            .catch(() => {
              setSyncStatus("local");
            });
        }
        return next;
      });
    },
    [activeActor]
  );

  // Load persisted state from localStorage + sync with Vercel KV
  useEffect(() => {
    try {
      const savedActor = localStorage.getItem(ACTOR_STORAGE_KEY);
      if (savedActor === "Shaq" || savedActor === "Naana") {
        setActiveActor(savedActor);
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTripState((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch {
      // Ignore storage errors
    }

    fetchFromCloud();

    const handleFocus = () => {
      fetchFromCloud();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchFromCloud]);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(TRIP_METADATA.startDateIso).getTime();
      const end = new Date(TRIP_METADATA.endDateIso).getTime();

      if (now < start) {
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown({
          days,
          hours,
          minutes,
          statusLabel: "Until Departure • 04 Feb 2027 (16:40 GMT)",
        });
      } else if (now >= start && now <= end) {
        const dayIndex = Math.min(
          10,
          Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
        );
        setCountdown({
          days: dayIndex,
          hours: 0,
          minutes: 0,
          statusLabel: "Currently in Residence • Thailand",
        });
      } else {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          statusLabel: "Archive • February 2027",
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, label?: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedText(label || text);
    setTimeout(() => setCopiedText(null), 2200);
  };

  // Readiness metrics
  const allPackingItems = useMemo(
    () => [...DEFAULT_PACKING_ITEMS, ...tripState.customPackingItems],
    [tripState.customPackingItems]
  );

  const prepProgress = useMemo(() => {
    const total = PREP_CHECKLIST.length;
    const done = tripState.completedPrepIds.length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [tripState.completedPrepIds]);

  const appsProgress = useMemo(() => {
    const total = ESSENTIAL_APPS.length;
    const done = tripState.installedAppIds.length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [tripState.installedAppIds]);

  const packingProgress = useMemo(() => {
    const total = allPackingItems.length;
    const done = tripState.packedItemIds.length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [allPackingItems, tripState.packedItemIds]);

  const overallReadinessPct = useMemo(() => {
    const totalItems =
      PREP_CHECKLIST.length + ESSENTIAL_APPS.length + allPackingItems.length;
    const totalDone =
      tripState.completedPrepIds.length +
      tripState.installedAppIds.length +
      tripState.packedItemIds.length;
    return totalItems ? Math.round((totalDone / totalItems) * 100) : 0;
  }, [
    allPackingItems.length,
    tripState.completedPrepIds.length,
    tripState.installedAppIds.length,
    tripState.packedItemIds.length,
  ]);

  // Toggle helpers with automatic Change Log attribution
  const togglePrepItem = (id: string) => {
    const item = PREP_CHECKLIST.find((p) => p.id === id);
    const wasDone = tripState.completedPrepIds.includes(id);
    updateTripState(
      (prev) => ({
        ...prev,
        completedPrepIds: prev.completedPrepIds.includes(id)
          ? prev.completedPrepIds.filter((i) => i !== id)
          : [...prev.completedPrepIds, id],
      }),
      {
        section: "prep",
        action: wasDone ? "Reopened prep task" : "Completed prep task",
        detail: item ? item.title : id,
      }
    );
  };

  const toggleAppInstalled = (id: string) => {
    const app = ESSENTIAL_APPS.find((a) => a.id === id);
    const wasInstalled = tripState.installedAppIds.includes(id);
    updateTripState(
      (prev) => ({
        ...prev,
        installedAppIds: prev.installedAppIds.includes(id)
          ? prev.installedAppIds.filter((i) => i !== id)
          : [...prev.installedAppIds, id],
      }),
      {
        section: "prep",
        action: wasInstalled
          ? "Unchecked essential app"
          : "Configured essential app",
        detail: app ? app.name : id,
      }
    );
  };

  const togglePackingItem = (id: string) => {
    const item = allPackingItems.find((p) => p.id === id);
    const wasPacked = tripState.packedItemIds.includes(id);
    updateTripState(
      (prev) => ({
        ...prev,
        packedItemIds: prev.packedItemIds.includes(id)
          ? prev.packedItemIds.filter((i) => i !== id)
          : [...prev.packedItemIds, id],
      }),
      {
        section: "packing",
        action: wasPacked ? "Unpacked item" : "Packed item",
        detail: item ? `${item.label} (${item.category})` : id,
      }
    );
  };

  const toggleActivityCompleted = (id: string) => {
    const wasDone = tripState.completedActivityIds.includes(id);
    let foundLabel = id;
    for (const day of TRIP_DAYS) {
      const customActs = tripState.customActivitiesByDay[day.dayNumber] || [];
      const match = [...day.defaultActivities, ...customActs].find(
        (a) => a.id === id
      );
      if (match) {
        foundLabel = `Day ${formatDayNumber(day.dayNumber)} • ${match.title} (${match.time})`;
        break;
      }
    }
    updateTripState(
      (prev) => ({
        ...prev,
        completedActivityIds: prev.completedActivityIds.includes(id)
          ? prev.completedActivityIds.filter((i) => i !== id)
          : [...prev.completedActivityIds, id],
      }),
      {
        section: "itinerary",
        action: wasDone ? "Reopened schedule item" : "Completed schedule item",
        detail: foundLabel,
      }
    );
  };

  const addCustomActivity = (
    dayNumber: number,
    activityData: Omit<ItineraryActivity, "id">
  ) => {
    const newActivity: ItineraryActivity = {
      ...activityData,
      id: `custom-${dayNumber}-${Date.now()}`,
    };
    updateTripState(
      (prev) => {
        const existing = prev.customActivitiesByDay[dayNumber] || [];
        return {
          ...prev,
          customActivitiesByDay: {
            ...prev.customActivitiesByDay,
            [dayNumber]: [...existing, newActivity],
          },
        };
      },
      {
        section: "itinerary",
        action: `Inscribed to Day ${formatDayNumber(dayNumber)}`,
        detail: `${activityData.title} (${activityData.time})`,
      }
    );
  };

  const removeCustomActivity = (dayNumber: number, activityId: string) => {
    const existingList = tripState.customActivitiesByDay[dayNumber] || [];
    const targetAct = existingList.find((a) => a.id === activityId);
    updateTripState(
      (prev) => {
        const existing = prev.customActivitiesByDay[dayNumber] || [];
        return {
          ...prev,
          customActivitiesByDay: {
            ...prev.customActivitiesByDay,
            [dayNumber]: existing.filter((a) => a.id !== activityId),
          },
        };
      },
      {
        section: "itinerary",
        action: `Removed from Day ${formatDayNumber(dayNumber)}`,
        detail: targetAct
          ? `${targetAct.title} (${targetAct.time})`
          : activityId,
      }
    );
    if (editingActivityId === activityId) {
      setEditingActivityId(null);
    }
  };

  const startEditingActivity = (act: ItineraryActivity) => {
    setEditingActivityId(act.id);
    setEditActTime(act.time);
    setEditActTitle(act.title);
    setEditActLocation(act.location || "");
    setEditActCategory(act.category);
    setEditActNotes(act.notes || "");
  };

  const saveEditedActivity = (
    e: React.FormEvent,
    dayNumber: number,
    activityId: string
  ) => {
    e.preventDefault();
    if (!editActTitle.trim()) return;
    const nextTime = editActTime.trim() || "Flexible";
    const nextTitle = editActTitle.trim();
    updateTripState(
      (prev) => {
        const existing = prev.customActivitiesByDay[dayNumber] || [];
        return {
          ...prev,
          customActivitiesByDay: {
            ...prev.customActivitiesByDay,
            [dayNumber]: existing.map((act) =>
              act.id === activityId
                ? {
                    ...act,
                    time: nextTime,
                    title: nextTitle,
                    category: editActCategory,
                    location: editActLocation.trim() || undefined,
                    notes: editActNotes.trim() || undefined,
                  }
                : act
            ),
          },
        };
      },
      {
        section: "itinerary",
        action: `Updated entry on Day ${formatDayNumber(dayNumber)}`,
        detail: `${nextTitle} (${nextTime})`,
      }
    );
    setEditingActivityId(null);
  };

  const toggleDayCollapsed = (dayNumber: number) => {
    setCollapsedDayNums((prev) =>
      prev.includes(dayNumber)
        ? prev.filter((d) => d !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const filteredDays = useMemo(() => {
    return TRIP_DAYS.filter((day) => {
      if (selectedDayNum !== null) return day.dayNumber === selectedDayNum;
      if (phaseFilter === "all") return true;
      return day.phase === phaseFilter;
    });
  }, [phaseFilter, selectedDayNum]);

  const allDaysCollapsed = useMemo(
    () =>
      filteredDays.length > 0 &&
      filteredDays.every((d) => collapsedDayNums.includes(d.dayNumber)),
    [filteredDays, collapsedDayNums]
  );

  const toggleAllDaysCollapsed = () => {
    if (allDaysCollapsed) {
      setCollapsedDayNums([]);
    } else {
      setCollapsedDayNums(TRIP_DAYS.map((d) => d.dayNumber));
    }
  };

  const jumpToActiveOrFirstDay = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const matchedDay = TRIP_DAYS.find((d) => d.dateIso === todayIso);
    const targetDayNum = matchedDay ? matchedDay.dayNumber : 0;
    setSelectedDayNum(null);
    setPhaseFilter("all");
    setCollapsedDayNums((prev) => prev.filter((d) => d !== targetDayNum));
    setTimeout(() => {
      document
        .getElementById(`day-card-${targetDayNum}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleAddActivitySubmit = (e: React.FormEvent, dayNumber: number) => {
    e.preventDefault();
    if (!newActTitle.trim()) return;
    addCustomActivity(dayNumber, {
      time: newActTime.trim() || "Flexible",
      title: newActTitle.trim(),
      category: newActCategory,
      location: newActLocation.trim() || undefined,
      notes: newActNotes.trim() || undefined,
    });
    setNewActTitle("");
    setNewActLocation("");
    setNewActNotes("");
    setAddingToDay(null);
  };

  const handleAddPackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackLabel.trim()) return;
    const item: PackingItem = {
      id: `custom-pack-${Date.now()}`,
      category: newPackCategory,
      label: newPackLabel.trim(),
      forWho: newPackForWho,
    };
    updateTripState(
      (prev) => ({
        ...prev,
        customPackingItems: [...prev.customPackingItems, item],
      }),
      {
        section: "packing",
        action: "Added custom packing item",
        detail: `${item.label} (${item.category})`,
      }
    );
    setNewPackLabel("");
  };

  const removeCustomPackingItem = (itemId: string) => {
    const targetItem = tripState.customPackingItems.find(
      (i) => i.id === itemId
    );
    updateTripState(
      (prev) => ({
        ...prev,
        customPackingItems: prev.customPackingItems.filter(
          (i) => i.id !== itemId
        ),
        packedItemIds: prev.packedItemIds.filter((id) => id !== itemId),
      }),
      {
        section: "packing",
        action: "Removed custom packing item",
        detail: targetItem ? targetItem.label : itemId,
      }
    );
  };

  // Currency handlers
  const handleThbChange = (val: string) => {
    setThbInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setGbpInput((num / tripState.exchangeRate).toFixed(2));
    } else {
      setGbpInput("");
    }
  };

  const handleGbpChange = (val: string) => {
    setGbpInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setThbInput(Math.round(num * tripState.exchangeRate).toString());
    } else {
      setThbInput("");
    }
  };

  const setQuickThbPreset = (thbAmount: number) => {
    setThbInput(thbAmount.toString());
    setGbpInput((thbAmount / tripState.exchangeRate).toFixed(2));
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(newExpAmount);
    if (!newExpTitle.trim() || isNaN(rawAmount) || rawAmount <= 0) return;
    const amountThb =
      newExpCurrency === "THB"
        ? Math.round(rawAmount)
        : Math.round(rawAmount * tripState.exchangeRate);

    const exp: PlannedExpense = {
      id: `exp-${Date.now()}`,
      title: newExpTitle.trim(),
      category: newExpCategory,
      amountThb,
      city: newExpCity,
      isBooked: false,
    };
    updateTripState(
      (prev) => ({
        ...prev,
        plannedExpenses: [...prev.plannedExpenses, exp],
      }),
      {
        section: "budget",
        action: "Added planned expense",
        detail: `${exp.title} — THB ${exp.amountThb.toLocaleString()} (${exp.city})`,
      }
    );
    setNewExpTitle("");
    setNewExpAmount("");
  };

  const toggleExpenseBooked = (id: string) => {
    const targetExp = tripState.plannedExpenses.find((e) => e.id === id);
    const wasBooked = Boolean(targetExp?.isBooked);
    updateTripState(
      (prev) => ({
        ...prev,
        plannedExpenses: prev.plannedExpenses.map((e) =>
          e.id === id ? { ...e, isBooked: !e.isBooked } : e
        ),
      }),
      {
        section: "budget",
        action: wasBooked
          ? "Marked expense as planned"
          : "Marked expense as settled/reserved",
        detail: targetExp
          ? `${targetExp.title} (THB ${targetExp.amountThb.toLocaleString()})`
          : id,
      }
    );
  };

  const deleteExpense = (id: string) => {
    const targetExp = tripState.plannedExpenses.find((e) => e.id === id);
    updateTripState(
      (prev) => ({
        ...prev,
        plannedExpenses: prev.plannedExpenses.filter((e) => e.id !== id),
      }),
      {
        section: "budget",
        action: "Removed planned expense",
        detail: targetExp ? targetExp.title : id,
      }
    );
  };

  const deleteChangeLogEntry = (logId: string) => {
    updateTripState((prev) => ({
      ...prev,
      changeLog: (prev.changeLog || []).filter((l) => l.id !== logId),
    }));
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#1F1A16] pb-24">
      {/* Subtle Top Architectural Rule & Issue Bar */}
      <div className="border-b border-[#1F1A16]/15 bg-[#EFE7D8]/70 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.2em] text-[#5C5248]">
          <Link
            href="/naanas-space"
            className="text-[#1F1A16] hover:text-[#A8442A] font-semibold flex items-center gap-2 transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Naana&apos;s Space</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Active Editor Toggle (Shaq / Naana) */}
            <div
              style={monoStyle}
              className="flex items-center border border-[#1F1A16]/20 bg-[#FBF8F3] text-[10px] tracking-[0.14em]"
              title="Select who is making changes on this device"
            >
              <span className="px-2 py-0.5 text-[#8A7E71] border-r border-[#1F1A16]/15">
                EDITOR:
              </span>
              {(["Shaq", "Naana"] as const).map((person) => (
                <button
                  key={person}
                  type="button"
                  onClick={() => handleSetActiveActor(person)}
                  className={`px-2 py-0.5 uppercase transition-colors cursor-pointer ${
                    activeActor === person
                      ? person === "Shaq"
                        ? "bg-[#13382E] text-[#F6F1E7] font-semibold"
                        : "bg-[#A8442A] text-[#FBF8F3] font-semibold"
                      : "text-[#5C5248] hover:text-[#1F1A16]"
                  }`}
                >
                  {person}
                </button>
              ))}
            </div>

            {/* Change Log Drawer Button */}
            <button
              type="button"
              onClick={() => setIsChangeLogOpen(true)}
              style={monoStyle}
              className="px-2.5 py-0.5 border border-[#1F1A16]/25 bg-[#FBF8F3] hover:bg-[#1F1A16] text-[10px] tracking-[0.14em] text-[#1F1A16] hover:text-[#F6F1E7] font-semibold transition-colors cursor-pointer"
              title="View history of itinerary, prep, packing, and budget changes"
            >
              CHANGE LOG ({(tripState.changeLog || []).length})
            </button>

            <button
              type="button"
              onClick={fetchFromCloud}
              style={monoStyle}
              className="px-2.5 py-0.5 border border-[#1F1A16]/20 bg-[#FBF8F3] text-[10px] tracking-[0.14em] text-[#5C5248] hover:text-[#1F1A16] cursor-pointer"
              title="Sync folio state with Vercel KV cloud storage"
            >
              {syncStatus === "synced"
                ? "● CLOUD SYNCED"
                : syncStatus === "syncing"
                ? "◌ SYNCING..."
                : "○ LOCAL CACHE"}
            </button>
            <span style={monoStyle} className="text-[#13382E] font-medium">
              04 FEB &mdash; 14 FEB 2027
            </span>
          </div>
        </div>
      </div>

      {/* Folio Revision & Activity Change Log Modal Drawer */}
      {isChangeLogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Folio Change & Revision Log"
          className="fixed inset-0 z-50 bg-[#1F1A16]/75 backdrop-blur-sm flex justify-end"
          onClick={() => setIsChangeLogOpen(false)}
        >
          <div
            className="bg-[#FBF8F3] border-l-2 border-[#1F1A16] w-full max-w-xl h-full flex flex-col justify-between shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#1F1A16]/20 bg-[#EFE7D8]/70 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[11px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
                  >
                    AUDIT &amp; REVISION CHRONICLE
                  </span>
                  <h3
                    style={serifStyle}
                    className="text-3xl font-normal text-[#1F1A16] mt-0.5"
                  >
                    Folio Change Log
                  </h3>
                  <p className="text-xs text-[#5C5248] mt-1">
                    Tracks when reservations, notes, prep tasks, and packing
                    items were added, edited, or marked complete by Shaq &amp;
                    Naana.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangeLogOpen(false)}
                  style={monoStyle}
                  className="px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0"
                >
                  Close &#10005;
                </button>
              </div>

              {/* Active Editor Selector + Section Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1F1A16]/15">
                <div className="flex items-center gap-2">
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-wider text-[#5C5248]"
                  >
                    LOGGING AS:
                  </span>
                  {(["Shaq", "Naana"] as const).map((person) => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => handleSetActiveActor(person)}
                      style={monoStyle}
                      className={`px-2.5 py-1 text-[11px] uppercase tracking-wider border cursor-pointer ${
                        activeActor === person
                          ? person === "Shaq"
                            ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E] font-semibold"
                            : "bg-[#A8442A] text-[#FBF8F3] border-[#A8442A] font-semibold"
                          : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                      }`}
                    >
                      {person}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "all", label: "All" },
                    { id: "itinerary", label: "Itinerary" },
                    { id: "prep", label: "Prep & Apps" },
                    { id: "packing", label: "Packing" },
                    { id: "budget", label: "Budget" },
                    { id: "bookings", label: "Bookings" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setLogSectionFilter(
                          f.id as "all" | ChangeLogEntry["section"]
                        )
                      }
                      style={monoStyle}
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border cursor-pointer ${
                        logSectionFilter === f.id
                          ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                          : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Log Entries List */}
            <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#1F1A16]/15">
              {(() => {
                const logs = (tripState.changeLog || []).filter(
                  (entry) =>
                    logSectionFilter === "all" ||
                    entry.section === logSectionFilter
                );
                if (logs.length === 0) {
                  return (
                    <div className="py-12 text-center space-y-2">
                      <p
                        style={serifStyle}
                        className="text-2xl italic text-[#5C5248]"
                      >
                        No recorded changes yet.
                      </p>
                    </div>
                  );
                }

                return logs.map((entry) => {
                  const formattedDate = new Date(
                    entry.timestamp
                  ).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={entry.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            style={monoStyle}
                            className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                              entry.actor === "Shaq"
                                ? "bg-[#13382E] text-[#F6F1E7]"
                                : "bg-[#A8442A] text-[#FBF8F3]"
                            }`}
                          >
                            {entry.actor}
                          </span>
                          <span
                            style={monoStyle}
                            className="text-[11px] uppercase tracking-wider font-semibold text-[#1F1A16]"
                          >
                            {entry.action}
                          </span>
                          <span
                            style={monoStyle}
                            className="text-[10px] text-[#8A7E71]"
                          >
                            &bull; {formattedDate}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#4A4036] break-words">
                          {entry.detail}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteChangeLogEntry(entry.id)}
                        className="text-xs text-[#8A7E71] hover:text-[#A8442A] px-1.5 py-0.5 shrink-0 cursor-pointer"
                        title="Remove this log entry"
                      >
                        &#10005;
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#1F1A16]/20 bg-[#EFE7D8]/60 flex items-center justify-between">
              <span style={monoStyle} className="text-[11px] text-[#5C5248]">
                TOTAL LOGGED EVENTS: {(tripState.changeLog || []).length}
              </span>
              {(tripState.changeLog || []).length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    updateTripState((prev) => ({
                      ...prev,
                      changeLog: [],
                    }))
                  }
                  style={monoStyle}
                  className="px-3 py-1.5 border border-[#A8442A]/40 text-[#A8442A] hover:bg-[#A8442A] hover:text-[#FBF8F3] text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Clear All History
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Editorial Copy Stamp Notification */}
      {copiedText && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B] shadow-xl"
        >
          <span
            style={monoStyle}
            className="text-[11px] uppercase tracking-[0.18em] text-[#D8B979]"
          >
            COPIED TO FOLIO
          </span>
          <span className="text-sm font-medium">{copiedText}</span>
        </div>
      )}

      {/* Full-Screen Thai Taxi / Chauffeur Address Modal */}
      {driverModalHotelId &&
        (() => {
          const activeHotel = HOTEL_BOOKINGS.find(
            (h) => h.id === driverModalHotelId
          );
          if (!activeHotel) return null;
          return (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Show driver card for ${activeHotel.name}`}
              className="fixed inset-0 z-50 bg-[#1F1A16]/85 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setDriverModalHotelId(null)}
            >
              <div
                className="bg-[#FBF8F3] border-2 border-[#1F1A16] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 border-b border-[#1F1A16]/20 pb-4">
                  <div>
                    <span
                      style={monoStyle}
                      className="text-[11px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
                    >
                      CHAUFFEUR &amp; TAXI DISPATCH CARD &bull; SHOW TO DRIVER
                    </span>
                    <h3
                      style={serifStyle}
                      className="text-2xl sm:text-3xl font-normal text-[#1F1A16] mt-1"
                    >
                      {activeHotel.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDriverModalHotelId(null)}
                    style={monoStyle}
                    className="px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Close &#10005;
                  </button>
                </div>

                {/* High-Contrast Large Thai Script Block for Driver */}
                <div className="bg-[#EFE7D8] border-2 border-[#13382E] p-5 sm:p-6 space-y-3">
                  <div
                    style={monoStyle}
                    className="text-[11px] uppercase tracking-[0.16em] text-[#13382E] font-semibold"
                  >
                    กรุณาไปส่งที่โรงแรมนี้ (PLEASE TAKE US TO THIS HOTEL):
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1F1A16] leading-snug">
                    {activeHotel.thaiName}
                  </div>
                  <div className="text-lg sm:text-xl font-medium text-[#1F1A16] leading-relaxed pt-1 border-t border-[#1F1A16]/15">
                    {activeHotel.thaiAddress}
                  </div>
                  {activeHotel.thaiDirectionsNote && (
                    <div className="text-sm sm:text-base text-[#A8442A] font-medium pt-1">
                      หมายเหตุ: {activeHotel.thaiDirectionsNote}
                    </div>
                  )}
                </div>

                {/* English & Reception Telephone */}
                <div className="space-y-2 text-xs sm:text-sm text-[#4A4036]">
                  <div>
                    <strong>English Address:</strong> {activeHotel.address}
                  </div>
                  <div>
                    <strong>Hotel Reception Phone (พนักงานต้อนรับ):</strong>{" "}
                    <a
                      href={`tel:${activeHotel.phone.replace(/\s+/g, "")}`}
                      className="text-[#13382E] font-bold underline"
                    >
                      {activeHotel.phone}
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 border-t border-[#1F1A16]/15">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `${activeHotel.thaiName} - ${activeHotel.thaiAddress}`,
                        `${activeHotel.name} Thai Address`
                      )
                    }
                    style={monoStyle}
                    className="flex-1 py-3 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.16em] font-semibold cursor-pointer"
                  >
                    Copy Thai Script for Grab
                  </button>
                  <a
                    href={activeHotel.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={monoStyle}
                    className="px-5 py-3 border border-[#1F1A16] text-[#1F1A16] hover:bg-[#1F1A16] hover:text-[#F6F1E7] text-xs uppercase tracking-[0.16em] text-center"
                  >
                    Open Google Maps <ExternalArrow />
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Floating On-The-Ground Quick Utility Desk (Available From Any Tab) */}
      <div className="fixed bottom-5 left-5 z-40">
        {isQuickDeskOpen ? (
          <div className="bg-[#FBF8F3] border-2 border-[#1F1A16] shadow-2xl w-80 sm:w-96 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F1A16]/15 pb-2.5">
              <span
                style={monoStyle}
                className="text-[11px] uppercase tracking-[0.18em] text-[#13382E] font-bold"
              >
                QUICK POCKET DESK (THB &bull; PNR &bull; TAXI)
              </span>
              <button
                type="button"
                onClick={() => setIsQuickDeskOpen(false)}
                style={monoStyle}
                className="px-2 py-0.5 bg-[#EFE7D8] border border-[#1F1A16]/20 text-[11px] text-[#1F1A16] cursor-pointer"
              >
                CLOSE &#10005;
              </button>
            </div>

            {/* Instant Mini Currency Converter */}
            <div className="space-y-1.5">
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71] block"
              >
                INSTANT CURRENCY (1 GBP &approx; {tripState.exchangeRate} THB)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#EFE7D8]/70 border border-[#1F1A16]/20 px-2.5 py-1.5">
                  <label
                    style={monoStyle}
                    className="text-[10px] uppercase text-[#5C5248] block"
                  >
                    THB (&#3647;)
                  </label>
                  <input
                    type="number"
                    aria-label="Quick THB input"
                    value={thbInput}
                    onChange={(e) => handleThbChange(e.target.value)}
                    style={serifStyle}
                    className="w-full bg-transparent text-lg font-semibold text-[#1F1A16] focus:outline-none"
                  />
                </div>
                <div className="bg-[#EFE7D8]/70 border border-[#1F1A16]/20 px-2.5 py-1.5">
                  <label
                    style={monoStyle}
                    className="text-[10px] uppercase text-[#5C5248] block"
                  >
                    GBP (&pound;)
                  </label>
                  <input
                    type="number"
                    aria-label="Quick GBP input"
                    value={gbpInput}
                    onChange={(e) => handleGbpChange(e.target.value)}
                    style={serifStyle}
                    className="w-full bg-transparent text-lg font-semibold text-[#13382E] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* One-Tap Booking Reference Ciphers */}
            <div className="space-y-1.5 pt-2 border-t border-[#1F1A16]/15">
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71] block"
              >
                TAP TO COPY BOOKING CIPHER
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "LGW→BKK", code: "6I8SOP" },
                  { label: "BKK→HKT", code: "2GXDQP" },
                  { label: "HKT→LGW", code: "6LDREI" },
                  { label: "Shangri-La", code: "12891938794" },
                  { label: "Pavilions", code: "78165SH099776" },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() =>
                      handleCopy(item.code, `${item.label} (${item.code})`)
                    }
                    style={monoStyle}
                    className="px-2.5 py-1.5 bg-[#F6F1E7] border border-[#1F1A16]/20 hover:border-[#13382E] text-left text-[11px] flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-[#5C5248]">{item.label}</span>
                    <span className="font-bold text-[#13382E]">{item.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Show Driver Thai Script Triggers */}
            <div className="space-y-1.5 pt-2 border-t border-[#1F1A16]/15">
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71] block"
              >
                SHOW TAXI DRIVER (THAI SCRIPT)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {HOTEL_BOOKINGS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setDriverModalHotelId(h.id)}
                    style={monoStyle}
                    className="py-2 px-2.5 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[10px] uppercase tracking-wider text-center cursor-pointer"
                  >
                    {h.name.includes("Shangri-La")
                      ? "Shangri-La (Thai)"
                      : "Pavilions (Thai)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#1F1A16]/15">
              <button
                type="button"
                onClick={() => {
                  setIsQuickDeskOpen(false);
                  setIsChangeLogOpen(true);
                }}
                style={monoStyle}
                className="w-full py-2 px-2.5 bg-[#EFE7D8] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] border border-[#1F1A16]/25 text-[10px] uppercase tracking-wider text-center cursor-pointer transition-colors"
              >
                View Folio Change Log ({(tripState.changeLog || []).length})
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsQuickDeskOpen(true)}
            style={monoStyle}
            className="px-4 py-3 bg-[#1F1A16] hover:bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B] shadow-xl text-[11px] uppercase tracking-[0.16em] font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            title="Open Quick Currency Converter, PNR Ciphers & Thai Taxi Cards"
          >
            <span className="text-[#D8B979]">&#3647;</span>
            <span>Quick Desk &bull; PNR &amp; Taxi</span>
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        {/* ===================================================================
            EDITORIAL MASTHEAD & ARCHITECTURAL METADATA LEDGER
           =================================================================== */}
        <header className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-[#1F1A16]/20 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-[#A8442A] text-[#FBF8F3] text-[10px] uppercase tracking-[0.22em] font-semibold">
                  Celebrating Naana&apos;s Birthday
                </span>
              </div>

              <h1
                style={serifStyle}
                className="text-5xl sm:text-7xl font-normal tracking-tight text-[#1F1A16] leading-[0.98]"
              >
                Thailand 2027 Escape
              </h1>

              <div className="text-base sm:text-lg text-[#4A4036] max-w-2xl leading-relaxed font-normal pt-1 space-y-1">
                <p>
                  <strong>{TRIP_METADATA.datesDisplay}</strong>
                </p>
                <p>
                  Three nights on the royal riverfront at{" "}
                  <span
                    style={serifStyle}
                    className="italic font-semibold text-xl text-[#A8442A]"
                  >
                    Shangri-La Bangkok
                  </span>
                </p>
                <p>
                  Five nights in a private hilltop sanctuary at{" "}
                  <span
                    style={serifStyle}
                    className="italic font-semibold text-xl text-[#13382E]"
                  >
                    The Pavilions Phuket
                  </span>
                  .
                </p>
              </div>

              {/* Minimalist Route List */}
              <ul
                style={monoStyle}
                className="flex flex-col gap-1.5 pt-2 text-[11px] uppercase tracking-[0.14em] text-[#5C5248]"
              >
                <li className="text-[#1F1A16] font-semibold">
                  LGW &rarr; SHJ &rarr; BKK
                </li>
                <li>CHAO PHRAYA RIVER (05&ndash;08 FEB)</li>
                <li className="text-[#1F1A16] font-semibold">
                  BKK &rarr; HKT
                </li>
                <li>LAYAN HILLS, PHUKET (08&ndash;13 FEB)</li>
                <li className="text-[#1F1A16] font-semibold">
                  HKT &rarr; SHJ &rarr; LGW
                </li>
              </ul>
            </div>

            {/* Right Column: Sculptural Countdown & Readiness Dossier Box */}
            <div className="lg:col-span-4 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 relative">
              {/* Double-line inner frame accent */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F1A16]/15">
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
                >
                  CHRONOMETER
                </span>
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.16em] text-[#13382E] font-semibold"
                >
                  ALL RESERVATIONS VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-[#1F1A16]/15 text-center my-2">
                <div className="px-2">
                  <div
                    style={chronometerDigitalStyle}
                    className="text-4xl sm:text-5xl font-bold text-[#1F1A16] leading-none"
                  >
                    {countdown.days}
                  </div>
                  <div
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#8A7E71] mt-1.5"
                  >
                    Days
                  </div>
                </div>
                <div className="px-2">
                  <div
                    style={chronometerDigitalStyle}
                    className="text-4xl sm:text-5xl font-bold text-[#1F1A16] leading-none"
                  >
                    {countdown.hours}
                  </div>
                  <div
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#8A7E71] mt-1.5"
                  >
                    Hours
                  </div>
                </div>
                <div className="px-2">
                  <div
                    style={chronometerDigitalStyle}
                    className="text-4xl sm:text-5xl font-bold text-[#1F1A16] leading-none"
                  >
                    {countdown.minutes}
                  </div>
                  <div
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#8A7E71] mt-1.5"
                  >
                    Mins
                  </div>
                </div>
              </div>

              <p
                style={serifStyle}
                className="italic text-center text-sm text-[#5C5248] mt-3 pb-4 border-b border-[#1F1A16]/15"
              >
                {countdown.statusLabel}
              </p>

              {/* Readiness Ink Bar */}
              <div className="pt-4 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#5C5248]"
                  >
                    DOSSIER READINESS
                  </span>
                  <span
                    style={monoStyle}
                    className="text-xs font-semibold text-[#13382E]"
                  >
                    {overallReadinessPct}% COMPLETE
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E5DEC9] overflow-hidden">
                  <div
                    className="h-full bg-[#13382E] transition-all duration-500"
                    style={{ width: `${overallReadinessPct}%` }}
                  />
                </div>
                <div
                  style={monoStyle}
                  className="flex justify-between text-[11px] text-[#5C5248] pt-1.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("prep");
                      setTimeout(() => {
                        document
                          .getElementById("prep-protocol-section")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 50);
                    }}
                    className="px-2 py-1 border border-transparent hover:border-[#1F1A16]/25 hover:bg-[#EFE7D8] hover:text-[#13382E] transition-colors cursor-pointer underline decoration-[#1F1A16]/30 underline-offset-4"
                    title="Jump to Pre-Departure Clearance Ledger (Step III)"
                  >
                    PREP {prepProgress.done}/{prepProgress.total}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("prep");
                      setTimeout(() => {
                        document
                          .getElementById("essential-apps-section")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 50);
                    }}
                    className="px-2 py-1 border border-transparent hover:border-[#1F1A16]/25 hover:bg-[#EFE7D8] hover:text-[#13382E] transition-colors cursor-pointer underline decoration-[#1F1A16]/30 underline-offset-4"
                    title="Jump to Essential Applications Directory (Step III)"
                  >
                    APPS {appsProgress.done}/{appsProgress.total}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("packing");
                      setTimeout(() => {
                        document
                          .getElementById("trunk-ledger-section")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 50);
                    }}
                    className="px-2 py-1 border border-transparent hover:border-[#1F1A16]/25 hover:bg-[#EFE7D8] hover:text-[#13382E] transition-colors cursor-pointer underline decoration-[#1F1A16]/30 underline-offset-4"
                    title="Jump to The Trunk Ledger (Step IV)"
                  >
                    PACKING {packingProgress.done}/{packingProgress.total}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Sticky Editorial Table of Contents / Step Navigation + Quick Date Strip */}
        <div
          id="step-content-anchor"
          className="sticky top-0 z-30 mb-8 bg-[#F6F1E7]/95 backdrop-blur-md border-y border-[#1F1A16]/20 shadow-[0_4px_16px_rgba(31,26,22,0.06)]"
        >
          <nav
            aria-label="Trip Dashboard Views"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#1F1A16]/15 bg-[#FBF8F3]/90"
          >
            {[
              {
                id: "itinerary" as ActiveTab,
                numeral: "I",
                label: "Itinerary & Plan",
                sub: "Eleven-Day Chronicle",
              },
              {
                id: "bookings" as ActiveTab,
                numeral: "II",
                label: "Bookings Vault",
                sub: "Tickets & Residences",
              },
              {
                id: "prep" as ActiveTab,
                numeral: "III",
                label: "Prep & Apps",
                sub: `${prepProgress.done + appsProgress.done}/${
                  prepProgress.total + appsProgress.total
                } Verified`,
              },
              {
                id: "packing" as ActiveTab,
                numeral: "IV",
                label: "Packing Studio",
                sub: `${packingProgress.done}/${packingProgress.total} Packed`,
              },
              {
                id: "guide" as ActiveTab,
                numeral: "V",
                label: "Field Guide & SOS",
                sub: "Dispatches & 1155",
              },
              {
                id: "budget" as ActiveTab,
                numeral: "VI",
                label: "Budget & THB",
                sub: "+£72.65 Surplus",
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex flex-col items-start justify-between p-3 sm:p-4 text-left transition-colors cursor-pointer relative ${
                    isActive
                      ? "bg-[#13382E] text-[#F6F1E7]"
                      : "hover:bg-[#EFE7D8]/80 text-[#1F1A16]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      style={serifStyle}
                      className={`italic text-xs sm:text-sm ${
                        isActive ? "text-[#D8B979]" : "text-[#9E7B3B]"
                      }`}
                    >
                      Step {tab.numeral}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D8B979]" />
                    )}
                  </div>
                  <span
                    style={serifStyle}
                    className="text-lg sm:text-xl font-semibold leading-tight tracking-tight"
                  >
                    {tab.label}
                  </span>
                  <span
                    style={monoStyle}
                    className={`text-[11px] uppercase tracking-[0.14em] mt-1 ${
                      isActive ? "text-[#F6F1E7]/75" : "text-[#8A7E71]"
                    }`}
                  >
                    {tab.sub}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Compact Sticky Date Ruler when viewing Step I */}
          {activeTab === "itinerary" && (
            <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 bg-[#EFE7D8]/85 border-t border-[#1F1A16]/15">
              <button
                type="button"
                onClick={() => setSelectedDayNum(null)}
                style={monoStyle}
                className={`shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                  selectedDayNum === null
                    ? "bg-[#A8442A] text-[#FBF8F3] border-[#A8442A] font-semibold"
                    : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/15 hover:border-[#1F1A16]"
                }`}
              >
                Full Spread
              </button>
              {TRIP_DAYS.map((d) => {
                const isSelected = selectedDayNum === d.dayNumber;
                return (
                  <button
                    key={d.dayNumber}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDayNum(null);
                      } else {
                        setSelectedDayNum(d.dayNumber);
                      }
                    }}
                    style={monoStyle}
                    className={`shrink-0 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E] font-semibold"
                        : "bg-[#FBF8F3] text-[#4A4036] border-[#1F1A16]/15 hover:border-[#1F1A16]"
                    }`}
                  >
                    D{formatDayNumber(d.dayNumber)} &bull; {d.shortDate}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================================================================
            STEP I: ITINERARY & DAY-BY-DAY PLANNER
           =================================================================== */}
        {activeTab === "itinerary" && (
          <section className="space-y-10">
            {/* Editorial Filter Header */}
            <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[11px] uppercase tracking-[0.22em] text-[#A8442A] font-semibold"
                  >
                    STEP I &bull; THE DAILY CHRONICLE
                  </span>
                  <h2
                    style={serifStyle}
                    className="text-3xl sm:text-4xl font-normal text-[#1F1A16] mt-1"
                  >
                    Interactive Day-by-Day Itinerary &amp; Romantic Planner
                  </h2>
                  <p className="text-sm text-[#5C5248] mt-1">
                    Strike off completed movements, adopt curated concierge
                    notes from the left margin, or inscribe your own bespoke
                    reservations.
                  </p>
                </div>

                {/* Phase Filter Pills & Expand/Collapse Actions */}
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "All 11 Days" },
                      { id: "outbound", label: "I. Outbound" },
                      { id: "bangkok", label: "II. Bangkok (3N)" },
                      { id: "transfer", label: "III. Island Transfer" },
                      { id: "phuket", label: "IV. Phuket (5N)" },
                      { id: "return", label: "V. Return" },
                    ].map((pf) => {
                      const active =
                        phaseFilter === pf.id && selectedDayNum === null;
                      return (
                        <button
                          key={pf.id}
                          type="button"
                          onClick={() => {
                            setPhaseFilter(pf.id as PhaseFilter);
                            setSelectedDayNum(null);
                          }}
                          className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.12em] border transition-colors cursor-pointer ${
                            active
                              ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16] font-semibold"
                              : "bg-transparent text-[#5C5248] border-[#1F1A16]/20 hover:border-[#1F1A16]"
                          }`}
                        >
                          {pf.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={jumpToActiveOrFirstDay}
                      style={monoStyle}
                      className="px-3 py-1 text-[11px] uppercase tracking-[0.14em] bg-[#13382E]/10 text-[#13382E] border border-[#13382E]/30 hover:bg-[#13382E] hover:text-[#F6F1E7] transition-colors cursor-pointer"
                    >
                      Jump to Current / Departure Day
                    </button>
                    <button
                      type="button"
                      onClick={toggleAllDaysCollapsed}
                      style={monoStyle}
                      className="px-3 py-1 text-[11px] uppercase tracking-[0.14em] bg-[#EFE7D8] text-[#5C5248] border border-[#1F1A16]/20 hover:text-[#1F1A16] hover:border-[#1F1A16] transition-colors cursor-pointer"
                    >
                      {allDaysCollapsed ? "Expand All Days" : "Collapse All Days"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Spreads for Each Day */}
            <div className="space-y-8">
              {filteredDays.map((day) => {
                const customActs =
                  tripState.customActivitiesByDay[day.dayNumber] || [];
                const rawActivities = [...day.defaultActivities, ...customActs];
                const allDayActivities = rawActivities
                  .map((act, idx) => ({
                    act,
                    sortKey: parseActivitySortMinutes(act.time, idx),
                    idx,
                  }))
                  .sort((a, b) =>
                    a.sortKey !== b.sortKey
                      ? a.sortKey - b.sortKey
                      : a.idx - b.idx
                  )
                  .map((entry) => entry.act);

                const completedDayCount = allDayActivities.filter((a) =>
                  tripState.completedActivityIds.includes(a.id)
                ).length;
                const isDayCollapsed = collapsedDayNums.includes(day.dayNumber);

                return (
                  <article
                    id={`day-card-${day.dayNumber}`}
                    key={day.dayNumber}
                    className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 shadow-[0_2px_12px_rgba(31,26,22,0.04)]"
                  >
                    {/* Compact Top Day Accordion Header when Collapsed */}
                    {isDayCollapsed ? (
                      <div className="p-5 sm:p-6 bg-[#EFE7D8]/50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-baseline gap-3 sm:gap-5">
                          <span
                            style={serifStyle}
                            className="text-2xl sm:text-3xl font-normal text-[#A8442A]"
                          >
                            Day {formatDayNumber(day.dayNumber)}
                          </span>
                          <span
                            style={monoStyle}
                            className="text-[11px] uppercase tracking-[0.15em] text-[#5C5248]"
                          >
                            {day.dateLabel}
                          </span>
                          <span
                            style={monoStyle}
                            className="px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] bg-[#13382E] text-[#F6F1E7]"
                          >
                            {day.locationBadge}
                          </span>
                          <h3
                            style={serifStyle}
                            className="text-xl sm:text-2xl font-normal text-[#1F1A16]"
                          >
                            {day.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            style={monoStyle}
                            className="text-[11px] uppercase tracking-[0.14em] text-[#5C5248]"
                          >
                            {completedDayCount}/{allDayActivities.length} DONE
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleDayCollapsed(day.dayNumber)}
                            style={monoStyle}
                            className="px-3 py-1.5 bg-[#FBF8F3] border border-[#1F1A16]/25 hover:border-[#1F1A16] text-[11px] uppercase tracking-[0.14em] text-[#1F1A16] cursor-pointer"
                          >
                            Expand Day +
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1F1A16]/15">
                        {/* Left Column (4 cols): Day Title, Atmosphere, Weather & Curated Margin Suggestions */}
                        <div className="lg:col-span-4 p-6 sm:p-8 bg-[#EFE7D8]/45 flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-baseline justify-between border-b border-[#1F1A16]/15 pb-3">
                              <span
                                style={serifStyle}
                                className="text-4xl sm:text-5xl font-normal text-[#A8442A]"
                              >
                                Day {formatDayNumber(day.dayNumber)}
                              </span>
                              <div className="flex items-center gap-2">
                                <span
                                  style={monoStyle}
                                  className="text-[11px] uppercase tracking-[0.16em] text-[#5C5248]"
                                >
                                  {day.dateLabel}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleDayCollapsed(day.dayNumber)
                                  }
                                  style={monoStyle}
                                  title="Collapse this day card"
                                  className="px-2 py-0.5 bg-[#FBF8F3] border border-[#1F1A16]/20 hover:border-[#1F1A16] text-[10px] uppercase tracking-wider text-[#5C5248] hover:text-[#1F1A16] cursor-pointer"
                                >
                                  Collapse &ndash;
                                </button>
                              </div>
                            </div>

                          <div
                            style={monoStyle}
                            className="inline-block px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-[#13382E] text-[#F6F1E7]"
                          >
                            {day.locationBadge}
                          </div>

                          <h3
                            style={serifStyle}
                            className="text-2xl sm:text-3xl font-normal text-[#1F1A16] leading-snug"
                          >
                            {day.title}
                          </h3>

                          <p
                            style={serifStyle}
                            className="italic text-base text-[#5C5248] leading-relaxed"
                          >
                            &ldquo;{day.vibe}&rdquo;
                          </p>

                          <div className="pt-2 space-y-2 border-t border-[#1F1A16]/10 text-xs text-[#4A4036]">
                            <div className="flex items-start gap-2">
                              <span
                                style={monoStyle}
                                className="text-[10px] uppercase tracking-wider text-[#8A7E71] w-20 shrink-0"
                              >
                                CLIMATE
                              </span>
                              <span>{day.weatherSummary}</span>
                            </div>
                            {day.accommodation && (
                              <div className="flex items-start gap-2">
                                <span
                                  style={monoStyle}
                                  className="text-[10px] uppercase tracking-wider text-[#8A7E71] w-20 shrink-0"
                                >
                                  RESIDENCE
                                </span>
                                <span className="font-semibold text-[#13382E]">
                                  {day.accommodation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Curated Concierge Suggestions */}
                        {day.quickSuggestions &&
                          day.quickSuggestions.length > 0 && (
                            <div className="pt-5 border-t border-[#1F1A16]/15 space-y-2.5">
                              <p
                                style={monoStyle}
                                className="text-[10px] uppercase tracking-[0.18em] text-[#8A7E71]"
                              >
                                SUGGESTIONS (TAP TO INSCRIBE)
                              </p>
                              <div className="space-y-2.5">
                                {day.quickSuggestions.map((sug, idx) => {
                                  const sugKey = `${day.dayNumber}-${idx}`;
                                  const isInfoOpen =
                                    openSuggestionInfoKey === sugKey;
                                  const matchedCustomAct = customActs.find(
                                    (a) => a.title === sug.title
                                  );
                                  const alreadyAdded = Boolean(matchedCustomAct);
                                  return (
                                    <div
                                      key={sugKey}
                                      className={`border transition-colors ${
                                        alreadyAdded
                                          ? "bg-[#13382E]/8 border-[#13382E]/30"
                                          : "bg-[#FBF8F3] border-[#1F1A16]/15 hover:border-[#A8442A]"
                                      }`}
                                    >
                                      <div className="flex items-stretch justify-between gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (matchedCustomAct) {
                                              removeCustomActivity(
                                                day.dayNumber,
                                                matchedCustomAct.id
                                              );
                                            } else {
                                              addCustomActivity(day.dayNumber, {
                                                time: sug.time,
                                                title: sug.title,
                                                category: sug.category,
                                                location: sug.location,
                                                notes: sug.notes,
                                                mapUrl:
                                                  sug.serviceLinks?.[0]?.url,
                                              });
                                            }
                                          }}
                                          className="flex-1 text-left p-2.5 text-xs cursor-pointer"
                                        >
                                          <span
                                            style={monoStyle}
                                            className="text-[10px] uppercase tracking-wider text-[#A8442A] block mb-0.5"
                                          >
                                            {alreadyAdded
                                              ? "✓ INSCRIBED (TAP TO UNDO)"
                                              : `+ ADD AT ${sug.time}`}
                                          </span>
                                          <span
                                            className={`font-medium leading-snug block ${
                                              alreadyAdded
                                                ? "text-[#13382E]"
                                                : "text-[#1F1A16]"
                                            }`}
                                          >
                                            {sug.title}
                                          </span>
                                        </button>

                                        {(sug.bookingGuide ||
                                          (sug.serviceLinks &&
                                            sug.serviceLinks.length > 0)) && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setOpenSuggestionInfoKey(
                                                isInfoOpen ? null : sugKey
                                              )
                                            }
                                            style={monoStyle}
                                            aria-expanded={isInfoOpen}
                                            title="How to book & service links"
                                            className={`px-2.5 border-l border-[#1F1A16]/15 text-[10px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                                              isInfoOpen
                                                ? "bg-[#1F1A16] text-[#F6F1E7]"
                                                : "bg-[#EFE7D8]/60 text-[#5C5248] hover:text-[#1F1A16] hover:bg-[#EFE7D8]"
                                            }`}
                                          >
                                            {isInfoOpen ? "CLOSE" : "INFO"}
                                          </button>
                                        )}
                                      </div>

                                      {/* Quick Direct Service Links Row */}
                                      {sug.serviceLinks &&
                                        sug.serviceLinks.length > 0 && (
                                          <div className="px-2.5 pb-2 pt-1 border-t border-[#1F1A16]/10 flex flex-wrap items-center gap-x-3 gap-y-1">
                                            {sug.serviceLinks.map((lnk) => (
                                              <a
                                                key={lnk.url}
                                                href={lnk.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={monoStyle}
                                                className="text-[10px] uppercase tracking-wider text-[#13382E] hover:text-[#A8442A] underline font-semibold inline-flex items-center"
                                              >
                                                <span>{lnk.label}</span>
                                                <ExternalArrow />
                                              </a>
                                            ))}
                                          </div>
                                        )}

                                      {/* Expandable Booking Guide Tooltip / Popup Drawer */}
                                      {isInfoOpen && sug.bookingGuide && (
                                        <div className="p-3 bg-[#EFE7D8] border-t border-[#1F1A16]/20 text-xs text-[#1F1A16] space-y-2">
                                          <div
                                            style={monoStyle}
                                            className="text-[10px] uppercase tracking-[0.16em] text-[#A8442A] font-semibold"
                                          >
                                            HOW TO BOOK &amp; ACCESS
                                          </div>
                                          <p className="leading-relaxed text-[#4A4036]">
                                            {sug.bookingGuide}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Right Column (8 cols): Chronological Schedule & Custom Entry Form */}
                      <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                        <div className="divide-y divide-[#1F1A16]/12">
                          {allDayActivities.map((act) => {
                            const isDone =
                              tripState.completedActivityIds.includes(act.id);
                            const style =
                              CATEGORY_EDITORIAL_STYLES[act.category];
                            return (
                              <div
                                key={act.id}
                                className={`py-4 first:pt-0 last:pb-0 flex items-start gap-4 transition-opacity ${
                                  isDone ? "opacity-55" : ""
                                }`}
                              >
                                {/* Editorial Ink Checkbox */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleActivityCompleted(act.id)
                                  }
                                  aria-label={`Mark ${act.title} as ${
                                    isDone ? "incomplete" : "complete"
                                  }`}
                                  className={`mt-1 w-5 h-5 border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                    isDone
                                      ? "bg-[#13382E] border-[#13382E] text-[#F6F1E7] text-xs"
                                      : "border-[#1F1A16]/40 hover:border-[#1F1A16] bg-[#F6F1E7]"
                                  }`}
                                >
                                  {isDone ? "✓" : ""}
                                </button>

                                {editingActivityId === act.id ? (
                                  <form
                                    onSubmit={(e) =>
                                      saveEditedActivity(
                                        e,
                                        day.dayNumber,
                                        act.id
                                      )
                                    }
                                    className="flex-1 bg-[#EFE7D8]/90 border border-[#1F1A16]/25 p-4 space-y-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        style={monoStyle}
                                        className="text-[11px] uppercase tracking-[0.16em] text-[#13382E] font-semibold"
                                      >
                                        EDIT ENTRY
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingActivityId(null)
                                        }
                                        className="text-xs text-[#5C5248] hover:text-[#1F1A16] underline cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                      <input
                                        type="text"
                                        value={editActTime}
                                        onChange={(e) =>
                                          setEditActTime(e.target.value)
                                        }
                                        placeholder="Time (e.g. 19:30 ICT)"
                                        className="bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-1.5 text-xs sm:text-sm text-[#1F1A16]"
                                      />
                                      <input
                                        type="text"
                                        required
                                        value={editActTitle}
                                        onChange={(e) =>
                                          setEditActTitle(e.target.value)
                                        }
                                        placeholder="Activity title..."
                                        className="sm:col-span-2 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-1.5 text-xs sm:text-sm text-[#1F1A16]"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                      <select
                                        value={editActCategory}
                                        onChange={(e) =>
                                          setEditActCategory(
                                            e.target
                                              .value as ItineraryActivity["category"]
                                          )
                                        }
                                        className="bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-1.5 text-xs sm:text-sm text-[#1F1A16]"
                                      >
                                        <option value="romance">
                                          Celebration &amp; Romance
                                        </option>
                                        <option value="dining">
                                          Gastronomy
                                        </option>
                                        <option value="beach">
                                          Andaman Coast
                                        </option>
                                        <option value="spa">
                                          Sanctuary &amp; Spa
                                        </option>
                                        <option value="culture">
                                          Heritage &amp; Temple
                                        </option>
                                        <option value="transit">Passage</option>
                                        <option value="custom">
                                          Bespoke Note
                                        </option>
                                      </select>
                                      <input
                                        type="text"
                                        value={editActLocation}
                                        onChange={(e) =>
                                          setEditActLocation(e.target.value)
                                        }
                                        placeholder="Venue / Location"
                                        className="bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-1.5 text-xs sm:text-sm text-[#1F1A16]"
                                      />
                                      <input
                                        type="text"
                                        value={editActNotes}
                                        onChange={(e) =>
                                          setEditActNotes(e.target.value)
                                        }
                                        placeholder="Dress code or note"
                                        className="bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-1.5 text-xs sm:text-sm text-[#1F1A16]"
                                      />
                                    </div>
                                    <button
                                      type="submit"
                                      style={monoStyle}
                                      className="px-4 py-1.5 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[11px] uppercase tracking-[0.16em] cursor-pointer"
                                    >
                                      Save Changes
                                    </button>
                                  </form>
                                ) : (
                                  <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                      <span
                                        style={monoStyle}
                                        className="text-xs font-semibold text-[#A8442A]"
                                      >
                                        {act.time}
                                      </span>
                                      <span
                                        style={monoStyle}
                                        className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border ${style.tag}`}
                                      >
                                        {style.label}
                                      </span>
                                      {act.isLocked && (
                                        <span
                                          style={monoStyle}
                                          className="text-[10px] uppercase tracking-[0.14em] text-[#8A7E71]"
                                        >
                                          &bull; CONFIRMED LOGISTICS
                                        </span>
                                      )}
                                    </div>

                                    <h4
                                      style={serifStyle}
                                      className={`text-xl sm:text-2xl font-medium ${
                                        isDone
                                          ? "line-through text-[#8A7E71]"
                                          : "text-[#1F1A16]"
                                      }`}
                                    >
                                      {act.title}
                                    </h4>

                                    {act.subtitle && (
                                      <p className="text-xs sm:text-sm text-[#5C5248]">
                                        {act.subtitle}
                                      </p>
                                    )}

                                    {act.notes && (
                                      <div className="text-xs text-[#4A4036] bg-[#EFE7D8]/70 border-l-2 border-[#9E7B3B] pl-3 py-2 mt-1.5">
                                        {act.notes}
                                      </div>
                                    )}

                                    <div
                                      style={monoStyle}
                                      className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#5C5248]"
                                    >
                                      {act.location && (
                                        <span>LOC: {act.location}</span>
                                      )}
                                      {act.mapUrl && (
                                        <a
                                          href={act.mapUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[#13382E] hover:text-[#A8442A] underline font-medium"
                                        >
                                          VIEW CARTOGRAPHY <ExternalArrow />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {!act.isLocked &&
                                  act.id.startsWith("custom-") &&
                                  editingActivityId !== act.id && (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          startEditingActivity(act)
                                        }
                                        style={monoStyle}
                                        className="text-[10px] uppercase tracking-wider text-[#5C5248] hover:text-[#13382E] px-2 py-1 border border-[#1F1A16]/15 hover:border-[#13382E] bg-[#EFE7D8]/50 cursor-pointer"
                                        title="Edit entry"
                                      >
                                        EDIT
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeCustomActivity(
                                            day.dayNumber,
                                            act.id
                                          )
                                        }
                                        className="text-xs text-[#8A7E71] hover:text-[#A8442A] px-2 py-1 cursor-pointer"
                                        title="Remove custom entry"
                                      >
                                        &#10005;
                                      </button>
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Add Custom Activity Drawer */}
                        <div className="pt-4 border-t border-[#1F1A16]/15">
                          {addingToDay === day.dayNumber ? (
                            <form
                              onSubmit={(e) =>
                                handleAddActivitySubmit(e, day.dayNumber)
                              }
                              className="bg-[#EFE7D8]/80 border border-[#1F1A16]/25 p-5 space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  style={monoStyle}
                                  className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#13382E]"
                                >
                                  INSCRIBE NEW ENTRY FOR {day.shortDate}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setAddingToDay(null)}
                                  className="text-xs text-[#5C5248] hover:text-[#1F1A16] underline"
                                >
                                  Close
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  value={newActTime}
                                  onChange={(e) =>
                                    setNewActTime(e.target.value)
                                  }
                                  placeholder="Time (e.g. 19:30 ICT)"
                                  className="bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-sm text-[#1F1A16]"
                                />
                                <input
                                  type="text"
                                  required
                                  value={newActTitle}
                                  onChange={(e) =>
                                    setNewActTitle(e.target.value)
                                  }
                                  placeholder="Reservation, excursion, or birthday note..."
                                  className="sm:col-span-2 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-sm text-[#1F1A16]"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <select
                                  value={newActCategory}
                                  onChange={(e) =>
                                    setNewActCategory(
                                      e.target
                                        .value as ItineraryActivity["category"]
                                    )
                                  }
                                  className="bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-sm text-[#1F1A16]"
                                >
                                  <option value="romance">
                                    Celebration &amp; Romance
                                  </option>
                                  <option value="dining">Gastronomy</option>
                                  <option value="beach">Andaman Coast</option>
                                  <option value="spa">
                                    Sanctuary &amp; Spa
                                  </option>
                                  <option value="culture">
                                    Heritage &amp; Temple
                                  </option>
                                  <option value="transit">Passage</option>
                                  <option value="custom">Bespoke Note</option>
                                </select>
                                <input
                                  type="text"
                                  value={newActLocation}
                                  onChange={(e) =>
                                    setNewActLocation(e.target.value)
                                  }
                                  placeholder="Venue / Location"
                                  className="bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-sm text-[#1F1A16]"
                                />
                                <input
                                  type="text"
                                  value={newActNotes}
                                  onChange={(e) =>
                                    setNewActNotes(e.target.value)
                                  }
                                  placeholder="Dress code or concierge note"
                                  className="bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-sm text-[#1F1A16]"
                                />
                              </div>
                              <button
                                type="submit"
                                style={monoStyle}
                                className="px-5 py-2.5 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.16em] cursor-pointer"
                              >
                                Save to Day {day.dayNumber}
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAddingToDay(day.dayNumber)}
                              style={monoStyle}
                              className="text-[11px] uppercase tracking-[0.16em] text-[#13382E] hover:text-[#A8442A] font-semibold flex items-center gap-2 cursor-pointer"
                            >
                              <span>+ INSCRIBE BESPOKE RESERVATION OR NOTE</span>
                              <span>&rarr;</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ===================================================================
            STEP II: BOOKINGS & RESERVATIONS VAULT (PERFORATED PASSES)
           =================================================================== */}
        {activeTab === "bookings" && (
          <section className="space-y-12">
            {/* Master Reference Ledger Strip */}
            <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 mb-5 border-b border-[#1F1A16]/15">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.22em] text-[#A8442A] font-semibold"
                  >
                    STEP II &bull; CONFIRMED DOSSIER CREDENTIALS
                  </span>
                  <h2
                    style={serifStyle}
                    className="text-3xl font-normal text-[#1F1A16] mt-0.5"
                  >
                    Instant Booking Reference Index
                  </h2>
                </div>
                <span
                  style={serifStyle}
                  className="italic text-sm text-[#5C5248]"
                >
                  Tap any reservation cipher to copy directly to your clipboard
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#1F1A16]/15 border border-[#1F1A16]/15 bg-[#F6F1E7]/60">
                {[
                  {
                    label: "Outbound Aviation",
                    code: "6I8SOP",
                    sub: "Air Arabia • LGW → BKK",
                  },
                  {
                    label: "Bangkok Residence",
                    code: "12891938794",
                    sub: "Shangri-La • 3 Nights",
                  },
                  {
                    label: "Domestic Aviation",
                    code: "2GXDQP",
                    sub: "Vietjet VZ306 • BKK → HKT",
                  },
                  {
                    label: "Phuket Sanctuary",
                    code: "78165SH099776",
                    sub: "The Pavilions • 5 Nights",
                  },
                  {
                    label: "Return Aviation",
                    code: "6LDREI",
                    sub: "Air Arabia • HKT → LGW",
                  },
                ].map((ref) => (
                  <button
                    key={ref.code}
                    type="button"
                    onClick={() =>
                      handleCopy(ref.code, `${ref.label} (${ref.code})`)
                    }
                    className="p-4 text-left hover:bg-[#EFE7D8] transition-colors group cursor-pointer flex flex-col justify-between"
                  >
                    <span
                      style={monoStyle}
                      className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71]"
                    >
                      {ref.label}
                    </span>
                    <div className="flex items-baseline justify-between w-full my-1.5">
                      <span
                        style={monoStyle}
                        className="text-lg font-bold text-[#13382E] group-hover:text-[#A8442A]"
                      >
                        {ref.code}
                      </span>
                      <span
                        style={monoStyle}
                        className="text-[10px] uppercase tracking-wider text-[#8A7E71] group-hover:text-[#1F1A16]"
                      >
                        [COPY]
                      </span>
                    </div>
                    <span className="text-xs text-[#5C5248]">{ref.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tactile Perforated Paper Boarding Passes */}
            <div className="space-y-6">
              <div className="border-b border-[#1F1A16]/20 pb-2">
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
                >
                  SECTION 01 &bull; AVIATION MANIFEST
                </span>
                <h3
                  style={serifStyle}
                  className="text-3xl font-normal text-[#1F1A16]"
                >
                  Confirmed Flight Coupons
                </h3>
              </div>

              {FLIGHT_BOOKINGS.map((flight) => (
                <div
                  key={flight.id}
                  className="relative bg-[#FBF8F3] border border-[#1F1A16]/25 shadow-[0_4px_20px_rgba(31,26,22,0.05)] overflow-hidden"
                >
                  {/* Ticket Punch-Out Semicircles on Left & Right Edges */}
                  <div className="hidden lg:block absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F6F1E7] border border-[#1F1A16]/25" />
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F6F1E7] border border-[#1F1A16]/25" />

                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Left Main Ticket Body (9 cols) */}
                    <div className="lg:col-span-9 p-6 sm:p-8 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
                        <div>
                          <span
                            style={monoStyle}
                            className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
                          >
                            {flight.direction}
                          </span>
                          <h4
                            style={serifStyle}
                            className="text-2xl sm:text-3xl font-normal text-[#1F1A16]"
                          >
                            {flight.airline} &mdash;{" "}
                            <span className="italic text-[#5C5248]">
                              {flight.fareClass}
                            </span>
                          </h4>
                        </div>
                        <div className="text-right">
                          <span
                            style={monoStyle}
                            className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71] block"
                          >
                            VERIFIED SETTLEMENT
                          </span>
                          <span
                            style={monoStyle}
                            className="text-sm font-semibold text-[#13382E]"
                          >
                            {flight.totalPaidDisplay} &bull;{" "}
                            {flight.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Flight Segments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {flight.segments.map((seg) => (
                          <div
                            key={seg.flightNumber}
                            className="bg-[#EFE7D8]/55 border border-[#1F1A16]/15 p-5 space-y-4"
                          >
                            <div
                              style={monoStyle}
                              className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#5C5248] border-b border-[#1F1A16]/10 pb-2"
                            >
                              <span className="font-bold text-[#1F1A16]">
                                FLIGHT {seg.flightNumber}
                              </span>
                              <span>DURATION {seg.duration}</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div
                                  style={serifStyle}
                                  className="text-4xl font-normal text-[#1F1A16]"
                                >
                                  {seg.fromCode}
                                </div>
                                <div className="text-xs text-[#5C5248] mt-0.5">
                                  {seg.fromCity}
                                </div>
                                <div
                                  style={monoStyle}
                                  className="text-xs font-semibold text-[#A8442A] mt-2"
                                >
                                  {seg.depTime}
                                </div>
                                <div
                                  style={monoStyle}
                                  className="text-[10px] text-[#8A7E71]"
                                >
                                  {seg.depDate}
                                </div>
                              </div>

                              <div className="flex-1 flex flex-col items-center px-2">
                                <div className="w-full border-t border-dashed border-[#1F1A16]/35 relative">
                                  <span
                                    style={serifStyle}
                                    className="italic text-xs text-[#8A7E71] bg-[#EFE7D8] px-2 absolute -top-2.5 left-1/2 -translate-x-1/2"
                                  >
                                    non-stop
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div
                                  style={serifStyle}
                                  className="text-4xl font-normal text-[#1F1A16]"
                                >
                                  {seg.toCode}
                                </div>
                                <div className="text-xs text-[#5C5248] mt-0.5">
                                  {seg.toCity}
                                </div>
                                <div
                                  style={monoStyle}
                                  className="text-xs font-semibold text-[#13382E] mt-2"
                                >
                                  {seg.arrTime}
                                </div>
                                <div
                                  style={monoStyle}
                                  className="text-[10px] text-[#8A7E71]"
                                >
                                  {seg.arrDate}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {flight.layover && (
                        <div
                          style={monoStyle}
                          className="px-4 py-2.5 bg-[#F6F1E7] border-l-2 border-[#A8442A] text-xs text-[#4A4036]"
                        >
                          TRANSIT CONNECTION: {flight.layover}
                        </div>
                      )}

                      {/* Passenger Seat & Baggage Assignments (Domestic Vietjet) */}
                      {flight.passengerDetails && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {flight.passengerDetails.map((pax) => (
                            <div
                              key={pax.name}
                              className="p-4 bg-[#F6F1E7] border border-[#1F1A16]/15 flex items-center justify-between"
                            >
                              <div>
                                <div
                                  style={serifStyle}
                                  className="text-lg font-semibold text-[#1F1A16]"
                                >
                                  {pax.name}
                                </div>
                                <div
                                  style={monoStyle}
                                  className="text-[11px] text-[#5C5248] mt-0.5"
                                >
                                  {pax.checkedBag} &bull; {pax.cabinBag}
                                </div>
                              </div>
                              <span
                                style={monoStyle}
                                className="px-3 py-1 bg-[#13382E] text-[#F6F1E7] text-xs font-semibold"
                              >
                                Seat {pax.seat}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Included Perks */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {flight.farePerks.map((perk) => (
                          <span
                            key={perk}
                            style={monoStyle}
                            className="text-[11px] px-3 py-1 bg-[#EFE7D8] text-[#4A4036] border border-[#1F1A16]/15"
                          >
                            &#10003; {perk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Perforated Tear-Off Stub (3 cols) */}
                    <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l-2 border-dashed border-[#1F1A16]/25 bg-[#EFE7D8]/70 p-6 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <span
                          style={monoStyle}
                          className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71] block"
                        >
                          PASSENGER COUPON / PNR
                        </span>
                        <div
                          style={monoStyle}
                          className="text-3xl font-bold tracking-wider text-[#13382E] border-y border-[#1F1A16]/15 py-3"
                        >
                          {flight.pnr}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(flight.pnr, `PNR ${flight.pnr}`)
                          }
                          style={monoStyle}
                          className="w-full py-2.5 bg-[#1F1A16] hover:bg-[#A8442A] text-[#F6F1E7] text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer"
                        >
                          Copy PNR Reference
                        </button>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-[#1F1A16]/15">
                        <a
                          href={flight.manageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={monoStyle}
                          className="block w-full text-center py-2.5 border border-[#1F1A16] text-[#1F1A16] hover:bg-[#1F1A16] hover:text-[#F6F1E7] text-[11px] uppercase tracking-[0.16em] transition-colors"
                        >
                          Manage Airline Portal <ExternalArrow />
                        </a>
                        {flight.extraLinks.map((lnk) => (
                          <a
                            key={lnk.url}
                            href={lnk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={monoStyle}
                            className="block w-full text-center py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#5C5248] hover:text-[#A8442A] underline"
                          >
                            {lnk.label} <ExternalArrow />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Luxury Hotel Stationery Dossiers */}
            <div className="space-y-6">
              <div className="border-b border-[#1F1A16]/20 pb-2">
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
                >
                  SECTION 02 &bull; SANCTUARIES &amp; RESIDENCES
                </span>
                <h3
                  style={serifStyle}
                  className="text-3xl font-normal text-[#1F1A16]"
                >
                  Confirmed Five-Star Accommodations
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {HOTEL_BOOKINGS.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-[#FBF8F3] border border-[#1F1A16]/25 p-6 sm:p-8 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-4 border-b border-[#1F1A16]/15 pb-4">
                        <div>
                          <span
                            style={monoStyle}
                            className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
                          >
                            {hotel.city} &bull; {hotel.nights} NIGHTS
                          </span>
                          <h4
                            style={serifStyle}
                            className="text-3xl sm:text-4xl font-normal text-[#1F1A16] mt-1"
                          >
                            {hotel.name}
                          </h4>
                          <p
                            style={serifStyle}
                            className="italic text-base text-[#5C5248]"
                          >
                            {hotel.dates}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              hotel.bookingRef,
                              `${hotel.name} Ref (${hotel.bookingRef})`
                            )
                          }
                          style={monoStyle}
                          className="px-3 py-2 bg-[#EFE7D8] border border-[#1F1A16]/25 text-xs font-bold text-[#13382E] hover:border-[#1F1A16] shrink-0 cursor-pointer"
                        >
                          REF: {hotel.bookingRef}
                        </button>
                      </div>

                      {/* Architectural Spec Box */}
                      <div className="bg-[#EFE7D8]/50 border border-[#1F1A16]/15 p-4 space-y-2">
                        <div
                          style={serifStyle}
                          className="text-xl font-semibold text-[#1F1A16]"
                        >
                          {hotel.roomCategory}
                        </div>
                        {hotel.roomDescription && (
                          <p className="text-xs text-[#4A4036] leading-relaxed">
                            {hotel.roomDescription}
                          </p>
                        )}
                        <div
                          style={monoStyle}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1F1A16]/10 text-[11px] text-[#5C5248]"
                        >
                          <span>CHECK-IN: {hotel.checkIn}</span>
                          <span>CHECK-OUT: {hotel.checkOut}</span>
                        </div>
                      </div>

                      {/* Financial Ledger Box */}
                      <div className="border border-[#13382E]/30 bg-[#13382E]/5 p-4 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span
                            style={monoStyle}
                            className="text-[10px] uppercase tracking-[0.16em] text-[#5C5248]"
                          >
                            CONFIRMED TARIFF
                          </span>
                          <span
                            style={monoStyle}
                            className="text-sm font-bold text-[#13382E]"
                          >
                            THB {hotel.totalThb.toLocaleString()} (~£
                            {hotel.totalGbp.toFixed(2)})
                          </span>
                        </div>
                        <p className="text-xs text-[#5C5248]">
                          {hotel.paymentNote}
                        </p>

                        {hotel.balanceDueThb > 0 && (
                          <label className="flex items-center gap-2.5 pt-2.5 border-t border-[#13382E]/20 text-xs text-[#1F1A16] font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tripState.pavilionsBalancePaid}
                              onChange={() =>
                                updateTripState(
                                  (prev) => ({
                                    ...prev,
                                    pavilionsBalancePaid:
                                      !prev.pavilionsBalancePaid,
                                  }),
                                  {
                                    section: "bookings",
                                    action: tripState.pavilionsBalancePaid
                                      ? "Reopened airport transfer balance"
                                      : "Settled airport transfer balance",
                                    detail:
                                      "The Pavilions Phuket • THB 1,190.00 (~£26.75)",
                                  }
                                )
                              }
                              className="w-4 h-4 accent-[#13382E]"
                            />
                            <span>
                              {tripState.pavilionsBalancePaid
                                ? "✓ Remaining THB 1,190.00 Airport Transfer Balance Settled"
                                : "Mark THB 1,190.00 (~£26.75) Airport Transfer Balance as Settled"}
                            </span>
                          </label>
                        )}
                      </div>

                      {/* Property Highlights */}
                      <ul className="space-y-2 text-xs sm:text-sm text-[#4A4036]">
                        {hotel.highlights.map((hl) => (
                          <li key={hl} className="flex items-start gap-2.5">
                            <span className="text-[#9E7B3B] mt-0.5">
                              &diams;
                            </span>
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Coordinates & Chauffeur Copy Actions */}
                    <div className="pt-4 border-t border-[#1F1A16]/15 space-y-3">
                      <div className="text-xs text-[#5C5248]">
                        {hotel.address}{" "}
                        <span
                          style={monoStyle}
                          className="text-[11px] text-[#8A7E71] block mt-0.5"
                        >
                          GEO: {hotel.coordinates} &bull; TEL: {hotel.phone}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDriverModalHotelId(hotel.id)}
                          style={monoStyle}
                          className="px-4 py-2 bg-[#A8442A] hover:bg-[#8F351E] text-[#FBF8F3] text-[11px] uppercase tracking-[0.15em] font-semibold cursor-pointer"
                        >
                          Show Driver (Thai Script)
                        </button>
                        <a
                          href={hotel.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={monoStyle}
                          className="px-4 py-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[11px] uppercase tracking-[0.15em]"
                        >
                          Open Google Maps <ExternalArrow />
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(hotel.address, `${hotel.name} Address`)
                          }
                          style={monoStyle}
                          className="px-4 py-2 border border-[#1F1A16]/30 hover:border-[#1F1A16] text-[#1F1A16] text-[11px] uppercase tracking-[0.15em] cursor-pointer"
                        >
                          Copy Chauffeur / Grab Address
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================
            STEP III: ENTRY PROTOCOL, BANKING & DIGITAL CONCIERGE
           =================================================================== */}
        {activeTab === "prep" && (
          <section className="space-y-10">
            {/* Pre-Trip Protocol Checklist */}
            <div
              id="prep-protocol-section"
              className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.22em] text-[#A8442A] font-semibold"
                  >
                    STEP III &bull; ENTRY &amp; IMMIGRATION PROTOCOL
                  </span>
                  <h2
                    style={serifStyle}
                    className="text-3xl sm:text-4xl font-normal text-[#1F1A16] mt-1"
                  >
                    Pre-Departure Clearance Ledger
                  </h2>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: "all", label: "All" },
                    { id: "both", label: "Joint" },
                    { id: "shaq", label: "Shaq" },
                    { id: "naana", label: "Naana" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setPrepAssigneeFilter(
                          f.id as "all" | "both" | "shaq" | "naana"
                        )
                      }
                      style={monoStyle}
                      className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] border cursor-pointer ${
                        prepAssigneeFilter === f.id
                          ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                          : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[#1F1A16]/15">
                {PREP_CHECKLIST.filter(
                  (item) =>
                    prepAssigneeFilter === "all" ||
                    item.assignee === prepAssigneeFilter
                ).map((item) => {
                  const isDone = tripState.completedPrepIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`py-4 first:pt-0 last:pb-0 flex items-start gap-4 cursor-pointer transition-opacity ${
                        isDone ? "opacity-60" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => togglePrepItem(item.id)}
                        className="mt-1.5 w-4 h-4 accent-[#13382E]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            style={serifStyle}
                            className={`text-xl font-medium ${
                              isDone
                                ? "line-through text-[#8A7E71]"
                                : "text-[#1F1A16]"
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.urgentTag && (
                            <span
                              style={monoStyle}
                              className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 bg-[#A8442A]/12 text-[#A8442A] border border-[#A8442A]/30"
                            >
                              {item.urgentTag}
                            </span>
                          )}
                          <span
                            style={monoStyle}
                            className="text-[10px] uppercase tracking-[0.14em] text-[#8A7E71]"
                          >
                            [{item.assignee}]
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#5C5248]">
                          {item.detail}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Framed Editorial Callouts: ATM Golden Rule & SuperRich Exchange */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#EFE7D8] border-2 border-[#1F1A16] p-6 space-y-3">
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
                >
                  MONETARY ADVISORY I &bull; THAI ATMS
                </span>
                <h3
                  style={serifStyle}
                  className="text-2xl sm:text-3xl font-normal text-[#1F1A16]"
                >
                  Always Choose “Without Conversion”
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4036] leading-relaxed">
                  Thai ATMs levy a mandatory{" "}
                  <strong>220 THB flat fee (~£4.94)</strong> per foreign card
                  withdrawal. Always decline the machine&apos;s dynamic currency
                  conversion and select{" "}
                  <strong className="underline text-[#13382E]">
                    &ldquo;Continue Without Conversion&rdquo;
                  </strong>{" "}
                  so your zero-FX UK bank (Monzo, Starling, Revolut, Chase)
                  sets the interbank exchange rate.
                </p>
              </div>

              <div className="bg-[#FBF8F3] border border-[#1F1A16]/25 p-6 space-y-3">
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#13382E] font-semibold"
                >
                  MONETARY ADVISORY II &bull; CURRENCY DESK
                </span>
                <h3
                  style={serifStyle}
                  className="text-2xl sm:text-3xl font-normal text-[#1F1A16]"
                >
                  SuperRich (Orange or Green Booths)
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4036] leading-relaxed">
                  Thailand remains cash-essential for street markets, longtail
                  boats, tipping, and beach kiosks. Exchange crisp UK £20/£50
                  sterling notes at <strong>SuperRich</strong> in the{" "}
                  <strong>
                    basement (Floor B) of Suvarnabhumi Airport (adjacent to the
                    Airport Rail Link)
                  </strong>{" "}
                  or major BTS stations.
                </p>
              </div>
            </div>

            {/* Digital Concierge & Essential Apps Directory */}
            <div
              id="essential-apps-section"
              className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#1F1A16]/15">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.22em] text-[#8A7E71]"
                  >
                    DIGITAL UTILITIES DIRECTORY
                  </span>
                  <h2
                    style={serifStyle}
                    className="text-3xl font-normal text-[#1F1A16] mt-0.5"
                  >
                    Essential Applications to Configure Before Departure
                  </h2>
                </div>
                <span
                  style={monoStyle}
                  className="text-xs font-semibold text-[#13382E]"
                >
                  {appsProgress.done} OF {appsProgress.total} CONFIGURED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ESSENTIAL_APPS.map((app) => {
                  const installed = tripState.installedAppIds.includes(app.id);
                  return (
                    <label
                      key={app.id}
                      className={`p-5 border cursor-pointer transition-colors flex items-start gap-4 ${
                        installed
                          ? "bg-[#13382E]/6 border-[#13382E]/35"
                          : "bg-[#F6F1E7]/70 border-[#1F1A16]/15 hover:border-[#1F1A16]/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={installed}
                        onChange={() => toggleAppInstalled(app.id)}
                        className="mt-1.5 w-4 h-4 accent-[#13382E]"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            style={serifStyle}
                            className="text-xl font-semibold text-[#1F1A16]"
                          >
                            {app.name}
                          </span>
                          <span
                            style={monoStyle}
                            className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 bg-[#EFE7D8] text-[#5C5248] border border-[#1F1A16]/15"
                          >
                            {app.badge}
                          </span>
                        </div>
                        <div
                          style={monoStyle}
                          className="text-[10px] uppercase tracking-[0.16em] text-[#A8442A]"
                        >
                          {app.category}
                        </div>
                        <p className="text-xs text-[#4A4036] leading-relaxed">
                          {app.description}
                        </p>
                        <p className="text-xs text-[#5C5248] italic pt-1 border-t border-[#1F1A16]/10">
                          Note: {app.proTip}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================
            STEP IV: THE WARDROBE, ETIQUETTE & TRUNKS
           =================================================================== */}
        {activeTab === "packing" && (
          <section className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Climate Monograph */}
              <div className="lg:col-span-5 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 space-y-4">
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
                >
                  METEOROLOGICAL PROFILE &bull; FEBRUARY
                </span>
                <h2
                  style={serifStyle}
                  className="text-3xl font-normal text-[#1F1A16]"
                >
                  Dry Season Sunshine
                </h2>
                <p className="text-xs sm:text-sm text-[#5C5248] leading-relaxed">
                  February represents Thailand&apos;s dry, calm zenith &mdash;
                  translucent seas and uninterrupted sunshine across both legs.
                </p>

                <div className="divide-y divide-[#1F1A16]/15 border-t border-[#1F1A16]/15 pt-2">
                  <div className="py-3">
                    <div className="flex justify-between items-baseline">
                      <span
                        style={serifStyle}
                        className="text-xl font-semibold text-[#1F1A16]"
                      >
                        Bangkok (05&ndash;08 Feb)
                      </span>
                      <span
                        style={monoStyle}
                        className="text-xs font-semibold text-[#A8442A]"
                      >
                        32°C&ndash;34°C / 24°C Night
                      </span>
                    </div>
                    <p className="text-xs text-[#5C5248] mt-1">
                      Tropical urban warmth. Favour unlined linen, lightweight
                      cotton, and bamboo weaves.
                    </p>
                  </div>

                  <div className="py-3">
                    <div className="flex justify-between items-baseline">
                      <span
                        style={serifStyle}
                        className="text-xl font-semibold text-[#1F1A16]"
                      >
                        Phuket (08&ndash;13 Feb)
                      </span>
                      <span
                        style={monoStyle}
                        className="text-xs font-semibold text-[#13382E]"
                      >
                        31°C&ndash;33°C / 25°C Night
                      </span>
                    </div>
                    <p className="text-xs text-[#5C5248] mt-1">
                      Coastal trade winds.{" "}
                      <strong className="text-[#A8442A]">
                        UV Index 10&ndash;11 (Extreme)
                      </strong>{" "}
                      &mdash; SPF 50+ and polarized lenses are mandatory.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sartorial & Dress Code Lookbook */}
              <div className="lg:col-span-7 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1F1A16]/15 pb-4">
                  <div>
                    <span
                      style={monoStyle}
                      className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
                    >
                      SARTORIAL ETIQUETTE
                    </span>
                    <h2
                      style={serifStyle}
                      className="text-3xl font-normal text-[#1F1A16]"
                    >
                      Dress Code Lookbook
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "temple", label: "Temple Rules" },
                      { id: "rooftop", label: "Rooftop & Fine Dining" },
                      { id: "daytime", label: "Daytime City" },
                      { id: "beach", label: "Phuket Resort" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setDressCodeTab(
                            t.id as "temple" | "rooftop" | "daytime" | "beach"
                          )
                        }
                        style={monoStyle}
                        className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] border cursor-pointer ${
                          dressCodeTab === t.id
                            ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                            : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {dressCodeTab === "temple" && (
                  <div className="p-5 bg-[#EFE7D8]/70 border-l-2 border-[#A8442A] space-y-2.5 text-xs sm:text-sm">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      Strictly Enforced at Grand Palace, Wat Pho &amp; Wat Arun
                    </div>
                    <ul className="space-y-1.5 text-[#4A4036] list-disc pl-5">
                      <li>
                        <strong>
                          Shoulders and knees must be completely covered
                        </strong>{" "}
                        for both gentlemen and ladies.
                      </li>
                      <li>
                        <strong>Prohibited:</strong> Sleeveless tops, tank tops,
                        crop tops, sheer fabrics, shorts, or tight athletic
                        leggings.
                      </li>
                      <li>
                        <strong>Daypack Essential:</strong> Carry a lightweight
                        linen overshirt or sarong in your daypack.
                      </li>
                      <li>
                        <strong>Footwear:</strong> Slip-on loafers or sandals
                        (footwear is removed before entering sacred halls).
                      </li>
                    </ul>
                  </div>
                )}

                {dressCodeTab === "rooftop" && (
                  <div className="p-5 bg-[#EFE7D8]/70 border-l-2 border-[#13382E] space-y-2.5 text-xs sm:text-sm">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      Smart Casual for Bangkok Sky-Bars (Lebua, Vertigo,
                      Mahanakhon) &amp; Fine Dining
                    </div>
                    <ul className="space-y-1.5 text-[#4A4036] list-disc pl-5">
                      <li>
                        <strong>Shaq (Gentlemen):</strong> Collared linen
                        shirts, tailored lightweight chinos/trousers, and{" "}
                        <strong className="text-[#1F1A16] underline">
                          closed-toe loafers or clean smart sneakers
                        </strong>{" "}
                        (sky-bars strictly refuse flip-flops, athletic shorts,
                        and sleeveless vests).
                      </li>
                      <li>
                        <strong>Naana (Ladies):</strong> Maxi/midi evening
                        dresses, tailored jumpsuits, or elevated resort
                        separates.
                      </li>
                    </ul>
                  </div>
                )}

                {dressCodeTab === "daytime" && (
                  <div className="p-5 bg-[#EFE7D8]/70 border-l-2 border-[#9E7B3B] space-y-2.5 text-xs sm:text-sm">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      Bangkok Riverfront &amp; Daytime Sightseeing
                    </div>
                    <ul className="space-y-1.5 text-[#4A4036] list-disc pl-5">
                      <li>
                        Prioritize breathable natural fibres: linen, fine
                        cotton, and bamboo.
                      </li>
                      <li>
                        Avoid heavy denim or unbreathable synthetics in 34°C
                        humidity.
                      </li>
                      <li>
                        Keep pocket tissues, wet wipes, and Dioralyte
                        electrolyte sachets in your day bag.
                      </li>
                    </ul>
                  </div>
                )}

                {dressCodeTab === "beach" && (
                  <div className="p-5 bg-[#EFE7D8]/70 border-l-2 border-[#13382E] space-y-2.5 text-xs sm:text-sm">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      The Pavilions Phuket, Layan Beach &amp; Bang Tao Clubs
                    </div>
                    <ul className="space-y-1.5 text-[#4A4036] list-disc pl-5">
                      <li>
                        Multiple swimwear rotations, linen beach cover-ups,
                        polarized UV sunglasses, and wide-brimmed sunhats.
                      </li>
                      <li>
                        Reef-safe SPF 50+ sunscreen brought from London (resort
                        sun care carries a steep premium).
                      </li>
                      <li>
                        10L dry bag and waterproof phone pouch for Banana Beach
                        and longtail boat charters.
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* The Trunk Ledger (Categorized Packing List) */}
            <div
              id="trunk-ledger-section"
              className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
                  >
                    BAGGAGE ALLOWANCE: AIR ARABIA 20KG + 10KG &bull; VIETJET
                    25KG (SHAQ) / 30KG (NAANA) + 7KG
                  </span>
                  <h3
                    style={serifStyle}
                    className="text-3xl font-normal text-[#1F1A16] mt-1"
                  >
                    The Trunk Ledger ({packingProgress.done}/
                    {packingProgress.total} Packed)
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "all", label: "All" },
                    { id: "both", label: "Shared" },
                    { id: "shaq", label: "Shaq" },
                    { id: "naana", label: "Naana" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setPackingOwnerFilter(
                          f.id as "all" | "both" | "shaq" | "naana"
                        )
                      }
                      style={monoStyle}
                      className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] border cursor-pointer ${
                        packingOwnerFilter === f.id
                          ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                          : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowUnpackedOnly(!showUnpackedOnly)}
                    style={monoStyle}
                    className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] border cursor-pointer ${
                      showUnpackedOnly
                        ? "bg-[#A8442A] text-[#FBF8F3] border-[#A8442A]"
                        : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                    }`}
                  >
                    {showUnpackedOnly ? "Showing Unpacked" : "Unpacked Only"}
                  </button>
                </div>
              </div>

              {/* Add Custom Packing Item Form */}
              <form
                onSubmit={handleAddPackingSubmit}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#EFE7D8]/60 p-4 border border-[#1F1A16]/15"
              >
                <input
                  type="text"
                  value={newPackLabel}
                  onChange={(e) => setNewPackLabel(e.target.value)}
                  placeholder="Add a custom item to pack (e.g. 35mm film camera, linen evening shawl)..."
                  className="sm:col-span-6 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-xs sm:text-sm text-[#1F1A16]"
                />
                <select
                  value={newPackCategory}
                  onChange={(e) =>
                    setNewPackCategory(
                      e.target.value as PackingItem["category"]
                    )
                  }
                  className="sm:col-span-3 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-xs text-[#1F1A16]"
                >
                  <option value="Daytime & Temple Wear">
                    Daytime &amp; Temple Wear
                  </option>
                  <option value="Evening & Fine Dining">
                    Evening &amp; Fine Dining
                  </option>
                  <option value="Resort & Beach (Phuket)">
                    Resort &amp; Beach (Phuket)
                  </option>
                  <option value="Health & Pharmacy">
                    Health &amp; Pharmacy
                  </option>
                  <option value="Toiletries & Sun Care">
                    Toiletries &amp; Sun Care
                  </option>
                  <option value="Electronics & Power">
                    Electronics &amp; Power
                  </option>
                  <option value="Carry-On & Documents">
                    Carry-On &amp; Documents
                  </option>
                </select>
                <select
                  value={newPackForWho}
                  onChange={(e) =>
                    setNewPackForWho(e.target.value as PackingItem["forWho"])
                  }
                  className="sm:col-span-2 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-xs text-[#1F1A16]"
                >
                  <option value="both">Shared</option>
                  <option value="shaq">Shaq</option>
                  <option value="naana">Naana</option>
                </select>
                <button
                  type="submit"
                  style={monoStyle}
                  className="sm:col-span-1 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] font-semibold text-xs uppercase tracking-wider py-2 cursor-pointer"
                >
                  + Add
                </button>
              </form>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(
                  [
                    "Daytime & Temple Wear",
                    "Evening & Fine Dining",
                    "Resort & Beach (Phuket)",
                    "Health & Pharmacy",
                    "Toiletries & Sun Care",
                    "Electronics & Power",
                    "Carry-On & Documents",
                  ] as PackingItem["category"][]
                ).map((cat) => {
                  const items = allPackingItems.filter((item) => {
                    if (item.category !== cat) return false;
                    if (
                      packingOwnerFilter !== "all" &&
                      item.forWho !== packingOwnerFilter
                    )
                      return false;
                    if (
                      showUnpackedOnly &&
                      tripState.packedItemIds.includes(item.id)
                    )
                      return false;
                    return true;
                  });

                  if (items.length === 0) return null;

                  return (
                    <div
                      key={cat}
                      className="bg-[#F6F1E7]/70 border border-[#1F1A16]/15 p-5 space-y-3"
                    >
                      <h4
                        style={serifStyle}
                        className="text-xl font-semibold text-[#1F1A16] border-b border-[#1F1A16]/15 pb-2"
                      >
                        {cat}
                      </h4>
                      <div className="divide-y divide-[#1F1A16]/10">
                        {items.map((item) => {
                          const isPacked = tripState.packedItemIds.includes(
                            item.id
                          );
                          return (
                            <div
                              key={item.id}
                              className={`py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-2 ${
                                isPacked ? "opacity-55" : ""
                              }`}
                            >
                              <label className="flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={isPacked}
                                  onChange={() => togglePackingItem(item.id)}
                                  className="mt-1 w-4 h-4 accent-[#13382E]"
                                />
                                <div className="flex-1 text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`font-semibold text-sm ${
                                        isPacked
                                          ? "line-through text-[#8A7E71]"
                                          : "text-[#1F1A16]"
                                      }`}
                                    >
                                      {item.label}
                                    </span>
                                    {item.forWho !== "both" && (
                                      <span
                                        style={monoStyle}
                                        className="px-1.5 py-0.5 bg-[#EFE7D8] border border-[#1F1A16]/15 text-[#A8442A] text-[11px] uppercase tracking-wider"
                                      >
                                        {item.forWho}
                                      </span>
                                    )}
                                  </div>
                                  {item.note && (
                                    <p className="text-[#5C5248] mt-0.5">
                                      {item.note}
                                    </p>
                                  )}
                                </div>
                              </label>
                              {item.id.startsWith("custom-pack-") && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeCustomPackingItem(item.id)
                                  }
                                  className="text-xs text-[#8A7E71] hover:text-[#A8442A] px-2 py-1 shrink-0 cursor-pointer"
                                  title="Remove custom packing item"
                                  aria-label={`Remove ${item.label}`}
                                >
                                  &#10005;
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================
            STEP V: FIELD DISPATCHES & CONSULAR SOS
           =================================================================== */}
        {activeTab === "guide" && (
          <section className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bangkok Field Dispatch */}
              <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-5">
                <div className="border-b border-[#1F1A16]/15 pb-3">
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
                  >
                    DISPATCH 01 &bull; BANGKOK (05&ndash;08 FEB)
                  </span>
                  <h2
                    style={serifStyle}
                    className="text-3xl font-normal text-[#1F1A16] mt-1"
                  >
                    Suvarnabhumi Arrival &amp; River Transit
                  </h2>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#4A4036]">
                  <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-2">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      I. Arrival Protocol at BKK (Fri 05 Feb @ 17:05)
                    </div>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>
                        Clear immigration (present saved TDAC QR code) and
                        reclaim checked luggage.
                      </li>
                      <li>
                        <strong>Sterling Exchange:</strong> Descend to{" "}
                        <strong>Floor B (Airport Rail Link level)</strong> for
                        SuperRich Orange/Green booths.
                      </li>
                      <li>
                        <strong>Chauffeur / Grab:</strong> Proceed to{" "}
                        <strong>Level 1 (Ground)</strong> for metered public
                        taxis, or <strong>Level 4, Door 4</strong> for Grab
                        pickup.
                      </li>
                      <li>
                        Transfer to Shangri-La Bangkok takes{" "}
                        <strong>~40&ndash;50 mins via Sirat Expressway</strong>{" "}
                        (~400&ndash;500 THB + expressway tolls).
                      </li>
                    </ol>
                  </div>

                  <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-2">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      II. Navigating from Shangri-La Bangkok
                    </div>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>
                        <strong>BTS Skytrain:</strong> Direct 2-minute walk to{" "}
                        <strong>Saphan Taksin Station</strong> (Silom Line) for
                        Siam, Silom, and Sukhumvit.
                      </li>
                      <li>
                        <strong>Chao Phraya Express Boats:</strong> Embark at
                        adjacent <strong>Sathorn Central Pier</strong> for
                        scenic river hops north to Wat Arun, Wat Pho, and the
                        Grand Palace.
                      </li>
                      <li>
                        <strong>ICONSIAM &amp; Asiatique:</strong> Board the{" "}
                        <strong>complimentary Shangri-La shuttle boat</strong>{" "}
                        from Sathorn Pier directly to ICONSIAM &amp; SookSiam.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Phuket Field Dispatch */}
              <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-5">
                <div className="border-b border-[#1F1A16]/15 pb-3">
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.2em] text-[#13382E] font-semibold"
                  >
                    DISPATCH 02 &bull; PHUKET (08&ndash;13 FEB)
                  </span>
                  <h2
                    style={serifStyle}
                    className="text-3xl font-normal text-[#1F1A16] mt-1"
                  >
                    The Pavilions Sanctuary &amp; Andaman Coves
                  </h2>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#4A4036]">
                  <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-1.5">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      I. Hilltop Buggy Service &amp; Amenities
                    </div>
                    <p>
                      Summon front-desk golf buggies from your 81 sqm Deluxe
                      Tropical View Suite to move effortlessly between{" "}
                      <strong>Firefly Pool</strong>,{" "}
                      <strong>360 Bar (hilltop sunset)</strong>, and{" "}
                      <strong>Pavilions Spa</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-2">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      II. Curated Coastal Index
                    </div>
                    <ul className="space-y-1.5">
                      <li>
                        &bull; <strong>Layan Beach (5 mins):</strong> Complimentary
                        scheduled resort shuttle. Tranquil, Casuarina-shaded,
                        shallow crystal water.
                      </li>
                      <li>
                        &bull; <strong>Bang Tao Beach (10 mins south):</strong>{" "}
                        Home to premier beach clubs (<em>Catch Beach Club</em>,{" "}
                        <em>Maya Beach Club</em>) and sweeping white sand.
                      </li>
                      <li>
                        &bull; <strong>Banana Beach (12 mins north):</strong>{" "}
                        Secluded romantic cove framed by palms.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-1">
                    <div
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      III. Departure Protocol (Sat 13 Feb)
                    </div>
                    <p>
                      Check out at <strong>12:00 PM</strong> (leave trunks with
                      concierge). Depart for Phuket International Airport (
                      <code>HKT</code>) by <strong>15:30 PM</strong> ahead of
                      Air Arabia flight <code>G9715</code> (18:20 departure).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consular & Emergency Red Book */}
            <div className="bg-[#FBF8F3] border-2 border-[#A8442A] p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#1F1A16]/15 pb-3">
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
                >
                  CRITICAL ASSISTANCE &bull; CONSULAR &amp; MEDICAL DIRECTORY
                </span>
                <h3
                  style={serifStyle}
                  className="text-3xl font-normal text-[#1F1A16] mt-1"
                >
                  Emergency Dispatch &amp; International Hospitals
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {EMERGENCY_CONTACTS.map((c) => (
                  <div
                    key={c.title}
                    className="p-5 bg-[#EFE7D8]/60 border border-[#1F1A16]/20 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <span
                        style={monoStyle}
                        className="text-[10px] uppercase tracking-[0.16em] text-[#A8442A] font-semibold"
                      >
                        {c.badge}
                      </span>
                      <h4
                        style={serifStyle}
                        className="text-2xl font-semibold text-[#1F1A16] mt-1"
                      >
                        {c.title}
                      </h4>
                      <p className="text-xs text-[#5C5248] mt-1">
                        {c.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <a
                        href={c.telHref}
                        style={monoStyle}
                        className="block w-full text-center py-2.5 bg-[#A8442A] hover:bg-[#8F351E] text-[#FBF8F3] text-xs uppercase tracking-[0.16em] font-semibold transition-colors"
                      >
                        Dial {c.number}
                      </a>
                      {c.linkUrl && (
                        <a
                          href={c.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={monoStyle}
                          className="block text-center text-[10px] uppercase tracking-[0.14em] text-[#13382E] underline"
                        >
                          {c.linkLabel} <ExternalArrow />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <h4
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#5C5248] mb-3"
                >
                  ACCREDITED INTERNATIONAL HOSPITALS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {INTERNATIONAL_HOSPITALS.map((hosp) => (
                    <a
                      key={hosp.name}
                      href={hosp.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[#F6F1E7] border border-[#1F1A16]/15 hover:border-[#1F1A16] transition-colors block"
                    >
                      <span
                        style={monoStyle}
                        className="text-[10px] uppercase tracking-[0.15em] text-[#A8442A] font-semibold"
                      >
                        {hosp.city}
                      </span>
                      <div
                        style={serifStyle}
                        className="text-lg font-semibold text-[#1F1A16] mt-1"
                      >
                        {hosp.name} <ExternalArrow />
                      </div>
                      <p className="text-xs text-[#5C5248] mt-1">{hosp.note}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================
            STEP VI: FINANCIAL LEDGER, SURPLUS & CURRENCY BUREAU
           =================================================================== */}
        {activeTab === "budget" && (
          <section className="space-y-10">
            {/* Interactive THB <-> GBP Exchange Bureau */}
            <div className="bg-[#FBF8F3] border border-[#1F1A16]/25 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#1F1A16]/15">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.22em] text-[#A8442A] font-semibold"
                  >
                    STEP VI &bull; CURRENCY BUREAU &amp; FINANCIAL LEDGER
                  </span>
                  <h2
                    style={serifStyle}
                    className="text-3xl sm:text-4xl font-normal text-[#1F1A16] mt-1"
                  >
                    Interactive Baht &amp; Sterling Desk
                  </h2>
                </div>
                <span
                  style={monoStyle}
                  className="text-xs text-[#13382E] font-semibold"
                >
                  BENCHMARK: 1 GBP &approx; {tripState.exchangeRate.toFixed(2)}{" "}
                  THB
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 bg-[#EFE7D8]/70 border border-[#1F1A16]/20 p-5">
                  <label
                    style={monoStyle}
                    className="block text-[10px] uppercase tracking-[0.18em] text-[#5C5248] mb-1"
                  >
                    SIAMESE BAHT (THB &#3647;)
                  </label>
                  <input
                    type="number"
                    value={thbInput}
                    onChange={(e) => handleThbChange(e.target.value)}
                    style={serifStyle}
                    className="w-full bg-transparent text-4xl font-normal text-[#1F1A16] focus:outline-none"
                  />
                </div>

                <div
                  style={serifStyle}
                  className="md:col-span-2 text-center text-3xl italic text-[#8A7E71]"
                >
                  &harr;
                </div>

                <div className="md:col-span-5 bg-[#EFE7D8]/70 border border-[#1F1A16]/20 p-5">
                  <label
                    style={monoStyle}
                    className="block text-[10px] uppercase tracking-[0.18em] text-[#5C5248] mb-1"
                  >
                    BRITISH STERLING (GBP &pound;)
                  </label>
                  <input
                    type="number"
                    value={gbpInput}
                    onChange={(e) => handleGbpChange(e.target.value)}
                    style={serifStyle}
                    className="w-full bg-transparent text-4xl font-normal text-[#13382E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tariff Presets */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "100 THB Market", thb: 100 },
                  { label: "220 THB ATM Levy", thb: 220 },
                  { label: "500 THB BKK Chauffeur", thb: 500 },
                  { label: "1,000 THB (~£22.47)", thb: 1000 },
                  { label: "1,190 THB Pavilions Transfer", thb: 1190 },
                  { label: "3,233 THB (£72.65 Hotel Surplus)", thb: 3233 },
                  { label: "5,000 THB Celebration Dinner", thb: 5000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setQuickThbPreset(preset.thb)}
                    style={monoStyle}
                    className="px-3 py-1.5 bg-[#F6F1E7] border border-[#1F1A16]/15 hover:border-[#1F1A16] text-[11px] text-[#4A4036] hover:text-[#1F1A16] cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Surplus Callout & Master Accounting Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-[#13382E] text-[#F6F1E7] p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.2em] text-[#D8B979]"
                  >
                    ACCOMMODATION SURPLUS
                  </span>
                  <h3
                    style={serifStyle}
                    className="text-3xl sm:text-4xl font-normal text-[#F6F1E7]"
                  >
                    £72.65 Under Budget Surplus!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#F6F1E7]/85 leading-relaxed">
                    Both five-star residences (Shangri-La Bangkok &amp; The
                    Pavilions Phuket) were secured below the £1,405.00 ceiling,
                    yielding a <strong>£72.65 (~3,233 THB)</strong> reserve
                    dedicated to Naana&apos;s birthday gastronomy and spa
                    rituals.
                  </p>
                </div>

                <div
                  style={monoStyle}
                  className="space-y-2 pt-4 border-t border-[#F6F1E7]/20 text-xs"
                >
                  <div className="flex justify-between text-[#F6F1E7]/75">
                    <span>CEILING ALLOCATION:</span>
                    <span>£1,405.00</span>
                  </div>
                  <div className="flex justify-between text-[#F6F1E7]/75">
                    <span>BOOKED (THB 59,304.26):</span>
                    <span>~£1,332.35</span>
                  </div>
                  <div className="flex justify-between text-[#D8B979] font-bold text-sm pt-1">
                    <span>BIRTHDAY RESERVE:</span>
                    <span>+£72.65 (~3,233 THB)</span>
                  </div>
                </div>
              </div>

              {/* Verified Accounting Matrix */}
              <div className="lg:col-span-8 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-4 overflow-x-auto">
                <h3
                  style={serifStyle}
                  className="text-2xl sm:text-3xl font-normal text-[#1F1A16]"
                >
                  Verified Core Infrastructure Ledger
                </h3>
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr
                      style={monoStyle}
                      className="border-b-2 border-[#1F1A16] text-[10px] uppercase tracking-[0.15em] text-[#5C5248]"
                    >
                      <th className="py-2.5 pr-3">Component</th>
                      <th className="py-2.5 px-3">Settled Currency</th>
                      <th className="py-2.5 px-3">Sterling Equivalent</th>
                      <th className="py-2.5 pl-3">Verification &amp; Folio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1A16]/15">
                    {FINANCIAL_MATRIX.map((row) => (
                      <tr key={row.component}>
                        <td className="py-3 pr-3 font-semibold text-[#1F1A16]">
                          {row.component}
                        </td>
                        <td
                          style={monoStyle}
                          className="py-3 px-3 text-[#4A4036]"
                        >
                          {row.currencyAmount}
                        </td>
                        <td
                          style={monoStyle}
                          className="py-3 px-3 font-bold text-[#13382E]"
                        >
                          ~£{row.gbpEquivalent.toFixed(2)}
                        </td>
                        <td className="py-3 pl-3 text-[#5C5248] text-xs">
                          {row.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-b-2 border-[#1F1A16] bg-[#EFE7D8]/70">
                      <td
                        colSpan={2}
                        style={serifStyle}
                        className="py-3.5 pr-3 text-xl font-semibold text-[#1F1A16]"
                      >
                        Grand Total (Confirmed Aviation &amp; Eight Nights
                        Residence)
                      </td>
                      <td
                        style={monoStyle}
                        className="py-3.5 px-3 font-bold text-[#A8442A] text-base"
                      >
                        ~£
                        {TRIP_METADATA.grandTotalGbp.toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        style={monoStyle}
                        className="py-3.5 pl-3 text-[10px] uppercase tracking-wider text-[#5C5248]"
                      >
                        SETTLED IN FULL
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Interactive On-The-Ground Expense Planner */}
            <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#1F1A16]/15">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
                  >
                    BESPOKE DISCRETIONARY LEDGER
                  </span>
                  <h3
                    style={serifStyle}
                    className="text-3xl font-normal text-[#1F1A16] mt-0.5"
                  >
                    On-The-Ground Celebration &amp; Dining Planner
                  </h3>
                </div>
                <div className="text-right">
                  <div
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71]"
                  >
                    PLANNED DISCRETIONARY TOTAL
                  </div>
                  <div
                    style={monoStyle}
                    className="text-base font-bold text-[#13382E]"
                  >
                    THB{" "}
                    {tripState.plannedExpenses
                      .reduce((acc, e) => acc + e.amountThb, 0)
                      .toLocaleString()}{" "}
                    (~£
                    {(
                      tripState.plannedExpenses.reduce(
                        (acc, e) => acc + e.amountThb,
                        0
                      ) / tripState.exchangeRate
                    ).toFixed(2)}
                    )
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleAddExpense}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#EFE7D8]/60 p-4 border border-[#1F1A16]/15"
              >
                <input
                  type="text"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  placeholder="Experience or reservation (e.g. Couples Spa at Pavilions, Catch Beach Club)..."
                  className="sm:col-span-4 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-xs text-[#1F1A16]"
                />
                <input
                  type="number"
                  step="any"
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(e.target.value)}
                  placeholder="Amount"
                  className="sm:col-span-2 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-xs text-[#1F1A16]"
                />
                <select
                  value={newExpCurrency}
                  onChange={(e) =>
                    setNewExpCurrency(e.target.value as "THB" | "GBP")
                  }
                  className="sm:col-span-1 bg-[#FBF8F3] border border-[#1F1A16]/20 px-2 py-2 text-xs text-[#1F1A16]"
                >
                  <option value="THB">THB</option>
                  <option value="GBP">GBP</option>
                </select>
                <select
                  value={newExpCategory}
                  onChange={(e) =>
                    setNewExpCategory(
                      e.target.value as PlannedExpense["category"]
                    )
                  }
                  className="sm:col-span-2 bg-[#FBF8F3] border border-[#1F1A16]/20 px-2 py-2 text-xs text-[#1F1A16]"
                >
                  <option value="Birthday Treat">Birthday Treat</option>
                  <option value="Dining">Dining</option>
                  <option value="Spa & Wellness">Spa &amp; Wellness</option>
                  <option value="Beach & Excursions">Beach &amp; Boats</option>
                  <option value="Transit & Cash">Transit &amp; Cash</option>
                </select>
                <select
                  value={newExpCity}
                  onChange={(e) =>
                    setNewExpCity(
                      e.target.value as "Bangkok" | "Phuket" | "Both"
                    )
                  }
                  className="sm:col-span-1 bg-[#FBF8F3] border border-[#1F1A16]/20 px-2 py-2 text-xs text-[#1F1A16]"
                >
                  <option value="Bangkok">Bangkok</option>
                  <option value="Phuket">Phuket</option>
                  <option value="Both">Both</option>
                </select>
                <button
                  type="submit"
                  style={monoStyle}
                  className="sm:col-span-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] font-semibold text-xs uppercase tracking-wider py-2 cursor-pointer"
                >
                  + Inscribe
                </button>
              </form>

              <div className="divide-y divide-[#1F1A16]/15">
                {tripState.plannedExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={!!exp.isBooked}
                        onChange={() => toggleExpenseBooked(exp.id)}
                        className="w-4 h-4 accent-[#13382E]"
                      />
                      <div>
                        <div
                          style={serifStyle}
                          className="text-xl font-medium text-[#1F1A16]"
                        >
                          {exp.title}
                        </div>
                        <div
                          style={monoStyle}
                          className="text-[10px] uppercase tracking-[0.15em] text-[#5C5248]"
                        >
                          {exp.city} &bull; {exp.category} &bull;{" "}
                          {exp.isBooked ? "SETTLED / RESERVED" : "PLANNED"}
                        </div>
                      </div>
                    </label>
                    <div className="flex items-center gap-4">
                      <div style={monoStyle} className="text-right">
                        <div className="text-sm font-bold text-[#1F1A16]">
                          THB {exp.amountThb.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[#5C5248]">
                          ~£{(exp.amountThb / tripState.exchangeRate).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteExpense(exp.id)}
                        className="text-xs text-[#8A7E71] hover:text-[#A8442A] px-2 py-1 cursor-pointer"
                      >
                        &#10005;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
