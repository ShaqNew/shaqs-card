import React, { useState } from "react";
import { ChangeLogEntry } from "../types";
import { serifStyle, monoStyle } from "../styles";

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

  if (!isOpen) return null;

  const filteredLogs = changeLog.filter(
    (entry) =>
      logSectionFilter === "all" || entry.section === logSectionFilter
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Folio Change & Revision Log"
      className="fixed inset-0 z-50 bg-[#1F1A16]/75 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F3] border-l-2 border-[#1F1A16] w-full max-w-xl h-full flex flex-col justify-between shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#1F1A16]/20 bg-[#EFE7D8]/70 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                style={monoStyle}
                className="text-[11px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
              >
                AUDIT &amp; REVISION CHRONICLE
              </span>
              <h3
                style={serifStyle}
                className="text-3xl font-normal text-[#1F1A16] mt-0.5"
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
              className="px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0"
            >
              Close &#10005;
            </button>
          </div>

          {/* Active Editor Selector + Section Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1F1A16]/15">
            <div className="flex items-center gap-2">
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-wider text-[#5C5248]"
              >
                LOGGING AS:
              </span>
              {(["Shaq", "Naana"] as const).map((person) => (
                <button
                  key={person}
                  type="button"
                  onClick={() => onSetActiveActor(person)}
                  style={monoStyle}
                  className={`px-2.5 py-1 text-[11px] uppercase tracking-wider border cursor-pointer ${
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

            <div className="flex flex-wrap gap-1">
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
                  className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border cursor-pointer ${
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
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#1F1A16]/15">
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
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
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
                        className="text-[10px] text-[#8A7E71]"
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
                    className="text-xs text-[#8A7E71] hover:text-[#A8442A] px-1.5 py-0.5 shrink-0 cursor-pointer"
                    title="Remove this log entry"
                  >
                    &#10005;
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#1F1A16]/20 bg-[#EFE7D8]/60 flex items-center justify-between">
          <span style={monoStyle} className="text-[11px] text-[#5C5248]">
            TOTAL LOGGED EVENTS: {changeLog.length}
          </span>
          {changeLog.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              style={monoStyle}
              className="px-3 py-1.5 border border-[#A8442A]/40 text-[#A8442A] hover:bg-[#A8442A] hover:text-[#FBF8F3] text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              Clear All History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
