import {
  DressCodeProfile,
  ItineraryActivity,
  WardrobeOutfit,
} from "@/lib/thailandTripData";

export const DRESS_CODE_METADATA: Record<
  DressCodeProfile,
  {
    label: string;
    shortBadge: string;
    defaultClimateTag: string;
    ruleSummary: string;
    badgeClass: string;
  }
> = {
  temple: {
    label: "Temple & Royal Heritage",
    shortBadge: "TEMPLE COMPLIANT",
    defaultClimateTag: "33°C Sacred Heritage • Covered Shoulders & Knees",
    ruleSummary:
      "Shoulders and knees must be completely covered; slip-on footwear required for sacred halls.",
    badgeClass: "border-[#9E7B3B]/50 bg-[#9E7B3B]/15 text-[#6E521F]",
  },
  rooftop: {
    label: "Rooftop & Fine Dining",
    shortBadge: "SKY-BAR SMART CASUAL",
    defaultClimateTag: "25°C Balmy Evening • Strict Smart Casual",
    ruleSummary:
      "Collared shirts and closed-toe loafers/trainers required for Shaq; evening dresses or resort tailoring for Naana.",
    badgeClass: "border-[#A8442A]/45 bg-[#A8442A]/12 text-[#8F351E]",
  },
  daytime: {
    label: "Daytime City & Promenade",
    shortBadge: "DAYTIME LINEN",
    defaultClimateTag: "34°C Tropical Urban • Breathable Natural Fibres",
    ruleSummary:
      "Unlined linen, cotton, and bamboo separates for high urban humidity and river ferries.",
    badgeClass: "border-[#1F1A16]/25 bg-[#EFE7D8] text-[#4A4036]",
  },
  beach: {
    label: "Phuket Resort & Beach Club",
    shortBadge: "ANDAMAN RESORT",
    defaultClimateTag: "32°C Andaman Coast • UV Index 11 Protection",
    ruleSummary:
      "Swimwear rotations, breezy kaftans/overshirts, UV sunglasses, and waterproof cove accessories.",
    badgeClass: "border-[#13382E]/40 bg-[#13382E]/10 text-[#13382E]",
  },
  transit: {
    label: "Aviation & Cabin Transit",
    shortBadge: "CABIN TRANSIT",
    defaultClimateTag: "18°C Cabin AC → 33°C Tropical Arrival",
    ruleSummary:
      "Breathable layered knitwear and comfortable trainers for long-haul flights and airport lounges.",
    badgeClass: "border-[#5C5248]/35 bg-[#EFE7D8] text-[#433A31]",
  },
};

export function formatOwnerBadge(owner: WardrobeOutfit["owner"]): string {
  if (owner === "shaq") return "Shaq";
  if (owner === "naana") return "Naana";
  return "Shared Look";
}

export function isGooglePhotosUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    return (
      host === "photos.app.goo.gl" ||
      host === "photos.google.com" ||
      host.endsWith(".googleusercontent.com")
    );
  } catch {
    return false;
  }
}

export function isPrivateGooglePhotosUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "photos.google.com") return false;
    // Shared links contain /share/; direct /photo/ or /u/0/photo/ links require Google login
    return (
      !parsed.pathname.includes("/share/") &&
      (parsed.pathname.includes("/photo/") ||
        parsed.pathname.includes("/album/") ||
        parsed.pathname.startsWith("/u/"))
    );
  } catch {
    return false;
  }
}

export function extractSourceDomain(url: string): string {
  try {
    if (isGooglePhotosUrl(url)) return "Google Photos";
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (host.includes("pinterest.") || host.includes("pin.it"))
      return "Pinterest";
    if (host.includes("asos.")) return "ASOS";
    if (host.includes("zara.")) return "Zara";
    if (host.includes("mango.")) return "Mango";
    if (host.includes("cos.")) return "COS";
    if (host.includes("net-a-porter.")) return "Net-a-Porter";
    if (host.includes("mrporter.")) return "Mr Porter";
    const seg = host.split(".")[0] || "Link";
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  } catch {
    return "Boutique";
  }
}

export interface DressCodeRequirement {
  requiredCode: DressCodeProfile | null;
  contextTitle: string | null;
}

const TEMPLE_KEYWORDS =
  /\b(grand palace|wat pho|wat arun|temple|reclining buddha|emerald buddha|sacred)\b/i;

const ROOFTOP_FINE_DINING_KEYWORDS =
  /\b(rooftop|sky\s?bar|sky\s?beach|mahanakhon|lebua|vertigo|banyan tree|fine dining|candlelight|alto italian|salathip)\b/i;

