"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ColumnFiltersState } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Database,
  LayoutGrid,
  Zap,
  TrendingUp,
} from "lucide-react";
import { DataTable } from "../_components/user-table/data-table";
import { domainColumns, Domain } from "../_components/user-table/domainsColumn";

// --- MOCK DATA BASED ON SCREENSHOT ---
const mockDomains: Domain[] = [
  {
    id: 1,
    domainName: "Software Engineering",
    description:
      "Full-stack development, mobile apps, and software architecture",
    supervisors: [
      { id: 101, name: "Mike Chen" },
      { id: 107, name: "Jennifer Wu" },
    ],
    activeInterns: 3,
    totalInterns: 4,
    createdDate: "8/1/2023",
    status: "Active",
  },
  {
    id: 2,
    domainName: "Data Science",
    description: "Machine learning, data analysis, and statistical modeling",
    supervisors: [{ id: 108, name: "Robert Kim" }],
    activeInterns: 1,
    totalInterns: 2,
    createdDate: "8/1/2023",
    status: "Active",
  },
  {
    id: 3,
    domainName: "Product Design",
    description: "UI/UX design, user research, and design systems",
    supervisors: [{ id: 103, name: "John Smith" }],
    activeInterns: 1,
    totalInterns: 1,
    createdDate: "8/1/2023",
    status: "Active",
  },
  {
    id: 4,
    domainName: "Marketing",
    description: "Digital marketing, content creation, and brand management",
    supervisors: [{ id: 102, name: "Sarah Davis" }],
    activeInterns: 1,
    totalInterns: 1,
    createdDate: "8/1/2023",
    status: "Active",
  },
  {
    id: 5,
    domainName: "Finance",
    description: "Financial planning, analysis, and risk management",
    supervisors: [{ id: 105, name: "David Kim" }],
    activeInterns: 0,
    totalInterns: 1,
    createdDate: "9/1/2023",
    status: "Inactive",
  },
];

const DomainsPage = () => {
  const token = useAuthStore((state) => state.token);
  const [domains, setDomains] = useState<Domain[]>(mockDomains);
  const [isLoading, setIsLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // --- STATS CALCULATION ---
  const totalDomains = domains.length;
  const activeDomains = domains.filter((d) => d.status === "Active").length;
  const totalActiveInterns = domains.reduce(
    (sum, d) => sum + d.activeInterns,
    0
  );
  const totalPlacements = domains.reduce((sum, d) => sum + d.totalInterns, 0);

  // --- HANDLERS FOR ACTIONS ---
  const handleViewDomain = (domain: Domain) => {
    console.log(`Viewing Domain: ${domain.domainName}`);
    // TODO: Implement a View Domain Details Modal
    alert(`Viewing Domain: ${domain.domainName}`);
  };

  const handleEditDomain = (domain: Domain) => {
    console.log(`Editing Domain: ${domain.domainName}`);
    // TODO: Implement an Edit Domain Form Modal
    alert(`Editing Domain: ${domain.domainName}`);
  };

  const fetchDomains = async () => {
    // NOTE: Add your real API data fetching logic here
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  useEffect(() => {
    fetchDomains();
  }, [token]);

  // General Search Filter Handler (filters on 'domainName' column ID)
  const handleGeneralFilterChange = (value: string) => {
    setColumnFilters((prev) => {
      const newFilters = prev.filter((f) => (f as any).id !== "domainName");
      if (value) {
        newFilters.push({ id: "domainName", value });
      }
      return newFilters;
    });
  };

  return (
    <div>
      <header className="flex items-center justify-between shadow-sm p-4 bg-white">
        <div>
          <h1 className="text-3xl font-bold">Domains Management</h1>
          <p className="text-muted-foreground">
            Manage internship domains and departments
          </p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-medium">
          <p>SJ</p>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-8">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Domain
          </Button>
        </div>

        {/* --- 1. Summary Cards --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Domains
              </CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalDomains}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Domains
              </CardTitle>
              <LayoutGrid className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {activeDomains}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Interns
              </CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {totalActiveInterns}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Placements
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPlacements}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Domains ({totalDomains})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* --- 2. Search Bar --- */}
            <div className="flex items-center gap-4 py-4 border-b">
              <Input
                placeholder="Search by name, description, or supervisor..."
                className="max-w-sm"
                onChange={(e) => handleGeneralFilterChange(e.target.value)}
              />
            </div>

            {/* --- 3. Data Table --- */}
            {isLoading ? (
              <div className="text-center p-12 text-muted-foreground">
                Loading domain data...
              </div>
            ) : (
              <DataTable
                columns={domainColumns}
                data={domains}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                searchColumnId="domainName" // Use domainName for the general search
                // Pass action handlers via the meta object
                meta={{
                  onViewDomain: handleViewDomain,
                  onEditDomain: handleEditDomain,
                }}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DomainsPage;
