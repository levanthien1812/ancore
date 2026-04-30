"use client";
import React, { useMemo, useState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordCard from "./word-card";
import WordFilter from "./word-filter";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
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

const WordGrid = ({
  words,
  onClickTitle,
}: {
  words: WordWithMeanings[];
  onClickTitle: (index: number) => void;
}) => {
  const columns = useMemo<ColumnDef<WordWithMeanings>[]>(
    () => [
      {
        accessorKey: "word",
        header: "Word",
        cell: ({ row }) => (
          <WordCard
            word={row.original}
            onClickTitle={() => {
              const originalIndex = words.findIndex(
                (w) => w.id === row.original.id,
              );
              onClickTitle(originalIndex === -1 ? 0 : originalIndex);
            }}
          />
        ),
        enableSorting: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: "type",
        header: "Type",
        enableSorting: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: "masteryLevel",
        header: "Mastery level",
        enableSorting: true,
      },
      {
        accessorKey: "highlighted",
        header: "Highlighted",
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: "equals",
      },
      {
        accessorKey: "createdAt",
        header: "Added at",
        enableSorting: true,
      },
    ],
    [onClickTitle, words],
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZES[1],
  });

  const table = useReactTable({
    data: words,
    columns,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="space-y-2 sm:space-y-4">
      <WordFilter table={table} />
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
        {table.getRowModel().rows.map((row) => (
          <React.Fragment key={row.id}>
            <WordCard
              word={row.original}
              onClickTitle={() => {
                const originalIndex = words.findIndex(
                  (w) => w.id === row.original.id,
                );
                onClickTitle(originalIndex === -1 ? 0 : originalIndex);
              }}
            />
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
        <div>
          <span className="text-sm">
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
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
      </div>
    </div>
  );
};

export default WordGrid;
