import { Button } from "@/components/ui/button";
import { devLog } from "@/api/utils";
import { User as UserIcon } from "lucide-react";
import type { User } from "@/types";

interface AppHeaderProps {
  user?: User | null;
  userEmail?: string;
}

export function AppHeader({ user, userEmail }: AppHeaderProps) {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        window.location.href = "/login";
      } else {
        devLog("error", "Logout failed");
      }
    } catch (error) {
      devLog("error", "Error during logout:", error);
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo / App Name */}
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <h1 className="text-lg md:text-xl font-bold">10x Project</h1>
        </a>
        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop: User info with link to profile */}
            <a
              href="/profile"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <UserIcon className="h-4 w-4" />
              <span>
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : userEmail || "Profil"}
              </span>
            </a>
            <Button onClick={handleLogout} variant="outline" size="sm" className="hidden md:inline-flex">
              Wyloguj
            </Button>

            {/* Mobile: Icon button only */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              aria-label="Wyloguj się"
            >
              <UserIcon className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
