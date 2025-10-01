"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { jwtDecode } from "jwt-decode";
import AdminDashboard from "./_components/AdminDashboard";
import SupervisorDashboard from "./_components/SupervisorDashboard";
import InternDashboard from "./_components/InternDashboard";

// Define a type for our decoded token
type DecodedToken = {
  userId: number;
  companyId: number;
  role: "ADMIN" | "SUPERVISOR" | "INTERN";
};

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string | null;
}

// --- MAIN DASHBOARD PAGE ---
// This component decides which dashboard to show based on the user's role.
export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>; // Show a generic loading state initially
  }

  if (!token) {
    return <div>Redirecting to login...</div>; // Or null, layout will handle it
  }

  const { role } = jwtDecode<DecodedToken>(token);

  if (role === "ADMIN") {
    return <AdminDashboard />;
  }
  if (role === "SUPERVISOR") {
    return <SupervisorDashboard />;
  }
  if (role === "INTERN") {
    return <InternDashboard />;
  }

  return <div>Invalid user role.</div>;
}
