"use client";

import React, { useState } from "react";
import { TRIP_METADATA, TRIP_DAYS, WardrobeOutfit } from "@/lib/thailandTripData";
import { ActiveTab, PhaseFilter, ChangeLogEntry } from "./types";
import { monoStyle } from "./styles";
import { useThailandTripState } from "./hooks/useThailandTripState";
import {
  resolveDayOutfit,
  resolveActivityOutfit,
} from "./utils/wardrobe";
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

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [driverModalHotelId, setDriverModalHotelId] = useState<string | null>(
    null
  );
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#1F1A16] pb-24">
      <TopEditorialBar
        activeActor={activeActor}
        onSetActiveActor={handleSetActiveActor}
        changeLogCount={(tripState.changeLog || []).length}
        onOpenChangeLog={() => setIsChangeLogOpen(true)}
        syncStatus={syncStatus}
        onSyncFromCloud={fetchFromCloud}
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

      <DriverCardModal
        hotelId={driverModalHotelId}
        onClose={() => setDriverModalHotelId(null)}
        onCopy={handleCopy}
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
        onCopy={handleCopy}
        onOpenDriverModal={(hotelId) => setDriverModalHotelId(hotelId)}
        changeLogCount={(tripState.changeLog || []).length}
        onOpenChangeLog={() => setIsChangeLogOpen(true)}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
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
          onSelectDayNum={setSelectedDayNum}
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
            allOutfits={allOutfits}
            dayOutfitByDay={tripState.dayOutfitByDay}
            onAssignDayOutfit={assignDayOutfit}
            onRemoveCustomOutfit={removeCustomOutfit}
            onEditOutfit={(outfit) => {
              setEditingOutfit(outfit);
              setIsCreateLookModalOpen(true);
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
