import React, { useState, useEffect } from "react";
import {
  DressCodeProfile,
  GarmentLink,
  WardrobeOutfit,
} from "@/lib/thailandTripData";
import { serifStyle, monoStyle } from "../styles";
import { useBottomSheetDialog } from "../hooks/useBottomSheetDialog";
import {
  DRESS_CODE_METADATA,
  extractAsosProductMeta,
  extractSourceDomain,
  isGooglePhotosUrl,
  isInspirationOutfit,
  isPrivateGooglePhotosUrl,
  getCollageTileCount,
  getCollageGridClass,
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
  const { dialogRef, handleDialogClose } = useBottomSheetDialog({
    open: isOpen,
    onClose,
    desktopMode: "modal",
    lightDismiss: true,
  });

  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState<WardrobeOutfit["owner"]>("both");
  const [dressCode, setDressCode] = useState<DressCodeProfile>("temple");
  const [climateTag, setClimateTag] = useState(
    DRESS_CODE_METADATA.temple.defaultClimateTag
  );
  const [notes, setNotes] = useState("");
  const [garments, setGarments] = useState<GarmentLink[]>([]);
  const [isInspiration, setIsInspiration] = useState(false);
  const [hasUserToggledInspo, setHasUserToggledInspo] = useState(false);

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
    let cancelled = false;
    if (editingOutfit) {
      setTitle(editingOutfit.title);
      setOwner(editingOutfit.owner);
      setDressCode(editingOutfit.dressCode);
      setClimateTag(editingOutfit.climateTag);
      setNotes(editingOutfit.notes || "");
      const initialGarments = editingOutfit.garments || [];
      setGarments(initialGarments);
      setIsInspiration(isInspirationOutfit(editingOutfit));
      setHasUserToggledInspo(true);

      // Auto-backfill missing thumbnails for direct links (e.g. Google Photos share links)
      if (typeof fetch !== "undefined") {
        initialGarments.forEach((g) => {
          if (
            !g.imageUrl &&
            /^https?:\/\//i.test(g.url) &&
            !/\/search\b/i.test(g.url)
          ) {
            fetch(`/api/link-preview?url=${encodeURIComponent(g.url)}`)
              .then((res) => (res.ok ? res.json() : null))
              .then((data: { imageUrl?: string | null } | null) => {
                if (!cancelled && data?.imageUrl) {
                  setGarments((prev) =>
                    prev.map((item) =>
                      item.id === g.id && !item.imageUrl
                        ? { ...item, imageUrl: data.imageUrl! }
                        : item
                    )
                  );
                }
              })
              .catch(() => {
                // Ignore offline errors
              });
          }
        });
      }
    } else {
      setTitle("");
      setOwner("both");
      setDressCode("temple");
      setClimateTag(DRESS_CODE_METADATA.temple.defaultClimateTag);
      setNotes("");
      setGarments([]);
      setIsInspiration(false);
      setHasUserToggledInspo(false);
    }
    setUrlInput("");
    setLabelInput("");
    setCategoryInput("Top");
    setManualImageInput("");
    setEditingGarmentId(null);
    setScrapeStatus(null);
    return () => {
      cancelled = true;
    };
  }, [isOpen, editingOutfit]);

  const readAndDownscalePhoto = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.onload = () => {
        const rawDataUrl = typeof reader.result === "string" ? reader.result : "";
        if (!rawDataUrl) {
          reject(new Error("Empty image data"));
          return;
        }
        const isJsdom =
          typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent);
        if (isJsdom || typeof Image === "undefined") {
          resolve(rawDataUrl);
          return;
        }
        let settled = false;
        const finish = (url: string) => {
          if (!settled) {
            settled = true;
            resolve(url);
          }
        };
        const fallbackTimer = setTimeout(() => finish(rawDataUrl), 250);
        const img = new Image();
        img.onload = () => {
          clearTimeout(fallbackTimer);
          try {
            const maxDim = 720;
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            if (!w || !h) {
              finish(rawDataUrl);
              return;
            }
            const scale = Math.min(1, maxDim / Math.max(w, h));
            const targetW = Math.max(1, Math.round(w * scale));
            const targetH = Math.max(1, Math.round(h * scale));
            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              finish(rawDataUrl);
              return;
            }
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const compressed = canvas.toDataURL("image/webp", 0.85);
            finish(
              compressed && compressed.startsWith("data:image/")
                ? compressed
                : rawDataUrl
            );
          } catch {
            finish(rawDataUrl);
          }
        };
        img.onerror = () => {
          clearTimeout(fallbackTimer);
          finish(rawDataUrl);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });

  const handlePieceChange = (
    pieceId: string,
    field: keyof GarmentLink,
    value: string
  ) => {
    setGarments((prev) =>
      prev.map((g) => (g.id === pieceId ? { ...g, [field]: value } : g))
    );
  };

  const handleLocalPhotoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetPieceId?: string
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await readAndDownscalePhoto(file);
      const cleanName =
        file.name.replace(/\.[^.]+$/, "").trim() || `${categoryInput} Photo`;
      if (targetPieceId) {
        handlePieceChange(targetPieceId, "imageUrl", dataUrl);
        setScrapeStatus(`Uploaded photo for garment piece.`);
      } else if (editingGarmentId) {
        handlePieceChange(editingGarmentId, "imageUrl", dataUrl);
        setManualImageInput(dataUrl);
        setScrapeStatus(`Updated piece photo from device.`);
      } else {
        const pieceLabel = labelInput.trim() || cleanName;
        const newGarment: GarmentLink = {
          id: `garment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label: pieceLabel,
          url: urlInput.trim() || "#local-photo",
          imageUrl: dataUrl,
          category: categoryInput,
        };
        setGarments((prev) => [...prev, newGarment]);
        setUrlInput("");
        setLabelInput("");
        setManualImageInput("");
        setScrapeStatus(`Added “${pieceLabel}” from local photo.`);
      }
    } catch {
      setScrapeStatus("Could not read selected photo file.");
    }
  };

  const handleDressCodeChange = (nextCode: DressCodeProfile) => {
    const prevDefault = DRESS_CODE_METADATA[dressCode].defaultClimateTag;
    setDressCode(nextCode);
    if (!climateTag || climateTag === prevDefault) {
      setClimateTag(DRESS_CODE_METADATA[nextCode].defaultClimateTag);
    }
  };

  const fetchLinkPreviewMetadata = async (targetUrl: string) => {
    const asosMeta = extractAsosProductMeta(targetUrl);
    let scrapedTitle: string | null = asosMeta?.title || null;
    let scrapedImage: string | undefined = asosMeta?.primaryImageUrl;
    let scrapedSite = extractSourceDomain(targetUrl);
    let scrapeWarning: string | null = null;

    try {
      if (typeof fetch !== "undefined") {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(targetUrl)}`
        );
        if (res.ok) {
          const data = (await res.json()) as {
            title?: string | null;
            imageUrl?: string | null;
            siteName?: string | null;
            warning?: string | null;
          };
          if (data.title) {
            scrapedTitle = data.title;
          }
          if (data.imageUrl) {
            scrapedImage = data.imageUrl;
          }
          if (data.siteName) {
            scrapedSite = data.siteName;
          }
          if (data.warning) {
            scrapeWarning = data.warning;
          }
        }
      }
    } catch {
      // Fallback to local URL inference if offline
    }

    return { scrapedTitle, scrapedImage, scrapedSite, scrapeWarning };
  };

  const scrapeAndAddGarmentUrl = async (
    rawUrl: string,
    customLabel?: string
  ) => {
    const trimmedUrl = rawUrl.trim();
    if (!trimmedUrl) return;

    setIsScraping(true);
    setScrapeStatus("Fetching OpenGraph thumbnail via /api/link-preview...");

    const { scrapedTitle, scrapedImage, scrapedSite, scrapeWarning } =
      await fetchLinkPreviewMetadata(trimmedUrl);

    const resolvedTitle = customLabel?.trim() || scrapedTitle || "";
    const resolvedImage = manualImageInput.trim() || scrapedImage;
    const finalLabel =
      resolvedTitle || `${scrapedSite} ${categoryInput} Piece`;

    if (editingGarmentId) {
      setGarments((prev) =>
        prev.map((g) =>
          g.id === editingGarmentId
            ? {
                ...g,
                label: finalLabel,
                url: trimmedUrl,
                imageUrl:
                  resolvedImage ||
                  (g.url === trimmedUrl ? g.imageUrl : undefined),
                category: categoryInput,
              }
            : g
        )
      );
      setEditingGarmentId(null);
      setScrapeStatus(scrapeWarning || `Updated “${finalLabel}”.`);
    } else {
      const newGarment: GarmentLink = {
        id: `garment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: finalLabel,
        url: trimmedUrl,
        imageUrl: resolvedImage,
        category: categoryInput,
      };
      setGarments((prev) => {
        const next = [...prev, newGarment];
        if (
          !hasUserToggledInspo &&
          next.length > 0 &&
          next.every((g) => !isGooglePhotosUrl(g.url))
        ) {
          setIsInspiration(true);
        }
        return next;
      });
      setScrapeStatus(
        scrapeWarning
          ? scrapeWarning
          : resolvedImage
          ? `Added “${finalLabel}” with OpenGraph thumbnail.`
          : `Added “${finalLabel}” (${scrapedSite} editorial tile).`
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
    setManualImageInput("");
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
    if (
      pasted &&
      /^https?:\/\//i.test(pasted.trim()) &&
      (!urlInput || editingGarmentId)
    ) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalGarments = [...garments];
    const pendingUrl = urlInput.trim();
    if (pendingUrl && /^https?:\/\//i.test(pendingUrl)) {
      setIsScraping(true);
      const { scrapedTitle, scrapedImage, scrapedSite } =
        await fetchLinkPreviewMetadata(pendingUrl);
      setIsScraping(false);

      const pendingLabel =
        labelInput.trim() ||
        scrapedTitle ||
        `${scrapedSite} ${categoryInput}`;
      const resolvedImg = manualImageInput.trim() || scrapedImage;

      if (editingGarmentId) {
        finalGarments = finalGarments.map((g) =>
          g.id === editingGarmentId
            ? {
                ...g,
                label: pendingLabel,
                url: pendingUrl,
                imageUrl:
                  resolvedImg ||
                  (g.url === pendingUrl ? g.imageUrl : undefined),
                category: categoryInput,
              }
            : g
        );
      } else {
        finalGarments.push({
          id: `garment-${Date.now()}`,
          label: pendingLabel,
          url: pendingUrl,
          imageUrl: resolvedImg,
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
      isInspiration,
    };

    if (editingOutfit && onUpdateOutfit) {
      onUpdateOutfit(editingOutfit.id, payload);
    } else {
      onCreateOutfit(payload);
    }

    onClose();
  };

  const isEditMode = Boolean(editingOutfit);

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-labelledby="create-look-modal-title"
      onClose={handleDialogClose}
      className="[&:not([open])]:hidden open:flex open:flex-col fixed inset-x-0 bottom-0 top-auto m-0 mt-auto w-full max-w-none max-h-[88dvh] rounded-t-2xl sm:inset-0 sm:m-auto sm:max-w-3xl sm:max-h-[90dvh] sm:rounded-none bg-[#FBF8F3] text-[#1F1A16] border-t-2 sm:border-2 border-[#1F1A16] p-0 shadow-2xl z-50 overflow-hidden overscroll-contain backdrop:bg-[#1F1A16]/80 backdrop:backdrop-blur-sm backdrop:overflow-hidden backdrop:overscroll-contain"
    >
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Mobile Drag Handle */}
          <div
            data-sheet-drag-handle="true"
            className="sm:hidden shrink-0 flex justify-center pt-2.5 pb-1 bg-[#FBF8F3]"
          >
            <span className="w-10 h-1 rounded-full bg-[#1F1A16]/25" />
          </div>

          {/* Sticky Modal Header */}
          <div className="shrink-0 p-4 sm:p-6 border-b border-[#1F1A16]/20 flex items-start justify-between gap-4 bg-[#FBF8F3]">
            <div>
              <span
                style={monoStyle}
                className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#A8442A] font-semibold block"
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
                  : "Curate a lightweight outfit from Pinterest, ASOS, or local photos to assign across days and activities."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={monoStyle}
              className="min-h-11 sm:min-h-0 px-3 py-1.5 bg-[#1F1A16] text-[#F6F1E7] text-xs uppercase tracking-wider cursor-pointer shrink-0"
            >
              Close &#10005;
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Look Details & Dynamic URL Drop Zone */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label
                  htmlFor="look-title-input"
                  style={monoStyle}
                  className="block text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5C5248] mb-1"
                >
                  LOOK TITLE *
                </label>
                <input
                  id="look-title-input"
                  type="text"
                  required
                  autoFocus
                  enterKeyHint="next"
                  autoComplete="off"
                  value={title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    setTitle(nextTitle);
                    if (
                      !hasUserToggledInspo &&
                      /\b(inspo|inspiration)\b/i.test(nextTitle)
                    ) {
                      setIsInspiration(true);
                    }
                  }}
                  placeholder="e.g. Wat Arun Sunrise Linen or Catch Beach Club Sunset"
                  className="w-full min-h-11 sm:min-h-0 bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                />
              </div>

              {/* Look Source Tag: Owned Wardrobe vs Website Inspiration */}
              <div>
                <span
                  style={monoStyle}
                  className="block text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5C5248] mb-1"
                >
                  WARDROBE TAG (OWNED VS. INSPIRATION)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInspiration(false);
                      setHasUserToggledInspo(true);
                    }}
                    style={monoStyle}
                    className={`min-h-11 sm:min-h-0 py-2 px-3 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border font-semibold cursor-pointer transition-colors ${
                      !isInspiration
                        ? "bg-[#13382E] text-[#F6F1E7] border-[#13382E]"
                        : "bg-[#F6F1E7] text-[#5C5248] border-[#1F1A16]/20 hover:border-[#13382E]"
                    }`}
                  >
                    &#10003; Owned Wardrobe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInspiration(true);
                      setHasUserToggledInspo(true);
                    }}
                    style={monoStyle}
                    className={`min-h-11 sm:min-h-0 py-2 px-3 text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] border font-semibold cursor-pointer transition-colors ${
                      isInspiration
                        ? "bg-[#9E7B3B] text-[#FBF8F3] border-[#9E7B3B]"
                        : "bg-[#F6F1E7] text-[#5C5248] border-[#1F1A16]/20 hover:border-[#9E7B3B]"
                    }`}
                  >
                    &#10022; Inspiration (Website)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="look-owner-select"
                    style={monoStyle}
                    className="block text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5C5248] mb-1"
                  >
                    CURATED FOR
                  </label>
                  <select
                    id="look-owner-select"
                    value={owner}
                    onChange={(e) =>
                      setOwner(e.target.value as WardrobeOutfit["owner"])
                    }
                    className="w-full min-h-11 sm:min-h-0 bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
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
                    className="block text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5C5248] mb-1"
                  >
                    DRESS CODE PROFILE
                  </label>
                  <select
                    id="look-dresscode-select"
                    value={dressCode}
                    onChange={(e) =>
                      handleDressCodeChange(e.target.value as DressCodeProfile)
                    }
                    className="w-full min-h-11 sm:min-h-0 bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
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
                    className="block text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5C5248] mb-1"
                  >
                    CLIMATE &amp; SETTING TAG
                  </label>
                  <input
                    id="look-climate-input"
                    type="text"
                    enterKeyHint="next"
                    autoComplete="off"
                    value={climateTag}
                    onChange={(e) => setClimateTag(e.target.value)}
                    placeholder="e.g. 33°C Sacred Heritage"
                    className="w-full min-h-11 sm:min-h-0 bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="look-notes-input"
                    style={monoStyle}
                    className="block text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5C5248] mb-1"
                  >
                    STYLING NOTE (OPTIONAL)
                  </label>
                  <input
                    id="look-notes-input"
                    type="text"
                    enterKeyHint="next"
                    autoComplete="off"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Accessories, footwear, or sarong reminder..."
                    className="w-full min-h-11 sm:min-h-0 bg-[#F6F1E7] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
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
                <div className="flex items-center justify-between gap-2">
                  <span
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#13382E] font-semibold"
                  >
                    {editingGarmentId
                      ? "EDITING SELECTED GARMENT LINK"
                      : "DYNAMIC GARMENT URL DROP ZONE (PINTEREST / ASOS / GOOGLE PHOTOS)"}
                  </span>
                  <span
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] text-[#5C5248] shrink-0"
                  >
                    {garments.length}/4 Collage Slots
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="url"
                    inputMode="url"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    autoComplete="off"
                    aria-label="Garment URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onPaste={handleUrlPaste}
                    placeholder="Paste garment or Google Photos share link (photos.app.goo.gl / ASOS / Pinterest)..."
                    className="sm:col-span-8 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/25 px-3 py-2 text-base sm:text-sm text-[#1F1A16]"
                  />
                  <select
                    aria-label="Garment Category"
                    value={categoryInput}
                    onChange={(e) =>
                      setCategoryInput(
                        e.target.value as NonNullable<GarmentLink["category"]>
                      )
                    }
                    className="sm:col-span-4 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/25 px-2.5 py-2 text-base sm:text-sm text-[#1F1A16]"
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
                    enterKeyHint="done"
                    autoComplete="off"
                    aria-label="Garment Label"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="Piece name (optional — auto-scraped from link if blank)"
                    className="sm:col-span-8 min-h-11 sm:min-h-0 bg-[#FBF8F3] border border-[#1F1A16]/20 px-3 py-1.5 text-base sm:text-sm text-[#1F1A16]"
                  />
                  <button
                    type="button"
                    disabled={!urlInput.trim() || isScraping}
                    onClick={() =>
                      scrapeAndAddGarmentUrl(urlInput, labelInput)
                    }
                    style={monoStyle}
                    className="sm:col-span-4 min-h-11 sm:min-h-0 bg-[#A8442A] hover:bg-[#8F351E] disabled:opacity-45 text-[#FBF8F3] text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] font-semibold py-2 px-3 cursor-pointer"
                  >
                    {isScraping
                      ? "Scraping..."
                      : editingGarmentId
                      ? "Save Piece"
                      : "+ Add Garment Link"}
                  </button>
                </div>

                {/* Local Device Photo Picker (Camera or Photo Picker without capture restriction) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1F1A16]/15">
                  <span
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] uppercase tracking-wider text-[#5C5248]"
                  >
                    OR UPLOAD GARMENT PHOTO FROM DEVICE:
                  </span>
                  <label
                    style={monoStyle}
                    className="min-h-11 sm:min-h-0 px-3 py-1.5 bg-[#FBF8F3] hover:bg-[#13382E] hover:text-[#F6F1E7] text-[#13382E] border border-[#13382E]/40 text-[11px] sm:text-[10px] uppercase tracking-wider font-semibold inline-flex items-center cursor-pointer transition-colors"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLocalPhotoSelected(e)}
                      className="sr-only"
                      aria-label="Upload local garment photo"
                    />
                    Upload Photo
                  </label>
                </div>

                {isPrivateGooglePhotosUrl(urlInput.trim()) && (
                  <p
                    role="alert"
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] text-[#A8442A] font-semibold pt-0.5"
                  >
                    &#9888; Private Google Photos URL detected. In Google Photos,
                    tap Share &rarr; Create link (photos.app.goo.gl) so the
                    thumbnail can load.
                  </p>
                )}

                {scrapeStatus && (
                  <p
                    style={monoStyle}
                    className="text-[11px] sm:text-[10px] text-[#13382E] pt-0.5"
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
                  className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#8A7E71] block mb-2"
                >
                  POLAROID SPLIT-GRID PREVIEW
                </span>
                <div className="bg-[#FBF8F3] border border-[#1F1A16]/20 p-2.5 pb-3 shadow-sm space-y-2.5">
                  <div
                    data-testid="polaroid-preview-grid"
                    data-tile-count={getCollageTileCount(garments.length)}
                    className={`aspect-[4/3] grid gap-0.5 bg-[#1F1A16]/10 border border-[#1F1A16]/15 overflow-hidden ${getCollageGridClass(
                      getCollageTileCount(garments.length)
                    )}`}
                  >
                    {Array.from(
                      { length: getCollageTileCount(garments.length) },
                      (_, slotIdx) => (
                        <PolaroidCollageTile
                          key={
                            garments[slotIdx]?.id || `preview-slot-${slotIdx}`
                          }
                          garment={garments[slotIdx]}
                          slotIndex={slotIdx}
                        />
                      )
                    )}
                  </div>
                  <div className="px-1">
                    <div
                      style={monoStyle}
                      className="text-[11px] sm:text-[9px] uppercase tracking-wider text-[#A8442A]"
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
                    className="text-[11px] sm:text-[9px] uppercase tracking-wider text-[#5C5248]"
                  >
                    ADDED GARMENTS ({garments.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto divide-y divide-[#1F1A16]/10 bg-[#FBF8F3] border border-[#1F1A16]/15 px-2.5 py-1">
                    {garments.map((g, idx) => (
                      <div
                        key={g.id}
                        className="py-1.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate text-[#1F1A16] font-medium">
                          {g.label}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label
                            style={monoStyle}
                            className="min-h-11 sm:min-h-0 inline-flex items-center justify-center px-2 py-0.5 text-[11px] sm:text-[9px] uppercase tracking-wider text-[#13382E] border border-[#13382E]/30 hover:bg-[#13382E] hover:text-[#F6F1E7] cursor-pointer transition-colors"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLocalPhotoSelected(e, g.id)}
                              className="sr-only"
                              aria-label={`Upload photo for garment piece ${idx + 1}`}
                            />
                            Upload Photo
                          </label>
                          <button
                            type="button"
                            onClick={() => handleStartEditGarment(g)}
                            style={monoStyle}
                            className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center px-2 sm:px-0 text-[11px] sm:text-[9px] uppercase tracking-wider text-[#5C5248] hover:text-[#13382E] underline cursor-pointer"
                            aria-label={`Edit garment ${g.label}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGarment(g.id)}
                            className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center text-[#8A7E71] hover:text-[#A8442A] text-xs cursor-pointer"
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
            </div>

            {/* Sticky Footer Action Bar */}
            <div className="shrink-0 sticky bottom-0 bg-[#EFE7D8] border-t border-[#D8CEBC] px-4 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                style={monoStyle}
                className="min-h-11 px-4 py-2.5 border border-[#1F1A16]/25 bg-[#FBF8F3] text-xs uppercase tracking-wider text-[#5C5248] hover:text-[#1F1A16] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={monoStyle}
                className="min-h-11 px-6 py-2.5 bg-[#13382E] hover:bg-[#1D4E40] text-[#F6F1E7] text-xs uppercase tracking-[0.1em] sm:tracking-[0.16em] font-semibold cursor-pointer"
              >
                {isEditMode ? "Save Look Changes" : "Save Look to Wardrobe"}
              </button>
            </div>
          </form>
        </div>
      )}
    </dialog>
  );
}
