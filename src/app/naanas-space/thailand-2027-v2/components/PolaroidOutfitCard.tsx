import React, { useState, useEffect } from "react";
import { TRIP_DAYS, WardrobeOutfit, GarmentLink } from "@/lib/thailandTripData";
import { serifStyle, monoStyle, ExternalArrow } from "../styles";
import {
  DRESS_CODE_METADATA,
  extractAsosProductMeta,
  extractSourceDomain,
  formatOwnerBadge,
  isInspirationOutfit,
  getCollageTileCount,
  getCollageGridClass,
} from "../utils/wardrobe";
import { formatDayNumber } from "../utils/formatters";
import { useBottomSheetDialog } from "../hooks/useBottomSheetDialog";

interface GarmentLightboxModalProps {
  garment: GarmentLink | null;
  isOpen?: boolean;
  outfitTitle?: string;
  allGarments?: GarmentLink[];
  onSelectGarment?: (garment: GarmentLink) => void;
  onClose: () => void;
}

export function GarmentLightboxModal({
  garment,
  isOpen: isOpenProp,
  outfitTitle,
  allGarments = [],
  onSelectGarment,
  onClose,
}: GarmentLightboxModalProps) {
  const [imgError, setImgError] = useState(false);
  const isOpen = (isOpenProp ?? Boolean(garment)) && Boolean(garment);

  const { dialogRef, handleDialogClose } = useBottomSheetDialog({
    open: isOpen,
    onClose,
    desktopMode: "modal",
    lightDismiss: true,
  });

  useEffect(() => {
    setImgError(false);
  }, [garment?.id, garment?.imageUrl]);

  useEffect(() => {
    if (!isOpen || !garment) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
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
  }, [isOpen, garment, allGarments, onSelectGarment]);

  const activeIndex = garment
    ? allGarments.findIndex((g) => g.id === garment.id)
    : -1;
  const prevGarment =
    activeIndex !== -1 && allGarments.length > 1
      ? allGarments[(activeIndex - 1 + allGarments.length) % allGarments.length]
      : null;
  const nextGarment =
    activeIndex !== -1 && allGarments.length > 1
      ? allGarments[(activeIndex + 1) % allGarments.length]
      : null;

  const domain = garment ? extractSourceDomain(garment.url) : "";
  const showImage = Boolean(garment?.imageUrl && !imgError);

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-label={
        garment
          ? `Expanded preview: ${garment.label}`
          : "Expanded garment preview"
      }
      onClose={handleDialogClose}
      className="[&:not([open])]:hidden open:flex open:flex-col fixed inset-x-0 bottom-0 top-auto m-0 mt-auto w-full max-w-none max-h-[88dvh] rounded-t-2xl sm:inset-0 sm:m-auto sm:max-w-3xl sm:rounded-none bg-[#FBF8F3] text-[#1F1A16] border-t-2 sm:border-2 border-[#1F1A16] p-0 shadow-2xl z-[70] overflow-hidden overscroll-contain backdrop:bg-[#1F1A16]/85 sm:backdrop:backdrop-blur-sm backdrop:overflow-hidden backdrop:overscroll-contain"
    >
      {isOpen && garment && (
        <div
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div
            data-sheet-drag-handle="true"
            className="sm:hidden shrink-0 flex justify-center pt-2.5 pb-1 bg-[#FBF8F3]"
          >
            <span className="w-10 h-1 rounded-full bg-[#1F1A16]/25" />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
            {/* Top Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#1F1A16]/15 pb-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#A8442A] font-semibold"
                  >
                    {garment.category || "GARMENT PIECE"} &bull; {domain}
                  </span>
                  {outfitTitle && (
                    <span
                      style={monoStyle}
                      className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#5C5248]"
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
                className="min-h-11 sm:min-h-0 px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider inline-flex items-center cursor-pointer shrink-0"
              >
                Close &#10005;
              </button>
            </div>

            {/* Main Image Viewport */}
            <div className="relative bg-[#EFE7D8]/70 border border-[#1F1A16]/15 flex items-center justify-center min-h-[240px] max-h-[56dvh] overflow-hidden p-2">
              {showImage ? (
                <img
                  src={garment.imageUrl}
                  alt={garment.label}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="max-h-[52dvh] w-auto max-w-full object-contain mx-auto shadow-sm"
                />
              ) : (
                <div className="p-8 text-center space-y-3 max-w-md">
                  <span
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#A8442A] font-semibold block"
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
                    No direct thumbnail image URL is stored for this piece. Open
                    the original link below or edit the garment to paste an
                    image URL.
                  </p>
                </div>
              )}
            </div>

            {/* Explicit Prev / Next Garment Navigation + Piece Pills */}
            {allGarments.length > 1 && onSelectGarment && (
              <div className="space-y-2 pt-2 border-t border-[#1F1A16]/15">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-label="Previous garment"
                    onClick={() => prevGarment && onSelectGarment(prevGarment)}
                    style={monoStyle}
                    className="min-h-11 px-3 py-1.5 border border-[#1F1A16]/25 bg-[#EFE7D8] hover:bg-[#1F1A16] hover:text-[#F6F1E7] text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors"
                  >
                    &larr; Prev
                  </button>
                  <span
                    style={monoStyle}
                    className="text-[11px] uppercase tracking-wider text-[#5C5248]"
                  >
                    Piece {activeIndex + 1} of {allGarments.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Next garment"
                    onClick={() => nextGarment && onSelectGarment(nextGarment)}
                    style={monoStyle}
                    className="min-h-11 px-3 py-1.5 border border-[#1F1A16]/25 bg-[#EFE7D8] hover:bg-[#1F1A16] hover:text-[#F6F1E7] text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors"
                  >
                    Next &rarr;
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {allGarments.map((g, idx) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => onSelectGarment(g)}
                      style={monoStyle}
                      className={`min-h-11 sm:min-h-0 px-2.5 py-1 text-[11px] sm:text-[10px] uppercase tracking-wider border cursor-pointer transition-colors ${
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
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 sticky bottom-0 bg-[#EFE7D8] border-t border-[#D8CEBC] px-4 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3 flex flex-wrap items-center justify-between gap-2">
            <a
              href={garment.url}
              target="_blank"
              rel="noopener noreferrer"
              style={monoStyle}
              className="min-h-11 px-3.5 py-2 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-[11px] uppercase tracking-[0.1em] font-semibold inline-flex items-center gap-1.5"
            >
              <span>Open Original on {domain}</span>
              <ExternalArrow />
            </a>
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              className="min-h-11 px-4 py-2 bg-[#1F1A16] text-[#F6F1E7] text-[11px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

interface DeleteOutfitConfirmModalProps {
  outfit: WardrobeOutfit;
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteOutfitConfirmModal({
  outfit,
  isOpen = true,
  onConfirm,
  onClose,
}: DeleteOutfitConfirmModalProps) {
  const { dialogRef, handleDialogClose } = useBottomSheetDialog({
    open: isOpen,
    onClose,
    desktopMode: "modal",
    lightDismiss: true,
  });

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-label={`Confirm deletion of ${outfit.title}`}
      onClose={handleDialogClose}
      className="[&:not([open])]:hidden open:flex open:flex-col fixed inset-x-0 bottom-0 top-auto m-0 mt-auto w-full max-w-none max-h-[88dvh] rounded-t-2xl sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-none bg-[#FBF8F3] text-[#1F1A16] border-t-2 sm:border-2 border-[#1F1A16] p-0 shadow-2xl z-[75] overflow-hidden overscroll-contain backdrop:bg-[#1F1A16]/85 sm:backdrop:backdrop-blur-sm backdrop:overflow-hidden backdrop:overscroll-contain"
    >
      {isOpen && (
        <div
          className="p-5 sm:p-6 space-y-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#1F1A16]/15 pb-3">
            <div>
              <span
                style={monoStyle}
                className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#A8442A] font-semibold block"
              >
                DIGITAL WARDROBE &bull; CONFIRM REMOVAL
              </span>
              <h3
                style={serifStyle}
                className="text-xl font-semibold text-[#1F1A16] mt-1"
              >
                Delete Look?
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              aria-label="Close delete confirmation"
              className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 px-2.5 py-1 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider inline-flex items-center justify-center cursor-pointer shrink-0"
            >
              &#10005;
            </button>
          </div>

          <div className="space-y-2">
            <p
              style={serifStyle}
              className="text-base text-[#1F1A16] font-medium"
            >
              “{outfit.title}”
            </p>
            <p className="text-xs text-[#5C5248] leading-relaxed">
              Are you sure you want to remove this look from your Digital
              Wardrobe? Any itinerary days and activities referencing this look
              will be unassigned.
            </p>

            {outfit.isDefault && (
              <div className="p-2.5 bg-[#EFE7D8]/80 border border-[#1F1A16]/15 text-[11px] text-[#5C5248]">
                <span
                  style={monoStyle}
                  className="font-semibold text-[#13382E] uppercase tracking-wider block mb-0.5"
                >
                  Curated Default Look
                </span>
                This look is part of the default curated lookbook. It will be
                hidden from your wardrobe, and can be restored later.
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F1A16]/15">
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              className="min-h-11 px-3.5 py-2 text-xs uppercase tracking-wider text-[#5C5248] hover:text-[#1F1A16] border border-[#1F1A16]/25 bg-[#FBF8F3] hover:bg-[#EFE7D8] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={monoStyle}
              aria-label={`Confirm delete ${outfit.title}`}
              className="min-h-11 px-4 py-2 text-xs uppercase tracking-[0.1em] sm:tracking-[0.14em] font-semibold text-[#FBF8F3] bg-[#A8442A] hover:bg-[#8F351E] cursor-pointer shadow-sm"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

interface OutfitActionsSheetModalProps {
  outfit: WardrobeOutfit;
  isOpen: boolean;
  isInspo: boolean;
  isPackedInTrunk: boolean;
  effectiveCollapsed: boolean;
  onClose: () => void;
  onPackOutfitGarments?: (outfit: WardrobeOutfit) => void;
  onEditOutfit?: (outfit: WardrobeOutfit) => void;
  onToggleInspiration?: (outfit: WardrobeOutfit) => void;
  onToggleCollapse: () => void;
  onRequestDelete?: () => void;
}

function OutfitActionsSheetModal({
  outfit,
  isOpen,
  isInspo,
  isPackedInTrunk,
  effectiveCollapsed,
  onClose,
  onPackOutfitGarments,
  onEditOutfit,
  onToggleInspiration,
  onToggleCollapse,
  onRequestDelete,
}: OutfitActionsSheetModalProps) {
  const { dialogRef, handleDialogClose } = useBottomSheetDialog({
    open: isOpen,
    onClose,
    desktopMode: "modal",
    lightDismiss: true,
  });

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-label={`Actions for ${outfit.title}`}
      onClose={handleDialogClose}
      className="[&:not([open])]:hidden open:flex open:flex-col fixed inset-x-0 bottom-0 top-auto m-0 mt-auto w-full max-w-none max-h-[85dvh] rounded-t-2xl sm:inset-0 sm:m-auto sm:max-w-sm sm:rounded-lg bg-[#FBF8F3] text-[#1F1A16] border-t-2 sm:border-2 border-[#1F1A16] p-0 shadow-2xl z-[74] overflow-hidden overscroll-contain backdrop:bg-[#1F1A16]/75 sm:backdrop:backdrop-blur-xs backdrop:overflow-hidden backdrop:overscroll-contain"
    >
      {isOpen && (
        <div
          className="p-5 space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#1F1A16]/15 pb-3">
            <div className="min-w-0">
              <span
                style={monoStyle}
                className="text-[11px] sm:text-[10px] uppercase tracking-[0.14em] text-[#A8442A] font-semibold block"
              >
                LOOK ACTIONS &bull; {outfit.garments.length}{" "}
                {outfit.garments.length === 1 ? "GARMENT" : "GARMENTS"}
              </span>
              <h3
                style={serifStyle}
                className="text-lg font-semibold text-[#1F1A16] mt-0.5 truncate"
              >
                {outfit.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              aria-label={`Close actions for ${outfit.title}`}
              className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 rounded-md bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase inline-flex items-center justify-center cursor-pointer shrink-0"
            >
              &#10005;
            </button>
          </div>

          <div className="space-y-2">
            {onPackOutfitGarments && outfit.garments.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onPackOutfitGarments(outfit);
                  onClose();
                }}
                disabled={isPackedInTrunk}
                style={monoStyle}
                aria-label={
                  isPackedInTrunk
                    ? `All garments from ${outfit.title} are in Packing Ledger`
                    : `Add garments from ${outfit.title} to Packing Ledger`
                }
                className={`w-full min-h-11 px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider border flex items-center justify-between gap-2 transition-colors ${
                  isPackedInTrunk
                    ? "bg-[#13382E]/10 text-[#13382E] border-[#13382E]/30 cursor-default font-semibold"
                    : "bg-[#EFE7D8]/70 hover:bg-[#13382E] text-[#13382E] hover:text-[#F6F1E7] border-[#13382E]/35 cursor-pointer font-semibold"
                }`}
              >
                <span>
                  {isPackedInTrunk
                    ? "✓ In Packing Ledger"
                    : "+ To Packing Ledger"}
                </span>
                <span aria-hidden="true">
                  {outfit.garments.length}{" "}
                  {outfit.garments.length === 1 ? "piece" : "pieces"}
                </span>
              </button>
            )}

            {onToggleInspiration && (
              <button
                type="button"
                onClick={() => {
                  onToggleInspiration(outfit);
                  onClose();
                }}
                style={monoStyle}
                className="w-full min-h-11 px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider border border-[#1F1A16]/20 bg-[#FBF8F3] hover:bg-[#EFE7D8] text-[#1F1A16] flex items-center justify-between gap-2 cursor-pointer"
              >
                <span>
                  {isInspo ? "Mark as ✓ Owned" : "Tag as ✦ Inspiration"}
                </span>
                <span className="text-[10px] text-[#5C5248]">
                  {isInspo ? "Currently Inspo" : "Currently Owned"}
                </span>
              </button>
            )}

            {onEditOutfit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditOutfit(outfit);
                }}
                style={monoStyle}
                aria-label={`Edit look ${outfit.title}`}
                className="w-full min-h-11 px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider border border-[#1F1A16]/20 bg-[#FBF8F3] hover:bg-[#EFE7D8] text-[#1F1A16] flex items-center justify-between gap-2 cursor-pointer"
              >
                <span>Edit Look Details</span>
                <span aria-hidden="true">&#9998;</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onToggleCollapse();
                onClose();
              }}
              style={monoStyle}
              className="w-full min-h-11 px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider border border-[#1F1A16]/20 bg-[#FBF8F3] hover:bg-[#EFE7D8] text-[#5C5248] flex items-center justify-between gap-2 cursor-pointer"
            >
              <span>
                {effectiveCollapsed ? "Expand Photo Collage" : "Collapse Look Card"}
              </span>
              <span aria-hidden="true">
                {effectiveCollapsed ? "▼" : "▲"}
              </span>
            </button>

            {onRequestDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestDelete();
                }}
                style={monoStyle}
                aria-label={`Delete look ${outfit.title}`}
                className="w-full min-h-11 px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider border border-[#A8442A]/35 bg-[#A8442A]/5 hover:bg-[#A8442A] text-[#A8442A] hover:text-[#FBF8F3] flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <span>Delete Look</span>
                <span aria-hidden="true">&#10005;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </dialog>
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
  const asosMeta = garment ? extractAsosProductMeta(garment.url) : null;
  const [resolvedImgUrl, setResolvedImgUrl] = useState<string | undefined>(
    garment?.imageUrl || asosMeta?.primaryImageUrl
  );

  useEffect(() => {
    const nextAsosMeta = garment ? extractAsosProductMeta(garment.url) : null;
    setImgError(false);
    setResolvedImgUrl(garment?.imageUrl || nextAsosMeta?.primaryImageUrl);

    if (
      garment &&
      !garment.imageUrl &&
      /^https?:\/\//i.test(garment.url) &&
      !/\/search\b/i.test(garment.url) &&
      typeof fetch !== "undefined"
    ) {
      let cancelled = false;
      fetch(`/api/link-preview?url=${encodeURIComponent(garment.url)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { imageUrl?: string | null } | null) => {
          if (!cancelled && data?.imageUrl) {
            setImgError(false);
            setResolvedImgUrl(data.imageUrl);
          }
        })
        .catch(() => {
          // Ignore network errors in fallback preview
        });
      return () => {
        cancelled = true;
      };
    }
  }, [garment?.id, garment?.imageUrl, garment?.url]);

  if (!garment) {
    return (
      <div
        data-testid="polaroid-collage-tile"
        data-slot-index={slotIndex}
        className="bg-[#EFE7D8]/70 flex flex-col items-center justify-center p-2 text-center select-none w-full h-full"
      >
        <span
          style={monoStyle}
          className="text-[11px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[#8A7E71]/70"
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
  const effectiveImageUrl = garment.imageUrl || resolvedImgUrl;
  const showImage = Boolean(effectiveImageUrl && !imgError);

  const handleImageError = () => {
    if (
      asosMeta &&
      effectiveImageUrl &&
      effectiveImageUrl !== asosMeta.fallbackImageUrl
    ) {
      setResolvedImgUrl(asosMeta.fallbackImageUrl);
      return;
    }
    setImgError(true);
  };

  const handleTileClick = () => {
    const garmentWithImg: GarmentLink = effectiveImageUrl
      ? { ...garment, imageUrl: effectiveImageUrl }
      : garment;
    if (onExpandGarment) {
      onExpandGarment(garmentWithImg);
    } else {
      setLocalExpanded(true);
    }
  };

  return (
    <>
      <button
        type="button"
        data-testid="polaroid-collage-tile"
        data-slot-index={slotIndex}
        onClick={handleTileClick}
        aria-label={`Expand thumbnail for ${garment.label}`}
        className="relative w-full h-full min-w-0 rounded-md border border-[#1F1A16]/15 bg-[#EFE7D8] overflow-hidden flex flex-col justify-between group/tile text-left cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#13382E]"
      >
        {showImage ? (
          <img
            src={effectiveImageUrl}
            alt={garment.label}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/tile:scale-105"
          />
        ) : (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-br from-[#EFE7D8]/90 to-[#E5D9C4] min-w-0">
            <div className="pr-7 min-w-0">
              <span
                style={monoStyle}
                className="block text-[10px] sm:text-[9px] uppercase tracking-[0.08em] sm:tracking-[0.12em] text-[#5C5248] font-semibold truncate"
              >
                {(garment.category || "GARMENT").toUpperCase()} &middot; {domain}
              </span>
            </div>
            <p
              style={serifStyle}
              className="text-xs sm:text-sm text-[#1F1A16] leading-snug line-clamp-2 font-medium break-words"
            >
              {garment.label}
            </p>
          </div>
        )}

        {/* Compact Touch-Visible Expand Cue (corner square icon matching mobile mockup) */}
        <span
          data-testid="polaroid-tile-expand-cue"
          aria-hidden="true"
          style={monoStyle}
          className="absolute top-1.5 right-1.5 z-10 opacity-100 sm:opacity-0 sm:group-hover/tile:opacity-100 transition-opacity w-6 h-6 rounded-md bg-[#FBF8F3]/95 text-[#1F1A16] border border-[#1F1A16]/20 shadow-sm inline-flex items-center justify-center text-xs leading-none pointer-events-none"
        >
          &#10530;
        </span>

        {showImage && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1F1A16]/85 via-[#1F1A16]/45 to-transparent p-2 flex items-end justify-between gap-1.5 w-full min-w-0">
            <span className="text-[11px] sm:text-[10px] text-[#FBF8F3] font-medium leading-tight truncate min-w-0 flex-1">
              {garment.label}
            </span>
            <span
              style={monoStyle}
              className="text-[10px] sm:text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FBF8F3]/95 text-[#1F1A16] shrink-0"
            >
              {domain}
            </span>
          </div>
        )}
      </button>

      {!onExpandGarment && (
        <GarmentLightboxModal
          isOpen={localExpanded}
          garment={
            effectiveImageUrl
              ? { ...garment, imageUrl: effectiveImageUrl }
              : garment
          }
          onClose={() => setLocalExpanded(false)}
        />
      )}
    </>
  );
}

interface PolaroidOutfitCardProps {
  outfit: WardrobeOutfit;
  assignedDayNumbers?: number[];
  onAssignToDay?: (dayNumber: number, outfitId: string | null) => void;
  onEditOutfit?: (outfit: WardrobeOutfit) => void;
  onToggleInspiration?: (outfit: WardrobeOutfit) => void;
  onRemoveCustomOutfit?: (outfitId: string) => void;
  onPackOutfitGarments?: (outfit: WardrobeOutfit) => void;
  isPackedInTrunk?: boolean;
  compact?: boolean;
  isSelected?: boolean;
  onSelectOutfit?: (outfitId: string) => void;
  isCardCollapsed?: boolean;
  onToggleCardCollapse?: (outfitId: string) => void;
}

export function PolaroidOutfitCard({
  outfit,
  assignedDayNumbers = [],
  onAssignToDay,
  onEditOutfit,
  onToggleInspiration,
  onRemoveCustomOutfit,
  onPackOutfitGarments,
  isPackedInTrunk = false,
  compact = false,
  isSelected = false,
  onSelectOutfit,
  isCardCollapsed,
  onToggleCardCollapse,
}: PolaroidOutfitCardProps) {
  const [expandedGarment, setExpandedGarment] = useState<GarmentLink | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [isLinksExpanded, setIsLinksExpanded] = useState(false);
  const [localCardCollapsed, setLocalCardCollapsed] = useState(false);

  const effectiveCollapsed =
    typeof isCardCollapsed === "boolean" ? isCardCollapsed : localCardCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCardCollapse) {
      onToggleCardCollapse(outfit.id);
    } else {
      setLocalCardCollapsed((prev) => !prev);
    }
  };

  const dressMeta = DRESS_CODE_METADATA[outfit.dressCode];
  const isInspo = isInspirationOutfit(outfit);
  const tileCount = getCollageTileCount(outfit.garments?.length ?? 0);
  const slots = Array.from(
    { length: tileCount },
    (_, idx) => outfit.garments?.[idx]
  );

  const singleAssignedDay =
    assignedDayNumbers.length === 1
      ? TRIP_DAYS.find((d) => d.dayNumber === assignedDayNumbers[0])
      : undefined;
  const assignedDaySummaryLabel = singleAssignedDay
    ? `Assigned: Day ${formatDayNumber(singleAssignedDay.dayNumber)} · ${
        singleAssignedDay.shortDate
      }`
    : assignedDayNumbers.length > 1
    ? `Assigned: ${assignedDayNumbers
        .map((n) => `D${formatDayNumber(n)}`)
        .join(", ")}`
    : "Assign to Day (D00–D10)...";

  return (
    <article
      className={`min-w-0 w-full overflow-hidden rounded-xl sm:rounded-none bg-[#FBF8F3] border transition-all p-3.5 ${
        effectiveCollapsed ? "pb-3" : "pb-4"
      } shadow-[0_6px_18px_rgba(31,26,22,0.06)] flex flex-col justify-between ${
        isSelected
          ? "border-2 border-[#13382E] ring-2 ring-[#13382E]/20"
          : "border-[#1F1A16]/20 hover:border-[#1F1A16]/45"
      }`}
    >
      <div className="min-w-0">
        {/* Decoupled Polaroid Header Badges + Upper Image Frame (hidden when card is collapsed) */}
        {!effectiveCollapsed && (
          <>
            <div
              data-testid="polaroid-badge-header"
              className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5 min-w-0"
            >
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                <span
                  style={monoStyle}
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.14em] font-semibold ${
                    outfit.owner === "shaq"
                      ? "bg-[#13382E] text-[#F6F1E7]"
                      : outfit.owner === "naana"
                      ? "bg-[#A8442A] text-[#FBF8F3]"
                      : "bg-[#1F1A16] text-[#F6F1E7]"
                  }`}
                >
                  {formatOwnerBadge(outfit.owner)}
                </span>

                <span
                  style={monoStyle}
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-[9px] uppercase tracking-[0.08em] sm:tracking-[0.12em] border font-semibold ${dressMeta.badgeClass}`}
                >
                  {dressMeta.shortBadge}
                </span>

                {onToggleInspiration ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleInspiration(outfit);
                    }}
                    title={
                      isInspo
                        ? "Tagged as Website Inspiration — click to mark as Owned Wardrobe"
                        : "Tagged as Owned Wardrobe — click to mark as Website Inspiration"
                    }
                    aria-label={`Toggle inspiration status for ${outfit.title} (currently ${
                      isInspo ? "Inspiration" : "Owned"
                    })`}
                    style={monoStyle}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[9px] uppercase tracking-[0.08em] sm:tracking-[0.12em] font-semibold border cursor-pointer transition-colors ${
                      isInspo
                        ? "bg-[#9E7B3B] text-[#FBF8F3] border-[#9E7B3B] hover:bg-[#82632C]"
                        : "bg-[#FBF8F3] text-[#13382E] border-[#13382E]/40 hover:bg-[#13382E] hover:text-[#F6F1E7]"
                    }`}
                  >
                    {isInspo ? "✦ Inspiration" : "✓ Owned"}
                  </button>
                ) : (
                  <span
                    style={monoStyle}
                    className={`px-2 py-0.5 rounded text-[10px] sm:text-[9px] uppercase tracking-[0.08em] sm:tracking-[0.12em] font-semibold border ${
                      isInspo
                        ? "bg-[#9E7B3B] text-[#FBF8F3] border-[#9E7B3B]"
                        : "bg-[#FBF8F3] text-[#13382E] border-[#13382E]/40"
                    }`}
                  >
                    {isInspo ? "✦ Inspiration" : "✓ Owned"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  style={monoStyle}
                  className="text-[11px] sm:text-[10px] uppercase tracking-[0.08em] text-[#5C5248] font-medium whitespace-nowrap"
                >
                  {outfit.garments.length}{" "}
                  {outfit.garments.length === 1 ? "Garment" : "Garments"}
                </span>
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  aria-expanded={!effectiveCollapsed}
                  aria-label={`Collapse outfit card for ${outfit.title}`}
                  style={monoStyle}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[9px] uppercase tracking-wider border border-[#1F1A16]/20 bg-[#EFE7D8]/60 hover:bg-[#1F1A16] text-[#5C5248] hover:text-[#F6F1E7] cursor-pointer transition-colors"
                >
                  Collapse &#9650;
                </button>
              </div>
            </div>

            <div
              data-testid="polaroid-collage-grid"
              data-tile-count={tileCount}
              className={`relative aspect-[4/3] bg-[#EFE7D8]/70 border border-[#1F1A16]/15 rounded-lg p-1.5 sm:p-2 overflow-hidden grid gap-1.5 sm:gap-2 ${getCollageGridClass(
                tileCount
              )}`}
            >
              {slots.map((g, idx) => (
                <PolaroidCollageTile
                  key={g?.id || `empty-${idx}`}
                  garment={g}
                  slotIndex={idx}
                  onExpandGarment={(item) => setExpandedGarment(item)}
                />
              ))}
            </div>

            {outfit.climateTag && (
              <div
                data-testid="polaroid-weather-strip"
                style={monoStyle}
                className="mt-2.5 px-2.5 py-1.5 rounded-md bg-[#EFE7D8]/90 border border-[#1F1A16]/12 text-[11px] sm:text-[10px] uppercase tracking-[0.06em] sm:tracking-[0.1em] text-[#1F1A16] font-semibold flex items-start gap-1.5 min-w-0"
              >
                <span aria-hidden="true" className="shrink-0">
                  &#127777;&#65039;
                </span>
                <span className="whitespace-normal break-words leading-snug min-w-0">
                  {outfit.climateTag}
                </span>
              </div>
            )}
          </>
        )}

        {/* Polaroid Lower Caption Area */}
        <div
          className={`${
            effectiveCollapsed ? "pt-0.5" : "pt-3"
          } px-0.5 space-y-2 min-w-0`}
        >
          {(effectiveCollapsed || assignedDayNumbers.length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                {effectiveCollapsed && (
                  <>
                    <span
                      style={monoStyle}
                      className={`px-1.5 py-0.5 rounded text-[11px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.14em] font-semibold ${
                        outfit.owner === "shaq"
                          ? "bg-[#13382E] text-[#F6F1E7]"
                          : outfit.owner === "naana"
                          ? "bg-[#A8442A] text-[#FBF8F3]"
                          : "bg-[#1F1A16] text-[#F6F1E7]"
                      }`}
                    >
                      {outfit.owner === "both" ? "Shared" : outfit.owner}
                    </span>
                    {onToggleInspiration ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleInspiration(outfit);
                        }}
                        aria-label={`Toggle inspiration status for ${outfit.title} (currently ${
                          isInspo ? "Inspiration" : "Owned"
                        })`}
                        style={monoStyle}
                        className={`inline-flex items-center px-2 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[9px] uppercase tracking-[0.08em] sm:tracking-[0.12em] font-semibold border cursor-pointer ${
                          isInspo
                            ? "bg-[#9E7B3B] text-[#FBF8F3] border-[#9E7B3B]"
                            : "bg-[#FBF8F3] text-[#13382E] border-[#13382E]/40"
                        }`}
                      >
                        {isInspo ? "✦ Inspo" : "✓ Owned"}
                      </button>
                    ) : (
                      <span
                        style={monoStyle}
                        className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[9px] uppercase tracking-[0.08em] sm:tracking-[0.12em] font-semibold border ${
                          isInspo
                            ? "bg-[#9E7B3B] text-[#FBF8F3] border-[#9E7B3B]"
                            : "bg-[#FBF8F3] text-[#13382E] border-[#13382E]/40"
                        }`}
                      >
                        {isInspo ? "✦ Inspo" : "✓ Owned"}
                      </span>
                    )}
                    <span
                      style={monoStyle}
                      className={`text-[10px] sm:text-[9px] uppercase tracking-[0.08em] sm:tracking-[0.12em] px-2 py-0.5 rounded border font-semibold ${dressMeta.badgeClass}`}
                    >
                      {dressMeta.shortBadge}
                    </span>
                  </>
                )}

                {assignedDayNumbers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {assignedDayNumbers.map((dNum) =>
                      onAssignToDay ? (
                        <button
                          key={dNum}
                          type="button"
                          onClick={() => onAssignToDay(dNum, null)}
                          title={`Click to unassign Day ${formatDayNumber(dNum)}`}
                          aria-label={`Unassign ${outfit.title} from Day ${formatDayNumber(
                            dNum
                          )}`}
                          style={monoStyle}
                          className="px-2 py-0.5 rounded bg-[#13382E]/10 hover:bg-[#A8442A]/15 text-[#13382E] hover:text-[#A8442A] border border-[#13382E]/30 hover:border-[#A8442A]/40 text-[10px] sm:text-[9px] uppercase tracking-wider font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>D{formatDayNumber(dNum)}</span>
                          <span aria-hidden="true">&#10005;</span>
                        </button>
                      ) : (
                        <span
                          key={dNum}
                          style={monoStyle}
                          className="px-1.5 py-0.5 rounded bg-[#13382E]/10 text-[#13382E] border border-[#13382E]/30 text-[10px] sm:text-[9px] uppercase tracking-wider font-semibold"
                        >
                          D{formatDayNumber(dNum)}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              {effectiveCollapsed && (
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  aria-expanded={!effectiveCollapsed}
                  aria-label={`Expand outfit card for ${outfit.title}`}
                  style={monoStyle}
                  className="min-h-11 sm:min-h-0 inline-flex items-center px-2.5 sm:px-2 py-1 sm:py-0.5 rounded text-[11px] sm:text-[9px] uppercase tracking-wider border border-[#1F1A16]/20 bg-[#EFE7D8]/60 hover:bg-[#1F1A16] text-[#5C5248] hover:text-[#F6F1E7] cursor-pointer transition-colors"
                >
                  Expand &#9660;
                </button>
              )}
            </div>
          )}

          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <h4
              style={serifStyle}
              className={`${
                effectiveCollapsed ? "text-lg" : "text-xl"
              } font-semibold text-[#1F1A16] leading-snug break-words min-w-0`}
            >
              {outfit.title}
            </h4>
            {effectiveCollapsed && (
              <span
                style={monoStyle}
                className="text-[11px] sm:text-[9px] uppercase tracking-wider text-[#8A7E71] shrink-0"
              >
                {outfit.garments.length}{" "}
                {outfit.garments.length === 1 ? "piece" : "pieces"}
              </span>
            )}
          </div>

          {!effectiveCollapsed && (
            <>
              {outfit.notes && !compact && (
                <p className="text-xs text-[#5C5248] leading-relaxed break-words">
                  {outfit.notes}
                </p>
              )}

              {/* Collapsible Garment URLs List */}
              {outfit.garments.length > 0 && (
                <div className="pt-2 border-t border-[#1F1A16]/10 space-y-1.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsLinksExpanded((prev) => !prev)}
                    aria-expanded={isLinksExpanded}
                    style={monoStyle}
                    className="w-full min-h-11 sm:min-h-0 flex items-center justify-between text-[11px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#8A7E71] hover:text-[#1F1A16] cursor-pointer py-1 sm:py-0.5 transition-colors"
                  >
                    <span>GARMENT LINKS ({outfit.garments.length})</span>
                    <span className="text-[11px] sm:text-[8px] tracking-wider text-[#5C5248]">
                      {isLinksExpanded ? "Hide ▲" : "Show ▼"}
                    </span>
                  </button>
                  {isLinksExpanded && (
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {outfit.garments.map((g) => (
                        <a
                          key={g.id}
                          href={g.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={monoStyle}
                          className="max-w-full min-w-0 overflow-hidden min-h-11 sm:min-h-0 px-2.5 sm:px-2 py-1.5 sm:py-1 rounded bg-[#EFE7D8]/70 hover:bg-[#EFE7D8] border border-[#1F1A16]/15 hover:border-[#13382E] text-[11px] sm:text-[10px] text-[#1F1A16] hover:text-[#13382E] inline-flex items-center gap-1 transition-colors"
                          title={`${g.label} (${extractSourceDomain(g.url)})`}
                        >
                          <span className="truncate min-w-0 flex-1">
                            {g.label}
                          </span>
                          <span className="text-[#A8442A] font-semibold shrink-0">
                            [{extractSourceDomain(g.url)}]
                          </span>
                          <ExternalArrow />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Polaroid Footer Actions (shown when expanded, or compact assign button when collapsed in drawer) */}
      {!effectiveCollapsed ? (
        <div className="pt-3 mt-3 border-t border-[#1F1A16]/12 px-0.5 flex items-center justify-between gap-2 min-w-0">
          {onSelectOutfit ? (
            <div className="w-full flex flex-wrap items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => onSelectOutfit(outfit.id)}
                style={monoStyle}
                className={`flex-1 min-w-0 min-h-11 sm:min-h-0 py-2 px-2.5 rounded text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.15em] font-semibold border cursor-pointer transition-colors ${
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
                  className="min-h-11 sm:min-h-0 px-2.5 py-2 rounded text-[11px] sm:text-[10px] uppercase tracking-wider text-[#5C5248] hover:text-[#13382E] border border-[#1F1A16]/20 hover:border-[#13382E] bg-[#FBF8F3] cursor-pointer shrink-0"
                  aria-label={`Edit look ${outfit.title}`}
                >
                  Edit
                </button>
              )}
              {onRemoveCustomOutfit && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={monoStyle}
                  className="min-h-11 sm:min-h-0 px-2.5 py-2 rounded text-[11px] sm:text-[10px] uppercase tracking-wider text-[#8A7E71] hover:text-[#A8442A] border border-[#1F1A16]/15 hover:border-[#A8442A]/40 bg-[#FBF8F3] cursor-pointer shrink-0"
                  aria-label={`Delete look ${outfit.title}`}
                >
                  Delete &#10005;
                </button>
              )}
            </div>
          ) : (
            <div className="w-full flex items-center gap-2 min-w-0">
              {onAssignToDay && (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <label
                    htmlFor={`assign-day-${outfit.id}`}
                    style={monoStyle}
                    className="sr-only"
                  >
                    ASSIGN TO DAY:
                  </label>
                  <select
                    id={`assign-day-${outfit.id}`}
                    value=""
                    onChange={(e) => {
                      if (e.target.value !== "") {
                        const dayNum = Number(e.target.value);
                        const isAlreadyAssigned =
                          assignedDayNumbers.includes(dayNum);
                        onAssignToDay(
                          dayNum,
                          isAlreadyAssigned ? null : outfit.id
                        );
                      }
                    }}
                    style={monoStyle}
                    className="w-full min-w-0 rounded-lg bg-[#EFE7D8]/80 border border-[#1F1A16]/20 px-2.5 py-2 min-h-11 text-base sm:text-sm text-[#1F1A16] cursor-pointer truncate"
                  >
                    <option value="">{assignedDaySummaryLabel}</option>
                    {TRIP_DAYS.map((d) => {
                      const isAssigned = assignedDayNumbers.includes(
                        d.dayNumber
                      );
                      return (
                        <option key={d.dayNumber} value={d.dayNumber}>
                          {isAssigned ? "✓ " : ""}D
                          {formatDayNumber(d.dayNumber)} • {d.shortDate} (
                          {d.phase.toUpperCase()})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowActionsSheet(true)}
                aria-label={`More actions for ${outfit.title}`}
                aria-expanded={showActionsSheet}
                style={monoStyle}
                className="min-h-11 min-w-11 shrink-0 rounded-lg border border-[#1F1A16]/25 bg-[#FBF8F3] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] inline-flex items-center justify-center text-base tracking-widest cursor-pointer transition-colors"
              >
                &#8943;
              </button>
            </div>
          )}
        </div>
      ) : (
        onSelectOutfit && (
          <div className="pt-2 mt-2 border-t border-[#1F1A16]/10 px-0.5 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onSelectOutfit(outfit.id)}
              style={monoStyle}
              className={`min-h-11 sm:min-h-0 px-3 py-1 rounded text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] font-semibold border cursor-pointer transition-colors ${
                isSelected
                  ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                  : "bg-[#EFE7D8] hover:bg-[#1F1A16] text-[#1F1A16] hover:text-[#F6F1E7] border-[#1F1A16]/25"
              }`}
            >
              {isSelected ? "✓ Assigned" : "Assign Look"}
            </button>
          </div>
        )
      )}

      <OutfitActionsSheetModal
        outfit={outfit}
        isOpen={showActionsSheet}
        isInspo={isInspo}
        isPackedInTrunk={isPackedInTrunk}
        effectiveCollapsed={effectiveCollapsed}
        onClose={() => setShowActionsSheet(false)}
        onPackOutfitGarments={onPackOutfitGarments}
        onEditOutfit={onEditOutfit}
        onToggleInspiration={onToggleInspiration}
        onToggleCollapse={handleToggleCollapse}
        onRequestDelete={
          onRemoveCustomOutfit ? () => setShowDeleteConfirm(true) : undefined
        }
      />

      <GarmentLightboxModal
        isOpen={Boolean(expandedGarment)}
        garment={expandedGarment}
        outfitTitle={outfit.title}
        allGarments={outfit.garments}
        onSelectGarment={(nextGarment) => setExpandedGarment(nextGarment)}
        onClose={() => setExpandedGarment(null)}
      />

      <DeleteOutfitConfirmModal
        isOpen={showDeleteConfirm}
        outfit={outfit}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onRemoveCustomOutfit?.(outfit.id);
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </article>
  );
}
