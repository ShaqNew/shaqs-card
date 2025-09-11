// testing Tailwind styled components with Jest yeilds rendering errors,
// this simple test is a workaround
import React from "react";
import { render, screen } from "../../test-utils/test-utils";
import "@testing-library/jest-dom";
import { describe, expect, it, jest } from "@jest/globals";
import Projects from "../Projects";

// Mock Next.js Image component
// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: (props: any) => {
//     // eslint-disable-next-line @next/next/no-img-element
//     return <img {...props} />;
//   },
// }));

describe("Projects Component (Simple)", () => {
  it("renders projects section with correct heading", () => {
    render(<Projects />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Past Projects and Work" })
    ).toBeInTheDocument();
  });

  it("renders project cards", () => {
    render(<Projects />);

    expect(screen.getByText("MeloCare")).toBeInTheDocument();
    expect(screen.getByText("Sandbox")).toBeInTheDocument();
  });

  it("renders project descriptions", () => {
    render(<Projects />);

    expect(
      screen.getByText(/A healthcare service provider website/)
    ).toBeInTheDocument();
    expect(screen.getByText(/This is my sandbox website/)).toBeInTheDocument();
  });

  it("renders project images with correct alt text", () => {
    render(<Projects />);

    expect(screen.getByAltText("MeloCare")).toBeInTheDocument();
    expect(screen.getByAltText("Sandbox")).toBeInTheDocument();
  });

  it("has proper external links for projects", () => {
    render(<Projects />);

    const meloCareLink = screen.getByRole("link", { name: /MeloCare/ });
    const sandboxLink = screen.getByRole("link", { name: /Sandbox/ });

    expect(meloCareLink).toHaveAttribute(
      "href",
      "https://melo-next.vercel.app/"
    );
    expect(sandboxLink).toHaveAttribute(
      "href",
      "https://shaqs-sandbox.vercel.app/"
    );
  });

  it("has proper section structure with correct ID", () => {
    render(<Projects />);

    const section = screen
      .getByText("Past Projects and Work")
      .closest("section");
    expect(section).toHaveAttribute("id", "projects");
    expect(section).toHaveClass("section-padding");
  });
});
