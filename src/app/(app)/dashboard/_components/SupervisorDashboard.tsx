"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { userApi, taskApi, User } from "@/lib/api";
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
  AlertCircle,
} from "lucide-react";

// Types
type Activity = {
  id: number;
  message: string;
  timestamp: string;
  type: "task" | "evaluation" | "intern";
};

type InternWithProgress = User & {
  progress: number;
  activeTasks: number;
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

// Helper to format relative time
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

const SupervisorDashboard = () => {
  const token = useAuthStore((state) => state.token);

  const [supervisorName, setSupervisorName] = useState<string>("Supervisor");
  const [interns, setInterns] = useState<InternWithProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get supervisor info from token
      const tokenPayload = decodeJwt(token);
      setSupervisorName(tokenPayload?.fullName || "Supervisor");

      // Fetch all users and tasks in parallel
      const [allUsers, supervisionTasks] = await Promise.all([
        userApi.getAll(),
        taskApi.getSupervisionTasks(),
      ]);

      // Filter for interns supervised by this supervisor
      const supervisedInterns = allUsers.filter(
        (user) =>
          user.role === "INTERN" && user.supervisorId === tokenPayload?.userId
      );

      // Calculate progress and active tasks for each intern
      const internsWithProgress: InternWithProgress[] = supervisedInterns.map(
        (intern) => {
          const internTasks = supervisionTasks.filter(
            (task) => task.internId === intern.id
          );
          const completedTasks = internTasks.filter(
            (task) => task.status === "COMPLETED"
          ).length;
          const activeTasks = internTasks.filter(
            (task) => task.status !== "COMPLETED"
          ).length;
          const progress =
            internTasks.length > 0
              ? Math.round((completedTasks / internTasks.length) * 100)
              : 0;

          return {
            ...intern,
            progress,
            activeTasks,
          };
        }
      );

      setInterns(internsWithProgress);

      // Calculate task statistics
      const stats = {
        total: supervisionTasks.length,
        pending: supervisionTasks.filter((task) => task.status === "TODO")
          .length,
        inProgress: supervisionTasks.filter(
          (task) => task.status === "IN_PROGRESS"
        ).length,
        completed: supervisionTasks.filter(
          (task) => task.status === "COMPLETED"
        ).length,
      };
      setTaskStats(stats);

      // Generate recent activities from tasks
      const activities: Activity[] = supervisionTasks
        .slice(0, 10)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 4)
        .map((task, index) => ({
          id: index + 1,
          message: `${task.intern?.fullName || "Intern"} ${
            task.status === "COMPLETED"
              ? "completed"
              : task.status === "IN_PROGRESS"
              ? "is working on"
              : "was assigned"
          } "${task.title}"`,
          timestamp: getRelativeTime(task.createdAt),
          type: "task" as const,
        }));

      setRecentActivities(activities);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const completionRate =
    interns.length > 0
      ? Math.round(
          interns.reduce((acc, intern) => acc + intern.progress, 0) /
            interns.length
        )
      : 0;

  const initials = getInitials(supervisorName);

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error loading dashboard</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {isLoading ? "..." : interns.length}
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
                {isLoading ? "..." : taskStats.total}
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
                {isLoading ? "..." : taskStats.pending}
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
                {isLoading ? "..." : completionRate}%
              </div>
              <small>Average progress</small>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activities */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Status</CardTitle>
              <CardDescription>Overview of all assigned tasks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* TODO */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">To Do</span>
                      <span className="text-sm font-bold">
                        {taskStats.pending}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gray-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            taskStats.total > 0
                              ? (taskStats.pending / taskStats.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* IN PROGRESS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">In Progress</span>
                      <span className="text-sm font-bold">
                        {taskStats.inProgress}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            taskStats.total > 0
                              ? (taskStats.inProgress / taskStats.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* COMPLETED */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Completed</span>
                      <span className="text-sm font-bold">
                        {taskStats.completed}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            taskStats.total > 0
                              ? (taskStats.completed / taskStats.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {taskStats.total === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No tasks created yet
                    </p>
                  )}
                </div>
              )}
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
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
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
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
