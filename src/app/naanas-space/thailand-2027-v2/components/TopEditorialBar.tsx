import React from "react";
import Link from "next/link";
import { monoStyle, serifStyle } from "../styles";
import { DualTimezoneClock } from "../utils/companion";

interface TopEditorialBarProps {
  activeActor: "Shaq" | "Naana";
  onSetActiveActor: (actor: "Shaq" | "Naana") => void;
  changeLogCount: number;
  onOpenChangeLog: () => void;
  syncStatus: "local" | "syncing" | "synced";
  onSyncFromCloud: () => void;
  dualClock?: DualTimezoneClock;
  showDualClock?: boolean;
}

export function TopEditorialBar({
  activeActor,
  onSetActiveActor,
  changeLogCount,
  onOpenChangeLog,
  syncStatus,
  onSyncFromCloud,
  dualClock,
  showDualClock = false,
}: TopEditorialBarProps) {
  const syncLabel =
    syncStatus === "synced"
      ? "Cloud synced — tap to refresh"
      : syncStatus === "syncing"
      ? "Syncing with cloud"
      : "Local cache — tap to sync";

  return (
    <div className="border-b border-[#1F1A16]/15 bg-[#EFE7D8]/70 px-2.5 sm:px-8 py-2 sm:py-3">
      <div className="max-w-6xl mx-auto flex flex-nowrap sm:flex-wrap items-center justify-between gap-1.5 sm:gap-4 text-[11px] uppercase tracking-[0.06em] sm:tracking-[0.2em] text-[#5C5248]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <Link
            href="/naanas-space"
            className="min-h-11 sm:min-h-0 text-[#1F1A16] hover:text-[#A8442A] font-semibold flex items-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap"
          >
            <span aria-hidden="true">&larr;</span>
            <span>
              <span className="hidden sm:inline">Back to </span>
              Naana&apos;s Space
            </span>
          </Link>
          <span className="hidden sm:inline text-[#1F1A16]/25">|</span>
          <Link
            href="/naanas-space/thailand-2027"
            style={monoStyle}
            className="hidden sm:inline-flex items-center px-2 py-0.5 border border-[#13382E]/30 bg-[#13382E]/10 text-[#13382E] hover:bg-[#13382E] hover:text-[#F6F1E7] text-[10px] tracking-[0.14em] font-semibold transition-colors"
            title="Switch to the original Thailand 2027 v1 desktop layout (shares the same live trip data)"
          >
            V2 MOBILE EDITION &bull; SWITCH TO V1 CLASSIC &rarr;
          </Link>
        </div>

        <span
          style={serifStyle}
          className="sm:hidden text-[13px] font-semibold text-[#1F1A16] tracking-tight truncate min-w-0 normal-case"
        >
          Thailand &apos;27
        </span>

        <div className="flex items-center sm:flex-wrap gap-1.5 sm:gap-2.5 shrink-0">
          {/* Active Editor Toggle (Shaq / Naana) */}
          <div
            style={monoStyle}
            className="flex items-center border border-[#1F1A16]/20 bg-[#FBF8F3] text-[11px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.14em]"
            title="Select who is making changes on this device"
          >
            <span className="hidden sm:inline px-2 py-0.5 text-[#8A7E71] border-r border-[#1F1A16]/15">
              EDITOR:
            </span>
            {(["Shaq", "Naana"] as const).map((person) => (
              <button
                key={person}
                type="button"
                aria-label={person}
                onClick={() => onSetActiveActor(person)}
                className={`min-h-11 min-w-9 sm:min-h-0 sm:min-w-0 px-2.5 sm:px-2 py-1 sm:py-0.5 uppercase inline-flex items-center justify-center transition-colors cursor-pointer ${
                  activeActor === person
                    ? person === "Shaq"
                      ? "bg-[#13382E] text-[#F6F1E7] font-semibold"
                      : "bg-[#A8442A] text-[#FBF8F3] font-semibold"
                    : "text-[#5C5248] hover:text-[#1F1A16]"
                }`}
              >
                <span className="sm:hidden font-bold" aria-hidden="true">
                  {person[0]}
                </span>
                <span className="hidden sm:inline">{person}</span>
              </button>
            ))}
          </div>

          {/* Change Log Drawer Button (desktop header; mobile uses More/Pocket) */}
          <button
            type="button"
            onClick={onOpenChangeLog}
            style={monoStyle}
            className="hidden sm:inline-flex min-h-11 sm:min-h-0 items-center px-2.5 py-0.5 border border-[#1F1A16]/25 bg-[#FBF8F3] hover:bg-[#1F1A16] text-[11px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.14em] text-[#1F1A16] hover:text-[#F6F1E7] font-semibold transition-colors cursor-pointer"
            title="View history of itinerary, prep, packing, and budget changes"
          >
            CHANGE LOG ({changeLogCount})
          </button>

          <button
            type="button"
            onClick={onSyncFromCloud}
            aria-label={syncLabel}
            style={monoStyle}
            className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 border border-[#1F1A16]/20 bg-[#FBF8F3] text-[11px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.14em] text-[#5C5248] hover:text-[#1F1A16] cursor-pointer"
            title="Sync folio state with Vercel KV cloud storage"
          >
            <span
              aria-hidden="true"
              className={
                syncStatus === "synced"
                  ? "text-[#13382E]"
                  : syncStatus === "syncing"
                  ? "text-[#9E7B3B]"
                  : "text-[#A8442A]"
              }
            >
              {syncStatus === "synced"
                ? "●"
                : syncStatus === "syncing"
                ? "◌"
                : "○"}
            </span>
            <span className="hidden sm:inline">
              {syncStatus === "synced"
                ? "CLOUD SYNCED"
                : syncStatus === "syncing"
                ? "SYNCING..."
                : "LOCAL CACHE"}
            </span>
          </button>
          <span
            style={monoStyle}
            className="hidden md:inline text-[#13382E] font-medium"
          >
            04 FEB &mdash; 14 FEB 2027
          </span>
        </div>
      </div>

      {showDualClock && dualClock && (
        <div
          data-testid="top-bar-dual-clock"
          style={monoStyle}
          className="max-w-6xl mx-auto mt-1.5 pt-1.5 border-t border-[#1F1A16]/10 flex items-center justify-between gap-2 text-[11px] sm:text-[10px] tracking-[0.06em] sm:tracking-[0.14em] text-[#13382E] font-medium"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="whitespace-nowrap">
              London (GMT) {dualClock.londonTime}
            </span>{" "}
            <span aria-hidden="true" className="text-[#8A7E71]">
              |
            </span>{" "}
            <span className="whitespace-nowrap">
              Bangkok/Phuket (ICT) {dualClock.bangkokTime}
            </span>
          </div>
          <span className="hidden sm:inline text-[#8A7E71] uppercase shrink-0">
            Live GMT / ICT
          </span>
        </div>
      )}
    </div>
  );
}
