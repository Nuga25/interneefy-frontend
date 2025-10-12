// app/(app)/dashboard/myInterns/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { userApi, taskApi, User, Task } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  UserPlus,
  ClipboardCheck,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

type InternWithStats = User & {
  status: "Active" | "Completed";
  progress: number;
  activeTasks: number;
  completedTasks: number;
};

const getInitials = (fullName: string) => {
  const names = (fullName || "").trim().split(" ");
  const firstInitial = names[0]?.charAt(0).toUpperCase() || "";
  const lastInitial = names[names.length - 1]?.charAt(0).toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

// Helper to decode JWT
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

const MyInternsPage = () => {
  const token = useAuthStore((state) => state.token);

  const [interns, setInterns] = useState<InternWithStats[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<InternWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch interns data from backend
  const fetchInterns = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get supervisor ID from token
      const tokenPayload = decodeJwt(token);
      const supervisorId = tokenPayload?.userId;

      // Fetch all users and tasks in parallel
      const [allUsers, allTasks] = await Promise.all([
        userApi.getAll(),
        taskApi.getSupervisionTasks(),
      ]);

      // Filter for interns supervised by this supervisor
      const supervisedInterns = allUsers.filter(
        (user) => user.role === "INTERN" && user.supervisorId === supervisorId
      );

      // Calculate stats for each intern
      const internsWithStats: InternWithStats[] = supervisedInterns.map(
        (intern) => {
          const internTasks = allTasks.filter(
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

          // Determine status based on end date
          const now = new Date();
          const endDate = intern.endDate ? new Date(intern.endDate) : null;
          const status = endDate && endDate < now ? "Completed" : "Active";

          return {
            ...intern,
            status,
            progress,
            activeTasks,
            completedTasks,
          };
        }
      );

      setInterns(internsWithStats);
      setFilteredInterns(internsWithStats);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load interns data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInterns();
  }, [fetchInterns]);

  // Filter interns based on search and filters
  useEffect(() => {
    let filtered = interns;

    if (searchTerm) {
      filtered = filtered.filter((intern) =>
        intern.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (domainFilter !== "all") {
      filtered = filtered.filter((intern) => intern.domain === domainFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((intern) => intern.status === statusFilter);
    }

    setFilteredInterns(filtered);
  }, [searchTerm, domainFilter, statusFilter, interns]);

  // Get unique domains from interns
  const domains = Array.from(
    new Set(interns.map((intern) => intern.domain).filter(Boolean))
  ) as string[];

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error loading interns</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={fetchInterns} className="mt-4" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <header className="shadow-sm p-4 bg-white">
        <h1 className="text-3xl font-bold">My Interns</h1>
        <p className="text-muted-foreground">
          Manage and track interns under your supervision
        </p>
      </header>

      <main className="p-4">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search interns by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Interns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : interns.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Interns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading
                  ? "..."
                  : interns.filter((i) => i.status === "Active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading
                  ? "..."
                  : interns.filter((i) => i.status === "Completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interns List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-32 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredInterns.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                {interns.length === 0
                  ? "No interns assigned to you yet."
                  : "No interns found matching your filters."}
              </CardContent>
            </Card>
          ) : (
            filteredInterns.map((intern) => (
              <Card key={intern.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Intern Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center font-medium flex-shrink-0">
                        {getInitials(intern.fullName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {intern.fullName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              intern.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {intern.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{intern.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{intern.domain || "Not specified"}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Start Date
                            </p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {intern.startDate
                                ? new Date(
                                    intern.startDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              End Date
                            </p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {intern.endDate
                                ? new Date(intern.endDate).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Active Tasks
                            </p>
                            <p className="text-sm font-medium">
                              {intern.activeTasks}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Completed Tasks
                            </p>
                            <p className="text-sm font-medium">
                              {intern.completedTasks}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-muted-foreground">
                              Overall Progress
                            </p>
                            <span className="text-xs font-medium">
                              {intern.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${intern.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex md:flex-col gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 md:flex-none"
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 md:flex-none"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Task
                      </Button>
                      <Button size="sm" className="flex-1 md:flex-none">
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Evaluate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default MyInternsPage;
