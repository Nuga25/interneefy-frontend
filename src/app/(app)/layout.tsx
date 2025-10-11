"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CheckSquare,
  UserCheck,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode"; // Added jwtDecode for role checking

// Define a type for our decoded token (Copied from Sidebar.tsx)
type DecodedToken = {
  userId: number;
  companyId: number;
  role: "ADMIN" | "SUPERVISOR" | "INTERN";
};

// Component for the mobile header/toggle
const MobileHeader = ({ toggleMenu }: { toggleMenu: () => void }) => {
  return (
    <header className="flex lg:hidden items-center justify-between p-4 bg-background border-b h-16 sticky top-0 z-20">
      {/* Logo/Company Name */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="font-bold text-lg text-foreground">
          TechCorp Solutions
        </span>
      </Link>

      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="text-foreground"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </header>
  );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout); // Added logout function
  const router = useRouter();
  const pathname = usePathname();

  // 1. Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu on navigation change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 4. Role Decoding and Link Definition (Moved from Sidebar.tsx)
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  let userRole: DecodedToken["role"] = "INTERN"; // Default safe role
  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      userRole = decodedToken.role;
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SUPERVISOR", "INTERN"],
    },
    {
      href: "/dashboard/interns",
      label: "Interns",
      icon: Users,
      roles: ["ADMIN", "SUPERVISOR"],
    },
    {
      href: "/dashboard/supervisors",
      label: "Supervisors",
      icon: UserCheck,
      roles: ["ADMIN"],
    },
    {
      href: "/dashboard/domains",
      label: "Domains",
      icon: Building2,
      roles: ["ADMIN"],
    },
    {
      href: "/dashboard/tasks",
      label: "My Tasks",
      icon: CheckSquare,
      roles: ["INTERN", "SUPERVISOR"],
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      roles: ["ADMIN"],
    },
  ];
  // End of Role Decoding and Link Definition

  // Authentication and Hydration Logic (Unchanged)
  if (hasHydrated && !token) {
    router.push("/login");
    return null;
  }

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If hydrated and token exists, render the layout
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar (Rendered once, visible on lg: screens) */}
      <Sidebar />

      {/* 2. Mobile Header - Visible only on small screens */}
      <MobileHeader toggleMenu={toggleMobileMenu} />

      {/* 3. Off-Canvas Mobile Menu Overlay (Conditional Rendering) */}
      {isMobileMenuOpen && (
        <>
          {/* Background overlay to close menu */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          ></div>

          {/* Actual Off-Canvas Sidebar */}
          <aside
            // This positioning ensures it slides in from the left
            className="fixed top-0 left-0 w-64 h-full bg-foreground text-background p-4 flex flex-col z-50 transform transition-transform duration-300 ease-in-out"
          >
            {/* Mobile Menu Close Button */}
            <div className="flex justify-end p-4 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Logo/Header (Mobile) */}
            <div className="p-4 mb-4 border-b border-muted/20">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
                onClick={toggleMobileMenu}
              >
                <span className="font-bold text-2xl">TechCorp Solutions</span>
              </Link>
            </div>

            {/* FIX: Full, Role-Based Mobile Navigation */}
            <nav className="flex-1 space-y-2">
              {navLinks.map(
                (link) =>
                  link.roles.includes(userRole) && (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={toggleMobileMenu} // Closes menu on link click
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors 
                                ${
                                  pathname.startsWith(link.href)
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  )
              )}
            </nav>
            {/* End of Role-Based Mobile Navigation */}

            {/* Mobile Logout Button (Copied from Sidebar.tsx) */}
            <div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Mobile User Profile (Copied from Sidebar.tsx) */}
            <div className="mt-auto pt-4 border-t border-muted/20">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  SJ {/* TODO: Make dynamic */}
                </div>
                <div>
                  <p className="font-semibold text-white">Sarah Johnson</p>{" "}
                  {/* TODO: Make dynamic */}
                  <p className="text-xs text-muted-foreground">
                    {userRole}
                  </p>{" "}
                  {/* Now using dynamic role */}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      {/* The sidebar is part of the flex layout on desktop, so no ml-64 is needed. */}
      <main className="flex-1 bg-muted/40 min-h-screen pt-0 lg:pt-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
