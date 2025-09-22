"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, CheckSquare, PlusCircle } from "lucide-react";

// Define a type for our decoded token
type DecodedToken = {
  role: "ADMIN" | "SUPERVISOR" | "INTERN";
  // Add other properties from your token if needed
};

// --- ADMIN DASHBOARD COMPONENT ---
const AdminDashboard = () => {
  const [stats, setStats] = useState({ interns: 0, supervisors: 0 });
  // TODO: Add state for users list

  // TODO: Fetch users and calculate stats

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Supervisors
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.supervisors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons and Interns Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Interns Overview</h2>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Intern
          </Button>
        </div>
        <Card>
          <CardContent className="p-4">
            {/* We will build the user table here later */}
            <p>A table of all interns will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- SUPERVISOR DASHBOARD COMPONENT ---
const SupervisorDashboard = () => {
  // TODO: Fetch assigned interns and their tasks

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Supervisor Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>My Interns</CardTitle>
          <CardDescription>
            An overview of your assigned interns and their progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>A list of your interns will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

// --- INTERN DASHBOARD COMPONENT ---
const InternDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token for authentication
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    fetchTasks();
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Tasks</h1>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <CardDescription>
            Here is a list of your assigned tasks. Update their status as you
            work on them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <ul>
              {tasks.map((task: any) => (
                <li key={task.id} className="border-b p-2">
                  {task.title} -{" "}
                  <span className="text-sm text-muted-foreground">
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no tasks assigned to you yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// --- MAIN DASHBOARD PAGE ---
// This component decides which dashboard to show based on the user's role.
export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <div className="text-center p-8">Loading user data...</div>;
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

  return <div>Invalid user role. Please contact support.</div>;
}
