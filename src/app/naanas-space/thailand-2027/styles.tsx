import React from "react";
import { ItineraryActivity } from "@/lib/thailandTripData";

export const CATEGORY_EDITORIAL_STYLES: Record<
  ItineraryActivity["category"],
  { tag: string; label: string }
> = {
  flight: {
    tag: "border-[#13382E]/30 bg-[#13382E]/8 text-[#13382E]",
    label: "Aviation",
  },
  hotel: {
    tag: "border-[#9E7B3B]/40 bg-[#9E7B3B]/10 text-[#6E521F]",
    label: "Residence",
  },
  transit: {
    tag: "border-[#5C5248]/30 bg-[#EFE7D8] text-[#433A31]",
    label: "Passage",
  },
  dining: {
    tag: "border-[#A8442A]/35 bg-[#A8442A]/10 text-[#8F351E]",
    label: "Gastronomy",
  },
  culture: {
    tag: "border-[#9E7B3B]/45 bg-[#9E7B3B]/12 text-[#735520]",
    label: "Heritage & Temple",
  },
  beach: {
    tag: "border-[#1D4E40]/35 bg-[#1D4E40]/10 text-[#13382E]",
    label: "Andaman Coast",
  },
  spa: {
    tag: "border-[#2D5A47]/35 bg-[#2D5A47]/10 text-[#1E4233]",
    label: "Sanctuary & Spa",
  },
  romance: {
    tag: "border-[#A8442A]/45 bg-[#A8442A]/12 text-[#8F351E]",
    label: "Celebration",
  },
  custom: {
    tag: "border-[#1F1A16]/25 bg-[#EFE7D8] text-[#1F1A16]",
    label: "Bespoke Note",
  },
};

export const serifStyle = {
  fontFamily: "var(--font-editorial-serif), Georgia, serif",
  fontVariantNumeric: "lining-nums tabular-nums" as const,
};

export const monoStyle = {
  fontFamily: "var(--font-editorial-mono), monospace",
  fontVariantNumeric: "lining-nums tabular-nums" as const,
};

export const chronometerDigitalStyle = {
  fontFamily:
    "'DS-Digital', var(--font-digital), var(--font-editorial-mono), monospace",
  fontVariantNumeric: "tabular-nums" as const,
  letterSpacing: "0.06em",
};

export const ExternalArrow = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block w-3 h-3 ml-1 -mt-0.5 shrink-0"
  >
    <path d="M3 9L9 3M9 3H4.5M9 3V7.5" />
  </svg>
);
