import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NaanasSpaceHub from "../page";
import ThailandTripDashboardV1 from "../thailand-2027/page";
import ThailandTripDashboardV2 from "../thailand-2027-v2/page";
import ThailandDossierLayout, {
  viewport as v2Viewport,
} from "../thailand-2027-v2/layout";
import { CreateLookModal } from "../thailand-2027-v2/components/CreateLookModal";
import { PolaroidOutfitCard } from "../thailand-2027-v2/components/PolaroidOutfitCard";
import { DEFAULT_WARDROBE_OUTFITS } from "@/lib/thailandTripData";
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
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = jest.fn();
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = jest.fn();
    }
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
    expect(screen.getByText(/INSTANT CURRENCY \(1 GBP ≈ 44\.5 THB\)/i)).toBeInTheDocument();
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
