import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Target, BookOpen, Settings, Play, BarChart3, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/session/task-1", label: "Session", icon: Play },
  { path: "/planner", label: "Planner", icon: CalendarDays },
  { path: "/progress", label: "Progress", icon: BarChart3 },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center min-w-[180px] pl-6">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Chad Tutor</span>
            </Link>
          </div>

          {/* Navigation - centered */}
          <div className="flex-1 flex justify-center">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path.startsWith("/session") 
                  ? location.pathname.startsWith("/session")
                  : location.pathname === item.path;

                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                    className={cn(
                      "gap-2",
                      isActive && "bg-secondary"
                    )}
                  >
                    <Link to={item.path}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant={location.pathname === "/settings" ? "secondary" : "ghost"}
              size="icon"
              asChild
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
