import { WardrobeOutfit } from "@/lib/thailandTripData";
import { DEFAULT_PERSISTED_STATE, PersistedTripState } from "../types";

export const WARDROBE_IMAGE_API_PREFIX =
  "/api/naanas-space/thailand-2027/wardrobe-image/";

const MANAGED_IMAGE_URL_REGEX =
  /^\/api\/naanas-space\/thailand-2027\/wardrobe-image\/([a-zA-Z0-9_-]{4,80})(?:\?.*)?$/;

function unionStringIds(a: string[] = [], b: string[] = []): string[] {
  return Array.from(new Set([...a, ...b]));
}

function mergeById<T extends { id: string }>(
  older: T[] = [],
  newer: T[] = []
): T[] {
  const map = new Map<string, T>();
  for (const item of older) {
    map.set(item.id, item);
  }
  for (const item of newer) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

/**
 * Conflict-resilient Set-Union merge when both local offline edits and remote
 * cloud/tab edits diverged since the last synchronized timestamp.
 */
export function mergeTripStates(
  local: PersistedTripState,
  incoming: PersistedTripState
): PersistedTripState {
  const localTs = local.updatedAt || 0;
  const incomingTs = incoming.updatedAt || 0;
  const newer = incomingTs >= localTs ? incoming : local;
  const older = incomingTs >= localTs ? local : incoming;

  const deletedOutfitIds = unionStringIds(
    older.deletedOutfitIds,
    newer.deletedOutfitIds
  );
  const deletedSet = new Set(deletedOutfitIds);

  const customOutfits = mergeById(older.customOutfits, newer.customOutfits).filter(
    (outfit) => !deletedSet.has(outfit.id)
  );

  const olderActivities = older.customActivitiesByDay || {};
  const newerActivities = newer.customActivitiesByDay || {};
  const dayKeys = new Set<number>([
    ...Object.keys(olderActivities).map(Number),
    ...Object.keys(newerActivities).map(Number),
  ]);
  const customActivitiesByDay: PersistedTripState["customActivitiesByDay"] = {};
  for (const day of dayKeys) {
    customActivitiesByDay[day] = mergeById(
      olderActivities[day] || [],
      newerActivities[day] || []
    );
  }

  const changeLog = mergeById(older.changeLog, newer.changeLog)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 150);

  return {
    ...DEFAULT_PERSISTED_STATE,
    ...older,
    ...newer,
    completedPrepIds: unionStringIds(
      older.completedPrepIds,
      newer.completedPrepIds
    ),
    installedAppIds: unionStringIds(
      older.installedAppIds,
      newer.installedAppIds
    ),
    packedItemIds: unionStringIds(older.packedItemIds, newer.packedItemIds),
    completedActivityIds: unionStringIds(
      older.completedActivityIds,
      newer.completedActivityIds
    ),
    deletedOutfitIds,
    customPackingItems: mergeById(
      older.customPackingItems,
      newer.customPackingItems
    ),
    customOutfits,
    customActivitiesByDay,
    dayOutfitByDay: {
      ...(older.dayOutfitByDay || {}),
      ...(newer.dayOutfitByDay || {}),
    },
    activityOutfitById: {
      ...(older.activityOutfitById || {}),
      ...(newer.activityOutfitById || {}),
    },
    dayNotes: {
      ...(older.dayNotes || {}),
      ...(newer.dayNotes || {}),
    },
    plannedExpenses: mergeById(older.plannedExpenses, newer.plannedExpenses),
    changeLog,
    updatedAt: Math.max(localTs, incomingTs) || Date.now(),
  };
}

/**
 * Extracts managed per-photo Redis image IDs referenced by any garment across customOutfits.
 */
export function extractManagedWardrobeImageIds(
  outfits: WardrobeOutfit[] = []
): Set<string> {
  const ids = new Set<string>();
  for (const outfit of outfits) {
    for (const garment of outfit.garments || []) {
      const url = garment.imageUrl?.trim();
      if (!url) continue;
      const match = url.match(MANAGED_IMAGE_URL_REGEX);
      if (match?.[1]) {
        ids.add(match[1]);
      }
    }
  }
  return ids;
}
