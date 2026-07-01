"use client";
import React, { useMemo, useState, useTransition } from "react";
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
import { DEFAULT_WORDS_PER_PAGE_GRID } from "@/lib/constants/constant";
import ActionsPanel from "./actions-panel";
import Pagination from "./pagination";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constants/queryKey";

const WordGrid = ({
  words,
  onClickTitle,
  globalFilter: initialGlobalFilter = "",
  onGlobalFilterChange,
  isLoadingAll = false,
}: {
  words: WordWithMeanings[];
  onClickTitle: (index: number) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  isLoadingAll?: boolean;
}) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const columns = useMemo<ColumnDef<WordWithMeanings>[]>(
    () => [
      {
        accessorKey: "word",
        header: "Word",
        enableSorting: true,
        enableGlobalFilter: true,
      },
      {
        accessorFn: (row) =>
          row.meanings.map((meaning) => meaning.definition).join(" "),
        id: "meanings",
        header: "Meanings",
        enableSorting: false,
        cell: ({ row }) => {
          const meanings = row.original.meanings;
          return meanings.map((meaning) => meaning.definition).join(", ");
        },
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
      {
        id: "partOfSpeech",
        filterFn: (row, columnId, value) => {
          const meanings = row.original.meanings;
          return meanings.some((meaning) => meaning.partOfSpeech === value);
        },
      },
    ],
    [],
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_WORDS_PER_PAGE_GRID,
  });

  // Sync globalFilter changes to parent
  React.useEffect(() => {
    onGlobalFilterChange?.(globalFilter);
  }, [globalFilter, onGlobalFilterChange]);

  // Sync external globalFilter prop to internal state (only when prop changes)
  React.useEffect(() => {
    setGlobalFilter(initialGlobalFilter);
  }, [initialGlobalFilter]);

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
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const handleToggleSelectMode = (isActive: boolean) => {
    setIsSelectMode(isActive);
    if (!isActive) {
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      <WordFilter
        table={table}
        isSelectMode={isSelectMode}
        onToggleSelectMode={handleToggleSelectMode}
        isLoadingAll={isLoadingAll}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
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
              isSelectMode={isSelectMode}
              isSelected={selectedIds.has(row.original.id)}
              onSelect={(wordId) => {
                const newSelectedIds = new Set(selectedIds);
                if (newSelectedIds.has(wordId)) {
                  newSelectedIds.delete(wordId);
                } else {
                  newSelectedIds.add(wordId);
                }
                setSelectedIds(newSelectedIds);
              }}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Action Panel */}
      {isSelectMode && selectedIds.size > 0 && (
        <ActionsPanel
          selectedIds={selectedIds}
          onUpdateSuccess={() => {
            setSelectedIds(new Set());
            setIsSelectMode(false);
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_WORDS] });
          }}
          onCancel={() => handleToggleSelectMode(false)}
          isPending={isPending}
          startTransition={startTransition}
        />
      )}

      {/* Pagination */}
      <Pagination table={table} pagination={pagination} />
    </div>
  );
};

export default WordGrid;
