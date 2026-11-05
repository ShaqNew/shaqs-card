import React, { useState } from "react";
import { PREP_CHECKLIST, ESSENTIAL_APPS } from "@/lib/thailandTripData";
import { ProgressMetric } from "../../types";
import { serifStyle, monoStyle } from "../../styles";

interface StepPrepAndAppsProps {
  completedPrepIds: string[];
  installedAppIds: string[];
  appsProgress: ProgressMetric;
  onTogglePrepItem: (id: string) => void;
  onToggleAppInstalled: (id: string) => void;
}

export function StepPrepAndApps({
  completedPrepIds,
  installedAppIds,
  appsProgress,
  onTogglePrepItem,
  onToggleAppInstalled,
}: StepPrepAndAppsProps) {
  const [prepAssigneeFilter, setPrepAssigneeFilter] = useState<
    "all" | "both" | "shaq" | "naana"
  >("all");

  return (
    <section className="space-y-10">
      {/* Pre-Trip Protocol Checklist */}
      <div
        id="prep-protocol-section"
        className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.22em] text-[#A8442A] font-semibold"
            >
              STEP III &bull; ENTRY &amp; IMMIGRATION PROTOCOL
            </span>
            <h2
              style={serifStyle}
              className="text-3xl sm:text-4xl font-normal text-[#1F1A16] mt-1"
            >
              Pre-Departure Clearance Ledger
            </h2>
          </div>
          <div className="flex gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "both", label: "Joint" },
              { id: "shaq", label: "Shaq" },
              { id: "naana", label: "Naana" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  setPrepAssigneeFilter(
                    f.id as "all" | "both" | "shaq" | "naana"
                  )
                }
                style={monoStyle}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] border cursor-pointer ${
                  prepAssigneeFilter === f.id
                    ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                    : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#1F1A16]/15">
          {PREP_CHECKLIST.filter(
            (item) =>
              prepAssigneeFilter === "all" ||
              item.assignee === prepAssigneeFilter
          ).map((item) => {
            const isDone = completedPrepIds.includes(item.id);
            return (
              <label
                key={item.id}
                className={`py-4 first:pt-0 last:pb-0 flex items-start gap-4 cursor-pointer transition-opacity ${
                  isDone ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onTogglePrepItem(item.id)}
                  className="mt-1.5 w-4 h-4 accent-[#13382E]"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      style={serifStyle}
                      className={`text-xl font-medium ${
                        isDone
                          ? "line-through text-[#8A7E71]"
                          : "text-[#1F1A16]"
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.urgentTag && (
                      <span
                        style={monoStyle}
                        className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 bg-[#A8442A]/12 text-[#A8442A] border border-[#A8442A]/30"
                      >
                        {item.urgentTag}
                      </span>
                    )}
                    <span
                      style={monoStyle}
                      className="text-[10px] uppercase tracking-[0.14em] text-[#8A7E71]"
                    >
                      [{item.assignee}]
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5C5248]">
                    {item.detail}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Framed Editorial Callouts: ATM Golden Rule & SuperRich Exchange */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#EFE7D8] border-2 border-[#1F1A16] p-6 space-y-3">
          <span
            style={monoStyle}
            className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
          >
            MONETARY ADVISORY I &bull; THAI ATMS
          </span>
          <h3
            style={serifStyle}
            className="text-2xl sm:text-3xl font-normal text-[#1F1A16]"
          >
            Always Choose “Without Conversion”
          </h3>
          <p className="text-xs sm:text-sm text-[#4A4036] leading-relaxed">
            Thai ATMs levy a mandatory{" "}
            <strong>220 THB flat fee (~£4.94)</strong> per foreign card
            withdrawal. Always decline the machine&apos;s dynamic currency
            conversion and select{" "}
            <strong className="underline text-[#13382E]">
              &ldquo;Continue Without Conversion&rdquo;
            </strong>{" "}
            so your zero-FX UK bank (Monzo, Starling, Revolut, Chase) sets the
            interbank exchange rate.
          </p>
        </div>

        <div className="bg-[#FBF8F3] border border-[#1F1A16]/25 p-6 space-y-3">
          <span
            style={monoStyle}
            className="text-[10px] uppercase tracking-[0.2em] text-[#13382E] font-semibold"
          >
            MONETARY ADVISORY II &bull; CURRENCY DESK
          </span>
          <h3
            style={serifStyle}
            className="text-2xl sm:text-3xl font-normal text-[#1F1A16]"
          >
            SuperRich (Orange or Green Booths)
          </h3>
          <p className="text-xs sm:text-sm text-[#4A4036] leading-relaxed">
            Thailand remains cash-essential for street markets, longtail boats,
            tipping, and beach kiosks. Exchange crisp UK £20/£50 sterling notes
            at <strong>SuperRich</strong> in the{" "}
            <strong>
              basement (Floor B) of Suvarnabhumi Airport (adjacent to the
              Airport Rail Link)
            </strong>{" "}
            or major BTS stations.
          </p>
        </div>
      </div>

      {/* Digital Concierge & Essential Apps Directory */}
      <div
        id="essential-apps-section"
        className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.22em] text-[#8A7E71]"
            >
              DIGITAL UTILITIES DIRECTORY
            </span>
            <h2
              style={serifStyle}
              className="text-3xl font-normal text-[#1F1A16] mt-0.5"
            >
              Essential Applications to Configure Before Departure
            </h2>
          </div>
          <span
            style={monoStyle}
            className="text-xs font-semibold text-[#13382E]"
          >
            {appsProgress.done} OF {appsProgress.total} CONFIGURED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ESSENTIAL_APPS.map((app) => {
            const installed = installedAppIds.includes(app.id);
            return (
              <label
                key={app.id}
                className={`p-5 border cursor-pointer transition-colors flex items-start gap-4 ${
                  installed
                    ? "bg-[#13382E]/6 border-[#13382E]/35"
                    : "bg-[#F6F1E7]/70 border-[#1F1A16]/15 hover:border-[#1F1A16]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={installed}
                  onChange={() => onToggleAppInstalled(app.id)}
                  className="mt-1.5 w-4 h-4 accent-[#13382E]"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      {app.name}
                    </span>
                    <span
                      style={monoStyle}
                      className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 bg-[#EFE7D8] text-[#5C5248] border border-[#1F1A16]/15"
                    >
                      {app.badge}
                    </span>
                  </div>
                  <div
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.16em] text-[#A8442A]"
                  >
                    {app.category}
                  </div>
                  <p className="text-xs text-[#4A4036] leading-relaxed">
                    {app.description}
                  </p>
                  <p className="text-xs text-[#5C5248] italic pt-1 border-t border-[#1F1A16]/10">
                    Note: {app.proTip}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}
