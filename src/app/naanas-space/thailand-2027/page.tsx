"use client";

import React, { useState, useEffect, useMemo } from "react";
import NaanasSpaceLayout from "@/components/NaanasSpaceLayout";
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

type PhaseFilter = "all" | "outbound" | "bangkok" | "transfer" | "phuket" | "return";

const STORAGE_KEY = "naanas_space_thailand_2027_v1";

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
};

const CATEGORY_STYLES: Record<
  ItineraryActivity["category"],
  { badge: string; icon: string; label: string }
> = {
  flight: {
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: "✈️",
    label: "Flight",
  },
  hotel: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: "🏨",
    label: "Luxury Stay",
  },
  transit: {
    badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    icon: "🚕",
    label: "Transit",
  },
  dining: {
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    icon: "🍽️",
    label: "Dining",
  },
  culture: {
    badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    icon: "🛕",
    label: "Culture & Temples",
  },
  beach: {
    badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    icon: "🏖️",
    label: "Beach & Sea",
  },
  spa: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: "💆🏽‍♀️",
    label: "Spa & Pool",
  },
  romance: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: "💖",
    label: "Birthday & Romance",
  },
  custom: {
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    icon: "✨",
    label: "Custom Plan",
  },
};

export default function ThailandTripDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("itinerary");
  const [tripState, setTripState] = useState<PersistedTripState>(
    DEFAULT_PERSISTED_STATE
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Itinerary filters & custom activity modal/inline state
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [newActTime, setNewActTime] = useState("19:00 ICT");
  const [newActTitle, setNewActTitle] = useState("");
  const [newActLocation, setNewActLocation] = useState("");
  const [newActCategory, setNewActCategory] =
    useState<ItineraryActivity["category"]>("romance");
  const [newActNotes, setNewActNotes] = useState("");

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
  const [newPackForWho, setNewPackForWho] = useState<PackingItem["forWho"]>("both");

  // Currency converter state
  const [thbInput, setThbInput] = useState<string>("1000");
  const [gbpInput, setGbpInput] = useState<string>(
    (1000 / TRIP_METADATA.exchangeRateBenchmark).toFixed(2)
  );

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
    statusLabel: "Until Takeoff from London Gatwick",
  });

  // Load persisted state from localStorage
  useEffect(() => {
    try {
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
    setIsHydrated(true);
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tripState));
    } catch {
      // Ignore storage errors
    }
  }, [tripState, isHydrated]);

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
          statusLabel: "Until Takeoff • Thu 4 Feb 2027 (16:40 GMT)",
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
          statusLabel: "Live in Thailand! Enjoy Naana's 30th Birthday Trip",
        });
      } else {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          statusLabel: "Completed • Feb 2027 Memories Forever",
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

  // Toggle helpers
  const togglePrepItem = (id: string) => {
    setTripState((prev) => ({
      ...prev,
      completedPrepIds: prev.completedPrepIds.includes(id)
        ? prev.completedPrepIds.filter((item) => item !== id)
        : [...prev.completedPrepIds, id],
    }));
  };

  const toggleAppInstalled = (id: string) => {
    setTripState((prev) => ({
      ...prev,
      installedAppIds: prev.installedAppIds.includes(id)
        ? prev.installedAppIds.filter((item) => item !== id)
        : [...prev.installedAppIds, id],
    }));
  };

  const togglePackingItem = (id: string) => {
    setTripState((prev) => ({
      ...prev,
      packedItemIds: prev.packedItemIds.includes(id)
        ? prev.packedItemIds.filter((item) => item !== id)
        : [...prev.packedItemIds, id],
    }));
  };

  const toggleActivityCompleted = (id: string) => {
    setTripState((prev) => ({
      ...prev,
      completedActivityIds: prev.completedActivityIds.includes(id)
        ? prev.completedActivityIds.filter((item) => item !== id)
        : [...prev.completedActivityIds, id],
    }));
  };

  const addCustomActivity = (
    dayNumber: number,
    activityData: Omit<ItineraryActivity, "id">
  ) => {
    const newActivity: ItineraryActivity = {
      ...activityData,
      id: `custom-${dayNumber}-${Date.now()}`,
    };
    setTripState((prev) => {
      const existing = prev.customActivitiesByDay[dayNumber] || [];
      return {
        ...prev,
        customActivitiesByDay: {
          ...prev.customActivitiesByDay,
          [dayNumber]: [...existing, newActivity],
        },
      };
    });
  };

  const removeCustomActivity = (dayNumber: number, activityId: string) => {
    setTripState((prev) => {
      const existing = prev.customActivitiesByDay[dayNumber] || [];
      return {
        ...prev,
        customActivitiesByDay: {
          ...prev.customActivitiesByDay,
          [dayNumber]: existing.filter((a) => a.id !== activityId),
        },
      };
    });
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
    setTripState((prev) => ({
      ...prev,
      customPackingItems: [...prev.customPackingItems, item],
    }));
    setNewPackLabel("");
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
    setTripState((prev) => ({
      ...prev,
      plannedExpenses: [...prev.plannedExpenses, exp],
    }));
    setNewExpTitle("");
    setNewExpAmount("");
  };

  const toggleExpenseBooked = (id: string) => {
    setTripState((prev) => ({
      ...prev,
      plannedExpenses: prev.plannedExpenses.map((e) =>
        e.id === id ? { ...e, isBooked: !e.isBooked } : e
      ),
    }));
  };

  const deleteExpense = (id: string) => {
    setTripState((prev) => ({
      ...prev,
      plannedExpenses: prev.plannedExpenses.filter((e) => e.id !== id),
    }));
  };

  const filteredDays = useMemo(() => {
    return TRIP_DAYS.filter((day) => {
      if (selectedDayNum !== null) return day.dayNumber === selectedDayNum;
      if (phaseFilter === "all") return true;
      return day.phase === phaseFilter;
    });
  }, [phaseFilter, selectedDayNum]);

  return (
    <NaanasSpaceLayout
      showBackLink
      backHref="/naanas-space"
      backLabel="Back to Naana's Space"
      maxWidthClass="max-w-6xl"
    >
      {/* Floating Copy Feedback Toast */}
      {copiedText && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-2xl shadow-emerald-500/30 animate-bounce"
        >
          <span>✓</span>
          <span>Copied: {copiedText}</span>
        </div>
      )}

      {/* Romantic Hero Banner */}
      <header className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-slate-900/95 via-[#13111c] to-purple-950/60 p-6 sm:p-10 mb-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide">
              <span>🎂 Celebrating Naana&apos;s 30th Birthday</span>
              <span className="opacity-40">•</span>
              <span>Shaquille &amp; Naana</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-purple-300 bg-clip-text text-transparent">
              Thailand 2027 Escape
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              <strong>{TRIP_METADATA.datesDisplay}</strong> (8 Luxury Nights in
              Thailand) — <strong>3 Nights</strong> riverside glamour at{" "}
              <span className="text-amber-300 font-medium">
                Shangri-La Bangkok
              </span>{" "}
              followed by <strong>5 Nights</strong> hilltop sanctuary at{" "}
              <span className="text-teal-300 font-medium">
                The Pavilions Phuket
              </span>
              .
            </p>

            {/* Quick Route Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 font-mono">
                ✈️ LGW → SHJ → BKK (4–5 Feb)
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200">
                🏙️ Bangkok (5–8 Feb)
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 font-mono">
                ✈️ BKK → HKT (8 Feb)
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-200">
                🏝️ Phuket (8–13 Feb)
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 font-mono">
                ✈️ HKT → SHJ → LGW (13–14 Feb)
              </span>
            </div>
          </div>

          {/* Countdown & Readiness Card */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-slate-800/90 rounded-2xl p-5 min-w-[270px] sm:min-w-[310px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                ⏳ Countdown Clock
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                All Flights &amp; Hotels Confirmed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 px-2">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {countdown.days}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Days
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 px-2">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {countdown.hours}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Hours
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 px-2">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {countdown.minutes}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Mins
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-slate-400">
              {countdown.statusLabel}
            </p>

            {/* Overall Readiness Bar */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">
                  Trip Prep &amp; Packing Readiness
                </span>
                <span className="text-amber-300 font-bold">
                  {overallReadinessPct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 transition-all duration-500"
                  style={{ width: `${overallReadinessPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                <span>
                  Prep: {prepProgress.done}/{prepProgress.total}
                </span>
                <span>
                  Apps: {appsProgress.done}/{appsProgress.total}
                </span>
                <span>
                  Packed: {packingProgress.done}/{packingProgress.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Interactive Navigation Tabs */}
      <nav
        aria-label="Trip Dashboard Views"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8"
      >
        {[
          {
            id: "itinerary" as ActiveTab,
            icon: "🗓️",
            label: "Itinerary & Plan",
            sub: "11-Day Timeline",
          },
          {
            id: "bookings" as ActiveTab,
            icon: "✈️",
            label: "Bookings Vault",
            sub: "PNRs & Hotels",
          },
          {
            id: "prep" as ActiveTab,
            icon: "✅",
            label: "Prep & Apps",
            sub: `${prepProgress.done + appsProgress.done}/${
              prepProgress.total + appsProgress.total
            } Ready`,
          },
          {
            id: "packing" as ActiveTab,
            icon: "🧳",
            label: "Packing Studio",
            sub: `${packingProgress.done}/${packingProgress.total} Packed`,
          },
          {
            id: "guide" as ActiveTab,
            icon: "🧭",
            label: "Field Guide & SOS",
            sub: "Transit, Beaches, 1155",
          },
          {
            id: "budget" as ActiveTab,
            icon: "💷",
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
              className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-br from-purple-600/30 to-amber-500/20 border-amber-400/50 text-white shadow-lg shadow-purple-500/10"
                  : "bg-slate-900/60 border-slate-800/90 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xl">{tab.icon}</span>
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="font-bold text-sm leading-tight">
                {tab.label}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {tab.sub}
              </span>
            </button>
          );
        })}
      </nav>

      {/* =====================================================================
          VIEW 1: ITINERARY & DAY-BY-DAY PLANNER
         ===================================================================== */}
      {activeTab === "itinerary" && (
        <section className="space-y-6">
          {/* Phase Filter & Day Quick-Jump Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Interactive Day-by-Day Itinerary &amp; Romantic Planner
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Check off logistics as you go, tap quick suggestions, or add
                  your own custom birthday plans to any day.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All 11 Days" },
                  { id: "outbound", label: "🛫 Outbound (4 Feb)" },
                  { id: "bangkok", label: "🏙️ Bangkok (5–7 Feb)" },
                  { id: "transfer", label: "🔄 Island Hop (8 Feb)" },
                  { id: "phuket", label: "🏝️ Phuket (9–12 Feb)" },
                  { id: "return", label: "🛬 Return (13–14 Feb)" },
                ].map((pf) => (
                  <button
                    key={pf.id}
                    type="button"
                    onClick={() => {
                      setPhaseFilter(pf.id as PhaseFilter);
                      setSelectedDayNum(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      phaseFilter === pf.id && selectedDayNum === null
                        ? "bg-purple-600 text-white shadow"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {pf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Pill Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedDayNum(null)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedDayNum === null
                    ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Show All
              </button>
              {TRIP_DAYS.map((d) => {
                const isSelected = selectedDayNum === d.dayNumber;
                return (
                  <button
                    key={d.dayNumber}
                    type="button"
                    onClick={() =>
                      setSelectedDayNum(isSelected ? null : d.dayNumber)
                    }
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    Day {d.dayNumber} • {d.shortDate}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Cards */}
          <div className="space-y-6">
            {filteredDays.map((day) => {
              const customActs =
                tripState.customActivitiesByDay[day.dayNumber] || [];
              const allDayActivities = [
                ...day.defaultActivities,
                ...customActs,
              ];

              const phaseAccent =
                day.phase === "bangkok"
                  ? "border-amber-500/30"
                  : day.phase === "phuket"
                  ? "border-teal-500/30"
                  : day.phase === "transfer"
                  ? "border-purple-500/40"
                  : "border-slate-800";

              return (
                <article
                  key={day.dayNumber}
                  className={`bg-slate-900/55 backdrop-blur-sm border ${phaseAccent} rounded-3xl p-5 sm:p-7 shadow-xl`}
                >
                  {/* Day Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                          DAY {day.dayNumber}
                        </span>
                        <span className="text-sm font-semibold text-amber-300">
                          {day.dateLabel}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          📍 {day.locationBadge}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        {day.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        ✨ {day.vibe}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 text-xs">
                      <span className="px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                        ☀️ {day.weatherSummary}
                      </span>
                      {day.accommodation && (
                        <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 font-medium">
                          🏨 {day.accommodation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timeline Activities */}
                  <div className="mt-5 space-y-3">
                    {allDayActivities.map((act) => {
                      const isDone = tripState.completedActivityIds.includes(
                        act.id
                      );
                      const style = CATEGORY_STYLES[act.category];
                      return (
                        <div
                          key={act.id}
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${
                            isDone
                              ? "bg-slate-950/40 border-emerald-500/30 opacity-75"
                              : "bg-slate-950/70 border-slate-800/90 hover:border-slate-700"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleActivityCompleted(act.id)}
                            aria-label={`Mark ${act.title} as ${
                              isDone ? "incomplete" : "complete"
                            }`}
                            className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              isDone
                                ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold"
                                : "border-slate-600 hover:border-purple-400"
                            }`}
                          >
                            {isDone ? "✓" : ""}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                                {act.time}
                              </span>
                              <span
                                className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${style.badge}`}
                              >
                                {style.icon} {style.label}
                              </span>
                              {act.isLocked && (
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                  Confirmed Booking
                                </span>
                              )}
                            </div>

                            <h4
                              className={`font-bold text-base ${
                                isDone
                                  ? "line-through text-slate-400"
                                  : "text-white"
                              }`}
                            >
                              {act.title}
                            </h4>

                            {act.subtitle && (
                              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                                {act.subtitle}
                              </p>
                            )}

                            {act.notes && (
                              <p className="text-xs text-slate-400 mt-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                                💡 {act.notes}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                              {act.location && (
                                <span className="text-slate-400">
                                  📍 {act.location}
                                </span>
                              )}
                              {act.mapUrl && (
                                <a
                                  href={act.mapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 underline font-medium"
                                >
                                  Open in Google Maps ↗
                                </a>
                              )}
                            </div>
                          </div>

                          {!act.isLocked &&
                            act.id.startsWith("custom-") && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeCustomActivity(day.dayNumber, act.id)
                                }
                                className="text-xs text-slate-500 hover:text-rose-400 px-2 py-1 rounded-lg cursor-pointer"
                                title="Remove custom item"
                              >
                                ✕
                              </button>
                            )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick-Add Curated Ideas for this Day */}
                  {day.quickSuggestions && day.quickSuggestions.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-800/60">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                        ✨ Curated Ideas for {day.shortDate} (Click to Add to
                        Your Schedule):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {day.quickSuggestions.map((sug, idx) => {
                          const alreadyAdded = allDayActivities.some(
                            (a) => a.title === sug.title
                          );
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() =>
                                addCustomActivity(day.dayNumber, {
                                  time: sug.time,
                                  title: sug.title,
                                  category: sug.category,
                                  location: sug.location,
                                  notes: sug.notes,
                                })
                              }
                              className={`text-xs px-3 py-2 rounded-xl border text-left transition-all ${
                                alreadyAdded
                                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 cursor-default"
                                  : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-purple-500/50 hover:text-white cursor-pointer"
                              }`}
                            >
                              {alreadyAdded ? "✓ Added: " : "+ "}
                              <span className="font-semibold">
                                {sug.time}
                              </span>{" "}
                              — {sug.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Plan Button & Form */}
                  <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-col gap-3">
                    {addingToDay === day.dayNumber ? (
                      <form
                        onSubmit={(e) =>
                          handleAddActivitySubmit(e, day.dayNumber)
                        }
                        className="bg-slate-950/90 border border-purple-500/40 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-purple-300">
                            + Add Custom Plan for {day.shortDate}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setAddingToDay(null)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={newActTime}
                            onChange={(e) => setNewActTime(e.target.value)}
                            placeholder="Time (e.g. 19:30 ICT)"
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                          />
                          <input
                            type="text"
                            required
                            value={newActTitle}
                            onChange={(e) => setNewActTitle(e.target.value)}
                            placeholder="Activity / Restaurant / Surprise..."
                            className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <select
                            value={newActCategory}
                            onChange={(e) =>
                              setNewActCategory(
                                e.target.value as ItineraryActivity["category"]
                              )
                            }
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                          >
                            <option value="romance">
                              💖 Birthday &amp; Romance
                            </option>
                            <option value="dining">🍽️ Dining &amp; Bars</option>
                            <option value="beach">🏖️ Beach &amp; Boats</option>
                            <option value="spa">💆🏽‍♀️ Spa &amp; Pool</option>
                            <option value="culture">
                              🛕 Culture &amp; Temples
                            </option>
                            <option value="transit">🚕 Transit</option>
                            <option value="custom">✨ Custom Plan</option>
                          </select>
                          <input
                            type="text"
                            value={newActLocation}
                            onChange={(e) => setNewActLocation(e.target.value)}
                            placeholder="Location (optional)"
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                          />
                          <input
                            type="text"
                            value={newActNotes}
                            onChange={(e) => setNewActNotes(e.target.value)}
                            placeholder="Notes / Dress code / Reservation ref"
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Save to Day {day.dayNumber}
                        </button>
                      </form>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingToDay(day.dayNumber)}
                          className="text-xs font-semibold text-purple-300 hover:text-purple-200 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all cursor-pointer"
                        >
                          + Add Custom Activity / Reservation to {day.shortDate}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================================
          VIEW 2: BOOKINGS & RESERVATIONS VAULT
         ===================================================================== */}
      {activeTab === "bookings" && (
        <section className="space-y-8">
          {/* Quick PNR Copy Strip */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-1">
              🔑 Instant Booking Reference Vault (Tap any code to copy)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              All 5 core trip bookings are confirmed and verified. Tap a PNR or
              hotel confirmation number to copy it to your clipboard.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  label: "Outbound Air Arabia",
                  code: "6I8SOP",
                  sub: "LGW → SHJ → BKK",
                },
                {
                  label: "Shangri-La Bangkok",
                  code: "12891938794",
                  sub: "5–8 Feb (3 Nights)",
                },
                {
                  label: "Thai Vietjet VZ306",
                  code: "2GXDQP",
                  sub: "BKK → HKT (8 Feb)",
                },
                {
                  label: "The Pavilions Phuket",
                  code: "78165SH099776",
                  sub: "8–13 Feb (5 Nights)",
                },
                {
                  label: "Return Air Arabia",
                  code: "6LDREI",
                  sub: "HKT → SHJ → LGW",
                },
              ].map((ref) => (
                <button
                  key={ref.code}
                  type="button"
                  onClick={() => handleCopy(ref.code, `${ref.label} (${ref.code})`)}
                  className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-amber-400/50 transition-all text-left group cursor-pointer"
                >
                  <span className="text-[11px] text-slate-400">
                    {ref.label}
                  </span>
                  <div className="flex items-center justify-between w-full mt-1">
                    <span className="font-mono text-base font-extrabold text-amber-300 group-hover:text-amber-200">
                      {ref.code}
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-amber-300">
                      📋 Copy
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    {ref.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Confirmed Flight Boarding Cards */}
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>✈️</span> Confirmed Flight Segments
            </h3>

            {FLIGHT_BOOKINGS.map((flight) => (
              <div
                key={flight.id}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-3 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-bold">
                        {flight.direction}
                      </span>
                      <span className="text-sm font-semibold text-slate-300">
                        {flight.airline} • {flight.fareClass}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                      <span>
                        Paid:{" "}
                        <strong className="text-emerald-300">
                          {flight.totalPaidDisplay}
                        </strong>{" "}
                        ({flight.paymentMethod})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(flight.pnr, `PNR ${flight.pnr}`)
                      }
                      className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 font-mono text-sm font-bold hover:bg-amber-500/25 cursor-pointer"
                    >
                      PNR: {flight.pnr} 📋
                    </button>
                    <a
                      href={flight.manageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
                    >
                      Manage Booking ↗
                    </a>
                    {flight.extraLinks.map((lnk) => (
                      <a
                        key={lnk.url}
                        href={lnk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                      >
                        {lnk.label} ↗
                      </a>
                    ))}
                  </div>
                </div>

                {/* Flight Segments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {flight.segments.map((seg) => (
                    <div
                      key={seg.flightNumber}
                      className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <span className="font-mono font-bold text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                          Flight {seg.flightNumber}
                        </span>
                        <span>Duration: {seg.duration}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 my-2">
                        <div>
                          <div className="text-2xl font-extrabold text-white">
                            {seg.fromCode}
                          </div>
                          <div className="text-xs text-slate-400">
                            {seg.fromCity}
                          </div>
                          <div className="text-sm font-bold text-amber-300 mt-1">
                            {seg.depTime}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {seg.depDate}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-2">
                          <div className="w-full h-[2px] bg-gradient-to-r from-sky-500/30 via-amber-400/60 to-sky-500/30 relative">
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs">
                              ✈️
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-white">
                            {seg.toCode}
                          </div>
                          <div className="text-xs text-slate-400">
                            {seg.toCity}
                          </div>
                          <div className="text-sm font-bold text-emerald-300 mt-1">
                            {seg.arrTime}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {seg.arrDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {flight.layover && (
                  <div className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs font-medium">
                    ⏱️ <strong>Transit Layover:</strong> {flight.layover}
                  </div>
                )}

                {/* Domestic Seat & Baggage Breakdown */}
                {flight.passengerDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {flight.passengerDetails.map((pax) => (
                      <div
                        key={pax.name}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-purple-500/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-bold text-white">
                            👤 {pax.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            🧳 {pax.checkedBag} + {pax.cabinBag}
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-200 font-mono text-xs font-bold">
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
                      className="text-xs px-3 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700"
                    >
                      ✓ {perk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Accommodations Vault */}
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🏨</span> Confirmed Luxury Accommodations
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {HOTEL_BOOKINGS.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          {hotel.city} • {hotel.nights} Nights
                        </span>
                        <h4 className="text-2xl font-extrabold text-white mt-0.5">
                          {hotel.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
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
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 font-mono text-xs font-bold hover:bg-amber-500/25 shrink-0 cursor-pointer"
                      >
                        Ref: {hotel.bookingRef} 📋
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                      <div className="text-sm font-bold text-purple-300">
                        🛏️ {hotel.roomCategory}
                      </div>
                      {hotel.roomDescription && (
                        <p className="text-slate-300">{hotel.roomDescription}</p>
                      )}
                      <div className="flex flex-wrap gap-4 pt-1 text-slate-400">
                        <span>
                          <strong>Check-in:</strong> {hotel.checkIn}
                        </span>
                        <span>
                          <strong>Check-out:</strong> {hotel.checkOut}
                        </span>
                      </div>
                    </div>

                    {/* Financials & Balance Tracker */}
                    <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-medium">
                          Total Confirmed Charges:
                        </span>
                        <span className="text-sm font-extrabold text-emerald-300">
                          THB {hotel.totalThb.toLocaleString()} (~£
                          {hotel.totalGbp.toFixed(2)})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {hotel.paymentNote}
                      </p>

                      {hotel.balanceDueThb > 0 && (
                        <label className="flex items-center gap-2.5 pt-2 border-t border-emerald-500/20 text-xs text-amber-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tripState.pavilionsBalancePaid}
                            onChange={() =>
                              setTripState((prev) => ({
                                ...prev,
                                pavilionsBalancePaid: !prev.pavilionsBalancePaid,
                              }))
                            }
                            className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>
                            {tripState.pavilionsBalancePaid
                              ? "✓ Remaining THB 1,190.00 Airport Transfer Balance Settled!"
                              : "Mark THB 1,190.00 (~£26.75) Airport Transfer Balance as Paid"}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Property Highlights */}
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {hotel.highlights.map((hl) => (
                        <li key={hl} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">✦</span>
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Address & Map Actions */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="text-xs text-slate-400">
                      📍 {hotel.address}{" "}
                      <span className="font-mono text-[11px] text-slate-500">
                        ({hotel.coordinates})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={hotel.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                      >
                        Open in Google Maps ↗
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(hotel.address, `${hotel.name} Address`)
                        }
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                      >
                        Copy Address for Grab/Taxi 📋
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          VIEW 3: PRE-TRIP PREPARATION, BANKING & ESSENTIAL APPS
         ===================================================================== */}
      {activeTab === "prep" && (
        <section className="space-y-8">
          {/* Pre-Trip Entry & Immigration Checklist */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🛂 Pre-Trip Preparation &amp; Entry Checklist
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  UK passport holders qualify for the Thailand tourist visa
                  exemption. Complete these items before departure on 4 Feb
                  2027.
                </p>
              </div>
              <div className="flex gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "both", label: "Shared" },
                  { id: "shaq", label: "Shaquille" },
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      prepAssigneeFilter === f.id
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {PREP_CHECKLIST.filter(
                (item) =>
                  prepAssigneeFilter === "all" ||
                  item.assignee === prepAssigneeFilter
              ).map((item) => {
                const isDone = tripState.completedPrepIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      isDone
                        ? "bg-emerald-950/20 border-emerald-500/30 opacity-80"
                        : "bg-slate-950/70 border-slate-800 hover:border-purple-500/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => togglePrepItem(item.id)}
                      className="mt-1 w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`font-bold text-sm sm:text-base ${
                            isDone ? "line-through text-slate-400" : "text-white"
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.urgentTag && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                            {item.urgentTag}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                          {item.assignee === "both"
                            ? "👥 Shaq & Naana"
                            : item.assignee === "shaq"
                            ? "👤 Shaquille"
                            : "👤 Naana"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Banking, ATM Golden Rule & SuperRich Exchange Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                ⚠️ Crucial Thai ATM Rule
              </div>
              <h3 className="text-xl font-bold text-white">
                Always Choose &ldquo;Without Conversion&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Thai ATMs charge a mandatory{" "}
                <strong className="text-amber-300">220 THB flat fee</strong>{" "}
                (~£4.94) per foreign card withdrawal. When the ATM screen asks
                whether to convert to GBP,{" "}
                <strong className="text-emerald-300 underline">
                  ALWAYS select &ldquo;Continue Without Conversion&rdquo;
                </strong>{" "}
                so your zero-FX UK bank (Monzo, Starling, Revolut, Chase)
                handles the exchange rate.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-500/30 rounded-3xl p-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
                💷 Best Cash Exchange in Bangkok
              </div>
              <h3 className="text-xl font-bold text-white">
                SuperRich (Orange or Green Booths)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Thailand remains cash-heavy for street markets, longtail boats,
                tipping, and beach kiosks. Get the best exchange rates at{" "}
                <strong className="text-teal-300">SuperRich</strong> located in
                the{" "}
                <strong>
                  basement (Floor B) of Suvarnabhumi Airport (near the Airport
                  Rail Link)
                </strong>{" "}
                and inside major BTS Skytrain stations.
              </p>
            </div>
          </div>

          {/* Essential Apps Tracker */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  📱 Essential Digital Utilities &amp; Apps Tracker
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Check off each app once installed and set up on both phones
                  before flying.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {appsProgress.done} of {appsProgress.total} Installed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ESSENTIAL_APPS.map((app) => {
                const installed = tripState.installedAppIds.includes(app.id);
                return (
                  <label
                    key={app.id}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      installed
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : "bg-slate-950/70 border-slate-800 hover:border-purple-500/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={installed}
                      onChange={() => toggleAppInstalled(app.id)}
                      className="mt-1 w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-base text-white flex items-center gap-2">
                          <span>{app.icon}</span> {app.name}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                          {app.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-400 font-medium">
                        {app.category}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {app.description}
                      </p>
                      <p className="text-[11px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        💡 <strong>Pro Tip:</strong> {app.proTip}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          VIEW 4: INTERACTIVE PACKING STUDIO & DRESS CODE ADVISOR
         ===================================================================== */}
      {activeTab === "packing" && (
        <section className="space-y-8">
          {/* Climate Profile & Interactive Dress Code Advisor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* February Climate Profile */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold">
                ☀️ February Peak Dry Season Profile
              </div>
              <h2 className="text-xl font-bold text-white">
                Cool &amp; Dry Tropical Sunshine
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                February is Thailand&apos;s premier season—virtually zero
                rainfall, calm turquoise seas, and bright sunshine.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/25">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-amber-300">
                      🏙️ Bangkok (5–8 Feb)
                    </span>
                    <span className="font-mono text-xs text-white font-bold">
                      32°C–34°C Day • 23°C–25°C Night
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    High humidity &amp; urban heat. Pack ultra-breathable linen,
                    cotton, and bamboo fabrics.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/25">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-teal-300">
                      🏝️ Phuket (8–13 Feb)
                    </span>
                    <span className="font-mono text-xs text-white font-bold">
                      31°C–33°C Day • 24°C–26°C Night
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Gentle Andaman sea breezes.{" "}
                    <strong className="text-rose-300">
                      UV Index 10–11 (Very High)
                    </strong>{" "}
                    — high-SPF 50+ &amp; polarized sunglasses are essential.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Dress Code Advisor */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-white">
                  👗 Interactive Dress Code &amp; Outfit Guide
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "temple", label: "🛕 Temple Rules" },
                    { id: "rooftop", label: "🍸 Rooftop & Fine Dining" },
                    { id: "daytime", label: "☀️ Daytime City" },
                    { id: "beach", label: "🏖️ Phuket Resort" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setDressCodeTab(
                          t.id as "temple" | "rooftop" | "daytime" | "beach"
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        dressCodeTab === t.id
                          ? "bg-purple-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {dressCodeTab === "temple" && (
                <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 space-y-2.5 text-xs sm:text-sm">
                  <div className="font-bold text-amber-300 text-base">
                    🛕 Strictly Enforced at Grand Palace, Wat Pho &amp; Wat Arun
                  </div>
                  <ul className="space-y-1.5 text-slate-200 list-disc pl-5">
                    <li>
                      <strong>Shoulders and knees must be completely covered</strong>{" "}
                      for both men and women.
                    </li>
                    <li>
                      <strong>Forbidden:</strong> Sleeveless tops, tank tops,
                      crop tops, sheer fabrics, shorts, or tight athletic
                      leggings.
                    </li>
                    <li>
                      <strong>Daypack Tip:</strong> Carry a lightweight linen
                      shirt or sarong in your daypack for spontaneous temple
                      visits.
                    </li>
                    <li>
                      <strong>Footwear:</strong> Wear slip-on shoes or sandals
                      (shoes must be removed before entering temple halls).
                    </li>
                  </ul>
                </div>
              )}

              {dressCodeTab === "rooftop" && (
                <div className="p-4 rounded-2xl bg-purple-950/25 border border-purple-500/30 space-y-2.5 text-xs sm:text-sm">
                  <div className="font-bold text-purple-300 text-base">
                    🍸 Smart Casual for Bangkok Rooftops (Lebua, Vertigo,
                    Mahanakhon) &amp; Fine Dining
                  </div>
                  <ul className="space-y-1.5 text-slate-200 list-disc pl-5">
                    <li>
                      <strong>Shaquille (Men):</strong> Collared linen shirts,
                      lightweight chinos/trousers, and{" "}
                      <strong className="text-amber-300">
                        closed-toe loafers or clean smart sneakers
                      </strong>{" "}
                      (rooftops strictly forbid flip-flops, athletic shorts, and
                      sleeveless vests).
                    </li>
                    <li>
                      <strong>Naana (Women):</strong> Romantic maxi/midi
                      dresses, dressy jumpsuits, or elegant separates.
                    </li>
                  </ul>
                </div>
              )}

              {dressCodeTab === "daytime" && (
                <div className="p-4 rounded-2xl bg-sky-950/25 border border-sky-500/30 space-y-2.5 text-xs sm:text-sm">
                  <div className="font-bold text-sky-300 text-base">
                    ☀️ Bangkok Daytime Sightseeing Strategy
                  </div>
                  <ul className="space-y-1.5 text-slate-200 list-disc pl-5">
                    <li>
                      Choose ultra-breathable, moisture-wicking fabrics: linen,
                      lightweight cotton, and bamboo.
                    </li>
                    <li>
                      Avoid thick denim or heavy synthetics in 34°C Bangkok
                      humidity.
                    </li>
                    <li>
                      Keep pocket tissues, wet wipes, and rehydration salts
                      (Dioralyte) in your daypack.
                    </li>
                  </ul>
                </div>
              )}

              {dressCodeTab === "beach" && (
                <div className="p-4 rounded-2xl bg-teal-950/25 border border-teal-500/30 space-y-2.5 text-xs sm:text-sm">
                  <div className="font-bold text-teal-300 text-base">
                    🏖️ The Pavilions Phuket, Layan Beach &amp; Bang Tao Clubs
                  </div>
                  <ul className="space-y-1.5 text-slate-200 list-disc pl-5">
                    <li>
                      Multiple sets of swimwear, breathable beach cover-ups,
                      polarized UV sunglasses, and wide-brimmed sunhats.
                    </li>
                    <li>
                      High-SPF 50+ sunscreen &amp; reef-safe sunscreen for
                      Andaman ocean swimming.
                    </li>
                    <li>
                      Waterproof phone pouch &amp; 10L dry bag for Banana Beach
                      and island boat hops.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Categorized Packing Checklist */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  🧳 Interactive Packing Checklist ({packingProgress.done}/
                  {packingProgress.total} Packed)
                </h3>
                <p className="text-xs text-slate-400">
                  Baggage Allowances: Air Arabia (20kg checked + 10kg cabin each)
                  • Thai Vietjet (Shaq 25kg, Naana 30kg checked + 7kg carry-on
                  each).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "All Items" },
                  { id: "both", label: "👥 Shared" },
                  { id: "shaq", label: "👤 Shaquille" },
                  { id: "naana", label: "👤 Naana" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      setPackingOwnerFilter(
                        f.id as "all" | "both" | "shaq" | "naana"
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      packingOwnerFilter === f.id
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowUnpackedOnly(!showUnpackedOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                    showUnpackedOnly
                      ? "bg-amber-500/20 border-amber-400 text-amber-200"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  {showUnpackedOnly ? "Showing Unpacked" : "Unpacked Only"}
                </button>
              </div>
            </div>

            {/* Add Custom Packing Item Form */}
            <form
              onSubmit={handleAddPackingSubmit}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800"
            >
              <input
                type="text"
                value={newPackLabel}
                onChange={(e) => setNewPackLabel(e.target.value)}
                placeholder="Add a custom item to pack (e.g. Birthday sash, film camera, tripod)..."
                className="sm:col-span-6 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              />
              <select
                value={newPackCategory}
                onChange={(e) =>
                  setNewPackCategory(e.target.value as PackingItem["category"])
                }
                className="sm:col-span-3 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
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
                <option value="Health & Pharmacy">Health &amp; Pharmacy</option>
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
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="both">👥 Shared</option>
                <option value="shaq">👤 Shaq</option>
                <option value="naana">👤 Naana</option>
              </select>
              <button
                type="submit"
                className="sm:col-span-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl py-2 cursor-pointer"
              >
                + Add
              </button>
            </form>

            {/* Packing Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 space-y-3"
                  >
                    <h4 className="font-bold text-sm uppercase tracking-wider text-amber-300 border-b border-slate-800 pb-2">
                      {cat}
                    </h4>
                    <div className="space-y-2.5">
                      {items.map((item) => {
                        const isPacked = tripState.packedItemIds.includes(
                          item.id
                        );
                        return (
                          <label
                            key={item.id}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isPacked
                                ? "bg-emerald-950/20 border-emerald-500/25 opacity-70"
                                : "bg-slate-900/70 border-slate-800/80 hover:border-slate-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isPacked}
                              onChange={() => togglePackingItem(item.id)}
                              className="mt-1 w-4 h-4 rounded border-slate-600 text-emerald-500"
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`font-semibold ${
                                    isPacked
                                      ? "line-through text-slate-400"
                                      : "text-white"
                                  }`}
                                >
                                  {item.label}
                                </span>
                                {item.forWho !== "both" && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
                                    {item.forWho}
                                  </span>
                                )}
                              </div>
                              {item.note && (
                                <p className="text-slate-400 mt-0.5">
                                  {item.note}
                                </p>
                              )}
                            </div>
                          </label>
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

      {/* =====================================================================
          VIEW 5: ON-THE-GROUND FIELD GUIDE & EMERGENCY SOS
         ===================================================================== */}
      {activeTab === "guide" && (
        <section className="space-y-8">
          {/* Bangkok & Phuket Field Logistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bangkok Field Guide */}
            <div className="bg-slate-900/60 border border-amber-500/30 rounded-3xl p-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold">
                🏙️ Bangkok Field Guide (5 Feb – 8 Feb)
              </div>
              <h2 className="text-xl font-bold text-white">
                Suvarnabhumi Arrival &amp; Riverside Mobility
              </h2>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-300">
                    🛬 Step-by-Step Arrival at BKK (Fri 5 Feb @ 17:05)
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                    <li>
                      Clear immigration (present TDAC QR code) &amp; collect
                      checked luggage.
                    </li>
                    <li>
                      <strong>Optional Cash Exchange:</strong> Visit{" "}
                      <strong>SuperRich on Floor B</strong> (Airport Rail Link
                      level) for top THB rates.
                    </li>
                    <li>
                      <strong>Taxi / Grab Pickup:</strong> Exit to{" "}
                      <strong>Level 1 (Ground Floor)</strong> for public taxi
                      queue kiosks, OR head to{" "}
                      <strong>Level 4 / Door 4</strong> for Grab pickup.
                    </li>
                    <li>
                      Drive to Shangri-La Bangkok takes{" "}
                      <strong>~40–50 mins via Sirat Expressway</strong> (~400–500
                      THB + expressway tolls).
                    </li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-purple-300">
                    ⛴️ Getting Around from Shangri-La Bangkok
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li>
                      <strong>BTS Skytrain:</strong> Walk 2 minutes to{" "}
                      <strong>Saphan Taksin Station</strong> (Silom Line) to
                      ride directly into Siam, Silom, and Sukhumvit.
                    </li>
                    <li>
                      <strong>Chao Phraya Express Boats:</strong> Board right
                      next door at <strong>Sathorn Central Pier</strong> for
                      scenic river hops to Wat Arun, Wat Pho, and the Grand
                      Palace.
                    </li>
                    <li>
                      <strong>ICONSIAM &amp; Asiatique:</strong> Take the{" "}
                      <strong>free hotel shuttle boat</strong> from Sathorn Pier
                      across to ICONSIAM (and SookSiam indoor floating market).
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phuket Field Guide */}
            <div className="bg-slate-900/60 border border-teal-500/30 rounded-3xl p-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold">
                🏝️ Phuket Field Guide (8 Feb – 13 Feb)
              </div>
              <h2 className="text-xl font-bold text-white">
                The Pavilions Sanctuary &amp; West Coast Beaches
              </h2>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-teal-300">
                    🌺 Resort Mobility &amp; Perks
                  </div>
                  <p className="text-slate-300">
                    The Pavilions is a serene hilltop sanctuary. Call front desk{" "}
                    <strong>golf buggies</strong> anytime to whisk you between
                    your 81 sqm Deluxe Tropical View Suite,{" "}
                    <strong>Firefly Pool</strong>, <strong>360 Bar</strong>, and{" "}
                    <strong>Pavilions Spa</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-300">
                    🏖️ Nearby Beaches Explorer
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div>
                      • <strong>Layan Beach (5 mins):</strong> Free scheduled
                      hotel shuttle. Quiet, shaded, shallow crystal water.
                    </div>
                    <div>
                      • <strong>Bang Tao Beach (10 mins south):</strong> Home to
                      vibrant beach clubs (<em>Catch Beach Club</em>,{" "}
                      <em>Maya Beach Club</em>) and long stretches of white
                      sand.
                    </div>
                    <div>
                      • <strong>Banana Beach (12 mins north):</strong> Hidden
                      romantic cove with turquoise water.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-rose-300">
                    🛫 Departure Day Gameplan (Sat 13 Feb)
                  </div>
                  <p className="text-slate-300">
                    Check out at <strong>12:00 PM</strong> (store luggage with
                    concierge). Take your late-afternoon transfer to Phuket
                    International Airport (<code>HKT</code>) by{" "}
                    <strong>15:30 PM</strong> for Air Arabia flight{" "}
                    <code>G9715</code> (18:20 departure).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency & Critical Support Contacts */}
          <div className="bg-slate-900/60 border border-rose-500/30 rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🚨</span> Emergency &amp; Critical Support Contacts
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                One-tap emergency dialing and JCI-accredited international
                hospitals in Bangkok and Phuket.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EMERGENCY_CONTACTS.map((c) => (
                <div
                  key={c.title}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/25 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                      {c.badge}
                    </span>
                    <h4 className="font-bold text-white text-base mt-2">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {c.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <a
                      href={c.telHref}
                      className="block w-full text-center py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-sm transition-all"
                    >
                      📞 Dial {c.number}
                    </a>
                    {c.linkUrl && (
                      <a
                        href={c.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-xs text-purple-300 hover:text-purple-200 underline"
                      >
                        {c.linkLabel} ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* International Hospitals */}
            <div className="pt-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
                🏥 International Standard Hospital Facilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {INTERNATIONAL_HOSPITALS.map((hosp) => (
                  <a
                    key={hosp.name}
                    href={hosp.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition-all block"
                  >
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                      {hosp.city}
                    </span>
                    <div className="font-bold text-sm text-white mt-1.5">
                      {hosp.name} ↗
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{hosp.note}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          VIEW 6: BUDGET, VERIFIED FINANCIALS & THB CONVERTER
         ===================================================================== */}
      {activeTab === "budget" && (
        <section className="space-y-8">
          {/* Interactive THB <-> GBP Converter */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  💱 Interactive THB ⇄ GBP Currency Converter
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Benchmark rate:{" "}
                  <strong className="text-amber-300">
                    1 GBP ≈ {tripState.exchangeRate.toFixed(2)} THB
                  </strong>
                  . Type in either box or tap a common Thai price preset.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <label className="block text-xs text-slate-400 uppercase font-bold mb-1">
                  🇹🇭 Thai Baht (THB ฿)
                </label>
                <input
                  type="number"
                  value={thbInput}
                  onChange={(e) => handleThbChange(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 text-center text-2xl text-slate-400 font-bold">
                ⇄
              </div>

              <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <label className="block text-xs text-slate-400 uppercase font-bold mb-1">
                  🇬🇧 British Pounds (GBP £)
                </label>
                <input
                  type="number"
                  value={gbpInput}
                  onChange={(e) => handleGbpChange(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "100 THB Street Snack", thb: 100 },
                { label: "220 THB ATM Fee", thb: 220 },
                { label: "500 THB BKK Airport Taxi", thb: 500 },
                { label: "1,000 THB (~£22.47)", thb: 1000 },
                { label: "1,190 THB Pavilions Transfer", thb: 1190 },
                { label: "3,233 THB (£72.65 Hotel Surplus)", thb: 3233 },
                { label: "5,000 THB Fine Dining", thb: 5000 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setQuickThbPreset(preset.thb)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-400/50 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accommodation Budget Surplus Highlight + Verified Financial Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  🎯 Accommodation Budget Win
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  £72.65 Under Budget Surplus!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Both 5-star properties (Shangri-La Bangkok &amp; The Pavilions
                  Phuket) came in under the £1,405.00 accommodation target—saving{" "}
                  <strong>£72.65 (~3,233 THB)</strong> for birthday dining &amp;
                  activities.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-emerald-500/20 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Max Target Budget:</span>
                  <span className="font-mono text-white">£1,405.00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Actual Booked (THB 59,304.26):</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    ~£1,332.35
                  </span>
                </div>
                <div className="flex justify-between text-amber-300 font-bold text-sm pt-1">
                  <span>Birthday Surplus Saved:</span>
                  <span className="font-mono">+£72.65 (~3,233 THB)</span>
                </div>
              </div>
            </div>

            {/* Verified Financial Matrix Table */}
            <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 overflow-x-auto">
              <h3 className="text-xl font-bold text-white">
                📊 Verified Core Trip Financial Matrix
              </h3>
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 pr-3">Component</th>
                    <th className="py-2.5 px-3">Currency Amount</th>
                    <th className="py-2.5 px-3">GBP Equivalent</th>
                    <th className="py-2.5 pl-3">Notes / Payment Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {FINANCIAL_MATRIX.map((row) => (
                    <tr key={row.component}>
                      <td className="py-3 pr-3 font-semibold text-white">
                        {row.component}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {row.currencyAmount}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-300">
                        ~£{row.gbpEquivalent.toFixed(2)}
                      </td>
                      <td className="py-3 pl-3 text-slate-400 text-xs">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-amber-500/40 bg-amber-500/5">
                    <td
                      colSpan={2}
                      className="py-3.5 pr-3 font-extrabold text-amber-300 text-base"
                    >
                      Grand Total (All Confirmed Flights + 8 Nights Luxury
                      Hotels)
                    </td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-amber-300 text-base">
                      ~£{TRIP_METADATA.grandTotalGbp.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3.5 pl-3 text-xs text-slate-400">
                      Complete core trip infrastructure
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Interactive On-The-Ground Activity & Dining Expense Planner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-white">
                  🥂 Interactive On-The-Ground Treats &amp; Expense Planner
                </h3>
                <p className="text-xs text-slate-400">
                  Plan how to spend your £72.65 (~3,233 THB) hotel budget
                  surplus and track extra dining, beach club, or spa treats.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">
                  Planned On-The-Ground Total:
                </div>
                <div className="font-mono text-lg font-extrabold text-purple-300">
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
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800"
            >
              <input
                type="text"
                value={newExpTitle}
                onChange={(e) => setNewExpTitle(e.target.value)}
                placeholder="Expense / Experience (e.g. Couples Spa at Pavilions, Catch Beach Club)..."
                className="sm:col-span-4 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="number"
                step="any"
                value={newExpAmount}
                onChange={(e) => setNewExpAmount(e.target.value)}
                placeholder="Amount"
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
              <select
                value={newExpCurrency}
                onChange={(e) =>
                  setNewExpCurrency(e.target.value as "THB" | "GBP")
                }
                className="sm:col-span-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
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
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
              >
                <option value="Birthday Treat">🎂 Birthday Treat</option>
                <option value="Dining">🍽️ Dining</option>
                <option value="Spa & Wellness">💆🏽‍♀️ Spa &amp; Wellness</option>
                <option value="Beach & Excursions">🏖️ Beach &amp; Boats</option>
                <option value="Transit & Cash">🚕 Transit &amp; Cash</option>
              </select>
              <select
                value={newExpCity}
                onChange={(e) =>
                  setNewExpCity(
                    e.target.value as "Bangkok" | "Phuket" | "Both"
                  )
                }
                className="sm:col-span-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
              >
                <option value="Bangkok">Bangkok</option>
                <option value="Phuket">Phuket</option>
                <option value="Both">Both</option>
              </select>
              <button
                type="submit"
                className="sm:col-span-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl py-2 cursor-pointer"
              >
                + Add Expense
              </button>
            </form>

            <div className="space-y-2.5">
              {tripState.plannedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={!!exp.isBooked}
                      onChange={() => toggleExpenseBooked(exp.id)}
                      className="w-4 h-4 rounded border-slate-600 text-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">
                        {exp.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {exp.city} • {exp.category}{" "}
                        {exp.isBooked ? "• ✓ Paid / Reserved" : "• Planned"}
                      </div>
                    </div>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-amber-300">
                        THB {exp.amountThb.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">
                        ~£{(exp.amountThb / tripState.exchangeRate).toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteExpense(exp.id)}
                      className="text-xs text-slate-500 hover:text-rose-400 px-2 py-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </NaanasSpaceLayout>
  );
}
