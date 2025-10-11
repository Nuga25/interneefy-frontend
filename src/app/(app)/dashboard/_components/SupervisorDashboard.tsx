"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Assuming you have a progress bar component
import {
  Plus,
  Clock,
  Users,
  CheckCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import React from "react";

// --- Mock Data Structures (Replace with real data fetching) ---
// Note: In a real app, this data would come from API calls filtered by the Supervisor's ID.
type InternProgress = {
  id: number;
  name: string;
  domain: string;
  completed: number;
  inProgress: number;
  pending: number;
  totalTasks: number;
  lastActivityDaysAgo: number;
};

type PendingReview = {
  id: number;
  title: string;
  priority: "High" | "Medium" | "Low";
  completedBy: string;
  daysAgo: number;
};

const mockInternsProgress: InternProgress[] = [
  {
    id: 1,
    name: "Alice Johnson",
    domain: "Software Engineering",
    completed: 5,
    inProgress: 2,
    pending: 1,
    totalTasks: 8,
    lastActivityDaysAgo: 3,
  },
  {
    id: 2,
    name: "Frank Thompson",
    domain: "Software Engineering",
    completed: 3,
    inProgress: 1,
    pending: 1,
    totalTasks: 5,
    lastActivityDaysAgo: 5,
  },
  {
    id: 3,
    name: "Mike Chen",
    domain: "Product Design",
    completed: 6,
    inProgress: 0,
    pending: 0,
    totalTasks: 6,
    lastActivityDaysAgo: 1,
  },
];

const mockPendingReviews: PendingReview[] = [
  {
    id: 101,
    title: "React Component Development",
    priority: "High",
    completedBy: "Alice Johnson",
    daysAgo: 2,
  },
  {
    id: 102,
    title: "Database Design Documentation",
    priority: "Medium",
    completedBy: "Frank Thompson",
    daysAgo: 5,
  },
  {
    id: 103,
    title: "Data Analysis Report",
    priority: "Medium",
    completedBy: "Mike Chen",
    daysAgo: 1,
  },
];

const getTotalCompletionRate = (interns: InternProgress[]) => {
  const totalCompleted = interns.reduce((sum, i) => sum + i.completed, 0);
  const totalAssigned = interns.reduce((sum, i) => sum + i.totalTasks, 0);
  if (totalAssigned === 0) return 0;
  return Math.round((totalCompleted / totalAssigned) * 100);
};

// --- Sub-Components for Dashboard Structure ---

const StatusBadge: React.FC<{ priority: PendingReview["priority"] }> = ({
  priority,
}) => {
  let colorClass = "";
  switch (priority) {
    case "High":
      colorClass =
        "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400";
      break;
    case "Medium":
      colorClass =
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400";
      break;
    case "Low":
      colorClass =
        "bg-green-100 text-green-700 dark:bg-green-700/50 dark:text-green-400";
      break;
  }
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}
    >
      {priority} Priority
    </span>
  );
};

const InternProgressOverview: React.FC<{ data: InternProgress }> = ({
  data,
}) => {
  const completionPercentage =
    data.totalTasks > 0
      ? Math.round((data.completed / data.totalTasks) * 100)
      : 0;
  return (
    <div className="border-b dark:border-gray-800 pb-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.domain}</p>
        </div>
        <div className="flex items-center text-primary font-bold">
          {completionPercentage}% <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>

      <Progress value={completionPercentage} className="h-2 my-2" />

      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <p>
          <span className="font-semibold text-green-600">{data.completed}</span>{" "}
          Completed
        </p>
        <p>
          <span className="font-semibold text-yellow-600">
            {data.inProgress}
          </span>{" "}
          In Progress
        </p>
        <p>
          <span className="font-semibold text-red-600">{data.pending}</span>{" "}
          Pending
        </p>
      </div>
      <p className="text-xs text-right mt-1 text-gray-500">
        Last activity: {data.lastActivityDaysAgo} days ago
      </p>
    </div>
  );
};

const PendingReviewItem: React.FC<{ review: PendingReview }> = ({ review }) => {
  return (
    <div className="p-4 border-b dark:border-gray-800 last:border-b-0">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-foreground">{review.title}</h3>
        <StatusBadge priority={review.priority} />
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Completed by {review.completedBy}
      </p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">
          <Clock className="inline h-3 w-3 mr-1" /> Submitted {review.daysAgo}{" "}
          days ago
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/tasks/review/${review.id}`}>Review Task</Link>
        </Button>
      </div>
    </div>
  );
};

// --- Main Supervisor Dashboard Component ---

export default function SupervisorDashboard() {
  const totalCompletionRate = getTotalCompletionRate(mockInternsProgress);
  const totalTasksAssigned = mockInternsProgress.reduce(
    (sum, i) => sum + i.totalTasks,
    0
  );
  const totalTasksCompleted = mockInternsProgress.reduce(
    (sum, i) => sum + i.completed,
    0
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header and Action Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Supervisor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, Mike Chen. Here&apos;s what needs your attention
            today.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/dashboard/tasks/new">
            <Plus className="h-5 w-5 mr-2" /> Create New Task
          </Link>
        </Button>
      </div>

      {/* 1. Key Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Interns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockInternsProgress.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently supervising
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/dashboard/interns"
              className="text-sm text-primary flex items-center"
            >
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {mockPendingReviews.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks awaiting your approval
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/dashboard/tasks?status=pending"
              className="text-sm text-primary flex items-center"
            >
              Review now <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Assigned
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasksAssigned}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTasksCompleted} completed,{" "}
              {totalTasksAssigned - totalTasksCompleted} remaining
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/dashboard/tasks"
              className="text-sm text-primary flex items-center"
            >
              Manage tasks <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletionRate}%</div>
            <Progress value={totalCompletionRate} className="h-2 my-1" />
            <p className="text-xs text-muted-foreground mt-1">
              Average task completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Content Area (Interns Overview & Pending Reviews) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        {/* Left Side: Interns Overview */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>My Interns Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Progress and status of your assigned interns.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockInternsProgress.map((intern) => (
              <InternProgressOverview key={intern.id} data={intern} />
            ))}
          </CardContent>
        </Card>

        {/* Right Side: Pending Reviews */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tasks completed by interns awaiting your approval.
            </p>
          </CardHeader>
          <CardContent className="divide-y divide-border px-0">
            {mockPendingReviews.map((review) => (
              <PendingReviewItem key={review.id} review={review} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
