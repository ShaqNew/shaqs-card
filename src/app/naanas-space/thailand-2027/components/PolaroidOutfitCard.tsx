import React, { useState, useEffect } from "react";
import { TRIP_DAYS, WardrobeOutfit, GarmentLink } from "@/lib/thailandTripData";
import { serifStyle, monoStyle, ExternalArrow } from "../styles";
import {
  DRESS_CODE_METADATA,
  extractSourceDomain,
  formatOwnerBadge,
} from "../utils/wardrobe";
import { formatDayNumber } from "../utils/formatters";

interface GarmentLightboxModalProps {
  garment: GarmentLink;
  outfitTitle?: string;
  allGarments?: GarmentLink[];
  onSelectGarment?: (garment: GarmentLink) => void;
  onClose: () => void;
}

export function GarmentLightboxModal({
  garment,
  outfitTitle,
  allGarments = [],
  onSelectGarment,
  onClose,
}: GarmentLightboxModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [garment.id, garment.imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (
        (e.key === "ArrowRight" || e.key === "ArrowLeft") &&
        allGarments.length > 1 &&
        onSelectGarment
      ) {
        const currentIndex = allGarments.findIndex((g) => g.id === garment.id);
        if (currentIndex !== -1) {
          const nextIndex =
            e.key === "ArrowRight"
              ? (currentIndex + 1) % allGarments.length
              : (currentIndex - 1 + allGarments.length) % allGarments.length;
          onSelectGarment(allGarments[nextIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [garment.id, allGarments, onSelectGarment, onClose]);

  const domain = extractSourceDomain(garment.url);
  const showImage = Boolean(garment.imageUrl && !imgError);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Expanded preview: ${garment.label}`}
      className="fixed inset-0 z-[70] bg-[#1F1A16]/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-[#FBF8F3] border-2 border-[#1F1A16] max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#1F1A16]/15 pb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.18em] text-[#A8442A] font-semibold"
              >
                {garment.category || "GARMENT PIECE"} &bull; {domain}
              </span>
              {outfitTitle && (
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.14em] text-[#5C5248]"
                >
                  ({outfitTitle})
                </span>
              )}
            </div>
            <h3
              style={serifStyle}
              className="text-xl sm:text-2xl font-semibold text-[#1F1A16] mt-0.5 truncate"
            >
              {garment.label}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={monoStyle}
            aria-label="Close expanded image"
            className="px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0"
          >
            Close &#10005;
          </button>
        </div>

        {/* Main Image Viewport */}
        <div className="relative bg-[#EFE7D8]/70 border border-[#1F1A16]/15 flex items-center justify-center min-h-[260px] max-h-[68vh] overflow-hidden p-2">
          {showImage ? (
            <img
              src={garment.imageUrl}
              alt={garment.label}
              onError={() => setImgError(true)}
              className="max-h-[64vh] w-auto max-w-full object-contain mx-auto shadow-sm"
            />
          ) : (
            <div className="p-8 text-center space-y-3 max-w-md">
              <span
                style={monoStyle}
                className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
              >
                {domain} EDITORIAL TILE
              </span>
              <p
                style={serifStyle}
                className="text-2xl text-[#1F1A16] font-medium"
              >
                {garment.label}
              </p>
              <p className="text-xs text-[#5C5248]">
                No direct thumbnail image URL is stored for this piece. Open the
                original link below or edit the garment to paste an image URL.
              </p>
            </div>
          )}
        </div>

        {/* Multi-Garment Switcher & External Source Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1F1A16]/15">
          {allGarments.length > 1 && onSelectGarment ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                style={monoStyle}
                className="text-[9px] uppercase tracking-wider text-[#5C5248] mr-1"
              >
                PIECES ({allGarments.length}):
              </span>
              {allGarments.map((g, idx) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onSelectGarment(g)}
                  style={monoStyle}
                  className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border cursor-pointer transition-colors ${
                    g.id === garment.id
                      ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E] font-semibold"
                      : "bg-[#EFE7D8]/70 text-[#1F1A16] border-[#1F1A16]/20 hover:border-[#13382E]"
                  }`}
                >
                  0{idx + 1} &bull; {g.label.slice(0, 18)}
                  {g.label.length > 18 ? "…" : ""}
                </button>
              ))}
            </div>
          ) : (
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-wider text-[#5C5248]"
            >
              SOURCE: {domain}
            </span>
          )}

          <a
            href={garment.url}
            target="_blank"
            rel="noopener noreferrer"
            style={monoStyle}
            className="px-3.5 py-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[10px] uppercase tracking-[0.16em] font-semibold inline-flex items-center gap-1.5"
          >
            <span>Open Original on {domain}</span>
            <ExternalArrow />
          </a>
        </div>
      </div>
    </div>
  );
}

