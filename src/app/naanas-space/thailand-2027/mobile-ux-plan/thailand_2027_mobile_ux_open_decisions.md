# Thailand 2027 — Mobile UX Open Decisions & Technical Findings

**Workspace Plan:** [`thailand_2027_mobile_ux_plan.md`](./thailand_2027_mobile_ux_plan.md) · [`thailand_2027_mobile_ux_v2_drawbacks.md`](./thailand_2027_mobile_ux_v2_drawbacks.md) · [`thailand_2027_mobile_ux_plan.html`](./thailand_2027_mobile_ux_plan.html)  
**Roadmap Google Doc:** [Thailand 2027 Trip Planner - App Improvements](https://docs.google.com/document/d/1ZoF7kau7Z_qgr3rgokyNEgt8E3CMI68BsIy8ypowYIQ/edit?tab=t.0#heading=h.mqo40oc34uug)  
**Target Route:** `/naanas-space/thailand-2027-v2` (live `/naanas-space/thailand-2027` v1 preserved untouched; shared data via `useThailandTripState` & `naanas_space_thailand_2027_v1`) · **Audience:** Shaq & Naana

> [!NOTE]
> This document consolidates every open product and architecture decision from [`thailand_2027_mobile_ux_plan.md`](./thailand_2027_mobile_ux_plan.md) (Section 7) and [`thailand_2027_mobile_ux_plan.html`](./thailand_2027_mobile_ux_plan.html) (Section 5), enriched with findings verified against the Google Doc and live codebase. Mark each item as `Decided` once agreed.

---

## Summary Board

| ID | Topic | Scope | Status | Current Lean / Recommendation |
|----|-------|-------|--------|-------------------------------|
| D0 | Route & Desktop Preservation Strategy | `/naanas-space/thailand-2027-v2`, `useThailandTripState.ts` | **Decided** | **Option 1:** Build mobile overhaul in `/naanas-space/thailand-2027-v2`, leaving `/naanas-space/thailand-2027` untouched while sharing `@/lib/thailandTripData`, `localStorage`, and Redis (`naanas_space_thailand_2027_v1`) |
| D1 | Bottom Tab Allocation & Tab Reduction | `StickyStepNav.tsx`, Mobile Bottom Bar | Open | Clarify exact 4 bottom tabs vs `More` sheet (+ optional SOS pin) |
| D2 | Companion ("On-the-Trip") Mode Trigger | `page.tsx`, `StepItinerary.tsx`, `TRIP_METADATA` | Open | Auto-enable 4–14 Feb 2027 with 1-tap `"Show Full Spread"` toggle |
| D3 | Wardrobe Photo Upload Storage | `CreateLookModal.tsx`, `useThailandTripState.ts`, `route.ts` | Open (Findings Recorded) | **Avoid** base64 in trip JSON; use Vercel Blob or per-photo Redis keys |
| D4 | Offline Mode Scope (Read-Only vs Edit Queue) | Service Worker, `useThailandTripState.ts` | Open | Read-only offline assets + clear sync guard vs full offline queue |
| D5 | Home-Screen PWA Installation | `manifest.webmanifest`, `public/thailand-2027-sw.js` | Open (Docs Approved) | Route-scoped PWA confirmed feasible; verify both phones accept A2HS |
| D6 | Extra On-the-Ground Features | `DriverCardModal.tsx`, `StepGuideAndSos.tsx`, Step VI | Open | Tipping helper / LINE contact cards / shared photo log |

---

## Decision 0 — Route & Desktop Preservation Strategy

- **Question:** How should we roll out the mobile UX redesign while preserving the live desktop layout at `/naanas-space/thailand-2027`?
- **Shared Data Architecture:**
  - Static itinerary, bookings, prep items, apps, default packing items, and default outfits live in `@/lib/thailandTripData` (`src/lib/thailandTripData.ts`).
  - Persisted state uses origin-wide `localStorage` keys (`STORAGE_KEY = "naanas_space_thailand_2027_v1"` and `ACTOR_STORAGE_KEY = "naanas_space_thailand_2027_actor"` in `src/app/naanas-space/thailand-2027/types.ts`) and a single Upstash Redis key (`REDIS_KEY = "naanas_space_thailand_2027_v1"` in `src/app/api/naanas-space/thailand-2027/route.ts`) managed by `useThailandTripState.ts`.
- **Decision:** **Decided (Option 1 — Dedicated `/naanas-space/thailand-2027-v2` route sharing the same data and state hook).**
  - Leave `/naanas-space/thailand-2027` (`src/app/naanas-space/thailand-2027/`) untouched as the classic `v1` desktop experience.
  - Build all Phases 1–5 mobile UI/UX improvements in `src/app/naanas-space/thailand-2027-v2/`, importing the shared `@/lib/thailandTripData`, `types.ts`, `utils/*`, and `useThailandTripState.ts` (including the Phase 5.2 500ms `PUT` debounce and `localUpdated > cloudUpdated` sync fix so both routes stay in lockstep).
- **Trade-offs & Guardrails Reference:** See [`thailand_2027_mobile_ux_v2_drawbacks.md`](./thailand_2027_mobile_ux_v2_drawbacks.md) for the 5 documented dual-route drawbacks and mitigations (duplicate UI maintenance across `v1`/`v2`, dual URLs & WebAPK `start_url`, additive-only `PersistedTripState` schema evolution, same-browser cross-tab `storage` event listener, and long-term graduation options).

---

## Decision 1 — Bottom Tab Allocation & Tab Reduction Strategy

- **Origin:** `thailand_2027_mobile_ux_plan.md` Q1 + `thailand_2027_mobile_ux_plan.html` Decision 02
- **Question:** How should the 6 desktop Steps (`Plan`, `Vault`, `Prep`, `Pack`, `Guide & SOS`, `Budget`) be mapped onto a 5-slot mobile bottom bar (`4` tabs + `More`, or `4` tabs + `Quick Pocket Desk`)?
- **Current Divergence Between Plans:**
  - `thailand_2027_mobile_ux_plan.md` proposes: **`Plan` · `Vault` · `Prep` · `Pack` · `More`** (with *Guide & SOS*, *Budget & THB*, *Change Log*, and the *Editor toggle* inside `More`, plus Pocket Desk via bar/More).
  - `thailand_2027_mobile_ux_plan.html` explores moving **Steps III (`Prep`), V (`Guide & SOS`), and VI (`Budget`)** into `More`, keeping a centre `฿` Pocket / SOS trigger or pinning SOS in Companion mode.
- **Codebase & Roadmap Context:**
  - `StickyStepNav.tsx` currently renders all 6 steps in a 2-column grid (`grid-cols-2`), taking 3 rows on `< sm`.
  - **Pre-trip usage** favours `Plan`, `Vault`, `Prep`, and `Pack`.
  - **On-trip usage (4–14 Feb 2027)** shifts focus to `Plan`, `Vault` (PNRs/hotels/driver cards), and **SOS / Food Safety / Budget**, while `Prep` is largely complete before boarding. Additionally, the Google Doc marks Step V (`Food Safety`) for active expansion and Step VI (`Expense & Folio Tracker`) as Approved Tier 2 work.
- **Options:**
  1. **Static 4+1 (`Plan`, `Vault`, `Prep`, `Pack`, `More`)** — consistent muscle memory; relies on `Quick Pocket Desk` / SOS quick-links when on-trip.
  2. **Mode-aware or Pocket-first bar (`Plan`, `Vault`, `Pack`/`SOS`, `฿ Desk`, `More`)** — keeps `฿ Converter + Driver Cards + SOS` 1 tap away at all times while tucking `Prep` and `Budget` in `More` (or swapping `Prep` out when Companion mode is active).
- **Argon A Review (Modify — Hybrid of Option 1 & 2):**
  - **Disagree** with keeping `Prep` (`Step III`) in the primary bottom bar (Option 1): `Prep & Apps` only has 8 static tasks and 7 app links that will be 100% finished before boarding at Gatwick on 4 Feb, wasting 20% of the bottom bar for the whole trip.
  - **Disagree** with dynamically swapping bottom tabs when Companion Mode activates (Option 2): shifting tab positions mid-trip breaks spatial muscle memory right when landing at BKK.
  - **Disagree** with hiding `QuickPocketDesk` inside `More`: once the floating bottom-left button is removed to fix corner collisions, putting it inside `More` turns THB conversion and Thai taxi cards from 1 tap into 2–3 taps.
  - **Recommendation:** Use a **static, non-shifting 5-slot bar** before and during the trip: **`Plan` (I) · `Vault` (II) · `฿ Pocket` (Sheet) · `Pack` (IV) · `More` (⋯)**. Move `Prep & Apps` (III), `Field Guide & SOS` (V), and `Budget & THB` (VI) into `More`, and embed 1-tap SOS speed-dials (`1155`, `1669`, hotel reception) + a `"Log Expense →"` shortcut directly inside the `฿ Pocket` bottom sheet.
  — *Argon A*
- **Decision:** _Pending confirmation from Shaq & Naana._

---

## Decision 2 — Companion Mode Activation & Active-Trip Focus

- **Origin:** `thailand_2027_mobile_ux_plan.md` Q2 + `thailand_2027_mobile_ux_plan.html` Decision 01
- **Question:** Between **4–14 Feb 2027**, should `Step I` automatically enter Companion Mode (hiding the masthead, collapsing non-active days into a compact day switcher, pinning an `"Up Next"` card) with a `"Show Full Spread"` toggle, or stay strictly manual via a toggle?
- **Codebase Context:**
  - `TRIP_METADATA` in `src/lib/thailandTripData.ts` sets `startDateIso: "2027-02-04T16:40:00Z"`, `landingDateIso: "2027-02-05T10:05:00Z"` (`17:05 ICT`), and `endDateIso: "2027-02-14T07:45:00Z"`.
  - Edge case to handle if auto-activating: departure on 4 Feb begins in London (`GMT`), while arrival on 5 Feb–14 Feb runs in Bangkok/Phuket (`ICT`, UTC+7). Using `ICT` everywhere would jump ahead 7 hours before departure at Gatwick unless Day `00` uses `GMT` or a date threshold cleanly handles both.
- **Options:**
  1. **Auto-activate within trip dates + prominent manual override (`Full Spread` / `Planning View`)** — opens directly onto today's schedule when stepping off the plane, while still allowing full browsing anytime.
  2. **Manual toggle only** (optionally offering a dismissible banner `"Trip started — Switch to Today View?"`).
- **Argon A Review (Agree — Option 1 with Date-Ruler Integration):**
  - **Agree** with Option 1 (auto-activating between 4–14 Feb 2027 with a 1-tap override) and handling the `GMT` (`D00` on 4 Feb) vs `Asia/Bangkok` `UTC+7` (`D01`–`D10` on 5–14 Feb) timezone transition.
  - **Refinement:** Rather than making Companion Mode a separate locked view, simply default `selectedDayNum` on initial load to today's active trip day (`0`–`10`) instead of `null` (`Full Spread`), collapse the masthead by default, and pin the `"Up Next"` card at the top of today's day card. Since `StickyStepNav.tsx` already pins the `Full Spread | D00 | D01 ...` ruler on Step I, switching back to `Full Spread` or any other day is already a native 1-tap action without needing a separate mode toggle UI.
  — *Argon A*
- **Decision:** _Pending confirmation from Shaq & Naana._

---

## Decision 3 — Wardrobe Photo Upload Storage (`CreateLookModal.tsx`)

- **Origin:** `thailand_2027_mobile_ux_plan.html` Decision 03 (supporting Phase 4.4 camera/file upload `accept="image/*"` — omitting `capture="environment"` so Google Pixel's Android Photo Picker / Google Photos library stays accessible alongside the camera)
- **Question:** Should mobile wardrobe uploads be compressed client-side into base64 data URLs inside the existing trip JSON state (`PersistedTripState`), or stored externally (Vercel Blob or separate storage keys)?

### Findings from Google Doc & Live Codebase

1. **Google Doc explicitly warns against image uploads in Redis:**
   - In [Thailand 2027 Trip Planner - App Improvements](https://docs.google.com/document/d/1ZoF7kau7Z_qgr3rgokyNEgt8E3CMI68BsIy8ypowYIQ/edit?tab=t.0#heading=h.mqo40oc34uug) (Section **9. Outfit Suggestions & Digital Wardrobe**), the agreed data architecture was:
     > *"Store a global outfits array where garments use text URLs (e.g., Pinterest, ASOS) instead of image uploads to keep the Upstash Redis DB lightweight."*
   - For that reason, the app implemented `/api/link-preview` + Google Photos share link extraction (`photos.app.goo.gl`) instead of file uploads.
   - Section **4. Document Vault ("The Dossier")** likewise avoids putting large binary payloads inside the main trip state JSON.
   - Today, `package.json` and `src/app/api/` have **no** Blob/S3 SDK or media upload endpoint — only `/api/naanas-space/thailand-2027/route.ts` reading/writing a single Upstash Redis string key (`naanas_space_thailand_2027_v1`).

2. **Verified Drawbacks of Storing Compressed Base64 Data URLs in `PersistedTripState`:**
   - **Every tap re-uploads every photo (no debounce, monolithic `SET`):**  
     In `src/app/naanas-space/thailand-2027/hooks/useThailandTripState.ts` (`updateTripState`), every state edit immediately calls `PUT /api/naanas-space/thailand-2027` with the **entire** `PersistedTripState` JSON (currently un-debounced), and `src/app/api/naanas-space/thailand-2027/route.ts` executes `["SET", "naanas_space_thailand_2027_v1", JSON.stringify(payload)]`. Base64 encoding adds ~33% size inflation: `20` photos compressed to 80–120 KB binary (~110–160 KB base64 each = **~2.2–3.2 MB**) mean checking off 5 packing items or logging an expense over Thai mobile roaming re-uploads 2–3+ MB five separate times.
   - **Every app switch re-downloads all photos:**  
     `fetchFromCloud` (`cache: "no-store"`) fires on every `window` `focus` event (`useThailandTripState.ts`). Switching back from Google Maps, Grab, or LINE would re-download the entire base64 bundle repeatedly.
   - **`localStorage` ~5 MB quota + silent save failure:**  
     Browser `localStorage` typically caps origins at ~5 MB. Once trip JSON + base64 photos exceed that limit, `localStorage.setItem(STORAGE_KEY, JSON.stringify(next))` throws `QuotaExceededError`. Because `useThailandTripState.ts` catches and ignores storage errors silently (`catch { // Ignore storage errors }`), local/offline saves would fail with zero UI warning.
   - **One payload limit breaks *all* cloud sync (`413 Payload Too Large`):**  
     Vercel Serverless Functions enforce standard ~4.5 MB request/response body limits. Because wardrobe photos share the same `PUT` body and Redis key as the itinerary, bookings, budget, and notes, hitting that ceiling stops cloud sync across the entire planner — not just wardrobe uploads.
   - **Synchronous mobile main-thread lag & zero HTTP cache:**  
     `updateTripState` currently calls `JSON.stringify(next)` twice synchronously inside `setTripState` (once for `localStorage`, once for the `PUT` body), and `fetchFromCloud` parses the whole payload on `focus`. Multi-megabyte strings inside React state hurt low-power scrolling/typing performance and cannot use browser HTTP disk caching (`Cache-Control: immutable`) or Service Worker asset caching cleanly.
   - **Last-write-wins overwrite risk:**  
     Sync checks `cloudUpdated >= localUpdated` over the whole JSON object (`useThailandTripState.ts`), increasing conflict blast radius between Shaq's and Naana's phones when offline edits collide with photo uploads.

### Options Comparison

| Option | Architecture | Pros | Cons |
|--------|--------------|------|------|
| **A. Vercel Blob (Recommended if enabled)** | Client compresses upload (WebP/JPEG, ~800px max edge, ~50–100 KB) -> `/api/.../upload` stores file in Vercel Blob -> stores short HTTPS CDN URL in `garment.imageUrl`. | Keeps `PersistedTripState` tiny (&lt;50 KB); browser + Service Worker cache URLs cleanly; scales to unlimited looks. | Requires `BLOB_READ_WRITE_TOKEN` setup on Vercel. |
| **B. Separate Upstash Redis Key per Photo (Zero new services)** | Reuse existing Upstash Redis, but upload each compressed photo once to `/api/naanas-space/thailand-2027/wardrobe-image/[id]` (`SET naanas_space_thailand_2027_img_<id>`), served via `GET` with `Cache-Control: public, max-age=31536000, immutable`. `garment.imageUrl` stores only `/api/.../img/<id>`. | Zero new vendors/credentials; photos upload/download **once** and never bloat `localStorage` or itinerary/budget `PUT`s. | Shares Upstash storage/bandwidth tier (must enforce server-side max image size & delete cleanup on outfit deletion). |
| **C. Inline Base64 in `PersistedTripState` (Not recommended)** | Compress heavily on client (`data:image/webp;base64,...`) directly inside `PersistedTripState`. | Zero backend route changes. | All 6 drawbacks above unless hard-capped (e.g. max 6–8 photos, ≤35–40 KB each) + write debounce + explicit quota warning. |

- **Argon A Review (Agree on Rejecting Option C; Recommend Option B over Option A):**
  - **100% Agree** with rejecting Option C (Inline Base64 in `PersistedTripState`). Live code inspection confirms `updateTripState` in `useThailandTripState.ts` currently fires an **un-debounced `PUT` of the entire state object** on every checkbox tap and re-fetches on every `window` `focus`.
  - **Prefer Option B (Separate Upstash Redis Key per Photo) over Option A (Vercel Blob):** Upstash Redis is already configured in `route.ts`, whereas `@vercel/blob` is not installed or provisioned. For a 2-person trip (~15–30 compressed WebP photos at ~60–80 KB each = ~1.5–2.5 MB total), storing each photo under `naanas_space_thailand_2027_img_<id>` served via a `GET` route with `Cache-Control: public, max-age=31536000, immutable` requires zero new vendors/tokens, keeps `naanas_space_thailand_2027_v1` under 30 KB, and lets the browser and Service Worker cache images permanently.
  - **Additional Code Fix:** Add the missing **500ms debounce** to the `PUT` request in `useThailandTripState.ts` (keeping `localStorage.setItem` immediate) so rapid checklist taps do not race each other in Upstash.
  — *Argon A*
- **Decision:** _Pending confirmation from Shaq & Naana (Option A vs Option B recommended)._

---

## Decision 4 — Offline Mode Scope (Read-Only vs Offline Edit Queue)

- **Origin:** `thailand_2027_mobile_ux_plan.html` Decision 04 (vs `thailand_2027_mobile_ux_plan.md` Phase 5.2)
- **Question:** Does read-only offline availability (cached Itinerary, PNRs, SOS contacts, Hotel Driver Cards, pre-cached PDFs/wardrobe images) cover on-trip reliability, or should we also build an offline write queue + reconnect flush?
- **Codebase & Google Doc Context:**
  - Google Doc Section 1 ("Offline Mode (PWA)") approved a custom Service Worker (`public/thailand-2027-sw.js`) + route manifest for full airplane-mode caching of shell + confirmed logistics.
  - Today, `useThailandTripState.ts` *already* persists edits to `localStorage` immediately when a `PUT` fails (setting `syncStatus = "local"`). However, because `fetchFromCloud` runs on `window.focus` and overwrites local state whenever `cloudUpdated >= localUpdated` (and `PUT` sends the whole blob), offline edits made on one phone can silently overwrite or be overwritten by online edits from the other phone.
- **Options:**
  1. **Read-only offline guarantee + soft write notice** — Service Worker pre-caches shell, bookings, Driver Cards, SOS, and cached images; if `navigator.onLine === false`, mutations either warn `"Offline — reconnect to sync shared edits"` or stay local-only without risky blind merges.
  2. **Offline edit queue + reconnect flush** — queue mutations/timestamps locally and reconcile on `online` (requires conflict rules if Shaq & Naana both edit offline on a flight).
- **Argon A Review (Modify — Lightweight Dirty-State Sync instead of Read-Only or Full Queue):**
  - **Disagree** with building a full mutation-replay queue (`thailand_2027_mobile_ux_plan.md` Phase 5.2 / Option 2): over-engineered for a 2-user app with a small JSON state.
  - **Disagree** with making offline mode strictly read-only (Option 1): ticking off activities, packing items, or expenses on a flight or in a dead zone already writes to `localStorage` today.
  - **Critical Bug Found in `useThailandTripState.ts` (`fetchFromCloud`):** Currently (lines 62–76), when an edit is made offline, `localStorage` gets `updatedAt = now` and `syncStatus = "local"`. When back online and the window focuses, `fetchFromCloud()` checks `if (cloudUpdated >= localUpdated)`. Because `localUpdated > cloudUpdated`, it keeps local state in memory and sets `setSyncStatus("synced")` **without ever `PUT`-ing the newer local state to Redis**—meaning the next online edit from the other phone silently overwrites those offline changes.
  - **Recommendation:** Add an `else if (localUpdated > cloudUpdated)` branch in `fetchFromCloud()` (plus a `window` `online` listener) that pushes the newer local state (or union-merges ID arrays) to `PUT /api/naanas-space/thailand-2027`. This delivers reliable offline editing in ~25 lines of code without an operation queue.
  — *Argon A*
- **Decision:** _Pending confirmation from Shaq & Naana._

---

## Decision 5 — Home-Screen Web App (PWA) Installation

- **Origin:** `thailand_2027_mobile_ux_plan.md` Q3
- **Question:** Are both phones happy installing the planner as a Home Screen web app (standalone display, offline cache)?
- **Codebase & Google Doc Context:**
  - Google Doc Section 1 (`Approved — Ready to Build`) chooses a lightweight custom `public/thailand-2027-sw.js` + route-scoped Web App Manifest for `/naanas-space/thailand-2027-v2` (`start_url: "/naanas-space/thailand-2027-v2"`, explicitly avoiding `next-pwa` due to Next.js 15.4 + Turbopack compatibility).
  - Needs `viewportFit: "cover"`, `appleWebApp` metadata, and safe-area padding (`env(safe-area-inset-bottom)`) for iPhone standalone mode, plus a short "Add to Home Screen" instruction card inside `More` (since iOS Safari does not show an automatic Android-style install banner).
- **Argon A Review (Strongly Agree — Pixel-First WebAPK + iOS Fallback):**
  - **Strongly Agree** with using a lightweight custom `public/thailand-2027-sw.js` + route-scoped `manifest.webmanifest` instead of `next-pwa` or Serwist (which conflicts with Next.js 15.4 + Turbopack and the rest of `shaqs-card`).
  - **Android / Google Pixel Priority:** Since this project prioritises Android devices—specifically Google Pixels—Chrome on Android supports the native `beforeinstallprompt` 1-tap **"Install App"** flow (creating a WebAPK that shares Chrome's origin `localStorage`, avoiding any isolated storage partition).
  - **iOS Standalone Nice-to-Have Fallback:** On iOS Safari, installing to the Home Screen requires a manual "Add to Home Screen" tip and creates an isolated `localStorage` partition separate from Safari tabs. While `PersistedTripState` will hydrate from Upstash Redis automatically, `thailand_2027_active_actor_v1` (`activeActor`) is local-only and defaults to `"Naana"`. Prompting `"Using this phone as: [Shaq] [Naana]"` when `ACTOR_STORAGE_KEY` is null remains a lightweight fallback so iOS standalone users aren't silently logged under the wrong name.
  — *Argon A*
- **Decision:** _Pending confirmation from Shaq & Naana._

---

## Decision 6 — Missing On-the-Ground Features

- **Origin:** `thailand_2027_mobile_ux_plan.md` Q4
- **Question:** Are there any high-value travel utilities missing before 2027? Candidate ideas raised:
  1. **Tipping / Currency Quick Reference** (quick Thai tipping norms + `100 / 500 / 1000 THB` presets in Pocket Desk)
  2. **LINE Contact / Concierge Cards** (1-tap hotel/driver/tour LINE IDs or `https://line.me/ti/p/...` deep links — very common in Thailand alongside WhatsApp)
  3. **Shared Photo / Memory Log** (note: interacts directly with **Decision 3** photo storage capacity)
- **What Already Exists:**
  - `DriverCardModal.tsx` already displays large Thai hotel names, Thai addresses, Thai direction notes, click-to-call reception links, Grab copy button, and Google Maps link (with UX Phase 3.2 upgrading size, Wake Lock, and `navigator.share`).
  - `StepGuideAndSos.tsx` already covers BKK arrival protocol, river transit, food safety guidelines (in active expansion), emergency `tel:` dispatch (`1155`, `1669`, etc.), and international hospitals.
  - Google Doc already tracks **Tier 1 #3: Shared Notes / Message Board** and **Tier 2 #6: Expense & Folio Tracker**.
- **Argon A Review (Agree on #1, Modify #2, Disagree on #3):**
  1. **Tipping / Currency Quick Reference (`100 / 200 / 500 / 1000 THB` presets):** **Agree.** Adding 4 quick-tap THB preset chips to `QuickPocketDesk.tsx` plus a compact Thai tipping cheat-sheet in Step V/VI is high-value, zero-bloat, and avoids numeric keypad typing on the move.
  2. **LINE Contact / Concierge Cards:** **Modify (Keep lightweight).** Don't build a standalone module; simply support `line.me` / `wa.me` URLs inside `bookingNotes` or activity `serviceLinks` as 1-tap action chips.
  3. **Shared Photo / Memory Log:** **Disagree (Skip).** Google Photos is already part of the workflow (`CreateLookModal.tsx`) and handles original-quality photos, video, and auto-backup natively. Building an in-app photo log duplicates Google Photos poorly and re-introduces Decision 3 storage bloat; add a single `"Shared Google Photos Album ↗"` link chip in the masthead or `More` sheet instead.
  — *Argon A*
- **Decision:** _Pending confirmation from Shaq & Naana._
