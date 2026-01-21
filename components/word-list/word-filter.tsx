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
import { Table } from "@tanstack/react-table";
import { useMemo } from "react";

type Props = {
  table: Table<WordWithMeanings>;
};

const WordFilter = ({ table }: Props) => {
  const handleResetFilter = () => {
    table.resetGlobalFilter();
    table.getColumn("masteryLevel")?.setFilterValue("");
    table.getColumn("type")?.setFilterValue("");
  };

  const areFiltersSet = useMemo(() => {
    const globalFilter = table.getState().globalFilter;
    const masteryLevelFilter = table
      .getColumn("masteryLevel")
      ?.getFilterValue();
    const typeFilter = table.getColumn("type")?.getFilterValue();
    return !!globalFilter || !!masteryLevelFilter || !!typeFilter;
  }, [table]);

  return (
    <div className="flex items-center gap-2 py-2">
      <Input
        placeholder="Filter words..."
        value={(table.getState().globalFilter as string) ?? ""}
        onChange={(event) => {
          table.setGlobalFilter(event.target.value);
        }}
        className="w-52"
      />
      <Select
        onValueChange={(value) =>
          table.getColumn("masteryLevel")?.setFilterValue(value)
        }
        value={table.getColumn("masteryLevel")?.getFilterValue() as string}
      >
        <SelectTrigger className="">
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
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="Word">Word</SelectItem>
            <SelectItem value="Phrase">Phrase</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {areFiltersSet && (
        <Button variant={"default"} onClick={handleResetFilter}>
          Reset filter
        </Button>
      )}
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
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WordFilter;
