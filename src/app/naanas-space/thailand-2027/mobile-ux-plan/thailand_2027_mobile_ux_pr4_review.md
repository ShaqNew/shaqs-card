# Thailand 2027 — PR #4 Purpose & Code Review Findings (`38f9d33`)

**Pull Request:** [ShaqNew/shaqs-card#4](https://github.com/ShaqNew/shaqs-card/pull/4) (`docs/thailand-2027-mobile-ux-plan` &rarr; `main`, `MERGED`)  
**Companion Docs:** [`thailand_2027_mobile_ux_plan.md`](./thailand_2027_mobile_ux_plan.md) · [`thailand_2027_mobile_ux_open_decisions.md`](./thailand_2027_mobile_ux_open_decisions.md) · [`thailand_2027_mobile_ux_v2_drawbacks.md`](./thailand_2027_mobile_ux_v2_drawbacks.md) · [`thailand_2027_mobile_ux_plan.html`](./thailand_2027_mobile_ux_plan.html) · [`../thailand_2027_context_handoff.md`](../thailand_2027_context_handoff.md) · [`../README.md`](../README.md)  
**Target Routes:** `/naanas-space/thailand-2027` (`v1` desktop preserved untouched) &harr; `/naanas-space/thailand-2027-v2` (`v2` mobile-first companion) · **Audience:** Shaq & Naana  
**Reviewed Snapshot:** `4771ed16f5478a05f86dd6c3df7aa22290e3856e..38f9d33d411e13d219bc7ce33ccf88b40fc43a7f` (3 commits, 45 changed files)

> [!NOTE]
> **Scope Boundary (PR #4 vs. Local Working Tree):** Committed PR #4 stops at commit `38f9d33` (Planning docs + `v2` scaffold + **Phase 1**). As of review time (2026-11-14), the local working tree also held uncommitted **Phase 2** edits across 8 files (`thailand-2027-v2.test.tsx`, `EditorialMasthead.tsx`, `QuickPocketDesk.tsx`, `StickyStepNav.tsx`, `TopEditorialBar.tsx`, `StickyStepNav.test.tsx`, `StepItinerary.tsx`, `page.tsx`) not yet pushed to PR #4. The line references and findings below describe the committed `38f9d33` snapshot.

---

## 1. Purpose & Scope of PR #4

Across three commits (`6ef18ec`, `977c780`, `38f9d33`), PR #4 establishes the mobile UX overhaul plan for the Thailand 2027 trip planner (targeting Android Chrome / Google Pixel primary and iOS Safari secondary) while keeping `/naanas-space/thailand-2027` (`v1`) visually frozen for desktop users and sharing the same live persisted state:

1. **Planning, Visual Blueprint & Decisions (`6ef18ec`, `977c780`):**
   - [`thailand_2027_mobile_ux_plan.md`](./thailand_2027_mobile_ux_plan.md): 5-phase mobile UX roadmap and desktop-preservation guardrails.
   - [`thailand_2027_mobile_ux_open_decisions.md`](./thailand_2027_mobile_ux_open_decisions.md): Resolves **Decision 0** to scaffold `/naanas-space/thailand-2027-v2` and tracks open decisions `D1`–`D6`.
   - [`thailand_2027_mobile_ux_v2_drawbacks.md`](./thailand_2027_mobile_ux_v2_drawbacks.md): Documents dual-route maintenance trade-offs and sunset options.
   - [`thailand_2027_mobile_ux_plan.html`](./thailand_2027_mobile_ux_plan.html) + 12 before/after PNGs under `./screenshots/`: Visual mockups and mobile blueprint.
2. **Parallel `v2` Route Scaffold (`977c780`):**
   - Duplicates UI components into `src/app/naanas-space/thailand-2027-v2/` and adds a `v2 Mobile Companion` banner link on [`../../page.tsx`](../../page.tsx#L37-L52).
   - Re-exports [`types.ts`](../../thailand-2027-v2/types.ts), [`useThailandTripState.ts`](../../thailand-2027-v2/hooks/useThailandTripState.ts), and `utils/{calendar,formatters,wardrobe}.ts` from `thailand-2027/`, keeping `STORAGE_KEY`, `ACTOR_STORAGE_KEY`, and `/api/naanas-space/thailand-2027` Upstash Redis storage shared.
3. **Phase 1 Mobile UX Quick Wins (`38f9d33`):**
   - Implements sub-phases `1.1`–`1.6` exclusively in `thailand-2027-v2`: `11px` micro-text floor and `min-h-11` (`44px`) touch targets, `16px` mobile inputs (`text-base sm:text-sm`) + `inputMode="decimal"` without `pattern` + Step I time preset chips, Next.js `viewport` export + `dvh`/`safe-area-inset-bottom`, touch-visible triggers/`Look` label, bottom snackbar/mobile `Top` jump button, and `next/font/google`.

---

## 2. What Is Working Well

- **Clean `v1` isolation & verified shared storage:** Comparing `v1` vs `v2` at `977c780` confirms `v1` UI files were left untouched, shared data modules in `v2` are thin barrel re-exports, and [`thailand-2027-v2.test.tsx`](../../__tests__/thailand-2027-v2.test.tsx#L62-L115) tests bidirectional actor and state sync between `/naanas-space/thailand-2027` and `/naanas-space/thailand-2027-v2`.
- **Sound mobile input & viewport foundations:** Switching numeric currency/expense fields to `type="text" inputMode="decimal"` without `pattern` prevents decimal entry bugs on Gboard/Android Chrome, `text-base sm:text-sm` on `<input>` and `<select>` prevents mobile focus auto-zoom, and exporting `viewportFit: "cover"`, `themeColor: "#F6F1E7"`, and `interactiveWidget: "resizes-content"` aligns viewport and soft-keyboard behavior.
- **Thoughtful progressive touch affordances:** Keeping `SWITCH TO V1 CLASSIC` hidden on `< sm` in [`TopEditorialBar.tsx`](../../thailand-2027-v2/components/TopEditorialBar.tsx#L34-L41), showing `Expand` by default on touch viewports in [`PolaroidOutfitCard.tsx`](../../thailand-2027-v2/components/PolaroidOutfitCard.tsx#L454-L459), and adding a mobile `Look` label alongside the Step I hanger icon in [`StepItinerary.tsx`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L1050-L1052) improve discoverability without cluttering desktop viewports.

---

## 3. Review Findings (`38f9d33`)

### High Severity (Bugs)

1. **`next/font/google` CSS variables are clobbered by inline `style`, and `DS-Digital` was removed without a replacement** — [`thailand-2027-v2/layout.tsx`](../../thailand-2027-v2/layout.tsx#L53-L66)
   - The wrapper `<div>` attaches `${dmSerifDisplay.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${orbitron.variable}` in `className`, which bind the hashed `next/font` family names onto `--font-editorial-serif`, `--font-editorial-sans`, `--font-editorial-mono`, and `--font-digital`.
   - However, lines `55–61` immediately overwrite all four CSS custom properties in the inline `style` prop with static unhashed strings (`"'DM Serif Display', Georgia, serif"`, etc.). Because `next/font/google` registers hashed `@font-face` names rather than literal `'DM Serif Display'`, the inline strings override the hashed variables and force fallback to Georgia / `system-ui` / `monospace`.
   - Additionally, `v2/layout.tsx` removed the `@import url('https://fonts.cdnfonts.com/css/ds-digital')` rule from [`thailand-2027/layout.tsx`](../layout.tsx#L25) without adding `next/font/local` for `DS-Digital`, leaving [`chronometerDigitalStyle`](../../thailand-2027-v2/styles.tsx#L68-L73) without `DS-Digital`.
   - [`thailand-2027-v2.test.tsx`](../../__tests__/thailand-2027-v2.test.tsx#L140-L150) only asserts `min-h-dvh`, `fontSizeAdjust: "from-font"`, and `container.querySelector("style") === null`, so it did not catch the inline override.
   - **Recommended fix:** Remove the four `--font-*` keys from inline `style` so the `next/font/google` class variables apply, and either bundle `DS-Digital` via `next/font/local` or map `--font-digital` directly.

2. **JSX renders literal `"&approx;"` instead of `"≈"`** — [`QuickPocketDesk.tsx`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L57), [`StepBudgetAndLedger.tsx`](../../thailand-2027-v2/components/steps/StepBudgetAndLedger.tsx#L83)
   - Both components use `&approx;` in JSX (`INSTANT CURRENCY (1 GBP &approx; {exchangeRate} THB)` and `BENCHMARK: 1 GBP &approx; {exchangeRate.toFixed(2)} THB`).
   - Verified with both `typescript.transpileModule` and `next/dist/build/swc`: JSX text parsing does not recognize HTML5 `&approx;` and compiles it verbatim to `"&approx;"` in rendered text.
   - **Recommended fix:** Replace `&approx;` with `&asymp;` or `≈`.

### Medium Severity

3. **Mobile copy snackbar overlaps/crowds the `Quick Tools` FAB when bottom safe-area inset is present** — [`thailand-2027-v2/page.tsx`](../../thailand-2027-v2/page.tsx#L148-L152) & [`QuickPocketDesk.tsx`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L31)
   - `QuickPocketDesk` mounts inside `fixed bottom-5 left-5 z-40 pb-[env(safe-area-inset-bottom)]` with a `min-h-11` (`44px`) trigger button (`L183`), placing its top edge at `64px + env(safe-area-inset-bottom)` (~`84–98px` on gesture/home-bar devices).
   - Meanwhile, the `COPIED TO FOLIO` snackbar in `page.tsx:151` uses `fixed bottom-20 inset-x-4 ... z-50` (`80px` from bottom without `safe-area-inset-bottom`), allowing it to collide with the `Quick Tools` button whenever `env(safe-area-inset-bottom)` &ge; `16px`.
   - **Recommended fix:** Include `env(safe-area-inset-bottom)` in the snackbar bottom offset (e.g., `bottom-[calc(5.5rem+env(safe-area-inset-bottom))]`) or coordinate placement with Phase 2's bottom navigation bar.

4. **Phase 1 `StickyStepNav` increases vertical sticky header height on mobile scroll** — [`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx#L274-L295)
   - Raising step tabs and day ruler chips to `min-h-11` while keeping the 2&times;3 step grid inside the `< sm` sticky wrapper, then appending an extra `sm:hidden` `"Thailand '27 Dossier / Top"` row whenever `isScrolled` triggers, leaves less scrolling viewport on phones in Phase 1 prior to Phase 2's navigation restructure.

5. **Overlaid `min-h-11` chip crowds `PolaroidOutfitCard` photos on narrow screens** — [`PolaroidOutfitCard.tsx`](../../thailand-2027-v2/components/PolaroidOutfitCard.tsx#L591-L614)
   - Applying `min-h-11` (`44px`) to the top-left `✦ Inspiration` / `✓ Owned` toggle button inside the `aspect-[4/3]` collage alongside the touch-visible `Expand` pill (`top-1.5 right-1.5`) covers more garment imagery on 360–390px viewports. Moving that toggle into card chrome below the image preserves a 44px touch target without obscuring thumbnails.

### Low Severity & Remaining Gaps

- **Missed `tel:` inline link tap target:** In [`DriverCardModal.tsx`](../../thailand-2027-v2/components/DriverCardModal.tsx#L86-L91), the reception telephone `<a href="tel:...">` lacks `min-h-11` / block or inline-flex touch padding.
- **Unnormalized `parseFloat` decimal inputs:** [`thailand-2027-v2/page.tsx`](../../thailand-2027-v2/page.tsx#L100-L118) and [`StepBudgetAndLedger.tsx`](../../thailand-2027-v2/components/steps/StepBudgetAndLedger.tsx#L45) pass raw strings to `parseFloat()`, silently truncating locale commas (`"22,47"` &rarr; `22`) or trailing characters instead of normalizing commas/validating numeric strings.
- **Remaining mouse-centric `title=` tooltips & unused export:** ~25 `title=` attributes remain across `v2` (e.g., `"Click to unassign Day ..."` in [`PolaroidOutfitCard.tsx`](../../thailand-2027-v2/components/PolaroidOutfitCard.tsx#L709), calendar/edit buttons in [`StepItinerary.tsx`](../../thailand-2027-v2/components/steps/StepItinerary.tsx#L1010-L1065)); and `MOBILE_TYPE_TOKENS` exported in [`thailand-2027-v2/styles.tsx`](../../thailand-2027-v2/styles.tsx#L46-L56) is currently unused anywhere in `v2`.
- **`v2` component test coverage gap:** At `38f9d33`, `v2`'s [`PolaroidOutfitCard.test.tsx`](../../thailand-2027-v2/components/__tests__/PolaroidOutfitCard.test.tsx) and [`StickyStepNav.test.tsx`](../../thailand-2027-v2/components/__tests__/StickyStepNav.test.tsx) are exact copies of `v1`'s tests, leaving `StickyStepNav`'s `sm:hidden` `Top` strip and `QuickPocketDesk`'s mobile close/trigger controls untested there.
- **Planning asset duplication & doc drift:** [`thailand_2027_mobile_ux_plan.html`](./thailand_2027_mobile_ux_plan.html) (~2.0 MB, 2,100 lines) embeds all 12 screenshots as `data:image/png;base64` strings even though the same 12 PNGs (~1.5 MB) are also committed in `./screenshots/`; referencing `./screenshots/*.png` avoids ~1.5 MB of duplicated payload in git history. Separately, [`../README.md`](../README.md#L110) and [`../thailand_2027_context_handoff.md`](../thailand_2027_context_handoff.md#L113) state edits are `"debounced-synced (600ms)"`, whereas [`../hooks/useThailandTripState.ts`](../hooks/useThailandTripState.ts#L130-L135) currently triggers an immediate `PUT` (matching pending debounce notes in open decisions `D3`/`D4`).

---

## 4. Verification Status at Time of Review

- **Local test run skipped on dirty working tree:** Jest was not re-run locally against commit `38f9d33` because the local working directory contained uncommitted Phase 2 edits.
- **PR-reported checks:** PR #4's description reports `npx jest ...` passing **6/6 suites (73/73 tests)** at `38f9d33`, and the Vercel preview bot comment reports status **Ready**.

---

## 5. Verification & Resolution Log (2026-11-14)

Every finding above was independently verified against both commit `38f9d33` and the local Phase 2 working tree. All 10 findings were confirmed accurate for `38f9d33`:

1. **[HIGH — Confirmed & Fixed]** `next/font/google` CSS variables clobbered + `DS-Digital` fallback + Vercel build loader crash ([`thailand-2027-v2/layout.tsx`](../../thailand-2027-v2/layout.tsx#L1-L72), [`thailand-2027-v2/styles.tsx`](../../thailand-2027-v2/styles.tsx#L68-L72))
   - **Verification:** Confirmed inline `style` overwrote `--font-editorial-serif`, `--font-editorial-sans`, `--font-editorial-mono`, and `--font-digital`, masking the `next/font` variable classes, and `chronometerDigitalStyle` still listed unloaded `'DS-Digital'`. Additionally, Vercel deployment `dpl_GwiYExy1nz99u5qqzfpt9vHzvCGL` on `3376872` failed in `@next/font/dist/google/loader.js:122` (`TypeError: Cannot read properties of null (reading '1')` when Google Fonts served extensionless `/l/font?kit=...` URLs during build in `iad1`).
   - **Resolution:** Removed the four `--font-*` inline overrides from `layout.tsx`, dropped `'DS-Digital'` from `chronometerDigitalStyle` in `styles.tsx` so `--font-digital` (`Orbitron`) resolves cleanly, and migrated `thailand-2027-v2/layout.tsx` from `next/font/google` to `next/font/local` with the five bundled `latin` `.woff2` files in `thailand-2027-v2/fonts/` so builds are self-contained and offline-deterministic. Added regression assertions in [`thailand-2027-v2.test.tsx`](../../__tests__/thailand-2027-v2.test.tsx).

2. **[HIGH — Confirmed & Fixed]** Literal `"&approx;"` rendered in JSX ([`QuickPocketDesk.tsx`](../../thailand-2027-v2/components/QuickPocketDesk.tsx#L57), [`StepBudgetAndLedger.tsx`](../../thailand-2027-v2/components/steps/StepBudgetAndLedger.tsx#L83))
   - **Verification:** Confirmed JSX renders `&approx;` literally in both components (`QuickPocketDesk.tsx` was also fixed independently in Phase 2).
   - **Resolution:** Replaced `&approx;` with numeric entity `&#8776;` (`≈`) in both files and added regression checks in `thailand-2027-v2.test.tsx`.

3. **[MEDIUM — Confirmed & Fixed]** Copy snackbar lacked `env(safe-area-inset-bottom)` / could collide with `Quick Tools` FAB ([`thailand-2027-v2/page.tsx`](../../thailand-2027-v2/page.tsx#L148-L152))
   - **Verification:** Confirmed `bottom-20` omitted `env(safe-area-inset-bottom)` on gesture-bar devices (and in Phase 2, `Quick Tools` moves into the fixed bottom bar while the snackbar still needs safe-area clearance above the bar).
   - **Resolution:** Updated the mobile bottom offset to `bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-6` and updated the snackbar test assertion.

4. **[MEDIUM — Confirmed for `38f9d33` · Resolved in Phase 2]** Sticky header height regression on mobile scroll ([`StickyStepNav.tsx`](../../thailand-2027-v2/components/StickyStepNav.tsx))
   - **Verification:** Confirmed Phase 1 kept the 2×3 top-pinned nav + `"Top"` strip at `38f9d33`, while the Phase 2 working tree moves `<nav>` to a `fixed bottom-0` 5-slot bar on `< sm` and slims Steps II–VI to a ~44px top header.
   - **Resolution:** Resolved as part of the Phase 2 navigation restructure (kept separate from the PR #4 Phase 1 hotfix commit).

5. **[MEDIUM — Confirmed · Tracked for Phase 4.4]** `min-h-11` overlay chip crowds `PolaroidOutfitCard` photos ([`PolaroidOutfitCard.tsx`](../../thailand-2027-v2/components/PolaroidOutfitCard.tsx#L591-L614))
   - **Verification:** Confirmed the `44px` `✦ Inspiration` / `✓ Owned` toggle button sits inside the `aspect-[4/3]` collage overlay on `< sm`.
   - **Resolution:** Scheduled for **Phase 4.4** (`PolaroidOutfitCard` badge & action strip decoupling).

6. **[LOW — Confirmed & Fixed]** `DriverCardModal.tsx` reception `tel:` link tap target ([`DriverCardModal.tsx`](../../thailand-2027-v2/components/DriverCardModal.tsx#L86-L91))
   - **Verification:** Confirmed `<a href="tel:...">` lacked `min-h-11` mobile touch target sizing.
   - **Resolution:** Added `min-h-11 sm:min-h-0 inline-flex items-center px-2 -mx-2`.

7. **[LOW — Confirmed & Fixed]** Unnormalized `parseFloat` decimal inputs ([`thailand-2027-v2/page.tsx`](../../thailand-2027-v2/page.tsx#L100-L118), [`StepBudgetAndLedger.tsx`](../../thailand-2027-v2/components/steps/StepBudgetAndLedger.tsx#L45))
   - **Verification:** Confirmed raw strings passed directly to `parseFloat()` truncated locale commas (`"22,47"` → `22`).
   - **Resolution:** Normalized commas via `.replace(",", ".")` prior to `parseFloat()` in `handleThbChange`, `handleGbpChange`, and `handleAddExpense`, and added comma-decimal unit tests.

8. **[LOW — Confirmed · Tracked for Phases 3–4]** Remaining `title=` tooltips & unused `MOBILE_TYPE_TOKENS` ([`styles.tsx`](../../thailand-2027-v2/styles.tsx#L46-L56))
   - **Verification:** Confirmed `MOBILE_TYPE_TOKENS` is exported in `styles.tsx` (tested in `thailand-2027-v2.test.tsx`) while components apply classes inline, and ~25 desktop `title=` attributes remain in `PolaroidOutfitCard.tsx` and `StepItinerary.tsx`.
   - **Resolution:** Remaining tooltip and token cleanups stay scheduled with the Phase 3/4 component refactors.

9. **[LOW — Confirmed · Incrementally Resolved]** `v2` component test coverage gap ([`StickyStepNav.test.tsx`](../../thailand-2027-v2/components/__tests__/StickyStepNav.test.tsx), [`PolaroidOutfitCard.test.tsx`](../../thailand-2027-v2/components/__tests__/PolaroidOutfitCard.test.tsx))
   - **Verification:** Confirmed both component test files mirrored `v1` at `38f9d33` while Phase 1 assertions were added to `thailand-2027-v2.test.tsx`.
   - **Resolution:** `thailand-2027-v2.test.tsx` expanded for PR #4 fixes; `StickyStepNav.test.tsx` expanded in Phase 2; `PolaroidOutfitCard.test.tsx` scheduled to expand in Phase 4.

10. **[LOW — Confirmed & Partially Addressed]** Duplicated base64 screenshots in `thailand_2027_mobile_ux_plan.html` & `"600ms"` debounce doc mismatch ([`../README.md`](../README.md#L110), [`../thailand_2027_context_handoff.md`](../thailand_2027_context_handoff.md#L113), [`../hooks/useThailandTripState.ts`](../hooks/useThailandTripState.ts#L130-L135))
    - **Verification:** Confirmed `useThailandTripState.ts` issues an immediate `PUT` (600ms debouncing is scheduled for **Phase 5.4**), and `thailand_2027_mobile_ux_plan.html` embeds base64 PNGs alongside `./screenshots/*.png`.
    - **Resolution:** Updated `README.md` and `thailand_2027_context_handoff.md` to clarify 600ms debouncing lands in Phase 5.4; HTML screenshot asset consolidation deferred so the self-contained HTML artifact remains portable until doc wrap-up.
