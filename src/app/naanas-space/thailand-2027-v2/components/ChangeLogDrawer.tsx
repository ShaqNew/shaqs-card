import React, { useEffect, useState } from "react";
import { ChangeLogEntry } from "../types";
import { serifStyle, monoStyle } from "../styles";
import { useBottomSheetDialog } from "../hooks/useBottomSheetDialog";

interface ChangeLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  changeLog: ChangeLogEntry[];
  activeActor: "Shaq" | "Naana";
  onSetActiveActor: (actor: "Shaq" | "Naana") => void;
  onDeleteEntry: (logId: string) => void;
  onClearAll: () => void;
}

export function ChangeLogDrawer({
  isOpen,
  onClose,
  changeLog,
  activeActor,
  onSetActiveActor,
  onDeleteEntry,
  onClearAll,
}: ChangeLogDrawerProps) {
  const [logSectionFilter, setLogSectionFilter] = useState<
    "all" | ChangeLogEntry["section"]
  >("all");
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const { dialogRef, handleDialogClose } = useBottomSheetDialog({
    open: isOpen,
    onClose,
    desktopMode: "modal",
    lightDismiss: true,
  });

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmingClear(false);
    }
  }, [isOpen]);

  const filteredLogs = changeLog.filter(
    (entry) =>
      logSectionFilter === "all" || entry.section === logSectionFilter
  );

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-labelledby="changelog-drawer-title"
      onClose={handleDialogClose}
      className="[&:not([open])]:hidden open:flex open:flex-col fixed inset-x-0 bottom-0 top-auto m-0 mt-auto w-full max-w-none max-h-[88dvh] rounded-t-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:my-0 sm:h-dvh sm:max-h-dvh sm:max-w-xl sm:rounded-none bg-[#F6F1E7] text-[#1F1A16] border-t sm:border-t-0 sm:border-l border-[#C9BFA8] shadow-2xl p-0 z-50 overflow-hidden overscroll-contain backdrop:bg-[#1F1A16]/60 sm:backdrop:backdrop-blur-[2px] backdrop:overflow-hidden backdrop:overscroll-contain"
    >
      {isOpen && (
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
              <div>
                <span
                  style={monoStyle}
                  className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#A8442A] font-semibold block"
                >
                  AUDIT &amp; REVISION CHRONICLE
                </span>
                <h3
                  id="changelog-drawer-title"
                  style={serifStyle}
                  className="text-2xl sm:text-3xl font-normal text-[#1F1A16] mt-0.5"
                >
                  Folio Change Log
                </h3>
                <p className="text-xs text-[#5C5248] mt-1">
                  Tracks when reservations, notes, prep tasks, and packing items
                  were added, edited, or marked complete by Shaq &amp; Naana.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={monoStyle}
                className="min-h-11 sm:min-h-0 px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider inline-flex items-center cursor-pointer shrink-0"
              >
                Close &#10005;
              </button>
            </div>

            {/* Active Editor Selector + Horizontally Scrollable Section Filter Pills */}
            <div className="space-y-2.5 pt-2 border-t border-[#1F1A16]/15">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] uppercase tracking-wider text-[#5C5248]"
                  >
                    LOGGING AS:
                  </span>
                  {(["Shaq", "Naana"] as const).map((person) => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => onSetActiveActor(person)}
                      style={monoStyle}
                      className={`min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] uppercase tracking-wider border cursor-pointer ${
                        activeActor === person
                          ? person === "Shaq"
                            ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E] font-semibold"
                            : "bg-[#A8442A] text-[#FBF8F3] border-[#A8442A] font-semibold"
                          : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                      }`}
                    >
                      {person}
                    </button>
                  ))}
                </div>
                <span style={monoStyle} className="text-[11px] text-[#5C5248]">
                  TOTAL: {changeLog.length}
                </span>
              </div>

              <div
                data-testid="changelog-filter-row"
                className="flex flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1.5 pb-1"
              >
                {[
                  { id: "all", label: "All" },
                  { id: "itinerary", label: "Itinerary" },
                  { id: "prep", label: "Prep & Apps" },
                  { id: "packing", label: "Packing" },
                  { id: "budget", label: "Budget" },
                  { id: "bookings", label: "Bookings" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      setLogSectionFilter(
                        f.id as "all" | ChangeLogEntry["section"]
                      )
                    }
                    style={monoStyle}
                    className={`min-h-11 sm:min-h-0 shrink-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-wider border cursor-pointer ${
                      logSectionFilter === f.id
                        ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                        : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Log Entries List */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 divide-y divide-[#1F1A16]/15">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p
                  style={serifStyle}
                  className="text-2xl italic text-[#5C5248]"
                >
                  No recorded changes yet.
                </p>
              </div>
            ) : (
              filteredLogs.map((entry) => {
                const formattedDate = new Date(
                  entry.timestamp
                ).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={entry.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          style={monoStyle}
                          className={`px-2 py-0.5 text-[11px] sm:text-[10px] uppercase tracking-wider font-semibold ${
                            entry.actor === "Shaq"
                              ? "bg-[#13382E] text-[#F6F1E7]"
                              : "bg-[#A8442A] text-[#FBF8F3]"
                          }`}
                        >
                          {entry.actor}
                        </span>
                        <span
                          style={monoStyle}
                          className="text-[11px] uppercase tracking-wider font-semibold text-[#1F1A16]"
                        >
                          {entry.action}
                        </span>
                        <span
                          style={monoStyle}
                          className="text-[11px] sm:text-[10px] text-[#8A7E71]"
                        >
                          &bull; {formattedDate}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#4A4036] break-words">
                        {entry.detail}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      aria-label={`Remove log entry ${entry.action}`}
                      className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-xs text-[#8A7E71] hover:text-[#A8442A] px-1.5 py-0.5 inline-flex items-center justify-center shrink-0 cursor-pointer"
                      title="Remove this log entry"
                    >
                      &#10005;
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Drawer Footer Action Bar */}
          <div className="shrink-0 sticky bottom-0 bg-[#EFE7D8] border-t border-[#D8CEBC] px-4 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {changeLog.length > 0 ? (
                isConfirmingClear ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onClearAll();
                        setIsConfirmingClear(false);
                      }}
                      style={monoStyle}
                      className="min-h-11 sm:min-h-0 px-3 py-1.5 bg-[#A8442A] text-[#FBF8F3] text-[11px] sm:text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Confirm Clear All
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClear(false)}
                      style={monoStyle}
                      className="min-h-11 sm:min-h-0 px-3 py-1.5 border border-[#1F1A16]/25 text-[#5C5248] text-[11px] sm:text-[10px] uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(true)}
                    style={monoStyle}
                    className="min-h-11 sm:min-h-0 px-3 py-1.5 border border-[#A8442A]/40 text-[#A8442A] hover:bg-[#A8442A] hover:text-[#FBF8F3] text-[11px] sm:text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Clear All History
                  </button>
                )
              ) : (
                <span style={monoStyle} className="text-[11px] text-[#5C5248]">
                  TOTAL LOGGED EVENTS: 0
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              className="min-h-11 px-4 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-[11px] sm:text-[10px] uppercase tracking-wider font-semibold cursor-pointer shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
