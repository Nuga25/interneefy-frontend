"use client";

import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Import Dropdown components for the actions menu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  RefreshCw,
  XCircle,
  MoreVertical,
  Eye, // New: For View Details
  Edit, // New: For Edit Task
  Trash2, // New: For Delete Task
} from "lucide-react";
import Link from "next/link";
import React from "react";

// --- Mock Data Structures ---

type TaskStatus =
  | "To-Do"
  | "In Progress"
  | "Completed"
  | "Approved"
  | "Pending";
type TaskPriority = "High" | "Medium" | "Low";
type AssigneeId = "alice-johnson" | "frank-thompson" | "mike-chen";

type Task = {
  id: number;
  title: string;
  description: string;
  assignee: string; // Display name
  assigneeId: AssigneeId; // ID for filtering
  dueDate: string;
  priority: TaskPriority;
  category: string;
  status: TaskStatus;
  estimatedHours: number;
  actualHours: number;
};

const mockTasks: Task[] = [
  {
    id: 201,
    title: "React Component Development",
    description: "Build reusable UI components using React and TypeScript",
    assignee: "Alice Johnson",
    assigneeId: "alice-johnson",
    dueDate: "3/22/2024",
    priority: "High",
    category: "Development",
    status: "Completed",
    estimatedHours: 8,
    actualHours: 7,
  },
  {
    id: 202,
    title: "API Integration Testing",
    description: "Test all API endpoints and document findings",
    assignee: "Frank Thompson",
    assigneeId: "frank-thompson",
    dueDate: "3/25/2024",
    priority: "Medium",
    category: "Testing",
    status: "In Progress",
    estimatedHours: 5,
    actualHours: 4,
  },
  {
    id: 203,
    title: "Database Design Documentation",
    description: "Create comprehensive database schema documentation",
    assignee: "Frank Thompson",
    assigneeId: "frank-thompson",
    dueDate: "3/20/2024",
    priority: "Medium",
    category: "Documentation",
    status: "Approved",
    estimatedHours: 6,
    actualHours: 5,
  },
  {
    id: 204,
    title: "Backend API Development",
    description: "Implement CRUD endpoints for user management module",
    assignee: "Mike Chen",
    assigneeId: "mike-chen",
    dueDate: "3/28/2024",
    priority: "High",
    category: "Development",
    status: "To-Do",
    estimatedHours: 12,
    actualHours: 0,
  },
  {
    id: 205,
    title: "UX Flowchart Review",
    description: "Review and provide feedback on the mobile app UX flowchart",
    assignee: "Alice Johnson",
    assigneeId: "alice-johnson",
    dueDate: "4/01/2024",
    priority: "Low",
    category: "Design",
    status: "Pending",
    estimatedHours: 2,
    actualHours: 1,
  },
];

// --- Utility Components ---

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  valueColorClass?: string;
}> = ({
  title,
  value,
  icon,
  description,
  valueColorClass = "text-foreground",
}) => (
  <Card className="flex-1 min-w-[200px] shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${valueColorClass}`}>{value}</div>
      <p className="text-xs text-muted-foreground pt-1">{description}</p>
    </CardContent>
  </Card>
);

const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  let colorClass = "";
  switch (status) {
    case "Approved":
      colorClass =
        "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-400";
      break;
    case "Completed":
      colorClass =
        "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 border-purple-400";
      break;
    case "In Progress":
      colorClass =
        "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 border-blue-400";
      break;
    case "Pending":
      colorClass =
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 border-yellow-400";
      break;
    case "To-Do":
    default:
      colorClass =
        "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400 border-gray-400";
      break;
  }
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded border ${colorClass}`}
    >
      {status}
    </span>
  );
};

const TaskPriorityBadge: React.FC<{ priority: TaskPriority }> = ({
  priority,
}) => {
  let colorClass = "";
  switch (priority) {
    case "High":
      colorClass = "bg-red-500/10 text-red-600 border border-red-500/30";
      break;
    case "Medium":
      colorClass =
        "bg-orange-500/10 text-orange-600 border border-orange-500/30";
      break;
    case "Low":
      colorClass = "bg-green-500/10 text-green-600 border border-green-500/30";
      break;
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${colorClass}`}>
      {priority}
    </span>
  );
};

// --- Supervisor Tasks List Component (The actual content) ---

