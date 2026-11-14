# Thailand 2027 — `thailand-2027-v2` Dual-Route Drawbacks, Risks & Mitigations

**Companion Docs:** [`thailand_2027_mobile_ux_plan.md`](./thailand_2027_mobile_ux_plan.md) · [`thailand_2027_mobile_ux_open_decisions.md`](./thailand_2027_mobile_ux_open_decisions.md) · [`thailand_2027_mobile_ux_pr4_review.md`](./thailand_2027_mobile_ux_pr4_review.md) · [`thailand_2027_mobile_ux_pr5_review.md`](./thailand_2027_mobile_ux_pr5_review.md) · [`thailand_2027_mobile_ux_pr6_review.md`](./thailand_2027_mobile_ux_pr6_review.md) · [`thailand_2027_mobile_ux_plan.html`](./thailand_2027_mobile_ux_plan.html) · [`../thailand_2027_context_handoff.md`](../thailand_2027_context_handoff.md) · [`../README.md`](../README.md)  
**Routes:** `/naanas-space/thailand-2027` (`v1` classic desktop preserved untouched) ↔ `/naanas-space/thailand-2027-v2` (`v2` mobile-first companion) · **Audience:** Shaq & Naana

> [!NOTE]
> Per **Decision 0** (`Option 1`), `/naanas-space/thailand-2027-v2` preserves the existing desktop layout at `/naanas-space/thailand-2027` (`v1`) with zero layout regression risk while sharing the same underlying trip data and persisted state. This document records the trade-offs of keeping both routes live and the engineering guardrails required while they coexist.

---

## 1. Architecture Summary (What is Shared vs. Duplicated)

| Layer | Shared Single Source of Truth | Duplicated UI Layer (`v1` vs `v2`) |
|---|---|---|
| **Static Dataset** | `src/lib/thailandTripData.ts` (`@/lib/thailandTripData`) | — |
| **Types & Storage Keys** | `src/app/naanas-space/thailand-2027/types.ts` (`STORAGE_KEY = "naanas_space_thailand_2027_v1"`, `ACTOR_STORAGE_KEY = "naanas_space_thailand_2027_actor"`); re-exported by `thailand-2027-v2/types.ts` | — |
| **State & Hooks** | `src/app/naanas-space/thailand-2027/hooks/useThailandTripState.ts`; re-exported by `thailand-2027-v2/hooks/useThailandTripState.ts` | `thailand-2027-v2/hooks/useBottomSheetDialog.ts` (`v2`-only native `<dialog>` sheet, swipe-down dismiss, & modal focus coordinator) |
| **Utility Helpers** | `src/app/naanas-space/thailand-2027/utils/*` (`calendar.ts`, `formatters.ts`, `wardrobe.ts`); re-exported by `thailand-2027-v2/utils/*` | `thailand-2027-v2/utils/companion.ts` (`v2`-only `GMT`/`GST`/`ICT` timeline, `UP NEXT`, `NOW`, leg-aware hotel/Grab resolution) & `thailand-2027-v2/utils/haptics.ts` (`navigator.vibrate` tactile feedback helpers) |
| **Cloud Backend API** | `/api/naanas-space/thailand-2027` (`src/app/api/naanas-space/thailand-2027/route.ts`, `REDIS_KEY = "naanas_space_thailand_2027_v1"`) | — |
| **Route Entry, Styling, Fonts & UI** | — | Separate `page.tsx`, `layout.tsx`, `styles.tsx`, `fonts/*.woff2` (`next/font/local`), 9 components (`components/*.tsx`), and 6 step views (`components/steps/Step*.tsx`) in `thailand-2027-v2/` (`v1` components in `thailand-2027/` remain frozen through Phases 1–4) |

---

## 2. Potential Drawbacks, Risks & Mitigations

### Drawback 1 — Duplicate UI Component Maintenance ("Two-Place Edits" for Future Features)
- **Why it happens:** Updates to trip bookings, itinerary data (`thailandTripData.ts`), state mutations, or sync rules (`useThailandTripState.ts`) propagate to both routes automatically. However, the UI layer (`page.tsx`, modals, drawers, and `Step I`–`Step VI` components) is intentionally forked into `thailand-2027-v2/` so `v1` stays frozen.
- **Impact:** Any brand-new UI feature built later (for example, a Shared Notes board or Document Vault PDF viewer from the Google Doc) must either be implemented twice (in `v1` and `v2`) or scoped solely to `v2`.
- **Mitigation:** Treat `/naanas-space/thailand-2027` (`v1`) as feature-frozen for layout changes and land new UI work primarily in `thailand-2027-v2/`, relying on the shared `useThailandTripState.ts` and `thailandTripData.ts` layers whenever data-only updates need to show up in both views.

