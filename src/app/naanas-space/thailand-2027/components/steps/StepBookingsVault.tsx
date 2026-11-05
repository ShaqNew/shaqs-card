import React from "react";
import { FLIGHT_BOOKINGS, HOTEL_BOOKINGS } from "@/lib/thailandTripData";
import { serifStyle, monoStyle, ExternalArrow } from "../../styles";

interface StepBookingsVaultProps {
  pavilionsBalancePaid: boolean;
  onTogglePavilionsBalancePaid: () => void;
  onCopy: (text: string, label?: string) => void;
  onOpenDriverModal: (hotelId: string) => void;
}

export function StepBookingsVault({
  pavilionsBalancePaid,
  onTogglePavilionsBalancePaid,
  onCopy,
  onOpenDriverModal,
}: StepBookingsVaultProps) {
  return (
    <section className="space-y-12">
      {/* Master Reference Ledger Strip */}
      <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 mb-5 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.22em] text-[#A8442A] font-semibold"
            >
              STEP II &bull; CONFIRMED DOSSIER CREDENTIALS
            </span>
            <h2
              style={serifStyle}
              className="text-3xl font-normal text-[#1F1A16] mt-0.5"
            >
              Instant Booking Reference Index
            </h2>
          </div>
          <span style={serifStyle} className="italic text-sm text-[#5C5248]">
            Tap any reservation cipher to copy directly to your clipboard
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#1F1A16]/15 border border-[#1F1A16]/15 bg-[#F6F1E7]/60">
          {[
            {
              label: "Outbound Aviation",
              code: "6I8SOP",
              sub: "Air Arabia • LGW → BKK",
            },
            {
              label: "Bangkok Residence",
              code: "12891938794",
              sub: "Shangri-La • 3 Nights",
            },
            {
              label: "Domestic Aviation",
              code: "2GXDQP",
              sub: "Vietjet VZ306 • BKK → HKT",
            },
            {
              label: "Phuket Sanctuary",
              code: "78165SH099776",
              sub: "The Pavilions • 5 Nights",
            },
            {
              label: "Return Aviation",
              code: "6LDREI",
              sub: "Air Arabia • HKT → LGW",
            },
          ].map((ref) => (
            <button
              key={ref.code}
              type="button"
              onClick={() => onCopy(ref.code, `${ref.label} (${ref.code})`)}
              className="p-4 text-left hover:bg-[#EFE7D8] transition-colors group cursor-pointer flex flex-col justify-between"
            >
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71]"
              >
                {ref.label}
              </span>
              <div className="flex items-baseline justify-between w-full my-1.5">
                <span
                  style={monoStyle}
                  className="text-lg font-bold text-[#13382E] group-hover:text-[#A8442A]"
                >
                  {ref.code}
                </span>
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-wider text-[#8A7E71] group-hover:text-[#1F1A16]"
                >
                  [COPY]
                </span>
              </div>
              <span className="text-xs text-[#5C5248]">{ref.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tactile Perforated Paper Boarding Passes */}
      <div className="space-y-6">
        <div className="border-b border-[#1F1A16]/20 pb-2">
          <span
            style={monoStyle}
            className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
          >
            SECTION 01 &bull; AVIATION MANIFEST
          </span>
          <h3 style={serifStyle} className="text-3xl font-normal text-[#1F1A16]">
            Confirmed Flight Coupons
          </h3>
        </div>

        {FLIGHT_BOOKINGS.map((flight) => (
          <div
            key={flight.id}
            className="relative bg-[#FBF8F3] border border-[#1F1A16]/25 shadow-[0_4px_20px_rgba(31,26,22,0.05)] overflow-hidden"
          >
            {/* Ticket Punch-Out Semicircles on Left & Right Edges */}
            <div className="hidden lg:block absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F6F1E7] border border-[#1F1A16]/25" />
            <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F6F1E7] border border-[#1F1A16]/25" />

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Main Ticket Body (9 cols) */}
              <div className="lg:col-span-9 p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
                  <div>
                    <span
                      style={monoStyle}
                      className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
                    >
                      {flight.direction}
                    </span>
                    <h4
                      style={serifStyle}
                      className="text-2xl sm:text-3xl font-normal text-[#1F1A16]"
                    >
                      {flight.airline} &mdash;{" "}
                      <span className="italic text-[#5C5248]">
                        {flight.fareClass}
                      </span>
                    </h4>
                  </div>
                  <div className="text-right">
                    <span
                      style={monoStyle}
                      className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71] block"
                    >
                      VERIFIED SETTLEMENT
                    </span>
                    <span
                      style={monoStyle}
                      className="text-sm font-semibold text-[#13382E]"
                    >
                      {flight.totalPaidDisplay} &bull; {flight.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Flight Segments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {flight.segments.map((seg) => (
                    <div
                      key={seg.flightNumber}
                      className="bg-[#EFE7D8]/55 border border-[#1F1A16]/15 p-5 space-y-4"
                    >
                      <div
                        style={monoStyle}
                        className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#5C5248] border-b border-[#1F1A16]/10 pb-2"
                      >
                        <span className="font-bold text-[#1F1A16]">
                          FLIGHT {seg.flightNumber}
                        </span>
                        <span>DURATION {seg.duration}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div
                            style={serifStyle}
                            className="text-4xl font-normal text-[#1F1A16]"
                          >
                            {seg.fromCode}
                          </div>
                          <div className="text-xs text-[#5C5248] mt-0.5">
                            {seg.fromCity}
                          </div>
                          <div
                            style={monoStyle}
                            className="text-xs font-semibold text-[#A8442A] mt-2"
                          >
                            {seg.depTime}
                          </div>
                          <div
                            style={monoStyle}
                            className="text-[10px] text-[#8A7E71]"
                          >
                            {seg.depDate}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-2">
                          <div className="w-full border-t border-dashed border-[#1F1A16]/35 relative">
                            <span
                              style={serifStyle}
                              className="italic text-xs text-[#8A7E71] bg-[#EFE7D8] px-2 absolute -top-2.5 left-1/2 -translate-x-1/2"
                            >
                              non-stop
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            style={serifStyle}
                            className="text-4xl font-normal text-[#1F1A16]"
                          >
                            {seg.toCode}
                          </div>
                          <div className="text-xs text-[#5C5248] mt-0.5">
                            {seg.toCity}
                          </div>
                          <div
                            style={monoStyle}
                            className="text-xs font-semibold text-[#13382E] mt-2"
                          >
                            {seg.arrTime}
                          </div>
                          <div
                            style={monoStyle}
                            className="text-[10px] text-[#8A7E71]"
                          >
                            {seg.arrDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {flight.layover && (
                  <div
                    style={monoStyle}
                    className="px-4 py-2.5 bg-[#F6F1E7] border-l-2 border-[#A8442A] text-xs text-[#4A4036]"
                  >
                    TRANSIT CONNECTION: {flight.layover}
                  </div>
                )}

                {/* Passenger Seat & Baggage Assignments (Domestic Vietjet) */}
                {flight.passengerDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {flight.passengerDetails.map((pax) => (
                      <div
                        key={pax.name}
                        className="p-4 bg-[#F6F1E7] border border-[#1F1A16]/15 flex items-center justify-between"
                      >
                        <div>
                          <div
                            style={serifStyle}
                            className="text-lg font-semibold text-[#1F1A16]"
                          >
                            {pax.name}
                          </div>
                          <div
                            style={monoStyle}
                            className="text-[11px] text-[#5C5248] mt-0.5"
                          >
                            {pax.checkedBag} &bull; {pax.cabinBag}
                          </div>
                        </div>
                        <span
                          style={monoStyle}
                          className="px-3 py-1 bg-[#13382E] text-[#F6F1E7] text-xs font-semibold"
                        >
                          Seat {pax.seat}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Included Perks */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {flight.farePerks.map((perk) => (
                    <span
                      key={perk}
                      style={monoStyle}
                      className="text-[11px] px-3 py-1 bg-[#EFE7D8] text-[#4A4036] border border-[#1F1A16]/15"
                    >
                      &#10003; {perk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Perforated Tear-Off Stub (3 cols) */}
              <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l-2 border-dashed border-[#1F1A16]/25 bg-[#EFE7D8]/70 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71] block"
                  >
                    PASSENGER COUPON / PNR
                  </span>
                  <div
                    style={monoStyle}
                    className="text-3xl font-bold tracking-wider text-[#13382E] border-y border-[#1F1A16]/15 py-3"
                  >
                    {flight.pnr}
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopy(flight.pnr, `PNR ${flight.pnr}`)}
                    style={monoStyle}
                    className="w-full py-2.5 bg-[#1F1A16] hover:bg-[#A8442A] text-[#F6F1E7] text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer"
                  >
                    Copy PNR Reference
                  </button>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#1F1A16]/15">
                  <a
                    href={flight.manageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={monoStyle}
                    className="block w-full text-center py-2.5 border border-[#1F1A16] text-[#1F1A16] hover:bg-[#1F1A16] hover:text-[#F6F1E7] text-[11px] uppercase tracking-[0.16em] transition-colors"
                  >
                    Manage Airline Portal <ExternalArrow />
                  </a>
                  {flight.extraLinks.map((lnk) => (
                    <a
                      key={lnk.url}
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={monoStyle}
                      className="block w-full text-center py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#5C5248] hover:text-[#A8442A] underline"
                    >
                      {lnk.label} <ExternalArrow />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Luxury Hotel Stationery Dossiers */}
      <div className="space-y-6">
        <div className="border-b border-[#1F1A16]/20 pb-2">
          <span
            style={monoStyle}
            className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
          >
            SECTION 02 &bull; SANCTUARIES &amp; RESIDENCES
          </span>
          <h3 style={serifStyle} className="text-3xl font-normal text-[#1F1A16]">
            Confirmed Five-Star Accommodations
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {HOTEL_BOOKINGS.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-[#FBF8F3] border border-[#1F1A16]/25 p-6 sm:p-8 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-[#1F1A16]/15 pb-4">
                  <div>
                    <span
                      style={monoStyle}
                      className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
                    >
                      {hotel.city} &bull; {hotel.nights} NIGHTS
                    </span>
                    <h4
                      style={serifStyle}
                      className="text-3xl sm:text-4xl font-normal text-[#1F1A16] mt-1"
                    >
                      {hotel.name}
                    </h4>
                    <p
                      style={serifStyle}
                      className="italic text-base text-[#5C5248]"
                    >
                      {hotel.dates}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(
                        hotel.bookingRef,
                        `${hotel.name} Ref (${hotel.bookingRef})`
                      )
                    }
                    style={monoStyle}
                    className="px-3 py-2 bg-[#EFE7D8] border border-[#1F1A16]/25 text-xs font-bold text-[#13382E] hover:border-[#1F1A16] shrink-0 cursor-pointer"
                  >
                    REF: {hotel.bookingRef}
                  </button>
                </div>

                {/* Architectural Spec Box */}
                <div className="bg-[#EFE7D8]/50 border border-[#1F1A16]/15 p-4 space-y-2">
                  <div
                    style={serifStyle}
                    className="text-xl font-semibold text-[#1F1A16]"
                  >
                    {hotel.roomCategory}
                  </div>
                  {hotel.roomDescription && (
                    <p className="text-xs text-[#4A4036] leading-relaxed">
                      {hotel.roomDescription}
                    </p>
                  )}
                  <div
                    style={monoStyle}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1F1A16]/10 text-[11px] text-[#5C5248]"
                  >
                    <span>CHECK-IN: {hotel.checkIn}</span>
                    <span>CHECK-OUT: {hotel.checkOut}</span>
                  </div>
                </div>

                {/* Financial Ledger Box */}
                <div className="border border-[#13382E]/30 bg-[#13382E]/5 p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span
                      style={monoStyle}
                      className="text-[10px] uppercase tracking-[0.16em] text-[#5C5248]"
                    >
                      CONFIRMED TARIFF
                    </span>
                    <span
                      style={monoStyle}
                      className="text-sm font-bold text-[#13382E]"
                    >
                      THB {hotel.totalThb.toLocaleString()} (~£
                      {hotel.totalGbp.toFixed(2)})
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5248]">{hotel.paymentNote}</p>

                  {hotel.balanceDueThb > 0 && (
                    <label className="flex items-center gap-2.5 pt-2.5 border-t border-[#13382E]/20 text-xs text-[#1F1A16] font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pavilionsBalancePaid}
                        onChange={onTogglePavilionsBalancePaid}
                        className="w-4 h-4 accent-[#13382E]"
                      />
                      <span>
                        {pavilionsBalancePaid
                          ? "✓ Remaining THB 1,190.00 Airport Transfer Balance Settled"
                          : "Mark THB 1,190.00 (~£26.75) Airport Transfer Balance as Settled"}
                      </span>
                    </label>
                  )}
                </div>

                {/* Property Highlights */}
                <ul className="space-y-2 text-xs sm:text-sm text-[#4A4036]">
                  {hotel.highlights.map((hl) => (
                    <li key={hl} className="flex items-start gap-2.5">
                      <span className="text-[#9E7B3B] mt-0.5">&diams;</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coordinates & Chauffeur Copy Actions */}
              <div className="pt-4 border-t border-[#1F1A16]/15 space-y-3">
                <div className="text-xs text-[#5C5248]">
                  {hotel.address}{" "}
                  <span
                    style={monoStyle}
                    className="text-[11px] text-[#8A7E71] block mt-0.5"
                  >
                    GEO: {hotel.coordinates} &bull; TEL: {hotel.phone}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenDriverModal(hotel.id)}
                    style={monoStyle}
                    className="px-4 py-2 bg-[#A8442A] hover:bg-[#8F351E] text-[#FBF8F3] text-[11px] uppercase tracking-[0.15em] font-semibold cursor-pointer"
                  >
                    Show Driver (Thai Script)
                  </button>
                  <a
                    href={hotel.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={monoStyle}
                    className="px-4 py-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[11px] uppercase tracking-[0.15em]"
                  >
                    Open Google Maps <ExternalArrow />
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(hotel.address, `${hotel.name} Address`)
                    }
                    style={monoStyle}
                    className="px-4 py-2 border border-[#1F1A16]/30 hover:border-[#1F1A16] text-[#1F1A16] text-[11px] uppercase tracking-[0.15em] cursor-pointer"
                  >
                    Copy Chauffeur / Grab Address
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
