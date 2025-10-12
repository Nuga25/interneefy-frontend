"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { jwtDecode } from "jwt-decode";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { User, Calendar, Zap } from "lucide-react";

// Types
type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "PENDING" | "APPROVED";
type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

type DecodedToken = {
  userId: number;
  companyId: number;
  role: "ADMIN" | "SUPERVISOR" | "INTERN";
  fullName: string;
};

type Task = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  category: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  supervisor: { fullName: string; email: string };
};

type InternProfile = {
  fullName: string;
  supervisor: { fullName: string; email: string } | null;
};

// Helper Functions
const decodeJwt = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

const getDaysRemainingText = (dueDate: string | null): string => {
  if (!dueDate) return "No due date";
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
  if (diffDays === 0) return "Due Today";
  return `Due in ${diffDays} days`;
};

const getStatusDisplay = (status: TaskStatus): string => {
  const map: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    PENDING: "Pending",
    APPROVED: "Approved",
  };
  return map[status] || status;
};

const getStatusColorClass = (status: TaskStatus): string => {
  switch (status) {
    case "APPROVED":
      return "border-green-500";
    case "COMPLETED":
      return "border-purple-500";
    case "IN_PROGRESS":
      return "border-blue-500";
    case "PENDING":
      return "border-yellow-500";
    case "TODO":
    default:
      return "border-gray-500";
  }
};

const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case "HIGH":
      return "text-red-600";
    case "MEDIUM":
      return "text-orange-600";
    case "LOW":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

// Calculate Progress
const calculateProgress = (tasks: Task[]) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === "COMPLETED" || t.status === "APPROVED"
  ).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return { totalTasks, completedTasks, completionPercentage };
};

