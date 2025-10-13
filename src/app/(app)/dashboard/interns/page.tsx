"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, CheckCircle2, Clock, CalendarCheck } from "lucide-react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { DataTable } from "../_components/user-table/data-table";
import { AddInternForm } from "../_components/AddInternForm";
import { internColumns, Intern } from "../_components/user-table/internsColumn";

// Helper function to safely decode JWT payload
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

// Function to generate initials from name
const getInitials = (fullName: string) => {
  const names = (fullName || "").trim().split(" ");
  const firstInitial = names[0]?.charAt(0).toUpperCase() || "";
  const lastInitial = names[names.length - 1]?.charAt(0).toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

// Compute status based on dates (assuming current date is Oct 12, 2025 for consistency)
const computeStatus = (
  startDate?: string | Date | null,
  endDate?: string | Date | null
): Intern["status"] => {
  const now = new Date("2025-10-12");
  if (!startDate || !endDate) return "Active";
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < now) return "Completed";
  if (start > now) return "Upcoming";
  return "Active";
};

const InternsPage = () => {
  const token = useAuthStore((state) => state.token);

  const [interns, setInterns] = useState<Intern[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [adminFullName, setAdminFullName] = useState("Admin User");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Table filtering state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Decode token for admin initials
  useEffect(() => {
    if (token) {
      const tokenPayload = decodeJwt(token);
      const fullName = tokenPayload?.fullName || "Admin User";
      setAdminFullName(fullName);
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    // Combined fetch for users + supervisors
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
        // Filter for interns
        const rawInterns = data.filter((user: any) => user.role === "INTERN");

        // Map to Intern type
        const internsData: Intern[] = rawInterns.map((user: any) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          domain: user.domain || "General",
          assignedSupervisor: user.supervisor?.fullName || "Unassigned",
          startDate: user.startDate
            ? new Date(user.startDate).toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              })
            : "N/A",
          endDate: user.endDate
            ? new Date(user.endDate).toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              })
            : "N/A",
          status: computeStatus(user.startDate, user.endDate),
        }));

        // Filter for supervisors
        const supervisorsData = data.filter(
          (user: any) => user.role === "SUPERVISOR"
        );

        setInterns(internsData);
        setSupervisors(supervisorsData);
      } else {
        const errorText = await response.text();
        console.error(
          `Server error fetching data (Status: ${response.status}):`,
          errorText
        );
        setFetchError(
          `Failed to load data: Server returned status ${response.status}.`
        );
        setInterns([]);
        setSupervisors([]);
      }
    } catch (error) {
      console.error("Network error fetching data:", error);
      setFetchError(
        "A network error occurred. Ensure the API server is running."
      );
      setInterns([]);
      setSupervisors([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Accurate stats based on real data
  const totalInterns = interns.length;
  const activeInterns = interns.filter((i) => i.status === "Active").length;
  const completedInterns = interns.filter(
    (i) => i.status === "Completed"
  ).length;
  const upcomingInterns = interns.filter((i) => i.status === "Upcoming").length;

  // Refresh data after adding intern
  const handleUserAdded = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Filter handlers (unchanged)
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

  const handleStatusFilterChange = (value: string) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== "status");
      if (value !== "All Status") {
        return [...existing, { id: "status", value: value }];
      }
      return existing;
    });
  };

  const handleDomainFilterChange = (value: string) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== "domain");
      if (value !== "All Domains") {
        return [...existing, { id: "domain", value: value }];
      }
      return existing;
    });
  };

  // Action handlers
  const handleEditIntern = (intern: Intern) => {
    setSelectedIntern(intern);
    setIsEditModalOpen(true);
  };

  const handleViewIntern = (intern: Intern) => {
    setSelectedIntern(intern);
    setIsViewModalOpen(true);
  };

  const handleMessageIntern = (email: string) => {
    window.location.href = `mailto:${email}?subject=Message%20from%20Admin%20regarding%20your%20internship`;
  };

  const initials = getInitials(adminFullName);

  if (fetchError) {
    return (
      <div className="p-4">
        <header className="flex items-center justify-between shadow-sm p-4 bg-white">
          <div>
            <h1 className="text-3xl font-bold">Interns Management</h1>
            <p className="text-muted-foreground">
              Manage all intern records and their information
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
          <h1 className="text-3xl font-bold">Interns Management</h1>
          <p className="text-muted-foreground">
            Manage all intern records and their information
          </p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>{initials}</p>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-8">
          <AddInternForm
            onUserAdded={handleUserAdded}
            supervisors={supervisors}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Interns
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInterns}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CalendarCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {activeInterns}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedInterns}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {upcomingInterns}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Interns ({totalInterns})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search & Filter Bar */}
            <div className="flex items-center gap-4 py-4 border-b">
              <Input
                placeholder="Search by name..."
                className="max-w-sm"
                onChange={handleGeneralFilterChange}
              />

              <Select
                defaultValue="All Status"
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>

              <Select
                defaultValue="All Domains"
                onValueChange={handleDomainFilterChange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Domains">All Domains</SelectItem>
                  <SelectItem value="Software Engineering">
                    Software Engineering
                  </SelectItem>
                  <SelectItem value="Product Design">Product Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Table */}
            {isLoading ? (
              <div className="text-center p-12 text-muted-foreground">
                Loading intern data...
              </div>
            ) : (
              <DataTable
                columns={internColumns}
                data={interns}
                // Pass action handlers via meta (update DataTable to use meta.viewIntern, etc., or adjust columns to accept props)
                meta={{
                  viewIntern: handleViewIntern,
                  editIntern: handleEditIntern,
                  messageUser: handleMessageIntern,
                }}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                searchColumnId="fullName"
              />
            )}
          </CardContent>
        </Card>

        {/* Edit Intern Modal */}
        {/* <EditInternModal
          intern={selectedIntern}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => fetchInterns()} // Refresh data
          supervisors={supervisors}
        /> */}
      </main>
    </div>
  );
};

export default InternsPage;
