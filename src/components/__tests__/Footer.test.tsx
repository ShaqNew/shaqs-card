import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer Component", () => {
  it("renders footer with correct copyright text", () => {
    render(<Footer />);

    expect(
      screen.getByText("2025 Shaq Newell's Portfolio.")
    ).toBeInTheDocument();
  });

  it("has proper footer structure", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass(
      "py-8",
      "px-4",
      "sm:px-6",
      "lg:px-8",
      "border-t",
      "border-slate-200",
      "dark:border-slate-700"
    );
  });

  it("has proper container styling", () => {
    render(<Footer />);

    const container = screen
      .getByText("2025 Shaq Newell's Portfolio.")
      .closest("div");
    expect(container).toHaveClass(
      "section-container",
      "text-center",
      "text-slate-600",
      "dark:text-slate-400"
    );
  });

  it("renders copyright text with proper styling", () => {
    render(<Footer />);

    const copyrightText = screen.getByText("2025 Shaq Newell's Portfolio.");
    expect(copyrightText).toBeInTheDocument();
  });
});
