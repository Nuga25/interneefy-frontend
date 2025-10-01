"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { jwtDecode } from "jwt-decode";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  User,
  LogOut,
  UserCheck,
  Building2,
  Settings,
} from "lucide-react";

// Define a type for our decoded token
type DecodedToken = {
  userId: number;
  companyId: number;
  role: "ADMIN" | "SUPERVISOR" | "INTERN";
};

export function Sidebar() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  useEffect(() => {
    setIsClient(true); // Set to true once the component mounts in the browser
  }, []);

  if (!isClient) {
    return null; // Don't render anything on the server or during the initial load
  }

  if (!token) return null; // If no token after loading, render nothing (layout will redirect)

  const decodedToken = jwtDecode<DecodedToken>(token);
  const userRole = decodedToken.role;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SUPERVISOR", "INTERN"],
    }, // Interns also see dashboard
    {
      href: "/dashboard/interns",
      label: "Interns",
      icon: Users,
      roles: ["ADMIN", "SUPERVISOR"],
    }, // Separate page for interns list
    {
      href: "/dashboard/supervisors",
      label: "Supervisors",
      icon: UserCheck,
      roles: ["ADMIN"],
    }, // Separate page for supervisors list
    {
      href: "/dashboard/domains",
      label: "Domains",
      icon: Building2,
      roles: ["ADMIN"],
    }, // Domain management
    {
      href: "/dashboard/tasks",
      label: "My Tasks",
      icon: CheckSquare,
      roles: ["INTERN", "SUPERVISOR"],
    }, // Supervisors manage tasks too
    {
      href: "/dashboard/profile",
      label: "My Profile",
      icon: User,
      roles: ["INTERN", "SUPERVISOR", "ADMIN"],
    }, // Everyone has a profile
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      roles: ["ADMIN"],
    }, // Admin settings
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-foreground text-background p-4 flex flex-col">
      <div className="p-4 mb-4 border-b border-muted/20">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-2xl">TechCorp Solutions</span>{" "}
          {/* Company Name */}
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {navLinks.map(
          (link) =>
            link.roles.includes(userRole) && (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors 
                ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`} // Active link styling
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            )
        )}
      </nav>
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
      {/* User profile at the bottom */}
      <div className="mt-auto pt-4 border-t border-muted/20">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            SJ {/* First letters of "Sarah Johnson" */}
          </div>
          <div>
            <p className="font-semibold text-white">Sarah Johnson</p>{" "}
            {/* TODO: Make dynamic */}
            <p className="text-xs text-muted-foreground">Admin</p>{" "}
            {/* TODO: Make dynamic */}
          </div>
        </div>
      </div>
    </aside>
  );
}
