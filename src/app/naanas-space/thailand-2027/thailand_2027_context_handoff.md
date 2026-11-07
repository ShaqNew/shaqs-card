# Thailand 2027 Webpage — Complete Context & Handoff Document

> [!IMPORTANT]
> Copy or attach this document at the start of any new chat session when working on **`/naanas-space/thailand-2027`**. It contains the complete context of the page's purpose, strict user & copywriting rules, confirmed bookings data, technical architecture, and implemented features.

---

## 1. Purpose of the Webpage

- **Route**: `/naanas-space/thailand-2027` (linked from the hub at `/naanas-space`)
- **Travellers**: **Shaq Newell** & **Naana Binfoh**
- **Occasion**: Celebrating Naana's Birthday
- **Dates**: **Thursday, 4 February 2027 – Sunday, 14 February 2027** (8 nights on the ground in Thailand: 3 nights in Bangkok + 5 nights in Phuket, plus outbound/return international transit via Sharjah)
- **Role of the Page**:
  1. **Pre-Trip Preparation Dashboard**: Tracks mandatory entry protocols (passports, Thailand Digital Arrival Card / TDAC window opening 2 Feb 2027, zero-FX cards, SuperRich cash exchange, eSIM installation), essential Thailand apps, and a shared interactive packing checklist.
  2. **Master Bookings & Financial Vault**: Houses every verified flight PNR, seat assignment, baggage allowance, hotel confirmation number, payment split, and the £72.65 accommodation budget surplus.
  3. **Collaborative Romantic Itinerary & On-the-Ground Companion**: Provides a day-by-day interactive schedule (`D00` to `D10`), curated suggestions with booking guides and direct links, custom reservation inscription and inline editing, a live THB ⇄ GBP currency converter, full-screen Thai-script chauffeur/taxi address cards, emergency SOS speed-dials, and a cloud-synced **Folio Change Log** so both Shaq and Naana can see when items were checked off or edited.

---

## 2. Strict User Requirements & Copywriting Rules

Every future modification to `/naanas-space/thailand-2027` **must** adhere to these rules:

1. **Name Usage — Always "Shaq"**:
   - Always refer to Shaq as **"Shaq"** (or **"Shaq Newell"** in formal passenger manifests).
   - **Never** use `"Shaquille"`.
2. **Pronoun Rule — Never Refer to Shaq Alone as "you"**:
   - The page is shared by both **Shaq** and **Naana** inside *Naana's Space*.
   - **Never** write copy that addresses Shaq in the second person while referring to Naana in the third person (for example, **never** write *"Whenever you or Naana check off an item"* or *"for you and Naana"*). Always refer to Shaq as **"Shaq"** (e.g., *"by Shaq & Naana"*).
   - General second-person plural/reader phrasing that applies equally to whoever is reading the page (e.g., *"Tap any reservation cipher to copy directly to your clipboard"*, *"from your 81 sqm Deluxe Tropical View Suite"*) is fine.
3. **No Birthday Age References**:
   - **Never** mention an age or ordinal number for Naana's birthday (no `"30th"`, no `"XXX"`, etc.). Always write **"Celebrating Naana's Birthday"** or **"Naana's Birthday Escape"**.
4. **Section Naming — Use "Step", Not "Chapter"**:
   - Navigation tabs and section headers use **`Step I`** through **`Step VI`** (never `"Chapter"`).
5. **Editorial Luxury Aesthetic & Typography**:
   - **Design Direction**: Warm Tropical Editorial Magazine (*Condé Nast Traveler* / *Aman Resorts* monograph aesthetic) — tactile sun-bleached linen paper, deep teak ink, hairline borders, and architectural grids. Avoid dark-mode neon/glassmorphic SaaS clichés.
   - **Colour Palette**:
     - Primary Canvas (Sun-Bleached Linen): `#F6F1E7`
     - Elevated Folio Card (Warm Ivory): `#FBF8F3`
     - Secondary Surface (Warm Sand): `#EFE7D8`
     - Primary Ink (Deep Teak): `#1F1A16`
     - Secondary Ink (Muted Umber): `#5C5248` / `#4A4036`
     - Primary Accent (Siamese Emerald): `#13382E`
     - Secondary Accent (Siam Terracotta): `#A8442A`
     - Metallic Accent (Antique Brass): `#9E7B3B` / `#D8B979`
   - **Typography Rules**:
     - **Display & Headings**: `DM Serif Display` with `font-variant-numeric: lining-nums tabular-nums` (`serifStyle`) so digits in headings, dates, and currency amounts always align at uniform height.
     - **Chronometer Countdown Digits Only**: `DS-Digital` (`chronometerDigitalStyle`) is used **exclusively** for the `Days`, `Hours`, and `Mins` numbers inside the masthead Chronometer box.
     - **Metadata, Ciphers & Labels**: `JetBrains Mono` (`monoStyle`) with `tabular-nums` for PNR codes, timestamps, counters, and badges.
     - **Body Copy**: `Plus Jakarta Sans`.

