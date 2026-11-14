import React from "react";
import Link from "next/link";
import { monoStyle } from "../styles";

interface TopEditorialBarProps {
  activeActor: "Shaq" | "Naana";
  onSetActiveActor: (actor: "Shaq" | "Naana") => void;
  changeLogCount: number;
  onOpenChangeLog: () => void;
  syncStatus: "local" | "syncing" | "synced";
  onSyncFromCloud: () => void;
}

export function TopEditorialBar({
  activeActor,
  onSetActiveActor,
  changeLogCount,
  onOpenChangeLog,
  syncStatus,
  onSyncFromCloud,
}: TopEditorialBarProps) {
  return (
    <div className="border-b border-[#1F1A16]/15 bg-[#EFE7D8]/70 px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#5C5248]">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/naanas-space"
            className="min-h-11 sm:min-h-0 text-[#1F1A16] hover:text-[#A8442A] font-semibold flex items-center gap-2 transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Naana&apos;s Space</span>
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
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Editor Toggle (Shaq / Naana) */}
          <div
            style={monoStyle}
            className="flex items-center border border-[#1F1A16]/20 bg-[#FBF8F3] text-[11px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.14em]"
            title="Select who is making changes on this device"
          >
            <span className="px-2 py-0.5 text-[#8A7E71] border-r border-[#1F1A16]/15">
              EDITOR:
            </span>
            {(["Shaq", "Naana"] as const).map((person) => (
              <button
                key={person}
                type="button"
                onClick={() => onSetActiveActor(person)}
                className={`min-h-11 sm:min-h-0 px-2.5 sm:px-2 py-1 sm:py-0.5 uppercase inline-flex items-center transition-colors cursor-pointer ${
                  activeActor === person
                    ? person === "Shaq"
                      ? "bg-[#13382E] text-[#F6F1E7] font-semibold"
                      : "bg-[#A8442A] text-[#FBF8F3] font-semibold"
                    : "text-[#5C5248] hover:text-[#1F1A16]"
                }`}
              >
                {person}
              </button>
            ))}
          </div>

          {/* Change Log Drawer Button */}
          <button
            type="button"
            onClick={onOpenChangeLog}
            style={monoStyle}
            className="min-h-11 sm:min-h-0 inline-flex items-center px-2.5 py-0.5 border border-[#1F1A16]/25 bg-[#FBF8F3] hover:bg-[#1F1A16] text-[11px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.14em] text-[#1F1A16] hover:text-[#F6F1E7] font-semibold transition-colors cursor-pointer"
            title="View history of itinerary, prep, packing, and budget changes"
          >
            CHANGE LOG ({changeLogCount})
          </button>

          <button
            type="button"
            onClick={onSyncFromCloud}
            style={monoStyle}
            className="min-h-11 sm:min-h-0 inline-flex items-center px-2.5 py-0.5 border border-[#1F1A16]/20 bg-[#FBF8F3] text-[11px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.14em] text-[#5C5248] hover:text-[#1F1A16] cursor-pointer"
            title="Sync folio state with Vercel KV cloud storage"
          >
            {syncStatus === "synced"
              ? "● CLOUD SYNCED"
              : syncStatus === "syncing"
              ? "◌ SYNCING..."
              : "○ LOCAL CACHE"}
          </button>
          <span style={monoStyle} className="text-[#13382E] font-medium">
            04 FEB &mdash; 14 FEB 2027
          </span>
        </div>
      </div>
    </div>
  );
}
