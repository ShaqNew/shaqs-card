import {
  TRIP_METADATA,
  DEFAULT_PLANNED_EXPENSES,
  ItineraryActivity,
  PackingItem,
  PlannedExpense,
  WardrobeOutfit,
} from "@/lib/thailandTripData";

export type ActiveTab =
  | "itinerary"
  | "bookings"
  | "prep"
  | "packing"
  | "guide"
  | "budget";

export type PhaseFilter =
  | "all"
  | "outbound"
  | "bangkok"
  | "transfer"
  | "phuket"
  | "return";

export const STORAGE_KEY = "naanas_space_thailand_2027_v1";
export const ACTOR_STORAGE_KEY = "naanas_space_thailand_2027_actor";

export interface ChangeLogEntry {
  id: string;
  timestamp: number;
  actor: "Shaq" | "Naana";
  section: "itinerary" | "bookings" | "prep" | "packing" | "budget";
  action: string;
  detail: string;
}

export interface PersistedTripState {
  completedPrepIds: string[];
  installedAppIds: string[];
  packedItemIds: string[];
  customPackingItems: PackingItem[];
  customOutfits?: WardrobeOutfit[];
  deletedOutfitIds?: string[];
  dayOutfitByDay?: Record<number, string>;
  activityOutfitById?: Record<string, string>;
  completedActivityIds: string[];
  customActivitiesByDay: Record<number, ItineraryActivity[]>;
  dayNotes: Record<number, string>;
  pavilionsBalancePaid: boolean;
  plannedExpenses: PlannedExpense[];
  exchangeRate: number;
  changeLog?: ChangeLogEntry[];
  updatedAt?: number;
}

export const DEFAULT_PERSISTED_STATE: PersistedTripState = {
  completedPrepIds: [],
  installedAppIds: [],
  packedItemIds: [],
  customPackingItems: [],
  customOutfits: [],
  deletedOutfitIds: [],
  dayOutfitByDay: {},
  activityOutfitById: {},
  completedActivityIds: [],
  customActivitiesByDay: {},
  dayNotes: {},
  pavilionsBalancePaid: false,
  plannedExpenses: DEFAULT_PLANNED_EXPENSES,
  exchangeRate: TRIP_METADATA.exchangeRateBenchmark,
  changeLog: [],
};

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  statusLabel: string;
}

export interface ProgressMetric {
  done: number;
  total: number;
  pct: number;
}
