import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import NaanasSpaceHub from "../page";
import ThailandTripDashboardV1 from "../thailand-2027/page";
import ThailandTripDashboardV2 from "../thailand-2027-v2/page";
import ThailandDossierLayout, {
  viewport as v2Viewport,
} from "../thailand-2027-v2/layout";
import { CreateLookModal } from "../thailand-2027-v2/components/CreateLookModal";
import { DriverCardModal } from "../thailand-2027-v2/components/DriverCardModal";
import { PolaroidOutfitCard } from "../thailand-2027-v2/components/PolaroidOutfitCard";
import {
  detectActiveTripDay,
  formatDualTimezoneClock,
  isActivityPast,
  isTravelTransitDay,
  parseActivityTimelineWindow,
  resolveCompanionGrabTarget,
  resolveDayCompanionStatus,
  resolveHotelIdForDay,
} from "../thailand-2027-v2/utils/companion";
import { DEFAULT_WARDROBE_OUTFITS, TRIP_DAYS } from "@/lib/thailandTripData";
import {
  STORAGE_KEY as V1_STORAGE_KEY,
  ACTOR_STORAGE_KEY as V1_ACTOR_KEY,
} from "../thailand-2027/types";
import {
  STORAGE_KEY as V2_STORAGE_KEY,
  ACTOR_STORAGE_KEY as V2_ACTOR_KEY,
} from "../thailand-2027-v2/types";

describe("Thailand 2027 v2 Route & Cross-Route Shared State", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("exposes both v1 classic and v2 mobile links on Naana's Space hub without breaking v1 lookup", () => {
    render(<NaanasSpaceHub />);

    const v1Link = screen.getByRole("link", {
      name: /Thailand 2027: Naana's Birthday Escape/i,
    });
    expect(v1Link).toHaveAttribute("href", "/naanas-space/thailand-2027");

    const v2Link = screen.getByRole("link", {
      name: /Open Thailand 2027 v2/i,
    });
    expect(v2Link).toHaveAttribute("href", "/naanas-space/thailand-2027-v2");
  });

  it("renders Thailand 2027 v2 hero, default itinerary view, and v1 classic switcher link", () => {
    render(<ThailandTripDashboardV2 />);

    expect(
      screen.getByRole("heading", { name: /Thailand 2027 Escape/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Interactive Day-by-Day Itinerary & Planner/i)
    ).toBeInTheDocument();

    const switchToV1Link = screen.getByRole("link", {
      name: /SWITCH TO V1 CLASSIC/i,
    });
    expect(switchToV1Link).toHaveAttribute(
      "href",
      "/naanas-space/thailand-2027"
    );
  });

  it("shares identical storage keys and syncs edits bidirectionally between v1 and v2", () => {
    expect(V2_STORAGE_KEY).toBe(V1_STORAGE_KEY);
    expect(V2_ACTOR_KEY).toBe(V1_ACTOR_KEY);

    // 1. Mutate state and active actor in v2
    const v2Render = render(<ThailandTripDashboardV2 />);

    fireEvent.click(screen.getByRole("button", { name: /^Shaq$/i }));
    expect(window.localStorage.getItem(V2_ACTOR_KEY)).toBe("Shaq");

    fireEvent.click(screen.getByRole("button", { name: /Prep & Apps/i }));
    const v2GrabCheckbox = screen.getByRole("checkbox", {
      name: /Southeast Asia's Uber equivalent/i,
    });
    expect(v2GrabCheckbox).not.toBeChecked();
    fireEvent.click(v2GrabCheckbox);
    expect(v2GrabCheckbox).toBeChecked();

    const rawAfterV2 = window.localStorage.getItem(V2_STORAGE_KEY);
    expect(rawAfterV2).not.toBeNull();
    v2Render.unmount();

    // 2. Render v1 and confirm v2's actor and checklist changes are reflected
    const v1Render = render(<ThailandTripDashboardV1 />);

    expect(screen.getByRole("button", { name: /^Shaq$/i })).toHaveClass(
      "bg-[#13382E]"
    );

    fireEvent.click(screen.getByRole("button", { name: /Prep & Apps/i }));
    const v1GrabCheckbox = screen.getByRole("checkbox", {
      name: /Southeast Asia's Uber equivalent/i,
    });
    expect(v1GrabCheckbox).toBeChecked();

    // 3. Mutate in v1 (switch back to Naana & add a custom packing item) and verify in v2
    fireEvent.click(screen.getAllByRole("button", { name: /^Naana$/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /Packing Studio/i }));
    fireEvent.change(
      screen.getByPlaceholderText(/Add a custom item to pack/i),
      { target: { value: "Travel Adapter" } }
    );
    fireEvent.click(screen.getByRole("button", { name: /^\+ Add$/i }));
    expect(screen.getByText("Travel Adapter")).toBeInTheDocument();
    v1Render.unmount();

    // 4. Re-mount v2 and confirm v1 edits are live
    render(<ThailandTripDashboardV2 />);
    expect(screen.getByRole("button", { name: /^Naana$/i })).toHaveClass(
      "bg-[#A8442A]"
    );
    fireEvent.click(screen.getByRole("button", { name: /Packing Studio/i }));
    expect(screen.getByText("Travel Adapter")).toBeInTheDocument();
  });
});