### Drawback 2 — Two URLs to Bookmark, Share, or Open on Mobile
- **Why it happens:** Having both `/naanas-space/thailand-2027` (`v1`) and `/naanas-space/thailand-2027-v2` (`v2`) means opening an older bookmark or shared link to `/naanas-space/thailand-2027` on a phone in Bangkok or Phuket still opens the desktop-heavy `v1` layout. In addition, `/naanas-space` (`src/app/naanas-space/page.tsx`) currently displays `v1` as the oversized primary hero card at the top and `v2` as a smaller banner underneath, naturally pulling mobile users into `v1`.
- **Mitigation:**
  1. Set `start_url: "/naanas-space/thailand-2027-v2"` in `manifest.webmanifest` so the installed Google Pixel WebAPK (and iOS Home Screen shortcut) always launches `v2`.
  2. Keep the cross-route switcher link in `TopEditorialBar.tsx`, and invert or highlight the mobile CTA hierarchy on `/naanas-space` (`Phases 1–3` merged; `Phase 4` implemented on `feat/thailand-2027-v2-phase-4`) so mobile visitors aren't nudged onto `v1` first.
  3. Optionally add a subtle `"Switch to Mobile v2 →"` prompt banner (or optional `< 640px` redirect once `v2` is battle-tested) if someone opens `v1` on a phone viewport.

### Drawback 3 — Shared State Schema (`PersistedTripState`) Must Stay Backwards-Compatible with `v1`
- **Why it happens:** Both routes read and write the exact same `localStorage` key (`naanas_space_thailand_2027_v1`) and Upstash Redis key (`naanas_space_thailand_2027_v1`).
- **Impact:** Renaming, removing, or changing the type of an existing `PersistedTripState` field in `types.ts` for `v2` could break `v1` deserialization or cause `v1` saves to clobber `v2` fields. *(Note: `PersistedTripState` uses `completedPrepIds`, `installedAppIds`, `packedItemIds`, and `completedActivityIds`.)*
- **Mitigation:**
  - Keep all `PersistedTripState` extensions **strictly additive and optional** (`newField?: ...`).
  - Because `v1`'s `fetchFromCloud` and `updateTripState` merge state with `{ ...prev, ...data.state }` and `{ ...prev, ... }`, unknown optional properties added by `v2` (and Phase 4.4's interim client-downscaled WebP data URLs in `garment.imageUrl`) are preserved intact when `v1` writes back to Redis or `localStorage`.
  - If **Decision 3** adopts per-photo Redis keys (`naanas_space_thailand_2027_img_<id>`), handle Redis `DEL` image cleanup inside the shared `useThailandTripState.ts` (`removeCustomOutfit` / `updateCustomOutfit`) rather than inside `v2`-only `CreateLookModal.tsx`, so edits or deletions performed in `v1` cannot leave orphaned image keys behind.

### Drawback 4 — Same-Browser Two-Tab Race Condition (`window.focus` vs. `storage` Event)
- **Why it happens:** `useThailandTripState.ts` (`L49-91`) re-fetches from Upstash Redis on `window` `focus`, but does not yet listen to the browser's cross-tab `storage` event. If Shaq or Naana keeps `/naanas-space/thailand-2027` (`v1`) and `/naanas-space/thailand-2027-v2` (`v2`) open simultaneously in two tabs on the same browser, edits made in Tab A before the 500ms debounced cloud `PUT` completes (or while offline) will not immediately update Tab B's in-memory React state.
- **Mitigation:** Add a `window.addEventListener("storage", ...)` listener in the shared `useThailandTripState.ts` hook (Phase 5.2) for both `STORAGE_KEY` and `ACTOR_STORAGE_KEY` so side-by-side `v1` and `v2` tabs in the same browser stay in lockstep immediately via `localStorage`:
  ```ts
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const incoming = JSON.parse(e.newValue) as PersistedTripState;
          setTripState((prev) =>
            (incoming.updatedAt || 0) > (prev.updatedAt || 0) ? { ...prev, ...incoming } : prev
          );
        } catch {
          // Ignore malformed storage payloads
        }
      } else if (e.key === ACTOR_STORAGE_KEY && (e.newValue === "Shaq" || e.newValue === "Naana")) {
        setActiveActor(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  ```
  - **Phase 5.2 Edge Cases for `onStorage`:** Once Set-Union checklist merging lands in Phase 5.2, replace the raw `(incoming.updatedAt || 0) > (prev.updatedAt || 0)` overwrite in `onStorage` with the **same Set-Union merge helper** used by `fetchFromCloud` (merging `completedActivityIds`, `packedItemIds`, `completedPrepIds`, `installedAppIds`, and `changeLog`), so concurrent offline edits in side-by-side tabs never drop an item checked off in the slightly older tab. Also handle `e.newValue === null` (site-data / `localStorage.clear()` reset) if triggered across tabs.

