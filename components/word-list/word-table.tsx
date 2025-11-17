"use client";
import React from "react";
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
import { MASTERY_LEVELS, MasteryLevel } from "@/lib/constants/enums";
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
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
        minSize: 200,
      },
      {
        accessorKey: "pronunciation",
        header: "Pronunciation",
        cell: ({ row }) => (
          <WordPronunciation
            word={row.original.word}
            pronunciation={row.original.pronunciation}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "meanings",
        header: "Definition",
        cell: ({ row }) => (
          <WordDefinition
            meanings={row.original.meanings.map(
              (meaning) => meaning.definition
            )}
          />
        ),
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
    [onClickTitle]
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: words,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Filter words..."
          value={(table.getColumn("word")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("word")?.setFilterValue(event.target.value)
          }
          className="w-52"
        />
        <Select
          onValueChange={(value) =>
            table.getColumn("masteryLevel")?.setFilterValue(value)
          }
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Select CEFR level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {MASTERY_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                        header.getContext()
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
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
