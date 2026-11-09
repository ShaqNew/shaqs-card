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

  it("keeps sub labels visible when scrolling while navbar is still below top", () => {
    render(<StickyStepNav {...defaultProps} />);

    const sentinel = screen.getByTestId("sticky-nav-sentinel");
    // Mock user has scrolled 100px, but sentinel top is still > 0 (150px down from viewport top)
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 150,
      bottom: 151,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: 150,
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

  it("collapses sub labels only once the navbar sticks to the top (sentinel top <= 0)", () => {
    render(<StickyStepNav {...defaultProps} />);

    const sentinel = screen.getByTestId("sticky-nav-sentinel");
    // Navbar reaches top: 0 and sticks (sentinel top <= 0 at scrollY > 0)
    Object.defineProperty(window, "scrollY", { value: 350, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 1,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    const navContainer = document.getElementById("step-content-anchor");
    expect(navContainer).toHaveAttribute("data-scrolled", "true");

    const subLabels = screen.getAllByTestId("step-nav-sublabel");
    subLabels.forEach((el) => {
      expect(el).toHaveClass("max-h-0");
      expect(el).toHaveClass("opacity-0");
      expect(el).toHaveClass("overflow-hidden");
      expect(el).toHaveClass("sm:max-h-12");
      expect(el).toHaveClass("sm:opacity-100");
    });
  });

  it("re-expands sub labels when scrolled back up and navbar unsticks from top", () => {
    render(<StickyStepNav {...defaultProps} />);

    const sentinel = screen.getByTestId("sticky-nav-sentinel");

    // First stuck at top
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
    expect(document.getElementById("step-content-anchor")).toHaveAttribute("data-scrolled", "true");

    // Then unstuck (scrolled back up so sentinel top > 0)
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 50,
      bottom: 51,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: 50,
      toJSON: () => {},
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.getElementById("step-content-anchor")).toHaveAttribute("data-scrolled", "false");

    const subLabels = screen.getAllByTestId("step-nav-sublabel");
    subLabels.forEach((el) => {
      expect(el).toHaveClass("max-h-12");
      expect(el).toHaveClass("opacity-100");
    });
  });

  it("prevents rapid collapse/expand oscillation via hysteresis when scrolling slowly near the sticky threshold", () => {
    render(<StickyStepNav {...defaultProps} />);

    const sentinel = screen.getByTestId("sticky-nav-sentinel");

    // 1. Navbar reaches sticky threshold (top = 0, scrollY = 320) -> collapses
    Object.defineProperty(window, "scrollY", { value: 320, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 1,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "true"
    );

    // 2. Slow scroll / layout shift nudges sentinel slightly positive (top = 18px < 36px hysteresis deadband)
    // Navbar MUST stay collapsed instead of glitching back to expanded
    Object.defineProperty(window, "scrollY", { value: 302, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 18,
      bottom: 19,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: 18,
      toJSON: () => {},
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.getElementById("step-content-anchor")).toHaveAttribute(
      "data-scrolled",
      "true"
    );

    // 3. Scrolling back up past the 36px hysteresis deadband (top = 42px) cleanly re-expands
    Object.defineProperty(window, "scrollY", { value: 278, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 42,
      bottom: 43,
      left: 0,
      right: 1000,
      width: 1000,
      height: 1,
      x: 0,
      y: 42,
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
    const { rerender } = render(<StickyStepNav {...defaultProps} isScrolled={false} />);
    expect(document.getElementById("step-content-anchor")).toHaveAttribute("data-scrolled", "false");

    rerender(<StickyStepNav {...defaultProps} isScrolled={true} />);
    expect(document.getElementById("step-content-anchor")).toHaveAttribute("data-scrolled", "true");
  });

  it("reserves in-flow height delta via marginBottom compensation when collapsed to prevent document scrollHeight shrinkage", () => {
    render(<StickyStepNav {...defaultProps} />);
    const navContainer = document.getElementById("step-content-anchor")!;
    const sentinel = screen.getByTestId("sticky-nav-sentinel");

    // Mock expanded height = 220px while unstuck
    let currentMockHeight = 220;
    jest.spyOn(navContainer, "getBoundingClientRect").mockImplementation(() => ({
      top: 100,
      bottom: 100 + currentMockHeight,
      left: 0,
      right: 390,
      width: 390,
      height: currentMockHeight,
      x: 0,
      y: 100,
      toJSON: () => {},
    }));

    // Trigger unstuck check so expanded height (220px) is recorded
    Object.defineProperty(window, "scrollY", { value: 5, writable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(navContainer).toHaveAttribute("data-height-compensation", "0");

    // Now simulate sticky collapse where compact nav height shrinks to 120px (delta = 100px)
    currentMockHeight = 120;
    Object.defineProperty(window, "scrollY", { value: 360, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 1,
      left: 0,
      right: 390,
      width: 390,
      height: 1,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(navContainer).toHaveAttribute("data-scrolled", "true");
    expect(navContainer).toHaveAttribute("data-height-compensation", "100");
    expect(navContainer.style.marginBottom).toContain("100px");

    // Re-expanding resets height compensation to 0
    currentMockHeight = 220;
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    jest.spyOn(sentinel, "getBoundingClientRect").mockReturnValue({
      top: 50,
      bottom: 51,
      left: 0,
      right: 390,
      width: 390,
      height: 1,
      x: 0,
      y: 50,
      toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(navContainer).toHaveAttribute("data-scrolled", "false");
    expect(navContainer).toHaveAttribute("data-height-compensation", "0");
    expect(navContainer.style.marginBottom).toBe("");
  });

  it("calls onSelectTab when a tab button is clicked", () => {
    render(<StickyStepNav {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Packing Studio/i }));
    expect(defaultProps.onSelectTab).toHaveBeenCalledWith("packing");
  });

  it("renders Date Ruler when activeTab is itinerary and handles day selection", () => {
    render(<StickyStepNav {...defaultProps} activeTab="itinerary" selectedDayNum={2} />);

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
});
