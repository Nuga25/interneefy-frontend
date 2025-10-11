"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  Eye,
  Clock,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Progress } from "@/components/ui/progress"; // Assuming you have a progress bar component

// --- Mock Data Structures ---

type InternStatus = "Active" | "On Leave" | "Completed";
type TaskStatus = "Completed" | "In Progress" | "Pending" | "Overdue";

type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  dueDate: string;
  tags: string[];
};

type Intern = {
  id: number;
  name: string;
  email: string;
  status: InternStatus;
  domain: string;
  university: string;
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  lastActivity: string;
  recentTasks: Task[];
};

// Simulated data filtered for the current supervisor
const mockInterns: Intern[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@company.com",
    status: "Active",
    domain: "Software Engineering",
    university: "Stanford University",
    progressPercentage: 62.5,
    totalTasks: 8,
    completedTasks: 5,
    inProgressTasks: 2,
    pendingTasks: 1,
    lastActivity: "57d ago",
    recentTasks: [
      {
        id: 101,
        title: "React Component Development",
        status: "Completed",
        dueDate: "3/15/2024",
        tags: ["React", "TypeScript"],
      },
      {
        id: 102,
        title: "API Integration",
        status: "In Progress",
        dueDate: "3/22/2024",
        tags: ["Node.js", "Express"],
      },
      {
        id: 103,
        title: "Unit Testing",
        status: "Pending",
        dueDate: "3/28/2024",
        tags: ["Jest"],
      },
    ],
  },
  {
    id: 2,
    name: "Frank Thompson",
    email: "frank@company.com",
    status: "Active",
    domain: "Product Design",
    university: "Carnegie Mellon",
    progressPercentage: 50,
    totalTasks: 10,
    completedTasks: 5,
    inProgressTasks: 3,
    pendingTasks: 2,
    lastActivity: "2d ago",
    recentTasks: [
      {
        id: 201,
        title: "UX Flowchart Draft",
        status: "Completed",
        dueDate: "4/01/2024",
        tags: ["Figma"],
      },
      {
        id: 202,
        title: "User Interview Script",
        status: "In Progress",
        dueDate: "4/15/2024",
        tags: ["Research"],
      },
      {
        id: 203,
        title: "Prototype Review",
        status: "Pending",
        dueDate: "4/20/2024",
        tags: ["Figma"],
      },
    ],
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike@company.com",
    status: "On Leave",
    domain: "Data Science",
    university: "MIT",
    progressPercentage: 100,
    totalTasks: 5,
    completedTasks: 5,
    inProgressTasks: 0,
    pendingTasks: 0,
    lastActivity: "120d ago",
    recentTasks: [
      {
        id: 301,
        title: "Model Training Report",
        status: "Completed",
        dueDate: "1/10/2024",
        tags: ["Python", "Pandas"],
      },
    ],
  },
];

// --- Utility Components ---

const TaskStatusTag: React.FC<{ status: TaskStatus }> = ({ status }) => {
  let colorClass = "";
  switch (status) {
    case "Completed":
      colorClass = "bg-green-500/10 text-green-600 border border-green-500/30";
      break;
    case "In Progress":
      colorClass = "bg-blue-500/10 text-blue-600 border border-blue-500/30";
      break;
    case "Pending":
      colorClass =
        "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30";
      break;
    case "Overdue":
      colorClass = "bg-red-500/10 text-red-600 border border-red-500/30";
      break;
  }
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}
    >
      {status}
    </span>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  description: string;
  valueColorClass?: string;
}> = ({ title, value, description, valueColorClass = "text-foreground" }) => (
  <Card className="flex-1 min-w-[200px] shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Users className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${valueColorClass}`}>{value}</div>
      <p className="text-xs text-muted-foreground pt-1">{description}</p>
    </CardContent>
  </Card>
);

// --- Main Page Component ---

export default function SupervisorMyInternsPage() {
  // NOTE: This entire component serves as the SupervisorMyInternsList content
  const totalInterns = mockInterns.length;
  const totalTasks = mockInterns.reduce((sum, i) => sum + i.totalTasks, 0);
  const completedTasks = mockInterns.reduce(
    (sum, i) => sum + i.completedTasks,
    0
  );
  const averageProgress = (
    mockInterns.reduce((sum, i) => sum + i.progressPercentage, 0) / totalInterns
  ).toFixed(0);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredInterns = mockInterns.filter(
    (intern) =>
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Interns</h1>
        <p className="text-muted-foreground">
          Manage and monitor your assigned interns&apos; progress and
          performance.
        </p>
      </div>

      {/* 1. Key Metrics Cards (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Interns"
          value={totalInterns}
          description="Currently supervising"
        />
        <MetricCard
          title="Total Tasks"
          value={totalTasks}
          description={`${completedTasks} completed, ${
            totalTasks - completedTasks
          } in progress/pending`}
        />
        <MetricCard
          title="Completed Tasks"
          value={completedTasks}
          description="Total completed across all interns"
          valueColorClass="text-green-600 dark:text-green-400"
        />
        <MetricCard
          title="Average Progress"
          value={`${averageProgress}%`}
          description="Average completion rate of all tasks"
          valueColorClass="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* 2. Search Bar */}
      <Card className="p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or university..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* 3. Intern Cards (The main list) */}
      <div className="space-y-6">
        {filteredInterns.map((intern) => (
          <Card
            key={intern.id}
            className="p-6 border-l-4 border-primary/70 shadow-lg"
          >
            {/* Intern Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {intern.name}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      intern.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {intern.status}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {intern.email} | {intern.university}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" /> Contact
                </Button>
                <Button variant="default" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> View Details
                </Button>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm font-semibold mb-1">
                <span>Overall Progress</span>
                <span>{intern.progressPercentage}%</span>
              </div>
              <Progress
                value={intern.progressPercentage}
                className="h-2 mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <div className="text-center">
                  <p className="font-bold text-base text-foreground">
                    {intern.totalTasks}
                  </p>
                  <p>Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base text-green-600">
                    {intern.completedTasks}
                  </p>
                  <p>Completed</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base text-blue-600">
                    {intern.inProgressTasks}
                  </p>
                  <p>In Progress</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base text-yellow-600">
                    {intern.pendingTasks}
                  </p>
                  <p>Pending</p>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <CardDescription className="font-semibold mb-2 pt-2 border-t">
              Recent Tasks
            </CardDescription>
            <div className="space-y-2">
              {intern.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium hover:text-primary transition-colors cursor-pointer">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <TaskStatusTag status={task.status} />
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> Due {task.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Last active {intern.lastActivity}
              </span>
              <div className="flex gap-2">
                {intern.recentTasks
                  .flatMap((task) => task.tags)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .slice(0, 3)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                {intern.recentTasks
                  .flatMap((task) => task.tags)
                  .filter((v, i, a) => a.indexOf(v) === i).length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    +
                    {intern.recentTasks
                      .flatMap((task) => task.tags)
                      .filter((v, i, a) => a.indexOf(v) === i).length - 3}{" "}
                    more
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredInterns.length === 0 && (
        <div className="text-center p-10 text-muted-foreground border-2 border-dashed rounded-lg">
          No interns found matching your search criteria.
        </div>
      )}
    </div>
  );
}
