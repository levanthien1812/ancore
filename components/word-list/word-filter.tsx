"use client";
import { WordWithMeanings } from "../add-word/add-word-form";
import {
  MASTERY_LEVELS,
  PARTS_OF_SPEECH,
  PARTS_OF_SPEECH_PHRASES,
} from "@/lib/constants/enums";
import { Button } from "../ui/button";
import {
  ArrowDownAZ,
  ChevronDown,
  FunnelPlus,
  FunnelX,
  MousePointer2,
  MousePointer2Off,
  Trash,
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
import { useState } from "react";
import { useLayoutStore } from "@/lib/stores/layout-store";

type Props = {
  table: Table<WordWithMeanings>;
  isSelectMode?: boolean;
  onToggleSelectMode?: (isActive: boolean) => void;
  isLoadingAll?: boolean;
};

const WordFilter = ({
  table,
  isSelectMode = false,
  onToggleSelectMode,
  isLoadingAll = false,
}: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const { mode } = useLayoutStore();

  const handleResetFilter = () => {
    table.resetColumnFilters();
  };

  const areFiltersSet = table.getState().columnFilters.length > 0;

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  return (
    <>
      <div className="flex justify-between items-center gap-2">
        <div className="flex-1 relative flex items-center gap-1">
          <Input
            placeholder="🔎 Search for words..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
            disabled={isLoadingAll}
            className="w-full text-sm md:w-52"
          />
          {table.getState().globalFilter && (
            <Button
              type="button"
              onClick={() => table.resetGlobalFilter()}
              variant="ghost"
            >
              <Trash width={14} height={14} className="text-red-600" />
            </Button>
          )}
          {isLoadingAll && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin">
                <svg
                  className="w-4 h-4 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant={"secondary"}
            onClick={() => onToggleSelectMode?.(!isSelectMode)}
          >
            {isSelectMode ? (
              <MousePointer2Off width={16} />
            ) : (
              <MousePointer2 width={16} />
            )}
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
        <div className="flex flex-col md:flex-row justify-start md:justify-end items-start md:items-center gap-2 p-2 border rounded-md mt-1 bg-blue-200 bg-diagonal-stripes">
          <Select
            onValueChange={(value) =>
              table.getColumn("partOfSpeech")?.setFilterValue(value)
            }
            value={
              (table.getColumn("partOfSpeech")?.getFilterValue() as string) ||
              ""
            }
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white">
              <SelectValue placeholder="Select Part of Speech" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[...PARTS_OF_SPEECH, ...PARTS_OF_SPEECH_PHRASES].map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              table.getColumn("masteryLevel")?.setFilterValue(value)
            }
            value={
              (table.getColumn("masteryLevel")?.getFilterValue() as string) ||
              ""
            }
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white">
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
            value={(table.getColumn("type")?.getFilterValue() as string) || ""}
          >
            <SelectTrigger className="w-full md:w-32 bg-white">
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