// Components
const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  let colorClass = "";
  switch (status) {
    case "APPROVED":
      colorClass = "bg-green-600 text-white";
      break;
    case "COMPLETED":
      colorClass = "bg-purple-500 text-white";
      break;
    case "IN_PROGRESS":
      colorClass = "bg-blue-500 text-white";
      break;
    case "PENDING":
      colorClass = "bg-yellow-500 text-white";
      break;
    case "TODO":
    default:
      colorClass = "bg-gray-500 text-white";
      break;
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${colorClass}`}>
      {getStatusDisplay(status)}
    </span>
  );
};

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
  valueClass?: string;
}> = ({ icon, label, value, valueClass = "text-foreground" }) => (
  <div className="flex items-start space-x-3">
    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
      className: "w-5 h-5 mt-1 text-muted-foreground flex-shrink-0",
    })}
    <div className="flex flex-col">
      <span className="text-xs font-light text-muted-foreground">{label}</span>
      <span className={`font-medium text-base ${valueClass}`}>{value}</span>
    </div>
  </div>
);

const TaskDetailModal: React.FC<{
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: TaskStatus) => Promise<void>;
}> = ({ task, isOpen, onClose, onStatusChange }) => {
  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    await onStatusChange(task.id, newStatus);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
          <DialogDescription className="pt-2">
            {task.category || "General"} Task
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem
              icon={<User />}
              label="Assigned By"
              value={task.supervisor.fullName}
            />
            <DetailItem
              icon={<Calendar />}
              label="Due Date"
              value={getDaysRemainingText(task.dueDate)}
            />
            <DetailItem
              icon={<Zap />}
              label="Priority"
              value={task.priority}
              valueClass={getPriorityColor(task.priority)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {task.description || "No description provided"}
            </p>
          </div>
          <div className="flex items-center space-x-4 pt-4 border-t">
            <span className="text-lg font-semibold text-muted-foreground">
              Update Status:
            </span>
            <Select
              onValueChange={(value: TaskStatus) => handleStatusUpdate(value)}
              defaultValue={task.status}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaskCardItem: React.FC<{
  task: Task;
  onClick: () => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}> = ({ task, onClick, onStatusChange }) => {
  const bandColor = getStatusColorClass(task.status);

  return (
    <Card
      className={`shadow-md transition-shadow border-l-4 ${bandColor} relative overflow-hidden`}
    >
      <CardContent className="p-5 space-y-3">
        <div className="absolute top-5 right-5">
          <TaskStatusBadge status={task.status} />
        </div>
        <button
          onClick={onClick}
          className="block text-left hover:text-primary transition-colors pr-24 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded"
        >
          <h3 className="text-xl font-bold">{task.title}</h3>
        </button>
        <p className="text-sm font-medium text-muted-foreground pb-2 border-b">
          Assigned by:{" "}
          <span className="font-semibold text-foreground">
            {task.supervisor.fullName}
          </span>{" "}
          • {getDaysRemainingText(task.dueDate)}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description || "No description"}
        </p>
        <div className="flex justify-between items-center pt-3">
          <span className="text-sm text-muted-foreground mr-4">Status:</span>
          <Select
            onValueChange={(value: TaskStatus) =>
              onStatusChange(task.id, value)
            }
            value={task.status}
          >
            <SelectTrigger className="w-full max-w-[200px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function TasksPage() {
  const token = useAuthStore((state) => state.token);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<InternProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const decodedToken = token ? decodeJwt(token) : null;
  const internId = decodedToken?.userId;

  // Calculate progress from tasks
  const progress = calculateProgress(tasks);

  const fetchTasks = useCallback(async () => {
    if (!token || !internId) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      // Fetch tasks
      const tasksRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!tasksRes.ok) {
        throw new Error(`Tasks fetch failed: ${tasksRes.status}`);
      }

      const tasksData: Task[] = await tasksRes.json();
      setTasks(tasksData);

      // Fetch profile
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${internId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!profileRes.ok) {
        throw new Error(`Profile fetch failed: ${profileRes.status}`);
      }

      const userData = await profileRes.json();
      setProfile({
        fullName: userData.fullName,
        supervisor: userData.supervisor || null,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      setFetchError("Failed to load tasks and profile. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [token, internId]);

  useEffect(() => {
    if (token && internId) fetchTasks();
  }, [fetchTasks, token, internId]);

  const handleStatusChange = async (id: number, newStatus: TaskStatus) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state - this will trigger progress recalculation
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Update error:", error);
      setFetchError("Failed to update task status");
    }
  };

  if (fetchError) {
    return <div className="p-4 text-destructive">{fetchError}</div>;
  }

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (decodedToken?.role !== "INTERN") {
    return <div className="p-4">Access Denied: Intern role required.</div>;
  }

  return (
    <>
      <div>
        <header className="flex items-center justify-between shadow-sm p-4 bg-white">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {profile.fullName}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Here&apos;s what&apos;s on your plate for today.
            </p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
            <p>
              {profile.fullName.charAt(0)}
              {profile.fullName.split(" ").pop()?.charAt(0) || ""}
            </p>
          </div>
        </header>

        <main className="p-3 space-y-6">
          <div className="lg:col-span-2 space-y-6">
            <CardHeader className="p-0">
              <CardDescription className="text-lg font-medium">
                Your Assigned Tasks ({tasks.length})
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskCardItem
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  All clear! You currently have no active tasks assigned.
                </Card>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-6">
            {/* My Supervisor Card */}
            <Card className="shadow-md">
              <CardHeader className="p-4 pb-3 border-b">
                <CardTitle className="text-lg">My Supervisor</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {profile.supervisor ? (
                  <>
                    <div className="text-lg font-semibold">
                      {profile.supervisor.fullName}
                    </div>
                    <div className="text-sm text-blue-500">
                      {profile.supervisor.email}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No supervisor assigned
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Progress Card */}
            <Card className="shadow-md">
              <CardHeader className="p-4 pb-3 border-b">
                <CardTitle className="text-lg">My Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Task Completion</span>
                    <span>{progress.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress.completionPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {progress.completedTasks} of {progress.totalTasks} tasks
                    completed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
