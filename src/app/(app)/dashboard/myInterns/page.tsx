"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { userApi, taskApi, User } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
  User as UserIcon,
  Briefcase,
  Clock,
  CheckCircle2,
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
  const [selectedIntern, setSelectedIntern] = useState<InternWithStats | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterns = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const tokenPayload = decodeJwt(token);
      const supervisorId = tokenPayload?.userId;

      const [allUsers, allTasks] = await Promise.all([
        userApi.getAll(),
        taskApi.getSupervisionTasks(),
      ]);

      const supervisedInterns = allUsers.filter(
        (user) => user.role === "INTERN" && user.supervisorId === supervisorId
      );

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

          const now = new Date();
          const endDate = intern.endDate ? new Date(intern.endDate) : null;
          const status = endDate && endDate < now ? "Completed" : "Active";

          return { ...intern, status, progress, activeTasks, completedTasks };
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

  const domains = Array.from(
    new Set(interns.map((intern) => intern.domain).filter(Boolean))
  ) as string[];

  const handleViewDetails = (intern: InternWithStats) => {
    setSelectedIntern(intern);
    setIsModalOpen(true);
  };

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
        {/* Filters */}
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

        {/* Stats */}
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

                    <div className="flex md:flex-col gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 md:flex-none"
                        onClick={() => handleViewDetails(intern)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Intern Details</DialogTitle>
              <DialogDescription>
                Complete information about the intern
              </DialogDescription>
            </DialogHeader>

            {selectedIntern && (
              <div className="space-y-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full h-16 w-16 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {getInitials(selectedIntern.fullName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold">
                        {selectedIntern.fullName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedIntern.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedIntern.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{selectedIntern.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Domain
                          </p>
                          <p className="font-semibold">
                            {selectedIntern.domain || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Role</p>
                          <p className="font-semibold">{selectedIntern.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Start Date
                          </p>
                          <p className="font-semibold">
                            {selectedIntern.startDate
                              ? new Date(
                                  selectedIntern.startDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            End Date
                          </p>
                          <p className="font-semibold">
                            {selectedIntern.endDate
                              ? new Date(
                                  selectedIntern.endDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <p className="text-2xl font-bold text-blue-600">
                            {selectedIntern.activeTasks}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Active Tasks
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-2xl font-bold text-green-600">
                            {selectedIntern.completedTasks}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Completed
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedIntern.progress}%
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Progress
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Overall Progress</p>
                        <span className="text-sm font-bold">
                          {selectedIntern.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${selectedIntern.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedIntern.createdAt && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Created At:
                          </span>
                          <span className="font-medium">
                            {new Date(
                              selectedIntern.createdAt
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            User ID:
                          </span>
                          <span className="font-medium">
                            {selectedIntern.id}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MyInternsPage;
