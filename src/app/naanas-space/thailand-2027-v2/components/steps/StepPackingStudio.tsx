import React, { useState } from "react";
import {
  TRIP_DAYS,
  PackingItem,
  WardrobeOutfit,
  DressCodeProfile,
} from "@/lib/thailandTripData";
import { ProgressMetric } from "../../types";
import { serifStyle, monoStyle } from "../../styles";
import {
   isInspirationOutfit,
  resolveDayOutfit,
} from "../../utils/wardrobe";
import { PolaroidOutfitCard } from "../PolaroidOutfitCard";

const PACKING_CATEGORIES: PackingItem["category"][] = [
  "Daytime & Temple Wear",
  "Evening & Fine Dining",
  "Resort & Beach (Phuket)",
  "Health & Pharmacy",
  "Toiletries & Sun Care",
  "Electronics & Power",
  "Carry-On & Documents",
];

interface StepPackingStudioProps {
  allPackingItems: PackingItem[];
  packedItemIds: string[];
  packingProgress: ProgressMetric;
  onTogglePackingItem: (id: string) => void;
  onAddCustomPackingItem: (itemData: Omit<PackingItem, "id">) => void;
  onRemoveCustomPackingItem: (itemId: string) => void;
  onPackOutfitGarments?: (outfit: WardrobeOutfit) => number | void;
  allOutfits?: WardrobeOutfit[];
  dayOutfitByDay?: Record<number, string>;
  onAssignDayOutfit?: (dayNumber: number, outfitId: string | null) => void;
  onRemoveCustomOutfit?: (outfitId: string) => void;
  onEditOutfit?: (outfit: WardrobeOutfit) => void;
  onToggleOutfitInspiration?: (outfit: WardrobeOutfit) => void;
  onOpenCreateLookModal?: () => void;
}

