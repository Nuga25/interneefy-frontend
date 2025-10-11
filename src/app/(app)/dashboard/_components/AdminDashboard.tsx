// app/(app)/dashboard/_components/AdminDashboard.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ColumnFiltersState } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  PlusCircle,
  Target,
  CheckCircle2,
} from "lucide-react";
import { BarChartComponent, PieChartComponent } from "@/components/Charts";
import { DataTable } from "./user-table/data-table";
import { columns, User } from "./user-table/columns";
import { AddInternForm } from "./AddInternForm";
import { AddSupervisorForm } from "./AddSupervisorForm";

// Helper function to safely decode JWT payload (since we cannot use external libraries)
// This extracts the JSON payload from the middle segment of the JWT.
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    // Convert base64url to base64 format
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Decode base64 and handle encoding issues
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

//function to generate initials from name
const getInitials = (fullName: string) => {
  const names = (fullName || "").trim().split(" ");
  const firstInitial = names[0]?.charAt(0).toUpperCase() || "";
  const lastInitial = names[names.length - 1]?.charAt(0).toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

const AdminDashboard = () => {
  const token = useAuthStore((state) => state.token);

  const [adminId, setAdminId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // New state to control data fetching

  const [users, setUsers] = useState<User[]>([]);
  const [adminProfile, setAdminProfile] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    if (token) {
      const tokenPayload = decodeJwt(token);
      const id =
        tokenPayload?.userId?.toString() || tokenPayload?.sub?.toString();
      if (id) {
        setAdminId(id);
      }
      // Once we've checked the token, we are initialized (even if ID is null)
      setIsInitialized(true);
    }
  }, [token]);

  const fetchUsers = useCallback(
    async (currentAdminId: string | null, setProfile = true) => {
      if (!token || !currentAdminId) {
        // If we don't have a token or an ID, we can't fetch the list for profiling.
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
          const data: User[] = await response.json();
          setUsers(data);

          // Find the admin profile using the ID extracted from the token
          if (setProfile) {
            const currentAdmin = data.find(
              (user) => user.id.toString() === currentAdminId
            );

            if (currentAdmin) {
              setAdminProfile(currentAdmin);
              console.log(
                "Admin Profile found and set:",
                currentAdmin.fullName
              );
            } else {
              console.warn(
                `Admin user with ID ${currentAdminId} not found in the fetched user list.`
              );
              setAdminProfile({
                id: 0,
                fullName: "Fallback Admin User",
                email: "default@company.com",
                role: "ADMIN",
              });
            }
          }
        } else {
          const errorText = await response.text();
          console.error(
            `Server error fetching users (Status: ${response.status}):`,
            errorText
          );
          setFetchError(
            `Failed to load user list: Server returned status ${response.status}. Please check your backend logs.`
          );
          setUsers([]);
        }
      } catch (error) {
        console.error("Network error fetching users:", error);
        setFetchError(
          "A network error occurred. Ensure the API server is running at localhost:4000."
        );
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isInitialized) {
      fetchUsers(adminId);
    }
  }, [isInitialized, adminId, fetchUsers]);

  const handleDeleteUser = async (userId: number) => {
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        // If delete is successful, refresh the user list to update the UI
        fetchUsers(adminId, false);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Calculate stats based on the fetched user data
  const totalInterns = users.filter((user) => user.role === "INTERN").length;
  const totalSupervisors = users.filter(
    (user) => user.role === "SUPERVISOR"
  ).length;
  const fullName = adminProfile?.fullName || "Admin User";
  const initials = adminProfile ? getInitials(adminProfile.fullName) : "AU";
  const supervisors = users.filter((user) => user.role === "SUPERVISOR");

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {fullName}</p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>{initials}</p>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-6">
          <p>Here&apos;s your internship program overview.</p>

          <div className="flex gap-2">
            <AddInternForm
              onUserAdded={() => fetchUsers(adminId, false)}
              supervisors={supervisors}
            />
            <AddSupervisorForm onUserAdded={() => fetchUsers(adminId, false)} />
          </div>
        </div>
        {/* Top Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Internships
              </CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalInterns}
              </div>
              <small>Currently enrolled</small>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Interns
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalInterns}
              </div>
              <small>All-time enrollment</small>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Supervisors
              </CardTitle>
              <UserCheck className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalSupervisors}
              </div>
              <small>Team mentors</small>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasks In Progress
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">20</div>
              <small>Across all interns</small>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Intern Enrollment Over Time</CardTitle>
              <CardDescription>
                A look at intern sign-ups this semester.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <BarChartComponent />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interns by Domain</CardTitle>
              <CardDescription>
                Distribution of interns across departments.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <PieChartComponent />
            </CardContent>
          </Card>
        </div>

        {/* Users Overview Table (Placeholder) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Users Overview</CardTitle>
            <CardDescription>
              Manage all interns and supervisors in your company.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={users}
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              searchColumnId="fullName"
              meta={{ deleteUser: handleDeleteUser }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