describe("Thailand 2027 v2 Phase 1 Mobile Foundations", () => {
  beforeEach(() => {
    window.localStorage.clear();
    HTMLDialogElement.prototype.show = function show() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("exports viewport metadata with cover fit, cream themeColor, interactiveWidget, and renders min-h-dvh without @import style", () => {
    expect(v2Viewport).toEqual(
      expect.objectContaining({
        width: "device-width",
        initialScale: 1,
        viewportFit: "cover",
        themeColor: "#F6F1E7",
        interactiveWidget: "resizes-content",
      })
    );

    const { container } = render(
      <ThailandDossierLayout>
        <main>Dossier Body</main>
      </ThailandDossierLayout>
    );

    const shell = container.firstElementChild as HTMLElement;
    expect(shell).toHaveClass("min-h-dvh");
    expect(shell.style.fontSizeAdjust).toBe("from-font");
    expect(shell.style.getPropertyValue("--font-editorial-serif")).toBe("");
    expect(shell.style.getPropertyValue("--font-editorial-sans")).toBe("");
    expect(shell.style.getPropertyValue("--font-editorial-mono")).toBe("");
    expect(shell.style.getPropertyValue("--font-digital")).toBe("");
    expect(container.querySelector("style")).toBeNull();
  });

  it("uses text + decimal inputMode without pattern on QuickPocketDesk and StepBudgetAndLedger currency inputs and converts 22.47 / 22,47 GBP", () => {
    render(<ThailandTripDashboardV2 />);

    // Quick Pocket Desk
    fireEvent.click(screen.getByRole("button", { name: /Quick Tools/i }));
    expect(screen.getByText(/1 GBP ≈ 44\.5 THB/i)).toBeInTheDocument();
    expect(screen.queryByText(/&approx;/i)).toBeNull();
    const pocketThb = screen.getByLabelText(/Quick THB input/i);
    const pocketGbp = screen.getByLabelText(/Quick GBP input/i);
    for (const input of [pocketThb, pocketGbp]) {
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("inputmode", "decimal");
      expect(input).not.toHaveAttribute("pattern");
    }

    fireEvent.change(pocketGbp, { target: { value: "22.47" } });
    expect((pocketThb as HTMLInputElement).value).toBe("1000");

    fireEvent.change(pocketGbp, { target: { value: "22,47" } });
    expect((pocketThb as HTMLInputElement).value).toBe("1000");

    fireEvent.change(pocketThb, { target: { value: "2225,5" } });
    expect((pocketGbp as HTMLInputElement).value).toBe("50.01");

    // Step VI: Budget & THB
    fireEvent.click(screen.getByRole("button", { name: /Budget & THB/i }));
    expect(screen.getByText(/BENCHMARK: 1 GBP ≈ 44\.50 THB/i)).toBeInTheDocument();
    expect(screen.queryByText(/&approx;/i)).toBeNull();
    const budgetThb = screen.getByLabelText(/SIAMESE BAHT/i);
    const budgetGbp = screen.getByLabelText(/BRITISH STERLING/i);
    const expTitle = screen.getByPlaceholderText(/Experience or reservation/i);
    const expAmount = screen.getByPlaceholderText(/^Amount$/i);

    for (const input of [budgetThb, budgetGbp, expAmount]) {
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("inputmode", "decimal");
      expect(input).not.toHaveAttribute("pattern");
    }
    expect(expTitle).toHaveClass("text-base", "sm:text-sm", "min-h-11");
    expect(expAmount).toHaveClass("text-base", "sm:text-sm", "min-h-11");

    const selects = document.querySelectorAll("select");
    expect(selects.length).toBeGreaterThanOrEqual(3);
    selects.forEach((sel) => {
      expect(sel).toHaveClass("text-base", "sm:text-sm", "min-h-11");
    });

    fireEvent.change(budgetGbp, { target: { value: "20" } });
    fireEvent.change(budgetGbp, { target: { value: "22.47" } });
    expect((budgetThb as HTMLInputElement).value).toBe("1000");
  });

  it("enforces 16px mobile floor, min-h-11 targets, and time preset chips on StepItinerary and StepPackingStudio", () => {
    render(<ThailandTripDashboardV2 />);

    // StepItinerary create activity form
    const addEntryButtons = screen.getAllByRole("button", {
      name: /INSCRIBE BESPOKE RESERVATION OR NOTE/i,
    });
    fireEvent.click(addEntryButtons[0]);

    const timeInput = screen.getByPlaceholderText(/Time \(e\.g\. 19:30 ICT\)/i);
    const titleInput = screen.getByPlaceholderText(
      /Reservation, excursion, or birthday note/i
    );
    expect(timeInput).toHaveAttribute("type", "text");
    expect(timeInput).toHaveClass("text-base", "sm:text-sm", "min-h-11");
    expect(titleInput).toHaveClass("text-base", "sm:text-sm", "min-h-11");

    for (const preset of ["09:00 ICT", "13:00 ICT", "19:30 ICT", "Flexible"]) {
      expect(
        screen.getByRole("button", { name: preset })
      ).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("button", { name: "19:30 ICT" }));
    expect((timeInput as HTMLInputElement).value).toBe("19:30 ICT");

    // StepPackingStudio form controls
    fireEvent.click(screen.getByRole("button", { name: /Packing Studio/i }));
    const packInput = screen.getByPlaceholderText(/Add a custom item to pack/i);
    expect(packInput).toHaveClass("text-base", "sm:text-sm", "min-h-11");
    document.querySelectorAll("select").forEach((sel) => {
      expect(sel).toHaveClass("text-base", "sm:text-sm", "min-h-11");
    });
  });

  it("enforces Phase 1 inputs, select sizing, and dynamic height inside CreateLookModal", () => {
    render(
      <CreateLookModal
        isOpen={true}
        onClose={jest.fn()}
        onCreateOutfit={jest.fn()}
      />
    );

    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveClass("max-h-[90dvh]");

    const titleInput = screen.getByLabelText(/LOOK TITLE/i);
    const ownerSelect = screen.getByLabelText(/CURATED FOR/i);
    const dressCodeSelect = screen.getByLabelText(/DRESS CODE PROFILE/i);
    const urlInput = screen.getByLabelText(/Garment URL/i);
    const garmentCatSelect = screen.getByLabelText(/Garment Category/i);
    const garmentLabelInput = screen.getByLabelText(/Garment Label/i);

    expect(urlInput).toHaveAttribute("type", "url");
    expect(urlInput).toHaveAttribute("inputmode", "url");

    for (const ctrl of [
      titleInput,
      ownerSelect,
      dressCodeSelect,
      urlInput,
      garmentCatSelect,
      garmentLabelInput,
    ]) {
      expect(ctrl).toHaveClass("text-base", "sm:text-sm", "min-h-11");
    }
  });

  it("shows Android bottom-snackbar toast classes when copying and keeps Polaroid Expand pill visible on touch", () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    const { unmount } = render(<ThailandTripDashboardV2 />);
    fireEvent.click(screen.getByRole("button", { name: /Bookings Vault/i }));
    fireEvent.click(screen.getAllByText("6I8SOP")[0]);

    const toastText = screen.getByText(/Copied to Folio/i);
    const toastContainer = toastText.closest("div.fixed") as HTMLElement;
    expect(toastContainer).toHaveClass(
      "bottom-[calc(5rem+env(safe-area-inset-bottom))]",
      "inset-x-4",
      "sm:bottom-6",
      "sm:right-6"
    );
    unmount();

    render(<PolaroidOutfitCard outfit={DEFAULT_WARDROBE_OUTFITS[0]} />);
    const expandPills = screen.getAllByText(/Expand/i);
    const tileExpandPill = expandPills.find((el) =>
      el.className.includes("pointer-events-none")
    );
    expect(tileExpandPill).toBeDefined();
    expect(tileExpandPill).toHaveClass("opacity-100", "sm:opacity-0");
  });
});

describe("Thailand 2027 v2 Phase 2 Navigation & Layout Restructure", () => {
  beforeEach(() => {
    window.localStorage.clear();
    HTMLDialogElement.prototype.show = function show() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("mounts a single responsive <nav> with the 5-slot mobile bottom bar and opens the More dialog sheet to switch steps", () => {
    render(<ThailandTripDashboardV2 />);

    const navs = screen.getAllByRole("navigation", {
      name: /Trip Dashboard Views/i,
    });
    expect(navs).toHaveLength(1);
    expect(navs[0]).toHaveClass(
      "fixed",
      "bottom-0",
      "grid-cols-5",
      "sm:static",
      "pb-[env(safe-area-inset-bottom)]"
    );

    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Vault")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Open Quick Pocket Desk/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Pack")).toBeInTheDocument();

    const moreBtn = screen.getByRole("button", {
      name: /More steps and tools/i,
    });
    fireEvent.click(moreBtn);

    const moreDialog = document.querySelector(
      "dialog[aria-labelledby='more-sheet-title']"
    );
    expect(moreDialog).toBeInTheDocument();
    expect(moreDialog).toHaveAttribute("open");

    fireEvent.click(
      screen.getByRole("button", { name: /Step III .* Pre-Departure/i })
    );
    expect(moreDialog).not.toHaveAttribute("open");
    expect(moreDialog).toBeEmptyDOMElement();
    expect(
      screen.getByRole("checkbox", { name: /Southeast Asia's Uber equivalent/i })
    ).toBeInTheDocument();

    fireEvent.click(moreBtn);
    fireEvent.click(
      screen.getByRole("button", { name: /Step V .* Cultural Guide/i })
    );
    expect(
      document.querySelector('a[href="tel:1155"]')
    ).toBeInTheDocument();

    fireEvent.click(moreBtn);
    fireEvent.click(
      screen.getByRole("button", { name: /Step VI .* Budget Ledger/i })
    );
    expect(screen.getByLabelText(/SIAMESE BAHT/i)).toBeInTheDocument();
  });

  it("renders compact TopEditorialBar on mobile with single DOM S/N avatar chips and mobile-hidden Change Log button", () => {
    render(<ThailandTripDashboardV2 />);

    expect(screen.getByText("Thailand '27")).toHaveClass("sm:hidden");

    const shaqBtns = screen.getAllByRole("button", { name: /^Shaq$/i });
    const naanaBtns = screen.getAllByRole("button", { name: /^Naana$/i });
    expect(shaqBtns).toHaveLength(1);
    expect(naanaBtns).toHaveLength(1);
    expect(shaqBtns[0]).toHaveTextContent(/SShaq/);
    expect(naanaBtns[0]).toHaveTextContent(/NNaana/);

    const changeLogBtn = screen.getByRole("button", { name: /CHANGE LOG/i });
    expect(changeLogBtn).toHaveClass("hidden", "sm:inline-flex");
  });

  it("keeps #masthead-chronometer mounted while toggling collapsible mobile masthead dossier", () => {
    render(<ThailandTripDashboardV2 />);

    expect(document.getElementById("masthead-chronometer")).toBeInTheDocument();
    expect(
      screen.getByTestId("mobile-compact-countdown")
    ).toBeInTheDocument();
    expect(screen.getByTestId("mobile-readiness-ring")).toBeInTheDocument();

    const extendedDossier = document.getElementById(
      "masthead-extended-dossier"
    );
    expect(extendedDossier).toHaveClass("hidden", "sm:block");

    const toggleBtn = screen.getByRole("button", {
      name: /Show full dossier/i,
    });
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
    expect(toggleBtn).toHaveTextContent(/Hide full dossier/i);
    expect(extendedDossier).toHaveClass("block");
  });

  it("enables snap-scrolling on Step I Date Ruler and navigates single days via Prev/Next Day buttons", () => {
    render(<ThailandTripDashboardV2 />);

    const ruler = screen.getByTestId("step-date-ruler");
    expect(ruler).toHaveClass("snap-x", "snap-mandatory");

    fireEvent.click(screen.getByRole("button", { name: /D00/i }));
    expect(screen.getByTestId("single-day-pagination")).toBeInTheDocument();
    expect(document.getElementById("day-card-0")).toBeInTheDocument();
    expect(document.getElementById("day-card-1")).toBeNull();

    const prevBtn = screen.getByRole("button", { name: /Prev Day/i });
    const nextBtn = screen.getByRole("button", { name: /Next Day/i });
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);
    expect(document.getElementById("day-card-1")).toBeInTheDocument();
    expect(document.getElementById("day-card-0")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Prev Day/i }));
    expect(document.getElementById("day-card-0")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Full Spread \(All 11 Days\)/i })
    );
    expect(screen.queryByTestId("single-day-pagination")).toBeNull();
    expect(document.getElementById("day-card-1")).toBeInTheDocument();
  });

  it("opens QuickPocketDesk as a native dialog bottom sheet with THB presets, stacked PNR chips, SOS dials, and Log Expense shortcut", () => {
    render(<ThailandTripDashboardV2 />);

    fireEvent.click(
      screen.getByRole("button", { name: /Open Quick Pocket Desk/i })
    );

    const dialog = document.querySelector(
      "dialog[aria-labelledby='pocket-desk-title']"
    );
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("open");
    expect(dialog?.textContent).toContain("≈");

    const thbInput = screen.getByLabelText(/Quick THB input/i) as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "500 ฿" }));
    expect(thbInput.value).toBe("500");

    const pavilionsBtn = screen
      .getByText("78165SH099776")
      .closest("button") as HTMLButtonElement;
    expect(pavilionsBtn).toHaveClass("flex-col");
    expect(
      pavilionsBtn.querySelectorAll("span").length
    ).toBeGreaterThanOrEqual(2);

    expect(dialog?.querySelector('a[href="tel:1155"]')).toBeInTheDocument();
    expect(dialog?.querySelector('a[href="tel:1669"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Log Expense/i }));
    expect(dialog).not.toHaveAttribute("open");
    expect(dialog).toBeEmptyDOMElement();
    expect(screen.getByLabelText(/SIAMESE BAHT/i)).toBeInTheDocument();
  });

  it("shows in-sheet COPIED TO FOLIO confirmation on mobile QuickPocketDesk, restores focus on close, and opens non-modally on desktop", () => {
    const origMatchMedia = window.matchMedia;
    const origShow = HTMLDialogElement.prototype.show;
    const origShowModal = HTMLDialogElement.prototype.showModal;

    try {
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      // Mobile (< 640px)
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })) as unknown as typeof window.matchMedia;

      const showSpy = jest.fn(function show(this: HTMLDialogElement) {
        this.setAttribute("open", "");
      });
      const showModalSpy = jest.fn(function showModal(this: HTMLDialogElement) {
        this.setAttribute("open", "");
      });
      HTMLDialogElement.prototype.show = showSpy;
      HTMLDialogElement.prototype.showModal = showModalSpy;

      const { unmount } = render(<ThailandTripDashboardV2 />);
      const pocketBtn = screen.getByRole("button", {
        name: /Open Quick Pocket Desk/i,
      });
      expect(pocketBtn).toHaveAttribute("aria-expanded", "false");
      expect(pocketBtn).toHaveAttribute("aria-haspopup", "dialog");

      pocketBtn.focus();
      fireEvent.click(pocketBtn);
      expect(showModalSpy).toHaveBeenCalledTimes(1);
      expect(showSpy).not.toHaveBeenCalled();
      expect(pocketBtn).toHaveAttribute("aria-expanded", "true");

      // Tap PNR chip without closing Pocket Desk: inside-dialog status appears cleanly
      fireEvent.click(screen.getByText("6I8SOP"));
      const dialog = document.querySelector(
        "dialog[aria-labelledby='pocket-desk-title']"
      ) as HTMLDialogElement;
      expect(dialog).toHaveAttribute("open");
      const inSheetStatus = screen.getByTestId("pocket-desk-copy-status");
      expect(dialog.contains(inSheetStatus)).toBe(true);
      expect(inSheetStatus).toHaveTextContent(/COPIED TO FOLIO/i);
      expect(inSheetStatus).toHaveTextContent(/6I8SOP/i);

      // Closing returns focus cleanly to invoker
      fireEvent.click(screen.getByRole("button", { name: /CLOSE/i }));
      expect(dialog).not.toHaveAttribute("open");
      expect(document.activeElement).toBe(pocketBtn);
      unmount();

      // Desktop (>= 640px)
      showSpy.mockClear();
      showModalSpy.mockClear();
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === "(min-width: 640px)",
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })) as unknown as typeof window.matchMedia;

      render(<ThailandTripDashboardV2 />);
      fireEvent.click(screen.getByRole("button", { name: /Quick Tools/i }));
      expect(showSpy).toHaveBeenCalledTimes(1);
      expect(showModalSpy).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = origMatchMedia;
      HTMLDialogElement.prototype.show = origShow;
      HTMLDialogElement.prototype.showModal = origShowModal;
    }
  });

  it("clears phaseFilter on Full Spread (All 11 Days), enforces D10 Next Day disabled bound, and scrolls directly to target day card", () => {
    jest.useFakeTimers();
    const scrolledIds: string[] = [];
    const origScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function mockScrollIntoView() {
      scrolledIds.push(this.id);
    };

    try {
      render(<ThailandTripDashboardV2 />);

      // Filter to Bangkok phase (D01-D03 visible; D00 & D10 hidden)
      fireEvent.click(screen.getByRole("button", { name: /II\. Bangkok \(3N\)/i }));
      expect(document.getElementById("day-card-0")).toBeNull();
      expect(document.getElementById("day-card-1")).toBeInTheDocument();

      // Pick D02 from Date Ruler -> exits phase slice cleanly, Full Spread restores all 11 days
      fireEvent.click(screen.getByRole("button", { name: /D02/i }));
      expect(document.getElementById("day-card-2")).toBeInTheDocument();
      expect(document.getElementById("day-card-1")).toBeNull();

      fireEvent.click(
        screen.getByRole("button", { name: /Full Spread \(All 11 Days\)/i })
      );
      act(() => {
        jest.advanceTimersByTime(60);
      });
      expect(document.getElementById("day-card-0")).toBeInTheDocument();
      expect(document.getElementById("day-card-10")).toBeInTheDocument();
      expect(scrolledIds).toContain("itinerary-step-header");

      // Jump to D10 and verify Next Day is disabled and Prev Day scrolls to #day-card-9
      scrolledIds.length = 0;
      fireEvent.click(screen.getByRole("button", { name: /D10/i }));
      expect(screen.getByRole("button", { name: /Next Day/i })).toBeDisabled();
      fireEvent.click(screen.getByRole("button", { name: /Prev Day/i }));
      act(() => {
        jest.advanceTimersByTime(60);
      });
      expect(document.getElementById("day-card-9")).toBeInTheDocument();
      expect(scrolledIds).toContain("day-card-9");
      expect(scrolledIds).not.toContain("step-content-anchor");
    } finally {
      Element.prototype.scrollIntoView = origScrollIntoView;
      jest.useRealTimers();
    }
  });
});

