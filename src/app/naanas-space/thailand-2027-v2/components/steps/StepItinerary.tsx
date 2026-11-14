import React, { useState, useMemo, useEffect } from "react";
import {
  TRIP_DAYS,
  HOTEL_BOOKINGS,
  DEFAULT_WARDROBE_OUTFITS,
  ItineraryActivity,
  WardrobeOutfit,
} from "@/lib/thailandTripData";
import { PhaseFilter, PersistedTripState } from "../../types";
import {
  serifStyle,
  monoStyle,
  CATEGORY_EDITORIAL_STYLES,
  ExternalArrow,
  CalendarIcon,
  HangerIcon,
} from "../../styles";
import { formatDayNumber } from "../../utils/formatters";
import {
  buildGoogleCalendarUrl,
  buildActivityIcsContent,
  buildDayIcsContent,
  buildMasterTripIcsContent,
  downloadIcsFile,
} from "../../utils/calendar";
import {
  DRESS_CODE_METADATA,
  resolveDayOutfit,
  resolveActivityOutfit,
  validateOutfitForActivity,
} from "../../utils/wardrobe";
import {
  detectActiveTripDay,
  parseActivityTimelineWindow,
  resolveDayCompanionStatus,
  isActivityPast,
  resolveHotelIdForDay,
  resolveCompanionGrabTarget,
} from "../../utils/companion";
import { useBottomSheetDialog } from "../../hooks/useBottomSheetDialog";

interface StepItineraryProps {
  tripState: PersistedTripState;
  phaseFilter: PhaseFilter;
  onSetPhaseFilter: (phase: PhaseFilter) => void;
  selectedDayNum: number | null;
  onSelectDayNum: (dayNum: number | null) => void;
  onToggleActivityCompleted: (id: string) => void;
  onAddCustomActivity: (
    dayNumber: number,
    activityData: Omit<ItineraryActivity, "id">
  ) => void;
  onRemoveCustomActivity: (dayNumber: number, activityId: string) => void;
  onUpdateCustomActivity: (
    dayNumber: number,
    activityId: string,
    updates: Partial<Omit<ItineraryActivity, "id">>
  ) => void;
  allOutfits?: WardrobeOutfit[];
  onOpenWardrobeDrawer?: (
    dayNumber: number,
    activity?: ItineraryActivity
  ) => void;
  isCompanionMode?: boolean;
  onToggleCompanionMode?: () => void;
  detectedTripDayNum?: number | null;
  now?: Date;
  onOpenDriverModal?: (hotelId: string) => void;
  onCopy?: (text: string, label?: string) => void;
}

