import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import {
  type ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { z } from "zod";
import { BadgeList } from "@/components/display/badge-list";
import { ApiTokenPermission } from "@/generated/graphql/graphql";
import type { ApiTokenRow } from "@/hooks/queries/api-tokens";
import { cn } from "@/lib/cn";
import { parseAsShape } from "@/lib/parsers";

const queryParser = parseAsShape(z.string())
  .withDefault("")
  .withOptions({ clearOnDefault: true, history: "push" as const });

const sortParser = parseAsShape(
  z.array(z.object({ id: z.string(), desc: z.boolean() }))
)
  .withDefault([])
  .withOptions({ clearOnDefault: true, history: "push" as const });

const permissionParser = parseAsShape(z.string()).withOptions({
  clearOnDefault: true,
  history: "push" as const,
});

const statusParser = parseAsShape(z.string()).withOptions({
  clearOnDefault: true,
  history: "push" as const,
});

const PERMISSION_LABELS: Array<{ value: ApiTokenPermission; label: string }> = [
  { value: ApiTokenPermission.Query, label: "QUERY" },
  { value: ApiTokenPermission.Mutate, label: "MUTATE" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "no-expiry", label: "No expiry" },
];

export function isApiTokenExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

function tokenStatus(
  expiresAt?: string | null
): "active" | "expired" | "no-expiry" {
  if (!expiresAt) return "no-expiry";
  return isApiTokenExpired(expiresAt) ? "expired" : "active";
}

const columnHelper = createColumnHelper<ApiTokenRow>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  onEdit: (token: ApiTokenRow) => void,
  onDelete: (token: ApiTokenRow) => void,
  onView: (token: ApiTokenRow) => void
) => [
  columnHelper.display({
    id: "select",
    enableHiding: false,
    header: ({ table }) => (
      <input
        checked={table.getIsAllRowsSelected()}
        className="checkbox checkbox-sm"
        onChange={table.getToggleAllRowsSelectedHandler()}
        type="checkbox"
      />
    ),
    cell: ({ row }) => (
      <input
        checked={row.getIsSelected()}
        className="checkbox checkbox-sm"
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        type="checkbox"
      />
    ),
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("permissions", {
    header: "Permissions",
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      return row.original.permissions.includes(
        filterValue as ApiTokenPermission
      );
    },
    cell: (data) => (
      <BadgeList
        values={data.getValue().map((permission) => permission.toString())}
      />
    ),
  }),
  columnHelper.display({
    id: "status",
    header: "Status",
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      return tokenStatus(row.original.expiresAt) === filterValue;
    },
    cell: ({ row }) => (
      <BadgeList values={[tokenStatus(row.original.expiresAt)]} />
    ),
  }),
  columnHelper.accessor("expiresAt", {
    header: "Expires",
    sortingFn: "datetime",
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? new Date(value).toLocaleDateString() : "Never";
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    sortingFn: "datetime",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    sortingFn: "datetime",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  columnHelper.display({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <button
          className="btn btn-sm btn-square btn-ghost"
          onClick={() => onEdit(row.original)}
          type="button"
        >
          <PencilIcon />
        </button>
        <button
          className="btn btn-sm btn-square btn-ghost"
          onClick={() => onView(row.original)}
          type="button"
        >
          <EyeIcon />
        </button>
        <button
          className="btn btn-sm btn-square btn-ghost btn-error"
          onClick={() => onDelete(row.original)}
          type="button"
        >
          <TrashSimpleIcon />
        </button>
      </div>
    ),
  }),
];

interface ApiTokensTableProps {
  data: ApiTokenRow[];
  onDelete: (token: ApiTokenRow) => void;
  onEdit: (token: ApiTokenRow) => void;
  onMultiDelete: (tokens: ApiTokenRow[]) => void;
  onMultiEdit: (tokens: ApiTokenRow[]) => void;
  onMultiView: (tokens: ApiTokenRow[]) => void;
  onView: (token: ApiTokenRow) => void;
}

export function ApiTokensTable({
  data,
  onEdit,
  onDelete,
  onView,
  onMultiEdit,
  onMultiView,
  onMultiDelete,
}: ApiTokensTableProps) {
  const [searchQuery, setSearchQuery] = useQueryState("query", queryParser);
  const [sort, setSort] = useQueryState("sort", sortParser);
  const [permission, setPermission] = useQueryState(
    "permission",
    permissionParser
  );
  const [status, setStatus] = useQueryState("status", statusParser);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (permission) filters.push({ id: "permissions", value: permission });
    if (status) filters.push({ id: "status", value: status });
    return filters;
  }, [permission, status]);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSort((currentSort) =>
      typeof updater === "function" ? updater(currentSort) : updater
    );
  };

  const table = useReactTable({
    data,
    columns: getColumns(onEdit, onDelete, onView),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    state: {
      globalFilter: searchQuery,
      sorting: sort,
      columnFilters,
      rowSelection,
    },
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
  });

  const selected = data.filter((token) => rowSelection[token.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="-mb-2 flex justify-end">
        <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto">
          <button
            className="btn btn-ghost btn-sm"
            disabled={!selected.length}
            onClick={() => onMultiEdit(selected)}
            type="button"
          >
            <PencilIcon />
            <span>Update permissions ({selected.length})</span>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            disabled={!selected.length}
            onClick={() => onMultiView(selected)}
            type="button"
          >
            <EyeIcon />
            <span>View Selected ({selected.length})</span>
          </button>
          <button
            className="btn btn-ghost btn-sm btn-error"
            disabled={!selected.length}
            onClick={() => onMultiDelete(selected)}
            type="button"
          >
            <TrashSimpleIcon />
            <span>Remove Selected ({selected.length})</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="input min-w-64 flex-1 bg-base-200">
          <MagnifyingGlassIcon className="opacity-md" />
          <input
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name..."
            type="search"
            value={searchQuery}
          />
        </label>

        <select
          className="select min-w-40 bg-base-200"
          onChange={(event) => setPermission(event.target.value || null)}
          value={permission ?? ""}
        >
          <option value="">All permissions</option>
          {PERMISSION_LABELS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          className="select min-w-40 bg-base-200"
          onChange={(event) => setStatus(event.target.value || null)}
          value={status ?? ""}
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value || "all"} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded bg-base-200">
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
              <tr
                className={cn(
                  "hover:bg-base-200",
                  row.getIsSelected() && "bg-base-200"
                )}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    <div className="line-clamp-1">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
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
