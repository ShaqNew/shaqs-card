import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  TRIP_DAYS,
  TRIP_METADATA,
  HOTEL_BOOKINGS,
  EMERGENCY_CONTACTS,
} from "@/lib/thailandTripData";
import { ActiveTab, ProgressMetric } from "../types";
import { serifStyle, monoStyle } from "../styles";
import { formatDayNumber } from "../utils/formatters";
import { useBottomSheetDialog } from "../hooks/useBottomSheetDialog";

export interface BudgetNavSummary {
  plannedTotalThb: number;
  exchangeRate: number;
}

interface StickyStepNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  prepProgress: ProgressMetric;
  appsProgress: ProgressMetric;
  packingProgress: ProgressMetric;
  selectedDayNum: number | null;
  onSelectDayNum: (dayNum: number | null) => void;
  isScrolled?: boolean;
  activeActor?: "Shaq" | "Naana";
  onSetActiveActor?: (actor: "Shaq" | "Naana") => void;
  changeLogCount?: number;
  onOpenChangeLog?: () => void;
  syncStatus?: "local" | "syncing" | "synced";
  onSyncFromCloud?: () => void;
  onOpenPocketDesk?: () => void;
  isPocketOpen?: boolean;
  onOpenDriverModal?: (hotelId: string) => void;
  budgetSummary?: BudgetNavSummary;
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
  changeLogCount = 0,
  onOpenChangeLog,
  syncStatus = "local",
  onSyncFromCloud,
  onOpenPocketDesk,
  isPocketOpen = false,
  onOpenDriverModal,
  budgetSummary,
}: StickyStepNavProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const dateRulerRef = useRef<HTMLDivElement>(null);

  const [internalScrolled, setInternalScrolled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const { dialogRef: moreDialogRef, handleDialogClose: handleMoreDialogClose } =
    useBottomSheetDialog({
      open: isMoreOpen,
      onClose: () => setIsMoreOpen(false),
      desktopMode: "close",
    });

  const isScrolled = controlledIsScrolled ?? internalScrolled;

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }
    const updateOnline = () => setIsOffline(navigator.onLine === false);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

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

  // Auto-center selected date chip horizontally without scrolling the outer document
  useEffect(() => {
    if (activeTab !== "itinerary" || !dateRulerRef.current) return;
    const ruler = dateRulerRef.current;
    const chipKey = selectedDayNum === null ? "all" : String(selectedDayNum);
    const activeChip = ruler.querySelector<HTMLElement>(
      `[data-day-chip="${chipKey}"]`
    );
    if (!activeChip) return;

    const rulerRect = ruler.getBoundingClientRect();
    const chipRect = activeChip.getBoundingClientRect();
    const deltaCenter =
      chipRect.left - rulerRect.left - rulerRect.width / 2 + chipRect.width / 2;
    const nextLeft = Math.max(0, ruler.scrollLeft + deltaCenter);
    if (typeof ruler.scrollTo === "function") {
      ruler.scrollTo({ left: nextLeft, behavior: "smooth" });
    } else {
      ruler.scrollLeft = nextLeft;
    }
  }, [selectedDayNum, activeTab]);

  const handleScrollToChronometer = () => {
    const chronometerEl = document.getElementById("masthead-chronometer");
    if (chronometerEl && typeof chronometerEl.scrollIntoView === "function") {
      chronometerEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function"
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const defaultSurplusLabel = `+£${TRIP_METADATA.accommodationSurplusGbp.toFixed(2)}`;
  const plannedGbpFormatted = budgetSummary
    ? (
        budgetSummary.plannedTotalThb / (budgetSummary.exchangeRate || 1)
      ).toFixed(2)
    : null;
  const budgetSubLabel = budgetSummary
    ? `฿${budgetSummary.plannedTotalThb.toLocaleString()} (~£${plannedGbpFormatted})`
    : `${defaultSurplusLabel} Surplus`;
  const budgetSheetBadge = budgetSummary
    ? `฿${budgetSummary.plannedTotalThb.toLocaleString()} (~£${plannedGbpFormatted})`
    : defaultSurplusLabel;

  const tabs = [
    {
      id: "itinerary" as ActiveTab,
      numeral: "I",
      label: "Itinerary & Plan",
      mobileLabel: "Plan",
      mobileIcon: "📅",
      sub: "Eleven-Day Chronicle",
      mobileBadge: undefined as string | undefined,
      mobileOrder: "order-1",
      showOnMobileBar: true,
    },
    {
      id: "bookings" as ActiveTab,
      numeral: "II",
      label: "Bookings Vault",
      mobileLabel: "Vault",
      mobileIcon: "🎫",
      sub: "Tickets & Residences",
      mobileBadge: undefined as string | undefined,
      mobileOrder: "order-2",
      showOnMobileBar: true,
    },
    {
      id: "prep" as ActiveTab,
      numeral: "III",
      label: "Prep & Apps",
      mobileLabel: "Prep",
      mobileIcon: "✓",
      sub: `${prepProgress.done + appsProgress.done}/${
        prepProgress.total + appsProgress.total
      } Verified`,
      mobileBadge: `${prepProgress.done + appsProgress.done}/${
        prepProgress.total + appsProgress.total
      }`,
      mobileOrder: "",
      showOnMobileBar: false,
    },
    {
      id: "packing" as ActiveTab,
      numeral: "IV",
      label: "Packing Studio",
      mobileLabel: "Pack",
      mobileIcon: "🧳",
      sub: `${packingProgress.done}/${packingProgress.total} Packed`,
      mobileBadge: `${packingProgress.done}/${packingProgress.total}`,
      mobileOrder: "order-4",
      showOnMobileBar: true,
    },
    {
      id: "guide" as ActiveTab,
      numeral: "V",
      label: "Field Guide & SOS",
      mobileLabel: "Guide",
      mobileIcon: "🆘",
      sub: "Dispatches & 1155",
      mobileBadge: undefined as string | undefined,
      mobileOrder: "",
      showOnMobileBar: false,
    },
    {
      id: "budget" as ActiveTab,
      numeral: "VI",
      label: "Budget & THB",
      mobileLabel: "Budget",
      mobileIcon: "฿",
      sub: budgetSubLabel,
      mobileBadge: undefined as string | undefined,
      mobileOrder: "",
      showOnMobileBar: false,
    },
  ];

  const activeTabMeta = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const shangriLa = HOTEL_BOOKINGS.find((h) => h.id === "shangri-la-bangkok");
  const pavilions = HOTEL_BOOKINGS.find((h) => h.id === "pavilions-phuket");
  const touristPolice = EMERGENCY_CONTACTS.find((c) => c.number === "1155");
  const medicalEms = EMERGENCY_CONTACTS.find((c) => c.number === "1669");
  const embassy = EMERGENCY_CONTACTS.find((c) =>
    c.title.includes("British Embassy")
  );

  const mobileTopJumpButton = isScrolled ? (
    <button
      type="button"
      onClick={handleScrollToChronometer}
      aria-label="Jump to top countdown"
      style={monoStyle}
      className="min-h-11 px-3 py-1 bg-[#1F1A16] text-[#F6F1E7] border border-[#9E7B3B] text-[11px] uppercase tracking-[0.1em] font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
    >
      <span className="text-[#D8B979]" aria-hidden="true">
        &uarr;
      </span>
      <span>Top</span>
    </button>
  ) : null;

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
        className={`sticky top-0 z-40 sm:z-30 mb-6 sm:mb-8 transition-shadow duration-300 motion-reduce:transition-none bg-[#F6F1E7] sm:bg-[#F6F1E7]/95 sm:backdrop-blur-md border-y border-[#1F1A16]/20 ${
          isScrolled
            ? "shadow-[0_4px_16px_rgba(31,26,22,0.12)]"
            : "shadow-[0_4px_16px_rgba(31,26,22,0.06)]"
        }`}
      >
        {/* Single Responsive Nav: Fixed 5-slot thumb bar on < sm; 6-tab editorial grid on sm+ */}
        <nav
          aria-label="Trip Dashboard Views"
          className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 bg-[#1F1A16] text-[#F6F1E7] border-t-2 border-[#9E7B3B] pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(31,26,22,0.28)] sm:static sm:z-auto sm:grid-cols-3 lg:grid-cols-6 divide-x divide-[#F6F1E7]/10 sm:divide-y-0 sm:divide-x sm:divide-[#1F1A16]/15 sm:bg-[#FBF8F3]/90 sm:text-[#1F1A16] sm:border-t-0 sm:pb-0 sm:shadow-none"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex-col items-center sm:items-start justify-center sm:justify-between text-center sm:text-left transition-all duration-300 ease-in-out motion-reduce:transition-none cursor-pointer relative min-w-0 overflow-hidden min-h-14 sm:min-h-0 px-1 py-1.5 sm:p-4 ${
                  tab.showOnMobileBar ? "flex" : "hidden sm:flex"
                } ${tab.mobileOrder} sm:order-none ${
                  isActive
                    ? "bg-[#13382E] text-[#F6F1E7]"
                    : "hover:bg-[#2A231D] sm:hover:bg-[#EFE7D8]/80 text-[#F6F1E7] sm:text-[#1F1A16]"
                }`}
              >
                {/* Mobile Bottom-Bar Slot Label (< sm) */}
                <span className="sm:hidden flex flex-col items-center justify-center gap-0.5 leading-tight">
                  <span aria-hidden="true" className="text-sm leading-none">
                    {tab.mobileIcon}
                  </span>
                  <span
                    style={monoStyle}
                    className="text-[11px] uppercase tracking-[0.06em] font-semibold leading-none"
                  >
                    {tab.mobileLabel}
                  </span>
                  {tab.mobileBadge && (
                    <span
                      style={monoStyle}
                      className="text-[11px] text-[#D8B979] leading-none"
                    >
                      {tab.mobileBadge}
                    </span>
                  )}
                </span>

                {/* Desktop Grid Label (sm+) */}
                <div className="hidden sm:block w-full min-w-0">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      style={serifStyle}
                      className={`italic transition-all duration-300 ${
                        isScrolled
                          ? "text-xs sm:text-sm"
                          : "text-xs sm:text-sm"
                      } ${isActive ? "text-[#D8B979]" : "text-[#9E7B3B]"}`}
                    >
                      Step {tab.numeral}
                    </span>
                    {isActive && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-[#D8B979] ${
                          isScrolled
                            ? "hidden sm:inline-block"
                            : "inline-block"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    style={serifStyle}
                    className="font-semibold leading-tight tracking-tight block min-w-0 truncate transition-all duration-300 text-base sm:text-lg lg:text-xl"
                  >
                    {tab.label}
                  </span>
                </div>
                <div
                  data-testid="step-nav-sublabel"
                  className={`hidden sm:block transition-[max-height,opacity,margin] duration-300 ease-in-out motion-reduce:transition-none overflow-hidden ${
                    isScrolled
                      ? "max-h-0 opacity-0 sm:max-h-12 sm:opacity-100 sm:mt-1"
                      : "max-h-12 opacity-100 mt-1"
                  }`}
                >
                  <span
                    style={monoStyle}
                    className={`block text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] ${
                      isActive ? "text-[#F6F1E7]/75" : "text-[#8A7E71]"
                    }`}
                  >
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Mobile Slot 3: Quick Pocket Desk Sheet Trigger (< sm) */}
          <button
            type="button"
            onClick={() => onOpenPocketDesk?.()}
            aria-label="Open Quick Pocket Desk"
            aria-expanded={isPocketOpen}
            aria-haspopup="dialog"
            className={`order-3 sm:hidden flex flex-col items-center justify-center min-h-14 px-1 py-1.5 text-center cursor-pointer transition-colors ${
              isPocketOpen
                ? "bg-[#13382E] text-[#F6F1E7]"
                : "bg-[#2A231D] text-[#D8B979] hover:bg-[#13382E]"
            }`}
          >
            <span
              style={monoStyle}
              className="text-sm font-bold leading-none"
              aria-hidden="true"
            >
              &#3647;
            </span>
            <span
              style={monoStyle}
              className="text-[11px] uppercase tracking-[0.06em] font-semibold mt-0.5 leading-none"
            >
              Pocket
            </span>
          </button>

          {/* Mobile Slot 5: More Steps & Tools Sheet Trigger (< sm) */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-label="More steps and tools"
            aria-expanded={isMoreOpen}
            aria-haspopup="dialog"
            className={`order-5 sm:hidden flex flex-col items-center justify-center min-h-14 px-1 py-1.5 text-center cursor-pointer transition-colors ${
              isMoreOpen ||
              activeTab === "prep" ||
              activeTab === "guide" ||
              activeTab === "budget"
                ? "bg-[#13382E] text-[#F6F1E7]"
                : "text-[#F6F1E7] hover:bg-[#2A231D]"
            }`}
          >
            <span aria-hidden="true" className="text-sm font-bold leading-none">
              &hellip;
            </span>
            <span
              style={monoStyle}
              className="text-[11px] uppercase tracking-[0.06em] font-semibold mt-0.5 leading-none"
            >
              More
            </span>
          </button>
        </nav>

        {/* Compact Sticky Date Ruler when viewing Step I (keeps Top jump inline in one compact row on mobile scroll) */}
        {activeTab === "itinerary" ? (
          <div className="flex items-center bg-[#EFE7D8]/85 border-t border-[#1F1A16]/15">
            <div
              ref={dateRulerRef}
              data-testid="step-date-ruler"
              className={`flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto snap-x snap-mandatory scroll-px-3 [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] sm:[mask-image:none] transition-all duration-300 ease-in-out ${
                isScrolled ? "px-2 py-1 sm:px-3 sm:py-2" : "px-3 py-1.5 sm:py-2"
              }`}
            >
              <button
                type="button"
                data-day-chip="all"
                aria-pressed={selectedDayNum === null}
                onClick={() => onSelectDayNum(null)}
                style={monoStyle}
                className={`shrink-0 snap-center min-h-11 sm:min-h-0 inline-flex items-center text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border transition-all duration-300 cursor-pointer ${
                  isScrolled ? "px-2.5 py-0.5 sm:px-3 sm:py-1.5" : "px-3 py-1.5"
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
                    data-day-chip={String(d.dayNumber)}
                    aria-pressed={isSelected}
                    onClick={() =>
                      onSelectDayNum(isSelected ? null : d.dayNumber)
                    }
                    style={monoStyle}
                    className={`shrink-0 snap-center min-h-11 sm:min-h-0 inline-flex items-center text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.12em] border transition-all duration-300 cursor-pointer ${
                      isScrolled
                        ? "px-2.5 py-0.5 sm:px-2.5 sm:py-1.5"
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
            {mobileTopJumpButton && (
              <div className="sm:hidden shrink-0 pr-2 pl-1">
                {mobileTopJumpButton}
              </div>
            )}
          </div>
        ) : (
          /* Mobile-only slim sticky Step header (~44px) for Steps II–VI */
          <div className="sm:hidden flex items-center justify-between gap-2 px-3 min-h-11 bg-[#EFE7D8]/95">
            <span
              style={monoStyle}
              className="text-[11px] uppercase tracking-[0.1em] text-[#13382E] font-semibold truncate"
            >
              Step {activeTabMeta.numeral} &bull; {activeTabMeta.label}
            </span>
            {mobileTopJumpButton}
          </div>
        )}
      </div>

      {/* Native <dialog> More Steps & Tools Bottom Sheet (Mobile < sm, mounted permanently for focus restoration) */}
      <dialog
        ref={moreDialogRef}
        {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="more-sheet-title"
        onClose={handleMoreDialogClose}
        className="[&:not([open])]:hidden fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none max-h-[85dvh] rounded-t-2xl border-t-2 border-[#1F1A16] bg-[#FBF8F3] text-[#1F1A16] p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain shadow-2xl z-50 backdrop:bg-[#1F1A16]/60 backdrop:overflow-hidden backdrop:overscroll-contain"
      >
        {isMoreOpen && (
          <div className="space-y-4">
            <div
              aria-hidden="true"
              className="w-10 h-1.5 rounded-full bg-[#1F1A16]/20 mx-auto"
            />
            <div className="flex items-center justify-between border-b border-[#1F1A16]/15 pb-3">
              <div>
                <span
                  style={monoStyle}
                  className="text-[11px] uppercase tracking-[0.1em] text-[#A8442A] font-semibold block"
                >
                  NAVIGATION &amp; QUICK DISPATCH
                </span>
                <h2
                  id="more-sheet-title"
                  style={serifStyle}
                  className="text-xl text-[#1F1A16] font-normal"
                >
                  More Steps &amp; Dossier Tools
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                style={monoStyle}
                className="min-h-11 px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-[11px] uppercase tracking-[0.1em] cursor-pointer"
              >
                Close &#10005;
              </button>
            </div>

            {/* Overflow Dossier Steps (III, V, VI) */}
            <div className="space-y-2">
              <span
                style={monoStyle}
                className="text-[11px] uppercase tracking-[0.1em] text-[#8A7E71] block"
              >
                ADDITIONAL STEPS
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectTab("prep");
                  setIsMoreOpen(false);
                }}
                className={`w-full min-h-11 px-3.5 py-2.5 border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  activeTab === "prep"
                    ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                    : "bg-[#F6F1E7] text-[#1F1A16] border-[#1F1A16]/20 hover:border-[#13382E]"
                }`}
              >
                <span className="font-semibold text-sm">
                  Step III &middot; Pre-Departure &amp; Apps
                </span>
                <span
                  style={monoStyle}
                  className={`text-[11px] px-2 py-0.5 border ${
                    activeTab === "prep"
                      ? "border-[#D8B979]/60 text-[#D8B979]"
                      : "border-[#1F1A16]/20 text-[#13382E] bg-[#FBF8F3]"
                  }`}
                >
                  Prep {prepProgress.done + appsProgress.done}/
                  {prepProgress.total + appsProgress.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab("guide");
                  setIsMoreOpen(false);
                }}
                className={`w-full min-h-11 px-3.5 py-2.5 border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  activeTab === "guide"
                    ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                    : "bg-[#F6F1E7] text-[#1F1A16] border-[#1F1A16]/20 hover:border-[#13382E]"
                }`}
              >
                <span className="font-semibold text-sm">
                  Step V &middot; Cultural Guide &amp; 1155 SOS
                </span>
                <span
                  style={monoStyle}
                  className={`text-[11px] ${
                    activeTab === "guide" ? "text-[#D8B979]" : "text-[#8A7E71]"
                  }`}
                >
                  Open &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab("budget");
                  setIsMoreOpen(false);
                }}
                className={`w-full min-h-11 px-3.5 py-2.5 border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  activeTab === "budget"
                    ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                    : "bg-[#F6F1E7] text-[#1F1A16] border-[#1F1A16]/20 hover:border-[#13382E]"
                }`}
              >
                <span className="font-semibold text-sm">
                  Step VI &middot; Budget Ledger &amp; THB
                </span>
                <span
                  style={monoStyle}
                  className={`text-[11px] ${
                    activeTab === "budget" ? "text-[#D8B979]" : "text-[#13382E]"
                  }`}
                >
                  {budgetSheetBadge}
                </span>
              </button>
            </div>

            {/* 1-Tap SOS & Reception Dial */}
            <div className="space-y-2 pt-2 border-t border-[#1F1A16]/15">
              <span
                style={monoStyle}
                className="text-[11px] uppercase tracking-[0.1em] text-[#A8442A] font-semibold block"
              >
                1-TAP SOS &amp; HOTEL DESK
              </span>
              <div className="grid grid-cols-2 gap-2">
                {touristPolice && (
                  <a
                    href={touristPolice.telHref}
                    className="min-h-11 px-3 py-2 bg-[#A8442A] text-[#FBF8F3] text-xs font-semibold flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>{touristPolice.number} Tourist Police</span>
                  </a>
                )}
                {medicalEms && (
                  <a
                    href={medicalEms.telHref}
                    className="min-h-11 px-3 py-2 bg-[#13382E] text-[#F6F1E7] text-xs font-semibold flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>{medicalEms.number} Medical EMS</span>
                  </a>
                )}
                {embassy && (
                  <a
                    href={embassy.telHref}
                    className="col-span-2 min-h-11 px-3 py-2 bg-[#EFE7D8] border border-[#1F1A16]/25 text-xs font-semibold text-[#1F1A16] flex items-center justify-center text-center"
                  >
                    {embassy.title} ({embassy.number})
                  </a>
                )}
                {shangriLa && (
                  <a
                    href={`tel:${shangriLa.phone.replace(/\s+/g, "")}`}
                    className="min-h-11 px-3 py-2 bg-[#F6F1E7] border border-[#1F1A16]/20 text-xs font-semibold text-[#1F1A16] flex items-center justify-center text-center"
                  >
                    Call Shangri-La
                  </a>
                )}
                {pavilions && (
                  <a
                    href={`tel:${pavilions.phone.replace(/\s+/g, "")}`}
                    className="min-h-11 px-3 py-2 bg-[#F6F1E7] border border-[#1F1A16]/20 text-xs font-semibold text-[#1F1A16] flex items-center justify-center text-center"
                  >
                    Call Pavilions
                  </a>
                )}
                {onOpenDriverModal && shangriLa && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenDriverModal(shangriLa.id);
                    }}
                    className="min-h-11 px-3 py-2 bg-[#F6F1E7] border border-[#1F1A16]/20 text-xs font-semibold text-[#1F1A16] cursor-pointer"
                  >
                    Shangri-La Taxi Card
                  </button>
                )}
                {onOpenDriverModal && pavilions && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenDriverModal(pavilions.id);
                    }}
                    className="min-h-11 px-3 py-2 bg-[#F6F1E7] border border-[#1F1A16]/20 text-xs font-semibold text-[#1F1A16] cursor-pointer"
                  >
                    Pavilions Taxi Card
                  </button>
                )}
              </div>
            </div>

            {/* Dossier Utilities */}
            <div className="space-y-2 pt-2 border-t border-[#1F1A16]/15">
              <span
                style={monoStyle}
                className="text-[11px] uppercase tracking-[0.1em] text-[#8A7E71] block"
              >
                FOLIO UTILITIES
              </span>
              <div className="grid grid-cols-2 gap-2">
                {onOpenChangeLog && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenChangeLog();
                    }}
                    style={monoStyle}
                    className="min-h-11 px-3 py-2 bg-[#EFE7D8] border border-[#1F1A16]/25 text-[11px] uppercase tracking-[0.1em] text-[#1F1A16] font-semibold cursor-pointer"
                  >
                    Change Log ({changeLogCount})
                  </button>
                )}
                {onSyncFromCloud && (
                  <button
                    type="button"
                    onClick={onSyncFromCloud}
                    style={monoStyle}
                    className="min-h-11 px-3 py-2 bg-[#F6F1E7] border border-[#1F1A16]/25 text-[11px] uppercase tracking-[0.1em] text-[#13382E] font-semibold cursor-pointer"
                  >
                    Sync Now ({syncStatus})
                  </button>
                )}
              </div>
              {isOffline ? (
                <p
                  style={monoStyle}
                  className="text-[11px] text-[#8A7E71] bg-[#EFE7D8]/70 border border-[#1F1A16]/15 px-3 py-2"
                >
                  v1 Classic unavailable offline (staying inside v2 PWA cache)
                </p>
              ) : (
                <Link
                  href="/naanas-space/thailand-2027"
                  style={monoStyle}
                  className="min-h-11 px-3 py-2 bg-[#F6F1E7] border border-[#1F1A16]/20 text-[11px] uppercase tracking-[0.1em] text-[#5C5248] flex items-center justify-between"
                >
                  <span>Open v1 Classic Desktop Edition</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </dialog>

      {/* Floating Scroll-to-Chronometer Button (Desktop sm+) — Reveals once scrolled past the -72px sticky threshold */}
      <div
        className={`hidden sm:block fixed bottom-5 right-5 z-40 pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-in-out motion-reduce:transition-none ${
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
          className="px-4 py-3 bg-[#1F1A16] hover:bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B] shadow-xl text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em] font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span className="text-[#D8B979]" aria-hidden="true">
            &uarr;
          </span>
        </button>
      </div>
    </>
  );
}
