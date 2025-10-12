"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { userApi, taskApi, Task, User } from "@/lib/api";
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
  AlertCircle,
} from "lucide-react";
import { BarChartComponent } from "@/components/Charts";

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
  const [supervisorId, setSupervisorId] = useState<number | null>(null);
  const [interns, setInterns] = useState<InternWithProgress[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
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
      setSupervisorId(tokenPayload?.userId);

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
      setTasks(supervisionTasks);

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

      // Prepare chart data
      const chartData = [
        { name: "TODO", tasks: stats.pending },
        { name: "IN PROGRESS", tasks: stats.inProgress },
        { name: "COMPLETED", tasks: stats.completed },
      ];
      setTaskChartData(chartData);

      // Generate recent activities from tasks
      const activities: Activity[] = supervisionTasks
        .slice(0, 10) // Get latest 10 tasks
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 4) // Show top 4
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
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            ) : interns.length > 0 ? (
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
                              <h3 className="font-semibold">
                                {intern.fullName}
                              </h3>
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
                                {intern.domain || "Not specified"}
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
                                {intern.startDate
                                  ? new Date(
                                      intern.startDate
                                    ).toLocaleDateString()
                                  : "N/A"}
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
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No interns assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
