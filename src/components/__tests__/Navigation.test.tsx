import { render, screen } from "../../test-utils/test-utils";
import Navigation from "../Navigation";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe("Navigation Component", () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it("renders navigation with correct title", () => {
    render(<Navigation />);

    expect(screen.getByText("Shaq Newell")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<Navigation />);

    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skills" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("has correct href attributes for navigation links", () => {
    render(<Navigation />);

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "#about"
    );
    expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute(
      "href",
      "#skills"
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "#projects"
    );
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "#contact"
    );
  });

  it("has proper navigation structure", () => {
    render(<Navigation />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("fixed", "top-0", "w-full");
  });

  it("navigation links have correct classes for hover states", () => {
    render(<Navigation />);

    const aboutLink = screen.getByRole("link", { name: "About" });
    expect(aboutLink).toHaveClass("nav-link");
  });

  it("renders navigation logo container", () => {
    render(<Navigation />);

    expect(screen.getByTestId("navigation-logo")).toBeInTheDocument();
  });

  it("renders navigation name container", () => {
    render(<Navigation />);

    expect(screen.getByTestId("navigation-name")).toBeInTheDocument();
  });
});
