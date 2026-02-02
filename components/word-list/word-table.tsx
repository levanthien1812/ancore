"use client";
import React, { useState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "../ui/table";
import WordMasteryLevel from "./word-mastery-level";
import { MasteryLevel } from "@/lib/constants/enums";
import WordPronunciation from "./word-pronunciation";
import WordDefinition from "./word-definition";
import WordTitle from "./word-title";
import WordActions from "./word-actions";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ActionsPanel from "./actions-panel";
import { PAGE_SIZES } from "@/lib/constants/constant";
import WordFilter from "./word-filter";

const WordTable = ({
  words,
  onClickTitle,
}: {
  words: WordWithMeanings[];
  onClickTitle: (index: number) => void;
}) => {
  const columns = React.useMemo<ColumnDef<WordWithMeanings>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 50,
      },
      {
        accessorKey: "word",
        header: "Word",
        cell: ({ row }) => (
          <WordTitle
            word={row.original}
            onClick={() => onClickTitle(row.index)}
          />
        ),
        enableSorting: true,
        enableGlobalFilter: true,
        minSize: 200,
      },
      {
        accessorKey: "type",
        header: "Type",
        enableSorting: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: "highlighted",
        header: "Highlighted",
        cell: ({ row }) => {
          return row.original.highlighted ? (
            <span className="text-center">⭐</span>
          ) : (
            ""
          );
        },
        enableSorting: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: "pronunciation",
        header: "Pronunciation",
        cell: ({ row }) => (
          <>
            {row.original.meanings.map((meaning) => (
              <WordPronunciation
                word={row.original.word}
                pronunciation={meaning.pronunciation}
                key={meaning.id}
              />
            ))}
          </>
        ),
        enableSorting: false,
      },
      {
        accessorFn: (row) =>
          row.meanings.map((meaning) => meaning.definition).join(" "),
        id: "meanings",
        header: "Definition",
        cell: ({ row }) => (
          <WordDefinition
            meanings={row.original.meanings.map(
              (meaning) => meaning.definition,
            )}
          />
        ),
        enableGlobalFilter: true,
        enableSorting: false,
      },
      {
        accessorKey: "masteryLevel",
        header: "Mastery level",
        cell: ({ row }) => (
          <WordMasteryLevel
            wordId={row.original.id}
            level={row.original.masteryLevel as MasteryLevel}
          />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "cefrLevel",
        header: "CEFR level",
        enableSorting: true,
        cell: ({ row }) => (
          <>
            {row.original.meanings.map((meaning) => (
              <p key={meaning.id}>{meaning.cefrLevel}</p>
            ))}
          </>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Added at",
        cell: ({ row }) => (
          <p>{format(row.original.createdAt, "dd/MM/yyyy")}</p>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <WordActions word={row.original} />,
        enableSorting: false,
      },
    ],
    [onClickTitle],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div>
      <WordFilter table={table} />
      <Table>
        <TableCaption>Word list</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === "asc"
                            ? "Sort ascending"
                            : header.column.getNextSortingOrder() === "desc"
                              ? "Sort descending"
                              : "Clear sort"
                          : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 &&
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 py-4">
        <div className="flex gap-2 items-center justify-start w-full md:w-auto">
          <div className="text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <ActionsPanel
              selectedRows={table.getFilteredSelectedRowModel().rows}
            />
          )}
        </div>
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
  );
};

export default WordTable;