---

## 3. Confirmed Bookings & Financial Data Summary

All static trip data is defined in `src/lib/thailandTripData.ts`:

### Aviation (`FLIGHT_BOOKINGS`)
1. **Outbound International — Air Arabia (`PNR: 6I8SOP`)**:
   - **Fare**: Ultimate Fare (20kg checked bag + 10kg cabin bag each, seat selection, travel insurance) — **£770.14** (Visa `-1305`).
   - **Leg 1 (`G9259`)**: Thu 4 Feb 2027, `16:40 GMT` London Gatwick (`LGW` North) → `03:50 GST` (+1) Sharjah (`SHJ`) (7h 10m).
   - **Layover**: Sharjah (`SHJ`), 4h 00m.
   - **Leg 2 (`G9816`)**: Fri 5 Feb 2027, `07:50 GST` Sharjah (`SHJ`) → `17:05 ICT` Bangkok Suvarnabhumi (`BKK`) (6h 15m).
2. **Domestic Connection — Thai Vietjet Air (`PNR: 2GXDQP`)**:
   - **Flight `VZ306`**: Mon 8 Feb 2027, `15:25 ICT` Bangkok (`BKK` Domestic) → `17:00 ICT` Phuket (`HKT`) (1h 35m non-stop) — **THB 6,443.48 (~£144.75)**.
   - **Shaq Newell**: Seat `16A (Window)` • 25kg Checked Bag + 7kg Carry-on.
   - **Naana Binfoh**: Seat `16B (Middle)` • 30kg Checked Bag + 7kg Carry-on.
3. **Return International — Air Arabia (`PNR: 6LDREI`)**:
   - **Fare**: Ultimate Fare (20kg checked bag + 10kg cabin bag each, seat selection, travel insurance) — **£804.66** (Visa `-5053`).
   - **Leg 1 (`G9715`)**: Sat 13 Feb 2027, `18:20 ICT` Phuket (`HKT`) → `22:05 GST` Sharjah (`SHJ`) (6h 45m).
   - **Layover**: Sharjah (`SHJ`), 5h 35m.
   - **Leg 2 (`G9265`)**: Sun 14 Feb 2027, `03:40 GST` Sharjah (`SHJ`) → `07:45 GMT` London Gatwick (`LGW` North) (8h 05m).

### Residences (`HOTEL_BOOKINGS`)
1. **Shangri-La Bangkok (`Ref: 12891938794`)**:
   - **Dates**: Fri 5 Feb – Mon 8 Feb 2027 (3 Nights).
   - **Room**: Shangri-La Wing Deluxe King Room.
   - **Cost**: **THB 19,279.26 (~£433.15)** — settled in full (taxes & 10% service charge included).
   - **Location**: 89 Soi Wat Suan Plu, New Road, Bangrak, Bangkok (2-min walk to BTS Saphan Taksin & Sathorn Central Pier; free shuttle boat to ICONSIAM & Asiatique).
2. **The Pavilions Phuket (`Ref: 78165SH099776`)**:
   - **Dates**: Mon 8 Feb – Sat 13 Feb 2027 (5 Nights).
   - **Room**: Deluxe Tropical View Suite (81 sqm — separate lounge/bar, luxury bathtub & outdoor rain shower).
   - **Cost**: **THB 40,025.00 (~£899.20)** — **THB 38,625.00 prepaid** via Red Dot Payment; **THB 1,190.00 (~£26.75) balance due** on resort folio for the private HKT airport arrival transfer.
   - **Perks**: Private HKT airport arrival transfer, priority dining access at Firefly Pool & Restaurant, complimentary Layan Beach shuttle, hilltop 360 Bar & Pavilions Spa.

