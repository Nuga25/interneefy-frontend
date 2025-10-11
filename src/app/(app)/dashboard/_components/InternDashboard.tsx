"use client";

import { jwtDecode } from "jwt-decode";
// Assuming useAuthStore and other imports exist in the environment
// import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ListChecks,
  User,
  Plus,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  Clock,
  RefreshCw,
  Calendar,
  Zap,
  Hourglass,
} from "lucide-react";
import React from "react";

// Mock Data Structures
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

// Mock data
const mockTasks: Task[] = [
  {
    id: 201,
    title: "Design the new homepage mockup",
    description:
      "Create wireframes and high-fidelity mockups for the new company homepage redesign. Focus on mobile-first responsiveness and accessibility standards (WCAG 2.1). Use the company's new branding guidelines.",
    assignee: "Sarah Johnson",
    assigneeId: "alice-johnson",
    dueDate: "3/22/2026",
    priority: "High",
    category: "Design",
    status: "To-Do",
    estimatedHours: 8,
    actualHours: 0,
  },
  {
    id: 204,
    title: "Database Schema Analysis",
    description:
      "Analyze the current database structure and suggest optimization improvements. Specifically, look into indexing for the 'user_sessions' table to reduce query latency by 15%. Document findings in a markdown file.",
    assignee: "Mike Chen",
    assigneeId: "alice-johnson",
    dueDate: "3/28/2026",
    priority: "High",
    category: "Development",
    status: "In Progress",
    estimatedHours: 12,
    actualHours: 5,
  },
  {
    id: 205,
    title: "Team Meeting Presentation",
    description:
      "Prepare a presentation covering weekly progress and next steps for the team meeting. Ensure the presentation is concise (max 5 slides) and highlights key achievements and blockers. Target audience is executive leadership.",
    assignee: "Sarah Johnson",
    assigneeId: "alice-johnson",
    dueDate: "4/01/2026",
    priority: "Low",
    category: "Management",
    status: "Completed",
    estimatedHours: 2,
    actualHours: 2,
  },
];

// Mock Intern Profile Data
const mockInternProfile = {
  userId: "alice-johnson",
  name: "Bade",
  supervisor: "Sarah Johnson",
  supervisorRole: "Lead Designer - Software Engineering",
  supervisorEmail: "sarah.johnson@techcorp.com",
  progress: {
    totalTasks: 5,
    completedTasks: 1,
    completionPercentage: 20,
  },
  recentFeedback: {
    text: "Excellent problem-solving skills and shows great initiative in tackling complex challenges. Keep up the outstanding work!",
    author: "Sarah Johnson",
  },
};

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

const getStatusColorClass = (
  status: TaskStatus,
  type: "band" | "text" = "band"
) => {
  switch (status) {
    case "Approved":
    case "Completed":
      return type === "band"
        ? "border-purple-500"
        : "text-purple-500 bg-purple-100";
    case "In Progress":
      return type === "band" ? "border-blue-500" : "text-blue-500 bg-blue-100";
    case "Pending":
    case "To-Do":
    default:
      return type === "band" ? "border-gray-500" : "text-gray-500 bg-gray-100";
  }
};