export function StepItinerary({
  tripState,
  phaseFilter,
  onSetPhaseFilter,
  selectedDayNum,
  onSelectDayNum,
  onToggleActivityCompleted,
  onAddCustomActivity,
  onRemoveCustomActivity,
  onUpdateCustomActivity,
  allOutfits = DEFAULT_WARDROBE_OUTFITS,
  onOpenWardrobeDrawer,
  isCompanionMode: controlledCompanionMode,
  onToggleCompanionMode,
  detectedTripDayNum,
  now,
  onOpenDriverModal,
  onCopy,
}: StepItineraryProps) {
  const [internalCompanionMode, setInternalCompanionMode] = useState(false);
  const companionActive = controlledCompanionMode ?? internalCompanionMode;
  const effectiveNow = now ?? new Date();
  const effectiveDetectedDay =
    detectedTripDayNum !== undefined
      ? detectedTripDayNum
      : detectActiveTripDay(effectiveNow);
  const [collapsedDayNums, setCollapsedDayNums] = useState<number[]>([]);

  useEffect(() => {
    if (!companionActive) return;
    const targetDay =
      selectedDayNum ?? effectiveDetectedDay ?? 1;
    setCollapsedDayNums((prev) =>
      prev.includes(targetDay)
        ? prev.filter((d) => d !== targetDay)
        : prev
    );
  }, [companionActive, selectedDayNum, effectiveDetectedDay]);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [openSuggestionInfoKey, setOpenSuggestionInfoKey] = useState<
    string | null
  >(null);

  const [newActTime, setNewActTime] = useState("19:00 ICT");
  const [newActTitle, setNewActTitle] = useState("");
  const [newActLocation, setNewActLocation] = useState("");
  const [newActCategory, setNewActCategory] =
    useState<ItineraryActivity["category"]>("romance");
  const [newActNotes, setNewActNotes] = useState("");

  // Editing & mobile action sheet state
  const [expandedSuggestionDays, setExpandedSuggestionDays] = useState<
    number[]
  >([]);
  const [actionSheetTarget, setActionSheetTarget] = useState<{
    dayNumber: number;
    activity: ItineraryActivity;
    isCustom: boolean;
  } | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );
  const [editingDayNumber, setEditingDayNumber] = useState<number | null>(null);
  const [editActTime, setEditActTime] = useState("");
  const [editActTitle, setEditActTitle] = useState("");
  const [editActLocation, setEditActLocation] = useState("");
  const [editActCategory, setEditActCategory] =
    useState<ItineraryActivity["category"]>("romance");
  const [editActNotes, setEditActNotes] = useState("");

  const closeActionSheet = () => setActionSheetTarget(null);
  const {
    dialogRef: actionSheetDialogRef,
    handleDialogClose: handleActionSheetClose,
  } = useBottomSheetDialog({
    open: Boolean(actionSheetTarget),
    onClose: closeActionSheet,
    desktopMode: "modal",
    lightDismiss: true,
  });

  const isEditSheetOpen = Boolean(
    editingActivityId && editingDayNumber !== null
  );
  const closeEditSheet = () => {
    setEditingActivityId(null);
    setEditingDayNumber(null);
  };
  const {
    dialogRef: editSheetDialogRef,
    handleDialogClose: handleEditSheetClose,
  } = useBottomSheetDialog({
    open: isEditSheetOpen,
    onClose: closeEditSheet,
    desktopMode: "modal",
    lightDismiss: true,
  });

  const filteredDays = useMemo(() => {
    return TRIP_DAYS.filter((day) => {
      if (selectedDayNum !== null) return day.dayNumber === selectedDayNum;
      if (phaseFilter === "all") return true;
      return day.phase === phaseFilter;
    });
  }, [phaseFilter, selectedDayNum]);

  const allDaysCollapsed = useMemo(
    () =>
      filteredDays.length > 0 &&
      filteredDays.every((d) => collapsedDayNums.includes(d.dayNumber)),
    [filteredDays, collapsedDayNums]
  );

  const toggleDayCollapsed = (dayNumber: number) => {
    setCollapsedDayNums((prev) =>
      prev.includes(dayNumber)
        ? prev.filter((d) => d !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const toggleAllDaysCollapsed = () => {
    if (allDaysCollapsed) {
      setCollapsedDayNums([]);
    } else {
      setCollapsedDayNums(TRIP_DAYS.map((d) => d.dayNumber));
    }
  };

  const scrollToItineraryTarget = (targetId: string) => {
    setTimeout(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const navigateSingleDay = (
    targetDayNum: number | null,
    scrollTargetId: string
  ) => {
    onSetPhaseFilter("all");
    onSelectDayNum(targetDayNum);
    scrollToItineraryTarget(scrollTargetId);
  };

  const jumpToActiveOrFirstDay = () => {
    const matchedDayNum = detectActiveTripDay(effectiveNow);
    const targetDayNum = matchedDayNum !== null ? matchedDayNum : 0;
    onSelectDayNum(null);
    onSetPhaseFilter("all");
    setCollapsedDayNums((prev) => prev.filter((d) => d !== targetDayNum));
    scrollToItineraryTarget(`day-card-${targetDayNum}`);
  };

  const startEditingActivity = (act: ItineraryActivity, dayNumber: number) => {
    setEditingActivityId(act.id);
    setEditingDayNumber(dayNumber);
    setEditActTime(act.time);
    setEditActTitle(act.title);
    setEditActLocation(act.location || "");
    setEditActCategory(act.category);
    setEditActNotes(act.notes || "");
  };

  const handleSaveEditedActivity = (
    e: React.FormEvent,
    dayNumber: number,
    activityId: string
  ) => {
    e.preventDefault();
    if (!editActTitle.trim()) return;
    const nextTime = editActTime.trim() || "Flexible";
    const nextTitle = editActTitle.trim();
    onUpdateCustomActivity(dayNumber, activityId, {
      time: nextTime,
      title: nextTitle,
      category: editActCategory,
      location: editActLocation.trim() || undefined,
      notes: editActNotes.trim() || undefined,
    });
    setEditingActivityId(null);
    setEditingDayNumber(null);
  };

  const handleAddActivitySubmit = (e: React.FormEvent, dayNumber: number) => {
    e.preventDefault();
    if (!newActTitle.trim()) return;
    onAddCustomActivity(dayNumber, {
      time: newActTime.trim() || "Flexible",
      title: newActTitle.trim(),
      category: newActCategory,
      location: newActLocation.trim() || undefined,
      notes: newActNotes.trim() || undefined,
    });
    setNewActTitle("");
    setNewActLocation("");
    setNewActNotes("");
    setAddingToDay(null);
  };

  const handleRemoveCustomActivity = (
    dayNumber: number,
    activityId: string
  ) => {
    onRemoveCustomActivity(dayNumber, activityId);
    if (editingActivityId === activityId) {
      setEditingActivityId(null);
      setEditingDayNumber(null);
    }
  };

  const handleExportMasterCalendar = () => {
    const ics = buildMasterTripIcsContent(
      TRIP_DAYS,
      tripState.customActivitiesByDay
    );
    downloadIcsFile("thailand-2027-master-itinerary.ics", ics);
  };

  const handleExportDayCalendar = (
    day: (typeof TRIP_DAYS)[number],
    activities: ItineraryActivity[]
  ) => {
    const ics = buildDayIcsContent(day, activities);
    const safeName = `thailand-2027-day-${formatDayNumber(day.dayNumber)}.ics`;
    downloadIcsFile(safeName, ics);
  };

  const handleExportSingleActivity = (
    day: { dateIso: string; dateLabel: string },
    act: ItineraryActivity
  ) => {
    const ics = buildActivityIcsContent(day, act);
    const safeTitle = act.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    downloadIcsFile(`${safeTitle || "activity"}.ics`, ics);
  };

  return (
    <section className="space-y-10">
      {/* Editorial Filter Header */}
      <div
        id="itinerary-step-header"
        className="scroll-mt-20 sm:scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span
              style={monoStyle}
              className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.22em] text-[#A8442A] font-semibold"
            >
              STEP I &bull; THE DAILY CHRONICLE
            </span>
            <h2
              style={serifStyle}
              className="text-3xl sm:text-4xl font-normal text-[#1F1A16] mt-1"
            >
              Interactive Day-by-Day Itinerary &amp; Planner
            </h2>
            <p className="text-sm text-[#5C5248] mt-1">
              Strike off completed movements, adopt curated concierge notes from
              the left margin, or inscribe your own bespoke reservations.
            </p>
          </div>

          {/* Phase Filter Pills & Expand/Collapse Actions */}
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All 11 Days" },
                { id: "outbound", label: "I. Outbound" },
                { id: "bangkok", label: "II. Bangkok (3N)" },
                { id: "transfer", label: "III. Island Transfer" },
                { id: "phuket", label: "IV. Phuket (5N)" },
                { id: "return", label: "V. Return" },
              ].map((pf) => {
                const active =
                  phaseFilter === pf.id && selectedDayNum === null;
                return (
                  <button
                    key={pf.id}
                    type="button"
                    onClick={() => {
                      onSetPhaseFilter(pf.id as PhaseFilter);
                      onSelectDayNum(null);
                    }}
                    className={`min-h-11 sm:min-h-0 px-3.5 py-1.5 text-xs uppercase tracking-[0.08em] sm:tracking-[0.12em] border transition-colors cursor-pointer ${
                      active
                        ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16] font-semibold"
                        : "bg-transparent text-[#5C5248] border-[#1F1A16]/20 hover:border-[#1F1A16]"
                    }`}
                  >
                    {pf.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportMasterCalendar}
                style={monoStyle}
                className="min-h-11 sm:min-h-0 px-3 py-1 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] bg-[#A8442A]/10 text-[#A8442A] border border-[#A8442A]/30 hover:bg-[#A8442A] hover:text-[#F6F1E7] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                title="Download 10-day master trip calendar (.ics) for Apple Calendar, Google Calendar, or Outlook"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Export Master Calendar (.ics)</span>
              </button>
              <button
                type="button"
                data-testid="companion-mode-toggle"
                aria-pressed={companionActive}
                onClick={() => {
                  if (onToggleCompanionMode) {
                    onToggleCompanionMode();
                  } else {
                    setInternalCompanionMode((prev) => !prev);
                  }
                }}
                style={monoStyle}
                className={`min-h-11 sm:min-h-0 px-3 py-1 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border transition-colors cursor-pointer ${
                  companionActive
                    ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E] font-semibold"
                    : "bg-[#EFE7D8] text-[#13382E] border-[#13382E]/35 hover:bg-[#13382E] hover:text-[#F6F1E7]"
                }`}
              >
                {companionActive
                  ? "● Companion Mode: ON"
                  : "Companion / Today View"}
              </button>
              <button
                type="button"
                onClick={jumpToActiveOrFirstDay}
                style={monoStyle}
                className="min-h-11 sm:min-h-0 px-3 py-1 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] bg-[#13382E]/10 text-[#13382E] border border-[#13382E]/30 hover:bg-[#13382E] hover:text-[#F6F1E7] transition-colors cursor-pointer"
              >
                Jump to Current / Departure Day
              </button>
              <button
                type="button"
                onClick={toggleAllDaysCollapsed}
                style={monoStyle}
                className="min-h-11 sm:min-h-0 px-3 py-1 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] bg-[#EFE7D8] text-[#5C5248] border border-[#1F1A16]/20 hover:text-[#1F1A16] hover:border-[#1F1A16] transition-colors cursor-pointer"
              >
                {allDaysCollapsed ? "Expand All Days" : "Collapse All Days"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Spreads for Each Day */}
      <div className="space-y-8">
        {filteredDays.map((day) => {
          const customActs =
            tripState.customActivitiesByDay[day.dayNumber] || [];
          const rawActivities = [...day.defaultActivities, ...customActs];
          const allDayActivities = rawActivities
            .map((act, idx) => ({
              act,
              sortKey: parseActivityTimelineWindow(act, day.dayNumber, idx)
                .sortMinutes,
              idx,
            }))
            .sort((a, b) =>
              a.sortKey !== b.sortKey ? a.sortKey - b.sortKey : a.idx - b.idx
            )
            .map((entry) => entry.act);

          const completedDayCount = allDayActivities.filter((a) =>
            tripState.completedActivityIds.includes(a.id)
          ).length;
          const isDayCollapsed = collapsedDayNums.includes(day.dayNumber);

          const resolvedDayLook = resolveDayOutfit(
            day.dayNumber,
            day.defaultOutfitId,
            tripState.dayOutfitByDay,
            allOutfits
          );

          const dayDressConflicts = allDayActivities
            .map((act) => {
              const actOverride = resolveActivityOutfit(
                act,
                tripState.activityOutfitById,
                allOutfits
              );
              const effectiveLook = actOverride || resolvedDayLook;
              const check = validateOutfitForActivity(effectiveLook, act);
              return check.hasConflict ? { act, check } : null;
            })
            .filter(Boolean) as {
            act: ItineraryActivity;
            check: ReturnType<typeof validateOutfitForActivity>;
          }[];

          const isLiveTripDay = Boolean(
            companionActive &&
              effectiveDetectedDay !== null &&
              day.dayNumber === effectiveDetectedDay
          );

          const showCompanionForDay =
            companionActive &&
            (effectiveDetectedDay !== null
              ? day.dayNumber === effectiveDetectedDay
              : selectedDayNum !== null
              ? day.dayNumber === selectedDayNum
              : day.dayNumber === 1);

          const companionStatus = showCompanionForDay
            ? resolveDayCompanionStatus(
                allDayActivities,
                tripState.completedActivityIds,
                day.dayNumber,
                effectiveNow
              )
            : null;
          const activeHotelId = resolveHotelIdForDay(
            day.dayNumber,
            companionStatus?.upNextActivity,
            companionStatus?.currentMinutes
          );
          const activeHotel = activeHotelId
            ? HOTEL_BOOKINGS.find((h) => h.id === activeHotelId)
            : undefined;
          const upNextOverride = companionStatus?.upNextActivity
            ? resolveActivityOutfit(
                companionStatus.upNextActivity,
                tripState.activityOutfitById,
                allOutfits
              )
            : undefined;
          const tonightLook = upNextOverride || resolvedDayLook;
          const upNextMapHref =
            companionStatus?.upNextActivity?.mapUrl ||
            (companionStatus?.upNextActivity?.location
              ? `https://maps.google.com/?q=${encodeURIComponent(
                  companionStatus.upNextActivity.location
                )}`
              : activeHotel?.mapUrl ||
                `https://maps.google.com/?q=${encodeURIComponent(
                  day.locationBadge
                )}`);
          const grabTarget = resolveCompanionGrabTarget(
            day.dayNumber,
            companionStatus?.upNextActivity || null,
            activeHotelId
          );

          return (
            <article
              id={`day-card-${day.dayNumber}`}
              key={day.dayNumber}
              className="scroll-mt-20 sm:scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 shadow-[0_2px_12px_rgba(31,26,22,0.04)]"
            >
              {/* Compact Top Day Accordion Header when Collapsed */}
              {isDayCollapsed ? (
                <div className="p-5 sm:p-6 bg-[#EFE7D8]/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-baseline gap-3 sm:gap-5">
                    <span
                      style={serifStyle}
                      className="text-2xl sm:text-3xl font-normal text-[#A8442A]"
                    >
                      Day {formatDayNumber(day.dayNumber)}
                    </span>
                    <span
                      style={monoStyle}
                      className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[#5C5248]"
                    >
                      {day.dateLabel}
                    </span>
                    <span
                      style={monoStyle}
                      className="px-2 py-0.5 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] bg-[#13382E] text-[#F6F1E7]"
                    >
                      {day.locationBadge}
                    </span>
                    <h3
                      style={serifStyle}
                      className="text-xl sm:text-2xl font-normal text-[#1F1A16]"
                    >
                      {day.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      style={monoStyle}
                      className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#5C5248] mr-1"
                    >
                      {completedDayCount}/{allDayActivities.length} DONE
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleExportDayCalendar(day, allDayActivities)
                      }
                      style={monoStyle}
                      className="min-h-11 sm:min-h-0 px-2.5 py-1.5 bg-[#FBF8F3] border border-[#1F1A16]/25 hover:border-[#13382E] hover:text-[#13382E] text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#5C5248] cursor-pointer inline-flex items-center gap-1"
                      title={`Export Day ${formatDayNumber(day.dayNumber)} schedule to .ics`}
                    >
                      <CalendarIcon className="w-3 h-3" />
                      <span>Day .ics</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDayCollapsed(day.dayNumber)}
                      style={monoStyle}
                      className="min-h-11 sm:min-h-0 px-3 py-1.5 bg-[#FBF8F3] border border-[#1F1A16]/25 hover:border-[#1F1A16] text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#1F1A16] cursor-pointer"
                    >
                      Expand Day +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1F1A16]/15">
                  {/* Left Column (4 cols): Day Title, Atmosphere, Weather & Curated Margin Suggestions */}
                  <div className="lg:col-span-4 p-6 sm:p-8 bg-[#EFE7D8]/45 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-baseline justify-between border-b border-[#1F1A16]/15 pb-3 gap-2 flex-wrap">
                        <span
                          style={serifStyle}
                          className="text-4xl sm:text-5xl font-normal text-[#A8442A]"
                        >
                          Day {formatDayNumber(day.dayNumber)}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            style={monoStyle}
                            className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5C5248]"
                          >
                            {day.dateLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleExportDayCalendar(day, allDayActivities)
                            }
                            style={monoStyle}
                            title={`Export Day ${formatDayNumber(day.dayNumber)} schedule to .ics`}
                            className="min-h-11 sm:min-h-0 px-2 py-0.5 bg-[#FBF8F3] border border-[#1F1A16]/20 hover:border-[#13382E] hover:text-[#13382E] text-[11px] sm:text-[10px] uppercase tracking-wider text-[#5C5248] cursor-pointer inline-flex items-center gap-1"
                          >
                            <CalendarIcon className="w-3 h-3" />
                            <span>Day .ics</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleDayCollapsed(day.dayNumber)}
                            style={monoStyle}
                            title="Collapse this day card"
                            className="min-h-11 sm:min-h-0 px-2 py-0.5 bg-[#FBF8F3] border border-[#1F1A16]/20 hover:border-[#1F1A16] text-[11px] sm:text-[10px] uppercase tracking-wider text-[#5C5248] hover:text-[#1F1A16] cursor-pointer"
                          >
                            Collapse &ndash;
                          </button>
                        </div>
                      </div>

                      <div
                        style={monoStyle}
                        className="inline-block px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.18em] bg-[#13382E] text-[#F6F1E7]"
                      >
                        {day.locationBadge}
                      </div>

                      <h3
                        style={serifStyle}
                        className="text-2xl sm:text-3xl font-normal text-[#1F1A16] leading-snug"
                      >
                        {day.title}
                      </h3>

                      <p
                        style={serifStyle}
                        className="italic text-base text-[#5C5248] leading-relaxed"
                      >
                        &ldquo;{day.vibe}&rdquo;
                      </p>

                      <div className="pt-2 space-y-2.5 border-t border-[#1F1A16]/10 text-xs text-[#4A4036]">
                        <div className="flex items-start gap-2">
                          <span
                            style={monoStyle}
                            className="text-[11px] sm:text-[10px] uppercase tracking-wider text-[#8A7E71] w-20 shrink-0"
                          >
                            CLIMATE
                          </span>
                          <span>{day.weatherSummary}</span>
                        </div>

                        {/* Day-Level ATTIRE Slot */}
                        <div className="flex items-start gap-2">
                          <span
                            style={monoStyle}
                            className="text-[11px] sm:text-[10px] uppercase tracking-wider text-[#8A7E71] w-20 shrink-0 pt-0.5"
                          >
                            ATTIRE
                          </span>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            {resolvedDayLook ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-[#1F1A16]">
                                  {resolvedDayLook.title}
                                </span>
                                <span
                                  style={monoStyle}
                                  className={`text-[11px] sm:text-[9px] uppercase tracking-wider px-1.5 py-0.5 border font-semibold ${
                                    DRESS_CODE_METADATA[
                                      resolvedDayLook.dressCode
                                    ].badgeClass
                                  }`}
                                >
                                  {
                                    DRESS_CODE_METADATA[
                                      resolvedDayLook.dressCode
                                    ].shortBadge
                                  }
                                </span>
                                {onOpenWardrobeDrawer && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenWardrobeDrawer(day.dayNumber)
                                    }
                                    style={monoStyle}
                                    aria-label={`Change daily attire for Day ${formatDayNumber(
                                      day.dayNumber
                                    )}`}
                                    className="min-h-11 sm:min-h-0 px-2.5 sm:px-2 py-1 sm:py-0.5 bg-[#FBF8F3] border border-[#1F1A16]/20 hover:border-[#13382E] text-[11px] sm:text-[9px] uppercase tracking-wider text-[#13382E] cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <HangerIcon className="w-3 h-3" />
                                    <span>Change Look</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="italic text-[#8A7E71]">
                                  No daily look assigned
                                </span>
                                {onOpenWardrobeDrawer && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenWardrobeDrawer(day.dayNumber)
                                    }
                                    style={monoStyle}
                                    aria-label={`Assign daily attire for Day ${formatDayNumber(
                                      day.dayNumber
                                    )}`}
                                    className="min-h-11 sm:min-h-0 px-2.5 sm:px-2 py-1 sm:py-0.5 bg-[#FBF8F3] border border-[#1F1A16]/20 hover:border-[#13382E] text-[11px] sm:text-[9px] uppercase tracking-wider text-[#13382E] cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <HangerIcon className="w-3 h-3" />
                                    <span>+ Assign Look</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {dayDressConflicts.length > 0 && (
                              <div
                                role="alert"
                                className="p-2 bg-[#A8442A]/12 border-l-2 border-[#A8442A] text-[11px] text-[#8F351E]"
                              >
                                <strong
                                  style={monoStyle}
                                  className="text-[11px] sm:text-[9px] uppercase tracking-wider block text-[#A8442A]"
                                >
                                  &#9888;{" "}
                                  {dayDressConflicts[0].check.headline}
                                </strong>
                                <span>
                                  {dayDressConflicts[0].check.message}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {day.accommodation && (
                          <div className="flex items-start gap-2">
                            <span
                              style={monoStyle}
                              className="text-[11px] sm:text-[10px] uppercase tracking-wider text-[#8A7E71] w-20 shrink-0"
                            >
                              RESIDENCE
                            </span>
                            <span className="font-semibold text-[#13382E]">
                              {day.accommodation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Curated Concierge Suggestions */}
                    {day.quickSuggestions &&
                      day.quickSuggestions.length > 0 && (() => {
                        const isSuggestionsExpanded =
                          expandedSuggestionDays.includes(day.dayNumber);
                        const hasOverflowSuggestions =
                          day.quickSuggestions.length > 3;
                        const visibleSuggestions =
                          hasOverflowSuggestions && !isSuggestionsExpanded
                            ? day.quickSuggestions.slice(0, 3)
                            : day.quickSuggestions;

                        return (
                          <div className="pt-5 border-t border-[#1F1A16]/15 space-y-2.5">
                            <p
                              style={monoStyle}
                              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#8A7E71]"
                            >
                              SUGGESTIONS (TAP TO INSCRIBE)
                            </p>
                            <div className="space-y-2.5">
                              {visibleSuggestions.map((sug, idx) => {
                                const sugKey = `${day.dayNumber}-${idx}`;
                                const isInfoOpen =
                                  openSuggestionInfoKey === sugKey;
                                const matchedCustomAct = customActs.find(
                                  (a) => a.title === sug.title
                                );
                                const alreadyAdded = Boolean(matchedCustomAct);
                                return (
                                  <div
                                    key={sugKey}
                                    className={`border transition-colors ${
                                      alreadyAdded
                                        ? "bg-[#13382E]/8 border-[#13382E]/30"
                                        : "bg-[#FBF8F3] border-[#1F1A16]/15 hover:border-[#A8442A]"
                                    }`}
                                  >
                                    <div className="flex items-stretch justify-between gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (matchedCustomAct) {
                                            handleRemoveCustomActivity(
                                              day.dayNumber,
                                              matchedCustomAct.id
                                            );
                                          } else {
                                            onAddCustomActivity(day.dayNumber, {
                                              time: sug.time,
                                              title: sug.title,
                                              category: sug.category,
                                              location: sug.location,
                                              notes: sug.notes,
                                              mapUrl:
                                                sug.serviceLinks?.[0]?.url,
                                            });
                                          }
                                        }}
                                        aria-label={
                                          alreadyAdded
                                            ? `Undo inscribed suggestion ${sug.title}`
                                            : `Inscribe suggestion ${sug.title}`
                                        }
                                        title={
                                          alreadyAdded
                                            ? "Tap to undo inscription and remove from itinerary"
                                            : undefined
                                        }
                                        className="min-h-11 sm:min-h-0 flex-1 text-left p-2.5 text-xs cursor-pointer"
                                      >
                                        {alreadyAdded ? (
                                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <span
                                              style={monoStyle}
                                              className="inline-flex items-center px-2 py-0.5 bg-[#13382E] text-[#F6F1E7] text-[10px] uppercase tracking-wider font-semibold"
                                            >
                                              &#10003; Inscribed
                                            </span>
                                            <span
                                              style={monoStyle}
                                              className="text-[10px] uppercase tracking-wider text-[#5C5248]"
                                            >
                                              {sug.time}
                                            </span>
                                          </div>
                                        ) : (
                                          <span
                                            style={monoStyle}
                                            className="text-[11px] sm:text-[10px] uppercase tracking-wider text-[#A8442A] block mb-0.5"
                                          >
                                            + ADD AT {sug.time}
                                          </span>
                                        )}
                                        <span
                                          className={`font-medium leading-snug block ${
                                            alreadyAdded
                                              ? "text-[#13382E]"
                                              : "text-[#1F1A16]"
                                          }`}
                                        >
                                          {sug.title}
                                        </span>
                                      </button>

                                      {(sug.bookingGuide ||
                                        (sug.serviceLinks &&
                                          sug.serviceLinks.length > 0)) && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setOpenSuggestionInfoKey(
                                              isInfoOpen ? null : sugKey
                                            )
                                          }
                                          style={monoStyle}
                                          aria-expanded={isInfoOpen}
                                          title="How to book & service links"
                                          className={`min-h-11 sm:min-h-0 px-3 sm:px-2.5 border-l border-[#1F1A16]/15 text-[11px] sm:text-[10px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                                            isInfoOpen
                                              ? "bg-[#1F1A16] text-[#F6F1E7]"
                                              : "bg-[#EFE7D8]/60 text-[#5C5248] hover:text-[#1F1A16] hover:bg-[#EFE7D8]"
                                          }`}
                                        >
                                          {isInfoOpen ? "CLOSE" : "INFO"}
                                        </button>
                                      )}
                                    </div>

                                    {/* Quick Direct Service Links Row */}
                                    {sug.serviceLinks &&
                                      sug.serviceLinks.length > 0 && (
                                        <div className="px-2.5 pb-2 pt-1 border-t border-[#1F1A16]/10 flex flex-wrap items-center gap-x-3 gap-y-1">
                                          {sug.serviceLinks.map((lnk) => (
                                            <a
                                              key={lnk.url}
                                              href={lnk.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={monoStyle}
                                              className="min-h-11 sm:min-h-0 text-[11px] sm:text-[10px] uppercase tracking-wider text-[#13382E] hover:text-[#A8442A] underline font-semibold inline-flex items-center"
                                            >
                                              <span>{lnk.label}</span>
                                              <ExternalArrow />
                                            </a>
                                          ))}
                                        </div>
                                      )}

                                    {/* Expandable Booking Guide Tooltip / Popup Drawer */}
                                    {isInfoOpen && sug.bookingGuide && (
                                      <div className="p-3 bg-[#EFE7D8] border-t border-[#1F1A16]/20 text-xs text-[#1F1A16] space-y-2">
                                        <div
                                          style={monoStyle}
                                          className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#A8442A] font-semibold"
                                        >
                                          HOW TO BOOK &amp; ACCESS
                                        </div>
                                        <p className="leading-relaxed text-[#4A4036]">
                                          {sug.bookingGuide}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {hasOverflowSuggestions && (
                                <button
                                  type="button"
                                  data-testid={`toggle-suggestions-day-${day.dayNumber}`}
                                  aria-expanded={isSuggestionsExpanded}
                                  onClick={() =>
                                    setExpandedSuggestionDays((prev) =>
                                      prev.includes(day.dayNumber)
                                        ? prev.filter(
                                            (d) => d !== day.dayNumber
                                          )
                                        : [...prev, day.dayNumber]
                                    )
                                  }
                                  style={monoStyle}
                                  className="min-h-11 w-full px-3 py-2 border border-[#1F1A16]/25 bg-[#FBF8F3] hover:bg-[#EFE7D8] text-[11px] uppercase tracking-wider font-semibold text-[#13382E] cursor-pointer transition-colors"
                                >
                                  {isSuggestionsExpanded
                                    ? "Show top 3"
                                    : `Show all (${day.quickSuggestions.length})`}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                  </div>

                  {/* Right Column (8 cols): Chronological Schedule & Custom Entry Form */}
                  <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    {showCompanionForDay &&
                      companionStatus &&
                      (() => {
                        const upNextWin = companionStatus.upNextActivity
                          ? parseActivityTimelineWindow(
                              companionStatus.upNextActivity,
                              day.dayNumber,
                              0
                            )
                          : null;
                        const isEveningUpNext = Boolean(
                          companionStatus.upNextActivity &&
                            (companionStatus.upNextActivity.category ===
                              "romance" ||
                              companionStatus.upNextActivity.category ===
                                "dining" ||
                              (upNextWin?.hasClockTime &&
                                upNextWin.startMinutes >= 17 * 60))
                        );

                        return (
                          <div
                            data-testid={`up-next-card-d${day.dayNumber}`}
                            className="bg-[#EFE7D8] border-2 border-[#13382E] p-4 sm:p-5 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                style={monoStyle}
                                className="text-[11px] uppercase tracking-[0.14em] text-[#13382E] font-bold"
                              >
                                {isLiveTripDay
                                  ? "UP NEXT • TODAY COMPANION"
                                  : "UP NEXT • COMPANION PREVIEW"}
                              </span>
                              <span
                                style={monoStyle}
                                className="px-2 py-0.5 bg-[#13382E] text-[#F6F1E7] text-[11px] uppercase tracking-[0.1em] font-semibold"
                              >
                                {isLiveTripDay
                                  ? companionStatus.countdownLabel
                                  : "Preview mode"}
                              </span>
                            </div>

                            {companionStatus.upNextActivity ? (
                              <div className="space-y-1">
                                <div
                                  style={monoStyle}
                                  className="text-xs text-[#A8442A] font-semibold"
                                >
                                  {companionStatus.upNextActivity.time}
                                </div>
                                <h4
                                  style={serifStyle}
                                  className="text-xl sm:text-2xl font-medium text-[#1F1A16]"
                                >
                                  {companionStatus.upNextActivity.title}
                                </h4>
                                {companionStatus.upNextActivity.location && (
                                  <p
                                    style={monoStyle}
                                    className="text-[11px] text-[#5C5248]"
                                  >
                                    LOC: {companionStatus.upNextActivity.location}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-[#13382E] font-medium">
                                Every planned movement for Day{" "}
                                {formatDayNumber(day.dayNumber)} is checked off.
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <a
                                href={upNextMapHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={monoStyle}
                                className="min-h-11 px-3 py-2 bg-[#FBF8F3] border border-[#1F1A16]/25 hover:border-[#13382E] text-[#13382E] text-[11px] uppercase tracking-[0.1em] font-semibold inline-flex items-center gap-1"
                              >
                                <span>Maps</span>
                                <ExternalArrow />
                              </a>

                              {activeHotelId && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenDriverModal?.(activeHotelId)
                                  }
                                  style={monoStyle}
                                  className="min-h-11 px-3 py-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[11px] uppercase tracking-[0.1em] font-semibold cursor-pointer inline-flex items-center"
                                >
                                  Hotel Driver Card
                                </button>
                              )}

                              {grabTarget && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onCopy?.(
                                      grabTarget.script,
                                      grabTarget.toastLabel
                                    )
                                  }
                                  style={monoStyle}
                                  className="min-h-11 px-3 py-2 bg-[#A8442A] hover:bg-[#8F351E] text-[#FBF8F3] text-[11px] uppercase tracking-[0.1em] font-semibold cursor-pointer inline-flex items-center"
                                >
                                  {grabTarget.label}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  onOpenWardrobeDrawer?.(
                                    day.dayNumber,
                                    companionStatus.upNextActivity || undefined
                                  )
                                }
                                disabled={!onOpenWardrobeDrawer}
                                style={monoStyle}
                                className="min-h-11 px-3 py-2 bg-[#FBF8F3] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] border border-[#1F1A16]/25 text-[11px] uppercase tracking-[0.08em] inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
                              >
                                <HangerIcon className="w-3.5 h-3.5" />
                                <span>
                                  {isEveningUpNext
                                    ? "Tonight's outfit:"
                                    : "Today's outfit:"}{" "}
                                  {tonightLook
                                    ? tonightLook.title
                                    : "Choose Look"}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                    <div className="divide-y divide-[#1F1A16]/12">
                      {allDayActivities.map((act, actIdx) => {
                        const isDone =
                          tripState.completedActivityIds.includes(act.id);
                        const pastUncompleted = Boolean(
                          isLiveTripDay &&
                            companionStatus &&
                            !isDone &&
                            isActivityPast(
                              act,
                              actIdx,
                              companionStatus.currentMinutes,
                              day.dayNumber
                            )
                        );
                        const style = CATEGORY_EDITORIAL_STYLES[act.category];
                        const actOutfit = resolveActivityOutfit(
                          act,
                          tripState.activityOutfitById,
                          allOutfits
                        );
                        const effectiveOutfit = actOutfit || resolvedDayLook;
                        const outfitValidation = validateOutfitForActivity(
                          effectiveOutfit,
                          act
                        );
                        return (
                          <React.Fragment key={act.id}>
                            {isLiveTripDay &&
                              companionStatus &&
                              actIdx === companionStatus.nowMarkerIndex && (
                                <div
                                  data-testid={`now-timeline-marker-d${day.dayNumber}`}
                                  className="py-2 flex items-center gap-2"
                                >
                                  <span
                                    style={monoStyle}
                                    className="px-2.5 py-0.5 bg-[#A8442A] text-[#FBF8F3] text-[11px] uppercase tracking-[0.14em] font-bold"
                                  >
                                    NOW &bull; {companionStatus.currentTimeLabel}
                                  </span>
                                  <span className="flex-1 h-px bg-[#A8442A]/50" />
                                </div>
                              )}
                            <div
                              data-past-uncompleted={
                                pastUncompleted ? "true" : undefined
                              }
                              className={`py-4 first:pt-0 last:pb-0 flex items-start gap-4 transition-opacity ${
                                isDone
                                  ? "opacity-55"
                                  : pastUncompleted
                                  ? "opacity-70"
                                  : ""
                              }`}
                            >
                            {/* Editorial Ink Checkbox */}
                            <button
                              type="button"
                              onClick={() => onToggleActivityCompleted(act.id)}
                              aria-label={`Mark ${act.title} as ${
                                isDone ? "incomplete" : "complete"
                              }`}
                              className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 -m-2.5 sm:m-0 sm:mt-1 flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              <span
                                aria-hidden="true"
                                className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                                  isDone
                                    ? "bg-[#13382E] border-[#13382E] text-[#F6F1E7] text-xs"
                                    : "border-[#1F1A16]/40 hover:border-[#1F1A16] bg-[#F6F1E7]"
                                }`}
                              >
                                {isDone ? "✓" : ""}
                              </span>
                            </button>

                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span
                                    style={monoStyle}
                                    className="text-xs font-semibold text-[#A8442A]"
                                  >
                                    {act.time}
                                  </span>
                                  <span
                                    style={monoStyle}
                                    className={`text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] px-2 py-0.5 border ${style.tag}`}
                                  >
                                    {style.label}
                                  </span>
                                  {act.isLocked && (
                                    <span
                                      style={monoStyle}
                                      className="hidden sm:inline text-[10px] uppercase tracking-[0.14em] text-[#8A7E71]"
                                    >
                                      &bull; CONFIRMED LOGISTICS
                                    </span>
                                  )}
                                  {actOutfit && (
                                    <span
                                      style={monoStyle}
                                      className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.13em] px-2 py-0.5 bg-[#13382E]/10 border border-[#13382E]/30 text-[#13382E] inline-flex items-center gap-1"
                                    >
                                      <HangerIcon className="w-3 h-3" />
                                      <span>LOOK: {actOutfit.title}</span>
                                    </span>
                                  )}
                                </div>

                                <h4
                                  style={serifStyle}
                                  className={`text-xl sm:text-2xl font-medium ${
                                    isDone
                                      ? "line-through text-[#8A7E71]"
                                      : "text-[#1F1A16]"
                                  }`}
                                >
                                  {act.title}
                                </h4>

                                {act.subtitle && (
                                  <p className="text-xs sm:text-sm text-[#5C5248]">
                                    {act.subtitle}
                                  </p>
                                )}

                                {pastUncompleted && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onToggleActivityCompleted(act.id)
                                    }
                                    style={monoStyle}
                                    className="min-h-11 sm:min-h-0 px-2.5 py-1 bg-[#EFE7D8] hover:bg-[#13382E] hover:text-[#F6F1E7] border border-[#1F1A16]/20 text-[11px] text-[#5C5248] transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    Past scheduled time &mdash; tap &#10003; to
                                    mark done
                                  </button>
                                )}

                                {act.notes && (
                                  <div className="text-xs text-[#4A4036] bg-[#EFE7D8]/70 border-l-2 border-[#9E7B3B] pl-3 py-2 mt-1.5">
                                    {act.notes}
                                  </div>
                                )}

                                {outfitValidation.hasConflict && (
                                  <div
                                    role="alert"
                                    className="text-xs text-[#8F351E] bg-[#A8442A]/12 border-l-2 border-[#A8442A] pl-3 py-2 mt-1.5 space-y-0.5"
                                  >
                                    <div
                                      style={monoStyle}
                                      className="text-[11px] sm:text-[10px] uppercase tracking-wider font-bold text-[#A8442A]"
                                    >
                                      &#9888; {outfitValidation.headline}
                                    </div>
                                    <p className="text-[#1F1A16]">
                                      {outfitValidation.message}
                                    </p>
                                  </div>
                                )}

                                {(act.location || act.mapUrl) && (
                                  <div
                                    style={monoStyle}
                                    className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#5C5248]"
                                  >
                                    {act.location && (
                                      <span>LOC: {act.location}</span>
                                    )}
                                    <div className="hidden sm:flex flex-wrap items-center gap-3">
                                      {act.mapUrl && (
                                        <a
                                          href={act.mapUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-[#13382E] hover:text-[#A8442A] underline font-medium"
                                        >
                                          VIEW CARTOGRAPHY <ExternalArrow />
                                        </a>
                                      )}
                                      <span className="text-[#1F1A16]/20 select-none">
                                        &bull;
                                      </span>
                                      <a
                                        href={buildGoogleCalendarUrl(day, act)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#A8442A] hover:underline font-medium inline-flex items-center gap-0.5"
                                        title="Add this event to Google Calendar"
                                      >
                                        <span>+ Google Cal</span>
                                        <ExternalArrow />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleExportSingleActivity(day, act)
                                        }
                                        className="text-[#13382E] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                                        title="Download .ics for Apple Calendar, Outlook, or iCal"
                                      >
                                        <span>+ .ics</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {!act.location && !act.mapUrl && (
                                  <div
                                    style={monoStyle}
                                    className="hidden sm:flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#5C5248]"
                                  >
                                    <a
                                      href={buildGoogleCalendarUrl(day, act)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#A8442A] hover:underline font-medium inline-flex items-center gap-0.5"
                                      title="Add this event to Google Calendar"
                                    >
                                      <span>+ Google Cal</span>
                                      <ExternalArrow />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleExportSingleActivity(day, act)
                                      }
                                      className="text-[#13382E] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                                      title="Download .ics for Apple Calendar, Outlook, or iCal"
                                    >
                                      <span>+ .ics</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                            {/* Mobile ⋯ Action Sheet Trigger + Desktop Inline Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setActionSheetTarget({
                                    dayNumber: day.dayNumber,
                                    activity: act,
                                    isCustom:
                                      !act.isLocked &&
                                      act.id.startsWith("custom-"),
                                  })
                                }
                                aria-label={`More actions for ${act.title}`}
                                className="sm:hidden min-h-11 min-w-11 inline-flex items-center justify-center border border-[#1F1A16]/20 bg-[#EFE7D8]/70 hover:bg-[#1F1A16] hover:text-[#F6F1E7] text-[#1F1A16] text-base font-bold cursor-pointer transition-colors"
                              >
                                &#8943;
                              </button>

                              <div className="hidden sm:flex items-center gap-1">
                                {onOpenWardrobeDrawer && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenWardrobeDrawer(day.dayNumber, act)
                                    }
                                    aria-label={`Assign or override outfit for ${act.title}`}
                                    title={
                                      actOutfit
                                        ? `Outfit Override: ${actOutfit.title} (Tap to change)`
                                        : "Assign activity outfit override"
                                    }
                                    className={`inline-flex items-center justify-center gap-1 p-1.5 border transition-colors cursor-pointer ${
                                      actOutfit
                                        ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                                        : "bg-[#EFE7D8]/50 text-[#5C5248] hover:text-[#13382E] border-[#1F1A16]/15 hover:border-[#13382E]"
                                    }`}
                                  >
                                    <HangerIcon className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!act.isLocked &&
                                  act.id.startsWith("custom-") && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          startEditingActivity(
                                            act,
                                            day.dayNumber
                                          )
                                        }
                                        style={monoStyle}
                                        className="text-[10px] uppercase tracking-wider text-[#5C5248] hover:text-[#13382E] px-2 py-1 border border-[#1F1A16]/15 hover:border-[#13382E] bg-[#EFE7D8]/50 cursor-pointer"
                                        title="Edit entry"
                                      >
                                        EDIT
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveCustomActivity(
                                            day.dayNumber,
                                            act.id
                                          )
                                        }
                                        aria-label={`Remove custom entry ${act.title}`}
                                        className="inline-flex items-center justify-center text-xs text-[#8A7E71] hover:text-[#A8442A] px-2 py-1 cursor-pointer"
                                        title="Remove custom entry"
                                      >
                                        &#10005;
                                      </button>
                                    </>
                                  )}
                              </div>
                            </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      {isLiveTripDay &&
                        companionStatus &&
                        companionStatus.nowMarkerIndex ===
                          allDayActivities.length && (
                          <div
                            data-testid={`now-timeline-marker-d${day.dayNumber}`}
                            className="py-2 flex items-center gap-2"
                          >
                            <span
                              style={monoStyle}
                              className="px-2.5 py-0.5 bg-[#A8442A] text-[#FBF8F3] text-[11px] uppercase tracking-[0.14em] font-bold"
                            >
                              NOW &bull; {companionStatus.currentTimeLabel}
                            </span>
                            <span className="flex-1 h-px bg-[#A8442A]/50" />
                          </div>
                        )}
                    </div>

                    {/* Add Custom Activity Drawer */}
                    <div className="pt-4 border-t border-[#1F1A16]/15">
                      {addingToDay === day.dayNumber ? (
                        <form
                          onSubmit={(e) =>
                            handleAddActivitySubmit(e, day.dayNumber)
                          }
                          className="bg-[#EFE7D8]/80 border border-[#1F1A16]/25 p-5 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              style={monoStyle}
                              className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.18em] font-semibold text-[#13382E]"
                            >
                              INSCRIBE NEW ENTRY FOR {day.shortDate}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAddingToDay(null)}
                              className="min-h-11 sm:min-h-0 px-2 sm:px-0 text-xs text-[#5C5248] hover:text-[#1F1A16] underline cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              type="text"
                              enterKeyHint="next"
                              autoComplete="off"
                              value={newActTime}
                              onChange={(e) => setNewActTime(e.target.value)}
                              placeholder="Time (e.g. 19:30 ICT)"
                              className="min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                            />
                            <input
                              type="text"
                              required
                              enterKeyHint="next"
                              autoComplete="off"
                              value={newActTitle}
                              onChange={(e) => setNewActTitle(e.target.value)}
                              placeholder="Reservation, excursion, or birthday note..."
                              className="sm:col-span-2 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {[
                              "09:00 ICT",
                              "13:00 ICT",
                              "19:30 ICT",
                              "Flexible",
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setNewActTime(preset)}
                                style={monoStyle}
                                className={`min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-wider border cursor-pointer transition-colors ${
                                  newActTime === preset
                                    ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                                    : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20 hover:border-[#13382E]"
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <select
                              value={newActCategory}
                              onChange={(e) =>
                                setNewActCategory(
                                  e.target
                                    .value as ItineraryActivity["category"]
                                )
                              }
                              className="min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                            >
                              <option value="romance">
                                Celebration &amp; Romance
                              </option>
                              <option value="dining">Gastronomy</option>
                              <option value="beach">Andaman Coast</option>
                              <option value="spa">Sanctuary &amp; Spa</option>
                              <option value="culture">
                                Heritage &amp; Temple
                              </option>
                              <option value="transit">Passage</option>
                              <option value="custom">Bespoke Note</option>
                            </select>
                            <input
                              type="text"
                              enterKeyHint="next"
                              autoComplete="off"
                              value={newActLocation}
                              onChange={(e) =>
                                setNewActLocation(e.target.value)
                              }
                              placeholder="Venue / Location"
                              className="min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                            />
                            <input
                              type="text"
                              enterKeyHint="done"
                              autoComplete="off"
                              value={newActNotes}
                              onChange={(e) => setNewActNotes(e.target.value)}
                              placeholder="Dress code or concierge note"
                              className="min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                            />
                          </div>
                          <button
                            type="submit"
                            style={monoStyle}
                            className="min-h-11 sm:min-h-0 px-5 py-2.5 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.1em] sm:tracking-[0.16em] cursor-pointer"
                          >
                            Save to Day {day.dayNumber}
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingToDay(day.dayNumber)}
                          style={monoStyle}
                          className="min-h-11 sm:min-h-0 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#13382E] hover:text-[#A8442A] font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <span>+ INSCRIBE BESPOKE RESERVATION OR NOTE</span>
                          <span>&rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {selectedDayNum !== null && (
        <div
          data-testid="single-day-pagination"
          className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2"
        >
          <button
            type="button"
            disabled={selectedDayNum <= 0}
            onClick={() => {
              const prevDay = selectedDayNum - 1;
              navigateSingleDay(prevDay, `day-card-${prevDay}`);
            }}
            style={monoStyle}
            className="min-h-11 px-4 py-2.5 bg-[#F6F1E7] border border-[#1F1A16]/25 hover:border-[#13382E] text-[11px] uppercase tracking-[0.1em] text-[#1F1A16] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &larr; Prev Day
          </button>

          <button
            type="button"
            onClick={() => navigateSingleDay(null, "itinerary-step-header")}
            style={monoStyle}
            className="min-h-11 px-4 py-2.5 bg-[#EFE7D8] hover:bg-[#1F1A16] hover:text-[#F6F1E7] border border-[#1F1A16]/25 text-[11px] uppercase tracking-[0.1em] text-[#1F1A16] font-semibold cursor-pointer transition-colors"
          >
            Full Spread (All 11 Days)
          </button>

          <button
            type="button"
            disabled={selectedDayNum >= TRIP_DAYS.length - 1}
            onClick={() => {
              const nextDay = selectedDayNum + 1;
              navigateSingleDay(nextDay, `day-card-${nextDay}`);
            }}
            style={monoStyle}
            className="min-h-11 px-4 py-2.5 bg-[#13382E] hover:bg-[#1D4E40] border border-[#13382E] text-[11px] uppercase tracking-[0.1em] text-[#F6F1E7] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next Day &rarr;
          </button>
        </div>
      )}

      {/* Mobile Activity Overflow Action Sheet (<dialog>) */}
      <dialog
        ref={actionSheetDialogRef}
        {...({
          closedby: "any",
        } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="activity-action-sheet-title"
        onClose={handleActionSheetClose}
        className="[&:not([open])]:hidden open:flex open:flex-col fixed inset-x-0 bottom-0 top-auto m-0 mt-auto w-full max-w-none max-h-[88dvh] rounded-t-2xl sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-none bg-[#F6F1E7] text-[#1F1A16] border-t sm:border border-[#C9BFA8] shadow-2xl p-0 z-50 overflow-hidden overscroll-contain backdrop:bg-[#1F1A16]/60 backdrop:backdrop-blur-[2px] backdrop:overflow-hidden backdrop:overscroll-contain"
      >
        {actionSheetTarget && (() => {
          const targetDay = TRIP_DAYS.find(
            (d) => d.dayNumber === actionSheetTarget.dayNumber
          );
          const act = actionSheetTarget.activity;
          const catStyle = CATEGORY_EDITORIAL_STYLES[act.category];
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              <div
                data-sheet-drag-handle="true"
                className="sm:hidden shrink-0 flex justify-center pt-2.5 pb-1 bg-[#EFE7D8]/70"
              >
                <span className="w-10 h-1 rounded-full bg-[#1F1A16]/25" />
              </div>

              <div className="shrink-0 p-4 border-b border-[#1F1A16]/15 bg-[#EFE7D8]/70 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      style={monoStyle}
                      className="text-xs font-semibold text-[#A8442A]"
                    >
                      {act.time}
                    </span>
                    <span
                      style={monoStyle}
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${catStyle.tag}`}
                    >
                      {catStyle.label}
                    </span>
                  </div>
                  <h3
                    id="activity-action-sheet-title"
                    style={serifStyle}
                    className="text-xl font-medium text-[#1F1A16] truncate"
                  >
                    {act.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeActionSheet}
                  style={monoStyle}
                  aria-label="Close activity actions"
                  className="min-h-11 min-w-11 px-2.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0 inline-flex items-center justify-center"
                >
                  &#10005;
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-2">
                {onOpenWardrobeDrawer && (
                  <button
                    type="button"
                    onClick={() => {
                      const dayNum = actionSheetTarget.dayNumber;
                      closeActionSheet();
                      onOpenWardrobeDrawer(dayNum, act);
                    }}
                    style={monoStyle}
                    className="min-h-11 w-full px-4 py-2.5 bg-[#FBF8F3] hover:bg-[#EFE7D8] border border-[#1F1A16]/20 text-left text-xs uppercase tracking-wider font-semibold text-[#13382E] flex items-center justify-between cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2">
                      <HangerIcon className="w-4 h-4" />
                      <span>Outfit</span>
                    </span>
                    <span className="text-[10px] text-[#5C5248]">
                      Assign / Override &rarr;
                    </span>
                  </button>
                )}

                {act.mapUrl && (
                  <a
                    href={act.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={monoStyle}
                    className="min-h-11 w-full px-4 py-2.5 bg-[#FBF8F3] hover:bg-[#EFE7D8] border border-[#1F1A16]/20 text-xs uppercase tracking-wider font-semibold text-[#13382E] flex items-center justify-between"
                  >
                    <span>Maps</span>
                    <span className="inline-flex items-center gap-1">
                      <span>Open Cartography</span>
                      <ExternalArrow />
                    </span>
                  </a>
                )}

                {targetDay && (
                  <>
                    <a
                      href={buildGoogleCalendarUrl(targetDay, act)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={monoStyle}
                      className="min-h-11 w-full px-4 py-2.5 bg-[#FBF8F3] hover:bg-[#EFE7D8] border border-[#1F1A16]/20 text-xs uppercase tracking-wider font-semibold text-[#A8442A] flex items-center justify-between"
                    >
                      <span>+ Google Cal</span>
                      <ExternalArrow />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        handleExportSingleActivity(targetDay, act);
                        closeActionSheet();
                      }}
                      style={monoStyle}
                      className="min-h-11 w-full px-4 py-2.5 bg-[#FBF8F3] hover:bg-[#EFE7D8] border border-[#1F1A16]/20 text-left text-xs uppercase tracking-wider font-semibold text-[#13382E] flex items-center justify-between cursor-pointer"
                    >
                      <span>+ .ics</span>
                      <span className="text-[10px] text-[#5C5248]">
                        Download Calendar File
                      </span>
                    </button>
                  </>
                )}

                {actionSheetTarget.isCustom && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const dayNum = actionSheetTarget.dayNumber;
                        closeActionSheet();
                        startEditingActivity(act, dayNum);
                      }}
                      style={monoStyle}
                      className="min-h-11 w-full px-4 py-2.5 bg-[#FBF8F3] hover:bg-[#EFE7D8] border border-[#1F1A16]/20 text-left text-xs uppercase tracking-wider font-semibold text-[#1F1A16] flex items-center justify-between cursor-pointer"
                    >
                      <span>Edit</span>
                      <span className="text-[10px] text-[#5C5248]">
                        Modify Details
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const dayNum = actionSheetTarget.dayNumber;
                        closeActionSheet();
                        handleRemoveCustomActivity(dayNum, act.id);
                      }}
                      style={monoStyle}
                      className="min-h-11 w-full px-4 py-2.5 bg-[#A8442A]/10 hover:bg-[#A8442A] border border-[#A8442A]/40 text-left text-xs uppercase tracking-wider font-semibold text-[#A8442A] hover:text-[#FBF8F3] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>Remove</span>
                      <span className="text-[10px]">Delete Entry</span>
                    </button>
                  </>
                )}
              </div>

              <div className="shrink-0 sticky bottom-0 bg-[#EFE7D8] border-t border-[#D8CEBC] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3 flex justify-end">
                <button
                  type="button"
                  onClick={closeActionSheet}
                  style={monoStyle}
                  className="min-h-11 px-4 py-2 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          );
        })()}
      </dialog>

      {/* Responsive Activity Edit Bottom Sheet (<dialog>) */}
      <dialog
        ref={editSheetDialogRef}
        {...({
          closedby: "any",
        } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="activity-edit-sheet-title"
        onClose={handleEditSheetClose}
        className="[&:not([open])]:hidden open:flex open:flex-col fixed inset-x-0 bottom-0 top-auto m-0 mt-auto w-full max-w-none max-h-[88dvh] rounded-t-2xl sm:inset-0 sm:m-auto sm:max-w-lg sm:rounded-none bg-[#F6F1E7] text-[#1F1A16] border-t-2 sm:border-2 border-[#1F1A16] shadow-2xl p-0 z-50 overflow-hidden overscroll-contain backdrop:bg-[#1F1A16]/70 backdrop:backdrop-blur-sm backdrop:overflow-hidden backdrop:overscroll-contain"
      >
        {isEditSheetOpen &&
          editingActivityId &&
          editingDayNumber !== null && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              <div
                data-sheet-drag-handle="true"
                className="sm:hidden shrink-0 flex justify-center pt-2.5 pb-1 bg-[#EFE7D8]/70"
              >
                <span className="w-10 h-1 rounded-full bg-[#1F1A16]/25" />
              </div>

              <div className="shrink-0 p-4 sm:p-5 border-b border-[#1F1A16]/20 bg-[#EFE7D8]/70 flex items-center justify-between gap-3">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[11px] uppercase tracking-[0.12em] text-[#13382E] font-semibold block"
                  >
                    EDIT ENTRY &bull; DAY {formatDayNumber(editingDayNumber)}
                  </span>
                  <h3
                    id="activity-edit-sheet-title"
                    style={serifStyle}
                    className="text-2xl font-normal text-[#1F1A16]"
                  >
                    Update Itinerary Movement
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeEditSheet}
                  style={monoStyle}
                  aria-label="Close edit activity dialog"
                  className="min-h-11 min-w-11 px-2.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0 inline-flex items-center justify-center"
                >
                  &#10005;
                </button>
              </div>

              <form
                onSubmit={(e) =>
                  handleSaveEditedActivity(
                    e,
                    editingDayNumber,
                    editingActivityId
                  )
                }
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
              >
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      enterKeyHint="next"
                      autoComplete="off"
                      value={editActTime}
                      onChange={(e) => setEditActTime(e.target.value)}
                      placeholder="Time (e.g. 19:30 ICT)"
                      className="min-h-11 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                    />
                    <input
                      type="text"
                      required
                      enterKeyHint="next"
                      autoComplete="off"
                      value={editActTitle}
                      onChange={(e) => setEditActTitle(e.target.value)}
                      placeholder="Activity title..."
                      className="sm:col-span-2 min-h-11 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      "09:00 ICT",
                      "13:00 ICT",
                      "19:30 ICT",
                      "Flexible",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditActTime(preset)}
                        style={monoStyle}
                        className={`min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-wider border cursor-pointer transition-colors ${
                          editActTime === preset
                            ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                            : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20 hover:border-[#13382E]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    <select
                      value={editActCategory}
                      onChange={(e) =>
                        setEditActCategory(
                          e.target.value as ItineraryActivity["category"]
                        )
                      }
                      className="min-h-11 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                    >
                      <option value="romance">Celebration &amp; Romance</option>
                      <option value="dining">Gastronomy</option>
                      <option value="beach">Andaman Coast</option>
                      <option value="spa">Sanctuary &amp; Spa</option>
                      <option value="culture">Heritage &amp; Temple</option>
                      <option value="transit">Passage</option>
                      <option value="custom">Bespoke Note</option>
                    </select>
                    <input
                      type="text"
                      enterKeyHint="next"
                      autoComplete="off"
                      value={editActLocation}
                      onChange={(e) => setEditActLocation(e.target.value)}
                      placeholder="Venue / Location"
                      className="min-h-11 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                    />
                    <input
                      type="text"
                      enterKeyHint="done"
                      autoComplete="off"
                      value={editActNotes}
                      onChange={(e) => setEditActNotes(e.target.value)}
                      placeholder="Dress code or note"
                      className="min-h-11 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                    />
                  </div>
                </div>

                <div className="shrink-0 sticky bottom-0 bg-[#EFE7D8] border-t border-[#D8CEBC] px-4 sm:px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEditSheet}
                    style={monoStyle}
                    className="min-h-11 px-4 py-2 border border-[#1F1A16]/25 bg-[#FBF8F3] text-xs uppercase tracking-wider text-[#5C5248] hover:text-[#1F1A16] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={monoStyle}
                    className="min-h-11 px-4 py-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.12em] font-semibold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
      </dialog>
    </section>
  );
}
