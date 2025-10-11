import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Mail, Pencil, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// --- 1. Define the Intern Data Structure ---
export type Intern = {
  id: number;
  fullName: string;
  email: string;
  domain: string; // New
  assignedSupervisor: string; // New
  startDate: string; // New (e.g., "1/15/2024")
  endDate: string; // New (e.g., "4/15/2024")
  status: "Active" | "Completed" | "Upcoming"; // New
};

// --- 2. Define the Columns Array ---
export const internColumns: ColumnDef<Intern>[] = [
  // Full Name Column
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Full Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("fullName")}</span>
    ),
  },

  // Email Column
  {
    accessorKey: "email",
    header: "Email",
  },

  // Domain Column (New)
  {
    accessorKey: "domain",
    header: "Domain",
  },

  // Assigned Supervisor Column (New)
  {
    accessorKey: "assignedSupervisor",
    header: "Assigned Supervisor",
  },

  // Start Date Column (New)
  {
    accessorKey: "startDate",
    header: "Start Date",
  },

  // End Date Column (New)
  {
    accessorKey: "endDate",
    header: "End Date",
  },

  // Status Column (New & Styled)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Intern["status"];
      let variant: "default" | "secondary" | "outline" | "destructive" =
        "outline";

      if (status === "Active") variant = "default";
      else if (status === "Completed") variant = "secondary";
      else if (status === "Upcoming") variant = "outline";

      return (
        <Badge
          variant={variant}
          className={`min-w-[80px] justify-center ${
            status === "Active"
              ? "bg-green-500/10 text-green-700 hover:bg-green-500/20"
              : ""
          }`}
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const status = row.getValue(id) as string;
      if (value === "All Status" || !value) return true;
      return status === value;
    },
  },

  // Actions Column
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const intern = row.original;

      const handleViewUser = () =>
        alert(`Viewing details for intern: ${intern.fullName}`);
      const handleEditUser = () =>
        alert(`Editing details for intern: ${intern.fullName}`);
      const handleMessageUser = () =>
        (window.location.href = `mailto:${intern.email}`);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {/* View */}
            <DropdownMenuItem onClick={handleViewUser}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            {/* Edit */}
            <DropdownMenuItem onClick={handleEditUser}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Intern
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Message */}
            <DropdownMenuItem onClick={handleMessageUser}>
              <Mail className="mr-2 h-4 w-4" />
              Message Intern
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
