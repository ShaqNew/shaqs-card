import React, { useState } from "react";
import {
  TRIP_DAYS,
  ItineraryActivity,
  WardrobeOutfit,
  DressCodeProfile,
} from "@/lib/thailandTripData";
import { serifStyle, monoStyle } from "../styles";
import { formatDayNumber } from "../utils/formatters";
import {
  DRESS_CODE_METADATA,
  detectActivityDressCodeRequirement,
  isInspirationOutfit,
  validateOutfitForActivity,
} from "../utils/wardrobe";
import { PolaroidOutfitCard } from "./PolaroidOutfitCard";
import { useBottomSheetDialog } from "../hooks/useBottomSheetDialog";

export interface WardrobeDrawerTarget {
  dayNumber: number;
  activity?: ItineraryActivity;
}

interface WardrobeDrawerProps {
  target: WardrobeDrawerTarget | null;
  onClose: () => void;
  allOutfits: WardrobeOutfit[];
  currentDayOutfit?: WardrobeOutfit;
  currentActivityOutfit?: WardrobeOutfit;
  onAssignDayOutfit: (dayNumber: number, outfitId: string | null) => void;
  onAssignActivityOutfit: (
    dayNumber: number,
    activityId: string,
    outfitId: string | null
  ) => void;
  onEditOutfit?: (outfit: WardrobeOutfit) => void;
  onToggleOutfitInspiration?: (outfit: WardrobeOutfit) => void;
  onRemoveCustomOutfit?: (outfitId: string) => void;
  onOpenCreateLookModal: () => void;
}

