import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Mail, Trash2, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "SUPERVISOR" | "INTERN";
  domain?: string;
  startDate?: string;
  endDate?: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-medium text-primary">
        {row.getValue("fullName")}
      </span>
    ),
  },

  {
    accessorKey: "email",
    header: "Email",
  },

  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as User["role"];
      let variant: "default" | "secondary" | "outline" = "outline";

      if (role === "ADMIN") variant = "default";
      else if (role === "SUPERVISOR") variant = "secondary";

      return (
        <Badge variant={variant} className="min-w-[100px] justify-center">
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const role = row.getValue(id) as string;
      if (value === "ALL" || !value) return true;
      return role === value;
    },
  },

  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue("companyName")}
      </span>
    ),
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta as {
        deleteUser?: (id: number) => void;
        viewUser?: (user: User) => void;
      };

      const handleViewUser = () => {
        if (meta?.viewUser) {
          meta.viewUser(user);
        }
      };

      const handleMessageUser = () => {
        window.location.href = `mailto:${user.email}?subject=Message%20from%20Company%20Admin`;
      };

      const handleDeleteUser = () => {
        if (meta?.deleteUser) {
          meta.deleteUser(user.id);
        }
      };

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

            <DropdownMenuItem onClick={handleViewUser}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleMessageUser}>
              <Mail className="mr-2 h-4 w-4" />
              Message User
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDeleteUser}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
