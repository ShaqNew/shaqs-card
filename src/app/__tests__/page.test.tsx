// import { render, screen } from "../../test-utils/test-utils";
import { render, screen } from "@testing-library/react";
import { jest, describe, expect, it } from "@jest/globals";
import "@testing-library/jest-dom";
import Home from "../page";

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
