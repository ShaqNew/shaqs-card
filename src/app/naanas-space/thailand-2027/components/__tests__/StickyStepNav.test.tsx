import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { StickyStepNav } from "../StickyStepNav";

describe("StickyStepNav Component", () => {
  const defaultProps = {
    activeTab: "itinerary" as const,
    onSelectTab: jest.fn(),
    prepProgress: { done: 3, total: 8, pct: 38 },
    appsProgress: { done: 2, total: 7, pct: 29 },
    packingProgress: { done: 10, total: 21, pct: 48 },
    selectedDayNum: null,
    onSelectDayNum: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  it("renders all 6 step navigation buttons with labels and sub labels when not stuck", () => {
    render(<StickyStepNav {...defaultProps} />);

    // Check step numbers and labels
    expect(screen.getByText("Itinerary & Plan")).toBeInTheDocument();
    expect(screen.getByText("Bookings Vault")).toBeInTheDocument();
    expect(screen.getByText("Prep & Apps")).toBeInTheDocument();
    expect(screen.getByText("Packing Studio")).toBeInTheDocument();
    expect(screen.getByText("Field Guide & SOS")).toBeInTheDocument();
    expect(screen.getByText("Budget & THB")).toBeInTheDocument();

    // Check sub labels are in document
    expect(screen.getByText("Eleven-Day Chronicle")).toBeInTheDocument();
    expect(screen.getByText("Tickets & Residences")).toBeInTheDocument();
    expect(screen.getByText("5/15 Verified")).toBeInTheDocument();
    expect(screen.getByText("10/21 Packed")).toBeInTheDocument();
    expect(screen.getByText("Dispatches & 1155")).toBeInTheDocument();
    expect(screen.getByText("+£72.65 Surplus")).toBeInTheDocument();

    // In default (un-stuck) state, container has data-scrolled="false"
    const navContainer = document.getElementById("step-content-anchor");
    expect(navContainer).toHaveAttribute("data-scrolled", "false");

    // All sublabel wrappers have max-h-12 opacity-100
    const subLabels = screen.getAllByTestId("step-nav-sublabel");
    expect(subLabels).toHaveLength(6);
    subLabels.forEach((el) => {
      expect(el).toHaveClass("max-h-12");
      expect(el).toHaveClass("opacity-100");
    });
  });

  it("keeps sub labels visible when navbar first touches top (sentinel top = 0) before scrolling past the -72px buffer", () => {
    render(<StickyStepNav {...defaultProps} />);

    const sentinel = screen.getByTestId("sticky-nav-sentinel");
    // Navbar just reached top: 0 (sentinel top = -20px, not yet past -72px buffer)
    Object.defineProperty(window, "scrollY", { value: 320, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: -20,
      bottom: -19,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: -20,
      toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    const navContainer = document.getElementById("step-content-anchor");
    expect(navContainer).toHaveAttribute("data-scrolled", "false");

    const subLabels = screen.getAllByTestId("step-nav-sublabel");
    subLabels.forEach((el) => {
      expect(el).toHaveClass("max-h-12");
      expect(el).toHaveClass("opacity-100");
    });
  });

  it("collapses sub labels smoothly once scrolled past the -72px sticky buffer (sentinel top <= -72)", () => {
    render(<StickyStepNav {...defaultProps} />);

    const sentinel = screen.getByTestId("sticky-nav-sentinel");
    // User has scrolled 80px past the sticky point (sentinel top = -80 <= -72)
    Object.defineProperty(window, "scrollY", { value: 400, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: -80,
      bottom: -79,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: -80,
      toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    const navContainer = document.getElementById("step-content-anchor");
    expect(navContainer).toHaveAttribute("data-scrolled", "true");
    // Ensure no artificial marginBottom gap is added below the sticky bar
    expect(navContainer?.style.marginBottom).toBe("");

    const subLabels = screen.getAllByTestId("step-nav-sublabel");
    subLabels.forEach((el) => {
      expect(el).toHaveClass("max-h-0");
      expect(el).toHaveClass("opacity-0");
      expect(el).toHaveClass("overflow-hidden");
      expect(el).toHaveClass("sm:max-h-12");
      expect(el).toHaveClass("sm:opacity-100");
    });
  });

  it("re-expands sub labels when scrolled back up to the unstick boundary", () => {
    render(<StickyStepNav {...defaultProps} />);

    const sentinel = screen.getByTestId("sticky-nav-sentinel");

    // First stuck & collapsed past -72px
    Object.defineProperty(window, "scrollY", { value: 500, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: -150,
      bottom: -149,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: -150,
      toJSON: () => {},
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "true"
    );

    // Then scrolled back up so sentinel top >= -8px (e.g., +20px)
    Object.defineProperty(window, "scrollY", { value: 280, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 20,
      bottom: 21,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: 20,
      toJSON: () => {},
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "false"
    );

    const subLabels = screen.getAllByTestId("step-nav-sublabel");
    subLabels.forEach((el) => {
      expect(el).toHaveClass("max-h-12");
      expect(el).toHaveClass("opacity-100");
    });
  });

  it("prevents rapid collapse/expand oscillation via hysteresis (-72px collapse vs -8px expand)", () => {
    render(<StickyStepNav {...defaultProps} />);

    const sentinel = screen.getByTestId("sticky-nav-sentinel");

    // 1. Navbar scrolls past -72px threshold -> collapses
    Object.defineProperty(window, "scrollY", { value: 400, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: -75,
      bottom: -74,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: -75,
      toJSON: () => {},
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "true"
    );

    // 2. User scrolls up slightly (sentinel top = -30px, still < -8px expand threshold) -> stays collapsed
    Object.defineProperty(window, "scrollY", { value: 355, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: -30,
      bottom: -29,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: -30,
      toJSON: () => {},
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "true"
    );

    // 3. Scrolling back up to the unstick threshold (sentinel top = -4px >= -8px) -> cleanly re-expands
    Object.defineProperty(window, "scrollY", { value: 325, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: -4,
      bottom: -3,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: -4,
      toJSON: () => {},
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "false"
    );
  });

  it("supports controlled isScrolled prop override", () => {
    const { rerender } = render(
      <StickyStepNav {...defaultProps} isScrolled={false} />
    );
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "false"
    );

    rerender(<StickyStepNav {...defaultProps} isScrolled={true} />);
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "true"
    );
  });

  it("calls onSelectTab when a tab button is clicked", () => {
    render(<StickyStepNav {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Packing Studio/i }));
    expect(defaultProps.onSelectTab).toHaveBeenCalledWith("packing");
  });

  it("renders Date Ruler when activeTab is itinerary and handles day selection", () => {
    render(
      <StickyStepNav
        {...defaultProps}
        activeTab="itinerary"
        selectedDayNum={2}
      />
    );

    // Full Spread button
    const fullSpreadBtn = screen.getByRole("button", { name: /Full Spread/i });
    expect(fullSpreadBtn).toBeInTheDocument();
    fireEvent.click(fullSpreadBtn);
    expect(defaultProps.onSelectDayNum).toHaveBeenCalledWith(null);

    // Day button toggle
    const day2Btn = screen.getByRole("button", { name: /D02/i });
    expect(day2Btn).toBeInTheDocument();
    fireEvent.click(day2Btn);
    expect(defaultProps.onSelectDayNum).toHaveBeenCalledWith(null);
  });

  it("reveals the Scroll to Chronometer button once scrolled past the threshold and scrolls to #masthead-chronometer on click", () => {
    // Create a mock #masthead-chronometer target in the document
    const chronometerTarget = document.createElement("div");
    chronometerTarget.id = "masthead-chronometer";
    const scrollIntoViewMock = jest.fn();
    chronometerTarget.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(chronometerTarget);

    render(<StickyStepNav {...defaultProps} />);

    const chronometerBtn = screen.getByRole("button", {
      name: /Scroll to Chronometer/i,
    });
    expect(chronometerBtn.parentElement).toHaveClass("invisible", "opacity-0");

    // Scroll past -72px threshold
    const sentinel = screen.getByTestId("sticky-nav-sentinel");
    Object.defineProperty(window, "scrollY", { value: 420, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: -90,
      bottom: -89,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: -90,
      toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(chronometerBtn.parentElement).toHaveClass("visible", "opacity-100");

    fireEvent.click(chronometerBtn);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });

    document.body.removeChild(chronometerTarget);
  });
});
