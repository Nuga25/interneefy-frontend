"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "./ui/button";
import { LayoutDashboard, CheckSquare, LogOut } from "lucide-react";

type InternSidebarProps = {
  onLinkClick?: () => void; // Optional callback for mobile menu closure
};

export function InternSidebar({ onLinkClick }: InternSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/tasks",
      label: "My Tasks",
      icon: CheckSquare,
    },
  ];

  return (
    <>
      <div className="p-4 mb-4 border-b border-muted/20">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={onLinkClick}
        >
          <span className="font-bold text-2xl">TechCorp Solutions</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors 
              ${
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        ))}
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
      <div className="mt-auto pt-4 border-t border-muted/20">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            SJ
          </div>
          <div>
            <p className="font-semibold text-white">Sarah Johnson</p>
            <p className="text-xs text-muted-foreground">Intern</p>
          </div>
        </div>
      </div>
    </>
  );
}
