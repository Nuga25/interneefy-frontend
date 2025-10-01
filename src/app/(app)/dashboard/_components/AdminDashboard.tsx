// app/(app)/dashboard/_components/AdminDashboard.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
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

const AdminDashboard = () => {
  const token = useAuthStore((state) => state.token);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

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
        fetchUsers();
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

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome, Sarah Johnson</p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>SJ</p>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-6">
          <p> Here&apos;s your internship program overview.</p>

          <div className="flex gap-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Intern
            </Button>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Supervisor
            </Button>
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
              onDeleteUser={handleDeleteUser}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
