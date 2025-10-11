"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SupervisorSidebar } from "@/components/SupervisorSidebar";
import { InternSidebar } from "@/components/InternSidebar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode";

// Define a type for our decoded token
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
  const router = useRouter();
  const pathname = usePathname();

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu on navigation change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Authentication and Hydration Logic
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

  // TRAFFIC COP: Decode token once and determine user role
  let userRole: DecodedToken["role"] = "INTERN"; // Default safe role
  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      userRole = decodedToken.role;
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }

  // TRAFFIC COP: Select the appropriate sidebar component based on role
  const renderSidebarContent = () => {
    switch (userRole) {
      case "ADMIN":
        return <AdminSidebar onLinkClick={toggleMobileMenu} />;
      case "SUPERVISOR":
        return <SupervisorSidebar onLinkClick={toggleMobileMenu} />;
      case "INTERN":
        return <InternSidebar onLinkClick={toggleMobileMenu} />;
      default:
        return <InternSidebar onLinkClick={toggleMobileMenu} />; // Fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar - Visible only on lg: screens */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-foreground text-background p-4 flex-col min-h-[100%]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Header - Visible only on small screens */}
      <MobileHeader toggleMenu={toggleMobileMenu} />

      {/* Off-Canvas Mobile Menu Overlay (Conditional Rendering) */}
      {isMobileMenuOpen && (
        <>
          {/* Background overlay to close menu */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          ></div>

          {/* Actual Off-Canvas Sidebar */}
          <aside className="fixed top-0 left-0 w-64 h-full bg-foreground text-background p-4 flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
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

            {/* Render the same role-specific sidebar content */}
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-muted/40 min-h-screen pt-0 lg:pt-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
