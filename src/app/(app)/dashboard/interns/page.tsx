"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
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
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  CalendarCheck,
} from "lucide-react";
import { ColumnFiltersState } from "@tanstack/react-table"; // Import type for table filters

// *** FIX: Changed the import from 'columns' to 'internColumns' ***
import { DataTable } from "../_components/user-table/data-table";
import { internColumns, Intern } from "../_components/user-table/internsColumn"; // Import internColumns and Intern type

// Mock Data to match the screenshot layout
const mockInterns: Intern[] = [
  {
    id: 1,
    fullName: "Alice Johnson",
    email: "alice@company.com",
    domain: "Software Engineering",
    assignedSupervisor: "Mike Chen",
    startDate: "1/15/2024",
    endDate: "4/15/2024",
    status: "Active",
  },
  {
    id: 2,
    fullName: "Bob Wilson",
    email: "bob@company.com",
    domain: "Marketing",
    assignedSupervisor: "Sarah Davis",
    startDate: "2/1/2024",
    endDate: "5/1/2024",
    status: "Active",
  },
  {
    id: 3,
    fullName: "Carol Brown",
    email: "carol@company.com",
    domain: "Product Design",
    assignedSupervisor: "John Smith",
    startDate: "11/1/2023",
    endDate: "2/1/2024",
    status: "Completed",
  },
  {
    id: 4,
    fullName: "David Lee",
    email: "david@company.com",
    domain: "Data Science",
    assignedSupervisor: "Mike Chen",
    startDate: "3/1/2024",
    endDate: "6/11/2024",
    status: "Active",
  },
  {
    id: 5,
    fullName: "Emily White",
    email: "emily@company.com",
    domain: "Software Engineering",
    assignedSupervisor: "Sarah Davis",
    startDate: "7/1/2024",
    endDate: "10/1/2024",
    status: "Upcoming",
  },
  {
    id: 6,
    fullName: "Frank Green",
    email: "frank@company.com",
    domain: "Marketing",
    assignedSupervisor: "John Smith",
    startDate: "4/1/2024",
    endDate: "7/1/2024",
    status: "Active",
  },
];

const InternsPage = () => {
  const token = useAuthStore((state) => state.token);
  const [interns, setInterns] = useState<Intern[]>(mockInterns);
  const [isLoading, setIsLoading] = useState(false);

  // --- New State for Table Filtering ---
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // --- STATS CALCULATION ---
  const totalInterns = interns.length;
  const activeInterns = interns.filter((i) => i.status === "Active").length;
  const completedInterns = interns.filter(
    (i) => i.status === "Completed"
  ).length;
  const upcomingInterns = interns.filter((i) => i.status === "Upcoming").length;

  // --- DATA FETCHING & DELETION LOGIC (Reused from Dashboard) ---
  const fetchInterns = async () => {
    // NOTE: Replace mockInterns logic here when API is ready
    setIsLoading(true);
    // ... API call to GET users?role=INTERN ...
    setTimeout(() => setIsLoading(false), 500);
  };

  useEffect(() => {
    fetchInterns();
  }, [token]);

  const handleDeleteIntern = async (internId: number) => {
    // Client-side simulation of deletion:
    setInterns((prev) => prev.filter((intern) => intern.id !== internId));
    alert(`Simulated deletion of Intern ID: ${internId}`);
    // ... Add your actual API DELETE call here when ready
  };

  // --- FILTER HANDLERS ---
  const handleGeneralFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // This assumes the DataTable component handles a general search on the 'fullName' column
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== "fullName");
      if (event.target.value) {
        return [...existing, { id: "fullName", value: event.target.value }];
      }
      return existing;
    });
  };

  const handleStatusFilterChange = (value: string) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== "status");
      if (value !== "All Status") {
        return [...existing, { id: "status", value: value }];
      }
      return existing;
    });
  };

  const handleDomainFilterChange = (value: string) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== "domain");
      if (value !== "All Domains") {
        return [...existing, { id: "domain", value: value }];
      }
      return existing;
    });
  };

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Interns Management</h1>
          <p className="text-muted-foreground">
            Manage all intern records and their information
          </p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>SJ</p>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-8">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Intern
          </Button>
        </div>

        {/* --- 1. Summary Cards --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Interns
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInterns}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CalendarCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {activeInterns}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedInterns}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {upcomingInterns}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Interns ({totalInterns})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* --- 2. Search & Filter Bar --- */}
            <div className="flex items-center gap-4 py-4 border-b">
              <Input
                placeholder="Search by name..."
                className="max-w-sm"
                onChange={handleGeneralFilterChange} // Added handler
              />

              <Select
                defaultValue="All Status"
                onValueChange={handleStatusFilterChange} // Added handler
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>

              <Select
                defaultValue="All Domains"
                onValueChange={handleDomainFilterChange} // Added handler
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Domains">All Domains</SelectItem>
                  <SelectItem value="Software Engineering">
                    Software Engineering
                  </SelectItem>
                  <SelectItem value="Product Design">Product Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* --- 3. Data Table --- */}
            {isLoading ? (
              <div className="text-center p-12 text-muted-foreground">
                Loading intern data...
              </div>
            ) : (
              <DataTable
                columns={internColumns}
                data={interns}
                onDeleteUser={handleDeleteIntern}
                // --- PASS FILTER STATE TO DATATABLE ---
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                // The primary filter column for the search bar should be 'fullName'
                searchColumnId="fullName"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InternsPage;