const SupervisorTasksList: React.FC = () => {
  const supervisorTasks = mockTasks;

  // --- Filtering State ---
  const [searchText, setSearchText] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPriority, setSelectedPriority] = React.useState("all");
  const [selectedAssignee, setSelectedAssignee] = React.useState("all");

  // --- Action Handlers (Mocks) ---
  const handleView = (taskId: number) => {
    // In a real app, this would navigate to the task detail page
    console.log(`ACTION: Navigating to view details for Task ID: ${taskId}`);
  };

  const handleEdit = (taskId: number) => {
    // In a real app, this would navigate to the task edit form
    console.log(`ACTION: Navigating to edit form for Task ID: ${taskId}`);
  };

  const handleDelete = (taskId: number, title: string) => {
    // In a real app, this would open a confirmation modal before deleting
    console.log(
      `ACTION: Initiating deletion process for Task: "${title}" (ID: ${taskId})`
    );
  };

  // --- Filter Logic ---
  const filteredTasks = React.useMemo(() => {
    return supervisorTasks.filter((task) => {
      // 1. Search Text Filter (Title, Description, Assignee, Category)
      const matchesSearch =
        searchText.toLowerCase() === "" ||
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchText.toLowerCase()) ||
        task.category.toLowerCase().includes(searchText.toLowerCase());

      // 2. Status Filter
      const matchesStatus =
        selectedStatus === "all" ||
        task.status.toLowerCase().replace(/\s/g, "-") === selectedStatus;

      // 3. Priority Filter
      const matchesPriority =
        selectedPriority === "all" ||
        task.priority.toLowerCase() === selectedPriority.toLowerCase();

      // 4. Assignee Filter
      const matchesAssignee =
        selectedAssignee === "all" || task.assigneeId === selectedAssignee;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesAssignee
      );
    });
  }, [
    searchText,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    supervisorTasks,
  ]);

  // Calculate metrics based on ALL tasks (for dashboard cards)
  const totalTasks = supervisorTasks.length;
  const todoTasks = supervisorTasks.filter((t) => t.status === "To-Do").length;
  const inProgressTasks = supervisorTasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const completedTasks = supervisorTasks.filter(
    (t) => t.status === "Completed"
  ).length;
  const approvedTasks = supervisorTasks.filter(
    (t) => t.status === "Approved"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header and Action Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Manage all tasks you&apos;ve created for your team.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/dashboard/tasks/new">
            <Plus className="h-5 w-5 mr-2" /> Create New Task
          </Link>
        </Button>
      </div>

      {/* 1. Key Metrics Cards (Top Row) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Tasks"
          value={totalTasks}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="All tasks assigned"
        />
        <MetricCard
          title="To-Do"
          value={todoTasks}
          icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
          description={`${todoTasks} tasks pending start`}
        />
        <MetricCard
          title="In Progress"
          value={inProgressTasks}
          icon={<Filter className="h-4 w-4 text-muted-foreground" />}
          description={`${inProgressTasks} tasks currently being worked on`}
          valueColorClass="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          title="Completed"
          value={completedTasks}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          description={`${completedTasks} tasks submitted for review`}
          valueColorClass="text-purple-600 dark:text-purple-400"
        />
        <MetricCard
          title="Approved"
          value={approvedTasks}
          icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
          description={`${approvedTasks} tasks finalized`}
          valueColorClass="text-green-600 dark:text-green-400"
        />
      </div>

      {/* 2 & 3. Merged Search, Filter, and Task Data Table Card */}
      <Card className="shadow-lg">
        {/* Search and Filters Section */}
        <CardContent className="p-4 border-b border-border">
          <CardTitle className="text-base font-semibold mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" /> Search & Filter Tasks
          </CardTitle>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Search by title, description, assignee, or category..."
                className="w-full"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <Select onValueChange={setSelectedStatus} value={selectedStatus}>
              <SelectTrigger className="w-full md:w-[150px] flex-shrink-0">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="to-do">To-Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={setSelectedPriority}
              value={selectedPriority}
            >
              <SelectTrigger className="w-full md:w-[120px] flex-shrink-0">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={setSelectedAssignee}
              value={selectedAssignee}
            >
              <SelectTrigger className="w-full md:w-[150px] flex-shrink-0">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="alice-johnson">Alice Johnson</SelectItem>
                <SelectItem value="frank-thompson">Frank Thompson</SelectItem>
                <SelectItem value="mike-chen">Mike Chen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        {/* Task Data Table Header */}
        <CardHeader className="py-4">
          <CardTitle className="text-lg">
            Displaying Tasks ({filteredTasks.length} of {totalTasks})
          </CardTitle>
        </CardHeader>

        {/* Task Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[250px]">
                  Task Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-foreground">
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="hover:text-primary transition-colors block"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {task.description}
                      </p>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {task.assignee}
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {task.dueDate}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {task.category}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <TaskStatusBadge status={task.status} />
                    </td>

                    {/* Actions Dropdown Menu */}
                    <td className="px-6 py-3 text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleView(task.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(task.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(task.id, task.title)}
                            className="text-red-600 focus:bg-red-500/10 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No tasks found matching your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- Main Role-Gated Page (Tasks Route Entry) ---

type DecodedToken = { role: "ADMIN" | "SUPERVISOR" | "INTERN" };

export default function TasksPage() {
  const token = useAuthStore((state) => state.token);

  if (!token) return null;

  let userRole: DecodedToken["role"] = "INTERN";
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    userRole = decodedToken.role;
  } catch (e) {
    console.error("Failed to decode token:", e);
    return (
      <div className="p-6 text-red-500">Error loading user information.</div>
    );
  }

  // We only implement the SUPERVISOR view here, other roles get a placeholder.
  switch (userRole) {
    case "SUPERVISOR":
      return <SupervisorTasksList />;
    case "INTERN":
      // TODO: Implement InternTasksList component here
      return (
        <div className="p-6">
          Intern Task List (My Tasks View - Coming Soon!)
        </div>
      );
    case "ADMIN":
      return <div className="p-6">Admin System Tasks View (Coming Soon!)</div>;
    default:
      return (
        <div>Access Denied: This task view is not available for your role.</div>
      );
  }
}
