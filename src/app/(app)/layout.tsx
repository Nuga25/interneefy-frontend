"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated); // Get hydration status
  const router = useRouter();

  // This logic now runs only after the store has confirmed it has loaded from storage
  if (hasHydrated && !token) {
    router.push("/login");
    return null; // Return null while redirecting
  }

  // Show a loading state until the store is hydrated
  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If hydrated and token exists, render the layout
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
