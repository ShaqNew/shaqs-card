import { DEFAULT_WARDROBE_OUTFITS } from "@/lib/thailandTripData";
import {
  detectActivityDressCodeRequirement,
  validateOutfitForActivity,
  resolveDayOutfit,
  resolveActivityOutfit,
  extractSourceDomain,
  extractOpenGraphFromHtml,
  inferRetailerSource,
  isGooglePhotosUrl,
  isPrivateGooglePhotosUrl,
  getCollageTileCount,
  getCollageGridClass,
} from "../wardrobe";

describe("Wardrobe & Dress-Code Validation Utilities", () => {
  const templeOutfit = DEFAULT_WARDROBE_OUTFITS.find(
    (o) => o.dressCode === "temple"
  )!;
  const beachOutfit = DEFAULT_WARDROBE_OUTFITS.find(
    (o) => o.dressCode === "beach"
  )!;
  const rooftopOutfit = DEFAULT_WARDROBE_OUTFITS.find(
    (o) => o.dressCode === "rooftop"
  )!;

  it("detects strict temple, rooftop, and beach dress code requirements", () => {
    expect(
      detectActivityDressCodeRequirement({
        title: "Explore Wat Pho & Grand Palace",
        category: "culture",
      }).requiredCode
    ).toBe("temple");

    expect(
      detectActivityDressCodeRequirement({
        title: "Sunset Cocktails at Mahanakhon SkyBeach",
        category: "romance",
      }).requiredCode
    ).toBe("rooftop");

    expect(
      detectActivityDressCodeRequirement({
        title: "Complimentary Shuttle to Layan Beach",
        category: "beach",
      }).requiredCode
    ).toBe("beach");
  });

  it("flags an error conflict when beachwear is assigned to a sacred temple activity", () => {
    const result = validateOutfitForActivity(beachOutfit, {
      title: "Explore Wat Pho (Reclining Buddha) & Grand Palace",
      category: "culture",
      location: "Rattanakosin Island",
    });

    expect(result.hasConflict).toBe(true);
    expect(result.severity).toBe("error");
    expect(result.headline).toMatch(/Temple Dress Code Conflict/i);
    expect(result.message).toMatch(/strictly enforce covered shoulders and knees/i);
  });

  it("passes validation when a temple-compliant outfit is assigned to a temple activity", () => {
    const result = validateOutfitForActivity(templeOutfit, {
      title: "Explore Wat Pho (Reclining Buddha) & Grand Palace",
      category: "culture",
    });

    expect(result.hasConflict).toBe(false);
    expect(result.severity).toBeNull();
  });

  it("flags an error conflict when beachwear is assigned to a Bangkok sky-bar", () => {
    const result = validateOutfitForActivity(beachOutfit, {
      title: "Sunset Cocktails at Lebua Sky Bar",
      category: "romance",
    });

    expect(result.hasConflict).toBe(true);
    expect(result.severity).toBe("error");
    expect(result.headline).toMatch(/Sky-Bar Dress Code Conflict/i);
  });

  it("flags a warning when formal rooftop evening wear is assigned to a beach activity", () => {
    const result = validateOutfitForActivity(rooftopOutfit, {
      title: "Discover Banana Beach Cove",
      category: "beach",
    });

    expect(result.hasConflict).toBe(true);
    expect(result.severity).toBe("warning");
    expect(result.headline).toMatch(/Coastal Attire Advisory/i);
  });

  it("resolves day and activity outfits with override and clear support", () => {
    const resolvedDefault = resolveDayOutfit(
      2,
      templeOutfit.id,
      {},
      DEFAULT_WARDROBE_OUTFITS
    );
    expect(resolvedDefault?.id).toBe(templeOutfit.id);

    const resolvedOverridden = resolveDayOutfit(
      2,
      templeOutfit.id,
      { 2: beachOutfit.id },
      DEFAULT_WARDROBE_OUTFITS
    );
    expect(resolvedOverridden?.id).toBe(beachOutfit.id);

    const resolvedCleared = resolveDayOutfit(
      2,
      templeOutfit.id,
      { 2: "none" },
      DEFAULT_WARDROBE_OUTFITS
    );
    expect(resolvedCleared).toBeUndefined();

    const dummyAct = {
      id: "act-1",
      time: "09:00 ICT",
      title: "Temple Visit",
      category: "culture" as const,
      outfitId: templeOutfit.id,
    };
    expect(
      resolveActivityOutfit(dummyAct, {}, DEFAULT_WARDROBE_OUTFITS)?.id
    ).toBe(templeOutfit.id);
    expect(
      resolveActivityOutfit(
        dummyAct,
        { "act-1": "none" },
        DEFAULT_WARDROBE_OUTFITS
      )
    ).toBeUndefined();
  });

  it("extracts retailer source domains cleanly", () => {
    expect(
      extractSourceDomain("https://www.pinterest.com/pin/12345/")
    ).toBe("Pinterest");
    expect(
      extractSourceDomain("https://www.asos.com/prd/98765")
    ).toBe("ASOS");
    expect(
      extractSourceDomain("https://photos.app.goo.gl/AbCdEfGh12345")
    ).toBe("Google Photos");
    expect(
      extractSourceDomain("https://lh3.googleusercontent.com/pw/AP1GczNxyz")
    ).toBe("Google Photos");
  });

  it("handles Google Photos share links vs private photo links cleanly", () => {
    expect(
      isGooglePhotosUrl("https://photos.app.goo.gl/AbCdEfGh12345")
    ).toBe(true);
    expect(
      isPrivateGooglePhotosUrl("https://photos.app.goo.gl/AbCdEfGh12345")
    ).toBe(false);
    expect(
      isPrivateGooglePhotosUrl(
        "https://photos.google.com/share/AF1QipM123/photo/AF1QipN456?key=xyz"
      )
    ).toBe(false);
    expect(
      isPrivateGooglePhotosUrl("https://photos.google.com/photo/AF1QipN456")
    ).toBe(true);

    const inferred = inferRetailerSource(
      new URL("https://photos.app.goo.gl/AbCdEfGh12345")
    );
    expect(inferred.siteName).toBe("Google Photos");
    expect(inferred.fallbackTitle).toBe("Camera Roll Lookbook Photo");

    const gPhotosHtml = `
      <html>
        <head>
          <meta property="og:title" content="New photo · Saturday, Oct 24 📸" />
          <meta property="og:image" content="https://lh3.googleusercontent.com/pw/AP1GczOm9V3453Xo3eMjlAmCt8ywuqatTR6yhFXkgu1PACbEJ3bEmeuwlQIu5u76345ZEHGG2To4U6jSGUJ6b2OPepZ5E8HawG55TeCK1j_F-Kzgb0pK_ORt=w600-h315-p-k" />
          <meta property="og:site_name" content="Google Photos" />
        </head>
      </html>
    `;
    const parsedGPhotos = extractOpenGraphFromHtml(
      gPhotosHtml,
      "https://photos.google.com/share/AF1QipPlJ6akxONt7G"
    );
    expect(parsedGPhotos.siteName).toBe("Google Photos");
    expect(parsedGPhotos.title).toBe("Camera Roll Lookbook Photo");
    expect(parsedGPhotos.imageUrl).toBe(
      "https://lh3.googleusercontent.com/pw/AP1GczOm9V3453Xo3eMjlAmCt8ywuqatTR6yhFXkgu1PACbEJ3bEmeuwlQIu5u76345ZEHGG2To4U6jSGUJ6b2OPepZ5E8HawG55TeCK1j_F-Kzgb0pK_ORt=w1200"
    );
  });

  it("extracts og:image, og:title, and og:site_name from HTML in /api/link-preview helper", () => {
    const sampleHtml = `
      <html>
        <head>
          <meta property="og:title" content="Ivory Unlined Linen Overshirt &amp; Trousers" />
          <meta property="og:image" content="https://images.asos-media.com/products/linen-shirt.jpg" />
          <meta property="og:site_name" content="ASOS" />
        </head>
      </html>
    `;
    const parsed = extractOpenGraphFromHtml(
      sampleHtml,
      "https://www.asos.com/prd/123"
    );
    expect(parsed.title).toBe("Ivory Unlined Linen Overshirt & Trousers");
    expect(parsed.imageUrl).toBe(
      "https://images.asos-media.com/products/linen-shirt.jpg"
    );
    expect(parsed.siteName).toBe("ASOS");
  });

  describe("getCollageTileCount & getCollageGridClass responsive rules", () => {
    it("returns 1 tile for 0 or 1 garment to avoid empty spaces", () => {
      expect(getCollageTileCount(0)).toBe(1);
      expect(getCollageTileCount(1)).toBe(1);
      expect(getCollageGridClass(1)).toBe("grid-cols-1 grid-rows-1");
    });

    it("returns 2 tiles for 2 garments", () => {
      expect(getCollageTileCount(2)).toBe(2);
      expect(getCollageGridClass(2)).toBe("grid-cols-2 grid-rows-1");
    });

    it("returns 4 tiles for 3 garments to allow 1 open slot", () => {
      expect(getCollageTileCount(3)).toBe(4);
      expect(getCollageGridClass(4)).toBe("grid-cols-2 grid-rows-2");
    });

    it("returns 4 tiles for 4 or more garments", () => {
      expect(getCollageTileCount(4)).toBe(4);
      expect(getCollageTileCount(5)).toBe(4);
      expect(getCollageTileCount(8)).toBe(4);
    });
  });
});
