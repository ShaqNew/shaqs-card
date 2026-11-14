"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { TRIP_METADATA, TRIP_DAYS, WardrobeOutfit } from "@/lib/thailandTripData";
import { ActiveTab, PhaseFilter, ChangeLogEntry } from "./types";
import { monoStyle } from "./styles";
import { useThailandTripState } from "./hooks/useThailandTripState";
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
import { ChangeLogDrawer } from "./components/ChangeLogDrawer";
import { DriverCardModal } from "./components/DriverCardModal";
import { QuickPocketDesk } from "./components/QuickPocketDesk";
import { EditorialMasthead } from "./components/EditorialMasthead";
import { StickyStepNav } from "./components/StickyStepNav";
import { CreateLookModal } from "./components/CreateLookModal";
import {
  WardrobeDrawer,
  WardrobeDrawerTarget,
} from "./components/WardrobeDrawer";
import { StepItinerary } from "./components/steps/StepItinerary";
import { StepBookingsVault } from "./components/steps/StepBookingsVault";
import { StepPrepAndApps } from "./components/steps/StepPrepAndApps";
import { StepPackingStudio } from "./components/steps/StepPackingStudio";
import { StepGuideAndSos } from "./components/steps/StepGuideAndSos";
import { StepBudgetAndLedger } from "./components/steps/StepBudgetAndLedger";

export type { ChangeLogEntry };

export default function ThailandTripDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("itinerary");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const detectedTripDayNum = useMemo(() => detectActiveTripDay(now), [now]);
  const [isCompanionMode, setIsCompanionMode] = useState<boolean>(
    () => detectActiveTripDay(new Date()) !== null
  );
  const didInitMobileCompanionRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (didInitMobileCompanionRef.current) return;
    didInitMobileCompanionRef.current = true;
    const activeDay = detectActiveTripDay(now);
    if (
      activeDay !== null &&
      typeof window !== "undefined" &&
      window.innerWidth < 640
    ) {
      setActiveTab("itinerary");
      setPhaseFilter("all");
      setSelectedDayNum(activeDay);
    }
  }, [now]);

  const [copiedText, setCopiedText] = useState<string | null>(null);
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

  // Shared currency converter state (used in QuickPocketDesk & StepBudgetAndLedger)
  const [thbInput, setThbInput] = useState<string>("1000");
  const [gbpInput, setGbpInput] = useState<string>(
    (1000 / TRIP_METADATA.exchangeRateBenchmark).toFixed(2)
  );

  const {
    tripState,
    syncStatus,
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
    setIsCompanionMode((prev) => {
      const next = !prev;
      if (next) {
        setActiveTab("itinerary");
        setPhaseFilter("all");
        if (selectedDayNum === null) {
          setSelectedDayNum(detectedTripDayNum ?? 1);
        }
      }
      return next;
    });
  };

  const dualClock = useMemo(() => formatDualTimezoneClock(now), [now]);
  const showDualClock =
    isCompanionMode ||
    detectedTripDayNum !== null ||
    isTravelTransitDay(selectedDayNum);

  const plannedTotalThb = tripState.plannedExpenses.reduce(
    (sum, exp) => sum + exp.amountThb,
    0
  );

  const setQuickThbPreset = (thbAmount: number) => {
    setThbInput(thbAmount.toString());
    setGbpInput((thbAmount / tripState.exchangeRate).toFixed(2));
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
      />

      <ChangeLogDrawer
        isOpen={isChangeLogOpen}
        onClose={() => setIsChangeLogOpen(false)}
        changeLog={tripState.changeLog || []}
        activeActor={activeActor}
        onSetActiveActor={handleSetActiveActor}
        onDeleteEntry={deleteChangeLogEntry}
        onClearAll={clearAllChangeLogs}
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

      <DriverCardModal
        hotelId={driverModalHotelId}
        onClose={() => setDriverModalHotelId(null)}
        onCopy={handleCopy}
        copiedText={copiedText}
      />

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
        onRemoveCustomOutfit={removeCustomOutfit}
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
        />

        {activeTab === "itinerary" && (
          <StepItinerary
            tripState={tripState}
            phaseFilter={phaseFilter}
            onSetPhaseFilter={setPhaseFilter}
            selectedDayNum={selectedDayNum}
            onSelectDayNum={setSelectedDayNum}
            onToggleActivityCompleted={toggleActivityCompleted}
            onAddCustomActivity={addCustomActivity}
            onRemoveCustomActivity={removeCustomActivity}
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
            onTogglePrepItem={togglePrepItem}
            onToggleAppInstalled={toggleAppInstalled}
          />
        )}

        {activeTab === "packing" && (
          <StepPackingStudio
            allPackingItems={allPackingItems}
            packedItemIds={tripState.packedItemIds}
            packingProgress={packingProgress}
            onTogglePackingItem={togglePackingItem}
            onAddCustomPackingItem={addCustomPackingItem}
            onRemoveCustomPackingItem={removeCustomPackingItem}
            onPackOutfitGarments={addOutfitGarmentsToPacking}
            allOutfits={allOutfits}
            dayOutfitByDay={tripState.dayOutfitByDay}
            onAssignDayOutfit={assignDayOutfit}
            onRemoveCustomOutfit={removeCustomOutfit}
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
            onToggleExpenseBooked={toggleExpenseBooked}
            onDeleteExpense={deleteExpense}
          />
        )}
      </div>
    </div>
  );
}