const BEACH_COVE_KEYWORDS =
  /\b(layan beach|bang tao|banana beach|catch beach|maya beach|longtail|speedboat|phang nga|hong islands|firefly pool|river pool)\b/i;

export function detectActivityDressCodeRequirement(
  activity: Pick<
    ItineraryActivity,
    "title" | "subtitle" | "category" | "location" | "notes"
  >
): DressCodeRequirement {
  const combined = [
    activity.title,
    activity.subtitle || "",
    activity.location || "",
    activity.notes || "",
  ].join(" ");

  if (TEMPLE_KEYWORDS.test(combined) || activity.category === "culture") {
    return {
      requiredCode: "temple",
      contextTitle: "Royal Temple Dress Code (Grand Palace / Wat Pho / Wat Arun)",
    };
  }

  if (ROOFTOP_FINE_DINING_KEYWORDS.test(combined)) {
    return {
      requiredCode: "rooftop",
      contextTitle: "Sky-Bar & Fine Dining Smart Casual Protocol",
    };
  }

  if (BEACH_COVE_KEYWORDS.test(combined) || activity.category === "beach") {
    return {
      requiredCode: "beach",
      contextTitle: "Andaman Beach & Boat Excursion Attire",
    };
  }

  if (activity.category === "flight") {
    return {
      requiredCode: "transit",
      contextTitle: "Aviation Cabin Comfort",
    };
  }

  return {
    requiredCode: null,
    contextTitle: null,
  };
}

export interface OutfitConflictResult {
  hasConflict: boolean;
  severity: "error" | "warning" | null;
  headline: string | null;
  message: string | null;
  requiredCode: DressCodeProfile | null;
}

export function validateOutfitForActivity(
  outfit: WardrobeOutfit | undefined | null,
  activity: Pick<
    ItineraryActivity,
    "title" | "subtitle" | "category" | "location" | "notes"
  >
): OutfitConflictResult {
  if (!outfit) {
    return {
      hasConflict: false,
      severity: null,
      headline: null,
      message: null,
      requiredCode: null,
    };
  }

  const { requiredCode } = detectActivityDressCodeRequirement(activity);

  if (!requiredCode) {
    return {
      hasConflict: false,
      severity: null,
      headline: null,
      message: null,
      requiredCode: null,
    };
  }

  // 1. Sacred Temple strict checks
  if (requiredCode === "temple") {
    if (outfit.dressCode === "beach") {
      return {
        hasConflict: true,
        severity: "error",
        headline: "Temple Dress Code Conflict • Beachwear Prohibited",
        message: `“${outfit.title}” is tagged for Resort & Beachwear. Sacred temples (Grand Palace, Wat Pho & Wat Arun) strictly enforce covered shoulders and knees—swimwear, shorts, and sleeveless tops will be refused entry at the gate.`,
        requiredCode: "temple",
      };
    }
    if (outfit.dressCode === "daytime" || outfit.dressCode === "rooftop") {
      return {
        hasConflict: true,
        severity: "warning",
        headline: "Temple Coverage Advisory • Check Shoulders & Knees",
        message: `“${outfit.title}” is not marked Temple-Compliant. Ensure shoulders and knees are completely covered (no shorts, sleeveless tops, or sheer fabrics) and pack a linen overshirt or sarong.`,
        requiredCode: "temple",
      };
    }
  }

  // 2. Rooftop & Fine Dining strict checks
  if (requiredCode === "rooftop") {
    if (outfit.dressCode === "beach" || outfit.dressCode === "transit") {
      return {
        hasConflict: true,
        severity: "error",
        headline: "Sky-Bar Dress Code Conflict • Smart Casual Required",
        message: `“${outfit.title}” conflicts with Bangkok sky-bar & fine dining etiquette. Venues like Lebua, Vertigo, and Mahanakhon strictly refuse beachwear, flip-flops, athletic shorts, and casual transit wear.`,
        requiredCode: "rooftop",
      };
    }
  }

  // 3. Beach & Island Boat checks
  if (requiredCode === "beach") {
    if (outfit.dressCode === "rooftop") {
      return {
        hasConflict: true,
        severity: "warning",
        headline: "Coastal Attire Advisory • Formal Evening Look Assigned",
        message: `“${outfit.title}” is tailored for evening sky-bars and fine dining. Consider assigning an Andaman Resort & Beach look with swimwear, SPF 50+ sun protection, and water-ready footwear.`,
        requiredCode: "beach",
      };
    }
  }

  return {
    hasConflict: false,
    severity: null,
    headline: null,
    message: null,
    requiredCode,
  };
}

