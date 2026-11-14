"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { TRIP_METADATA, TRIP_DAYS, WardrobeOutfit } from "@/lib/thailandTripData";
import { ActiveTab, PhaseFilter, ChangeLogEntry, PersistedTripState } from "./types";
import { monoStyle } from "./styles";
import {
  triggerCheckHaptic,
  triggerDestructiveHaptic,
  triggerPresetHaptic,
} from "./utils/haptics";
import { useThailandTripState } from "./hooks/useThailandTripState";
import { usePwaInstall } from "./hooks/usePwaInstall";
import {
  isInspirationOutfit,
  resolveDayOutfit,
  resolveActivityOutfit,
} from "./utils/wardrobe";
import {
  detectActiveTripDay,
  formatDualTimezoneClock,
  isTravelTransitDay,
} from "./utils/companion";
import { TopEditorialBar } from "./components/TopEditorialBar";
import { QuickPocketDesk } from "./components/QuickPocketDesk";
import { EditorialMasthead } from "./components/EditorialMasthead";
import { StickyStepNav } from "./components/StickyStepNav";
import type { WardrobeDrawerTarget } from "./components/WardrobeDrawer";
import { StepItinerary } from "./components/steps/StepItinerary";

function StepTabLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[40vh] border border-[#C9BFA8] bg-[#FBF8F3] p-6 sm:p-10 flex items-center justify-center text-xs uppercase tracking-[0.14em] text-[#8A7E71]"
      style={monoStyle}
    >
      Loading dossier section...
    </div>
  );
}

const ChangeLogDrawer = dynamic(
  () =>
    import("./components/ChangeLogDrawer").then((mod) => mod.ChangeLogDrawer),
  { ssr: false }
);
const DriverCardModal = dynamic(
  () =>
    import("./components/DriverCardModal").then((mod) => mod.DriverCardModal),
  { ssr: false }
);
const CreateLookModal = dynamic(
  () =>
    import("./components/CreateLookModal").then((mod) => mod.CreateLookModal),
  { ssr: false }
);
const WardrobeDrawer = dynamic(
  () => import("./components/WardrobeDrawer").then((mod) => mod.WardrobeDrawer),
  { ssr: false }
);
const StepBookingsVault = dynamic(
  () =>
    import("./components/steps/StepBookingsVault").then(
      (mod) => mod.StepBookingsVault
    ),
  { loading: () => <StepTabLoadingFallback /> }
);
const StepPrepAndApps = dynamic(
  () =>
    import("./components/steps/StepPrepAndApps").then(
      (mod) => mod.StepPrepAndApps
    ),
  { loading: () => <StepTabLoadingFallback /> }
);
const StepPackingStudio = dynamic(
  () =>
    import("./components/steps/StepPackingStudio").then(
      (mod) => mod.StepPackingStudio
    ),
  { loading: () => <StepTabLoadingFallback /> }
);
const StepGuideAndSos = dynamic(
  () =>
    import("./components/steps/StepGuideAndSos").then(
      (mod) => mod.StepGuideAndSos
    ),
  { loading: () => <StepTabLoadingFallback /> }
);
const StepBudgetAndLedger = dynamic(
  () =>
    import("./components/steps/StepBudgetAndLedger").then(
      (mod) => mod.StepBudgetAndLedger
    ),
  { loading: () => <StepTabLoadingFallback /> }
);

export type { ChangeLogEntry };

const SSR_ANCHOR_DATE = new Date("2026-01-01T00:00:00Z");

