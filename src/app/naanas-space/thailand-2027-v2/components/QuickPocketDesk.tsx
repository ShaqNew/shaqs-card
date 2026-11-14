import React, { useState } from "react";
import { HOTEL_BOOKINGS } from "@/lib/thailandTripData";
import { serifStyle, monoStyle } from "../styles";
import { useBottomSheetDialog } from "../hooks/useBottomSheetDialog";
import { DualTimezoneClock } from "../utils/companion";

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
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSetQuickThbPreset?: (thbAmount: number) => void;
  onJumpToBudget?: () => void;
  copiedText?: string | null;
  dualClock?: DualTimezoneClock;
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
  isOpen: controlledOpen,
  onOpenChange,
  onSetQuickThbPreset,
  onJumpToBudget,
  copiedText,
  dualClock,
}: QuickPocketDeskProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const { dialogRef, handleDialogClose } = useBottomSheetDialog({
    open,
    onClose: () => setOpen(false),
    desktopMode: "non-modal",
  });

  return (
    <>
      <div
        className={
          open
            ? "hidden"
            : "hidden sm:block fixed bottom-5 left-5 z-40 pb-[env(safe-area-inset-bottom)]"
        }
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={monoStyle}
          className="min-h-11 sm:min-h-0 px-4 py-3 bg-[#1F1A16] hover:bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B] shadow-xl text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em] font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          title="Open Quick Currency Converter, PNR Ciphers & Thai Taxi Cards"
        >
          <span className="text-[#D8B979]">&#3647;</span>
          <span>Quick Tools</span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="pocket-desk-title"
        onClose={handleDialogClose}
        className="[&:not([open])]:hidden fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none max-h-[85dvh] rounded-t-2xl border-t-2 border-[#1F1A16] bg-[#FBF8F3] text-[#1F1A16] p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain shadow-2xl z-50 sm:inset-auto sm:bottom-5 sm:left-5 sm:w-96 sm:max-w-[calc(100vw-2.5rem)] sm:rounded-none sm:border-2 sm:p-4 backdrop:bg-[#1F1A16]/60 sm:backdrop:bg-transparent backdrop:overflow-hidden backdrop:overscroll-contain"
      >
        {open && (
          <div className="space-y-4">
        <div
          aria-hidden="true"
          className="sm:hidden w-10 h-1.5 rounded-full bg-[#1F1A16]/20 mx-auto"
        />

        <div className="flex items-center justify-between border-b border-[#1F1A16]/15 pb-2.5">
          <span
            id="pocket-desk-title"
            style={monoStyle}
            className="text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#13382E] font-bold"
          >
            QUICK POCKET DESK (THB &bull; PNR &bull; TAXI)
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={monoStyle}
            className="min-h-11 sm:min-h-0 px-2.5 sm:px-2 py-1 sm:py-0.5 bg-[#EFE7D8] border border-[#1F1A16]/20 text-[11px] text-[#1F1A16] inline-flex items-center cursor-pointer"
          >
            CLOSE &#10005;
          </button>
        </div>

        {dualClock && (
          <div
            data-testid="pocket-dual-clock"
            style={monoStyle}
            className="bg-[#13382E]/8 border border-[#13382E]/25 px-2.5 py-1.5 text-[11px] sm:text-[10px] tracking-[0.05em] sm:tracking-[0.12em] text-[#13382E] font-semibold text-center"
          >
            {dualClock.fullLabel}
          </div>
        )}

        {/* Instant Mini Currency Converter */}
        <div className="space-y-2">
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

          {/* Quick THB Preset Chips */}
          <div className="grid grid-cols-4 gap-1.5">
            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  if (
                    typeof navigator !== "undefined" &&
                    typeof navigator.vibrate === "function"
                  ) {
                    navigator.vibrate(6);
                  }
                  if (onSetQuickThbPreset) {
                    onSetQuickThbPreset(amt);
                  } else {
                    onThbChange(String(amt));
                  }
                }}
                style={monoStyle}
                className={`min-h-11 sm:min-h-0 py-1.5 px-1 border text-[11px] font-semibold cursor-pointer transition-colors ${
                  thbInput === String(amt)
                    ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                    : "bg-[#EFE7D8] text-[#1F1A16] border-[#1F1A16]/20 hover:border-[#13382E]"
                }`}
              >
                {amt} &#3647;
              </button>
            ))}
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
          <div className="grid grid-cols-2 gap-2">
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
                className="min-h-11 sm:min-h-0 px-3 py-2 bg-[#F6F1E7] border border-[#1F1A16]/20 hover:border-[#13382E] text-left flex flex-col items-start justify-center gap-0.5 cursor-pointer"
              >
                <span className="text-[11px] text-[#5C5248] leading-tight">
                  {item.label}
                </span>
                <span className="font-bold text-xs text-[#13382E] break-all leading-tight">
                  {item.code}
                </span>
              </button>
            ))}
          </div>
          {copiedText && (
            <div
              role="status"
              aria-live="polite"
              data-testid="pocket-desk-copy-status"
              className="sm:hidden flex items-center justify-between gap-2 px-3 py-2 bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B]"
            >
              <span
                style={monoStyle}
                className="text-[11px] uppercase tracking-[0.1em] text-[#D8B979] shrink-0"
              >
                COPIED TO FOLIO
              </span>
              <span className="text-xs font-medium truncate">{copiedText}</span>
            </div>
          )}
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
                onClick={() => {
                  setOpen(false);
                  onOpenDriverModal(h.id);
                }}
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

        {/* 1-Tap SOS & Hotel Reception Speed-Dials */}
        <div className="space-y-1.5 pt-2 border-t border-[#1F1A16]/15">
          <span
            style={monoStyle}
            className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#A8442A] font-semibold block"
          >
            SOS &amp; HOTEL RECEPTION SPEED-DIAL
          </span>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:1155"
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-2.5 py-2 bg-[#A8442A] text-[#FBF8F3] text-[11px] font-semibold flex items-center justify-center text-center"
            >
              1155 Police
            </a>
            <a
              href="tel:1669"
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-2.5 py-2 bg-[#1F1A16] text-[#F6F1E7] text-[11px] font-semibold flex items-center justify-center text-center"
            >
              1669 Medical
            </a>
            <a
              href="tel:+6622367777"
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-2.5 py-2 bg-[#F6F1E7] border border-[#1F1A16]/20 text-[#1F1A16] text-[11px] font-semibold flex items-center justify-center text-center"
            >
              Shangri-La Tel
            </a>
            <a
              href="tel:+6676317600"
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-2.5 py-2 bg-[#F6F1E7] border border-[#1F1A16]/20 text-[#1F1A16] text-[11px] font-semibold flex items-center justify-center text-center"
            >
              Pavilions Tel
            </a>
            <a
              href="tel:+6623058333"
              style={monoStyle}
              className="col-span-2 min-h-11 sm:min-h-0 px-2.5 py-2 bg-[#EFE7D8] border border-[#1F1A16]/25 text-[#1F1A16] text-[11px] font-semibold flex items-center justify-center text-center"
            >
              British Embassy Bangkok (+66 2 305 8333)
            </a>
          </div>
        </div>

        {/* Bottom Shortcuts: Log Expense & View Change Log */}
        <div className="pt-2 border-t border-[#1F1A16]/15 grid grid-cols-2 gap-2">
          {onJumpToBudget && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onJumpToBudget();
              }}
              style={monoStyle}
              className="w-full min-h-11 sm:min-h-0 py-2 px-2.5 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-wider text-center cursor-pointer transition-colors"
            >
              Log Expense &rarr;
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenChangeLog();
            }}
            style={monoStyle}
            className={`${
              onJumpToBudget ? "w-full" : "col-span-2 w-full"
            } min-h-11 sm:min-h-0 py-2 px-2.5 bg-[#EFE7D8] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] border border-[#1F1A16]/25 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-wider text-center cursor-pointer transition-colors`}
          >
            View Folio Change Log ({changeLogCount})
          </button>
        </div>
          </div>
        )}
      </dialog>
    </>
  );
}
