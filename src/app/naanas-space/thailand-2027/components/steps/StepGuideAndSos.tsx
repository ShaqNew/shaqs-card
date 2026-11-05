import React from "react";
import {
  EMERGENCY_CONTACTS,
  INTERNATIONAL_HOSPITALS,
  FOOD_SAFETY_GUIDELINES,
} from "@/lib/thailandTripData";
import { serifStyle, monoStyle, ExternalArrow } from "../../styles";

export function StepGuideAndSos() {
  return (
    <section className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bangkok Field Dispatch */}
        <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-5">
          <div className="border-b border-[#1F1A16]/15 pb-3">
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
            >
              DISPATCH 01 &bull; BANGKOK (05&ndash;08 FEB)
            </span>
            <h2
              style={serifStyle}
              className="text-3xl font-normal text-[#1F1A16] mt-1"
            >
              Suvarnabhumi Arrival &amp; River Transit
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#4A4036]">
            <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-2">
              <div
                style={serifStyle}
                className="text-xl font-semibold text-[#1F1A16]"
              >
                I. Arrival Protocol at BKK (Fri 05 Feb @ 17:05)
              </div>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>
                  Clear immigration (present saved TDAC QR code) and reclaim
                  checked luggage.
                </li>
                <li>
                  <strong>Sterling Exchange:</strong> Descend to{" "}
                  <strong>Floor B (Airport Rail Link level)</strong> for
                  SuperRich Orange/Green booths.
                </li>
                <li>
                  <strong>Chauffeur / Grab:</strong> Proceed to{" "}
                  <strong>Level 1 (Ground)</strong> for metered public taxis, or{" "}
                  <strong>Level 4, Door 4</strong> for Grab pickup.
                </li>
                <li>
                  Transfer to Shangri-La Bangkok takes{" "}
                  <strong>~40&ndash;50 mins via Sirat Expressway</strong>{" "}
                  (~400&ndash;500 THB + expressway tolls).
                </li>
              </ol>
            </div>

            <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-2">
              <div
                style={serifStyle}
                className="text-xl font-semibold text-[#1F1A16]"
              >
                II. Navigating from Shangri-La Bangkok
              </div>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>BTS Skytrain:</strong> Direct 2-minute walk to{" "}
                  <strong>Saphan Taksin Station</strong> (Silom Line) for Siam,
                  Silom, and Sukhumvit.
                </li>
                <li>
                  <strong>Chao Phraya Express Boats:</strong> Embark at adjacent{" "}
                  <strong>Sathorn Central Pier</strong> for scenic river hops
                  north to Wat Arun, Wat Pho, and the Grand Palace.
                </li>
                <li>
                  <strong>ICONSIAM &amp; Asiatique:</strong> Board the{" "}
                  <strong>complimentary Shangri-La shuttle boat</strong> from
                  Sathorn Pier directly to ICONSIAM &amp; SookSiam.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Phuket Field Dispatch */}
        <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-5">
          <div className="border-b border-[#1F1A16]/15 pb-3">
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.2em] text-[#13382E] font-semibold"
            >
              DISPATCH 02 &bull; PHUKET (08&ndash;13 FEB)
            </span>
            <h2
              style={serifStyle}
              className="text-3xl font-normal text-[#1F1A16] mt-1"
            >
              The Pavilions Sanctuary &amp; Andaman Coves
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#4A4036]">
            <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-1.5">
              <div
                style={serifStyle}
                className="text-xl font-semibold text-[#1F1A16]"
              >
                I. Hilltop Buggy Service &amp; Amenities
              </div>
              <p>
                Summon front-desk golf buggies from your 81 sqm Deluxe Tropical
                View Suite to move effortlessly between{" "}
                <strong>Firefly Pool</strong>,{" "}
                <strong>360 Bar (hilltop sunset)</strong>, and{" "}
                <strong>Pavilions Spa</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-2">
              <div
                style={serifStyle}
                className="text-xl font-semibold text-[#1F1A16]"
              >
                II. Curated Coastal Index
              </div>
              <ul className="space-y-1.5">
                <li>
                  &bull; <strong>Layan Beach (5 mins):</strong> Complimentary
                  scheduled resort shuttle. Tranquil, Casuarina-shaded, shallow
                  crystal water.
                </li>
                <li>
                  &bull; <strong>Bang Tao Beach (10 mins south):</strong> Home
                  to premier beach clubs (<em>Catch Beach Club</em>,{" "}
                  <em>Maya Beach Club</em>) and sweeping white sand.
                </li>
                <li>
                  &bull; <strong>Banana Beach (12 mins north):</strong> Secluded
                  romantic cove framed by palms.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 space-y-1">
              <div
                style={serifStyle}
                className="text-xl font-semibold text-[#1F1A16]"
              >
                III. Departure Protocol (Sat 13 Feb)
              </div>
              <p>
                Check out at <strong>12:00 PM</strong> (leave trunks with
                concierge). Depart for Phuket International Airport (
                <code>HKT</code>) by <strong>15:30 PM</strong> ahead of Air
                Arabia flight <code>G9715</code> (18:20 departure).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Culinary & Health Advisory • Food Safety Guidelines */}
      <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1A16]/15 pb-3">
          <span
            style={monoStyle}
            className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
          >
            CULINARY &amp; HEALTH ADVISORY &bull; FOOD &amp; WATER PROTOCOLS
          </span>
          <h3
            style={serifStyle}
            className="text-3xl font-normal text-[#1F1A16] mt-1"
          >
            Food Safety &amp; Dining Guidelines
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5248] mt-1">
            Essential hygiene protocols, hydration rules, and pharmacy access for dining safely across Bangkok and Phuket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FOOD_SAFETY_GUIDELINES.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-[#EFE7D8]/60 border border-[#1F1A16]/15 flex flex-col justify-between space-y-3"
            >
              <div>
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.16em] text-[#13382E] font-semibold"
                >
                  {item.badge}
                </span>
                <h4
                  style={serifStyle}
                  className="text-2xl font-semibold text-[#1F1A16] mt-1"
                >
                  {item.title}
                </h4>
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-[#4A4036]">
                  {item.guidelines.map((guideline, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#A8442A] font-bold select-none leading-relaxed">
                        &bull;
                      </span>
                      <span className="leading-relaxed">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consular & Emergency Red Book */}
      <div className="bg-[#FBF8F3] border-2 border-[#A8442A] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#1F1A16]/15 pb-3">
          <span
            style={monoStyle}
            className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
          >
            CRITICAL ASSISTANCE &bull; CONSULAR &amp; MEDICAL DIRECTORY
          </span>
          <h3
            style={serifStyle}
            className="text-3xl font-normal text-[#1F1A16] mt-1"
          >
            Emergency Dispatch &amp; International Hospitals
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EMERGENCY_CONTACTS.map((c) => (
            <div
              key={c.title}
              className="p-5 bg-[#EFE7D8]/60 border border-[#1F1A16]/20 flex flex-col justify-between space-y-4"
            >
              <div>
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.16em] text-[#A8442A] font-semibold"
                >
                  {c.badge}
                </span>
                <h4
                  style={serifStyle}
                  className="text-2xl font-semibold text-[#1F1A16] mt-1"
                >
                  {c.title}
                </h4>
                <p className="text-xs text-[#5C5248] mt-1">{c.description}</p>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={c.telHref}
                  style={monoStyle}
                  className="block w-full text-center py-2.5 bg-[#A8442A] hover:bg-[#8F351E] text-[#FBF8F3] text-xs uppercase tracking-[0.16em] font-semibold transition-colors"
                >
                  Dial {c.number}
                </a>
                {c.linkUrl && (
                  <a
                    href={c.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={monoStyle}
                    className="block text-center text-[10px] uppercase tracking-[0.14em] text-[#13382E] underline"
                  >
                    {c.linkLabel} <ExternalArrow />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <h4
            style={monoStyle}
            className="text-[10px] uppercase tracking-[0.2em] text-[#5C5248] mb-3"
          >
            ACCREDITED INTERNATIONAL HOSPITALS
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INTERNATIONAL_HOSPITALS.map((hosp) => (
              <a
                key={hosp.name}
                href={hosp.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-[#F6F1E7] border border-[#1F1A16]/15 hover:border-[#1F1A16] transition-colors block"
              >
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.15em] text-[#A8442A] font-semibold"
                >
                  {hosp.city}
                </span>
                <div
                  style={serifStyle}
                  className="text-lg font-semibold text-[#1F1A16] mt-1"
                >
                  {hosp.name} <ExternalArrow />
                </div>
                <p className="text-xs text-[#5C5248] mt-1">{hosp.note}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