export function WardrobeDrawer({
  target,
  onClose,
  allOutfits,
  currentDayOutfit,
  currentActivityOutfit,
  onAssignDayOutfit,
  onAssignActivityOutfit,
  onEditOutfit,
  onToggleOutfitInspiration,
  onRemoveCustomOutfit,
  onOpenCreateLookModal,
}: WardrobeDrawerProps) {
  const [filterCode, setFilterCode] = useState<"all" | DressCodeProfile>("all");
  const [filterSource, setFilterSource] = useState<"all" | "owned" | "inspo">(
    "all"
  );
  const [isDrawerFiltersOpen, setIsDrawerFiltersOpen] = useState(true);
  const [collapsedDrawerCards, setCollapsedDrawerCards] = useState<
    Record<string, boolean>
  >({});

  const isOpen = Boolean(target);
  const { dialogRef, handleDialogClose } = useBottomSheetDialog({
    open: isOpen,
    onClose,
    desktopMode: "modal",
    lightDismiss: true,
  });

  const dayObj = target
    ? TRIP_DAYS.find((d) => d.dayNumber === target.dayNumber)
    : undefined;
  const isActivityMode = Boolean(target?.activity);
  const activeOutfit = isActivityMode
    ? currentActivityOutfit
    : currentDayOutfit;

  const requirement = target?.activity
    ? detectActivityDressCodeRequirement(target.activity)
    : { requiredCode: null, contextTitle: null };

  const activeValidation = target?.activity
    ? validateOutfitForActivity(
        currentActivityOutfit || currentDayOutfit,
        target.activity
      )
    : null;

  const filteredOutfits = allOutfits.filter((o) => {
    if (filterCode !== "all" && o.dressCode !== filterCode) return false;
    if (filterSource === "owned" && isInspirationOutfit(o)) return false;
    if (filterSource === "inspo" && !isInspirationOutfit(o)) return false;
    return true;
  });

  const activeDrawerFilterCount =
    (filterCode !== "all" ? 1 : 0) + (filterSource !== "all" ? 1 : 0);

  const allDrawerCardsCollapsed =
    filteredOutfits.length > 0 &&
    filteredOutfits.every((o) => collapsedDrawerCards[o.id]);

  const handleToggleAllDrawerCards = () => {
    if (allDrawerCardsCollapsed) {
      setCollapsedDrawerCards({});
    } else {
      const next: Record<string, boolean> = {};
      allOutfits.forEach((o) => {
        next[o.id] = true;
      });
      setCollapsedDrawerCards(next);
    }
  };

  const toggleDrawerCardCollapse = (outfitId: string) => {
    setCollapsedDrawerCards((prev) => ({
      ...prev,
      [outfitId]: !prev[outfitId],
    }));
  };

  const handleSelectOutfit = (outfitId: string) => {
    if (!target) return;
    if (isActivityMode && target.activity) {
      const nextId = currentActivityOutfit?.id === outfitId ? null : outfitId;
      onAssignActivityOutfit(target.dayNumber, target.activity.id, nextId);
    } else {
      const nextId = currentDayOutfit?.id === outfitId ? null : outfitId;
      onAssignDayOutfit(target.dayNumber, nextId);
    }
  };

  const handleClearAssignment = () => {
    if (!target) return;
    if (isActivityMode && target.activity) {
      onAssignActivityOutfit(target.dayNumber, target.activity.id, null);
    } else {
      onAssignDayOutfit(target.dayNumber, null);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-labelledby="wardrobe-drawer-title"
      onClose={handleDialogClose}
      className="[&:not([open])]:hidden open:flex open:flex-col fixed inset-x-0 bottom-0 top-auto m-0 mt-auto w-full max-w-none max-h-[88dvh] rounded-t-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:my-0 sm:h-dvh sm:max-h-dvh sm:max-w-2xl sm:rounded-none bg-[#F6F1E7] text-[#1F1A16] border-t sm:border-t-0 sm:border-l border-[#C9BFA8] shadow-2xl p-0 z-50 overflow-hidden overscroll-contain backdrop:bg-[#1F1A16]/60 backdrop:backdrop-blur-[2px] backdrop:overflow-hidden backdrop:overscroll-contain"
    >
      {target && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Mobile Drag Handle */}
          <div
            data-sheet-drag-handle="true"
            className="sm:hidden shrink-0 flex justify-center pt-2.5 pb-1 bg-[#EFE7D8]/70"
          >
            <span className="w-10 h-1 rounded-full bg-[#1F1A16]/25" />
          </div>

          {/* Sticky Drawer Header */}
          <div className="shrink-0 p-4 sm:p-6 border-b border-[#1F1A16]/20 bg-[#EFE7D8]/70 space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span
                  style={monoStyle}
                  className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#A8442A] font-semibold block"
                >
                  {isActivityMode
                    ? `ACTIVITY ATTIRE OVERRIDE • DAY ${formatDayNumber(
                        target.dayNumber
                      )}`
                    : `DAILY ATTIRE SLOT • DAY ${formatDayNumber(
                        target.dayNumber
                      )}`}
                </span>
                <h3
                  id="wardrobe-drawer-title"
                  style={serifStyle}
                  className="text-2xl sm:text-3xl font-normal text-[#1F1A16] mt-0.5 truncate"
                >
                  {isActivityMode && target.activity
                    ? target.activity.title
                    : dayObj?.title || `Day ${formatDayNumber(target.dayNumber)}`}
                </h3>
                <p className="text-xs text-[#5C5248] mt-1">
                  {isActivityMode
                    ? "Select a specific look from the Digital Wardrobe for this movement, or revert to the day's primary attire."
                    : `Assign a primary look for ${
                        dayObj?.dateLabel || "this day"
                      } (${dayObj?.weatherSummary || "Tropical Warmth"}).`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={monoStyle}
                className="min-h-11 sm:min-h-0 px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0"
              >
                Close &#10005;
              </button>
            </div>

            {/* Assigned Outfit Summary Banner */}
            <div className="px-3 py-2 bg-[#FBF8F3] border border-[#1F1A16]/15 flex items-center justify-between gap-2 text-xs">
              <span style={monoStyle} className="text-[11px] text-[#5C5248] truncate">
                CURRENTLY ASSIGNED:{" "}
                <strong className="text-[#1F1A16]">
                  {activeOutfit
                    ? activeOutfit.title
                    : isActivityMode && currentDayOutfit
                    ? `Inherits Day Look (${currentDayOutfit.title})`
                    : "None"}
                </strong>
              </span>
            </div>

            {/* Contextual Dress Code Requirement & Conflict Warning Banner */}
            {requirement.requiredCode && (
              <div className="p-3 bg-[#FBF8F3] border-l-2 border-[#13382E] text-xs space-y-1">
                <div
                  style={monoStyle}
                  className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#13382E] font-semibold"
                >
                  REQUIRED ETIQUETTE: {requirement.contextTitle}
                </div>
                <p className="text-[#4A4036]">
                  {DRESS_CODE_METADATA[requirement.requiredCode].ruleSummary}
                </p>
              </div>
            )}

            {activeValidation?.hasConflict && (
              <div
                role="alert"
                className="p-3.5 bg-[#A8442A]/12 border-2 border-[#A8442A] text-xs space-y-1"
              >
                <div
                  style={monoStyle}
                  className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#A8442A] font-bold"
                >
                  &#9888; {activeValidation.headline}
                </div>
                <p className="text-[#1F1A16] leading-relaxed">
                  {activeValidation.message}
                </p>
              </div>
            )}

            {/* Collapsible Horizontally Scrollable Filter Section */}
            <div className="pt-2 border-t border-[#1F1A16]/15 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsDrawerFiltersOpen((prev) => !prev)}
                    aria-expanded={isDrawerFiltersOpen}
                    aria-label="Toggle Wardrobe Drawer filters"
                    style={monoStyle}
                    className={`min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-wider border cursor-pointer transition-colors ${
                      isDrawerFiltersOpen
                        ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                        : "bg-[#FBF8F3] text-[#1F1A16] border-[#1F1A16]/25"
                    }`}
                  >
                    Filters
                    {activeDrawerFilterCount > 0
                      ? ` (${activeDrawerFilterCount})`
                      : ""}{" "}
                    {isDrawerFiltersOpen ? "▲" : "▼"}
                  </button>

                  {filteredOutfits.length > 0 && (
                    <button
                      type="button"
                      onClick={handleToggleAllDrawerCards}
                      style={monoStyle}
                      className="min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-wider border border-[#13382E]/35 text-[#13382E] bg-[#FBF8F3] hover:bg-[#13382E] hover:text-[#F6F1E7] cursor-pointer transition-colors"
                    >
                      {allDrawerCardsCollapsed
                        ? "Expand Cards ▼"
                        : "Collapse Cards ▲"}
                    </button>
                  )}
                </div>
              </div>

              {isDrawerFiltersOpen && (
                <div className="flex flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-center gap-1.5 pt-1 pb-1">
                  {[
                    { id: "all", label: "All Looks" },
                    { id: "temple", label: "Temple" },
                    { id: "rooftop", label: "Rooftop" },
                    { id: "daytime", label: "Daytime" },
                    { id: "beach", label: "Beach" },
                    { id: "transit", label: "Transit" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setFilterCode(tab.id as "all" | DressCodeProfile)
                      }
                      style={monoStyle}
                      className={`min-h-11 sm:min-h-0 shrink-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-wider border cursor-pointer ${
                        filterCode === tab.id
                          ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                          : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  <span className="h-5 w-px bg-[#1F1A16]/15 shrink-0 mx-0.5" />

                  {[
                    { id: "all", label: "All Sources" },
                    { id: "owned", label: "✓ Owned" },
                    { id: "inspo", label: "✦ Inspiration" },
                  ].map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() =>
                        setFilterSource(src.id as "all" | "owned" | "inspo")
                      }
                      style={monoStyle}
                      className={`min-h-11 sm:min-h-0 shrink-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-wider border cursor-pointer ${
                        filterSource === src.id
                          ? src.id === "inspo"
                            ? "bg-[#9E7B3B] text-[#FBF8F3] border-[#9E7B3B]"
                            : "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                          : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Wardrobe Polaroid Cards Grid (2-col on mobile) */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <div
              data-testid="wardrobe-drawer-grid"
              className="grid grid-cols-2 gap-3 sm:gap-5 items-start"
            >
              {filteredOutfits.map((outfit) => {
                const candidateConflict = target.activity
                  ? validateOutfitForActivity(outfit, target.activity)
                  : null;

                return (
                  <div key={outfit.id} className="space-y-2 flex flex-col">
                    {candidateConflict?.hasConflict && (
                      <div
                        style={monoStyle}
                        className="px-2 py-1 bg-[#A8442A]/12 border border-[#A8442A]/40 text-[#A8442A] text-[10px] uppercase tracking-wider font-semibold"
                      >
                        &#9888; {candidateConflict.headline}
                      </div>
                    )}
                    <PolaroidOutfitCard
                      outfit={outfit}
                      compact
                      isSelected={activeOutfit?.id === outfit.id}
                      onSelectOutfit={handleSelectOutfit}
                      onEditOutfit={onEditOutfit}
                      onToggleInspiration={onToggleOutfitInspiration}
                      onRemoveCustomOutfit={onRemoveCustomOutfit}
                      isCardCollapsed={Boolean(collapsedDrawerCards[outfit.id])}
                      onToggleCardCollapse={toggleDrawerCardCollapse}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Drawer Footer Action Bar */}
          <div className="shrink-0 sticky bottom-0 bg-[#EFE7D8] border-t border-[#D8CEBC] px-4 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenCreateLookModal}
                style={monoStyle}
                className="min-h-11 px-3 py-1.5 text-[11px] sm:text-[10px] uppercase tracking-wider bg-[#13382E] text-[#F6F1E7] font-semibold cursor-pointer"
              >
                + Create Custom Look
              </button>
              {activeOutfit && (
                <button
                  type="button"
                  onClick={handleClearAssignment}
                  style={monoStyle}
                  className="min-h-11 px-3 py-1.5 text-[11px] sm:text-[10px] uppercase tracking-wider text-[#A8442A] border border-[#A8442A]/40 hover:bg-[#A8442A] hover:text-[#FBF8F3] cursor-pointer"
                >
                  Clear Outfit
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              className="min-h-11 px-4 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-[11px] sm:text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
