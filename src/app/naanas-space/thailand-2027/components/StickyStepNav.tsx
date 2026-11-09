import React, { useState, useEffect } from "react";
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
  isScrolled?: boolean;
}

// Delay compaction until the user has scrolled 72px past the sticky top edge,
// and keep a 64px hysteresis deadband (-72px to -8px) so slow scrolling never oscillates.
const COLLAPSE_THRESHOLD_PX = -72;
const EXPAND_THRESHOLD_PX = -8;
const TOP_RESET_SCROLL_Y = 16;

export function StickyStepNav({
  activeTab,
  onSelectTab,
  prepProgress,
  appsProgress,
  packingProgress,
  selectedDayNum,
  onSelectDayNum,
  isScrolled: controlledIsScrolled,
}: StickyStepNavProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [internalScrolled, setInternalScrolled] = useState(false);
  const isScrolled = controlledIsScrolled ?? internalScrolled;

  useEffect(() => {
    if (controlledIsScrolled !== undefined) return;

    const checkSticky = () => {
      if (!sentinelRef.current) return;
      // If at or near the very top of the page, always reset to expanded
      if (
        typeof window !== "undefined" &&
        window.scrollY <= TOP_RESET_SCROLL_Y
      ) {
        setInternalScrolled((prev) => (prev ? false : prev));
        return;
      }
      const rect = sentinelRef.current.getBoundingClientRect();
      setInternalScrolled((prev) => {
        if (prev) {
          // Hysteresis deadband: once collapsed, stay compact until the user scrolls
          // back up close to the unstick point (rect.top >= -8px).
          return rect.top < EXPAND_THRESHOLD_PX;
        }
        // Collapse only after scrolling 72px past the point where the navbar sticks
        return rect.top <= COLLAPSE_THRESHOLD_PX;
      });
    };

    checkSticky();

    window.addEventListener("scroll", checkSticky, { passive: true });
    return () => window.removeEventListener("scroll", checkSticky);
  }, [controlledIsScrolled]);

  const handleScrollToChronometer = () => {
    const chronometerEl = document.getElementById("masthead-chronometer");
    if (chronometerEl && typeof chronometerEl.scrollIntoView === "function") {
      chronometerEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Invisible sentinel placed immediately above the sticky nav to measure scroll depth past the sticky threshold */}
      <div
        ref={sentinelRef}
        data-testid="sticky-nav-sentinel"
        style={{ overflowAnchor: "none" }}
        className="h-px -mb-px w-full pointer-events-none opacity-0"
        aria-hidden="true"
      />
      <div
        id="step-content-anchor"
        data-scrolled={isScrolled ? "true" : "false"}
        style={{ overflowAnchor: "none" }}
        className={`sticky top-0 z-30 mb-6 sm:mb-8 transition-shadow duration-300 motion-reduce:transition-none bg-[#F6F1E7]/95 backdrop-blur-md border-y border-[#1F1A16]/20 ${
          isScrolled
            ? "shadow-[0_4px_16px_rgba(31,26,22,0.12)]"
            : "shadow-[0_4px_16px_rgba(31,26,22,0.06)]"
        }`}
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
                className={`group flex flex-col items-start justify-between text-left transition-all duration-300 ease-in-out motion-reduce:transition-none cursor-pointer relative ${
                  isScrolled ? "px-2.5 py-1.5 sm:p-4" : "p-3 sm:p-4"
                } ${
                  isActive
                    ? "bg-[#13382E] text-[#F6F1E7]"
                    : "hover:bg-[#EFE7D8]/80 text-[#1F1A16]"
                }`}
              >
                <div
                  className={`w-full ${
                    isScrolled
                      ? "flex items-baseline justify-between gap-1.5 sm:block"
                      : "block"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between ${
                      isScrolled
                        ? "shrink-0 sm:w-full sm:mb-1"
                        : "w-full mb-1"
                    }`}
                  >
                    <span
                      style={serifStyle}
                      className={`italic transition-all duration-300 ${
                        isScrolled
                          ? "text-[10px] sm:text-sm"
                          : "text-xs sm:text-sm"
                      } ${isActive ? "text-[#D8B979]" : "text-[#9E7B3B]"}`}
                    >
                      Step {tab.numeral}
                    </span>
                    {isActive && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-[#D8B979] ${
                          isScrolled ? "hidden sm:inline-block" : "inline-block"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    style={serifStyle}
                    className={`font-semibold leading-tight tracking-tight block truncate transition-all duration-300 ${
                      isScrolled
                        ? "text-[13px] sm:text-xl flex-1 sm:flex-none"
                        : "text-lg sm:text-xl"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isActive && isScrolled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8B979] shrink-0 sm:hidden" />
                  )}
                </div>
                <div
                  data-testid="step-nav-sublabel"
                  className={`transition-[max-height,opacity,margin] duration-300 ease-in-out motion-reduce:transition-none overflow-hidden ${
                    isScrolled
                      ? "max-h-0 opacity-0 sm:max-h-12 sm:opacity-100 sm:mt-1"
                      : "max-h-12 opacity-100 mt-1"
                  }`}
                  aria-hidden={isScrolled ? "true" : undefined}
                >
                  <span
                    style={monoStyle}
                    className={`block text-[11px] uppercase tracking-[0.14em] ${
                      isActive ? "text-[#F6F1E7]/75" : "text-[#8A7E71]"
                    }`}
                  >
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Compact Sticky Date Ruler when viewing Step I */}
        {activeTab === "itinerary" && (
          <div
            className={`flex items-center gap-1.5 overflow-x-auto bg-[#EFE7D8]/85 border-t border-[#1F1A16]/15 transition-all duration-300 ease-in-out ${
              isScrolled ? "px-2 py-1 sm:px-3 sm:py-2" : "px-3 py-2"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectDayNum(null)}
              style={monoStyle}
              className={`shrink-0 text-[11px] uppercase tracking-[0.14em] border transition-all duration-300 cursor-pointer ${
                isScrolled ? "px-2 py-0.5 sm:px-3 sm:py-1.5" : "px-3 py-1.5"
              } ${
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
                  onClick={() =>
                    onSelectDayNum(isSelected ? null : d.dayNumber)
                  }
                  style={monoStyle}
                  className={`shrink-0 text-[11px] uppercase tracking-[0.12em] border transition-all duration-300 cursor-pointer ${
                    isScrolled
                      ? "px-2 py-0.5 sm:px-2.5 sm:py-1.5"
                      : "px-2.5 py-1.5"
                  } ${
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

      {/* Floating Scroll-to-Chronometer Button — Reveals once scrolled past the -72px sticky threshold */}
      <div
        className={`fixed bottom-5 right-5 z-40 transition-all duration-300 ease-in-out motion-reduce:transition-none ${
          isScrolled
            ? "visible opacity-100 translate-y-0 pointer-events-auto"
            : "invisible opacity-0 translate-y-5 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleScrollToChronometer}
          tabIndex={isScrolled ? 0 : -1}
          aria-label="Scroll to Chronometer"
          title="Return to the Countdown Chronometer & Readiness Dossier"
          style={monoStyle}
          className="px-4 py-3 bg-[#1F1A16] hover:bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B] shadow-xl text-[11px] uppercase tracking-[0.16em] font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span className="text-[#D8B979]" aria-hidden="true">
            &uarr;
          </span>
        </button>
      </div>
    </>
  );
}
