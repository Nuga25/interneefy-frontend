"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ColumnFiltersState } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Users,
  UserCheck,
  BarChart2,
  Briefcase,
} from "lucide-react"; // Icons
import { DataTable } from "../_components/user-table/data-table";
import {
  supervisorColumns,
  Supervisor,
} from "../_components/user-table/supervisorsColumn";

// Mock Data matching the screenshot
const mockSupervisors: Supervisor[] = [
  {
    id: 101,
    fullName: "Mike Chen",
    email: "mike.chen@company.com",
    assignedDomain: "Software Engineering",
    department: "Engineering",
    experience: "5 years",
    joinDate: "8/15/2023",
    assignedInterns: {
      count: 3,
      list: "Alice Johnson, Frank Thompson, John Doe",
    },
  },
  {
    id: 102,
    fullName: "Sarah Davis",
    email: "sarah.davis@company.com",
    assignedDomain: "Marketing",
    department: "Marketing",
    experience: "7 years",
    joinDate: "9/1/2023",
    assignedInterns: { count: 1, list: "Bob Wilson" },
  },
  {
    id: 103,
    fullName: "John Smith",
    email: "john.smith@company.com",
    assignedDomain: "Product Design",
    department: "Design",
    experience: "8 years",
    joinDate: "7/20/2023",
    assignedInterns: { count: 1, list: "Carol Brown" },
  },
  {
    id: 104,
    fullName: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    assignedDomain: "Business Analysis",
    department: "Business",
    experience: "6 years",
    joinDate: "10/10/2023",
    assignedInterns: { count: 1, list: "Emma Pierce" },
  },
  {
    id: 105,
    fullName: "David Kim",
    email: "david.kim@company.com",
    assignedDomain: "Finance",
    department: "Finance",
    experience: "10 years",
    joinDate: "1/5/2023",
    assignedInterns: { count: 0, list: "None" },
  },
  {
    id: 106,
    fullName: "Maria Garcia",
    email: "maria.garcia@company.com",
    assignedDomain: "HR",
    department: "HR",
    experience: "4 years",
    joinDate: "11/20/2023",
    assignedInterns: { count: 0, list: "None" },
  },
];

const SupervisorsPage = () => {
  const token = useAuthStore((state) => state.token);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(mockSupervisors);
  const [isLoading, setIsLoading] = useState(false); // State for filtering the table data

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // State for managing modals (View/Edit)

  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null); // --- STATS CALCULATION ---

  const totalSupervisors = supervisors.length; // Supervisors with at least one assigned intern
  const activeSupervisors = supervisors.filter(
    (s) => s.assignedInterns.count > 0
  ).length; // Supervisors with zero assigned interns
  const availableSupervisors = supervisors.filter(
    (s) => s.assignedInterns.count === 0
  ).length;
  const totalInternsSupervised = supervisors.reduce(
    (sum, s) => sum + s.assignedInterns.count,
    0
  ); // --- HANDLERS FOR ACTIONS --- // These handlers will be passed to the DataTable's meta object

  const handleViewSupervisor = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor); // TODO: Implement a View Details Modal here
    console.log(`Viewing Supervisor: ${supervisor.fullName}`);
  };

  const handleEditSupervisor = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor); // TODO: Implement an Edit Form Modal here
    console.log(`Editing Supervisor: ${supervisor.fullName}`);
  };

  const fetchSupervisors = async () => {
    // NOTE: Add your real API data fetching logic here
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  useEffect(() => {
    fetchSupervisors();
  }, [token]); // General Search Filter Handler (filters on 'fullName' column ID)

  const handleGeneralFilterChange = (value: string) => {
    setColumnFilters((prev) => {
      const newFilters = prev.filter((f) => (f as any).id !== "fullName");
      if (value) {
        // Set the filter value for the 'fullName' column
        newFilters.push({ id: "fullName", value });
      }
      return newFilters;
    });
  };

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Supervisors Management</h1>
          <p className="text-muted-foreground">
            Manage supervisor accounts and their domain assignments
          </p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>SJ</p>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-8">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Supervisor
          </Button>
        </div>
        {/* --- 1. Summary Cards --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {" "}
                Total Supervisors
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSupervisors}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Supervisors
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {activeSupervisors}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {availableSupervisors}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Interns Supervised
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInternsSupervised}</div>
            </CardContent>
          </Card>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Supervisors ({totalSupervisors})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* --- 2. Search Bar --- */}
            <div className="flex items-center gap-4 py-4 border-b">
              <Input
                placeholder="Search by name, email, or domain..."
                className="max-w-sm"
                onChange={(e) => handleGeneralFilterChange(e.target.value)}
              />
              {/* Domain Filter can be added here later */}
            </div>
            {/* --- 3. Data Table --- */}
            {isLoading ? (
              <div className="text-center p-12 text-muted-foreground">
                Loading supervisor data...
              </div>
            ) : (
              <DataTable
                columns={supervisorColumns}
                data={supervisors}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                searchColumnId="fullName" // Use fullName for the general search // FIX: Use the 'meta' prop to pass custom handlers, resolving the TS error
                meta={{
                  onViewSupervisor: handleViewSupervisor,
                  onEditSupervisor: handleEditSupervisor,
                }}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SupervisorsPage;