export function resolveDayOutfit(
  dayNumber: number,
  defaultDayOutfitId: string | undefined,
  dayOutfitByDay: Record<number, string> | undefined,
  allOutfits: WardrobeOutfit[]
): WardrobeOutfit | undefined {
  const overrideId = dayOutfitByDay?.[dayNumber];
  if (overrideId === "none") return undefined;
  const targetId = overrideId || defaultDayOutfitId;
  if (!targetId) return undefined;
  return allOutfits.find((o) => o.id === targetId);
}

export function resolveActivityOutfit(
  activity: ItineraryActivity,
  activityOutfitById: Record<string, string> | undefined,
  allOutfits: WardrobeOutfit[]
): WardrobeOutfit | undefined {
  const overrideId = activityOutfitById?.[activity.id];
  if (overrideId === "none") return undefined;
  const targetId = overrideId || activity.outfitId;
  if (!targetId) return undefined;
  return allOutfits.find((o) => o.id === targetId);
}

export function isPrivateOrLocalHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower === "[::1]" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }

  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return true;
    }
  }
  return false;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function extractOpenGraphFromHtml(
  html: string,
  baseUrl: string
): {
  title: string | null;
  imageUrl: string | null;
  siteName: string | null;
} {
  const getMetaContent = (attrPattern: string): string | null => {
    const regex1 = new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${attrPattern}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    );
    const match1 = html.match(regex1);
    if (match1?.[1]) return decodeHtmlEntities(match1[1]);

    const regex2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["']${attrPattern}["'][^>]*>`,
      "i"
    );
    const match2 = html.match(regex2);
    if (match2?.[1]) return decodeHtmlEntities(match2[1]);

    return null;
  };

  const rawImage =
    getMetaContent("og:image(?::secure_url)?") ||
    getMetaContent("twitter:image(?::src)?") ||
    getMetaContent("image");

  let resolvedImageUrl: string | null = null;
  if (rawImage) {
    try {
      resolvedImageUrl = new URL(rawImage, baseUrl).toString();
    } catch {
      resolvedImageUrl = rawImage;
    }
    // Upgrade Google Photos cropped 600x315 preview (=w600-h315-p-k) to full high-res uncropped image
    if (
      resolvedImageUrl &&
      resolvedImageUrl.includes("lh3.googleusercontent.com/")
    ) {
      resolvedImageUrl = resolvedImageUrl.replace(
        /=w\d+-h\d+(?:-[a-z0-9]+)*$/i,
        "=w1200"
      );
    }
  }

  let title =
    getMetaContent("og:title") ||
    getMetaContent("twitter:title") ||
    getMetaContent("name") ||
    null;
  if (!title) {
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTagMatch?.[1]) {
      title = decodeHtmlEntities(titleTagMatch[1]);
    }
  }

  const isGPhotos = isGooglePhotosUrl(baseUrl);
  if (isGPhotos && title) {
    const stripped = title.replace(/\s*[-–—]\s*Google Photos$/i, "").trim();
    if (
      !stripped ||
      /^Google Photos$/i.test(stripped) ||
      /^Sign in\s*-\s*Google Accounts/i.test(stripped) ||
      /^New (?:item|photo|video)\b/i.test(stripped) ||
      /^Shared album/i.test(stripped)
    ) {
      title = "Camera Roll Lookbook Photo";
    } else {
      title = stripped;
    }
  }

  const siteName =
    (isGPhotos ? "Google Photos" : getMetaContent("og:site_name")) || null;

  return {
    title,
    imageUrl: resolvedImageUrl,
    siteName,
  };
}

export function inferRetailerSource(parsedUrl: URL): {
  siteName: string;
  fallbackTitle: string;
} {
  if (isGooglePhotosUrl(parsedUrl.toString())) {
    return {
      siteName: "Google Photos",
      fallbackTitle: "Camera Roll Lookbook Photo",
    };
  }

  const pathSegments = parsedUrl.pathname
    .split("/")
    .filter(Boolean)
    .map((s) => decodeURIComponent(s).replace(/[-_]+/g, " "));

  const rawSlug =
    pathSegments.find((seg) => seg.length > 3 && !/^\d+$/.test(seg)) ||
    parsedUrl.searchParams.get("q") ||
    "Curated Garment Piece";

  const formattedSlug = rawSlug
    .replace(/\.(html|htm|php|jpg|jpeg|png|webp)$/i, "")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 64);

  const siteName = extractSourceDomain(parsedUrl.toString());
  return {
    siteName,
    fallbackTitle: formattedSlug,
  };
}
