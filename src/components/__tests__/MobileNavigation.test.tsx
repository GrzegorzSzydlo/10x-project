import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileNavigation } from "../MobileNavigation";

describe("MobileNavigation", () => {
  describe("Rendering", () => {
    it("should render all navigation items", () => {
      render(<MobileNavigation currentPath="/" />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Projekty")).toBeInTheDocument();
      expect(screen.getByText("Profil")).toBeInTheDocument();
    });

    it("should have proper ARIA labels", () => {
      render(<MobileNavigation currentPath="/" />);

      expect(screen.getByLabelText("Przejdź do strony głównej")).toBeInTheDocument();
      expect(screen.getByLabelText("Przejdź do listy projektów")).toBeInTheDocument();
      expect(screen.getByLabelText("Przejdź do profilu użytkownika")).toBeInTheDocument();
    });

    it("should have navigation role", () => {
      render(<MobileNavigation currentPath="/" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Mobile navigation");
    });
  });

  describe("Active State", () => {
    it("should mark Dashboard as active when on root path", () => {
      render(<MobileNavigation currentPath="/" />);

      const dashboardLink = screen.getByLabelText("Przejdź do strony głównej");
      expect(dashboardLink).toHaveAttribute("aria-current", "page");
    });

    it("should mark Projekty as active when on /projects path", () => {
      render(<MobileNavigation currentPath="/projects" />);

      const projectsLink = screen.getByLabelText("Przejdź do listy projektów");
      expect(projectsLink).toHaveAttribute("aria-current", "page");
    });

    it("should mark Profil as active when on /profile path", () => {
      render(<MobileNavigation currentPath="/profile" />);

      const profileLink = screen.getByLabelText("Przejdź do profilu użytkownika");
      expect(profileLink).toHaveAttribute("aria-current", "page");
    });

    it("should only mark one item as active at a time", () => {
      render(<MobileNavigation currentPath="/profile" />);

      const links = screen.getAllByRole("link");
      const activeLinks = links.filter((link) => link.getAttribute("aria-current") === "page");

      expect(activeLinks).toHaveLength(1);
    });
  });

  describe("Links", () => {
    it("should have correct href for Dashboard", () => {
      render(<MobileNavigation currentPath="/" />);

      const dashboardLink = screen.getByLabelText("Przejdź do strony głównej");
      expect(dashboardLink).toHaveAttribute("href", "/");
    });

    it("should have correct href for Projekty", () => {
      render(<MobileNavigation currentPath="/" />);

      const projectsLink = screen.getByLabelText("Przejdź do listy projektów");
      expect(projectsLink).toHaveAttribute("href", "/projects");
    });

    it("should have correct href for Profil", () => {
      render(<MobileNavigation currentPath="/" />);

      const profileLink = screen.getByLabelText("Przejdź do profilu użytkownika");
      expect(profileLink).toHaveAttribute("href", "/profile");
    });
  });

  describe("Accessibility", () => {
    it("should have minimum touch target size (44x44px)", () => {
      render(<MobileNavigation currentPath="/" />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveClass("min-w-[44px]");
        expect(link).toHaveClass("h-full"); // h-full on a h-16 container = 64px height
      });
    });

    it("should have focus ring for keyboard navigation", () => {
      render(<MobileNavigation currentPath="/" />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveClass("focus:ring-2");
        expect(link).toHaveClass("focus:ring-primary");
      });
    });

    it("should support reduced motion preference", () => {
      render(<MobileNavigation currentPath="/" />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveClass("motion-reduce:transition-none");
      });
    });
  });

  describe("Responsive Design", () => {
    it("should be hidden on desktop (md breakpoint and above)", () => {
      render(<MobileNavigation currentPath="/" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("md:hidden");
    });

    it("should be fixed at the bottom", () => {
      render(<MobileNavigation currentPath="/" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("fixed");
      expect(nav).toHaveClass("bottom-0");
      expect(nav).toHaveClass("left-0");
      expect(nav).toHaveClass("right-0");
    });

    it("should have appropriate z-index", () => {
      render(<MobileNavigation currentPath="/" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("z-50");
    });
  });
});
