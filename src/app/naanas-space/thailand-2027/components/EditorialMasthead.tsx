import React from "react";
import { TRIP_METADATA } from "@/lib/thailandTripData";
import { ActiveTab, CountdownState, ProgressMetric } from "../types";
import { serifStyle, monoStyle, chronometerDigitalStyle } from "../styles";

interface EditorialMastheadProps {
  countdown: CountdownState;
  overallReadinessPct: number;
  prepProgress: ProgressMetric;
  appsProgress: ProgressMetric;
  packingProgress: ProgressMetric;
  onSelectTab: (tab: ActiveTab) => void;
}

export function EditorialMasthead({
  countdown,
  overallReadinessPct,
  prepProgress,
  appsProgress,
  packingProgress,
  onSelectTab,
}: EditorialMastheadProps) {
  return (
    <header className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-[#1F1A16]/20 items-end">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-[#A8442A] text-[#FBF8F3] text-[10px] uppercase tracking-[0.22em] font-semibold">
              Celebrating Naana&apos;s Birthday
            </span>
          </div>

          <h1
            style={serifStyle}
            className="text-5xl sm:text-7xl font-normal tracking-tight text-[#1F1A16] leading-[0.98]"
          >
            Thailand 2027 Escape
          </h1>

          <div className="text-base sm:text-lg text-[#4A4036] max-w-2xl leading-relaxed font-normal pt-1 space-y-1">
            <p>
              <strong>{TRIP_METADATA.datesDisplay}</strong>
            </p>
            <p>
              Three nights on the royal riverfront at{" "}
              <span
                style={serifStyle}
                className="italic font-semibold text-xl text-[#A8442A]"
              >
                Shangri-La Bangkok
              </span>
            </p>
            <p>
              Five nights in a private hilltop sanctuary at{" "}
              <span
                style={serifStyle}
                className="italic font-semibold text-xl text-[#13382E]"
              >
                The Pavilions Phuket
              </span>
              .
            </p>
          </div>

          {/* Minimalist Route List */}
          <ul
            style={monoStyle}
            className="flex flex-col gap-1.5 pt-2 text-[11px] uppercase tracking-[0.14em] text-[#5C5248]"
          >
            <li className="text-[#1F1A16] font-semibold">
              LGW &rarr; SHJ &rarr; BKK
            </li>
            <li>CHAO PHRAYA RIVER (05&ndash;08 FEB)</li>
            <li className="text-[#1F1A16] font-semibold">BKK &rarr; HKT</li>
            <li>LAYAN HILLS, PHUKET (08&ndash;13 FEB)</li>
            <li className="text-[#1F1A16] font-semibold">
              HKT &rarr; SHJ &rarr; LGW
            </li>
          </ul>
        </div>

        {/* Right Column: Sculptural Countdown & Readiness Dossier Box */}
        <div className="lg:col-span-4 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 relative">
          {/* Double-line inner frame accent */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F1A16]/15">
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
            >
              CHRONOMETER
            </span>
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.16em] text-[#13382E] font-semibold"
            >
              ALL RESERVATIONS VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#1F1A16]/15 text-center my-2">
            <div className="px-2">
              <div
                style={chronometerDigitalStyle}
                className="text-4xl sm:text-5xl font-bold text-[#1F1A16] leading-none"
              >
                {countdown.days}
              </div>
              <div
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.18em] text-[#8A7E71] mt-1.5"
              >
                Days
              </div>
            </div>
            <div className="px-2">
              <div
                style={chronometerDigitalStyle}
                className="text-4xl sm:text-5xl font-bold text-[#1F1A16] leading-none"
              >
                {countdown.hours}
              </div>
              <div
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.18em] text-[#8A7E71] mt-1.5"
              >
                Hours
              </div>
            </div>
            <div className="px-2">
              <div
                style={chronometerDigitalStyle}
                className="text-4xl sm:text-5xl font-bold text-[#1F1A16] leading-none"
              >
                {countdown.minutes}
              </div>
              <div
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.18em] text-[#8A7E71] mt-1.5"
              >
                Mins
              </div>
            </div>
          </div>

          <p
            style={serifStyle}
            className="italic text-center text-sm text-[#5C5248] mt-3 pb-4 border-b border-[#1F1A16]/15"
          >
            {countdown.statusLabel}
          </p>

          {/* Readiness Ink Bar */}
          <div className="pt-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.18em] text-[#5C5248]"
              >
                DOSSIER READINESS
              </span>
              <span
                style={monoStyle}
                className="text-xs font-semibold text-[#13382E]"
              >
                {overallReadinessPct}% COMPLETE
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#E5DEC9] overflow-hidden">
              <div
                className="h-full bg-[#13382E] transition-all duration-500"
                style={{ width: `${overallReadinessPct}%` }}
              />
            </div>
            <div
              style={monoStyle}
              className="flex justify-between text-[11px] text-[#5C5248] pt-1.5"
            >
              <button
                type="button"
                onClick={() => {
                  onSelectTab("prep");
                  setTimeout(() => {
                    document
                      .getElementById("prep-protocol-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="px-2 py-1 border border-transparent hover:border-[#1F1A16]/25 hover:bg-[#EFE7D8] hover:text-[#13382E] transition-colors cursor-pointer underline decoration-[#1F1A16]/30 underline-offset-4"
                title="Jump to Pre-Departure Clearance Ledger (Step III)"
              >
                PREP {prepProgress.done}/{prepProgress.total}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab("prep");
                  setTimeout(() => {
                    document
                      .getElementById("essential-apps-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="px-2 py-1 border border-transparent hover:border-[#1F1A16]/25 hover:bg-[#EFE7D8] hover:text-[#13382E] transition-colors cursor-pointer underline decoration-[#1F1A16]/30 underline-offset-4"
                title="Jump to Essential Applications Directory (Step III)"
              >
                APPS {appsProgress.done}/{appsProgress.total}
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab("packing");
                  setTimeout(() => {
                    document
                      .getElementById("trunk-ledger-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="px-2 py-1 border border-transparent hover:border-[#1F1A16]/25 hover:bg-[#EFE7D8] hover:text-[#13382E] transition-colors cursor-pointer underline decoration-[#1F1A16]/30 underline-offset-4"
                title="Jump to The Trunk Ledger (Step IV)"
              >
                PACKING {packingProgress.done}/{packingProgress.total}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
