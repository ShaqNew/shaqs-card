import React, { useState } from "react";
import { HOTEL_BOOKINGS } from "@/lib/thailandTripData";
import { serifStyle, monoStyle } from "../styles";

interface QuickPocketDeskProps {
  exchangeRate: number;
  thbInput: string;
  gbpInput: string;
  onThbChange: (val: string) => void;
  onGbpChange: (val: string) => void;
  onCopy: (text: string, label?: string) => void;
  onOpenDriverModal: (hotelId: string) => void;
  changeLogCount: number;
  onOpenChangeLog: () => void;
}

export function QuickPocketDesk({
  exchangeRate,
  thbInput,
  gbpInput,
  onThbChange,
  onGbpChange,
  onCopy,
  onOpenDriverModal,
  changeLogCount,
  onOpenChangeLog,
}: QuickPocketDeskProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-40 pb-[env(safe-area-inset-bottom)]">
      {isOpen ? (
        <div className="bg-[#FBF8F3] border-2 border-[#1F1A16] shadow-2xl w-80 sm:w-96 max-w-[calc(100vw-2.5rem)] max-h-[85dvh] overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1A16]/15 pb-2.5">
            <span
              style={monoStyle}
              className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#13382E] font-bold"
            >
              QUICK POCKET DESK (THB &bull; PNR &bull; TAXI)
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-2.5 sm:px-2 py-1 sm:py-0.5 bg-[#EFE7D8] border border-[#1F1A16]/20 text-[11px] text-[#1F1A16] inline-flex items-center cursor-pointer"
            >
              CLOSE &#10005;
            </button>
          </div>

          {/* Instant Mini Currency Converter */}
          <div className="space-y-1.5">
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#8A7E71] block"
            >
              INSTANT CURRENCY (1 GBP &#8776; {exchangeRate} THB)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#EFE7D8]/70 border border-[#1F1A16]/20 px-2.5 py-1.5">
                <label
                  htmlFor="pocket-thb-input"
                  style={monoStyle}
                  className="text-[11px] sm:text-[10px] uppercase text-[#5C5248] block"
                >
                  THB (&#3647;)
                </label>
                <input
                  id="pocket-thb-input"
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="done"
                  autoComplete="off"
                  aria-label="Quick THB input"
                  value={thbInput}
                  onChange={(e) => onThbChange(e.target.value)}
                  style={serifStyle}
                  className="w-full min-h-11 sm:min-h-0 bg-transparent text-lg font-semibold text-[#1F1A16] focus:outline-none"
                />
              </div>
              <div className="bg-[#EFE7D8]/70 border border-[#1F1A16]/20 px-2.5 py-1.5">
                <label
                  htmlFor="pocket-gbp-input"
                  style={monoStyle}
                  className="text-[11px] sm:text-[10px] uppercase text-[#5C5248] block"
                >
                  GBP (&pound;)
                </label>
                <input
                  id="pocket-gbp-input"
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="done"
                  autoComplete="off"
                  aria-label="Quick GBP input"
                  value={gbpInput}
                  onChange={(e) => onGbpChange(e.target.value)}
                  style={serifStyle}
                  className="w-full min-h-11 sm:min-h-0 bg-transparent text-lg font-semibold text-[#13382E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* One-Tap Booking Reference Ciphers */}
          <div className="space-y-1.5 pt-2 border-t border-[#1F1A16]/15">
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#8A7E71] block"
            >
              TAP TO COPY BOOKING CIPHER
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "LGW→BKK", code: "6I8SOP" },
                { label: "BKK→HKT", code: "2GXDQP" },
                { label: "HKT→LGW", code: "6LDREI" },
                { label: "Shangri-La", code: "12891938794" },
                { label: "Pavilions", code: "78165SH099776" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() =>
                    onCopy(item.code, `${item.label} (${item.code})`)
                  }
                  style={monoStyle}
                  className="min-h-11 sm:min-h-0 px-2.5 py-1.5 bg-[#F6F1E7] border border-[#1F1A16]/20 hover:border-[#13382E] text-left text-[11px] flex flex-wrap items-center justify-between gap-1 cursor-pointer"
                >
                  <span className="text-[#5C5248]">{item.label}</span>
                  <span className="font-bold text-[#13382E] break-all">
                    {item.code}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Show Driver Thai Script Triggers */}
          <div className="space-y-1.5 pt-2 border-t border-[#1F1A16]/15">
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#8A7E71] block"
            >
              SHOW TAXI DRIVER (THAI SCRIPT)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {HOTEL_BOOKINGS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onOpenDriverModal(h.id)}
                  style={monoStyle}
                  className="min-h-11 sm:min-h-0 py-2 px-2.5 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-wider text-center inline-flex items-center justify-center cursor-pointer"
                >
                  {h.name.includes("Shangri-La")
                    ? "Shangri-La (Thai)"
                    : "Pavilions (Thai)"}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#1F1A16]/15">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenChangeLog();
              }}
              style={monoStyle}
              className="w-full min-h-11 sm:min-h-0 py-2 px-2.5 bg-[#EFE7D8] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] border border-[#1F1A16]/25 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-wider text-center cursor-pointer transition-colors"
            >
              View Folio Change Log ({changeLogCount})
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={monoStyle}
          className="min-h-11 sm:min-h-0 px-4 py-3 bg-[#1F1A16] hover:bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B] shadow-xl text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em] font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          title="Open Quick Currency Converter, PNR Ciphers & Thai Taxi Cards"
        >
          <span className="text-[#D8B979]">&#3647;</span>
          <span>Quick Tools</span>
        </button>
      )}
    </div>
  );
}
