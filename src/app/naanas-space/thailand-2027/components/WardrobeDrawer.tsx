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

  if (!target) return null;

  const dayObj = TRIP_DAYS.find((d) => d.dayNumber === target.dayNumber);
  const isActivityMode = Boolean(target.activity);
  const activeOutfit = isActivityMode
    ? currentActivityOutfit
    : currentDayOutfit;

  const requirement = target.activity
    ? detectActivityDressCodeRequirement(target.activity)
    : { requiredCode: null, contextTitle: null };

  const activeValidation = target.activity
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

  const handleSelectOutfit = (outfitId: string) => {
    if (isActivityMode && target.activity) {
      const nextId = currentActivityOutfit?.id === outfitId ? null : outfitId;
      onAssignActivityOutfit(target.dayNumber, target.activity.id, nextId);
    } else {
      const nextId = currentDayOutfit?.id === outfitId ? null : outfitId;
      onAssignDayOutfit(target.dayNumber, nextId);
    }
  };

  const handleClearAssignment = () => {
    if (isActivityMode && target.activity) {
      onAssignActivityOutfit(target.dayNumber, target.activity.id, null);
    } else {
      onAssignDayOutfit(target.dayNumber, null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        isActivityMode && target.activity
          ? `Assign outfit override for ${target.activity.title}`
          : `Assign daily attire for Day ${formatDayNumber(target.dayNumber)}`
      }
      className="fixed inset-0 z-50 bg-[#1F1A16]/75 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F3] border-l-2 border-[#1F1A16] w-full max-w-2xl h-full flex flex-col justify-between shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#1F1A16]/20 bg-[#EFE7D8]/70 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
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
                style={serifStyle}
                className="text-2xl sm:text-3xl font-normal text-[#1F1A16] mt-0.5"
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
              className="px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0"
            >
              Close &#10005;
            </button>
          </div>

          {/* Contextual Dress Code Requirement & Conflict Warning Banner */}
          {requirement.requiredCode && (
            <div className="p-3 bg-[#FBF8F3] border-l-2 border-[#13382E] text-xs space-y-1">
              <div
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.16em] text-[#13382E] font-semibold"
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
                className="text-[10px] uppercase tracking-[0.16em] text-[#A8442A] font-bold"
              >
                &#9888; {activeValidation.headline}
              </div>
              <p className="text-[#1F1A16] leading-relaxed">
                {activeValidation.message}
              </p>
            </div>
          )}

          {/* Filter Pills & Clear / Create Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1F1A16]/15">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex flex-wrap gap-1">
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
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border cursor-pointer ${
                      filterCode === tab.id
                        ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                        : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 pl-1.5 border-l border-[#1F1A16]/15">
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
                    className={`px-2 py-1 text-[10px] uppercase tracking-wider border cursor-pointer ${
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
            </div>

            <div className="flex items-center gap-2">
              {activeOutfit && (
                <button
                  type="button"
                  onClick={handleClearAssignment}
                  style={monoStyle}
                  className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#A8442A] border border-[#A8442A]/40 hover:bg-[#A8442A] hover:text-[#FBF8F3] cursor-pointer"
                >
                  Clear Slot
                </button>
              )}
              <button
                type="button"
                onClick={onOpenCreateLookModal}
                style={monoStyle}
                className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-[#13382E] text-[#F6F1E7] cursor-pointer"
              >
                + Create New Look
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Wardrobe Polaroid Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredOutfits.map((outfit) => {
              const candidateConflict = target.activity
                ? validateOutfitForActivity(outfit, target.activity)
                : null;

              return (
                <div key={outfit.id} className="space-y-2 flex flex-col">
                  {candidateConflict?.hasConflict && (
                    <div
                      style={monoStyle}
                      className="px-2.5 py-1 bg-[#A8442A]/12 border border-[#A8442A]/40 text-[#A8442A] text-[9px] uppercase tracking-wider font-semibold"
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
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#1F1A16]/20 bg-[#EFE7D8]/60 flex items-center justify-between">
          <span style={monoStyle} className="text-[11px] text-[#5C5248]">
            CURRENTLY ASSIGNED:{" "}
            <strong className="text-[#1F1A16]">
              {activeOutfit
                ? activeOutfit.title
                : isActivityMode && currentDayOutfit
                ? `Inherits Day Look (${currentDayOutfit.title})`
                : "None"}
            </strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            style={monoStyle}
            className="px-4 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-[10px] uppercase tracking-wider cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
