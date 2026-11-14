import React, { useEffect, useRef, useState } from "react";
import { HOTEL_BOOKINGS } from "@/lib/thailandTripData";
import { serifStyle, monoStyle, ExternalArrow } from "../styles";
import { useBottomSheetDialog } from "../hooks/useBottomSheetDialog";

interface DriverCardModalProps {
  hotelId: string | null;
  onClose: () => void;
  onCopy: (text: string, label?: string) => void;
  copiedText?: string | null;
}

interface WakeLockSentinelLike {
  released?: boolean;
  release: () => Promise<void>;
  addEventListener?: (type: "release", listener: () => void) => void;
  removeEventListener?: (type: "release", listener: () => void) => void;
}

export function DriverCardModal({
  hotelId,
  onClose,
  onCopy,
  copiedText,
}: DriverCardModalProps) {
  const wakeLockSentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const [isNightContrast, setIsNightContrast] = useState(false);

  const activeHotel = hotelId
    ? HOTEL_BOOKINGS.find((h) => h.id === hotelId) || null
    : null;
  const isOpen = Boolean(hotelId && activeHotel);

  const { dialogRef, handleDialogClose } = useBottomSheetDialog({
    open: isOpen,
    onClose,
    desktopMode: "modal",
  });

  // Keep screen awake when showing card to driver; re-acquire when returning
  // to the visible tab (browsers release Wake Lock on background / app switch)
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    let cleanupSentinelListener: (() => void) | null = null;

    const nav = typeof navigator !== "undefined" ? navigator : undefined;

    const releaseCurrentLock = () => {
      cleanupSentinelListener?.();
      cleanupSentinelListener = null;
      const sentinel = wakeLockSentinelRef.current;
      wakeLockSentinelRef.current = null;
      if (sentinel && typeof sentinel.release === "function") {
        sentinel.release().catch(() => {});
      }
    };

    const acquireWakeLock = async () => {
      if (
        cancelled ||
        (typeof document !== "undefined" &&
          document.visibilityState === "hidden")
      ) {
        return;
      }
      if (wakeLockSentinelRef.current && !wakeLockSentinelRef.current.released) {
        return;
      }

      try {
        if (nav?.wakeLock && typeof nav.wakeLock.request === "function") {
          const sentinel = (await nav.wakeLock.request(
            "screen"
          )) as WakeLockSentinelLike;
          if (cancelled) {
            sentinel?.release?.().catch(() => {});
            return;
          }
          wakeLockSentinelRef.current = sentinel;
          const onReleased = () => {
            if (wakeLockSentinelRef.current === sentinel) {
              wakeLockSentinelRef.current = null;
            }
          };
          if (typeof sentinel.addEventListener === "function") {
            sentinel.addEventListener("release", onReleased);
            cleanupSentinelListener = () =>
              sentinel.removeEventListener?.("release", onReleased);
          }
        }
      } catch {
        // Low Power Mode / Battery Saver blocks Wake Lock silently
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void acquireWakeLock();
      } else {
        releaseCurrentLock();
      }
    };

    void acquireWakeLock();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      cancelled = true;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      releaseCurrentLock();
    };
  }, [isOpen]);

  const handleShareAddress = async () => {
    if (!activeHotel) return;
    const shareText = `${activeHotel.name}\n${activeHotel.thaiName}\n${activeHotel.thaiAddress}\n${activeHotel.address}\nTel: ${activeHotel.phone}`;
    const nav = typeof navigator !== "undefined" ? navigator : undefined;

    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({
          title: `${activeHotel.name} — Thai Driver Card`,
          text: shareText,
          url: activeHotel.mapUrl,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
      }
    }

    onCopy(
      `${activeHotel.thaiName} - ${activeHotel.thaiAddress}`,
      `${activeHotel.name} Thai Address`
    );
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-labelledby="driver-card-hotel-title"
      onClose={handleDialogClose}
      className={`[&:not([open])]:hidden fixed inset-0 m-0 w-full h-dvh max-w-none max-h-none p-0 lg:m-auto lg:w-full lg:max-w-3xl lg:h-auto lg:max-h-[92dvh] overflow-y-auto overscroll-contain border-0 lg:border-2 shadow-2xl z-50 backdrop:bg-[#1F1A16]/85 backdrop:backdrop-blur-sm ${
        isNightContrast
          ? "bg-black text-[#FFE600] border-[#FFE600]"
          : "bg-[#FBF8F3] text-[#1F1A16] border-[#1F1A16]"
      }`}
    >
      {isOpen && activeHotel && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="min-h-full flex flex-col justify-between p-4 lg:p-8 pb-[calc(1.25rem+env(safe-area-inset-bottom))] gap-5"
        >
          {/* Header + 1-Tap High-Contrast Night Mode Toggle */}
          <div
            className={`flex flex-wrap items-start justify-between gap-3 border-b pb-3.5 ${
              isNightContrast ? "border-[#FFE600]/35" : "border-[#1F1A16]/20"
            }`}
          >
            <div>
              <span
                style={monoStyle}
                className={`text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-semibold block ${
                  isNightContrast ? "text-[#FFE600]" : "text-[#A8442A]"
                }`}
              >
                CHAUFFEUR &amp; TAXI DISPATCH CARD &bull; SHOW TO DRIVER
              </span>
              <h3
                id="driver-card-hotel-title"
                style={serifStyle}
                className={`text-2xl sm:text-3xl font-normal mt-0.5 ${
                  isNightContrast ? "text-white" : "text-[#1F1A16]"
                }`}
              >
                {activeHotel.name}
              </h3>
            </div>

            <button
              type="button"
              data-testid="driver-night-mode-toggle"
              aria-pressed={isNightContrast}
              onClick={() => setIsNightContrast((prev) => !prev)}
              style={monoStyle}
              className={`min-h-11 px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] font-bold border cursor-pointer transition-colors ${
                isNightContrast
                  ? "bg-[#FFE600] text-black border-[#FFE600] hover:bg-white"
                  : "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16] hover:bg-[#13382E]"
              }`}
            >
              {isNightContrast
                ? "☀ Standard Cream Card"
                : "☾ High-Contrast Night Mode"}
            </button>
          </div>

          {copiedText && (
            <div
              role="status"
              aria-live="polite"
              data-testid="driver-card-copy-status"
              className={`flex items-center justify-between gap-2 px-3 py-2 border text-xs ${
                isNightContrast
                  ? "bg-[#FFE600]/15 border-[#FFE600] text-white"
                  : "bg-[#13382E] border-[#9E7B3B] text-[#F6F1E7]"
              }`}
            >
              <span
                style={monoStyle}
                className="text-[11px] uppercase tracking-[0.12em] font-semibold"
              >
                COPIED TO FOLIO
              </span>
              <span className="font-medium truncate">{copiedText}</span>
            </div>
          )}

          {/* Main Card Body — Responsive Landscape Split (portrait stacked, landscape side-by-side) */}
          <div className="flex-1 flex flex-col landscape:flex-row landscape:items-stretch gap-5">
            {/* Large Thai Script Display */}
            <div
              data-testid="driver-thai-script-panel"
              className={`landscape:flex-[3] border-2 p-5 sm:p-6 space-y-3 flex flex-col justify-center ${
                isNightContrast
                  ? "bg-black border-[#FFE600]"
                  : "bg-[#EFE7D8] border-[#13382E]"
              }`}
            >
              <div
                style={monoStyle}
                className={`text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em] font-semibold ${
                  isNightContrast ? "text-[#FFE600]" : "text-[#13382E]"
                }`}
              >
                กรุณาไปส่งที่โรงแรมนี้ (PLEASE TAKE US TO THIS HOTEL):
              </div>
              <div
                data-testid="driver-thai-name"
                className={`text-4xl sm:text-5xl font-bold leading-snug tracking-wide ${
                  isNightContrast ? "text-white" : "text-[#1F1A16]"
                }`}
              >
                {activeHotel.thaiName}
              </div>
              <div
                data-testid="driver-thai-address"
                className={`text-2xl sm:text-3xl font-medium leading-relaxed pt-2 border-t ${
                  isNightContrast
                    ? "text-[#FFE600] border-[#FFE600]/35"
                    : "text-[#1F1A16] border-[#1F1A16]/15"
                }`}
              >
                {activeHotel.thaiAddress}
              </div>
              {activeHotel.thaiDirectionsNote && (
                <div
                  className={`text-base sm:text-lg font-medium pt-1 ${
                    isNightContrast ? "text-white" : "text-[#A8442A]"
                  }`}
                >
                  หมายเหตุ: {activeHotel.thaiDirectionsNote}
                </div>
              )}
            </div>

            {/* English Reference + Quick On-the-Ground Actions */}
            <div className="landscape:flex-[2] flex flex-col justify-between gap-4">
              <div
                className={`space-y-2 text-xs sm:text-sm p-4 border ${
                  isNightContrast
                    ? "bg-black border-[#FFE600]/45 text-white"
                    : "bg-[#EFE7D8]/50 border-[#1F1A16]/15 text-[#4A4036]"
                }`}
              >
                <div>
                  <strong
                    className={
                      isNightContrast ? "text-[#FFE600]" : "text-[#1F1A16]"
                    }
                  >
                    English Address:
                  </strong>{" "}
                  {activeHotel.address}
                </div>
                <div>
                  <strong
                    className={
                      isNightContrast ? "text-[#FFE600]" : "text-[#1F1A16]"
                    }
                  >
                    Reception Desk (พนักงานต้อนรับ):
                  </strong>{" "}
                  <span>{activeHotel.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`tel:${activeHotel.phone.replace(/\s+/g, "")}`}
                  style={monoStyle}
                  className={`min-h-12 px-4 py-3 text-xs uppercase tracking-[0.1em] font-bold inline-flex items-center justify-center text-center transition-colors ${
                    isNightContrast
                      ? "bg-[#FFE600] text-black hover:bg-white"
                      : "bg-[#A8442A] hover:bg-[#8F351E] text-[#FBF8F3]"
                  }`}
                >
                  Call Hotel ({activeHotel.phone})
                </a>

                <button
                  type="button"
                  onClick={handleShareAddress}
                  style={monoStyle}
                  className={`min-h-12 px-4 py-3 text-xs uppercase tracking-[0.1em] font-bold border inline-flex items-center justify-center text-center cursor-pointer transition-colors ${
                    isNightContrast
                      ? "bg-black text-[#FFE600] border-[#FFE600] hover:bg-[#FFE600] hover:text-black"
                      : "bg-[#FBF8F3] text-[#1F1A16] border-[#1F1A16] hover:bg-[#1F1A16] hover:text-[#F6F1E7]"
                  }`}
                >
                  Share Address (LINE / WhatsApp)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      `${activeHotel.thaiName} - ${activeHotel.thaiAddress}`,
                      `${activeHotel.name} Thai Address`
                    )
                  }
                  style={monoStyle}
                  className={`min-h-12 px-4 py-3 text-xs uppercase tracking-[0.1em] font-semibold inline-flex items-center justify-center text-center cursor-pointer transition-colors ${
                    isNightContrast
                      ? "bg-white text-black hover:bg-[#FFE600]"
                      : "bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7]"
                  }`}
                >
                  Copy Thai Script for Grab
                </button>

                <a
                  href={activeHotel.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={monoStyle}
                  className={`min-h-12 px-4 py-3 border text-xs uppercase tracking-[0.1em] inline-flex items-center justify-center text-center transition-colors ${
                    isNightContrast
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-[#1F1A16] text-[#1F1A16] hover:bg-[#1F1A16] hover:text-[#F6F1E7]"
                  }`}
                >
                  Open Google Maps <ExternalArrow />
                </a>
              </div>
            </div>
          </div>

          {/* Thumb-Friendly Bottom Done Action */}
          <div
            className={`pt-3 border-t ${
              isNightContrast ? "border-[#FFE600]/35" : "border-[#1F1A16]/15"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              className={`w-full min-h-12 px-5 py-3 text-xs uppercase tracking-[0.14em] font-bold cursor-pointer transition-colors ${
                isNightContrast
                  ? "bg-[#FFE600] text-black hover:bg-white"
                  : "bg-[#1F1A16] text-[#F6F1E7] hover:bg-[#13382E]"
              }`}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
