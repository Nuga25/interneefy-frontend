"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { jwtDecode } from "jwt-decode";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  User,
  LogOut,
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

  if (!token) return null;

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
      roles: ["ADMIN", "SUPERVISOR"],
    },
    {
      href: "/dashboard/tasks",
      label: "My Tasks",
      icon: CheckSquare,
      roles: ["INTERN"],
    },
    {
      href: "/dashboard/users",
      label: "Manage Users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      href: "/dashboard/profile",
      label: "My Profile",
      icon: User,
      roles: ["INTERN"],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-foreground text-background p-4 flex flex-col">
      <div className="p-4 mb-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1>LOGO</h1>
          <span className="font-bold text-2xl">interneefy</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {navLinks.map(
          (link) =>
            link.roles.includes(userRole) && (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
