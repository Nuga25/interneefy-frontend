import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- TYPE DEFINITIONS ---

export type SupervisorRef = {
  id: number;
  name: string;
};

export type Domain = {
  id: number;
  domainName: string;
  description: string;
  supervisors: SupervisorRef[];
  activeInterns: number;
  totalInterns: number;
  createdDate: string; // ISO date string or formatted date
  status: "Active" | "Inactive";
};

// Define the shape of the custom functions passed via 'meta'
type DomainTableMeta = {
  onViewDomain: (domain: Domain) => void;
  onEditDomain: (domain: Domain) => void;
  // onDeleteDomain: (domainId: number) => void; // Can be added later
};

// --- COLUMN DEFINITIONS ---

export const domainColumns: ColumnDef<Domain>[] = [
  {
    accessorKey: "domainName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Domain Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="text-xs max-w-sm line-clamp-2">
          {row.original.description}
        </div>
      );
    },
  },
  {
    accessorKey: "supervisors",
    header: "Supervisors",
    cell: ({ row }) => {
      const supervisors = row.original.supervisors;
      const supervisorNames = supervisors.map((s) => s.name);

      return (
        <div className="flex flex-col space-y-0.5 text-sm">
          <div className="font-semibold">{supervisors.length} supervisors</div>
          <div className="text-xs text-muted-foreground line-clamp-2">
            {supervisorNames.join(", ")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "activeInterns",
    header: "Active Interns",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-center">
          {row.original.activeInterns}
        </div>
      );
    },
  },
  {
    accessorKey: "totalInterns",
    header: "Total Interns",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-center">
          {row.original.totalInterns}
        </div>
      );
    },
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={`text-xs ${
            status === "Active"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => {
      const domain = row.original;
      // Type assertion to access custom functions from the meta object
      const { onViewDomain, onEditDomain } = table.options
        .meta as DomainTableMeta;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Pencil className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDomain(domain)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditDomain(domain)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Domain
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Domain
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