### Drawback 5 — Slightly Larger Build & Test Footprint
- **Impact:** Next.js builds one extra route bundle (though App Router per-route code splitting ensures browsers only download the route they visit), and Jest executes both `v1` and `v2` suites (`8` suites / `129` tests under `src/app/naanas-space` as of Phase 4).
- **Mitigation:** Keep heavy drawers (`CreateLookModal`, `WardrobeDrawer`) dynamically imported (`next/dynamic`) inside `v2` (Phase 5.3), and treat the fast cross-route Jest run as a regression gate guaranteeing shared state never drifts between `v1` and `v2`.

### Drawback 6 — PWA / Service Worker Scope Boundary & Offline Trap (`SWITCH TO V1 CLASSIC`)
- **Why it happens:** The mobile UX plan scopes `manifest.webmanifest` (`start_url: "/naanas-space/thailand-2027-v2"`) and `public/thailand-2027-sw.js` to `/naanas-space/thailand-2027-v2`, whereas `thailand-2027-v2/components/TopEditorialBar.tsx` exposes a header badge linking out to `/naanas-space/thailand-2027` (`V2 MOBILE EDITION • SWITCH TO V1 CLASSIC →`).
- **Impact:** Navigating to `/naanas-space/thailand-2027` from inside the installed Pixel WebAPK crosses outside the `v2` PWA/Service Worker scope — breaking out of standalone app chrome into a Chrome Custom Tab while online, and failing completely if tapped offline on a flight or ferry (since `v1` is not precached by `v2`'s SW).
- **Mitigation:** Hide `SWITCH TO V1 CLASSIC` on mobile viewports (`hidden sm:inline-flex`), or move it inside `More` with an `!navigator.onLine` guard/label so standalone WebAPK users cannot accidentally tap out of offline scope mid-trip. *(Implemented in Phase 2 `PR #5` inside `TopEditorialBar.tsx` and the `More` sheet.)*

### Drawback 7 — Shared Hook Ownership Means `v1` Is Only Isolated at the UI Layer
- **Why it happens:** `page.tsx`, `layout.tsx`, `styles.tsx`, 9 components, and 6 step views are duplicated into `thailand-2027-v2/`, **but** `types.ts`, `useThailandTripState.ts`, and `utils/*` are re-exported directly from inside `src/app/naanas-space/thailand-2027/`.
- **Impact:** Upcoming runtime changes to `useThailandTripState.ts` (`500ms` `PUT` debounce, `visibilitychange`/`pagehide` flush, `localUpdated > cloudUpdated` reconnect push, Set-Union merge, `storage` listener) affect **both** `v2` and live `v1` immediately, so `v1` is not immune to hook-level regressions.
- **Mitigation:**
  - Keep `v1`'s integration suite (`src/app/naanas-space/__tests__/thailand-2027.test.tsx`) as a mandatory regression gate on every change to `useThailandTripState.ts`, `types.ts`, or `utils/*`.
  - Keep `v2`-specific mobile UI state (`isCompanionMode`, active sheet state, toast snackbar placement) strictly inside `thailand-2027-v2/` components/page state rather than adding it into the shared hook.

---

## 3. Long-Term Graduation / Sunset Options

Keeping both routes is ideal during active development of Phases 1–5 because `v1`'s UI layout is guaranteed never to regress. Once `v2` is complete, you have two clean long-term paths:

- **Option A — Keep Both Permanently:** Leave `/naanas-space/thailand-2027` (`v1`) frozen as an archival desktop dossier and treat `/naanas-space/thailand-2027-v2` (`v2`) as the active companion + WebAPK route.
- **Option B — Promote `v2` After Full Verification:** Remember that `v2` also uses responsive Tailwind breakpoints (`sm:` / `md:` / `lg:`) to preserve full desktop ergonomics. Once `v2` has passed verification on both Google Pixel (`412×915`, `448×998`) and desktop (`1280×800`, `1440×900`), you can move `thailand-2027-v2` into `/naanas-space/thailand-2027` and turn `/naanas-space/thailand-2027-v2` into a permanent redirect back to `/naanas-space/thailand-2027`, eliminating duplicate UI maintenance before the 4 Feb 2027 departure.

— *Argon A*
