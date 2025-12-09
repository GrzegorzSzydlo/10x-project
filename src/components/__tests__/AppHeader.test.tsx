import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppHeader } from "../AppHeader";
import type { User } from "@/types";

// Mock fetch globally
global.fetch = vi.fn();

describe("AppHeader", () => {
  const mockUser: User = {
    id: "test-user-id",
    role: "team_member",
    first_name: "Jan",
    last_name: "Kowalski",
    avatar_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockUserEmail = "jan.kowalski@example.com";

  describe("Rendering", () => {
    it("should render app name", () => {
      render(<AppHeader user={mockUser} userEmail={mockUserEmail} />);
      expect(screen.getByText("10x Project")).toBeInTheDocument();
    });

    it("should have link to homepage on app name", () => {
      render(<AppHeader user={mockUser} userEmail={mockUserEmail} />);
      const logoLink = screen.getByRole("link", { name: "10x Project" });
      expect(logoLink).toHaveAttribute("href", "/");
    });

    it("should render user info when user is provided", () => {
      render(<AppHeader user={mockUser} userEmail={mockUserEmail} />);
      expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
    });

    it("should render email when first_name and last_name are missing", () => {
      const userWithoutName = { ...mockUser, first_name: null, last_name: null };
      render(<AppHeader user={userWithoutName} userEmail={mockUserEmail} />);
      expect(screen.getByText(mockUserEmail)).toBeInTheDocument();
    });

    it("should render 'Profil' fallback when no name and no email", () => {
      const userWithoutName = { ...mockUser, first_name: null, last_name: null };
      render(<AppHeader user={userWithoutName} />);
      expect(screen.getByText("Profil")).toBeInTheDocument();
    });

    it("should not render user menu when user is not provided", () => {
      render(<AppHeader />);
      expect(screen.queryByText("Wyloguj")).not.toBeInTheDocument();
    });
  });

  describe("Profile Link", () => {
    it("should have link to profile in desktop view", () => {
      render(<AppHeader user={mockUser} userEmail={mockUserEmail} />);
      const profileLink = screen.getByRole("link", { name: /Jan Kowalski/i });
      expect(profileLink).toHaveAttribute("href", "/profile");
    });

    it("should have hover effect on profile link", () => {
      render(<AppHeader user={mockUser} userEmail={mockUserEmail} />);
      const profileLink = screen.getByRole("link", { name: /Jan Kowalski/i });
      expect(profileLink).toHaveClass("hover:text-foreground");
    });
  });

  describe("Responsive Design", () => {
    it("should show desktop menu with logout button", () => {
      render(<AppHeader user={mockUser} userEmail={mockUserEmail} />);
      const logoutButton = screen.getByRole("button", { name: "Wyloguj" });
      expect(logoutButton).toHaveClass("hidden", "md:inline-flex");
    });

    it("should show mobile icon button", () => {
      render(<AppHeader user={mockUser} userEmail={mockUserEmail} />);
      const mobileButton = screen.getByLabelText("Wyloguj się");
      expect(mobileButton).toHaveClass("md:hidden");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label for mobile logout button", () => {
      render(<AppHeader user={mockUser} userEmail={mockUserEmail} />);
      expect(screen.getByLabelText("Wyloguj się")).toBeInTheDocument();
    });
  });
});
