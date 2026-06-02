"use client";
import { WordWithMeanings } from "../add-word/add-word-form";
import { MASTERY_LEVELS } from "@/lib/constants/enums";
import { Button } from "../ui/button";
import {
  ArrowDownAZ,
  ChevronDown,
  FunnelPlus,
  FunnelX,
  MousePointer2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Table } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useLayout } from "../layout/layout-context";

type Props = {
  table: Table<WordWithMeanings>;
  isSelectMode?: boolean;
  onToggleSelectMode?: (isActive: boolean) => void;
};

const WordFilter = ({
  table,
  isSelectMode = false,
  onToggleSelectMode,
}: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const { mode } = useLayout();

  const handleResetFilter = () => {
    table.resetGlobalFilter();
    table.getColumn("masteryLevel")?.setFilterValue("");
    table.getColumn("type")?.setFilterValue("");
    const highlightedColumn = table.getColumn("highlighted");
    if (highlightedColumn) {
      highlightedColumn.setFilterValue(undefined);
    }
  };

  const areFiltersSet = useMemo(() => {
    const { globalFilter } = table.getState();

    const masteryLevelFilter = table
      .getColumn("masteryLevel")
      ?.getFilterValue();
    const typeFilter = table.getColumn("type")?.getFilterValue();
    const highlightedFilter = table.getColumn("highlighted")?.getFilterValue();
    return (
      !!globalFilter ||
      !!masteryLevelFilter ||
      !!typeFilter ||
      highlightedFilter !== undefined
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    table.getState().globalFilter,
    table.getColumn("masteryLevel")?.getFilterValue(),
    table.getColumn("type")?.getFilterValue(),
    table.getColumn("highlighted")?.getFilterValue(),
  ]);

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  return (
    <>
      <div className="flex justify-between items-center gap-2">
        <Input
          placeholder="🔎 Search for words..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value);
          }}
          className="w-full text-sm md:w-52"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant={"secondary"}
            onClick={() => onToggleSelectMode?.(!isSelectMode)}
            className=""
          >
            <MousePointer2 width={16} />
            <span className="hidden md:inline">
              {isSelectMode ? "Exit Select Mode" : "Select"}
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"secondary"}
                onClick={handleToggleFilters}
                className=""
              >
                <ArrowDownAZ width={16} />
                <span className="hidden md:inline">
                  Sort by: {table.getState().sorting[0]?.id || "None"}
                </span>{" "}
                <span>{table.getState().sorting[0]?.desc ? "⬇️" : "⬆️"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanSort())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsSorted() === false ? false : true}
                    onCheckedChange={(value) => column.toggleSorting(!!value)}
                  >
                    {column.columnDef.header?.toString()}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={"secondary"}
            onClick={handleToggleFilters}
            className=" gap-0.5"
          >
            {showFilters ? <FunnelX width={16} /> : <FunnelPlus width={16} />}
            <span className="hidden md:inline">
              {showFilters ? "Hide filters" : "Show filters"}
            </span>

            {areFiltersSet && (
              <div className="text-xs text-primary -translate-y-2">●</div>
            )}
          </Button>
        </div>
      </div>
      {showFilters && (
        <div className="flex flex-col md:flex-row justify-start md:justify-end items-start md:items-center gap-2 p-2 border rounded-md mt-1">
          <Select
            onValueChange={(value) =>
              table.getColumn("masteryLevel")?.setFilterValue(value)
            }
            value={table.getColumn("masteryLevel")?.getFilterValue() as string}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Mastery level" />
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
          <Select
            onValueChange={(value) =>
              table.getColumn("type")?.setFilterValue(value)
            }
            value={table.getColumn("type")?.getFilterValue() as string}
          >
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Word">Word</SelectItem>
                <SelectItem value="Phrase">Phrase</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="highlighted"
              checked={
                table.getColumn("highlighted")?.getFilterValue() === true
              }
              onCheckedChange={(checked) => {
                const highlightedColumn = table.getColumn("highlighted");
                if (highlightedColumn) {
                  highlightedColumn.setFilterValue(checked ? true : undefined);
                }
              }}
            />
            <label
              htmlFor="highlighted"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Highlighted
            </label>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {mode === "list" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-0 md:w-fit"
                  >
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
            )}
            {areFiltersSet && (
              <Button
                variant={"default"}
                onClick={handleResetFilter}
                className="flex-1 md:flex-0 md:w-fit"
              >
                Reset filter
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WordFilter;
