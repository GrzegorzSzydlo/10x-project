import { Button } from "@/components/ui/button";
import { devLog } from "@/api/utils";
import type { User } from "@/types";

interface AppHeaderProps {
  user?: User | null;
}

export function AppHeader({ user }: AppHeaderProps) {
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
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / App Name */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">10x Project</h1>
        </div>
        {/* User Menu - tylko dla zalogowanych */}
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.id}
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Wyloguj
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
