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
import { format } from "date-fns";
import ActionsPanel from "./actions-panel";
import WordFilter from "./word-filter";
import Pagination from "./pagination";
import { formatPronunciation } from "@/lib/utils/pronunciation";
import IconDisplay from "../shared/icon-display";
import { Volume2Icon } from "lucide-react";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import { DEFAULT_WORDS_PER_PAGE_TABLE } from "@/lib/constants/constant";

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
          <div className="flex gap-2 items-center">
            <WordTitle
              word={row.original}
              onClick={() => onClickTitle(row.index)}
            />
            <IconDisplay
              icon={Volume2Icon}
              asButton
              size="sm"
              onClick={(e) => handlePlayAudio(row.original.word)}
              bgClass="bg-primary"
              hoverClass="hover:bg-primary/90"
              activeClass="active:bg-primary/80"
              additionalClasses="ms-auto"
            />
          </div>
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
        enableColumnFilter: true,
      },
      {
        accessorKey: "pronunciation",
        header: "Pronunciation",
        cell: ({ row }) => (
          <>
            {row.original.meanings.map((meaning) => (
              <p className="text-sm" key={meaning.id}>
                {formatPronunciation(meaning.pronunciation)}
              </p>
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
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_WORDS_PER_PAGE_TABLE,
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
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
        <div className="flex gap-2 items-center justify-start w-full md:w-auto">
          <div className="text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <ActionsPanel
              selectedIds={
                new Set(
                  table.getFilteredSelectedRowModel().rows.map((row) => row.id),
                )
              }
              onUpdateSuccess={() => {
                table.resetRowSelection();
              }}
              onCancel={() => table.resetRowSelection()}
            />
          )}
        </div>
        <Pagination table={table} pagination={pagination} />
      </div>
    </div>
  );
};

export default WordTable;
