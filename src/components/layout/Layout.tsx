import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { LayoutDashboard, Target, BookOpen, Settings, Play, BarChart3, CalendarDays, Compass, Bookmark, StickyNote, Menu } from "lucide-react";
import { MeditationIcon } from "@/components/icons/MeditationIcon";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/session", label: "Session", icon: Play },
  { path: "/schedule", label: "Schedule", icon: CalendarDays },
  { path: "/progress", label: "Progress", icon: BarChart3 },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/mr-chad", label: "Mr. Chad", icon: MeditationIcon },
];

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg hidden sm:inline">Chad Tutor</span>
            </Link>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex flex-1 justify-center">
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
                      {Icon && <Icon className="h-4 w-4" />}
                      <span className="hidden lg:inline">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant={location.pathname === "/bookmarks" ? "secondary" : "ghost"}
                size="icon"
                asChild
                title="Bookmarks"
              >
                <Link to="/bookmarks">
                  <Bookmark className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant={location.pathname === "/my-notes" ? "secondary" : "ghost"}
                size="icon"
                asChild
                title="Notes"
              >
                <Link to="/my-notes">
                  <StickyNote className="h-4 w-4" />
                </Link>
              </Button>
            </div>
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

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant={location.pathname === "/bookmarks" ? "secondary" : "ghost"}
              size="icon"
              asChild
            >
              <Link to="/bookmarks">
                <Bookmark className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant={location.pathname === "/my-notes" ? "secondary" : "ghost"}
              size="icon"
              asChild
            >
              <Link to="/my-notes">
                <StickyNote className="h-4 w-4" />
              </Link>
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path.startsWith("/session") 
                      ? location.pathname.startsWith("/session")
                      : location.pathname === item.path;

                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "secondary" : "ghost"}
                        asChild
                        className="w-full justify-start gap-3"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to={item.path}>
                          {Icon && <Icon className="h-5 w-5" />}
                          {item.label}
                        </Link>
                      </Button>
                    );
                  })}
                  <div className="border-t my-4" />
                  <Button
                    variant={location.pathname === "/settings" ? "secondary" : "ghost"}
                    asChild
                    className="w-full justify-start gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/settings">
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
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
