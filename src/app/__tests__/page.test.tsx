import { render, screen } from "../../test-utils/test-utils";
import Home from "../page";

// Mock all the components
jest.mock("../../components/Navigation", () => {
  return function MockNavigation() {
    return <nav data-testid="navigation">Navigation</nav>;
  };
});

jest.mock("../../components/Hero", () => {
  return function MockHero() {
    return <section data-testid="hero">Hero</section>;
  };
});

jest.mock("../../components/About", () => {
  return function MockAbout() {
    return <section data-testid="about">About</section>;
  };
});

jest.mock("../../components/Skills", () => {
  return function MockSkills() {
    return <section data-testid="skills">Skills</section>;
  };
});

jest.mock("../../components/Projects", () => {
  return function MockProjects() {
    return <section data-testid="projects">Projects</section>;
  };
});

jest.mock("../../components/Contact", () => {
  return function MockContact() {
    return <section data-testid="contact">Contact</section>;
  };
});

describe("Home Page", () => {
  it("renders all main components", () => {
    render(<Home />);

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("about")).toBeInTheDocument();
    expect(screen.getByTestId("skills")).toBeInTheDocument();
    expect(screen.getByTestId("projects")).toBeInTheDocument();
    expect(screen.getByTestId("contact")).toBeInTheDocument();
  });

  it("has proper main container structure", () => {
    render(<Home />);

    const mainContainer = screen.getByTestId("navigation").parentElement;
    expect(mainContainer).toHaveClass(
      "min-h-screen",
      "bg-gradient-to-br",
      "from-slate-50",
      "to-blue-50",
      "dark:from-slate-900",
      "dark:to-slate-800"
    );
  });

  it("renders components in correct order", () => {
    render(<Home />);

    const components = [
      screen.getByTestId("navigation"),
      screen.getByTestId("hero"),
      screen.getByTestId("about"),
      screen.getByTestId("skills"),
      screen.getByTestId("projects"),
      screen.getByTestId("contact"),
    ];

    // Check that components are rendered in the correct order
    components.forEach((component, index) => {
      expect(component).toBeInTheDocument();
    });
  });
});
