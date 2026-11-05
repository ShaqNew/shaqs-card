import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TRIP_METADATA,
  TRIP_DAYS,
  PREP_CHECKLIST,
  ESSENTIAL_APPS,
  DEFAULT_PACKING_ITEMS,
  ItineraryActivity,
  PackingItem,
  PlannedExpense,
} from "@/lib/thailandTripData";
import {
  PersistedTripState,
  DEFAULT_PERSISTED_STATE,
  STORAGE_KEY,
  ACTOR_STORAGE_KEY,
  ChangeLogEntry,
  CountdownState,
} from "../types";
import { formatDayNumber } from "../utils/formatters";

export function useThailandTripState() {
  const [tripState, setTripState] = useState<PersistedTripState>(
    DEFAULT_PERSISTED_STATE
  );
  const [syncStatus, setSyncStatus] = useState<"local" | "syncing" | "synced">(
    "local"
  );
  const [activeActor, setActiveActor] = useState<"Shaq" | "Naana">("Shaq");

  const [countdown, setCountdown] = useState<CountdownState>({
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

  // Toggle & mutation helpers with automatic Change Log attribution
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

  const addCustomPackingItem = (itemData: Omit<PackingItem, "id">) => {
    const item: PackingItem = {
      ...itemData,
      id: `custom-pack-${Date.now()}`,
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
  };

  const updateCustomActivity = (
    dayNumber: number,
    activityId: string,
    updates: Partial<Omit<ItineraryActivity, "id">>
  ) => {
    updateTripState(
      (prev) => {
        const existing = prev.customActivitiesByDay[dayNumber] || [];
        return {
          ...prev,
          customActivitiesByDay: {
            ...prev.customActivitiesByDay,
            [dayNumber]: existing.map((act) =>
              act.id === activityId ? { ...act, ...updates } : act
            ),
          },
        };
      },
      {
        section: "itinerary",
        action: `Updated entry on Day ${formatDayNumber(dayNumber)}`,
        detail: `${updates.title || activityId} (${updates.time || "Flexible"})`,
      }
    );
  };

  const addPlannedExpense = (expData: Omit<PlannedExpense, "id">) => {
    const exp: PlannedExpense = {
      ...expData,
      id: `exp-${Date.now()}`,
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

  const togglePavilionsBalancePaid = () => {
    updateTripState(
      (prev) => ({
        ...prev,
        pavilionsBalancePaid: !prev.pavilionsBalancePaid,
      }),
      {
        section: "bookings",
        action: tripState.pavilionsBalancePaid
          ? "Reopened airport transfer balance"
          : "Settled airport transfer balance",
        detail: "The Pavilions Phuket • THB 1,190.00 (~£26.75)",
      }
    );
  };

  const deleteChangeLogEntry = (logId: string) => {
    updateTripState((prev) => ({
      ...prev,
      changeLog: (prev.changeLog || []).filter((l) => l.id !== logId),
    }));
  };

  const clearAllChangeLogs = () => {
    updateTripState((prev) => ({
      ...prev,
      changeLog: [],
    }));
  };

  return {
    tripState,
    updateTripState,
    syncStatus,
    fetchFromCloud,
    activeActor,
    handleSetActiveActor,
    countdown,
    allPackingItems,
    prepProgress,
    appsProgress,
    packingProgress,
    overallReadinessPct,
    togglePrepItem,
    toggleAppInstalled,
    togglePackingItem,
    addCustomPackingItem,
    removeCustomPackingItem,
    toggleActivityCompleted,
    addCustomActivity,
    removeCustomActivity,
    updateCustomActivity,
    addPlannedExpense,
    toggleExpenseBooked,
    deleteExpense,
    togglePavilionsBalancePaid,
    deleteChangeLogEntry,
    clearAllChangeLogs,
  };
}
