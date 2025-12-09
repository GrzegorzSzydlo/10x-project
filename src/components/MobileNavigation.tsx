import { Home, FolderKanban, User } from "lucide-react";

interface MobileNavigationProps {
  currentPath: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}

export function MobileNavigation({ currentPath }: MobileNavigationProps) {
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      path: "/",
      icon: Home,
      ariaLabel: "Przejdź do strony głównej",
    },
    {
      label: "Projekty",
      path: "/projects",
      icon: FolderKanban,
      ariaLabel: "Przejdź do listy projektów",
    },
    {
      label: "Profil",
      path: "/profile",
      icon: User,
      ariaLabel: "Przejdź do profilu użytkownika",
    },
  ];

  const isActive = (path: string): boolean => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <a
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full min-w-[44px] transition-colors duration-200 ease-in-out hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset motion-reduce:transition-none"
              aria-label={item.ariaLabel}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`h-6 w-6 transition-colors duration-200 motion-reduce:transition-none ${
                  active ? "text-primary stroke-[2.5]" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs mt-1 transition-colors duration-200 motion-reduce:transition-none ${
                  active ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
