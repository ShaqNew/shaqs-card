import React from "react";
import { HOTEL_BOOKINGS } from "@/lib/thailandTripData";
import { serifStyle, monoStyle, ExternalArrow } from "../styles";

interface DriverCardModalProps {
  hotelId: string | null;
  onClose: () => void;
  onCopy: (text: string, label?: string) => void;
}

export function DriverCardModal({
  hotelId,
  onClose,
  onCopy,
}: DriverCardModalProps) {
  if (!hotelId) return null;

  const activeHotel = HOTEL_BOOKINGS.find((h) => h.id === hotelId);
  if (!activeHotel) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Show driver card for ${activeHotel.name}`}
      className="fixed inset-0 z-50 bg-[#1F1A16]/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F3] border-2 border-[#1F1A16] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#1F1A16]/20 pb-4">
          <div>
            <span
              style={monoStyle}
              className="text-[11px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
            >
              CHAUFFEUR &amp; TAXI DISPATCH CARD &bull; SHOW TO DRIVER
            </span>
            <h3
              style={serifStyle}
              className="text-2xl sm:text-3xl font-normal text-[#1F1A16] mt-1"
            >
              {activeHotel.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={monoStyle}
            className="px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer"
          >
            Close &#10005;
          </button>
        </div>

        {/* High-Contrast Large Thai Script Block for Driver */}
        <div className="bg-[#EFE7D8] border-2 border-[#13382E] p-5 sm:p-6 space-y-3">
          <div
            style={monoStyle}
            className="text-[11px] uppercase tracking-[0.16em] text-[#13382E] font-semibold"
          >
            กรุณาไปส่งที่โรงแรมนี้ (PLEASE TAKE US TO THIS HOTEL):
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1F1A16] leading-snug">
            {activeHotel.thaiName}
          </div>
          <div className="text-lg sm:text-xl font-medium text-[#1F1A16] leading-relaxed pt-1 border-t border-[#1F1A16]/15">
            {activeHotel.thaiAddress}
          </div>
          {activeHotel.thaiDirectionsNote && (
            <div className="text-sm sm:text-base text-[#A8442A] font-medium pt-1">
              หมายเหตุ: {activeHotel.thaiDirectionsNote}
            </div>
          )}
        </div>

        {/* English & Reception Telephone */}
        <div className="space-y-2 text-xs sm:text-sm text-[#4A4036]">
          <div>
            <strong>English Address:</strong> {activeHotel.address}
          </div>
          <div>
            <strong>Hotel Reception Phone (พนักงานต้อนรับ):</strong>{" "}
            <a
              href={`tel:${activeHotel.phone.replace(/\s+/g, "")}`}
              className="text-[#13382E] font-bold underline"
            >
              {activeHotel.phone}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-[#1F1A16]/15">
          <button
            type="button"
            onClick={() =>
              onCopy(
                `${activeHotel.thaiName} - ${activeHotel.thaiAddress}`,
                `${activeHotel.name} Thai Address`
              )
            }
            style={monoStyle}
            className="flex-1 py-3 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.16em] font-semibold cursor-pointer"
          >
            Copy Thai Script for Grab
          </button>
          <a
            href={activeHotel.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={monoStyle}
            className="px-5 py-3 border border-[#1F1A16] text-[#1F1A16] hover:bg-[#1F1A16] hover:text-[#F6F1E7] text-xs uppercase tracking-[0.16em] text-center"
          >
            Open Google Maps <ExternalArrow />
          </a>
        </div>
      </div>
    </div>
  );
}
