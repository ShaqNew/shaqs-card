import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "next-themes";

// Mock theme provider for testing
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-theme="light">{children}</div>;
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MockThemeProvider>{children}</MockThemeProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data for testing
export const mockProjects = [
  {
    id: 1,
    title: "Test Project 1",
    description: "A test project description",
    href: "https://example.com",
    image: "/test-image.jpg",
  },
  {
    id: 2,
    title: "Test Project 2",
    description: "Another test project description",
    href: "https://example2.com",
    image: "/test-image2.jpg",
  },
];

export const mockSkills = {
  frontend: ["React", "TypeScript", "Tailwind CSS"],
  backend: ["Node.js", "Python", "PostgreSQL"],
  devops: ["AWS", "Docker", "Kubernetes"],
};

export const mockExperience = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Test Company",
    period: "2022 - Present",
    description: "Test job description",
    technologies: ["React", "Node.js", "AWS"],
  },
];

// Helper functions
export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

export * from "@testing-library/react";
export { customRender as render };
