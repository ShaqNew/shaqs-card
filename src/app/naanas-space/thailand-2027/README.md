# Thailand 2027 Trip Planner & Dossier

> **Routes:** `/naanas-space/thailand-2027` (`v1` classic desktop) & `/naanas-space/thailand-2027-v2` (`v2` mobile-first companion sharing live state) — accessible from *Naana's Space* (`/naanas-space`)  
> **Travellers:** Shaq Newell & Naana Binfoh  
> **Occasion:** Celebrating Naana's Birthday  
> **Trip Dates:** Thursday, 4 February 2027 – Sunday, 14 February 2027 (8 nights in Thailand: 3 nights in Bangkok + 5 nights in Phuket)

---

## 1. Overview & Purpose

The **Thailand 2027** dashboard is a bespoke, interactive luxury trip planner and on-the-ground digital companion. Designed in a warm tropical editorial aesthetic, it unites verified booking records, live itinerary planning, luggage coordination, currency conversion, and emergency assistance into a single responsive web application.

### Key Capabilities
1. **Pre-Departure Clearance & Logistics:** Tracks mandatory immigration protocols (Thailand Digital Arrival Card / TDAC, zero-FX cards, SuperRich cash exchange, travel eSIMs), essential Thailand mobile applications, and a shared interactive packing ledger.
2. **Bookings Vault & Financial Matrix:** Secure repository of verified flight PNRs, baggage allowances, seat assignments, hotel confirmation numbers, payment splits, and the accommodation surplus balance.
3. **Interactive Day-by-Day Itinerary:** Curated daily schedule (`D00` to `D10`) across Bangkok and Phuket with custom activity inscription, inline editing, and direct reservation links.
4. **On-the-Ground Companion:** Live THB ⇄ GBP currency exchange desk with one-tap tariff presets, full-screen Thai script driver address cards for taxis/chauffeurs, emergency SOS dials, and a cloud-synced **Folio Change Log** attributing updates to either Shaq or Naana.

---

## 2. Master Planning Document (Google Doc)

For future reference, ongoing roadmap tracking, and architectural decisions, consult the official Google Doc:

