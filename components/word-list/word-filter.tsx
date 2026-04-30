"use client";
import { WordWithMeanings } from "../add-word/add-word-form";
import { MASTERY_LEVELS } from "@/lib/constants/enums";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
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

type Props = {
  table: Table<WordWithMeanings>;
};

const WordFilter = ({ table }: Props) => {
  const [showFilters, setShowFilters] = useState(false);
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
    const globalFilter = table.getState().globalFilter;
    const masteryLevelFilter = table
      .getColumn("masteryLevel")
      ?.getFilterValue();
    const typeFilter = table.getColumn("type")?.getFilterValue();
    const highlightedFilter = table.getColumn("highlighted")?.getFilterValue();
    console.log("Filters state:", {
      globalFilter,
      masteryLevelFilter,
      typeFilter,
      highlightedFilter,
    });
    return (
      !!globalFilter ||
      !!masteryLevelFilter ||
      !!typeFilter ||
      highlightedFilter !== undefined
    );
  }, [table]);

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  return (
    <div>
      <div className="flex justify-end">
        <Button variant={"link"} onClick={handleToggleFilters} className="p-0">
          {showFilters ? "Hide filters" : "Show filters"}
        </Button>
      </div>
      {showFilters && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 p-2 border rounded-md">
          <Input
            placeholder="Filter words..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
            className="w-full md:w-52"
          />
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
          <div className="flex items-center gap-2">
            {areFiltersSet && (
              <Button
                variant={"default"}
                onClick={handleResetFilter}
                className="w-full md:w-auto"
              >
                Reset filter
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto w-full md:w-auto">
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
        </div>
      )}
    </div>
  );
};

export default WordFilter;
