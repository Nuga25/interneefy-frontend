"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardCheck,
  LogOut,
  Building2,
} from "lucide-react";

type SupervisorSidebarProps = {
  onLinkClick?: () => void;
};

type Company = {
  id: number;
  name: string;
  logoUrl: string | null;
};

export function SupervisorSidebar({ onLinkClick }: SupervisorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);

  const [company, setCompany] = useState<Company | null>(null);
  const [logoError, setLogoError] = useState(false);

  //fetch company details
  useEffect(() => {
    const fetchCompany = async () => {
      if (!token) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/company`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCompany(data);
        }
      } catch (error) {
        console.error("Error fetching company:", error);
      }
    };

    fetchCompany();
  }, [token]);

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
      href: "/dashboard/myInterns",
      label: "My Interns",
      icon: Users,
    },
    {
      href: "/dashboard/assignedTasks",
      label: "Assigned Tasks",
      icon: CheckSquare,
    },
    {
      href: "/dashboard/evaluations",
      label: "Evaluations",
      icon: ClipboardCheck,
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
          {/* Company Logo */}
          {company?.logoUrl && !logoError ? (
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image
                src={company.logoUrl}
                alt={`${company.name} logo`}
                fill
                className="object-contain rounded"
                unoptimized
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="h-8 w-8 flex-shrink-0 rounded bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          )}

          {/* Company Name */}
          <span className="font-semibold text-md truncate">
            {company?.name || "Loading..."}
          </span>
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
    </>
  );
}
