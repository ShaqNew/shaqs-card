import { render, screen } from "@testing-library/react";
import Skills from "../Skills";

describe("Skills Component (Simple)", () => {
  it("renders skills section with correct heading", () => {
    render(<Skills />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Technical Skills" })
    ).toBeInTheDocument();
  });

  it("renders all three skill categories", () => {
    render(<Skills />);

    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("DevOps, Cloud & Services")).toBeInTheDocument();
  });

  it("renders frontend skills", () => {
    render(<Skills />);

    expect(screen.getByText("React/Next.js")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Tailwind/CSS/Sass")).toBeInTheDocument();
  });

  it("renders backend skills", () => {
    render(<Skills />);

    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("renders devops and cloud skills", () => {
    render(<Skills />);

    expect(screen.getByText("AWS")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
  });

  it("has proper section structure with correct ID", () => {
    render(<Skills />);

    const section = screen.getByText("Technical Skills").closest("section");
    expect(section).toHaveAttribute("id", "skills");
    expect(section).toHaveClass("section-padding");
  });
});
