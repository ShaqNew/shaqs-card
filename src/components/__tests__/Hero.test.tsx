import { render, screen } from "../../test-utils/test-utils";
import Hero from "../Hero";

// Mock Next.js Image component
// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: (props: any) => {
//     // eslint-disable-next-line @next/next/no-img-element
//     return <img {...props} />;
//   },
// }));

describe("Hero Component", () => {
  it("renders hero section with correct heading", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Shaq Newell" })
    ).toBeInTheDocument();
  });

  it("renders hero description with highlighted text", () => {
    render(<Hero />);

    expect(
      screen.getByText(/Senior Software Engineer with 5\+ years of experience/)
    ).toBeInTheDocument();
    expect(screen.getByText("exceptional")).toBeInTheDocument();
  });

  it("renders call-to-action buttons", () => {
    render(<Hero />);

    expect(
      screen.getByRole("link", { name: "Get In Touch" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View My Work" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Visit my Sandbox" })
    ).toBeInTheDocument();
  });

  it("has correct href attributes for buttons", () => {
    render(<Hero />);

    expect(screen.getByRole("link", { name: "Get In Touch" })).toHaveAttribute(
      "href",
      "#contact"
    );
    expect(screen.getByRole("link", { name: "View My Work" })).toHaveAttribute(
      "href",
      "#projects"
    );
    expect(
      screen.getByRole("link", { name: "Visit my Sandbox" })
    ).toHaveAttribute("href", "https://shaqs-sandbox.vercel.app/");
  });

  it("renders hero image with correct alt text", () => {
    render(<Hero />);

    const image = screen.getByAltText("logogram");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("width", "1000");
    expect(image).toHaveAttribute("height", "1000");
  });

  it("has proper section structure", () => {
    render(<Hero />);

    const section = screen.getByText("Shaq Newell").closest("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("pt-24", "pb-16", "px-4");
  });

  it("has correct heading ID for navigation tracking", () => {
    render(<Hero />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("id", "hero-heading");
  });

  it("renders highlighted text with accent styling", () => {
    render(<Hero />);

    const highlightedText = screen.getByText("exceptional");
    expect(highlightedText).toHaveClass("text-accent");
  });
});