export default function ThailandTripDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("itinerary");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [now, setNow] = useState<Date>(SSR_ANCHOR_DATE);
  const detectedTripDayNum = useMemo(
    () => (isHydrated ? detectActiveTripDay(now) : null),
    [isHydrated, now]
  );
  const [isCompanionMode, setIsCompanionMode] = useState(false);
  const didInitMobileCompanionRef = useRef(false);
  const prevDetectedDayRef = useRef<number | null>(null);
  const preCompanionDayRef = useRef<number | null>(null);

  useEffect(() => {
    const syncNow = () => setNow(new Date());
    setIsHydrated(true);
    syncNow();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const startAlignedTicker = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      const msIntoMinute = Date.now() % 60_000;
      const delay = msIntoMinute === 0 ? 60_000 : 60_000 - msIntoMinute;
      timeoutId = setTimeout(() => {
        syncNow();
        intervalId = setInterval(syncNow, 60_000);
      }, delay);
    };

    const handleVisibleOrFocus = () => {
      if (
        typeof document === "undefined" ||
        document.visibilityState === "visible"
      ) {
        syncNow();
        startAlignedTicker();
      }
    };

    startAlignedTicker();
    window.addEventListener("focus", handleVisibleOrFocus);
    document.addEventListener("visibilitychange", handleVisibleOrFocus);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibleOrFocus);
      document.removeEventListener("visibilitychange", handleVisibleOrFocus);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const prevDay = prevDetectedDayRef.current;
    const isFirstHydration = !didInitMobileCompanionRef.current;
    if (!isFirstHydration && prevDay === detectedTripDayNum) {
      return;
    }

    didInitMobileCompanionRef.current = true;
    prevDetectedDayRef.current = detectedTripDayNum;

    if (detectedTripDayNum !== null) {
      setIsCompanionMode(true);
      if (typeof window !== "undefined" && window.innerWidth < 640) {
        setActiveTab("itinerary");
        setPhaseFilter("all");
        setSelectedDayNum(detectedTripDayNum);
      }
    } else if (prevDay !== null) {
      setIsCompanionMode(false);
      if (typeof window !== "undefined" && window.innerWidth < 640) {
        setSelectedDayNum(null);
      }
    }
  }, [isHydrated, detectedTripDayNum]);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<{
    message: string;
    snapshot: PersistedTripState;
  } | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [driverModalHotelId, setDriverModalHotelId] = useState<string | null>(
    null
  );
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);
  const [isPocketDeskOpen, setIsPocketDeskOpen] = useState(false);
  const [isCreateLookModalOpen, setIsCreateLookModalOpen] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<WardrobeOutfit | null>(
    null
  );
  const [wardrobeDrawerTarget, setWardrobeDrawerTarget] =
    useState<WardrobeDrawerTarget | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  // Shared currency converter state (used in QuickPocketDesk & StepBudgetAndLedger)
  const [thbInput, setThbInput] = useState<string>("1000");
  const [gbpInput, setGbpInput] = useState<string>(
    (1000 / TRIP_METADATA.exchangeRateBenchmark).toFixed(2)
  );

  const {
    tripState,
    updateTripState,
    syncStatus,
    isOffline,
    storageError,
    dismissStorageError,
    needsActorSelection,
    dismissActorPrompt,
    fetchFromCloud,
    activeActor,
    handleSetActiveActor,
    countdown,
    allPackingItems,
    allOutfits,
    prepProgress,
    appsProgress,
    packingProgress,
    overallReadinessPct,
    togglePrepItem,
    toggleAppInstalled,
    togglePackingItem,
    addCustomPackingItem,
    removeCustomPackingItem,
    addOutfitGarmentsToPacking,
    addCustomOutfit,
    updateCustomOutfit,
    removeCustomOutfit,
    assignDayOutfit,
    assignActivityOutfit,
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
  } = useThailandTripState();

  const {
    canInstall: canInstallApp,
    isStandalone: isStandaloneApp,
    isIosSafari: isIosSafariBrowser,
    isPrompting: isInstallPrompting,
    installStatusMessage,
    promptInstall: handleInstallApp,
  } = usePwaInstall();

  const handleCopy = (text: string, label?: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedText(label || text);
    setTimeout(() => setCopiedText(null), 2200);
  };

  const handleThbChange = (val: string) => {
    setThbInput(val);
    const num = parseFloat(val.replace(",", "."));
    if (!isNaN(num)) {
      setGbpInput((num / tripState.exchangeRate).toFixed(2));
    } else {
      setGbpInput("");
    }
  };

  const handleGbpChange = (val: string) => {
    setGbpInput(val);
    const num = parseFloat(val.replace(",", "."));
    if (!isNaN(num)) {
      setThbInput(Math.round(num * tripState.exchangeRate).toString());
    } else {
      setThbInput("");
    }
  };

  const handleSelectDayNumFromNav = (dayNum: number | null) => {
    setPhaseFilter("all");
    setSelectedDayNum(dayNum);
  };

  const handleToggleCompanionMode = () => {
    const next = !isCompanionMode;
    if (next) {
      preCompanionDayRef.current = selectedDayNum;
      setIsCompanionMode(true);
      setActiveTab("itinerary");
      setPhaseFilter("all");
      if (selectedDayNum === null) {
        setSelectedDayNum(detectedTripDayNum ?? 1);
      }
      return;
    }

    setIsCompanionMode(false);
    if (detectedTripDayNum === null) {
      setSelectedDayNum(preCompanionDayRef.current);
    }
  };

  const dualClock = useMemo(() => formatDualTimezoneClock(now), [now]);
  const showDualClock =
    isHydrated &&
    (isTravelTransitDay(detectedTripDayNum) ||
      (isCompanionMode && detectedTripDayNum === null));

  const plannedTotalThb = tripState.plannedExpenses.reduce(
    (sum, exp) => sum + exp.amountThb,
    0
  );

  const setQuickThbPreset = (thbAmount: number) => {
    triggerPresetHaptic();
    setThbInput(thbAmount.toString());
    setGbpInput((thbAmount / tripState.exchangeRate).toFixed(2));
  };

  const showUndoSnackbar = (
    message: string,
    snapshot: PersistedTripState
  ) => {
    setUndoState({ message, snapshot });
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    undoTimeoutRef.current = setTimeout(() => {
      setUndoState(null);
    }, 6000);
  };

  const handleUndo = () => {
    if (!undoState) return;
    const { snapshot } = undoState;
    setUndoState(null);
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    updateTripState(() => snapshot);
  };

  const handleTogglePrepItem = (itemId: string) => {
    triggerCheckHaptic();
    togglePrepItem(itemId);
  };

  const handleToggleAppInstalled = (appId: string) => {
    triggerCheckHaptic();
    toggleAppInstalled(appId);
  };

  const handleTogglePackingItem = (itemId: string) => {
    triggerCheckHaptic();
    togglePackingItem(itemId);
  };

  const handleToggleActivityCompleted = (activityId: string) => {
    triggerCheckHaptic();
    toggleActivityCompleted(activityId);
  };

  const handleToggleExpenseBooked = (expenseId: string) => {
    triggerCheckHaptic();
    toggleExpenseBooked(expenseId);
  };

  const handleRemoveCustomActivity = (
    dayNumber: number,
    activityId: string
  ) => {
    const snapshot = tripState;
    const activity = (tripState.customActivitiesByDay[dayNumber] || []).find(
      (a) => a.id === activityId
    );
    triggerDestructiveHaptic();
    removeCustomActivity(dayNumber, activityId);
    showUndoSnackbar(
      activity ? `Removed "${activity.title}"` : "Activity removed",
      snapshot
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    const snapshot = tripState;
    const exp = tripState.plannedExpenses.find((e) => e.id === expenseId);
    triggerDestructiveHaptic();
    deleteExpense(expenseId);
    showUndoSnackbar(
      exp ? `Deleted "${exp.title}"` : "Expense deleted",
      snapshot
    );
  };

  const handleRemoveCustomPackingItem = (itemId: string) => {
    const snapshot = tripState;
    const item = (tripState.customPackingItems || []).find(
      (i) => i.id === itemId
    );
    triggerDestructiveHaptic();
    removeCustomPackingItem(itemId);
    showUndoSnackbar(
      item ? `Removed "${item.label}"` : "Packing item removed",
      snapshot
    );
  };

  const handleRemoveCustomOutfit = (outfitId: string) => {
    const snapshot = tripState;
    const outfit = allOutfits.find((o) => o.id === outfitId);
    triggerDestructiveHaptic();
    removeCustomOutfit(outfitId);
    showUndoSnackbar(
      outfit ? `Removed "${outfit.title}"` : "Lookbook outfit removed",
      snapshot
    );
  };

  const handleDeleteChangeLogEntry = (entryId: string) => {
    const snapshot = tripState;
    triggerDestructiveHaptic();
    deleteChangeLogEntry(entryId);
    showUndoSnackbar("Removed changelog entry", snapshot);
  };

  const handleClearAllChangeLogs = () => {
    const snapshot = tripState;
    triggerDestructiveHaptic();
    clearAllChangeLogs();
    showUndoSnackbar("Cleared change log history", snapshot);
  };

  return (
    <div className="min-h-dvh bg-[#F6F1E7] text-[#1F1A16] pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <TopEditorialBar
        activeActor={activeActor}
        onSetActiveActor={handleSetActiveActor}
        changeLogCount={(tripState.changeLog || []).length}
        onOpenChangeLog={() => setIsChangeLogOpen(true)}
        syncStatus={syncStatus}
        onSyncFromCloud={fetchFromCloud}
        dualClock={dualClock}
        showDualClock={showDualClock}
        isOffline={isOffline}
        storageError={storageError}
        onDismissStorageError={dismissStorageError}
        needsActorSelection={needsActorSelection}
        onDismissActorPrompt={dismissActorPrompt}
        isStandaloneApp={isStandaloneApp}
      />

      <ChangeLogDrawer
        isOpen={isChangeLogOpen}
        onClose={() => setIsChangeLogOpen(false)}
        changeLog={tripState.changeLog || []}
        activeActor={activeActor}
        onSetActiveActor={handleSetActiveActor}
        onDeleteEntry={handleDeleteChangeLogEntry}
        onClearAll={handleClearAllChangeLogs}
      />

      {/* Floating Editorial Copy Stamp Notification */}
      {copiedText && (
        <div
          role="status"
          aria-live="polite"
          className={`${
            driverModalHotelId
              ? "hidden"
              : isPocketDeskOpen
              ? "hidden sm:flex"
              : "flex"
          } fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] inset-x-4 mx-auto w-fit max-w-[calc(100vw-2rem)] z-50 sm:bottom-6 sm:right-6 sm:inset-x-auto sm:mx-0 sm:w-auto items-center gap-3 px-5 py-3.5 bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B] shadow-xl`}
        >
          <span
            style={monoStyle}
            className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#D8B979]"
          >
            COPIED TO FOLIO
          </span>
          <span className="text-sm font-medium">{copiedText}</span>
        </div>
      )}

      {/* Floating Undo Snackbar */}
      {undoState && (
        <div
          data-testid="undo-snackbar"
          role="status"
          aria-live="polite"
          className={`${
            copiedText
              ? "bottom-[calc(9.5rem+env(safe-area-inset-bottom))] sm:bottom-20"
              : "bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-6"
          } fixed inset-x-4 mx-auto w-fit max-w-[calc(100vw-2rem)] z-50 sm:right-6 sm:inset-x-auto sm:mx-0 sm:w-auto flex items-center gap-3 px-4 py-2.5 bg-[#1F1A16] text-[#F6F1E7] border border-[#9E7B3B] shadow-xl`}
        >
          <span className="text-xs sm:text-sm font-medium">
            {undoState.message}
          </span>
          <button
            type="button"
            onClick={handleUndo}
            style={monoStyle}
            className="min-h-11 px-3 py-1.5 bg-[#9E7B3B] hover:bg-[#D8B979] text-[#1F1A16] text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer shrink-0"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => {
              setUndoState(null);
              if (undoTimeoutRef.current) {
                clearTimeout(undoTimeoutRef.current);
                undoTimeoutRef.current = null;
              }
            }}
            aria-label="Dismiss undo notification"
            className="min-h-11 min-w-11 flex items-center justify-center text-[#F6F1E7]/70 hover:text-[#F6F1E7] text-sm cursor-pointer shrink-0"
          >
            &times;
          </button>
        </div>
      )}

      <CreateLookModal
        isOpen={isCreateLookModalOpen}
        editingOutfit={editingOutfit}
        onClose={() => {
          setIsCreateLookModalOpen(false);
          setEditingOutfit(null);
        }}
        onCreateOutfit={(outfitData) => {
          addCustomOutfit(outfitData);
        }}
        onUpdateOutfit={(outfitId, updates) => {
          updateCustomOutfit(outfitId, updates);
        }}
      />

      <WardrobeDrawer
        target={wardrobeDrawerTarget}
        onClose={() => setWardrobeDrawerTarget(null)}
        allOutfits={allOutfits}
        currentDayOutfit={
          wardrobeDrawerTarget
            ? resolveDayOutfit(
                wardrobeDrawerTarget.dayNumber,
                TRIP_DAYS.find(
                  (d) => d.dayNumber === wardrobeDrawerTarget.dayNumber
                )?.defaultOutfitId,
                tripState.dayOutfitByDay,
                allOutfits
              )
            : undefined
        }
        currentActivityOutfit={
          wardrobeDrawerTarget?.activity
            ? resolveActivityOutfit(
                wardrobeDrawerTarget.activity,
                tripState.activityOutfitById,
                allOutfits
              )
            : undefined
        }
        onAssignDayOutfit={assignDayOutfit}
        onAssignActivityOutfit={assignActivityOutfit}
        onRemoveCustomOutfit={handleRemoveCustomOutfit}
        onEditOutfit={(outfit) => {
          setEditingOutfit(outfit);
          setIsCreateLookModalOpen(true);
        }}
        onToggleOutfitInspiration={(outfit) => {
          updateCustomOutfit(outfit.id, {
            ...outfit,
            isInspiration: !isInspirationOutfit(outfit),
          });
        }}
        onOpenCreateLookModal={() => {
          setEditingOutfit(null);
          setIsCreateLookModalOpen(true);
        }}
      />

      <QuickPocketDesk
        exchangeRate={tripState.exchangeRate}
        thbInput={thbInput}
        gbpInput={gbpInput}
        onThbChange={handleThbChange}
        onGbpChange={handleGbpChange}
        onSetQuickThbPreset={setQuickThbPreset}
        onCopy={handleCopy}
        onOpenDriverModal={(hotelId) => setDriverModalHotelId(hotelId)}
        changeLogCount={(tripState.changeLog || []).length}
        onOpenChangeLog={() => setIsChangeLogOpen(true)}
        isOpen={isPocketDeskOpen}
        onOpenChange={setIsPocketDeskOpen}
        onJumpToBudget={() => setActiveTab("budget")}
        copiedText={copiedText}
        dualClock={dualClock}
      />

      <div
        style={{ overflowAnchor: "none" }}
        className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-12"
      >
        <EditorialMasthead
          countdown={countdown}
          overallReadinessPct={overallReadinessPct}
          prepProgress={prepProgress}
          appsProgress={appsProgress}
          packingProgress={packingProgress}
          onSelectTab={setActiveTab}
        />

        <StickyStepNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          prepProgress={prepProgress}
          appsProgress={appsProgress}
          packingProgress={packingProgress}
          selectedDayNum={selectedDayNum}
          onSelectDayNum={handleSelectDayNumFromNav}
          activeActor={activeActor}
          onSetActiveActor={handleSetActiveActor}
          changeLogCount={(tripState.changeLog || []).length}
          onOpenChangeLog={() => setIsChangeLogOpen(true)}
          syncStatus={syncStatus}
          onSyncFromCloud={fetchFromCloud}
          onOpenPocketDesk={() => setIsPocketDeskOpen(true)}
          isPocketOpen={isPocketDeskOpen}
          onOpenDriverModal={(hotelId) => setDriverModalHotelId(hotelId)}
          budgetSummary={{
            plannedTotalThb,
            exchangeRate: tripState.exchangeRate,
          }}
          canInstallApp={canInstallApp}
          isStandaloneApp={isStandaloneApp}
          isIosSafariBrowser={isIosSafariBrowser}
          isInstallPrompting={isInstallPrompting}
          installStatusMessage={installStatusMessage}
          onInstallApp={handleInstallApp}
        />

        {activeTab === "itinerary" && (
          <StepItinerary
            tripState={tripState}
            phaseFilter={phaseFilter}
            onSetPhaseFilter={setPhaseFilter}
            selectedDayNum={selectedDayNum}
            onSelectDayNum={setSelectedDayNum}
            onToggleActivityCompleted={handleToggleActivityCompleted}
            onAddCustomActivity={addCustomActivity}
            onRemoveCustomActivity={handleRemoveCustomActivity}
            onUpdateCustomActivity={updateCustomActivity}
            allOutfits={allOutfits}
            onOpenWardrobeDrawer={(dayNumber, activity) =>
              setWardrobeDrawerTarget({ dayNumber, activity })
            }
            isCompanionMode={isCompanionMode}
            onToggleCompanionMode={handleToggleCompanionMode}
            detectedTripDayNum={detectedTripDayNum}
            now={now}
            onOpenDriverModal={(hotelId) => setDriverModalHotelId(hotelId)}
            onCopy={handleCopy}
          />
        )}

        {activeTab === "bookings" && (
          <StepBookingsVault
            pavilionsBalancePaid={tripState.pavilionsBalancePaid}
            onTogglePavilionsBalancePaid={togglePavilionsBalancePaid}
            onCopy={handleCopy}
            onOpenDriverModal={(hotelId) => setDriverModalHotelId(hotelId)}
          />
        )}

        {activeTab === "prep" && (
          <StepPrepAndApps
            completedPrepIds={tripState.completedPrepIds}
            installedAppIds={tripState.installedAppIds}
            appsProgress={appsProgress}
            onTogglePrepItem={handleTogglePrepItem}
            onToggleAppInstalled={handleToggleAppInstalled}
          />
        )}

        {activeTab === "packing" && (
          <StepPackingStudio
            allPackingItems={allPackingItems}
            packedItemIds={tripState.packedItemIds}
            packingProgress={packingProgress}
            onTogglePackingItem={handleTogglePackingItem}
            onAddCustomPackingItem={addCustomPackingItem}
            onRemoveCustomPackingItem={handleRemoveCustomPackingItem}
            onPackOutfitGarments={addOutfitGarmentsToPacking}
            allOutfits={allOutfits}
            dayOutfitByDay={tripState.dayOutfitByDay}
            onAssignDayOutfit={assignDayOutfit}
            onRemoveCustomOutfit={handleRemoveCustomOutfit}
            onEditOutfit={(outfit) => {
              setEditingOutfit(outfit);
              setIsCreateLookModalOpen(true);
            }}
            onToggleOutfitInspiration={(outfit) => {
              updateCustomOutfit(outfit.id, {
                ...outfit,
                isInspiration: !isInspirationOutfit(outfit),
              });
            }}
            onOpenCreateLookModal={() => {
              setEditingOutfit(null);
              setIsCreateLookModalOpen(true);
            }}
          />
        )}

        {activeTab === "guide" && <StepGuideAndSos />}

        {activeTab === "budget" && (
          <StepBudgetAndLedger
            exchangeRate={tripState.exchangeRate}
            thbInput={thbInput}
            gbpInput={gbpInput}
            onThbChange={handleThbChange}
            onGbpChange={handleGbpChange}
            onSetQuickThbPreset={setQuickThbPreset}
            plannedExpenses={tripState.plannedExpenses}
            onAddPlannedExpense={addPlannedExpense}
            onToggleExpenseBooked={handleToggleExpenseBooked}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
      </div>

      <DriverCardModal
        hotelId={driverModalHotelId}
        onClose={() => setDriverModalHotelId(null)}
        onCopy={handleCopy}
        copiedText={copiedText}
      />
    </div>
  );
}