interface PolaroidCollageTileProps {
  garment?: GarmentLink;
  slotIndex: number;
  onExpandGarment?: (garment: GarmentLink) => void;
}

export function PolaroidCollageTile({
  garment,
  slotIndex,
  onExpandGarment,
}: PolaroidCollageTileProps) {
  const [imgError, setImgError] = useState(false);
  const [localExpanded, setLocalExpanded] = useState(false);

  if (!garment) {
    return (
      <div className="bg-[#EFE7D8]/70 flex flex-col items-center justify-center p-2 text-center select-none">
        <span
          style={monoStyle}
          className="text-[9px] uppercase tracking-[0.18em] text-[#8A7E71]/70"
        >
          SLOT 0{slotIndex + 1}
        </span>
        <span
          style={serifStyle}
          className="italic text-xs text-[#8A7E71]/80 mt-0.5"
        >
          Open Garment Slot
        </span>
      </div>
    );
  }

  const domain = extractSourceDomain(garment.url);
  const showImage = Boolean(garment.imageUrl && !imgError);

  const handleTileClick = () => {
    if (onExpandGarment) {
      onExpandGarment(garment);
    } else {
      setLocalExpanded(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTileClick}
        aria-label={`Expand thumbnail for ${garment.label}`}
        className="relative w-full h-full bg-[#E9E0CE] overflow-hidden flex flex-col justify-between group/tile text-left cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#13382E]"
      >
        {showImage ? (
          <img
            src={garment.imageUrl}
            alt={garment.label}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/tile:scale-105"
          />
        ) : (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-br from-[#EFE7D8] to-[#E3D7C1]">
            <div className="flex items-center justify-between gap-1">
              <span
                style={monoStyle}
                className="text-[9px] uppercase tracking-[0.14em] text-[#A8442A] font-semibold truncate"
              >
                {garment.category || "GARMENT"}
              </span>
              <span
                style={monoStyle}
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-[#FBF8F3]/90 text-[#13382E] border border-[#1F1A16]/15 shrink-0"
              >
                {domain}
              </span>
            </div>
            <p
              style={serifStyle}
              className="text-xs sm:text-sm text-[#1F1A16] leading-snug line-clamp-2 font-medium"
            >
              {garment.label}
            </p>
          </div>
        )}

        {/* Subtle Hover Expand Pill (Top-Right) */}
        <span
          style={monoStyle}
          className="absolute top-1.5 right-1.5 z-10 opacity-0 group-hover/tile:opacity-100 transition-opacity px-1.5 py-0.5 bg-[#1F1A16]/85 text-[#F6F1E7] text-[8px] uppercase tracking-wider pointer-events-none"
        >
          Expand &#10530;
        </span>

        {showImage && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1F1A16]/85 via-[#1F1A16]/45 to-transparent p-2 flex items-end justify-between gap-1 w-full">
            <span className="text-[10px] text-[#FBF8F3] font-medium leading-tight line-clamp-1">
              {garment.label}
            </span>
            <span
              style={monoStyle}
              className="text-[8px] uppercase tracking-wider px-1 py-0.5 bg-[#FBF8F3]/90 text-[#1F1A16] shrink-0"
            >
              {domain}
            </span>
          </div>
        )}
      </button>

      {localExpanded && (
        <GarmentLightboxModal
          garment={garment}
          onClose={() => setLocalExpanded(false)}
        />
      )}
    </>
  );
}

interface PolaroidOutfitCardProps {
  outfit: WardrobeOutfit;
  assignedDayNumbers?: number[];
  onAssignToDay?: (dayNumber: number, outfitId: string) => void;
  onEditOutfit?: (outfit: WardrobeOutfit) => void;
  onRemoveCustomOutfit?: (outfitId: string) => void;
  compact?: boolean;
  isSelected?: boolean;
  onSelectOutfit?: (outfitId: string) => void;
}

export function PolaroidOutfitCard({
  outfit,
  assignedDayNumbers = [],
  onAssignToDay,
  onEditOutfit,
  onRemoveCustomOutfit,
  compact = false,
  isSelected = false,
  onSelectOutfit,
}: PolaroidOutfitCardProps) {
  const [expandedGarment, setExpandedGarment] = useState<GarmentLink | null>(
    null
  );
  const dressMeta = DRESS_CODE_METADATA[outfit.dressCode];
  const slots = [0, 1, 2, 3].map((idx) => outfit.garments[idx]);

  return (
    <article
      className={`bg-[#FBF8F3] border transition-all p-3 pb-4 shadow-[0_6px_18px_rgba(31,26,22,0.06)] flex flex-col justify-between ${
        isSelected
          ? "border-2 border-[#13382E] ring-2 ring-[#13382E]/20"
          : "border-[#1F1A16]/20 hover:border-[#1F1A16]/45"
      }`}
    >
      <div>
        {/* Polaroid Upper Image Frame: 2x2 Split-Grid Collage */}
        <div className="relative aspect-[4/3] bg-[#1F1A16]/10 border border-[#1F1A16]/15 overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5">
          {slots.map((g, idx) => (
            <PolaroidCollageTile
              key={g?.id || `empty-${idx}`}
              garment={g}
              slotIndex={idx}
              onExpandGarment={(item) => setExpandedGarment(item)}
            />
          ))}

          {/* Overlaid Owner Badge (Top-Left) */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 pointer-events-none">
            <span
              style={monoStyle}
              className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] font-semibold shadow-sm ${
                outfit.owner === "shaq"
                  ? "bg-[#13382E] text-[#F6F1E7]"
                  : outfit.owner === "naana"
                  ? "bg-[#A8442A] text-[#FBF8F3]"
                  : "bg-[#1F1A16] text-[#F6F1E7]"
              }`}
            >
              {formatOwnerBadge(outfit.owner)}
            </span>
          </div>

          {/* Overlaid Climate Tag Pill (Bottom) */}
          <div className="absolute bottom-2 inset-x-2 z-10 flex justify-between items-center pointer-events-none">
            <span
              style={monoStyle}
              className="px-2 py-0.5 bg-[#FBF8F3]/95 text-[#1F1A16] border border-[#1F1A16]/20 text-[9px] uppercase tracking-[0.13em] font-semibold shadow-sm truncate max-w-full"
            >
              {outfit.climateTag}
            </span>
          </div>
        </div>

        {/* Polaroid Lower Caption Area */}
        <div className="pt-3.5 px-1 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span
              style={monoStyle}
              className={`text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border font-semibold ${dressMeta.badgeClass}`}
            >
              {dressMeta.shortBadge}
            </span>

            {assignedDayNumbers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {assignedDayNumbers.map((dNum) => (
                  <span
                    key={dNum}
                    style={monoStyle}
                    className="px-1.5 py-0.5 bg-[#13382E]/10 text-[#13382E] border border-[#13382E]/30 text-[9px] uppercase tracking-wider font-semibold"
                  >
                    D{formatDayNumber(dNum)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <h4
            style={serifStyle}
            className="text-xl font-semibold text-[#1F1A16] leading-snug"
          >
            {outfit.title}
          </h4>

          {outfit.notes && !compact && (
            <p className="text-xs text-[#5C5248] leading-relaxed">
              {outfit.notes}
            </p>
          )}

          {/* Garment URLs List */}
          {outfit.garments.length > 0 && (
            <div className="pt-2 border-t border-[#1F1A16]/10 space-y-1.5">
              <div
                style={monoStyle}
                className="text-[9px] uppercase tracking-[0.16em] text-[#8A7E71]"
              >
                GARMENT LINKS ({outfit.garments.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {outfit.garments.map((g) => (
                  <a
                    key={g.id}
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={monoStyle}
                    className="px-2 py-1 bg-[#EFE7D8]/70 hover:bg-[#EFE7D8] border border-[#1F1A16]/15 hover:border-[#13382E] text-[10px] text-[#1F1A16] hover:text-[#13382E] inline-flex items-center gap-1 transition-colors"
                    title={`${g.label} (${extractSourceDomain(g.url)})`}
                  >
                    <span className="truncate max-w-[155px]">{g.label}</span>
                    <span className="text-[#A8442A] font-semibold">
                      [{extractSourceDomain(g.url)}]
                    </span>
                    <ExternalArrow />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Polaroid Footer Actions */}
      <div className="pt-3 mt-3 border-t border-[#1F1A16]/12 px-1 flex flex-wrap items-center justify-between gap-2">
        {onSelectOutfit ? (
          <div className="w-full flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectOutfit(outfit.id)}
              style={monoStyle}
              className={`flex-1 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold border cursor-pointer transition-colors ${
                isSelected
                  ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                  : "bg-[#EFE7D8] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] border-[#1F1A16]/25"
              }`}
            >
              {isSelected ? "✓ Assigned to Slot" : "Assign This Look"}
            </button>
            {onEditOutfit && (
              <button
                type="button"
                onClick={() => onEditOutfit(outfit)}
                style={monoStyle}
                className="px-2.5 py-2 text-[10px] uppercase tracking-wider text-[#5C5248] hover:text-[#13382E] border border-[#1F1A16]/20 hover:border-[#13382E] bg-[#FBF8F3] cursor-pointer shrink-0"
                aria-label={`Edit look ${outfit.title}`}
              >
                Edit
              </button>
            )}
            {onRemoveCustomOutfit && (
              <button
                type="button"
                onClick={() => onRemoveCustomOutfit(outfit.id)}
                style={monoStyle}
                className="px-2.5 py-2 text-[10px] uppercase tracking-wider text-[#8A7E71] hover:text-[#A8442A] border border-[#1F1A16]/15 hover:border-[#A8442A]/40 bg-[#FBF8F3] cursor-pointer shrink-0"
                aria-label={`Delete look ${outfit.title}`}
              >
                Delete &#10005;
              </button>
            )}
          </div>
        ) : (
          <>
            {onAssignToDay && (
              <div className="flex items-center gap-1.5 flex-1">
                <label
                  htmlFor={`assign-day-${outfit.id}`}
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-wider text-[#5C5248] shrink-0"
                >
                  ASSIGN TO DAY:
                </label>
                <select
                  id={`assign-day-${outfit.id}`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      onAssignToDay(Number(e.target.value), outfit.id);
                    }
                  }}
                  style={monoStyle}
                  className="bg-[#EFE7D8]/70 border border-[#1F1A16]/20 px-2 py-1 text-[10px] text-[#1F1A16] flex-1 min-w-0 cursor-pointer"
                >
                  <option value="">Select Day (D00–D10)...</option>
                  {TRIP_DAYS.map((d) => (
                    <option key={d.dayNumber} value={d.dayNumber}>
                      D{formatDayNumber(d.dayNumber)} • {d.shortDate} (
                      {d.phase.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1">
              {onEditOutfit && (
                <button
                  type="button"
                  onClick={() => onEditOutfit(outfit)}
                  style={monoStyle}
                  className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#5C5248] hover:text-[#13382E] border border-[#1F1A16]/20 hover:border-[#13382E] bg-[#EFE7D8]/50 cursor-pointer"
                  aria-label={`Edit look ${outfit.title}`}
                >
                  Edit
                </button>
              )}

              {onRemoveCustomOutfit && (
                <button
                  type="button"
                  onClick={() => onRemoveCustomOutfit(outfit.id)}
                  style={monoStyle}
                  className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#8A7E71] hover:text-[#A8442A] border border-transparent hover:border-[#A8442A]/30 cursor-pointer"
                  aria-label={`Delete look ${outfit.title}`}
                >
                  Delete &#10005;
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {expandedGarment && (
        <GarmentLightboxModal
          garment={expandedGarment}
          outfitTitle={outfit.title}
          allGarments={outfit.garments}
          onSelectGarment={(nextGarment) => setExpandedGarment(nextGarment)}
          onClose={() => setExpandedGarment(null)}
        />
      )}
    </article>
  );
}