### Financial Summary (`TRIP_METADATA`)
- **Benchmark Exchange Rate**: `1 GBP = 44.50 THB` (adjustable live in Step VI and the Quick Pocket Desk).
- **Accommodation Ceiling**: `£1,405.00` | **Booked Total**: `~£1,332.35` (`THB 59,304.26`) | **Under-Budget Surplus**: **`+£72.65 (~3,233 THB)`** reserved for Naana's birthday dining/spa.
- **Grand Total (All Flights + 8 Nights 5-Star Hotels)**: **`~£3,051.90`**.

---

## 4. Technical Architecture & File Map

| File | Responsibility |
| :--- | :--- |
| `src/app/naanas-space/thailand-2027/page.tsx` | Orchestrator client component (`ThailandTripDashboard`) connecting `useThailandTripState` to the masthead, sticky navigation, modals/drawers, and the 6 step components. |
| `src/app/naanas-space/thailand-2027/types.ts` | Shared TypeScript types (`PersistedTripState`, `ChangeLogEntry`, `ActiveTab`, `PhaseFilter`, `CountdownState`, `ProgressMetric`) and storage keys. |
| `src/app/naanas-space/thailand-2027/styles.tsx` | Shared editorial typography styles (`serifStyle`, `monoStyle`, `chronometerDigitalStyle`), `CATEGORY_EDITORIAL_STYLES`, and `ExternalArrow`. |
| `src/app/naanas-space/thailand-2027/utils/formatters.ts` | `formatDayNumber` (`padStart(2, "0")`) and `parseActivitySortMinutes`. |
| `src/app/naanas-space/thailand-2027/hooks/useThailandTripState.ts` | State persistence (`localStorage` + `/api/naanas-space/thailand-2027` Upstash KV sync), countdown clock, readiness progress, and Change Log-attributed mutation actions. |
| `src/app/naanas-space/thailand-2027/components/` | Global chrome & overlays (`TopEditorialBar.tsx`, `EditorialMasthead.tsx`, `StickyStepNav.tsx`, `ChangeLogDrawer.tsx`, `DriverCardModal.tsx`, `QuickPocketDesk.tsx`). |
| `src/app/naanas-space/thailand-2027/components/steps/` | Individual step views (`StepItinerary.tsx`, `StepBookingsVault.tsx`, `StepPrepAndApps.tsx`, `StepPackingStudio.tsx`, `StepGuideAndSos.tsx`, `StepBudgetAndLedger.tsx`). |
| `src/lib/thailandTripData.ts` | Typed static dataset (`TRIP_METADATA`, `FLIGHT_BOOKINGS`, `HOTEL_BOOKINGS`, `FINANCIAL_MATRIX`, `TRIP_DAYS` `D00`–`D10`, `PREP_CHECKLIST`, `ESSENTIAL_APPS`, `DEFAULT_PACKING_ITEMS`, `DEFAULT_PLANNED_EXPENSES`, `EMERGENCY_CONTACTS`). |
| `src/app/api/naanas-space/thailand-2027/route.ts` | Next.js App Router `GET` / `PUT` endpoint persisting shared trip state to Vercel KV (`KV_REST_API_URL` / `KV_REST_API_TOKEN`) under key `naanas_space_thailand_2027_v1`. |
| `src/app/naanas-space/page.tsx` | *Naana's Space* hub page featuring the hero link card to `/naanas-space/thailand-2027`. |
| `src/app/naanas-space/__tests__/thailand-2027.test.tsx` | Jest + React Testing Library test suite covering all 6 steps, interactive checklists, currency conversion, Quick Pocket Desk, Thai driver modal, and the Folio Change Log. |

