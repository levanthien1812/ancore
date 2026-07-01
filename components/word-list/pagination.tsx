"use client";
import { PaginationState, Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PAGE_SIZES } from "@/lib/constants/constant";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Pagination = <TData,>({
  table,
  pagination,
}: {
  table: Table<TData>;
  pagination: PaginationState;
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
      <div>
        {/* filtered word count */}
        <span className="text-sm">
          Page {pagination.pageIndex + 1} of {table.getPageCount()}
        </span>{" "}
        {table.getFilteredRowModel().rows.length !==
          table.getCoreRowModel().rows.length && (
          <span className="text-sm">
            ({table.getFilteredRowModel().rows.length} results)
          </span>
        )}
      </div>

      <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
        <div className="flex gap-2 items-center">
          <span className="text-sm">Rows per page: </span>
          <Select
            onValueChange={(value) => table.setPageSize(Number(value))}
            value={String(table.getState().pagination.pageSize)}
          >
            <SelectTrigger className="text-sm" size="sm">
              <SelectValue defaultValue={PAGE_SIZES[0]} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PAGE_SIZES.map((count) => (
                  <SelectItem key={count} value={`${count}`}>
                    {count}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronFirst width={14} />
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft width={14} />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight width={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            Last
            <ChevronLast width={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
