// app/(app)/dashboard/_components/SupervisorDashboard.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
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
  CheckCircle2,
  Clock,
  TrendingUp,
  UserPlus,
  ClipboardCheck,
} from "lucide-react";
import { BarChartComponent } from "@/components/Charts";

// Types
type Intern = {
  id: number;
  fullName: string;
  email: string;
  domain: string;
  startDate: string;
  endDate: string;
  progress: number;
  activeTasks: number;
};

type Task = {
  id: number;
  title: string;
  internName: string;
  status: string;
  dueDate: string;
  priority: string;
};

type Activity = {
  id: number;
  message: string;
  timestamp: string;
  type: "task" | "evaluation" | "intern";
};

// Helper function to decode JWT
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

const SupervisorDashboard = () => {
  const token = useAuthStore((state) => state.token);

  const [supervisorName, setSupervisorName] = useState<string>("Supervisor");
  const [interns, setInterns] = useState<Intern[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [taskChartData, setTaskChartData] = useState<
    Array<{ name: string; tasks: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - replace with actual API calls
  useEffect(() => {
    if (token) {
      const tokenPayload = decodeJwt(token);
      setSupervisorName(tokenPayload?.fullName || "Supervisor");

      // Mock interns data
      setInterns([
        {
          id: 1,
          fullName: "John Doe",
          email: "john@example.com",
          domain: "Software Development",
          startDate: "2025-01-15",
          endDate: "2025-06-15",
          progress: 65,
          activeTasks: 3,
        },
        {
          id: 2,
          fullName: "Jane Smith",
          email: "jane@example.com",
          domain: "UI/UX Design",
          startDate: "2025-02-01",
          endDate: "2025-07-01",
          progress: 45,
          activeTasks: 2,
        },
        {
          id: 3,
          fullName: "Mike Johnson",
          email: "mike@example.com",
          domain: "Data Analytics",
          startDate: "2025-01-20",
          endDate: "2025-06-20",
          progress: 80,
          activeTasks: 1,
        },
      ]);

      // Mock task stats
      setTaskStats({
        total: 15,
        pending: 4,
        inProgress: 6,
        completed: 5,
      });

      // Mock chart data
      setTaskChartData([
        { name: "TODO", tasks: 4 },
        { name: "IN PROGRESS", tasks: 6 },
        { name: "COMPLETED", tasks: 5 },
      ]);

      // Mock recent activities
      setRecentActivities([
        {
          id: 1,
          message: "John Doe completed 'API Integration' task",
          timestamp: "2 hours ago",
          type: "task",
        },
        {
          id: 2,
          message: "Jane Smith updated 'Design Wireframes' to In Progress",
          timestamp: "5 hours ago",
          type: "task",
        },
        {
          id: 3,
          message: "Evaluation submitted for Mike Johnson",
          timestamp: "1 day ago",
          type: "evaluation",
        },
        {
          id: 4,
          message: "New intern Sarah Williams assigned to you",
          timestamp: "2 days ago",
          type: "intern",
        },
      ]);

      setIsLoading(false);
    }
  }, [token]);

  const completionRate =
    interns.length > 0
      ? Math.round(
          interns.reduce((acc, intern) => acc + intern.progress, 0) /
            interns.length
        )
      : 0;

  const initials = getInitials(supervisorName);

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {supervisorName}</p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>{initials}</p>
        </div>
      </header>

      <main className="p-4">
        <p className="mb-6">Here&apos;s your supervision overview.</p>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Interns
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {interns.length}
              </div>
              <small>Under supervision</small>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {taskStats.total}
              </div>
              <small>Assigned tasks</small>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {taskStats.pending}
              </div>
              <small>Awaiting action</small>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {completionRate}%
              </div>
              <small>Average progress</small>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activities */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Status</CardTitle>
              <CardDescription>Overview of all assigned tasks</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <BarChartComponent data={taskChartData} isLoading={isLoading} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your interns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${
                        activity.type === "task"
                          ? "bg-blue-500"
                          : activity.type === "evaluation"
                          ? "bg-green-500"
                          : "bg-purple-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supervised Interns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Supervised Interns</CardTitle>
              <CardDescription>
                Track progress of interns under your supervision
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
              <Button size="sm">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Submit Evaluation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interns.map((intern) => (
                <Card key={intern.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
                            {getInitials(intern.fullName)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{intern.fullName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {intern.email}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Domain
                            </p>
                            <p className="text-sm font-medium">
                              {intern.domain}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Active Tasks
                            </p>
                            <p className="text-sm font-medium">
                              {intern.activeTasks}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Start Date
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(intern.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Progress
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${intern.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {intern.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Assign Task
                        </Button>
                        <Button size="sm">Evaluate</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
