import React from "react";
import { TRIP_DAYS } from "@/lib/thailandTripData";
import { ActiveTab, ProgressMetric } from "../types";
import { serifStyle, monoStyle } from "../styles";
import { formatDayNumber } from "../utils/formatters";

interface StickyStepNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  prepProgress: ProgressMetric;
  appsProgress: ProgressMetric;
  packingProgress: ProgressMetric;
  selectedDayNum: number | null;
  onSelectDayNum: (dayNum: number | null) => void;
}

export function StickyStepNav({
  activeTab,
  onSelectTab,
  prepProgress,
  appsProgress,
  packingProgress,
  selectedDayNum,
  onSelectDayNum,
}: StickyStepNavProps) {
  return (
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
              onClick={() => onSelectTab(tab.id)}
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
            onClick={() => onSelectDayNum(null)}
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
                onClick={() => onSelectDayNum(isSelected ? null : d.dayNumber)}
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
  );
}
