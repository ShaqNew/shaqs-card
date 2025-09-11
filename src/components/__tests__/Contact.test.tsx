import { render, screen } from "../../test-utils/test-utils";
import Contact from "../Contact";

describe("Contact Component", () => {
  it("renders contact section with correct heading", () => {
    render(<Contact />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Get In Touch" })
    ).toBeInTheDocument();
  });

  it("renders contact description", () => {
    render(<Contact />);

    expect(
      screen.getByText(
        /I'm open hearing about new opportunities and exciting projects/
      )
    ).toBeInTheDocument();
  });

  it("renders all contact methods", () => {
    render(<Contact />);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("renders contact information with correct values", () => {
    render(<Contact />);

    expect(screen.getByText("shaquillenewell@gmail.com")).toBeInTheDocument();
    expect(
      screen.getByText("linkedin.com/in/shaquille-newell-68880b142/")
    ).toBeInTheDocument();
    expect(screen.getByText("github.com/ShaqNew")).toBeInTheDocument();
  });

  it("has proper external links for contact methods", () => {
    render(<Contact />);

    const emailLink = screen.getByRole("link", {
      name: "shaquillenewell@gmail.com",
    });
    const linkedinLink = screen.getByRole("link", {
      name: "linkedin.com/in/shaquille-newell-68880b142/",
    });
    const githubLink = screen.getByRole("link", { name: "github.com/ShaqNew" });

    expect(emailLink).toHaveAttribute(
      "href",
      "mailto:shaquillenewell@gmail.com"
    );
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/shaquille-newell-68880b142/"
    );
    expect(githubLink).toHaveAttribute("href", "https://github.com/ShaqNew");
  });

  it("has proper target and rel attributes for external links", () => {
    render(<Contact />);

    const linkedinLink = screen.getByRole("link", {
      name: "linkedin.com/in/shaquille-newell-68880b142/",
    });
    const githubLink = screen.getByRole("link", { name: "github.com/ShaqNew" });

    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("has proper section structure with correct ID", () => {
    render(<Contact />);

    const section = screen.getByText("Get In Touch").closest("section");
    expect(section).toHaveAttribute("id", "contact");
    expect(section).toHaveClass("section-padding", "section-bg-white");
  });

  it("renders contact icons with proper styling", () => {
    render(<Contact />);

    const emailIcon = screen.getByRole("link", {
      name: "shaquillenewell@gmail.com",
    });
    const linkedinIcon = screen.getByRole("link", {
      name: "linkedin.com/in/shaquille-newell-68880b142/",
    });
    const githubIcon = screen.getByRole("link", { name: "github.com/ShaqNew" });

    // Check that the icon containers exist (they are the parent elements of the text links)
    const emailIconContainer = emailIcon.parentElement?.querySelector(
      'a[href="mailto:shaquillenewell@gmail.com"]'
    );
    const linkedinIconContainer = linkedinIcon.parentElement?.querySelector(
      'a[href="https://www.linkedin.com/in/shaquille-newell-68880b142/"]'
    );
    const githubIconContainer = githubIcon.parentElement?.querySelector(
      'a[href="https://github.com/ShaqNew"]'
    );

    expect(emailIconContainer).toHaveClass(
      "w-16",
      "h-16",
      "mx-auto",
      "mb-4",
      "bg-blue-100",
      "dark:bg-blue-900",
      "rounded-full",
      "flex",
      "items-center",
      "justify-center"
    );
    expect(linkedinIconContainer).toHaveClass(
      "w-16",
      "h-16",
      "mx-auto",
      "mb-4",
      "bg-blue-100",
      "dark:bg-blue-900",
      "rounded-full",
      "flex",
      "items-center",
      "justify-center"
    );
    expect(githubIconContainer).toHaveClass(
      "w-16",
      "h-16",
      "mx-auto",
      "mb-4",
      "bg-blue-100",
      "dark:bg-blue-900",
      "rounded-full",
      "flex",
      "items-center",
      "justify-center"
    );
  });

  it("renders contact headings with proper styling", () => {
    render(<Contact />);

    const emailHeading = screen.getByText("Email");
    const linkedinHeading = screen.getByText("LinkedIn");
    const githubHeading = screen.getByText("GitHub");

    expect(emailHeading).toHaveClass(
      "text-lg",
      "font-semibold",
      "text-heading",
      "mb-2"
    );
    expect(linkedinHeading).toHaveClass(
      "text-lg",
      "font-semibold",
      "text-heading",
      "mb-2"
    );
    expect(githubHeading).toHaveClass(
      "text-lg",
      "font-semibold",
      "text-heading",
      "mb-2"
    );
  });

  it("renders contact links with proper styling", () => {
    render(<Contact />);

    const emailLink = screen.getByRole("link", {
      name: "shaquillenewell@gmail.com",
    });
    const linkedinLink = screen.getByRole("link", {
      name: "linkedin.com/in/shaquille-newell-68880b142/",
    });
    const githubLink = screen.getByRole("link", { name: "github.com/ShaqNew" });

    expect(emailLink).toHaveClass("text-accent", "hover:text-blue-700");
    expect(linkedinLink).toHaveClass("text-accent", "hover:text-blue-700");
    expect(githubLink).toHaveClass("text-accent", "hover:text-blue-700");
  });

  it("has proper grid layout for contact methods", () => {
    render(<Contact />);

    const gridContainer = screen
      .getByText("Email")
      .closest("div")?.parentElement;
    expect(gridContainer).toHaveClass(
      "grid",
      "md:grid-cols-3",
      "gap-8",
      "mb-8"
    );
  });
});
