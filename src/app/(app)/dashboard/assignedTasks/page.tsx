// app/(app)/dashboard/assignedTasks/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  description: string;
  internId: number;
  internName: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
  createdAt: string;
};

type Intern = {
  id: number;
  fullName: string;
};

const AssignedTasksPage = () => {
  const token = useAuthStore((state) => state.token);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [internFilter, setInternFilter] = useState<string>("all");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    internId: "",
    status: "TODO" as Task["status"],
    priority: "MEDIUM" as Task["priority"],
    dueDate: "",
  });

  // Mock data - replace with API call
  useEffect(() => {
    if (token) {
      const mockInterns: Intern[] = [
        { id: 1, fullName: "John Doe" },
        { id: 2, fullName: "Jane Smith" },
        { id: 3, fullName: "Mike Johnson" },
        { id: 4, fullName: "Sarah Williams" },
      ];

      const mockTasks: Task[] = [
        {
          id: 1,
          title: "API Integration",
          description: "Integrate REST API endpoints with frontend",
          internId: 1,
          internName: "John Doe",
          status: "COMPLETED",
          priority: "HIGH",
          dueDate: "2025-10-15",
          createdAt: "2025-10-01",
        },
        {
          id: 2,
          title: "Design Wireframes",
          description: "Create wireframes for user dashboard",
          internId: 2,
          internName: "Jane Smith",
          status: "IN_PROGRESS",
          priority: "MEDIUM",
          dueDate: "2025-10-20",
          createdAt: "2025-10-05",
        },
        {
          id: 3,
          title: "Data Analysis Report",
          description: "Analyze Q3 sales data and create report",
          internId: 3,
          internName: "Mike Johnson",
          status: "REVIEW",
          priority: "HIGH",
          dueDate: "2025-10-18",
          createdAt: "2025-10-03",
        },
        {
          id: 4,
          title: "Unit Testing",
          description: "Write unit tests for authentication module",
          internId: 1,
          internName: "John Doe",
          status: "TODO",
          priority: "MEDIUM",
          dueDate: "2025-10-25",
          createdAt: "2025-10-10",
        },
        {
          id: 5,
          title: "Database Optimization",
          description: "Optimize database queries for better performance",
          internId: 4,
          internName: "Sarah Williams",
          status: "IN_PROGRESS",
          priority: "LOW",
          dueDate: "2025-10-30",
          createdAt: "2025-10-08",
        },
      ];

      setInterns(mockInterns);
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
    }
  }, [token]);

  // Filter tasks
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.internName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (internFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.internId.toString() === internFilter
      );
    }

    setFilteredTasks(filtered);
  }, [searchTerm, statusFilter, priorityFilter, internFilter, tasks]);

  const handleCreateTask = () => {
    // API call would go here
    const newTask: Task = {
      id: tasks.length + 1,
      title: formData.title,
      description: formData.description,
      internId: parseInt(formData.internId),
      internName:
        interns.find((i) => i.id === parseInt(formData.internId))?.fullName ||
        "",
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTasks([...tasks, newTask]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditTask = () => {
    if (!editingTask) return;

    // API call would go here
    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id
        ? {
            ...task,
            title: formData.title,
            description: formData.description,
            internId: parseInt(formData.internId),
            internName:
              interns.find((i) => i.id === parseInt(formData.internId))
                ?.fullName || "",
            status: formData.status,
            priority: formData.priority,
            dueDate: formData.dueDate,
          }
        : task
    );

    setTasks(updatedTasks);
    setIsEditDialogOpen(false);
    setEditingTask(null);
    resetForm();
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      // API call would go here
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      internId: task.internId.toString(),
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      internId: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
    });
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "REVIEW":
        return "bg-yellow-100 text-yellow-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "LOW":
        return "text-green-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "HIGH":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    review: tasks.filter((t) => t.status === "REVIEW").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
  };

  return (
    <div>
      <header className="shadow-sm p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assigned Tasks</h1>
            <p className="text-muted-foreground">
              Manage tasks assigned to your interns
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Assign a new task to one of your interns
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the task in detail"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="intern">Assign to Intern</Label>
                    <Select
                      value={formData.internId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, internId: value })
                      }
                    >
                      <SelectTrigger id="intern">
                        <SelectValue placeholder="Select intern" />
                      </SelectTrigger>
                      <SelectContent>
                        {interns.map((intern) => (
                          <SelectItem
                            key={intern.id}
                            value={intern.id.toString()}
                          >
                            {intern.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as Task["status"],
                        })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          priority: value as Task["priority"],
                        })
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={!formData.title || !formData.internId}
                >
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-4">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks or interns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={internFilter} onValueChange={setInternFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Intern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interns</SelectItem>
                  {interns.map((intern) => (
                    <SelectItem key={intern.id} value={intern.id.toString()}>
                      {intern.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                To Do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.todo}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.review}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No tasks found matching your filters.
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{task.internName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle
                            className={`h-4 w-4 ${getPriorityColor(
                              task.priority
                            )}`}
                          />
                          <span className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(task)}
                        className="flex-1 md:flex-none"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-1 md:flex-none text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-intern">Assign to Intern</Label>
                <Select
                  value={formData.internId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, internId: value })
                  }
                >
                  <SelectTrigger id="edit-intern">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {interns.map((intern) => (
                      <SelectItem key={intern.id} value={intern.id.toString()}>
                        {intern.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as Task["status"],
                    })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value as Task["priority"],
                    })
                  }
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignedTasksPage;
