"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ColumnFiltersState } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, BarChart2, Briefcase } from "lucide-react";
import { DataTable } from "../_components/user-table/data-table";
import {
  supervisorColumns,
  Supervisor,
} from "../_components/user-table/supervisorsColumn";
import { AddSupervisorForm } from "../_components/AddSupervisorForm";

// Helper to decode JWT for initials
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

const getInitials = (fullName: string) => {
  const names = (fullName || "").trim().split(" ");
  const firstInitial = names[0]?.charAt(0).toUpperCase() || "";
  const lastInitial = names[names.length - 1]?.charAt(0).toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

const SupervisorsPage = () => {
  const token = useAuthStore((state) => state.token);

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [adminFullName, setAdminFullName] = useState("Admin User");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null);

  // Decode token for initials
  useEffect(() => {
    if (token) {
      const tokenPayload = decodeJwt(token);
      const fullName = tokenPayload?.fullName || "Admin User";
      setAdminFullName(fullName);
    }
  }, [token]);

  const fetchSupervisors = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter for supervisors only
        const rawSupervisors = data.filter(
          (user: any) => user.role === "SUPERVISOR"
        );

        // Map to Supervisor type (assumes backend includes supervisees)
        const supervisorsData: Supervisor[] = rawSupervisors.map(
          (user: any) => {
            const supervisees = user.supervisees || [];
            const internsList =
              supervisees.map((i: any) => i.fullName).join(", ") || "None";
            return {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              assignedDomain: user.domain || "General",
              experience: user.experience || "0 years", // Backend should add 'experience'
              joinDate: user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A",
              assignedInterns: {
                count: supervisees.length,
                list: internsList,
              },
            };
          }
        );

        setSupervisors(supervisorsData);
      } else {
        const errorText = await response.text();
        console.error(
          `Server error fetching supervisors (Status: ${response.status}):`,
          errorText
        );
        setFetchError(
          `Failed to load supervisors: Server returned status ${response.status}.`
        );
        setSupervisors([]);
      }
    } catch (error) {
      console.error("Network error fetching supervisors:", error);
      setFetchError(
        "A network error occurred. Ensure the API server is running."
      );
      setSupervisors([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  // Accurate stats based on real data
  const totalSupervisors = supervisors.length;
  const activeSupervisors = supervisors.filter(
    (s) => s.assignedInterns.count > 0
  ).length;
  const availableSupervisors = supervisors.filter(
    (s) => s.assignedInterns.count === 0
  ).length;
  const totalInternsSupervised = supervisors.reduce(
    (sum, s) => sum + s.assignedInterns.count,
    0
  );

  // Refresh after adding supervisor
  const handleUserAdded = useCallback(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  // Action handlers
  const handleViewSupervisor = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    console.log(`Viewing Supervisor: ${supervisor.fullName}`); // TODO: Open modal
  };

  const handleEditSupervisor = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    console.log(`Editing Supervisor: ${supervisor.fullName}`); // TODO: Open edit modal
  };

  // Filter handler
  const handleGeneralFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== "fullName");
      if (event.target.value) {
        return [...existing, { id: "fullName", value: event.target.value }];
      }
      return existing;
    });
  };

  const initials = getInitials(adminFullName);

  if (fetchError) {
    return (
      <div className="p-4">
        <header className="flex items-center justify-between shadow-sm p-4 bg-white">
          <div>
            <h1 className="text-3xl font-bold">Supervisors Management</h1>
            <p className="text-muted-foreground">
              Manage supervisor accounts and their domain assignments
            </p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
            <p>{initials}</p>
          </div>
        </header>
        <main className="p-4">
          <div className="text-destructive">{fetchError}</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Supervisors Management</h1>
          <p className="text-muted-foreground">
            Manage supervisor accounts and their domain assignments
          </p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>{initials}</p>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-8">
          <AddSupervisorForm onUserAdded={handleUserAdded} />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Supervisors
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSupervisors}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Supervisors
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {activeSupervisors}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {availableSupervisors}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Interns Supervised
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInternsSupervised}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Supervisors ({totalSupervisors})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="flex items-center gap-4 py-4 border-b">
              <Input
                placeholder="Search by name, email, or domain..."
                className="max-w-sm"
                onChange={handleGeneralFilterChange}
              />
            </div>

            {/* Data Table */}
            {isLoading ? (
              <div className="text-center p-12 text-muted-foreground">
                Loading supervisor data...
              </div>
            ) : (
              <DataTable
                columns={supervisorColumns}
                data={supervisors}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                searchColumnId="fullName"
                meta={{
                  onViewSupervisor: handleViewSupervisor,
                  onEditSupervisor: handleEditSupervisor,
                }}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SupervisorsPage;
