# Thailand 2027 — PR #5 Purpose & Code Review Findings (`d2fa996`)

**Pull Request:** [ShaqNew/shaqs-card#5](https://github.com/ShaqNew/shaqs-card/pull/5) (`feat/thailand-2027-v2-phase-2` &rarr; `main`, `MERGED`)  
**Reviewed By:** Hydrogen  
**Companion Docs:** [`thailand_2027_mobile_ux_plan.md`](./thailand_2027_mobile_ux_plan.md) · [`thailand_2027_mobile_ux_open_decisions.md`](./thailand_2027_mobile_ux_open_decisions.md) · [`thailand_2027_mobile_ux_v2_drawbacks.md`](./thailand_2027_mobile_ux_v2_drawbacks.md) · [`thailand_2027_mobile_ux_pr4_review.md`](./thailand_2027_mobile_ux_pr4_review.md) · [`../thailand_2027_context_handoff.md`](../thailand_2027_context_handoff.md) · [`../README.md`](../README.md)  
**Target Routes:** `/naanas-space/thailand-2027` (`v1` desktop preserved untouched) &harr; `/naanas-space/thailand-2027-v2` (`v2` mobile-first companion) · **Audience:** Shaq & Naana  
**Reviewed Snapshot:** `edd4b1603a2cd9e9f1145b33d2c43a243503a5df..d2fa996b76448a05f86dd6c3df7aa22290e3856e` (`feat(thailand-2027-v2): complete Phase 2 navigation and layout restructure`, 1 commit, 8 changed files, `1397 insertions(+), 351 deletions(-)` · Reviewed `2026-11-14`)

---

## 1. Purpose & Scope of PR #5

PR #5 implements **Phase 2 (`2.1`–`2.5`)** of [`thailand_2027_mobile_ux_plan.md`](./thailand_2027_mobile_ux_plan.md#L75-L170) exclusively inside `thailand-2027-v2` (plus its dedicated Jest integration tests), leaving `/naanas-space/thailand-2027` (`v1`) untouched:

1. **Navigation Consolidation & 5-Slot Mobile Bottom Bar** — [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx):
   - Consolidates `<nav>` into a single responsive element (`fixed bottom-0` 5-slot bar on `< sm`: `Plan`, `Vault`, `Pocket`, `Pack`, `More`; 6-tab grid `sm:grid-cols-3 lg:grid-cols-6` on desktop).
   - Adds a native `<dialog>` `More` bottom sheet housing `Step III` (`Prep & Apps`), `Step V` (`Field Guide & SOS`), `Step VI` (`Budget & THB`), `Change Log`, and an offline-guarded `v1 Classic` switcher link.
   - Upgrades Step I's sticky Date Ruler with horizontal snap scrolling and `scrollIntoView` centering for the active chip.
2. **Native `<dialog>` Quick Pocket Desk & Bottom Clearance** — [`QuickPocketDesk.tsx`](../../thailand-2027-v2/components/QuickPocketDesk.tsx), [`page.tsx`](../../thailand-2027-v2/page.tsx#L127):
   - Removes the mobile bottom-left floating trigger (`hidden sm:block`) in favor of the `Pocket` slot (with `฿` icon) in `StickyStepNav`.
   - Refactors `QuickPocketDesk` onto native `<dialog>` (mobile bottom sheet up to `85dvh`, `sm+` bottom-left card) with quick THB presets, stacked PNR copy chips, Thai taxi triggers, SOS `tel:` links, and `Log Expense` / `Change Log` footer actions.
   - Adds `pb-[calc(6rem+env(safe-area-inset-bottom))]` on the root page wrapper (`page.tsx:127`) so the fixed bottom bar does not obscure bottom page content.
3. **Single-Row Mobile Utility Header & Collapsible Masthead** — [`TopEditorialBar.tsx`](../../thailand-2027-v2/components/TopEditorialBar.tsx), [`EditorialMasthead.tsx`](../../thailand-2027-v2/components/EditorialMasthead.tsx):
   - Compacts `TopEditorialBar` to a single horizontal strip on `< sm` (`← Naana's Space`, `Thailand '27`, `S | N` toggle buttons, sync indicator) while keeping `Change Log` and `SWITCH TO V1 CLASSIC` hidden below `sm`.
   - Adds mobile-only collapsible extended dossier state (`Show full dossier ▾` / `Hide full dossier ▴`) to `EditorialMasthead` while keeping `#masthead-chronometer`, compact countdown/readiness ring, and the 3 jump chips mounted.
4. **Single-Day Itinerary Pagination & Phase 2 Tests** — [`StepItinerary.tsx`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L1231-L1254), [`thailand-2027-v2.test.tsx`](../../__tests__/thailand-2027-v2.test.tsx#L300-L480), [`StickyStepNav.test.tsx`](../../thailand-2027-v2/components/__tests__/StickyStepNav.test.tsx):
   - Adds `Prev Day`, `Full Spread (All 11 Days)`, and `Next Day` pagination controls below single-day Step I views (`selectedDayNum !== null`).
   - Adds 5 Phase 2 integration tests in `thailand-2027-v2.test.tsx` alongside `StickyStepNav.test.tsx` coverage updates.

---

## 2. What Is Working Well

- **Single responsive DOM trees instead of breakpoint duplication:** `TopEditorialBar`, `StickyStepNav`, `EditorialMasthead`, and `QuickPocketDesk` each render once and adapt via responsive CSS/classes, avoiding split actor/step state or double listeners.
- **Solid `<dialog>` bottom-sheet mechanics & D1 alignment:** Both `QuickPocketDesk` and `StickyStepNav`'s `More` sheet use `<dialog>` with `closedby="any"` plus a two-phase `PointerEvent` (`pointerdown` + `pointerup`) outside-bounds guard so scroll gestures do not trigger accidental dismissal, while hooking Android/Pixel back navigation cleanly. The 5-slot layout (`Plan`, `Vault`, `Pocket`, `Pack`, `More`) also matches Argon A's recommendation in [`thailand_2027_mobile_ux_open_decisions.md`](./thailand_2027_mobile_ux_open_decisions.md#L53-L57).
- **`v1` isolation, offline guard & safe-area clearance:** All edits stay strictly inside `thailand-2027-v2` (and its tests), `page.tsx:127` clears the bottom bar with safe-area padding, and the `More` sheet's `v1` switch guards offline navigation to protect the PWA shell.

---

## 3. Review Findings (`d2fa996`) — Hydrogen

### High Severity (Bugs)

1. **`QuickPocketDesk` calls `showModal()` unconditionally, hiding the `"COPIED TO FOLIO"` toast and making desktop `inert` behind the card** — [`QuickPocketDesk.tsx`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L47-L66), [`QuickPocketDesk.tsx#L121-L128`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L121-L128), [`QuickPocketDesk.tsx#L257`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L257), [`page.tsx#L148-L162`](../../thailand-2027-v2/page.tsx#L148-L162)
   - `dialog.showModal()` runs at **every** viewport width (both `< sm` and `sm+`), promoting `<dialog>` and its `::backdrop` (`backdrop:bg-[#1F1A16]/60 sm:backdrop:bg-transparent`) into the browser Top Layer.
   - **Mobile & desktop toast hidden:** Clicking any PNR copy chip (`QuickPocketDesk.tsx:257`) triggers `onCopy(...)`, which renders `<div role="status" ... className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] ... z-50">` in `page.tsx:148-162` **without closing** the Pocket Desk. Because `<dialog>` is open in the Top Layer, the `z-50` toast renders behind the dialog/backdrop (`max-h-[85dvh]` + dimmed backdrop on mobile), so users see no copy confirmation while the desk is open.
   - **Desktop made `inert`:** On `sm+`, `sm:backdrop:bg-transparent` styles `QuickPocketDesk` as a non-modal bottom-left floating card (`sm:w-96 sm:bottom-5 sm:left-5`), yet `showModal()` marks the rest of the dashboard `inert` — blocking page scrolling and direct interaction behind the card.
   - **Recommended fix:** Use `dialog.show()` (non-modal) on `sm+` viewports and reserve `dialog.showModal()` for mobile (`< sm`), and render an inline copied confirmation inside `QuickPocketDesk` (or mirror the `role="status"` toast inside the open `<dialog>` / Top Layer).

### Medium Severity

2. **`StickyStepNav` desktop `aria-hidden` hides visible step sublabels from screen readers** — [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx#L378-L385)
   - `step-nav-sublabel` was updated so desktop (`sm+`) keeps step subtitles visible on scroll (`hidden sm:block ... sm:max-h-12 sm:opacity-100 sm:mt-1`), while `<nav>` itself on `< sm` only renders the compact bottom bar. However, line `385` still passes `aria-hidden={isScrolled ? "true" : undefined}` (carried over from base `edd4b16`), hiding all 6 visible subtitles from assistive technology whenever a desktop user scrolls down.
   - **Recommended fix:** Remove `aria-hidden={isScrolled ? "true" : undefined}` from `step-nav-sublabel`.

3. **`dateRulerRef` `activeChip.scrollIntoView(...)` can hijack vertical viewport scrolling on mount/tab switch** — [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx#L107-L120)
   - Whenever `activeTab === "itinerary"` or `selectedDayNum` changes (including initial mount while Step I is active), line `114` calls `activeChip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })`. Because `Element.scrollIntoView` operates across all scrollable ancestors rather than strictly within `dateRulerRef`, returning to Step I or loading on narrow viewports can trigger unintended vertical viewport jumps.
   - **Recommended fix:** Compute the chip offset relative to `dateRulerRef.current` and scroll horizontally via `dateRulerRef.current.scrollTo({ left: ..., behavior: "smooth" })`.

4. **Mobile `<nav className="fixed bottom-0 z-40">` is nested inside a `z-30` sticky container, and Step I's scrolled mobile bar renders two rows** — [`StickyStepNav.tsx#L280-L292`](../../thailand-2027-v2/components/StickyStepNav.tsx#L280-L292), [`StickyStepNav.tsx#L506-L552`](../../thailand-2027-v2/components/StickyStepNav.tsx#L506-L552)
   - **Trapped stacking context:** Putting the mobile `<nav className="fixed bottom-0 ... z-40">` inside `<div id="step-content-anchor" className="sticky top-0 z-30 ...">` locks the bottom bar inside `#step-content-anchor`'s `z-30` stacking context rather than root `z-40`. While `components/steps/` currently has no `z-*` elements (and existing drawers/modals sit cleanly above at `z-50`/`z-[70]`/`z-[75]`), any future `z-30`+ sticky element in a step panel will paint over the bottom bar. Extracting `<nav>` as a sibling of `#step-content-anchor` avoids this.
   - **Step I scrolled height vs. Phase `2.5` target:** When `isScrolled` is true on `< sm`, Steps II–VI render a single compact `min-h-11` (`44px`) strip (`lines 506–527`), whereas Step I renders the horizontal Date Ruler **plus** a second `"Thailand '27 Dossier / ↑ Top"` row below it (`lines 531–552`), roughly doubling the sticky header height while browsing the itinerary.

5. **`StepItinerary` `"Full Spread (All 11 Days)"` button leaves stale `phaseFilter` and skips scroll-to-top** — [`StepItinerary.tsx#L96-L101`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L96-L101), [`StepItinerary.tsx#L131-L132`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L131-L132), [`StepItinerary.tsx#L1231-L1254`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L1231-L1254)
   - If a user filters by a trip phase (e.g., `II. Bangkok (3N)`), picks a single day chip in the Date Ruler (`selectedDayNum !== null`), and taps **`Full Spread (All 11 Days)`** (`line 1253`: `onClick={() => onSelectDayNum(null)}`), `filteredDays` (`lines 96–101`) falls back to the active `phaseFilter` and displays only Bangkok rather than all 11 days. Compare `jumpToActiveOrFirstDay` (`lines 131–132`), which resets both `onSelectDayNum(null)` and `onSetPhaseFilter("all")`.
   - Unlike `Prev Day` (`lines 1241–1243`), `Full Spread (All 11 Days)` also omits scrolling `#step-content-anchor` back into view when expanding back to the full list (amplified by `overflowAnchor: "none"` on `#step-content-anchor`).

### Low Severity & Cleanup

- **ESLint `exhaustive-deps` warning:** [`QuickPocketDesk.tsx#L102`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L102) triggers a `react-hooks/exhaustive-deps` warning because `setOpen` is used inside the `useEffect` light-dismiss handler without being in `[open, setOpen]`.
- **Duplicated `<dialog>` backdrop handler:** [`QuickPocketDesk.tsx#L68-L101`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L68-L101) and [`StickyStepNav.tsx#L144-L177`](../../thailand-2027-v2/components/StickyStepNav.tsx#L144-L177) duplicate identical `pointerdown`/`pointerup` bounds-checking logic; extracting a shared helper/hook (e.g., `useDialogLightDismiss`) avoids divergence.
- **Inherited cleanup items surfaced in [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx):** `line 302` has a redundant ternary (`isScrolled ? "sm:p-4" : "sm:p-4"`), and `"+£72.65 Surplus"` (`line 258`) / `+£72.65` (`line 677`, carried into the new `More` sheet) remain hardcoded instead of reading dynamic budget state.
- **Narrow `~320px` header squeeze & percentage clamping consistency:** [`TopEditorialBar.tsx#L29-L91`](../../thailand-2027-v2/components/TopEditorialBar.tsx#L29-L91) uses `flex-nowrap` with `shrink-0` on both left (`← Naana's Space`) and right (`S | N` + sync dot) groups, which leaves minimal width for `"Thailand '27"` on very narrow `~320px` screens where `truncate` clips it. In [`EditorialMasthead.tsx`](../../thailand-2027-v2/components/EditorialMasthead.tsx), `clampedPct` (`line 24`) clamps `0..100` for `mobile-readiness-ring` (`lines 131, 165`), whereas `lines 254, 260` still interpolate raw `overallReadinessPct`.

— *Hydrogen*

---

## 3b. Independent Verification & Additional Findings (`d2fa996`)

Verified against the checked-out `feat/thailand-2027-v2-phase-2` source (`gh` was unreachable from the sandbox, so the PR diff was read via `git diff main...HEAD`; GitHub-side check results in §4 were **not** re-verified).

### Verification of Findings 1–5 & Low Severity

| # | Result | Notes |
|---|--------|-------|
| 1 | **Confirmed, with one correction** | `showModal()` is unconditional (`QuickPocketDesk.tsx:53-54`) and PNR chips call `onCopy` without closing (`:58-59` of the footer block). Top-layer content always paints above non-top-layer `z-50`, so the toast is hidden on **mobile**. On **desktop** the toast is `sm:bottom-6 sm:right-6` while the desk is `sm:left-5 sm:w-96` with a transparent backdrop, so it is **not** covered there. The desktop `inert` / scroll-lock problem stands. Narrow the "toast hidden" claim to `< sm`. |
| 2 | Confirmed | `StickyStepNav.tsx:385`. |
| 3 | Confirmed | `StickyStepNav.tsx:107-120`. |
| 4 | Confirmed | The fixed `<nav>` (`:290-292`) is inside the `sticky z-30` container (`:279-288`). Step I's extra "Dossier / Top" row is at `:531+`. |
| 5 | Confirmed | `filteredDays` (`StepItinerary.tsx:96-101`) falls back to `phaseFilter`; `Full Spread` button only calls `onSelectDayNum(null)`. |
| Low | Confirmed | `:302` redundant ternary, `:258` / `:677` hardcoded `£72.65`, `EditorialMasthead.tsx:254/260` unclamped, `QuickPocketDesk.tsx:102` deps. |

Minor doc accuracy: the mobile slot 3 is visibly labelled **"Pocket"** (with a `฿` icon, `aria-label="Open Quick Pocket Desk"`), not "฿ Desk" as §1 and §2 say.

### Additional Findings

#### Medium

6. **`Prev Day` / `Next Day` scroll-to-top is likely a no-op** — [`StepItinerary.tsx#L1241-L1243`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L1241-L1243), [`#L1265-L1267`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L1265-L1267)
   - Both handlers call `getElementById("step-content-anchor").scrollIntoView({ block: "start" })`. That element is the `sticky top-0` nav container, so once the user has scrolled past it, it is already pinned at the top and `scrollIntoView` does not move the page. The pagination bar sits at the *bottom* of the day, so after tapping `Next Day` the user stays at the same scroll offset, usually mid or bottom of the new day, rather than at its top.
   - **Fix:** scroll to the day card (`#day-card-${n}`, as `jumpToActiveOrFirstDay` does, in a `setTimeout`/effect after the state update) with a `scroll-margin-top` that clears the sticky header, or scroll to the content area below the sticky container.
   - *Confidence: high from code reading; not reproduced on a device.* Related to Finding 5, which omits scrolling entirely.

7. **`Prev Day` / `Next Day` ignore the active `phaseFilter`** — [`StepItinerary.tsx#L1236-L1270`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L1236-L1270)
   - Navigation steps through `selectedDayNum ± 1` across all 11 days, but the phase filter chips stay at the previously chosen phase. The user can move to a day outside the highlighted phase with no feedback. Decide whether pagination should respect the filter or clear it to `"all"`; make this consistent with the Finding 5 fix.

8. **Dialogs are unmounted on close, so focus is not returned to the trigger** — [`QuickPocketDesk.tsx#L104-L119`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L104-L119)
   - When `open` is false the component renders the trigger button, and when true it **unmounts that button** and mounts the dialog. On close, `dialog.close()` is never called (the node is removed), so the browser cannot restore focus to the invoking element. Keyboard and screen-reader users, and the mobile `Pocket` slot in `StickyStepNav`, lose their focus position. Keep the `<dialog>` mounted permanently (toggling `showModal()` / `close()`), or return focus manually on close. The same applies to the `More` sheet (`StickyStepNav.tsx:~L600`, rendered only while `isMoreOpen`).

#### Low

9. **Missing `aria-current` / `aria-pressed` state** — [`StickyStepNav.tsx#L294-L330`](../../thailand-2027-v2/components/StickyStepNav.tsx#L294-L330), [`#L455-L500`](../../thailand-2027-v2/components/StickyStepNav.tsx#L455-L500)
   - `grep` finds no `aria-current` in `thailand-2027-v2/components`. The active step in the bottom bar and the selected day chip are conveyed only by colour. Add `aria-current="page"` (or `"step"`) to the active tab and `aria-pressed` to day chips. Also, the mobile `Pocket` slot should expose `aria-expanded={isPocketOpen}` and `aria-haspopup="dialog"` to match the `More` slot, which already does.

10. **Hardcoded `+£72.65` makes the `More` sheet badge inaccurate when the budget changes** — extends the existing low-severity note. The `sub` string at `:258` is also what renders on desktop; both should read from the budget state.

11. **Sheets stay modal after resizing / rotating to `sm+`** — `StickyStepNav.tsx` `More` dialog has no `sm:` styling, so rotating a phone or resizing a desktop window while open leaves a full-width bottom sheet with the page `inert`. Close it on `matchMedia("(min-width: 640px)")` change.

12. **Test coverage gap** — the added tests stub `HTMLDialogElement.prototype.showModal` (`thailand-2027-v2.test.tsx:307`, `StickyStepNav.test.tsx:19`), so none can catch Findings 1, 4 or 8, and nothing asserts the `Full Spread` + `phaseFilter` interaction (Finding 5) or the `Prev/Next` bounds (`selectedDayNum <= 0` / `>= TRIP_DAYS.length - 1`, day numbers are 0–10). Add one test each for: copy chip while desk open, `Full Spread` after a phase filter, and pagination disabled at day 0 and day 10.

### Suggested Merge Priority

1. Fix before merge: Findings **1**, **5**, **6** (plus **7** decision).
2. Fix soon: **2**, **3**, **8**, **9**.
3. Cleanup or follow-up: **4**, **10**, **11**, **12**, and the Low Severity list.

— *Sonnet*

---

## 4. Verification Status at Time of Review (`2026-11-14`)

- **GitHub PR checks (`gh pr checks 5`):** `Vercel` and `Vercel Preview Comments` passing; Vercel preview deployment status **Ready** (`BdEgREEzLxpVm1jTz5oq2SZmbqTC`).
- **Jest (`npx jest src/app/naanas-space`):** **8/8 suites passed (110/110 tests passed)** in `8.122 s` (pre-existing config warning: `Unknown option "moduleNameMapping"`).
- **ESLint (8 PR #5 files):** Exited `0` with **0 errors, 1 warning** (`QuickPocketDesk.tsx:102:6`, missing dependency `'setOpen'` in `useEffect`).
- **TypeScript (`npx tsc --noEmit`):** Exited `1` with `893 errors in 16 files` — all in `*.test.ts`/`*.test.tsx` due to pre-existing missing `@types/jest` / jest-dom matcher declarations; **0 errors in non-test application files**.

---

## 5. Verification & Resolution Log (`2026-11-14`)

All verified findings from Sections 3 (`1–5` + Low Severity) and 3b (`6–12`) have been resolved locally on `feat/thailand-2027-v2-phase-2`:

- **Finding 1 (`QuickPocketDesk` modality & mobile Top Layer copy status):** Extracted shared [`useBottomSheetDialog.ts`](../../thailand-2027-v2/hooks/useBottomSheetDialog.ts) so [`QuickPocketDesk.tsx`](../../thailand-2027-v2/components/QuickPocketDesk.tsx) opens via `showModal()` below `sm` (`< 640px`) and non-modal `show()` on `sm+` (leaving desktop background scrolling and interactions active). Added `copiedText` prop to render an in-dialog mobile confirmation banner (`data-testid="pocket-desk-copy-status"`, `role="status"`, `aria-live="polite"`, `sm:hidden`), while [`page.tsx`](../../thailand-2027-v2/page.tsx) hides the root copy toast (`hidden sm:flex`) on `< sm` when `isPocketDeskOpen` is true so mobile avoids occluded toasts/duplicate live announcements and desktop (`sm:bottom-6 sm:right-6`) stays unoccluded.
- **Finding 2 (`StickyStepNav` desktop subtitle accessibility):** Removed `aria-hidden={isScrolled ? "true" : undefined}` on `step-nav-sublabel` in [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx) so visible `sm+` sublabels remain exposed to screen readers while scrolled.
- **Finding 3 (`dateRulerRef` horizontal-only scroll centering):** Replaced `activeChip.scrollIntoView(...)` in [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx) with direct horizontal `dateRulerRef.current.scrollTo` / `scrollLeft` calculation via `getBoundingClientRect()`.
- **Finding 4 (Mobile bottom nav stacking context & Step I scrolled chrome):** Updated `#step-content-anchor` in [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx) from `z-30` to `z-40 sm:z-30` so the mobile `fixed bottom-0 z-40` `<nav>` is not constrained inside a `z-30` stacking context while preserving desktop `z-30` layering beneath `z-40` floating controls. Collapsed Step I scrolled mobile chrome (`activeTab === "itinerary" && isScrolled`) into one horizontal bar with `↑ Top` inline next to `dateRulerRef`.
- **Findings 5, 6 & 7 (`StepItinerary` pagination scroll target & `phaseFilter` reset):** Added `id="itinerary-step-header"` (`scroll-mt-20 sm:scroll-mt-36`), aligned day-card `scroll-mt-20 sm:scroll-mt-36`, and introduced `scrollToItineraryTarget` + `navigateSingleDay` in [`StepItinerary.tsx`](../../thailand-2027-v2/components/steps/StepItinerary.tsx). `Full Spread (All 11 Days)`, `Prev Day`, `Next Day`, and `StickyStepNav` Date Ruler selections (`handleSelectDayNumFromNav` in [`page.tsx`](../../thailand-2027-v2/page.tsx)) all reset `phaseFilter` to `"all"` and scroll to `#itinerary-step-header` or `#day-card-${targetDayNum}`. Confirmed the Finding 7 UI nuance at [`StepItinerary.tsx`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L259-L260): phase filter chips already de-highlight when `selectedDayNum !== null` (`active = phaseFilter === pf.id && selectedDayNum === null`), and clearing `phaseFilter` ensures no hidden phase filter resurfaces unexpectedly upon returning to `Full Spread`.
- **Findings 8 & 11 (Persistent `<dialog>` lifecycle, focus restoration & viewport resize transitions):** Kept both [`QuickPocketDesk.tsx`](../../thailand-2027-v2/components/QuickPocketDesk.tsx) (`desktopMode: "non-modal"`) and [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx) `More` (`desktopMode: "close"`) `<dialog>` elements permanently mounted (`[&:not([open])]:hidden`, rendering panel body when open). `useBottomSheetDialog` records the invoking `document.activeElement`, restores focus on close when focus stays inside the closed sheet or falls back to `document.body`, and listens to `matchMedia("(min-width: 640px)")` `"change"` events to transition or close across breakpoint changes.
- **Finding 9 (ARIA state exposure):** Added `aria-current={isActive ? "page" : undefined}` on step navigation buttons, `aria-pressed` on `Full Spread` and day chips, and `aria-expanded={isPocketOpen}` + `aria-haspopup="dialog"` on the mobile `Pocket` slot in [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx).
- **Finding 10 & Low Severity cleanup:** Removed `QuickPocketDesk.tsx`'s `react-hooks/exhaustive-deps` warning and deduplicated backdrop `PointerEvent` light-dismiss handling inside `useBottomSheetDialog`; removed the redundant `"sm:p-4"` ternary in [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx); wired optional `budgetSummary` (`plannedTotalThb`, `exchangeRate`) from [`page.tsx`](../../thailand-2027-v2/page.tsx) to keep Step VI's desktop sublabel and `More` sheet badge synced with dynamic expenses (`TRIP_METADATA.accommodationSurplusGbp` preserved as fallback when `budgetSummary` is omitted); tightened `~320px` mobile header spacing/tracking in [`TopEditorialBar.tsx`](../../thailand-2027-v2/components/TopEditorialBar.tsx); and switched remaining raw `overallReadinessPct` interpolations to `clampedPct` in [`EditorialMasthead.tsx`](../../thailand-2027-v2/components/EditorialMasthead.tsx).
- **Finding 12 (Tests):** Updated [`thailand-2027-v2.test.tsx`](../../__tests__/thailand-2027-v2.test.tsx) and [`StickyStepNav.test.tsx`](../../thailand-2027-v2/components/__tests__/StickyStepNav.test.tsx) for persistent `<dialog>` mounting and added regressions for in-sheet copy status, focus restoration, desktop non-modal `show()`, dynamic budget badge rendering, ARIA state, `More` sheet breakpoint closing, `Full Spread` phase reset + direct day-card scrolling, and `D00`/`D10` pagination bounds.

### Post-Fix Verification (`2026-11-14`)

- **Jest (`npx jest src/app/naanas-space`):** **8/8 suites passed (113/113 tests passed)**; `/naanas-space/thailand-2027` (`v1`) application and test suites remain untouched and passing.
- **ESLint (9 touched `.ts`/`.tsx` files):** Exited `0` with **0 errors, 0 warnings** (`QuickPocketDesk.tsx` warning resolved).
- **TypeScript (`npx tsc --noEmit`):** Reported `Found 958 errors in 16 files` — all in `*.test.ts`/`*.test.tsx` (pre-existing missing `@types/jest` / jest-dom matcher declarations); **0 errors in non-test application files**.

### Re-verification of Fixes (`7b4009b`) — Sonnet

Independently re-checked commit `7b4009b` against the source on `feat/thailand-2027-v2-phase-2`:

- **Findings 1–12:** Resolutions confirmed in code. Highlights: `useBottomSheetDialog` uses `showModal()` below 640px and `show()` above it, with focus restoration and `matchMedia` handling; the date ruler now scrolls horizontally only; `Full Spread`, `Prev Day` and `Next Day` reset `phaseFilter` and scroll to `#day-card-N` or `#itinerary-step-header`; `aria-current`, `aria-pressed` and `aria-expanded` are present; the budget badge is driven by `budgetSummary`.
- **Jest (`npx jest src/app/naanas-space`):** 8/8 suites, 113/113 tests passed.
- **ESLint (`src/app/naanas-space/thailand-2027-v2`):** 0 errors. 3 warnings remain, all in `PolaroidOutfitCard.tsx`, which is not touched by this PR.
- **Not re-run:** `tsc --noEmit` (the figure above is taken from the log) and GitHub-side PR checks.
- **Residual nit (non-blocking):** the mobile bottom `<nav>` still lives inside the `#step-content-anchor` stacking context (now `z-40 sm:z-30`). It works today but ties with any other root-level `z-40` element. Consider extracting `<nav>` as a sibling of the sticky container in a follow-up.

— *Sonnet*

---

*Signed off by Hydrogen · PR #5 (`d2fa996`) + post-review fixes · 2026-11-14*
