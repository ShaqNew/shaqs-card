import React, { useState, useEffect, useRef } from "react";
import {
  DressCodeProfile,
  GarmentLink,
  WardrobeOutfit,
} from "@/lib/thailandTripData";
import { serifStyle, monoStyle } from "../styles";
import {
  DRESS_CODE_METADATA,
  extractSourceDomain,
} from "../utils/wardrobe";
import { PolaroidCollageTile } from "./PolaroidOutfitCard";

interface CreateLookModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingOutfit?: WardrobeOutfit | null;
  onCreateOutfit: (outfitData: Omit<WardrobeOutfit, "id">) => void;
  onUpdateOutfit?: (
    outfitId: string,
    updates: Omit<WardrobeOutfit, "id">
  ) => void;
}

export function CreateLookModal({
  isOpen,
  onClose,
  editingOutfit = null,
  onCreateOutfit,
  onUpdateOutfit,
}: CreateLookModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState<WardrobeOutfit["owner"]>("both");
  const [dressCode, setDressCode] = useState<DressCodeProfile>("temple");
  const [climateTag, setClimateTag] = useState(
    DRESS_CODE_METADATA.temple.defaultClimateTag
  );
  const [notes, setNotes] = useState("");
  const [garments, setGarments] = useState<GarmentLink[]>([]);

  // Dynamic URL drop zone state
  const [urlInput, setUrlInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [categoryInput, setCategoryInput] =
    useState<NonNullable<GarmentLink["category"]>>("Top");
  const [manualImageInput, setManualImageInput] = useState("");
  const [editingGarmentId, setEditingGarmentId] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync form fields when opening in Create vs Edit mode
  useEffect(() => {
    if (!isOpen) return;
    if (editingOutfit) {
      setTitle(editingOutfit.title);
      setOwner(editingOutfit.owner);
      setDressCode(editingOutfit.dressCode);
      setClimateTag(editingOutfit.climateTag);
      setNotes(editingOutfit.notes || "");
      setGarments(editingOutfit.garments || []);
    } else {
      setTitle("");
      setOwner("both");
      setDressCode("temple");
      setClimateTag(DRESS_CODE_METADATA.temple.defaultClimateTag);
      setNotes("");
      setGarments([]);
    }
    setUrlInput("");
    setLabelInput("");
    setCategoryInput("Top");
    setManualImageInput("");
    setEditingGarmentId(null);
    setScrapeStatus(null);
  }, [isOpen, editingOutfit]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }
      }
    } else if (dialog.open) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
  }, [isOpen]);

  const handleDressCodeChange = (nextCode: DressCodeProfile) => {
    const prevDefault = DRESS_CODE_METADATA[dressCode].defaultClimateTag;
    setDressCode(nextCode);
    if (!climateTag || climateTag === prevDefault) {
      setClimateTag(DRESS_CODE_METADATA[nextCode].defaultClimateTag);
    }
  };

  const scrapeAndAddGarmentUrl = async (
    rawUrl: string,
    customLabel?: string
  ) => {
    const trimmedUrl = rawUrl.trim();
    if (!trimmedUrl) return;

    setIsScraping(true);
    setScrapeStatus("Fetching OpenGraph thumbnail via /api/link-preview...");

    let resolvedTitle = customLabel?.trim() || "";
    let resolvedImage: string | undefined =
      manualImageInput.trim() || undefined;
    let resolvedSite = extractSourceDomain(trimmedUrl);

    try {
      if (typeof fetch !== "undefined") {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(trimmedUrl)}`
        );
        if (res.ok) {
          const data = (await res.json()) as {
            title?: string | null;
            imageUrl?: string | null;
            siteName?: string | null;
          };
          if (!resolvedTitle && data.title) {
            resolvedTitle = data.title;
          }
          if (!resolvedImage && data.imageUrl) {
            resolvedImage = data.imageUrl;
          }
          if (data.siteName) {
            resolvedSite = data.siteName;
          }
        }
      }
    } catch {
      // Fallback to local URL inference if offline
    }

    const finalLabel =
      resolvedTitle || `${resolvedSite} ${categoryInput} Piece`;

    if (editingGarmentId) {
      setGarments((prev) =>
        prev.map((g) =>
          g.id === editingGarmentId
            ? {
                ...g,
                label: finalLabel,
                url: trimmedUrl,
                imageUrl: resolvedImage || g.imageUrl,
                category: categoryInput,
              }
            : g
        )
      );
      setEditingGarmentId(null);
      setScrapeStatus(`Updated “${finalLabel}”.`);
    } else {
      const newGarment: GarmentLink = {
        id: `garment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: finalLabel,
        url: trimmedUrl,
        imageUrl: resolvedImage,
        category: categoryInput,
      };
      setGarments((prev) => [...prev, newGarment]);
      setScrapeStatus(
        resolvedImage
          ? `Added “${finalLabel}” with OpenGraph thumbnail.`
          : `Added “${finalLabel}” (${resolvedSite} editorial tile).`
      );
    }

    setUrlInput("");
    setLabelInput("");
    setManualImageInput("");
    setIsScraping(false);
  };

  const handleStartEditGarment = (garment: GarmentLink) => {
    setEditingGarmentId(garment.id);
    setUrlInput(garment.url);
    setLabelInput(garment.label);
    setCategoryInput(garment.category || "Top");
    setManualImageInput(garment.imageUrl || "");
    setScrapeStatus(`Editing “${garment.label}” — update fields and click Save Piece.`);
  };

  const handleDropZoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedUrl =
      e.dataTransfer.getData("text/uri-list") ||
      e.dataTransfer.getData("text/plain");
    if (droppedUrl && /^https?:\/\//i.test(droppedUrl.trim())) {
      setUrlInput(droppedUrl.trim());
      scrapeAndAddGarmentUrl(droppedUrl.trim(), labelInput);
    }
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted && /^https?:\/\//i.test(pasted.trim()) && !urlInput) {
      e.preventDefault();
      const clean = pasted.trim();
      setUrlInput(clean);
      scrapeAndAddGarmentUrl(clean, labelInput);
    }
  };

  const handleRemoveGarment = (garmentId: string) => {
    setGarments((prev) => prev.filter((g) => g.id !== garmentId));
    if (editingGarmentId === garmentId) {
      setEditingGarmentId(null);
      setUrlInput("");
      setLabelInput("");
      setManualImageInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalGarments = [...garments];
    if (urlInput.trim() && /^https?:\/\//i.test(urlInput.trim())) {
      const pendingLabel =
        labelInput.trim() ||
        `${extractSourceDomain(urlInput.trim())} ${categoryInput}`;
      if (editingGarmentId) {
        finalGarments = finalGarments.map((g) =>
          g.id === editingGarmentId
            ? {
                ...g,
                label: pendingLabel,
                url: urlInput.trim(),
                imageUrl: manualImageInput.trim() || g.imageUrl,
                category: categoryInput,
              }
            : g
        );
      } else {
        finalGarments.push({
          id: `garment-${Date.now()}`,
          label: pendingLabel,
          url: urlInput.trim(),
          imageUrl: manualImageInput.trim() || undefined,
          category: categoryInput,
        });
      }
    }

    const payload: Omit<WardrobeOutfit, "id"> = {
      title: title.trim(),
      owner,
      dressCode,
      climateTag:
        climateTag.trim() || DRESS_CODE_METADATA[dressCode].defaultClimateTag,
      notes: notes.trim() || undefined,
      garments: finalGarments,
      isDefault: editingOutfit?.isDefault,
    };

    if (editingOutfit && onUpdateOutfit) {
      onUpdateOutfit(editingOutfit.id, payload);
    } else {
      onCreateOutfit(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = Boolean(editingOutfit);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="create-look-modal-title"
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto bg-[#FBF8F3] text-[#1F1A16] border-2 border-[#1F1A16] max-w-3xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl backdrop:bg-[#1F1A16]/80 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#1F1A16]/20 pb-4">
          <div>
            <span
              style={monoStyle}
              className="text-[10px] uppercase tracking-[0.2em] text-[#A8442A] font-semibold block"
            >
              DIGITAL WARDROBE ATELIER &bull; STEP IV LOOKBOOK
            </span>
            <h2
              id="create-look-modal-title"
              style={serifStyle}
              className="text-2xl sm:text-3xl font-normal text-[#1F1A16] mt-0.5"
            >
              {isEditMode
                ? "Edit Look & Garment Collage"
                : "Create Look & Garment Collage"}
            </h2>
            <p className="text-xs text-[#5C5248] mt-1">
              {isEditMode
                ? "Refine this look's title, dress code, climate tag, or swap and update garment links."
                : "Curate a lightweight outfit from Pinterest, ASOS, or boutique URLs to assign across days and activities."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={monoStyle}
            className="px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0"
          >
            Close &#10005;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Look Details & Dynamic URL Drop Zone */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label
                  htmlFor="look-title-input"
                  style={monoStyle}
                  className="block text-[10px] uppercase tracking-[0.16em] text-[#5C5248] mb-1"
                >
                  LOOK TITLE *
                </label>
                <input
                  id="look-title-input"
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wat Arun Sunrise Linen or Catch Beach Club Sunset"
                  className="w-full bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-sm text-[#1F1A16]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="look-owner-select"
                    style={monoStyle}
                    className="block text-[10px] uppercase tracking-[0.16em] text-[#5C5248] mb-1"
                  >
                    CURATED FOR
                  </label>
                  <select
                    id="look-owner-select"
                    value={owner}
                    onChange={(e) =>
                      setOwner(e.target.value as WardrobeOutfit["owner"])
                    }
                    className="w-full bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-xs text-[#1F1A16]"
                  >
                    <option value="both">Shared Look (Shaq &amp; Naana)</option>
                    <option value="naana">Naana</option>
                    <option value="shaq">Shaq</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="look-dresscode-select"
                    style={monoStyle}
                    className="block text-[10px] uppercase tracking-[0.16em] text-[#5C5248] mb-1"
                  >
                    DRESS CODE PROFILE
                  </label>
                  <select
                    id="look-dresscode-select"
                    value={dressCode}
                    onChange={(e) =>
                      handleDressCodeChange(e.target.value as DressCodeProfile)
                    }
                    className="w-full bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-xs text-[#1F1A16]"
                  >
                    <option value="temple">
                      Temple &amp; Royal Heritage (Covered)
                    </option>
                    <option value="rooftop">
                      Rooftop &amp; Fine Dining (Smart Casual)
                    </option>
                    <option value="daytime">
                      Daytime City &amp; Promenade
                    </option>
                    <option value="beach">
                      Phuket Resort &amp; Beach Club
                    </option>
                    <option value="transit">
                      Aviation &amp; Cabin Transit
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="look-climate-input"
                    style={monoStyle}
                    className="block text-[10px] uppercase tracking-[0.16em] text-[#5C5248] mb-1"
                  >
                    CLIMATE &amp; SETTING TAG
                  </label>
                  <input
                    id="look-climate-input"
                    type="text"
                    value={climateTag}
                    onChange={(e) => setClimateTag(e.target.value)}
                    placeholder="e.g. 33°C Sacred Heritage"
                    className="w-full bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-xs text-[#1F1A16]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="look-notes-input"
                    style={monoStyle}
                    className="block text-[10px] uppercase tracking-[0.16em] text-[#5C5248] mb-1"
                  >
                    STYLING NOTE (OPTIONAL)
                  </label>
                  <input
                    id="look-notes-input"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Accessories, footwear, or sarong reminder..."
                    className="w-full bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-xs text-[#1F1A16]"
                  />
                </div>
              </div>

              {/* Dynamic URL Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDropZoneDrop}
                className={`p-4 border-2 border-dashed transition-colors space-y-3 ${
                  isDragOver
                    ? "border-[#13382E] bg-[#13382E]/10"
                    : "border-[#1F1A16]/30 bg-[#EFE7D8]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={monoStyle}
                    className="text-[10px] uppercase tracking-[0.16em] text-[#13382E] font-semibold"
                  >
                    {editingGarmentId
                      ? "EDITING SELECTED GARMENT LINK"
                      : "DYNAMIC GARMENT URL DROP ZONE (PINTEREST / ASOS / BOUTIQUE)"}
                  </span>
                  <span
                    style={monoStyle}
                    className="text-[10px] text-[#5C5248]"
                  >
                    {garments.length}/4 Collage Slots
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="url"
                    aria-label="Garment URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onPaste={handleUrlPaste}
                    placeholder="Paste or drop garment link (https://www.asos.com/... or Pinterest URL)..."
                    className="sm:col-span-8 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-xs text-[#1F1A16]"
                  />
                  <select
                    aria-label="Garment Category"
                    value={categoryInput}
                    onChange={(e) =>
                      setCategoryInput(
                        e.target.value as NonNullable<GarmentLink["category"]>
                      )
                    }
                    className="sm:col-span-4 bg-[#FBF8F3] border border-[#1F1A16]/25 px-2.5 py-2 text-xs text-[#1F1A16]"
                  >
                    <option value="Top">Top / Shirt</option>
                    <option value="Bottom">Bottom / Trousers</option>
                    <option value="One-Piece / Dress">Dress / Jumpsuit</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessory">Accessory / Swim</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    aria-label="Garment Label"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="Piece name (optional — auto-scraped from link if blank)"
                    className="sm:col-span-8 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-1.5 text-xs text-[#1F1A16]"
                  />
                  <button
                    type="button"
                    disabled={!urlInput.trim() || isScraping}
                    onClick={() =>
                      scrapeAndAddGarmentUrl(urlInput, labelInput)
                    }
                    style={monoStyle}
                    className="sm:col-span-4 bg-[#A8442A] hover:bg-[#8F351E] disabled:opacity-45 text-[#FBF8F3] text-[10px] uppercase tracking-[0.14em] font-semibold py-2 px-3 cursor-pointer"
                  >
                    {isScraping
                      ? "Scraping..."
                      : editingGarmentId
                      ? "Save Piece"
                      : "+ Add Garment Link"}
                  </button>
                </div>

                {scrapeStatus && (
                  <p
                    style={monoStyle}
                    className="text-[10px] text-[#13382E] pt-0.5"
                  >
                    {scrapeStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Live Polaroid Split-Grid Collage Preview */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-[#EFE7D8]/50 border border-[#1F1A16]/15 p-4 space-y-3">
              <div>
                <span
                  style={monoStyle}
                  className="text-[10px] uppercase tracking-[0.16em] text-[#8A7E71] block mb-2"
                >
                  POLAROID SPLIT-GRID PREVIEW
                </span>
                <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-2.5 pb-3 shadow-sm space-y-2.5">
                  <div className="aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-0.5 bg-[#1F1A16]/10 border border-[#1F1A16]/15 overflow-hidden">
                    {[0, 1, 2, 3].map((slotIdx) => (
                      <PolaroidCollageTile
                        key={garments[slotIdx]?.id || `preview-slot-${slotIdx}`}
                        garment={garments[slotIdx]}
                        slotIndex={slotIdx}
                      />
                    ))}
                  </div>
                  <div className="px-1">
                    <div
                      style={monoStyle}
                      className="text-[9px] uppercase tracking-wider text-[#A8442A]"
                    >
                      {climateTag ||
                        DRESS_CODE_METADATA[dressCode].defaultClimateTag}
                    </div>
                    <div
                      style={serifStyle}
                      className="text-lg font-semibold text-[#1F1A16] truncate"
                    >
                      {title.trim() || "Untitled Thailand Look"}
                    </div>
                  </div>
                </div>
              </div>

              {garments.length > 0 && (
                <div className="space-y-1.5">
                  <span
                    style={monoStyle}
                    className="text-[9px] uppercase tracking-wider text-[#5C5248]"
                  >
                    ADDED GARMENTS ({garments.length})
                  </span>
                  <div className="max-h-32 overflow-y-auto divide-y divide-[#1F1A16]/10 bg-[#FBF8F3] border border-[#1F1A16]/15 px-2.5 py-1">
                    {garments.map((g) => (
                      <div
                        key={g.id}
                        className="py-1.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate text-[#1F1A16] font-medium">
                          {g.label}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditGarment(g)}
                            style={monoStyle}
                            className="text-[9px] uppercase tracking-wider text-[#5C5248] hover:text-[#13382E] underline cursor-pointer"
                            aria-label={`Edit garment ${g.label}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGarment(g.id)}
                            className="text-[#8A7E71] hover:text-[#A8442A] text-xs cursor-pointer"
                            aria-label={`Remove garment ${g.label}`}
                          >
                            &#10005;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F1A16]/15">
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              className="px-4 py-2.5 border border-[#1F1A16]/25 text-xs uppercase tracking-wider text-[#5C5248] hover:text-[#1F1A16] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={monoStyle}
              className="px-6 py-2.5 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.16em] font-semibold cursor-pointer"
            >
              {isEditMode ? "Save Look Changes" : "Save Look to Wardrobe"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