### Cloud & Local Persistence Schema (`PersistedTripState`)
State is stored locally in `localStorage` (`naanas_space_thailand_2027_v1`) and debounced-synced (600ms) to `/api/naanas-space/thailand-2027`:
- `completedActivityIds: string[]` — Checked-off itinerary activities.
- `customActivitiesByDay: Record<number, ItineraryActivity[]>` — User-added or suggestion-inscribed activities per day.
- `completedPrepIds: string[]` — Checked-off pre-trip checklist items (`8` total).
- `installedAppIds: string[]` — Configured essential apps (`7` total).
- `packedItemIds: string[]` — Checked-off packing items (`21` default + custom items).
- `customPackingItems: PackingItem[]` — User-added packing items.
- `plannedExpenses: PlannedExpense[]` — On-the-ground discretionary expense items.
- `bookingNotes: Record<string, string>` — Custom notes attached to flight/hotel cards in Step II.
- `exchangeRate: number` — Live GBP → THB conversion rate (defaults to `44.5`).
- `changeLog: ChangeLogEntry[]` — Timestamped audit trail (up to 150 entries) with `id`, `timestamp`, `actor` (`"Shaq" | "Naana"`), `section` (`"itinerary" | "prep" | "packing" | "budget" | "bookings"`), `action`, and `detail`.

---

## 5. Summary of Implemented Features & UX Enhancements

1. **Top Editorial Bar & Folio Change Log**:
   - Per-device **`EDITOR: SHAQ | NAANA`** toggle (persisted in `localStorage` under `thailand_2027_active_actor_v1`) so every action is attributed to the person currently using the page.
   - **`CHANGE LOG (N)`** button opens a slide-over audit drawer with section filter pills (`All`, `Itinerary`, `Prep & Apps`, `Packing`, `Budget`, `Bookings`), individual entry deletion (`✕`), and `Clear All History`.
   - Automatic logging via `appendChangeLog` across all 14 state actions (checking/unchecking activities, adding/editing/removing reservations, checking prep items, toggling apps, packing/unpacking items, adding/removing custom packing items, adding/toggling/removing budget expenses, and saving booking notes on blur).
2. **Masthead & Chronometer (`DS-Digital`)**:
   - Live countdown (`Days`, `Hours`, `Mins`) to departure (`4 Feb 2027 16:40 GMT`).
   - Overall **Dossier Readiness** percentage bar + 3 clickable jump counters (`PREP X/8`, `APPS X/7`, `PACKING X/21`) that switch directly to the corresponding tab and smooth-scroll to `#prep-protocol-section`, `#essential-apps-section`, or `#trunk-ledger-section`.
3. **Sticky Navigation & Sticky Date Ruler**:
   - Sticky Step I–VI navigation bar (`backdrop-blur-md`) stays pinned while scrolling.
   - When viewing Step I (Itinerary), a secondary sticky `ALL` / `D00`–`D08` date ruler remains pinned underneath the main nav bar.
4. **Step I — Daily Chronicle (Itinerary) UX**:
   - **Automatic Chronological Sorting**: `parseActivitySortMinutes` parses `HH:MM` timestamps so newly added or edited activities automatically slot into chronological order alongside locked flights/transfers.
   - **Undoable Suggestions & Booking Info**: Clicking a suggestion under **SUGGESTIONS** inscribes it into the day's schedule (`✓ INSCRIBED (TAP TO UNDO)`); clicking it again removes it. Each suggestion also features direct external `serviceLinks` and an `INFO` button that toggles an expandable `"HOW TO BOOK & ACCESS"` guide.
   - **Inline Editing**: Custom activities have both an `EDIT` button (opening an inline form to update time, title, category, venue, and notes) and a `REMOVE` button.
   - **Collapsible Day Cards**: Individual `Collapse –` / `Expand Day +` buttons, global `Collapse All Days` / `Expand All Days`, and `Jump to Current / Departure Day`.
5. **Step II — Bookings Vault & Thai Chauffeur Cards**:
   - One-tap PNR & hotel reference cipher strip at the top of Step II.
   - Full-screen **`"Show Driver (Thai Script)"`** modal on hotel cards displaying high-contrast Thai script (`โรงแรมแชงกรี-ลา กรุงเทพฯ` and `เดอะ พาวิลเลี่ยนส์ ภูเก็ต`), Thai addresses, directional notes for taxi drivers, reception phone links, and 1-tap copy for Grab.
6. **Global Floating Quick Pocket Desk (`฿ • PNR & Taxi`)**:
   - Pinned at the bottom-left of the screen across all tabs for instant on-the-ground access to the mini THB ⇄ GBP converter, 1-tap PNR/hotel code copying, Thai taxi driver cards, and the Folio Change Log.
