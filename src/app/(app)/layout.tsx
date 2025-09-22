"use client";

import { useEffect, useState } from "react"; // Import useState
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // 1. Add loading state

  useEffect(() => {
    // This effect now checks the token and updates loading status
    if (token) {
      setIsLoading(false); // Token exists, we can show the page
    } else {
      router.push("/login"); // No token, redirect
    }
  }, [token, router]);

  // 2. Show a loading message while we verify the token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // 3. Only render the layout if loading is complete and token exists
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 bg-muted/40">{children}</main>
    </div>
  );
}