describe("Thailand 2027 v2 Phase 3 Companion Mode, Driver Card & SOS", () => {
  const origInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    HTMLDialogElement.prototype.show = function show() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: origInnerWidth,
    });
  });

  it("detects active trip day with GMT on D00 and ICT on D01–D10 and formats Live Dual Timezone Clock", () => {
    // 4 Feb 2027 afternoon & evening in GMT stays on D00 even after Bangkok passes midnight
    expect(detectActiveTripDay(new Date("2027-02-04T12:00:00Z"))).toBe(0);
    expect(detectActiveTripDay(new Date("2027-02-04T18:30:00Z"))).toBe(0);

    // 5–14 Feb in ICT (UTC+7) maps to Days 1..9, while 14 Feb 07:00Z & 18:00Z map to D10 (London-midnight D10 boundary)
    expect(detectActiveTripDay(new Date("2027-02-05T11:30:00Z"))).toBe(1);
    expect(detectActiveTripDay(new Date("2027-02-09T09:00:00Z"))).toBe(5);
    expect(detectActiveTripDay(new Date("2027-02-13T16:30:00Z"))).toBe(9);
    expect(detectActiveTripDay(new Date("2027-02-14T07:00:00Z"))).toBe(10);
    expect(detectActiveTripDay(new Date("2027-02-14T18:00:00Z"))).toBe(10);

    // Outside trip dates returns null
    expect(detectActiveTripDay(new Date("2027-02-03T12:00:00Z"))).toBeNull();
    expect(detectActiveTripDay(new Date("2027-02-15T12:00:00Z"))).toBeNull();

    const clock = formatDualTimezoneClock(new Date("2027-02-05T09:30:00Z"));
    expect(clock.londonTime).toBe("09:30");
    expect(clock.bangkokTime).toBe("16:30");
    expect(clock.fullLabel).toBe(
      "London (GMT) 09:30 | Bangkok/Phuket (ICT) 16:30"
    );

    // Travel & transit day classification (D03 in Bangkok is false; D04 Bangkok->Phuket is true)
    expect(isTravelTransitDay(0)).toBe(true);
    expect(isTravelTransitDay(1)).toBe(true);
    expect(isTravelTransitDay(3)).toBe(false);
    expect(isTravelTransitDay(4)).toBe(true);
    expect(isTravelTransitDay(9)).toBe(true);
    expect(isTravelTransitDay(10)).toBe(true);

    // Leg-aware hotel & Grab resolution
    expect(resolveHotelIdForDay(0)).toBeNull();
    expect(resolveHotelIdForDay(3)).toBe("shangri-la-bangkok");
    expect(resolveHotelIdForDay(10)).toBeNull();

    const d4Checkout = TRIP_DAYS[4].defaultActivities.find(
      (a) => a.id === "d4-checkout-bkk"
    )!;
    const d4Pavilions = TRIP_DAYS[4].defaultActivities.find(
      (a) => a.id === "d4-pavilions-checkin"
    )!;
    expect(resolveHotelIdForDay(4, d4Checkout)).toBe("shangri-la-bangkok");
    expect(resolveHotelIdForDay(4, d4Pavilions)).toBe("pavilions-phuket");
    expect(
      resolveCompanionGrabTarget(0, TRIP_DAYS[0].defaultActivities[0], null)
    ).toBeNull();
    expect(
      resolveCompanionGrabTarget(10, TRIP_DAYS[10].defaultActivities[0], null)
    ).toBeNull();
    expect(
      resolveCompanionGrabTarget(1, TRIP_DAYS[1].defaultActivities[0], "shangri-la-bangkok")?.label
    ).toBe("Copy Hotel Grab");

    const d1Status = resolveDayCompanionStatus(
      TRIP_DAYS[1].defaultActivities,
      [],
      1,
      new Date("2027-02-05T11:30:00Z")
    );
    expect(d1Status.upNextActivity?.id).toBe("d1-shangrila-checkin");
    expect(d1Status.countdownLabel).toBe("in 1h");
  });

  it("parses multi-timezone overnight D10 flights and treats D01 BKK flight window as active until landing", () => {
    const d10Activities = TRIP_DAYS[10].defaultActivities;
    const shjLayover = d10Activities.find((a) => a.id === "d10-shj-layover")!;
    const shjLgw = d10Activities.find((a) => a.id === "d10-flight-g9265")!;
    const shjLayoverWin = parseActivityTimelineWindow(shjLayover, 10, 0);
    const shjLgwWin = parseActivityTimelineWindow(shjLgw, 10, 1);
    expect(shjLayoverWin.hasClockTime).toBe(true);
    expect(shjLgwWin.hasClockTime).toBe(true);
    expect(shjLayoverWin.sortMinutes).toBeLessThan(shjLgwWin.sortMinutes);

    // D01 "07:50 GST" -> "Duration: 6h 15m • Lands 17:05 ICT Local Time" is active (not past) at 15:00 ICT (08:00Z)
    const d1InFlight = resolveDayCompanionStatus(
      TRIP_DAYS[1].defaultActivities,
      ["d1-shj-layover"],
      1,
      new Date("2027-02-05T08:00:00Z")
    );
    expect(d1InFlight.upNextActivity?.id).toBe("d1-flight-g9816");
    expect(d1InFlight.countdownLabel).toBe("Happening now");

    // Non-clock labels ("Evening • After arrival") are never marked past
    expect(
      isActivityPast(
        { time: "Evening • After arrival", subtitle: "Flexible" },
        2,
        23 * 60 + 50,
        1
      )
    ).toBe(false);
  });

  it("toggles Companion / Today View pre-trip as preview mode (no false NOW/Past), restores Full Spread on toggle off, and opens Driver Modal", () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    jest.useFakeTimers().setSystemTime(new Date("2026-11-14T10:00:00Z"));

    render(<ThailandTripDashboardV2 />);

    // Pre-trip: Companion Mode is off and desktop spread is unchanged
    expect(screen.queryByTestId("top-bar-dual-clock")).toBeNull();
    expect(document.getElementById("day-card-0")).toBeInTheDocument();
    expect(document.getElementById("day-card-10")).toBeInTheDocument();

    const toggleBtn = screen.getByTestId("companion-mode-toggle");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-pressed", "true");

    // Live Dual Clock appears in TopEditorialBar and UP NEXT preview renders on D01 without false NOW or Past warnings
    expect(screen.getByTestId("top-bar-dual-clock")).toHaveTextContent(
      /London \(GMT\) 10:00 \| Bangkok\/Phuket \(ICT\) 17:00/i
    );
    const upNextCard = screen.getByTestId("up-next-card-d1");
    expect(upNextCard).toHaveTextContent(/UP NEXT/i);
    expect(upNextCard).toHaveTextContent(/Preview mode/i);
    expect(upNextCard).toHaveTextContent(/Today's outfit:/i);
    expect(screen.queryByTestId("now-timeline-marker-d1")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Past scheduled time/i })
    ).toBeNull();

    // Quick Hotel Grab copy action & Hotel Driver Card modal launch
    fireEvent.click(screen.getByRole("button", { name: /Copy Hotel Grab/i }));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("โรงแรมแชงกรี-ลา")
    );

    fireEvent.click(
      screen.getByRole("button", { name: /^Hotel Driver Card$/i })
    );
    const driverDialog = document.querySelector(
      "dialog[aria-labelledby='driver-card-hotel-title']"
    ) as HTMLDialogElement;
    expect(driverDialog).toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: /^Done$/i }));
    expect(driverDialog).not.toHaveAttribute("open");

    // Toggling off restores Full Spread pre-trip
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByTestId("top-bar-dual-clock")).toBeNull();
    expect(document.getElementById("day-card-0")).toBeInTheDocument();
    expect(document.getElementById("day-card-10")).toBeInTheDocument();
  });

  it("auto-defaults to Today on mobile (<640px) during 4–14 Feb 2027, scopes NOW/Past strictly to today, and gates Dual Clock by transit day", () => {
    // 1. D03 (7 Feb 2027 in Bangkok, non-transit day) hides Top Bar Dual Clock
    jest.useFakeTimers().setSystemTime(new Date("2027-02-07T06:00:00Z"));
    window.innerWidth = 1024;
    const d03Render = render(<ThailandTripDashboardV2 />);
    expect(screen.queryByTestId("top-bar-dual-clock")).toBeNull();
    d03Render.unmount();

    // 2. D04 (8 Feb 2027 BKK -> HKT transit day) shows Top Bar Dual Clock
    jest.useFakeTimers().setSystemTime(new Date("2027-02-08T06:00:00Z"));
    const d04Render = render(<ThailandTripDashboardV2 />);
    expect(screen.getByTestId("top-bar-dual-clock")).toBeInTheDocument();
    d04Render.unmount();

    // 3. D01 (5 Feb 2027 18:30 ICT): Desktop preserves Full Spread while scoping live companion indicators to D01 only
    jest.useFakeTimers().setSystemTime(new Date("2027-02-05T11:30:00Z"));
    const desktopRender = render(<ThailandTripDashboardV2 />);
    expect(document.getElementById("day-card-0")).toBeInTheDocument();
    expect(document.getElementById("day-card-1")).toBeInTheDocument();
    expect(document.getElementById("day-card-5")).toBeInTheDocument();
    expect(document.getElementById("day-card-10")).toBeInTheDocument();

    expect(screen.getByTestId("top-bar-dual-clock")).toHaveTextContent(
      /London \(GMT\) 11:30 \| Bangkok\/Phuket \(ICT\) 18:30/i
    );
    expect(screen.getByTestId("up-next-card-d1")).toHaveTextContent(
      /Check-in at Shangri-La Bangkok/i
    );
    expect(screen.getByTestId("up-next-card-d1")).toHaveTextContent(
      /Tonight's outfit:/i
    );
    expect(screen.getByTestId("up-next-card-d1")).toHaveTextContent(/in 1h/i);
    expect(screen.getByTestId("now-timeline-marker-d1")).toHaveTextContent(
      /NOW .* 18:30 ICT/i
    );

    // Selecting D05 while on D01 does NOT render companion cards or NOW/Past markers on D05
    fireEvent.click(document.querySelector('[data-day-chip="5"]') as HTMLElement);
    expect(document.getElementById("day-card-5")).toBeInTheDocument();
    expect(screen.queryByTestId("up-next-card-d5")).toBeNull();
    expect(screen.queryByTestId("now-timeline-marker-d5")).toBeNull();

    // Return to Full Spread and verify D01 past item prompt marks done on tap
    fireEvent.click(document.querySelector('[data-day-chip="all"]') as HTMLElement);
    const pastPromptBtns = screen.getAllByRole("button", {
      name: /Past scheduled time/i,
    });
    expect(pastPromptBtns.length).toBeGreaterThanOrEqual(1);
    const initialCount = pastPromptBtns.length;
    fireEvent.click(pastPromptBtns[0]);
    expect(
      screen.getAllByRole("button", { name: /Past scheduled time/i }).length
    ).toBe(initialCount - 1);
    desktopRender.unmount();

    // 4. Mobile (< 640px) opens directly on Today's Day Card (D01)
    window.innerWidth = 375;
    render(<ThailandTripDashboardV2 />);
    expect(document.getElementById("day-card-1")).toBeInTheDocument();
    expect(document.getElementById("day-card-0")).toBeNull();
    expect(screen.getByTestId("single-day-pagination")).toBeInTheDocument();
  });

  it("upgrades DriverCardModal to native showModal <dialog>, lg: desktop bounds, Wake Lock re-acquisition on visibilitychange, Share fallback, and bottom Done", async () => {
    const showModalSpy = jest.fn(function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    const closeSpy = jest.fn(function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    });
    HTMLDialogElement.prototype.showModal = showModalSpy;
    HTMLDialogElement.prototype.close = closeSpy;

    const releaseListeners: Record<string, () => void> = {};
    const releaseMock = jest.fn().mockResolvedValue(undefined);
    const requestWakeLockMock = jest.fn().mockImplementation(async () => ({
      release: releaseMock,
      addEventListener: jest.fn((evt: string, cb: () => void) => {
        releaseListeners[evt] = cb;
      }),
      removeEventListener: jest.fn((evt: string) => {
        delete releaseListeners[evt];
      }),
    }));
    const shareMock = jest.fn().mockResolvedValue(undefined);
    const origWakeLock = (navigator as Navigator & { wakeLock?: unknown })
      .wakeLock;
    const origShare = (navigator as Navigator & { share?: unknown }).share;
    const origVisibility = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState"
    );

    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      writable: true,
      value: { request: requestWakeLockMock },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      writable: true,
      value: shareMock,
    });

    try {
      const onClose = jest.fn();
      const onCopy = jest.fn();

      const invokerBtn = document.createElement("button");
      invokerBtn.textContent = "Launch Driver Card";
      document.body.appendChild(invokerBtn);
      invokerBtn.focus();

      const { rerender } = render(
        <DriverCardModal
          hotelId="pavilions-phuket"
          onClose={onClose}
          onCopy={onCopy}
        />
      );

      await act(async () => {});

      const dialog = document.querySelector(
        "dialog[aria-labelledby='driver-card-hotel-title']"
      ) as HTMLDialogElement;
      expect(dialog).toHaveAttribute("open");
      expect(dialog).not.toHaveAttribute("aria-modal");
      expect(showModalSpy).toHaveBeenCalledTimes(1);
      expect(requestWakeLockMock).toHaveBeenCalledTimes(1);
      expect(dialog).toHaveClass("inset-0", "w-full", "h-dvh", "lg:max-w-3xl");
      expect(dialog.querySelector(".landscape\\:flex-row")).not.toBeNull();

      // Simulate browser releasing wake lock when tab backgrounds, then returning to visible
      act(() => {
        releaseListeners.release?.();
      });
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible",
      });
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(requestWakeLockMock).toHaveBeenCalledTimes(2);

      expect(screen.getByTestId("driver-thai-name")).toHaveClass("text-4xl");
      expect(screen.getByTestId("driver-thai-address")).toHaveClass("text-2xl");

      const callHotelLink = screen.getByRole("link", {
        name: /Call Hotel \(\+66 76 317 600\)/i,
      });
      expect(callHotelLink).toHaveAttribute("href", "tel:+6676317600");

      // Night contrast mode toggle
      const nightToggle = screen.getByTestId("driver-night-mode-toggle");
      expect(nightToggle).toHaveAttribute("aria-pressed", "false");
      fireEvent.click(nightToggle);
      expect(nightToggle).toHaveAttribute("aria-pressed", "true");
      expect(dialog).toHaveClass("bg-black");

      // Native navigator.share call
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Share Address/i }));
      });
      expect(shareMock).toHaveBeenCalledTimes(1);

      // Clipboard fallback when navigator.share is unavailable
      Object.defineProperty(navigator, "share", {
        configurable: true,
        writable: true,
        value: undefined,
      });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Share Address/i }));
      });
      expect(onCopy).toHaveBeenCalledWith(
        expect.stringContaining("เดอะ พาวิลเลี่ยนส์ ภูเก็ต"),
        expect.stringContaining("Pavilions Phuket Thai Address")
      );

      // Bottom Done button triggers onClose
      fireEvent.click(screen.getByRole("button", { name: /^Done$/i }));
      expect(onClose).toHaveBeenCalledTimes(1);

      // Transitioning hotelId -> null closes dialog, releases Wake Lock, and restores focus
      rerender(
        <DriverCardModal hotelId={null} onClose={onClose} onCopy={onCopy} />
      );
      expect(closeSpy).toHaveBeenCalled();
      expect(releaseMock).toHaveBeenCalled();
      expect(document.activeElement).toBe(invokerBtn);

      // Wake Lock Battery Saver rejection handles silently without throwing
      requestWakeLockMock.mockRejectedValueOnce(new Error("Battery Saver"));
      rerender(
        <DriverCardModal
          hotelId="shangri-la-bangkok"
          onClose={onClose}
          onCopy={onCopy}
        />
      );
      await act(async () => {});
      expect(dialog).toHaveAttribute("open");
      invokerBtn.remove();
    } finally {
      Object.defineProperty(navigator, "wakeLock", {
        configurable: true,
        writable: true,
        value: origWakeLock,
      });
      Object.defineProperty(navigator, "share", {
        configurable: true,
        writable: true,
        value: origShare,
      });
      if (origVisibility) {
        Object.defineProperty(document, "visibilityState", origVisibility);
      }
    }
  });

  it("exposes complete SOS contacts, Dual Clock, Taxi cards inside Pocket Desk & More sheet, and hands focus back cleanly", () => {
    jest.useFakeTimers().setSystemTime(new Date("2027-02-05T09:30:00Z"));
    render(<ThailandTripDashboardV2 />);

    // 1. QuickPocketDesk SOS + Live Dual Clock
    fireEvent.click(
      screen.getByRole("button", { name: /Open Quick Pocket Desk/i })
    );
    const pocketDialog = document.querySelector(
      "dialog[aria-labelledby='pocket-desk-title']"
    ) as HTMLDialogElement;
    expect(screen.getByTestId("pocket-dual-clock")).toHaveTextContent(
      "London (GMT) 09:30 | Bangkok/Phuket (ICT) 16:30"
    );
    for (const href of [
      "tel:1155",
      "tel:1669",
      "tel:+6623058333",
      "tel:+6622367777",
      "tel:+6676317600",
    ]) {
      expect(pocketDialog.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("button", { name: /CLOSE/i }));

    // 2. More Sheet SOS links + Hotel Taxi Card -> DriverCardModal focus handoff
    const moreTriggerBtn = screen.getByRole("button", {
      name: /More steps and tools/i,
    });
    moreTriggerBtn.focus();
    fireEvent.click(moreTriggerBtn);
    const moreDialog = document.querySelector(
      "dialog[aria-labelledby='more-sheet-title']"
    ) as HTMLDialogElement;
    for (const href of [
      "tel:1155",
      "tel:1669",
      "tel:+6623058333",
      "tel:+6622367777",
      "tel:+6676317600",
    ]) {
      expect(moreDialog.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
    }

    const shangriLaCardBtn = screen.getByRole("button", {
      name: /Shangri-La Taxi Card/i,
    });
    const pavilionsCardBtn = screen.getByRole("button", {
      name: /Pavilions Taxi Card/i,
    });
    expect(pavilionsCardBtn).toBeInTheDocument();

    fireEvent.click(shangriLaCardBtn);
    expect(moreDialog).not.toHaveAttribute("open");
    const driverDialog = document.querySelector(
      "dialog[aria-labelledby='driver-card-hotel-title']"
    ) as HTMLDialogElement;
    expect(driverDialog).toHaveAttribute("open");
    expect(driverDialog).toHaveTextContent(/Shangri-La Bangkok/i);

    fireEvent.click(screen.getByRole("button", { name: /^Done$/i }));
    expect(driverDialog).not.toHaveAttribute("open");
    expect(document.activeElement).toBe(moreTriggerBtn);
  });
});
