"use client";

import { useState, Dispatch, SetStateAction } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Input re-imported for local filter UI

// --- FIX 1: Defined DataTableProps to be generic over both TData and TMeta ---
// TMeta allows passing arbitrary custom handlers (like onView/onEdit) from the parent.
interface DataTableProps<TData, TMeta extends Record<string, any>> {
  columns: ColumnDef<TData, any>[];
  data: TData[];

  // Filtering state props passed from the parent
  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  searchColumnId: string; // Made required, as we need it for the local search

  // Generic meta object to pass custom handlers down to the cell components
  meta?: TMeta;
}

// --- FIX 2: Corrected Component Signature to include TMeta ---
// Added TMeta to the generic list and provided a default value (Record<string, any>).
export function DataTable<
  TData,
  TMeta extends Record<string, any> = Record<string, any>
>({
  columns,
  data,
  columnFilters,
  setColumnFilters,
  searchColumnId,
  meta, // Passed directly as a prop
}: DataTableProps<TData, TMeta>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  // columnFilters state is managed externally by the parent component

  const table = useReactTable({
    data,
    columns,
    // --- FIX 3: Pass the entire generic 'meta' object directly ---
    meta,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      {/* Filtering Input - Re-added for the primary search column */}
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder={`Filter by ${(searchColumnId ?? "Search")
            .toLowerCase()
            .replace("id", "")}...`}
          value={
            (table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {/* Any specific filtering UIs (like role/domain selects) should remain in the parent component */}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