export function StepPackingStudio({
  allPackingItems,
  packedItemIds,
  packingProgress,
  onTogglePackingItem,
  onAddCustomPackingItem,
  onRemoveCustomPackingItem,
  onPackOutfitGarments,
  allOutfits = [],
  dayOutfitByDay = {},
  onAssignDayOutfit,
  onRemoveCustomOutfit,
  onEditOutfit,
  onToggleOutfitInspiration,
  onOpenCreateLookModal,
}: StepPackingStudioProps) {
  const [packingOwnerFilter, setPackingOwnerFilter] = useState<
    "all" | "both" | "shaq" | "naana"
  >("all");
  const [showUnpackedOnly, setShowUnpackedOnly] = useState(false);
  const [dressCodeTab, setDressCodeTab] = useState<
    "temple" | "rooftop" | "daytime" | "beach"
  >("temple");
  const [wardrobeOwnerFilter, setWardrobeOwnerFilter] = useState<
    "all" | "both" | "shaq" | "naana"
  >("all");
  const [wardrobeCodeFilter, setWardrobeCodeFilter] = useState<
    "all" | DressCodeProfile
  >("all");
  const [wardrobeSourceFilter, setWardrobeSourceFilter] = useState<
    "all" | "owned" | "inspo"
  >("all");

  // Collapsible section states (default expanded for desktop & test visibility)
  const [isClimateDressOpen, setIsClimateDressOpen] = useState(true);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(true);
  const [isWardrobeFiltersOpen, setIsWardrobeFiltersOpen] = useState(true);
  const [collapsedOutfitCards, setCollapsedOutfitCards] = useState<
    Record<string, boolean>
  >({});
  const [isTrunkOpen, setIsTrunkOpen] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});
  const [trunkToast, setTrunkToast] = useState<string | null>(null);

  const [newPackLabel, setNewPackLabel] = useState("");
  const [newPackCategory, setNewPackCategory] = useState<
    PackingItem["category"]
  >("Daytime & Temple Wear");
  const [newPackForWho, setNewPackForWho] =
    useState<PackingItem["forWho"]>("both");

  const allSectionsOpen = isClimateDressOpen && isWardrobeOpen && isTrunkOpen;
  const handleToggleAllSections = () => {
    const nextState = !allSectionsOpen;
    setIsClimateDressOpen(nextState);
    setIsWardrobeOpen(nextState);
    setIsTrunkOpen(nextState);
  };

  const filteredOutfits = allOutfits.filter((outfit) => {
    if (wardrobeOwnerFilter !== "all" && outfit.owner !== wardrobeOwnerFilter) {
      return false;
    }
    if (wardrobeSourceFilter === "owned" && isInspirationOutfit(outfit)) {
      return false;
    }
    if (wardrobeSourceFilter === "inspo" && !isInspirationOutfit(outfit)) {
      return false;
    }
    if (
      wardrobeCodeFilter !== "all" &&
      outfit.dressCode !== wardrobeCodeFilter
    ) {
      return false;
    }
    return true;
  });

  const activeFilterCount =
    (wardrobeOwnerFilter !== "all" ? 1 : 0) +
    (wardrobeSourceFilter !== "all" ? 1 : 0) +
    (wardrobeCodeFilter !== "all" ? 1 : 0);

  const allOutfitCardsCollapsed =
    filteredOutfits.length > 0 &&
    filteredOutfits.every((o) => collapsedOutfitCards[o.id]);

  const handleToggleAllOutfitCards = () => {
    if (allOutfitCardsCollapsed) {
      setCollapsedOutfitCards({});
    } else {
      const next: Record<string, boolean> = {};
      allOutfits.forEach((o) => {
        next[o.id] = true;
      });
      setCollapsedOutfitCards(next);
    }
  };

  const toggleOutfitCardCollapse = (outfitId: string) => {
    setCollapsedOutfitCards((prev) => ({
      ...prev,
      [outfitId]: !prev[outfitId],
    }));
  };

  const allCategoriesCollapsed = PACKING_CATEGORIES.every(
    (cat) => collapsedCategories[cat]
  );
  const handleToggleAllCategories = () => {
    if (allCategoriesCollapsed) {
      setCollapsedCategories({});
    } else {
      const next: Record<string, boolean> = {};
      PACKING_CATEGORIES.forEach((cat) => {
        next[cat] = true;
      });
      setCollapsedCategories(next);
    }
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const existingPackingLabels = new Set(
    allPackingItems.map((p) => p.label.trim().toLowerCase())
  );

  const handlePackOutfit = (outfit: WardrobeOutfit) => {
    if (!onPackOutfitGarments) return;
    const addedCount = onPackOutfitGarments(outfit);
    const count =
      typeof addedCount === "number" ? addedCount : outfit.garments.length;
    setTrunkToast(
      count > 0
        ? `Added ${count} ${count === 1 ? "piece" : "pieces"} from "${
            outfit.title
          }" to The Packing Ledger`
        : `All pieces from "${outfit.title}" are already in The Packing Ledger`
    );
    setTimeout(() => setTrunkToast(null), 3200);
  };

  const handleAddPackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackLabel.trim()) return;
    onAddCustomPackingItem({
      category: newPackCategory,
      label: newPackLabel.trim(),
      forWho: newPackForWho,
    });
    setNewPackLabel("");
  };

  return (
    <section className="space-y-8">
      {/* Compact Mobile & Desktop Section Accordion Bar */}
      <div className="bg-[#EFE7D8]/75 border border-[#1F1A16]/15 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            style={monoStyle}
            className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#5C5248] mr-1"
          >
            STUDIO SECTIONS:
          </span>
          <button
            type="button"
            onClick={() => setIsClimateDressOpen((prev) => !prev)}
            aria-expanded={isClimateDressOpen}
            style={monoStyle}
            className={`min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.13em] border cursor-pointer transition-colors ${
              isClimateDressOpen
                ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
            }`}
          >
            Climate &amp; Etiquette {isClimateDressOpen ? "▲" : "▼"}
          </button>
          <button
            type="button"
            onClick={() => setIsWardrobeOpen((prev) => !prev)}
            aria-expanded={isWardrobeOpen}
            style={monoStyle}
            className={`min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.13em] border cursor-pointer transition-colors ${
              isWardrobeOpen
                ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
            }`}
          >
            Digital Wardrobe ({allOutfits.length}) {isWardrobeOpen ? "▲" : "▼"}
          </button>
          <button
            type="button"
            onClick={() => setIsTrunkOpen((prev) => !prev)}
            aria-expanded={isTrunkOpen}
            style={monoStyle}
            className={`min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.13em] border cursor-pointer transition-colors ${
              isTrunkOpen
                ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
            }`}
          >
            Packing Ledger ({packingProgress.done}/{packingProgress.total}){" "}
            {isTrunkOpen ? "▲" : "▼"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleAllSections}
          style={monoStyle}
          className="min-h-11 sm:min-h-0 px-3 py-1 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#13382E] hover:bg-[#13382E] hover:text-[#F6F1E7] border border-[#13382E]/35 bg-[#FBF8F3] cursor-pointer transition-colors"
        >
          {allSectionsOpen ? "Collapse All Sections" : "Expand All Sections"}
        </button>
      </div>

      {/* Section 1: Climate Monograph & Sartorial Etiquette */}
      <div className="bg-[#FBF8F3] border border-[#1F1A16]/20">
        <div className="px-6 py-4 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1F1A16]/15 bg-[#EFE7D8]/40">
          <div>
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#A8442A] font-semibold"
            >
              SECTION I &bull; METEOROLOGY &amp; SARTORIAL ETIQUETTE
            </span>
            <p
              style={serifStyle}
              className="text-lg sm:text-xl font-semibold text-[#1F1A16]"
            >
              February Climate Monograph &amp; Dress Code Lookbook
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsClimateDressOpen((prev) => !prev)}
            aria-expanded={isClimateDressOpen}
            aria-label="Toggle Climate Monograph and Dress Code Lookbook section"
            style={monoStyle}
            className="min-h-11 sm:min-h-0 px-3 py-1.5 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border border-[#1F1A16]/25 bg-[#FBF8F3] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] cursor-pointer shrink-0 transition-colors"
          >
            {isClimateDressOpen ? "Collapse ▲" : "Expand ▼"}
          </button>
        </div>

        {isClimateDressOpen && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Climate Monograph */}
            <div className="lg:col-span-5 bg-[#F6F1E7]/60 border border-[#1F1A16]/15 p-5 space-y-4">
              <span
                style={monoStyle}
                className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#A8442A] font-semibold"
              >
                METEOROLOGICAL PROFILE &bull; FEBRUARY
              </span>
              <h2
                style={serifStyle}
                className="text-3xl font-normal text-[#1F1A16]"
              >
                Dry Season Sunshine
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5248] leading-relaxed">
                February represents Thailand&apos;s dry, calm zenith &mdash;
                translucent seas and uninterrupted sunshine across both legs.
              </p>

              <div className="divide-y divide-[#1F1A16]/15 border-t border-[#1F1A16]/15 pt-2">
                <div className="py-3">
                  <div className="flex justify-between items-baseline">
                    <span
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      Bangkok (05&ndash;08 Feb)
                    </span>
                    <span
                      style={monoStyle}
                      className="text-xs font-semibold text-[#A8442A]"
                    >
                      32°C&ndash;34°C / 24°C Night
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5248] mt-1">
                    Tropical urban warmth. Favour unlined linen, lightweight
                    cotton, and bamboo weaves.
                  </p>
                </div>

                <div className="py-3">
                  <div className="flex justify-between items-baseline">
                    <span
                      style={serifStyle}
                      className="text-xl font-semibold text-[#1F1A16]"
                    >
                      Phuket (08&ndash;13 Feb)
                    </span>
                    <span
                      style={monoStyle}
                      className="text-xs font-semibold text-[#13382E]"
                    >
                      31°C&ndash;33°C / 25°C Night
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5248] mt-1">
                    Coastal trade winds.{" "}
                    <strong className="text-[#A8442A]">
                      UV Index 10&ndash;11 (Extreme)
                    </strong>{" "}
                    &mdash; SPF 50+ and polarised lenses are mandatory.
                  </p>
                </div>
              </div>
            </div>

            {/* Sartorial & Dress Code Lookbook */}
            <div className="lg:col-span-7 bg-[#F6F1E7]/60 border border-[#1F1A16]/15 p-5 space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1F1A16]/15 pb-4">
                <div>
                  <span
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#8A7E71]"
                  >
                    SARTORIAL ETIQUETTE
                  </span>
                  <h2
                    style={serifStyle}
                    className="text-3xl font-normal text-[#1F1A16]"
                  >
                    Dress Code Lookbook
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "temple", label: "Temple Rules" },
                    { id: "rooftop", label: "Rooftop & Fine Dining" },
                    { id: "daytime", label: "Daytime City" },
                    { id: "beach", label: "Phuket Resort" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setDressCodeTab(
                          t.id as "temple" | "rooftop" | "daytime" | "beach"
                        )
                      }
                      style={monoStyle}
                      className={`min-h-11 sm:min-h-0 px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border cursor-pointer ${
                        dressCodeTab === t.id
                          ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                          : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {dressCodeTab === "temple" && (
                <div className="p-5 bg-[#EFE7D8]/70 border-l-2 border-[#A8442A] space-y-2.5 text-xs sm:text-sm">
                  <div
                    style={serifStyle}
                    className="text-xl font-semibold text-[#1F1A16]"
                  >
                    Strictly Enforced at Grand Palace, Wat Pho &amp; Wat Arun
                  </div>
                  <ul className="space-y-1.5 text-[#4A4036] list-disc pl-5">
                    <li>
                      <strong>
                        Shoulders and knees must be completely covered
                      </strong>{" "}
                      for both gentlemen and ladies.
                    </li>
                    <li>
                      <strong>Prohibited:</strong> Sleeveless tops, tank tops,
                      crop tops, sheer fabrics, shorts, or tight athletic
                      leggings.
                    </li>
                    <li>
                      <strong>Daypack Essential:</strong> Carry a lightweight
                      linen overshirt or sarong in your daypack.
                    </li>
                    <li>
                      <strong>Footwear:</strong> Slip-on loafers or sandals
                      (footwear is removed before entering sacred halls).
                    </li>
                  </ul>
                </div>
              )}

              {dressCodeTab === "rooftop" && (
                <div className="p-5 bg-[#EFE7D8]/70 border-l-2 border-[#13382E] space-y-2.5 text-xs sm:text-sm">
                  <div
                    style={serifStyle}
                    className="text-xl font-semibold text-[#1F1A16]"
                  >
                    Smart Casual for Bangkok Sky-Bars (Lebua, Vertigo,
                    Mahanakhon) &amp; Fine Dining
                  </div>
                  <ul className="space-y-1.5 text-[#4A4036] list-disc pl-5">
                    <li>
                      <strong>Shaq (Gentlemen):</strong> Collared linen shirts,
                      tailored lightweight chinos/trousers, and{" "}
                      <strong className="text-[#1F1A16] underline">
                        closed-toe loafers or clean smart trainers
                      </strong>{" "}
                      (sky-bars strictly refuse flip-flops, athletic shorts, and
                      sleeveless vests).
                    </li>
                    <li>
                      <strong>Naana (Ladies):</strong> Maxi/midi evening
                      dresses, tailored jumpsuits, or elevated resort separates.
                    </li>
                  </ul>
                </div>
              )}

              {dressCodeTab === "daytime" && (
                <div className="p-5 bg-[#EFE7D8]/70 border-l-2 border-[#9E7B3B] space-y-2.5 text-xs sm:text-sm">
                  <div
                    style={serifStyle}
                    className="text-xl font-semibold text-[#1F1A16]"
                  >
                    Bangkok Riverfront &amp; Daytime Sightseeing
                  </div>
                  <ul className="space-y-1.5 text-[#4A4036] list-disc pl-5">
                    <li>
                      Prioritise breathable natural fibres: linen, fine cotton,
                      and bamboo.
                    </li>
                    <li>
                      Avoid heavy denim or unbreathable synthetics in 34°C
                      humidity.
                    </li>
                    <li>
                      Keep pocket tissues, wet wipes, and Dioralyte electrolyte
                      sachets in your day bag.
                    </li>
                  </ul>
                </div>
              )}

              {dressCodeTab === "beach" && (
                <div className="p-5 bg-[#EFE7D8]/70 border-l-2 border-[#13382E] space-y-2.5 text-xs sm:text-sm">
                  <div
                    style={serifStyle}
                    className="text-xl font-semibold text-[#1F1A16]"
                  >
                    The Pavilions Phuket, Layan Beach &amp; Bang Tao Clubs
                  </div>
                  <ul className="space-y-1.5 text-[#4A4036] list-disc pl-5">
                    <li>
                      Multiple swimwear rotations, linen beach cover-ups,
                      polarised UV sunglasses, and wide-brimmed sunhats.
                    </li>
                    <li>
                      Reef-safe SPF 50+ sunscreen brought from London (resort
                      sun care carries a steep premium).
                    </li>
                    <li>
                      10L dry bag and waterproof phone pouch for Banana Beach
                      and longtail boat charters.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Digital Wardrobe & Polaroid Lookbook */}
      <div
        id="digital-wardrobe-section"
        className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#A8442A] font-semibold"
            >
              SARTORIAL CURATION &bull; PINTEREST &amp; BOUTIQUE COLLAGES
            </span>
            <h3
              style={serifStyle}
              className="text-3xl font-normal text-[#1F1A16] mt-1"
            >
              Digital Wardrobe &amp; Outfit Lookbook ({allOutfits.length} Looks)
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5248] mt-1">
              Polaroid garment collages built from lightweight retailer URLs and
              assigned across daily schedules and individual activities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenCreateLookModal && (
              <button
                type="button"
                onClick={onOpenCreateLookModal}
                style={monoStyle}
                className="min-h-11 sm:min-h-0 px-4 py-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.1em] sm:tracking-[0.16em] font-semibold cursor-pointer"
              >
                + Create Look
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsWardrobeOpen((prev) => !prev)}
              aria-expanded={isWardrobeOpen}
              aria-label="Toggle Digital Wardrobe section"
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-3 py-2 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border border-[#1F1A16]/25 bg-[#F6F1E7] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] cursor-pointer transition-colors"
            >
              {isWardrobeOpen ? "Collapse ▲" : "Expand ▼"}
            </button>
          </div>
        </div>

        {trunkToast && (
          <div
            role="status"
            aria-live="polite"
            style={monoStyle}
            className="px-4 py-2.5 bg-[#13382E] text-[#F6F1E7] border border-[#9E7B3B] text-xs uppercase tracking-wider flex items-center justify-between gap-2"
          >
            <span>✓ {trunkToast}</span>
            <button
              type="button"
              onClick={() => setTrunkToast(null)}
              className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center text-[#D8B979] hover:text-[#F6F1E7] cursor-pointer"
              aria-label="Dismiss notification"
            >
              &#10005;
            </button>
          </div>
        )}

        {isWardrobeOpen && (
          <>
            {/* Collapsible Filter Section & Card Collapse Toolbar */}
            <div className="bg-[#F6F1E7]/70 border border-[#1F1A16]/15 p-3 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWardrobeFiltersOpen((prev) => !prev)}
                    aria-expanded={isWardrobeFiltersOpen}
                    aria-label="Toggle Digital Wardrobe filters"
                    style={monoStyle}
                    className={`min-h-11 sm:min-h-0 px-3 py-1.5 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border cursor-pointer transition-colors ${
                      isWardrobeFiltersOpen
                        ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                        : "bg-[#FBF8F3] text-[#1F1A16] border-[#1F1A16]/25 hover:bg-[#1F1A16] hover:text-[#F6F1E7]"
                    }`}
                  >
                    Filters
                    {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}{" "}
                    {isWardrobeFiltersOpen ? "▲" : "▼"}
                  </button>

                  <span
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.13em] text-[#5C5248]"
                  >
                    Showing {filteredOutfits.length} of {allOutfits.length}{" "}
                    {allOutfits.length === 1 ? "Look" : "Looks"}
                  </span>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setWardrobeOwnerFilter("all");
                        setWardrobeSourceFilter("all");
                        setWardrobeCodeFilter("all");
                      }}
                      style={monoStyle}
                      className="min-h-11 sm:min-h-0 px-2.5 sm:px-2 py-1 text-[11px] sm:text-[9px] uppercase tracking-wider text-[#A8442A] border border-[#A8442A]/35 bg-[#FBF8F3] hover:bg-[#A8442A] hover:text-[#FBF8F3] cursor-pointer transition-colors"
                    >
                      Reset Filters &#10005;
                    </button>
                  )}
                </div>

                {filteredOutfits.length > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleAllOutfitCards}
                    aria-label="Toggle collapse all outfit cards"
                    style={monoStyle}
                    className="min-h-11 sm:min-h-0 px-3 py-1.5 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border border-[#13382E]/35 text-[#13382E] hover:bg-[#13382E] hover:text-[#F6F1E7] bg-[#FBF8F3] cursor-pointer transition-colors"
                  >
                    {allOutfitCardsCollapsed
                      ? "Expand All Cards ▼"
                      : "Collapse All Cards ▲"}
                  </button>
                )}
              </div>

              {isWardrobeFiltersOpen && (
                <div className="pt-2 border-t border-[#1F1A16]/12 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: "all", label: "All Looks" },
                        { id: "both", label: "Shared" },
                        { id: "shaq", label: "Shaq" },
                        { id: "naana", label: "Naana" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() =>
                            setWardrobeOwnerFilter(
                              f.id as "all" | "both" | "shaq" | "naana"
                            )
                          }
                          style={monoStyle}
                          className={`min-h-11 sm:min-h-0 px-3 py-1.5 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border cursor-pointer ${
                            wardrobeOwnerFilter === f.id
                              ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                              : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Owned vs Inspiration Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pl-2 border-l border-[#1F1A16]/15">
                      {[
                        { id: "all", label: "All Sources" },
                        {
                          id: "owned",
                          label: `✓ Owned (${
                            allOutfits.filter((o) => !isInspirationOutfit(o))
                              .length
                          })`,
                        },
                        {
                          id: "inspo",
                          label: `✦ Inspiration (${
                            allOutfits.filter((o) => isInspirationOutfit(o))
                              .length
                          })`,
                        },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            setWardrobeSourceFilter(
                              s.id as "all" | "owned" | "inspo"
                            )
                          }
                          style={monoStyle}
                          className={`min-h-11 sm:min-h-0 px-3 py-1.5 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border cursor-pointer ${
                            wardrobeSourceFilter === s.id
                              ? s.id === "inspo"
                                ? "bg-[#9E7B3B] text-[#FBF8F3] border-[#9E7B3B]"
                                : "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                              : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: "all", label: "All Codes" },
                      { id: "temple", label: "Temple" },
                      { id: "rooftop", label: "Rooftop" },
                      { id: "daytime", label: "Daytime" },
                      { id: "beach", label: "Beach" },
                      { id: "transit", label: "Transit" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setWardrobeCodeFilter(c.id as "all" | DressCodeProfile)
                        }
                        style={monoStyle}
                        className={`min-h-11 sm:min-h-0 px-3 py-1.5 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border cursor-pointer ${
                          wardrobeCodeFilter === c.id
                            ? "bg-[#A8442A] text-[#FBF8F3] border-[#A8442A]"
                            : "bg-[#FBF8F3] text-[#5C5248] border-[#1F1A16]/20"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Polaroid Wardrobe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {filteredOutfits.map((outfit) => {
                const assignedDays = TRIP_DAYS.filter((d) => {
                  const resolved = resolveDayOutfit(
                    d.dayNumber,
                    d.defaultOutfitId,
                    dayOutfitByDay,
                    allOutfits
                  );
                  return resolved?.id === outfit.id;
                }).map((d) => d.dayNumber);

                const isPackedInTrunk =
                  outfit.garments.length > 0 &&
                  outfit.garments.every((g) =>
                    existingPackingLabels.has(g.label.trim().toLowerCase())
                  );

                return (
                  <PolaroidOutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    assignedDayNumbers={assignedDays}
                    onAssignToDay={
                      onAssignDayOutfit
                        ? (dNum, oId) => onAssignDayOutfit(dNum, oId)
                        : undefined
                    }
                    onPackOutfitGarments={
                      onPackOutfitGarments ? handlePackOutfit : undefined
                    }
                    isPackedInTrunk={isPackedInTrunk}
                    onEditOutfit={onEditOutfit}
                    onToggleInspiration={onToggleOutfitInspiration}
                    onRemoveCustomOutfit={onRemoveCustomOutfit}
                    isCardCollapsed={Boolean(collapsedOutfitCards[outfit.id])}
                    onToggleCardCollapse={toggleOutfitCardCollapse}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Section 3: The Packing Ledger (Categorised Packing List) */}
      <div
        id="trunk-ledger-section"
        className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#8A7E71]"
            >
              BAGGAGE ALLOWANCE: AIR ARABIA 20KG + 10KG &bull; VIETJET 25KG
              (SHAQ) / 30KG (NAANA) + 7KG
            </span>
            <h3
              style={serifStyle}
              className="text-3xl font-normal text-[#1F1A16] mt-1"
            >
              The Packing Ledger ({packingProgress.done}/{packingProgress.total}{" "}
              Packed)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isTrunkOpen && (
              <>
                {[
                  { id: "all", label: "All" },
                  { id: "both", label: "Shared" },
                  { id: "shaq", label: "Shaq" },
                  { id: "naana", label: "Naana" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      setPackingOwnerFilter(
                        f.id as "all" | "both" | "shaq" | "naana"
                      )
                    }
                    style={monoStyle}
                    className={`min-h-11 sm:min-h-0 px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border cursor-pointer ${
                      packingOwnerFilter === f.id
                        ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                        : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowUnpackedOnly(!showUnpackedOnly)}
                  style={monoStyle}
                  className={`min-h-11 sm:min-h-0 px-3.5 py-2 text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border cursor-pointer ${
                    showUnpackedOnly
                      ? "bg-[#A8442A] text-[#FBF8F3] border-[#A8442A]"
                      : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                  }`}
                >
                  {showUnpackedOnly ? "Showing Unpacked" : "Unpacked Only"}
                </button>
                <button
                  type="button"
                  onClick={handleToggleAllCategories}
                  style={monoStyle}
                  className="min-h-11 sm:min-h-0 px-3 py-2 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border border-[#13382E]/35 text-[#13382E] hover:bg-[#13382E] hover:text-[#F6F1E7] bg-[#F6F1E7] cursor-pointer transition-colors"
                >
                  {allCategoriesCollapsed
                    ? "Expand All Categories"
                    : "Collapse All Categories"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsTrunkOpen((prev) => !prev)}
              aria-expanded={isTrunkOpen}
              aria-label="Toggle Packing Ledger section"
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-3 py-2 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border border-[#1F1A16]/25 bg-[#F6F1E7] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] cursor-pointer transition-colors"
            >
              {isTrunkOpen ? "Collapse ▲" : "Expand ▼"}
            </button>
          </div>
        </div>

        {isTrunkOpen && (
          <>
            {/* Add Custom Packing Item Form */}
            <form
              onSubmit={handleAddPackingSubmit}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#EFE7D8]/60 p-4 border border-[#1F1A16]/15"
            >
              <input
                type="text"
                enterKeyHint="done"
                autoComplete="off"
                value={newPackLabel}
                onChange={(e) => setNewPackLabel(e.target.value)}
                placeholder="Add a custom item to pack (e.g. 35mm film camera, linen evening shawl)..."
                className="sm:col-span-6 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
              />
              <select
                value={newPackCategory}
                onChange={(e) =>
                  setNewPackCategory(e.target.value as PackingItem["category"])
                }
                className="sm:col-span-3 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
              >
                <option value="Daytime & Temple Wear">
                  Daytime &amp; Temple Wear
                </option>
                <option value="Evening & Fine Dining">
                  Evening &amp; Fine Dining
                </option>
                <option value="Resort & Beach (Phuket)">
                  Resort &amp; Beach (Phuket)
                </option>
                <option value="Health & Pharmacy">Health &amp; Pharmacy</option>
                <option value="Toiletries & Sun Care">
                  Toiletries &amp; Sun Care
                </option>
                <option value="Electronics & Power">
                  Electronics &amp; Power
                </option>
                <option value="Carry-On & Documents">
                  Carry-On &amp; Documents
                </option>
              </select>
              <select
                value={newPackForWho}
                onChange={(e) =>
                  setNewPackForWho(e.target.value as PackingItem["forWho"])
                }
                className="sm:col-span-2 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
              >
                <option value="both">Shared</option>
                <option value="shaq">Shaq</option>
                <option value="naana">Naana</option>
              </select>
              <button
                type="submit"
                style={monoStyle}
                className="sm:col-span-1 min-h-11 sm:min-h-0 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] font-semibold text-xs uppercase tracking-wider py-2 cursor-pointer"
              >
                + Add
              </button>
            </form>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {PACKING_CATEGORIES.map((cat) => {
                const items = allPackingItems.filter((item) => {
                  if (item.category !== cat) return false;
                  if (
                    packingOwnerFilter !== "all" &&
                    item.forWho !== packingOwnerFilter
                  )
                    return false;
                  if (showUnpackedOnly && packedItemIds.includes(item.id))
                    return false;
                  return true;
                });

                if (items.length === 0) return null;

                const catTotal = items.length;
                const catDone = items.filter((item) =>
                  packedItemIds.includes(item.id)
                ).length;
                const isCatCollapsed = Boolean(collapsedCategories[cat]);

                return (
                  <div
                    key={cat}
                    className="bg-[#F6F1E7]/70 border border-[#1F1A16]/15 p-5 space-y-3"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      aria-expanded={!isCatCollapsed}
                      className={`min-h-11 sm:min-h-0 w-full flex items-center justify-between gap-2 text-left cursor-pointer ${
                        isCatCollapsed
                          ? ""
                          : "border-b border-[#1F1A16]/15 pb-2"
                      }`}
                    >
                      <h4
                        style={serifStyle}
                        className="text-xl font-semibold text-[#1F1A16]"
                      >
                        {cat}
                      </h4>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          style={monoStyle}
                          className={`px-2 py-0.5 text-[11px] sm:text-[10px] uppercase tracking-wider border ${
                            catDone === catTotal
                              ? "bg-[#13382E]/10 text-[#13382E] border-[#13382E]/30 font-semibold"
                              : "bg-[#EFE7D8] text-[#5C5248] border-[#1F1A16]/15"
                          }`}
                        >
                          {catDone}/{catTotal} Packed
                        </span>
                        <span
                          style={monoStyle}
                          className="text-[11px] sm:text-[10px] text-[#5C5248]"
                          aria-hidden="true"
                        >
                          {isCatCollapsed ? "▼" : "▲"}
                        </span>
                      </div>
                    </button>

                    {!isCatCollapsed && (
                      <div className="divide-y divide-[#1F1A16]/10">
                        {items.map((item) => {
                          const isPacked = packedItemIds.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              className={`py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-2 ${
                                isPacked ? "opacity-55" : ""
                              }`}
                            >
                              <label className="min-h-11 sm:min-h-0 py-1 sm:py-0 flex items-start gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={isPacked}
                                  onChange={() => onTogglePackingItem(item.id)}
                                  className="mt-0.5 sm:mt-1 w-5 h-5 sm:w-4 sm:h-4 accent-[#13382E] shrink-0"
                                />
                                <div className="flex-1 text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`font-semibold text-sm ${
                                        isPacked
                                          ? "line-through text-[#8A7E71]"
                                          : "text-[#1F1A16]"
                                      }`}
                                    >
                                      {item.label}
                                    </span>
                                    {item.forWho !== "both" && (
                                      <span
                                        style={monoStyle}
                                        className="px-1.5 py-0.5 bg-[#EFE7D8] border border-[#1F1A16]/15 text-[#A8442A] text-[11px] uppercase tracking-wider"
                                      >
                                        {item.forWho}
                                      </span>
                                    )}
                                  </div>
                                  {item.note && (
                                    <p className="text-[#5C5248] mt-0.5">
                                      {item.note}
                                    </p>
                                  )}
                                </div>
                              </label>
                              {item.id.startsWith("custom-pack-") && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onRemoveCustomPackingItem(item.id)
                                  }
                                  className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center text-xs text-[#8A7E71] hover:text-[#A8442A] px-2 py-1 shrink-0 cursor-pointer"
                                  title="Remove custom packing item"
                                  aria-label={`Remove ${item.label}`}
                                >
                                  &#10005;
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