const TaskStatusBadge: React.FC<{ status: TaskStatus; className?: string }> = ({
  status,
  className = "",
}) => {
  let colorClass = "";
  switch (status) {
    case "Approved":
      colorClass = "bg-green-600 text-white";
      break;
    case "Completed":
      colorClass = "bg-purple-500 text-white";
      break;
    case "In Progress":
      colorClass = "bg-blue-500 text-white";
      break;
    case "Pending":
      colorClass = "bg-yellow-500 text-white";
      break;
    case "To-Do":
    default:
      colorClass = "bg-gray-500 text-white";
      break;
  }
  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded ${colorClass} ${className}`}
    >
      {status}
    </span>
  );
};

// Helper for formatted task details
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

// --- TASK DETAIL VIEW ---

const TaskDetailView: React.FC<{
  task: Task;
  onBack: () => void;
  handleStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}> = ({ task, onBack, handleStatusChange }) => {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-3 space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-sm text-primary -ml-3"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="p-6 border-b">
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-bold max-w-[80%]">
              {task.title}
            </CardTitle>
            <TaskStatusBadge
              status={task.status}
              className="text-sm px-4 py-1.5"
            />
          </div>
          <CardDescription className="pt-2 text-base">
            {task.category} Task
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b pb-6">
            <DetailItem
              icon={<User />}
              label="Assigned By"
              value={task.assignee}
              valueClass="font-semibold"
            />
            <DetailItem
              icon={<Calendar />}
              label="Due Date"
              value={task.dueDate}
            />
            <DetailItem
              icon={<Zap />}
              label="Priority"
              value={task.priority}
              valueClass={`font-bold ${getPriorityColor(task.priority)}`}
            />
            <DetailItem
              icon={<Hourglass />}
              label="Time Estimate"
              value={<>{task.estimatedHours} hrs</>}
            />
            <DetailItem
              icon={<Clock />}
              label="Time Logged"
              value={<>{task.actualHours} hrs</>}
              valueClass="text-purple-600 font-bold"
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {task.description}
            </p>
          </div>

          {/* Status Update */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            <span className="text-lg font-semibold text-muted-foreground">
              Update Status:
            </span>
            <Select
              onValueChange={(value: TaskStatus) =>
                handleStatusChange(task.id, value)
              }
              defaultValue={task.status}
            >
              <SelectTrigger className="w-full max-w-[250px] h-10 text-base">
                <SelectValue placeholder="Select New Status" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                <SelectItem value="To-Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved (Final)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Placeholder for Comments/Activity */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center text-muted-foreground">
              <MessageSquare className="w-5 h-5 mr-2" />
              <span className="font-medium">
                Activity and Comments (Not Implemented)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- INTERN DASHBOARD ---

const InternDashboard: React.FC<{
  internId: AssigneeId;
  setSelectedTaskId: (id: number | null) => void;
}> = ({ internId, setSelectedTaskId }) => {
  const [tasks, setTasks] = React.useState(
    mockTasks.filter((t) => t.assigneeId === internId)
  );
  const profile = mockInternProfile;

  const getDaysRemainingText = (dueDate: string): string => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return `Due Today`;
    return `Due in ${diffDays} days`;
  };

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      console.log(`TASK ${taskId}: Status changed to ${newStatus}`);
      // In a real app, this would trigger an API call to Firestore/Backend
      return updatedTasks;
    });
  };

  const TaskCardItem: React.FC<{ task: Task }> = ({ task }) => {
    const bandColor = getStatusColorClass(task.status, "band");

    return (
      <Card
        className={`shadow-md transition-shadow border-l-4 ${bandColor} relative overflow-hidden`}
      >
        <CardContent className="p-5 space-y-3">
          {/* Top right status badge - Matching Screenshot */}
          <div className="absolute top-5 right-5">
            <TaskStatusBadge status={task.status} className="h-5 px-3" />
          </div>

          {/* Task Title now triggers detail view */}
          <button
            onClick={() => setSelectedTaskId(task.id)}
            className="block text-left hover:text-primary transition-colors pr-24 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded"
          >
            <h3 className="text-xl font-bold">{task.title}</h3>
          </button>

          {/* Assigned By / Due Date line - Matching Screenshot */}
          <p className="text-sm font-medium text-muted-foreground pb-2 border-b">
            Assigned by:{" "}
            <span className="font-semibold text-foreground">
              {task.assignee}
            </span>{" "}
            • {getDaysRemainingText(task.dueDate)}
          </p>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          {/* Status update section - Matching Screenshot */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-sm text-muted-foreground mr-4">Status:</span>

            {/* Status Dropdown matching the screenshot style */}
            <Select
              onValueChange={(value: TaskStatus) =>
                handleStatusChange(task.id, value)
              }
              defaultValue={task.status}
            >
              <SelectTrigger className="w-full max-w-[200px] h-9 text-sm">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                <SelectItem value="To-Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved (Final)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {profile.name}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Here&apos;s what&apos;s on your plate for today.
          </p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>{profile.name.charAt(0)}T</p>
        </div>
      </header>

      <main className="p-3 space-y-6">
        {/* Task List Section */}
        <div className="lg:col-span-2 space-y-6">
          <CardHeader className="p-0">
            <CardDescription className="text-lg font-medium">
              Your Assigned Tasks ({tasks.length})
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskCardItem key={task.id} task={task} />)
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                All clear! You currently have no active tasks assigned.
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar/Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-6">
          {/* My Supervisor Card */}
          <Card className="shadow-md max-h-60">
            <CardHeader className="p-4 pb-3 border-b">
              <CardTitle className="text-lg">My Supervisor</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="text-lg font-semibold">{profile.supervisor}</div>
              <div className="text-sm text-muted-foreground">
                {profile.supervisorRole}
              </div>
              <div className="text-sm text-blue-500">
                {profile.supervisorEmail}
              </div>
            </CardContent>
          </Card>

          {/* My Progress Card */}
          <Card className="shadow-md max-h-60">
            <CardHeader className="p-4 pb-3 border-b">
              <CardTitle className="text-lg">My Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Task Completion</span>
                  <span>{profile.progress.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${profile.progress.completionPercentage}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile.progress.completedTasks} of{" "}
                  {profile.progress.totalTasks} tasks completed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// --- SUPERVISOR TASK LIST (Placeholder) ---

const SupervisorTasksList: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Supervisor Task Management (List View)
      </h1>
      <p className="text-muted-foreground">
        This view would contain the detailed management table for supervisors.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Tasks"
          value={18}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="All tasks assigned"
        />
        <MetricCard
          title="To-Do"
          value={5}
          icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
          description="Tasks pending start"
        />
        <MetricCard
          title="In Progress"
          value={7}
          icon={<ListChecks className="h-4 w-4 text-muted-foreground" />}
          description="Tasks currently being worked on"
          valueColorClass="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          title="Completed"
          value={4}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          description="Tasks submitted for review"
          valueColorClass="text-purple-600 dark:text-purple-400"
        />
      </div>
      <Button size="lg" className="mt-4">
        <Plus className="h-5 w-5 mr-2" /> Create New Task
      </Button>
    </div>
  );
};

// --- Main Role-Gated Page (Tasks Route Entry) ---

type DecodedToken = { role: "ADMIN" | "SUPERVISOR" | "INTERN" };

export default function TasksPage() {
  // State to manage the currently viewed task ID (for routing simulation)
  const [selectedTaskId, setSelectedTaskId] = React.useState<number | null>(
    null
  );

  // Mock auth logic (replace with actual hook if available)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("mockToken") : null;
  let mockUserId: AssigneeId = "alice-johnson";
  let userRole: DecodedToken["role"] = "INTERN";

  // Simulate token decoding to set role
  if (token) {
    try {
      // Note: jwtDecode is a mock and won't actually work without implementation
      // const decodedToken = jwtDecode<DecodedToken>(token);
      // userRole = decodedToken.role;
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }
  // Hard set role for demo purposes:
  userRole = "INTERN";

  // Assign mock user ID based on assumed mock data assignment
  if (userRole === "INTERN") mockUserId = "alice-johnson";

  // Find the currently selected task object
  const selectedTask = selectedTaskId
    ? mockTasks.find((t) => t.id === selectedTaskId)
    : null;

  // Logic to handle status change when in detail view
  const handleDetailStatusChange = (taskId: number, newStatus: TaskStatus) => {
    // Find and update the task status in the mock data
    const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      mockTasks[taskIndex].status = newStatus;
    }
    // In a real app, this would refresh state/fetch data.
    // For this demo, we rely on the parent component re-rendering based on this change.
    console.log(
      `TASK ${taskId}: Status changed to ${newStatus} from Detail View`
    );
    setSelectedTaskId(null); // Optional: go back to dashboard after status change
  };

  if (userRole === "INTERN" && selectedTask) {
    return (
      <TaskDetailView
        task={selectedTask}
        onBack={() => setSelectedTaskId(null)}
        handleStatusChange={handleDetailStatusChange}
      />
    );
  }

  switch (userRole) {
    case "INTERN":
      // Renders the main dashboard view
      return (
        <InternDashboard
          internId={mockUserId}
          setSelectedTaskId={setSelectedTaskId}
        />
      );
    default:
      return <div>Access Denied: Please log in.</div>;
  }
}
