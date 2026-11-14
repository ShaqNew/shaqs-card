import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NaanasSpaceHub from "../page";
import ThailandTripDashboardV1 from "../thailand-2027/page";
import ThailandTripDashboardV2 from "../thailand-2027-v2/page";
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
