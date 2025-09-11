import { render, screen } from "@testing-library/react";
import About from "../About";

describe("About Component", () => {
  it("renders about section with correct heading", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { level: 2, name: "About Me" })
    ).toBeInTheDocument();
  });

  it("renders personal description", () => {
    render(<About />);

    expect(
      screen.getByText(
        /I'm a passionate software engineer born and raised in London/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/I studied computer science at the University of Kent/)
    ).toBeInTheDocument();
  });

  it("renders experience statistics", () => {
    render(<About />);

    expect(screen.getByText("5+")).toBeInTheDocument();
    expect(screen.getByText("Years Experience")).toBeInTheDocument();
    expect(screen.getByText("15+")).toBeInTheDocument();
    expect(screen.getByText("Technologies")).toBeInTheDocument();
  });

  it("renders education information", () => {
    render(<About />);

    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(
      screen.getByText(/Computer Science, University of Kent/)
    ).toBeInTheDocument();
    expect(screen.getByText("1st Class Honours")).toBeInTheDocument();
  });

  it("renders industry interests", () => {
    render(<About />);

    expect(screen.getByText("Industry interests")).toBeInTheDocument();
    expect(
      screen.getByText(/E-commerce, UX, Data handling, Machine Learning/)
    ).toBeInTheDocument();
  });

  it("renders casual interests", () => {
    render(<About />);

    expect(screen.getByText("Casual interests")).toBeInTheDocument();
    expect(
      screen.getByText(/Reading, Gaming, Movies, Music, Science, Psychology/)
    ).toBeInTheDocument();
  });

  it("has proper section structure with correct ID", () => {
    render(<About />);

    const section = screen.getByText("About Me").closest("section");
    expect(section).toHaveAttribute("id", "about");
    expect(section).toHaveClass("section-padding", "section-bg-white");
  });

  it("renders statistics with accent color", () => {
    render(<About />);

    const experienceStat = screen.getByText("5+");
    const technologiesStat = screen.getByText("15+");

    expect(experienceStat).toHaveClass("text-accent");
    expect(technologiesStat).toHaveClass("text-accent");
  });

  it("has proper grid layout for content", () => {
    render(<About />);

    const gridContainer = screen
      .getByText(/I'm a passionate software engineer/)
      .closest("div")?.parentElement;
    expect(gridContainer).toHaveClass(
      "grid",
      "md:grid-cols-2",
      "gap-12",
      "items-center"
    );
  });
});
