import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import {
  type ColumnFiltersState,
  createColumnHelper,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import type { SkillEntity } from "@/graphql/graphql";
import { SkillCategory } from "@/graphql/graphql";
import { cn } from "@/lib/cn";

const DATE_OPTIONS = [
  { value: undefined, label: "Any date" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
];

const columnHelper = createColumnHelper<SkillEntity>();

const dateRangeFilter: FilterFn<SkillEntity> = (row, column, value) => {
  const date = new Date(row.getValue(column));
  const now = new Date();
  if (value === "week") {
    return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (value === "month") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  return true;
};

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  onEdit: (skill: SkillEntity) => void,
  onDelete: (id: string) => void
) => [
  columnHelper.accessor("name", {
    header: "Name",
    enableGlobalFilter: true,
    enableSorting: true,
  }),
  columnHelper.accessor("slug", {
    header: "Slug",
    enableGlobalFilter: true,
    enableSorting: true,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    enableColumnFilter: true,
    filterFn: "equals",
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor("relevance", {
    header: "Relevance",
    enableSorting: true,
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    enableSorting: true,
    enableColumnFilter: true,
    sortingFn: "datetime",
    filterFn: dateRangeFilter,
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    enableSorting: true,
    enableColumnFilter: true,
    sortingFn: "datetime",
    filterFn: dateRangeFilter,
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <button
          className="btn btn-sm btn-square btn-soft"
          onClick={() => onEdit(row.original)}
          type="button"
        >
          <PencilIcon />
        </button>
        <button
          className="btn btn-sm btn-soft btn-square btn-error"
          onClick={() => onDelete(row.original.id)}
          type="button"
        >
          <TrashSimpleIcon />
        </button>
      </div>
    ),
  }),
];

interface SkillsTableProps {
  data: SkillEntity[];
  onDelete: (id: string) => void;
  onEdit: (skill: SkillEntity) => void;
}

export function SkillsTable({ data, onEdit, onDelete }: SkillsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  function setColumnFilter(id: string, value: unknown) {
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== id);
      return value ? [...rest, { id, value }] : rest;
    });
  }

  const categoryFilter = columnFilters.find((f) => f.id === "category")
    ?.value as string | undefined;
  const createdAtFilter = columnFilters.find((f) => f.id === "createdAt")
    ?.value as string | undefined;
  const updatedAtFilter = columnFilters.find((f) => f.id === "updatedAt")
    ?.value as string | undefined;

  const table = useReactTable({
    data,
    columns: getColumns(onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // pipeline: core → filtered
    getSortedRowModel: getSortedRowModel(), // pipeline: core → filtered → sorted
    enableGlobalFilter: false,
    enableSorting: false,
    state: { globalFilter, sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label className="input flex-1">
          <MagnifyingGlassIcon className="opacity-md" />
          <input
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name or slug..."
            type="text"
            value={globalFilter}
          />
        </label>

        <select
          className="select"
          onChange={(e) => setColumnFilter("category", e.target.value)}
          value={categoryFilter ?? ""}
        >
          <option value="">All categories</option>
          {Object.values(SkillCategory).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="dropdown dropdown-bottom dropdown-end">
          <button className="btn btn-square btn-soft" type="button">
            <CalendarIcon />
          </button>
          <div className="dropdown-content z-1 flex w-48 flex-col rounded-box border border-input bg-base-200 p-4">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Created</span>
              {DATE_OPTIONS.map(({ value, label }) => (
                <label className="flex items-center gap-2 text-sm" key={value}>
                  <input
                    checked={createdAtFilter === value}
                    className="radio radio-sm"
                    name="created"
                    onChange={() => setColumnFilter("createdAt", value)}
                    type="radio"
                    value={value ?? "any"}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="divider mt-2 mb-0" />
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Updated</span>
              {DATE_OPTIONS.map(({ value, label }) => (
                <label className="flex items-center gap-2 text-sm" key={value}>
                  <input
                    checked={updatedAtFilter === value}
                    className="radio radio-sm"
                    name="updated"
                    onChange={() => setColumnFilter("updatedAt", value)}
                    type="radio"
                    value={value ?? "any"}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-200">
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className={cn(
                      header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <SortIcon sorted={header.column.getIsSorted()} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
