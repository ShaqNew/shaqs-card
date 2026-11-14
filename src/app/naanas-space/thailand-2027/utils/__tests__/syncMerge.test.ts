import {
  mergeTripStates,
  extractManagedWardrobeImageIds,
  WARDROBE_IMAGE_API_PREFIX,
} from "../syncMerge";
import { DEFAULT_PERSISTED_STATE, PersistedTripState } from "../../types";

describe("syncMerge — Set-Union Conflict Resolution & Managed Photo Extraction", () => {
  it("unions checklist IDs, custom items, activities, outfits, and changelog across diverged offline edits", () => {
    const localOffline: PersistedTripState = {
      ...DEFAULT_PERSISTED_STATE,
      completedPrepIds: ["prep-1"],
      installedAppIds: ["app-grab"],
      packedItemIds: ["pack-passport"],
      completedActivityIds: ["act-d1-arrival"],
      customPackingItems: [
        {
          id: "cp-shaq-1",
          label: "linen shirt",
          category: "Daytime & Temple Wear",
          forWho: "shaq",
        },
      ],
      customActivitiesByDay: {
        2: [
          {
            id: "cust-d2-a",
            time: "18:00",
            title: "Riverboat sunset",
            category: "dining",
            summary: "Chao Phraya terrace",
          },
        ],
      },
      dayOutfitByDay: { 1: "outfit-temple" },
      activityOutfitById: { "act-d1-dinner": "outfit-rooftop" },
      dayNotes: { 1: "Bring small THB bills" },
      plannedExpenses: [
        ...DEFAULT_PERSISTED_STATE.plannedExpenses,
        {
          id: "exp-shaq",
          title: "Boat transfer",
          amountThb: 400,
          category: "Transport",
          city: "Bangkok",
          isBooked: false,
        },
      ],
      changeLog: [
        {
          id: "log-1",
          timestamp: 1000,
          actor: "Shaq",
          section: "packing",
          action: "Packed item",
          detail: "Passport",
        },
      ],
      updatedAt: 1000,
    };

    const cloudLater: PersistedTripState = {
      ...DEFAULT_PERSISTED_STATE,
      completedPrepIds: ["prep-2"],
      installedAppIds: ["app-line"],
      packedItemIds: ["pack-sunscreen"],
      completedActivityIds: ["act-d2-wat-arun"],
      deletedOutfitIds: ["outfit-default-retired"],
      customOutfits: [
        {
          id: "look-naana-1",
          title: "Phuket Sunset Silk",
          owner: "naana",
          dressCode: "rooftop",
          climateTag: "30°C",
          garments: [
            {
              id: "g-1",
              label: "Silk dress",
              url: "#local-photo",
              imageUrl: `${WARDROBE_IMAGE_API_PREFIX}img_naana_1234`,
            },
          ],
        },
      ],
      customActivitiesByDay: {
        2: [
          {
            id: "cust-d2-b",
            time: "20:00",
            title: "IconSiam fountain",
            category: "culture",
            summary: "Evening stroll",
          },
        ],
        5: [
          {
            id: "cust-d5-a",
            time: "14:00",
            title: "Spa booking",
            category: "leisure",
            summary: "Hilltop massage",
          },
        ],
      },
      dayOutfitByDay: { 2: "look-naana-1" },
      activityOutfitById: { "act-d2-wat-arun": "look-naana-1" },
      dayNotes: { 2: "Modest shoulder wrap" },
      plannedExpenses: [
        ...DEFAULT_PERSISTED_STATE.plannedExpenses,
        {
          id: "exp-naana",
          title: "Spa deposit",
          amountThb: 3200,
          category: "Wellness",
          city: "Phuket",
          isBooked: true,
        },
      ],
      changeLog: [
        {
          id: "log-2",
          timestamp: 2000,
          actor: "Naana",
          section: "itinerary",
          action: "Added activity",
          detail: "Spa booking",
        },
      ],
      updatedAt: 2000,
    };

    const merged = mergeTripStates(localOffline, cloudLater);

    expect(merged.completedPrepIds).toEqual(
      expect.arrayContaining(["prep-1", "prep-2"])
    );
    expect(merged.installedAppIds).toEqual(
      expect.arrayContaining(["app-grab", "app-line"])
    );
    expect(merged.packedItemIds).toEqual(
      expect.arrayContaining(["pack-passport", "pack-sunscreen"])
    );
    expect(merged.completedActivityIds).toEqual(
      expect.arrayContaining(["act-d1-arrival", "act-d2-wat-arun"])
    );
    expect(merged.customPackingItems.map((i) => i.id)).toContain("cp-shaq-1");
    expect(merged.customActivitiesByDay[2].map((a) => a.id)).toEqual(
      expect.arrayContaining(["cust-d2-a", "cust-d2-b"])
    );
    expect(merged.customActivitiesByDay[5].map((a) => a.id)).toEqual([
      "cust-d5-a",
    ]);
    expect(merged.dayOutfitByDay).toEqual({
      1: "outfit-temple",
      2: "look-naana-1",
    });
    expect(merged.dayNotes).toEqual({
      1: "Bring small THB bills",
      2: "Modest shoulder wrap",
    });
    expect(merged.plannedExpenses.map((e) => e.id)).toEqual(
      expect.arrayContaining(["exp-shaq", "exp-naana"])
    );
    expect(merged.changeLog?.map((l) => l.id)).toEqual(["log-2", "log-1"]);
    expect(merged.updatedAt).toBe(2000);
  });

  it("extracts managed wardrobe image IDs and ignores external links and inline data URLs", () => {
    const ids = extractManagedWardrobeImageIds([
      {
        id: "look-1",
        title: "Test Look",
        owner: "both",
        dressCode: "temple",
        climateTag: "32°C",
        garments: [
          {
            id: "g-cloud",
            label: "Linen Shirt",
            url: "#local-photo",
            imageUrl: "/api/naanas-space/thailand-2027/wardrobe-image/img_abc_123",
          },
          {
            id: "g-data",
            label: "Fallback Photo",
            url: "#local-photo",
            imageUrl: "data:image/webp;base64,AAAA",
          },
          {
            id: "g-ext",
            label: "ASOS Top",
            url: "https://www.asos.com/example",
            imageUrl: "https://images.asos-media.com/example.jpg",
          },
        ],
      },
    ]);

    expect(Array.from(ids)).toEqual(["img_abc_123"]);
  });
});