🔗 **[Thailand 2027 Trip Planner - App Improvements (Google Doc)](https://docs.google.com/document/d/1ZoF7kau7Z_qgr3rgokyNEgt8E3CMI68BsIy8ypowYIQ/edit)**

This document serves as the living specification for enhancements, including:
- **Agreed Architectural Decisions:** PWA offline caching, Open-Meteo live weather API, Leaflet map route previews, Google Calendar/.ics sync, and S3/Vault PDF attachments.
- **Implementation Roadmap:** Prioritised feature tiers (Tier 1: Food safety guide, outfit suggestions, notes; Tier 2: Calendar & timezone UI; Tier 3: PWA, Weather, and Dossier).
- **Completed & In-Progress Milestones:** Day counter zero-padding fix (`c42d5eb`), modular component architecture refactoring (`383a0e6`), culinary & food safety advisory (Tier 1 — #1, initial scaffold live & in active development), universal calendar integration (`utils/calendar.ts`, Option A: 1-tap Google Calendar links + universal RFC 5545 `.ics` export for master trip, single day, and individual movements), and **Outfit Suggestions & Digital Wardrobe** (Tier 1 — #2: polaroid split-grid garment collages, `/api/link-preview` OpenGraph `og:image` scraper, `CreateLookModal`, Step I `ATTIRE` slot + activity hanger overrides via `WardrobeDrawer`, and contextual dress-code conflict warnings).

---

## 3. Application Structure & Steps

The page is structured around **6 modular steps** accessible via the sticky navigation bar:

| Step | Component | Responsibility |
| :--- | :--- | :--- |
| **Step I** | `StepItinerary.tsx` | Master day-by-day itinerary (`D00`–`D10`), phase filters, custom activity inscription, inline editing, curated recommendations, universal calendar integration, daily `ATTIRE` slots, activity-level hanger overrides, and dress-code conflict warnings. |
| **Step II** | `StepBookingsVault.tsx` | Master reference cipher strip, tactile flight coupons (Air Arabia & Thai Vietjet), verified PNRs, baggage allowances, and hotel vouchers. |
| **Step III** | `StepPrepAndApps.tsx` | Entry clearance checklist (TDAC, passport validity), ATM currency advisories, and essential Thailand digital apps directory. |
| **Step IV** | `StepPackingStudio.tsx` | Luggage overview, climate & dress-code lookbooks (Daytime/Temple, Rooftop/Dining, Beach), Digital Wardrobe polaroid garment collages with `CreateLookModal`, and the categorized Packing Ledger. |
| **Step V** | `StepGuideAndSos.tsx` | Regional transit field dispatches (BKK arrival, Phuket buggy service), culinary & food safety advisory, emergency speed-dials (1155, 1669, Embassy), and accredited hospital directory. |
| **Step VI** | `StepBudgetAndLedger.tsx` | Interactive THB ⇄ GBP currency desk, quick baht presets, financial matrix breakdown, and planned trip expense ledger. |

### Global Overlays & Utilities
- **`TopEditorialBar.tsx`**: Header bar housing the active editor attribution toggle (`SHAQ` / `NAANA`), cloud sync indicator, and Change Log trigger.
- **`EditorialMasthead.tsx`**: Editorial monograph title, route manifest, and the live DS-Digital chronometer countdown clock.
- **`StickyStepNav.tsx`**: Persistent step navigation bar with interactive readiness counters and quick-jump day selection.
- **`QuickPocketDesk.tsx`**: Floating mobile-friendly drawer for rapid THB/GBP conversion, PNR copy, and quick Thai driver card launching.
- **`DriverCardModal.tsx`**: High-contrast, full-screen Thai script destination cards with phonetics and addresses for taxi drivers.
- **`ChangeLogDrawer.tsx`**: History drawer tracking all items checked off, added, or edited, attributed with timestamps and author badges.

---

## 4. Strict Copywriting & Brand Rules

Every future update to this route **must** adhere to these foundational rules:

1. **Name Usage — Always "Shaq"**:
   - Always refer to Shaq as **"Shaq"** (or **"Shaq Newell"** in passenger manifests).
   - **Never** use `"Shaquille"`.
2. **Pronoun Rule — Shared Workspace**:
   - The dashboard is shared equally by Shaq and Naana.
   - **Never** address Shaq alone in the second person while referring to Naana in the third person (*e.g., never write "for you and Naana"*). Always write *"by Shaq & Naana"* or use reader-neutral phrasing (*"Tap any cipher to copy to your clipboard"*).
3. **No Birthday Age References**:
   - **Never** include an age or ordinal number for Naana's birthday (no `"30th"`, no `"XXX"`). Always use **"Celebrating Naana's Birthday"** or **"Naana's Birthday Escape"**.
4. **Section Naming — "Step", Not "Chapter"**:
   - Use **`Step I`** through **`Step VI`** (never `"Chapter"`).
5. **Warm Tropical Editorial Luxury Aesthetic**:
   - Typography: `DM Serif Display` (`serifStyle`) with `lining-nums tabular-nums`, `JetBrains Mono` (`monoStyle`) for ciphers/metadata, `DS-Digital` exclusively for the masthead chronometer, and `Plus Jakarta Sans` for body copy.
   - Palette: Sun-bleached linen (`#F6F1E7`), warm ivory (`#FBF8F3`), deep teak ink (`#1F1A16`), Siamese emerald (`#13382E`), and Siam terracotta (`#A8442A`).

---

## 5. Technical Architecture & Persistence

```
src/
├── lib/
│   └── thailandTripData.ts         # Static master trip dataset (flights, hotels, schedule, prep, apps, packing)
└── app/
    ├── api/naanas-space/thailand-2027/
    │   └── route.ts                # App Router GET / PUT endpoint syncing state to Vercel KV / Upstash
    └── naanas-space/
        ├── thailand-2027/
        │   ├── layout.tsx          # Font declarations & layout wrapper (v1 classic)
        │   ├── page.tsx            # Main dashboard orchestrator (v1 classic)
        │   ├── types.ts            # Shared TypeScript interfaces & storage keys
        │   ├── styles.tsx          # Shared font styles, badges, & SVG arrows
        │   ├── utils/
        │   │   ├── calendar.ts     # Google Calendar & .ics helpers
        │   │   ├── formatters.ts   # formatDayNumber() & parseActivitySortMinutes()
        │   │   └── wardrobe.ts     # Outfit resolution & garment dress-code helpers
        │   ├── hooks/
        │   │   └── useThailandTripState.ts # Shared LocalStorage + KV sync, countdown, & change log mutations
        │   ├── components/         # Shared chrome, masthead, modals, & drawers (v1)
        │   │   └── steps/          # Step I through Step VI views (v1)
        │   ├── mobile-ux-plan/     # Mobile UX improvement specs, open decisions & v2 drawbacks
        │   ├── thailand_2027_context_handoff.md # Deep context & booking numbers
        │   └── README.md           # This document
        └── thailand-2027-v2/       # Mobile-first v2 route sharing types, hooks, utils & Redis state with v1
            ├── layout.tsx, page.tsx, styles.tsx, components/
            └── types.ts, hooks/, utils/ # Barrel re-exports from ../thailand-2027/
```

### State Management
Trip state is stored locally in `localStorage` under key `naanas_space_thailand_2027_v1` for instant offline rendering, and debounced-synced (600ms) to `/api/naanas-space/thailand-2027` (persisted under Upstash Redis / Vercel KV key `naanas_space_thailand_2027_v1`). Both `/naanas-space/thailand-2027` (`v1`) and `/naanas-space/thailand-2027-v2` (`v2`) share this exact storage layer.

### Testing
Run the dedicated test suites verifying `v1`, `v2`, cross-route shared persistence, interactive checklists, currency conversion, Thai driver modal, and the Change Log:
```bash
npm test -- src/app/naanas-space/__tests__/thailand-2027.test.tsx src/app/naanas-space/__tests__/thailand-2027-v2.test.tsx
```

---

## 6. Related Documentation
- [`thailand_2027_context_handoff.md`](./thailand_2027_context_handoff.md) — Comprehensive context document for feeding into new agent sessions.
- [`./mobile-ux-plan/thailand_2027_mobile_ux_plan.md`](./mobile-ux-plan/thailand_2027_mobile_ux_plan.md) — Phased Mobile UX Improvement Plan (Android / Google Pixel primary, targeting `/naanas-space/thailand-2027-v2`).
- [`./mobile-ux-plan/thailand_2027_mobile_ux_open_decisions.md`](./mobile-ux-plan/thailand_2027_mobile_ux_open_decisions.md) — Consolidated open architecture & product decisions (`D0`–`D6`) with Argon A reviews.
- [`./mobile-ux-plan/thailand_2027_mobile_ux_v2_drawbacks.md`](./mobile-ux-plan/thailand_2027_mobile_ux_v2_drawbacks.md) — Trade-offs, backwards-compatible schema rules, cross-tab `storage` sync, and sunset options for the dual `v1`/`v2` route architecture.
- [`./mobile-ux-plan/thailand_2027_mobile_ux_plan.html`](./mobile-ux-plan/thailand_2027_mobile_ux_plan.html) — Visual before/after mobile UX specification & verification showcase.
- [Google Doc: App Improvements](https://docs.google.com/document/d/1ZoF7kau7Z_qgr3rgokyNEgt8E3CMI68BsIy8ypowYIQ/edit) — Master enhancements roadmap & technical decisions.
