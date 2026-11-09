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

// Hysteresis thresholds (in px) prevent rapid collapse/expand oscillation
// when scrolling slowly right around the sticky boundary.
const COLLAPSE_THRESHOLD_PX = 0;
const EXPAND_THRESHOLD_PX = 36;
const TOP_RESET_SCROLL_Y = 8;

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
  const navRef = React.useRef<HTMLDivElement>(null);
  const expandedHeightsByTabRef = React.useRef<
    Partial<Record<ActiveTab, number>>
  >({});
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [compensationPx, setCompensationPx] = useState(0);
  const isScrolled = controlledIsScrolled ?? internalScrolled;

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const updateHeightTracking = () => {
      const currentHeight = el.getBoundingClientRect().height;
      if (currentHeight <= 0) return;

      if (!isScrolled) {
        expandedHeightsByTabRef.current[activeTab] = currentHeight;
        setCompensationPx((prev) => (prev !== 0 ? 0 : prev));
      } else {
        const expandedHeight = expandedHeightsByTabRef.current[activeTab];
        const nextComp =
          expandedHeight && expandedHeight > currentHeight
            ? Math.round(expandedHeight - currentHeight)
            : 0;
        setCompensationPx((prev) => (prev !== nextComp ? nextComp : prev));
      }
    };

    updateHeightTracking();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateHeightTracking);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [isScrolled, activeTab]);

  useEffect(() => {
    if (controlledIsScrolled !== undefined) return;

    const checkSticky = () => {
      if (!sentinelRef.current) return;
      // If at or near the very top of the page, always reset to expanded
      if (
        typeof window !== "undefined" &&
        window.scrollY <= TOP_RESET_SCROLL_Y
      ) {
        if (navRef.current) {
          const h = navRef.current.getBoundingClientRect().height;
          if (h > 0) expandedHeightsByTabRef.current[activeTab] = h;
        }
        setInternalScrolled((prev) => (prev ? false : prev));
        return;
      }
      const rect = sentinelRef.current.getBoundingClientRect();
      setInternalScrolled((prev) => {
        if (prev) {
          // Hysteresis deadband: once stuck, stay collapsed until the user scrolls
          // back up far enough that the sentinel is at least EXPAND_THRESHOLD_PX below top.
          return rect.top < EXPAND_THRESHOLD_PX;
        }
        const willCollapse = rect.top <= COLLAPSE_THRESHOLD_PX;
        if (!willCollapse && navRef.current) {
          const h = navRef.current.getBoundingClientRect().height;
          if (h > 0) expandedHeightsByTabRef.current[activeTab] = h;
        }
        // Collapse only once the navbar's top edge reaches or passes top: 0
        return willCollapse;
      });
    };

    checkSticky();

    window.addEventListener("scroll", checkSticky, { passive: true });
    return () => window.removeEventListener("scroll", checkSticky);
  }, [controlledIsScrolled, activeTab]);

  return (
    <>
      {/* Invisible sentinel placed immediately above the sticky nav to detect the exact moment it sticks to the top */}
      <div
        ref={sentinelRef}
        data-testid="sticky-nav-sentinel"
        style={{ overflowAnchor: "none" }}
        className="h-px -mb-px w-full pointer-events-none opacity-0"
        aria-hidden="true"
      />
      <div
        ref={navRef}
        id="step-content-anchor"
        data-scrolled={isScrolled ? "true" : "false"}
        data-height-compensation={compensationPx}
        style={{
          overflowAnchor: "none",
          marginBottom:
            compensationPx > 0
              ? `calc(1.5rem + ${compensationPx}px)`
              : undefined,
        }}
        className={`sticky top-0 z-30 mb-6 sm:mb-8 transition-shadow duration-200 motion-reduce:transition-none bg-[#F6F1E7]/95 backdrop-blur-md border-y border-[#1F1A16]/20 ${
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
                className={`group flex flex-col items-start justify-between text-left transition-colors duration-200 motion-reduce:transition-none cursor-pointer relative ${
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
                      className={`italic ${
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
                    className={`font-semibold leading-tight tracking-tight block truncate ${
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
                  className={`transition-opacity duration-150 ease-out motion-reduce:transition-none overflow-hidden ${
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
            className={`flex items-center gap-1.5 overflow-x-auto bg-[#EFE7D8]/85 border-t border-[#1F1A16]/15 ${
              isScrolled ? "px-2 py-1 sm:px-3 sm:py-2" : "px-3 py-2"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectDayNum(null)}
              style={monoStyle}
              className={`shrink-0 text-[11px] uppercase tracking-[0.14em] border transition-colors duration-200 cursor-pointer ${
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
                  className={`shrink-0 text-[11px] uppercase tracking-[0.12em] border transition-colors duration-200 cursor-pointer ${
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
    </>
  );
}
