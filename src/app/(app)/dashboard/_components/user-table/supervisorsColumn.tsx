import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Mail, Eye, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// --- 1. Define the Supervisor Data Structure ---
export type Supervisor = {
  id: number;
  fullName: string;
  email: string;
  assignedDomain: string;
  department: string;
  experience: string; // e.g., "7 years"
  joinDate: string; // e.g., "8/15/2023"
  // This object/array holds data about interns for complex display
  assignedInterns: {
    count: number;
    list: string; // e.g., "Alice Johnson, Frank Thompson..."
  };
};

// --- 2. Define the Columns Array ---
export const supervisorColumns: ColumnDef<Supervisor>[] = [
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

  // Assigned Domain Column
  {
    accessorKey: "assignedDomain",
    header: "Assigned Domain",
    cell: ({ row }) => {
      const domain = row.getValue("assignedDomain") as string;
      return <Badge variant="outline">{domain}</Badge>;
    },
  },

  // Department Column
  {
    accessorKey: "department",
    header: "Department",
  },

  // Experience Column
  {
    accessorKey: "experience",
    header: "Experience",
  },

  // Assigned Interns Column (Complex Cell Display)
  {
    accessorKey: "assignedInterns",
    header: "Assigned Interns",
    cell: ({ row }) => {
      const assigned = row.original.assignedInterns;
      return (
        <div className="flex flex-col text-sm">
          <span className="font-semibold">{assigned.count} interns</span>
          <span className="text-muted-foreground max-w-[200px] whitespace-normal">
            {assigned.list}
          </span>
        </div>
      );
    },
    // We will use the count for sorting, but the accessor is the complex object
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.original.assignedInterns.count;
      const b = rowB.original.assignedInterns.count;
      if (a === b) return 0;
      return a > b ? 1 : -1;
    },
  },

  // Join Date Column
  {
    accessorKey: "joinDate",
    header: "Join Date",
  },

  // Actions Column (View, Edit, Message)
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const supervisor = row.original;
      // Get the functions from the table's meta data
      const { onViewSupervisor, onEditSupervisor } = table.options.meta as {
        onViewSupervisor?: (supervisor: Supervisor) => void;
        onEditSupervisor?: (supervisor: Supervisor) => void;
      };

      // Call the functions passed from the parent component
      const handleViewUser = () =>
        onViewSupervisor && onViewSupervisor(supervisor);
      const handleEditUser = () =>
        onEditSupervisor && onEditSupervisor(supervisor);
      const handleMessageUser = () =>
        (window.location.href = `mailto:${supervisor.email}`);

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
              Edit Supervisor
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Message */}
            <DropdownMenuItem onClick={handleMessageUser}>
              <Mail className="mr-2 h-4 w-4" />
              Message Supervisor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
