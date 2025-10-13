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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  UserCheck,
  Target,
  CheckCircle2,
  Mail,
  User as UserIcon,
  Briefcase,
} from "lucide-react";
import { BarChartComponent, PieChartComponent } from "@/components/Charts";
import { DataTable } from "./user-table/data-table";
import { columns, User } from "./user-table/columns";
import { AddInternForm } from "./AddInternForm";
import { AddSupervisorForm } from "./AddSupervisorForm";

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

const AdminDashboard = () => {
  const token = useAuthStore((state) => state.token);

  const [adminId, setAdminId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [adminProfile, setAdminProfile] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [enrollmentData, setEnrollmentData] = useState<
    Array<{ name: string; interns: number }>
  >([]);
  const [domainData, setDomainData] = useState<
    Array<{ name: string; value: number }>
  >([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [tasksInProgress, setTasksInProgress] = useState<number>(0);

  useEffect(() => {
    if (token) {
      const tokenPayload = decodeJwt(token);
      const id =
        tokenPayload?.userId?.toString() || tokenPayload?.sub?.toString();
      if (id) {
        setAdminId(id);
      }
      setIsInitialized(true);
    }
  }, [token]);

  const fetchUsers = useCallback(
    async (currentAdminId: string | null, setProfile = true) => {
      if (!token || !currentAdminId) {
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

          if (setProfile) {
            const currentAdmin = data.find(
              (user) => user.id.toString() === currentAdminId
            );

            if (currentAdmin) {
              setAdminProfile(currentAdmin);
            } else {
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
            `Failed to load user list: Server returned status ${response.status}.`
          );
          setUsers([]);
        }
      } catch (error) {
        console.error("Network error fetching users:", error);
        setFetchError(
          "A network error occurred. Ensure the API server is running."
        );
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const fetchTasksInProgress = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/supervision/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const tasks = await response.json();
        const inProgressCount = tasks.filter(
          (task: any) => task.status === "IN_PROGRESS"
        ).length;
        setTasksInProgress(inProgressCount);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [token]);

  const fetchChartStatistics = useCallback(async () => {
    if (!token) return;

    setChartsLoading(true);
    try {
      const enrollmentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/statistics/enrollment`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const domainResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/statistics/domains`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        setEnrollmentData(enrollmentData);
      }

      if (domainResponse.ok) {
        const domainData = await domainResponse.json();
        setDomainData(domainData);
      }
    } catch (error) {
      console.error("Error fetching chart statistics:", error);
    } finally {
      setChartsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isInitialized) {
      fetchUsers(adminId);
      fetchTasksInProgress();
    }
  }, [isInitialized, adminId, fetchUsers, fetchTasksInProgress]);

  useEffect(() => {
    if (isInitialized && token) {
      fetchChartStatistics();
    }
  }, [isInitialized, token, fetchChartStatistics]);

  const handleDeleteUser = async (userId: number) => {
    if (!token) return;

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        fetchUsers(adminId, false);
        alert("User deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

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

        {/* Summary Cards */}
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
              <div className="text-2xl font-bold text-primary">
                {tasksInProgress}
              </div>
              <small>Across all interns</small>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Intern Enrollment Over Time</CardTitle>
              <CardDescription>
                Recent intern sign-ups in your company.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <BarChartComponent
                data={enrollmentData}
                isLoading={chartsLoading}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interns by Domains</CardTitle>
              <CardDescription>
                Distribution of interns across domains.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <PieChartComponent data={domainData} isLoading={chartsLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
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
              meta={{
                deleteUser: handleDeleteUser,
                viewUser: handleViewUser,
              }}
            />
          </CardContent>
        </Card>

        {/* User Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete information about the user
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full h-16 w-16 flex items-center justify-center font-bold text-xl">
                    {getInitials(selectedUser.fullName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">
                      {selectedUser.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{selectedUser.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Role</p>
                          <p className="font-semibold">{selectedUser.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            User ID
                          </p>
                          <p className="font-semibold">{selectedUser.id}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {(selectedUser as any).domain && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Domain:</span>
                          <span className="font-medium">
                            {(selectedUser as any).domain}
                          </span>
                        </div>
                        {(selectedUser as any).startDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Start Date:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                (selectedUser as any).startDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {(selectedUser as any).endDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              End Date:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                (selectedUser as any).endDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
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

export default AdminDashboard;
