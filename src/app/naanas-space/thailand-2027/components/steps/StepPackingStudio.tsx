import React, { useState } from "react";
import {
  TRIP_DAYS,
  PackingItem,
  WardrobeOutfit,
  DressCodeProfile,
} from "@/lib/thailandTripData";
import { ProgressMetric } from "../../types";
import { serifStyle, monoStyle } from "../../styles";
import { resolveDayOutfit } from "../../utils/wardrobe";
import { PolaroidOutfitCard } from "../PolaroidOutfitCard";

interface StepPackingStudioProps {
  allPackingItems: PackingItem[];
  packedItemIds: string[];
  packingProgress: ProgressMetric;
  onTogglePackingItem: (id: string) => void;
  onAddCustomPackingItem: (itemData: Omit<PackingItem, "id">) => void;
  onRemoveCustomPackingItem: (itemId: string) => void;
  allOutfits?: WardrobeOutfit[];
  dayOutfitByDay?: Record<number, string>;
  onAssignDayOutfit?: (dayNumber: number, outfitId: string | null) => void;
  onRemoveCustomOutfit?: (outfitId: string) => void;
  onEditOutfit?: (outfit: WardrobeOutfit) => void;
  onOpenCreateLookModal?: () => void;
}

export function StepPackingStudio({
  allPackingItems,
  packedItemIds,
  packingProgress,
  onTogglePackingItem,
  onAddCustomPackingItem,
  onRemoveCustomPackingItem,
  allOutfits = [],
  dayOutfitByDay = {},
  onAssignDayOutfit,
  onRemoveCustomOutfit,
  onEditOutfit,
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

  const [newPackLabel, setNewPackLabel] = useState("");
  const [newPackCategory, setNewPackCategory] = useState<
    PackingItem["category"]
  >("Daytime & Temple Wear");
  const [newPackForWho, setNewPackForWho] =
    useState<PackingItem["forWho"]>("both");

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
    <section className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Climate Monograph */}
        <div className="lg:col-span-5 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 space-y-4">
          <span
            style={monoStyle}
            className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
          >
            METEOROLOGICAL PROFILE &bull; FEBRUARY
          </span>
          <h2 style={serifStyle} className="text-3xl font-normal text-[#1F1A16]">
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
                Tropical urban warmth. Favour unlined linen, lightweight cotton,
                and bamboo weaves.
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
        <div className="lg:col-span-7 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1F1A16]/15 pb-4">
            <div>
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
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
                  className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] border cursor-pointer ${
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
                  <strong>Prohibited:</strong> Sleeveless tops, tank tops, crop
                  tops, sheer fabrics, shorts, or tight athletic leggings.
                </li>
                <li>
                  <strong>Daypack Essential:</strong> Carry a lightweight linen
                  overshirt or sarong in your daypack.
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
                Smart Casual for Bangkok Sky-Bars (Lebua, Vertigo, Mahanakhon)
                &amp; Fine Dining
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
                  <strong>Naana (Ladies):</strong> Maxi/midi evening dresses,
                  tailored jumpsuits, or elevated resort separates.
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
                  Prioritise breathable natural fibres: linen, fine cotton, and
                  bamboo.
                </li>
                <li>
                  Avoid heavy denim or unbreathable synthetics in 34°C humidity.
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
                  Multiple swimwear rotations, linen beach cover-ups, polarised
                  UV sunglasses, and wide-brimmed sunhats.
                </li>
                <li>
                  Reef-safe SPF 50+ sunscreen brought from London (resort sun
                  care carries a steep premium).
                </li>
                <li>
                  10L dry bag and waterproof phone pouch for Banana Beach and
                  longtail boat charters.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Digital Wardrobe & Polaroid Lookbook */}
      <div
        id="digital-wardrobe-section"
        className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold"
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
                className="px-4 py-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.16em] font-semibold cursor-pointer"
              >
                + Create Look
              </button>
            )}
          </div>
        </div>

        {/* Wardrobe Owner & Dress Code Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] border cursor-pointer ${
                  wardrobeOwnerFilter === f.id
                    ? "bg-[#1F1A16] text-[#F6F1E7] border-[#1F1A16]"
                    : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                }`}
              >
                {f.label}
              </button>
            ))}
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
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] border cursor-pointer ${
                  wardrobeCodeFilter === c.id
                    ? "bg-[#A8442A] text-[#FBF8F3] border-[#A8442A]"
                    : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Polaroid Wardrobe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allOutfits
            .filter((outfit) => {
              if (
                wardrobeOwnerFilter !== "all" &&
                outfit.owner !== wardrobeOwnerFilter
              ) {
                return false;
              }
              if (
                wardrobeCodeFilter !== "all" &&
                outfit.dressCode !== wardrobeCodeFilter
              ) {
                return false;
              }
              return true;
            })
            .map((outfit) => {
              const assignedDays = TRIP_DAYS.filter((d) => {
                const resolved = resolveDayOutfit(
                  d.dayNumber,
                  d.defaultOutfitId,
                  dayOutfitByDay,
                  allOutfits
                );
                return resolved?.id === outfit.id;
              }).map((d) => d.dayNumber);

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
                  onEditOutfit={onEditOutfit}
                  onRemoveCustomOutfit={onRemoveCustomOutfit}
                />
              );
            })}
        </div>
      </div>

      {/* The Trunk Ledger (Categorised Packing List) */}
      <div
        id="trunk-ledger-section"
        className="scroll-mt-36 bg-[#FBF8F3] border border-[#1F1A16]/20 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1F1A16]/15">
          <div>
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.2em] text-[#8A7E71]"
            >
              BAGGAGE ALLOWANCE: AIR ARABIA 20KG + 10KG &bull; VIETJET 25KG
              (SHAQ) / 30KG (NAANA) + 7KG
            </span>
            <h3
              style={serifStyle}
              className="text-3xl font-normal text-[#1F1A16] mt-1"
            >
              The Trunk Ledger ({packingProgress.done}/{packingProgress.total}{" "}
              Packed)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
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
                className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] border cursor-pointer ${
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
              className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] border cursor-pointer ${
                showUnpackedOnly
                  ? "bg-[#A8442A] text-[#FBF8F3] border-[#A8442A]"
                  : "bg-transparent text-[#5C5248] border-[#1F1A16]/20"
              }`}
            >
              {showUnpackedOnly ? "Showing Unpacked" : "Unpacked Only"}
            </button>
          </div>
        </div>

        {/* Add Custom Packing Item Form */}
        <form
          onSubmit={handleAddPackingSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#EFE7D8]/60 p-4 border border-[#1F1A16]/15"
        >
          <input
            type="text"
            value={newPackLabel}
            onChange={(e) => setNewPackLabel(e.target.value)}
            placeholder="Add a custom item to pack (e.g. 35mm film camera, linen evening shawl)..."
            className="sm:col-span-6 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-xs sm:text-sm text-[#1F1A16]"
          />
          <select
            value={newPackCategory}
            onChange={(e) =>
              setNewPackCategory(e.target.value as PackingItem["category"])
            }
            className="sm:col-span-3 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-xs text-[#1F1A16]"
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
            <option value="Electronics & Power">Electronics &amp; Power</option>
            <option value="Carry-On & Documents">
              Carry-On &amp; Documents
            </option>
          </select>
          <select
            value={newPackForWho}
            onChange={(e) =>
              setNewPackForWho(e.target.value as PackingItem["forWho"])
            }
            className="sm:col-span-2 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-2 text-xs text-[#1F1A16]"
          >
            <option value="both">Shared</option>
            <option value="shaq">Shaq</option>
            <option value="naana">Naana</option>
          </select>
          <button
            type="submit"
            style={monoStyle}
            className="sm:col-span-1 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] font-semibold text-xs uppercase tracking-wider py-2 cursor-pointer"
          >
            + Add
          </button>
        </form>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(
            [
              "Daytime & Temple Wear",
              "Evening & Fine Dining",
              "Resort & Beach (Phuket)",
              "Health & Pharmacy",
              "Toiletries & Sun Care",
              "Electronics & Power",
              "Carry-On & Documents",
            ] as PackingItem["category"][]
          ).map((cat) => {
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

            return (
              <div
                key={cat}
                className="bg-[#F6F1E7]/70 border border-[#1F1A16]/15 p-5 space-y-3"
              >
                <h4
                  style={serifStyle}
                  className="text-xl font-semibold text-[#1F1A16] border-b border-[#1F1A16]/15 pb-2"
                >
                  {cat}
                </h4>
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
                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isPacked}
                            onChange={() => onTogglePackingItem(item.id)}
                            className="mt-1 w-4 h-4 accent-[#13382E]"
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
                            onClick={() => onRemoveCustomPackingItem(item.id)}
                            className="text-xs text-[#8A7E71] hover:text-[#A8442A] px-2 py-1 shrink-0 cursor-pointer"
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
