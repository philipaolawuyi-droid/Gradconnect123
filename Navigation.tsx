import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu, X, LogOut, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: notifications } = trpc.notifications.getNotifications.useQuery({ limit: 10 });
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const navLinks = [
    { label: "Feed", href: "/feed" },
    { label: "Events", href: "/events" },
    { label: "Directory", href: "/directory" },
    { label: "Messages", href: "/messages" },
    { label: "Superlatives", href: "/superlatives" },
    { label: "Profile", href: `/profile/${user?.id}` },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b-2 border-primary shadow-lg">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            GradConnect
          </div>
          <div className="hidden sm:block art-deco-line-vertical h-10"></div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => setLocation(link.href)}
              className="text-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side - Theme, notifications, and user menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Notifications Bell */}
          <button
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setLocation("/notifications")}
          >
            <Bell size={20} className="text-primary" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:flex gap-2 btn-luxury-outline"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  setLocation(link.href);
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full btn-luxury-outline mt-2"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
