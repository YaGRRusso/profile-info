import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  EyeIcon,
  GearIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  SlidersHorizontalIcon,
  TrashSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  type ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { BadgeList } from "@/components/display/badge-list";
import { ApiTokenPermission } from "@/generated/graphql/graphql";
import { useActiveFilters } from "@/hooks/custom/use-active-filters";
import { usePersistedState } from "@/hooks/custom/use-persisted-state";
import type { ApiTokenRow } from "@/hooks/queries/api-tokens";
import { cn } from "@/lib/cn";
import { getUniqueFacets } from "@/lib/facets";
import { parseAsShape } from "@/lib/parsers";
import { DEFAULT_META_COLUMN_VISIBILITY } from "@/lib/table-columns";
import { dateRangeFilter } from "@/lib/table-filters";

const debouncedUrlUpdates = { method: "debounce" as const, timeMs: 500 };
const persistentOptions = { clearOnDefault: true, history: "push" as const };

const queryParser = parseAsShape(z.string())
  .withDefault("")
  .withOptions({ ...persistentOptions, limitUrlUpdates: debouncedUrlUpdates });

const sortParser = parseAsShape(
  z.array(z.object({ id: z.string(), desc: z.boolean() }))
)
  .withDefault([])
  .withOptions(persistentOptions);

const permissionParser = parseAsShape(z.string()).withOptions(
  persistentOptions
);
const statusParser = parseAsShape(z.string()).withOptions(persistentOptions);
const createdAtParser = parseAsShape(z.string()).withOptions(persistentOptions);
const updatedAtParser = parseAsShape(z.string()).withOptions(persistentOptions);
const expiresAtParser = parseAsShape(z.string()).withOptions(persistentOptions);

const PERMISSION_LABELS: Array<{ value: ApiTokenPermission; label: string }> = [
  { value: ApiTokenPermission.Query, label: "QUERY" },
  { value: ApiTokenPermission.Mutate, label: "MUTATE" },
];

const STATUS_LABELS: Array<{
  value: "active" | "expired" | "no-expiry";
  label: string;
}> = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "no-expiry", label: "No expiry" },
];

const DATE_OPTIONS = [
  { value: "", label: "Any date" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
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

function permissionFacetsFromTokens(tokens: ApiTokenRow[]) {
  const counts = new Map<ApiTokenPermission, number>();
  for (const token of tokens) {
    for (const permission of token.permissions) {
      counts.set(permission, (counts.get(permission) ?? 0) + 1);
    }
  }
  return getUniqueFacets(counts, PERMISSION_LABELS);
}

function statusFacetsFromTokens(tokens: ApiTokenRow[]) {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    const status = tokenStatus(token.expiresAt);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return getUniqueFacets(counts, STATUS_LABELS);
}

function matchesDateColumnFilter(
  value: string | null | undefined,
  filterValue: string | null | undefined
) {
  if (!filterValue) return true;
  if (!value) return false;
  const row = { getValue: () => value };
  return dateRangeFilter(row as never, "", filterValue);
}

function matchesSearch(token: ApiTokenRow, searchQuery: string) {
  if (!searchQuery) return true;
  return token.name.toLowerCase().includes(searchQuery.toLowerCase());
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
  columnHelper.accessor("id", {
    header: "ID",
    enableGlobalFilter: false,
    enableSorting: false,
    cell: (data) => (
      <span className="font-mono text-xs">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("permissions", {
    header: "Permissions",
    enableColumnFilter: true,
    enableSorting: false,
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
  columnHelper.accessor((row) => tokenStatus(row.expiresAt), {
    id: "status",
    header: "Status",
    enableColumnFilter: true,
    enableSorting: false,
    enableGlobalFilter: false,
    filterFn: "equals",
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor("expiresAt", {
    header: "Expires",
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: "datetime",
    filterFn: (row, columnId, filterValue) => {
      const expiresAt = row.getValue<string | null | undefined>(columnId);
      if (!filterValue) return true;
      if (!expiresAt) return false;
      return dateRangeFilter(row, columnId, filterValue);
    },
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? new Date(value).toLocaleDateString() : "Never";
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: "datetime",
    filterFn: dateRangeFilter,
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: "datetime",
    filterFn: dateRangeFilter,
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
  const { t: tAction } = useTranslation("actions");
  const { t: tTable } = useTranslation("tables");
  const [searchQuery, setSearchQuery] = useQueryState("query", queryParser);
  const [sort, setSort] = useQueryState("sort", sortParser);
  const [permission, setPermission] = useQueryState(
    "permission",
    permissionParser
  );
  const [status, setStatus] = useQueryState("status", statusParser);
  const [createdAt, setCreatedAt] = useQueryState("createdAt", createdAtParser);
  const [updatedAt, setUpdatedAt] = useQueryState("updatedAt", updatedAtParser);
  const [expiresAt, setExpiresAt] = useQueryState("expiresAt", expiresAtParser);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>(
      "api-tokens-table-columns",
      DEFAULT_META_COLUMN_VISIBILITY
    );

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const activeFilters: ColumnFiltersState = [];
    if (permission)
      activeFilters.push({ id: "permissions", value: permission });
    if (status) activeFilters.push({ id: "status", value: status });
    if (createdAt) activeFilters.push({ id: "createdAt", value: createdAt });
    if (updatedAt) activeFilters.push({ id: "updatedAt", value: updatedAt });
    if (expiresAt) activeFilters.push({ id: "expiresAt", value: expiresAt });
    return activeFilters;
  }, [permission, status, createdAt, updatedAt, expiresAt]);

  const { filters: activeFilters, clearAll: clearAllFilters } =
    useActiveFilters([
      {
        id: "permission",
        label: "Permission",
        state: permission,
        setState: setPermission,
      },
      {
        id: "status",
        label: "Status",
        state: status,
        setState: setStatus,
      },
      {
        id: "createdAt",
        label: "Created",
        state: createdAt,
        setState: setCreatedAt,
      },
      {
        id: "updatedAt",
        label: "Updated",
        state: updatedAt,
        setState: setUpdatedAt,
      },
      {
        id: "expiresAt",
        label: "Expires",
        state: expiresAt,
        setState: setExpiresAt,
      },
    ]);

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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowId: (row) => row.id,
    state: {
      globalFilter: searchQuery,
      sorting: sort,
      columnFilters,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const tokensForPermissionFacets = useMemo(
    () =>
      data.filter(
        (token) =>
          matchesSearch(token, searchQuery ?? "") &&
          (!status || tokenStatus(token.expiresAt) === status) &&
          matchesDateColumnFilter(token.createdAt, createdAt) &&
          matchesDateColumnFilter(token.updatedAt, updatedAt) &&
          matchesDateColumnFilter(token.expiresAt, expiresAt)
      ),
    [data, searchQuery, status, createdAt, updatedAt, expiresAt]
  );

  const tokensForStatusFacets = useMemo(
    () =>
      data.filter(
        (token) =>
          matchesSearch(token, searchQuery ?? "") &&
          (!permission ||
            token.permissions.includes(permission as ApiTokenPermission)) &&
          matchesDateColumnFilter(token.createdAt, createdAt) &&
          matchesDateColumnFilter(token.updatedAt, updatedAt) &&
          matchesDateColumnFilter(token.expiresAt, expiresAt)
      ),
    [data, searchQuery, permission, createdAt, updatedAt, expiresAt]
  );

  const permissionFacets = useMemo(
    () => permissionFacetsFromTokens(tokensForPermissionFacets),
    [tokensForPermissionFacets]
  );

  const statusFacets = useMemo(
    () => statusFacetsFromTokens(tokensForStatusFacets),
    [tokensForStatusFacets]
  );

  const selected = data.filter((token) => rowSelection[token.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="-mb-2 flex justify-end">
        <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto">
          <button
            className="btn btn-ghost btn-sm"
            disabled={!selected?.length}
            onClick={() => onMultiEdit(selected)}
            type="button"
          >
            <PencilIcon />
            <span>{tAction("updateSelected", { count: selected.length })}</span>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            disabled={!selected?.length}
            onClick={() => onMultiView(selected)}
            type="button"
          >
            <EyeIcon />
            <span>{tAction("viewSelected", { count: selected.length })}</span>
          </button>
          <button
            className="btn btn-ghost btn-sm btn-error"
            disabled={!selected?.length}
            onClick={() => onMultiDelete(selected)}
            type="button"
          >
            <TrashSimpleIcon />
            <span>{tAction("removeSelected", { count: selected.length })}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-64 flex-1 items-center gap-2">
          <label className="input flex-1 bg-base-200">
            <MagnifyingGlassIcon className="opacity-md" />
            <input
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={tTable("search")}
              type="search"
              value={searchQuery}
            />
          </label>
        </div>

        <div className="flex min-w-64 flex-1 items-center gap-2">
          <select
            className="select flex-1 bg-base-200"
            disabled={!permissionFacets.length}
            onChange={(event) => setPermission(event.target.value || null)}
            value={permission ?? ""}
          >
            <option value="">All permissions</option>
            {permissionFacets.map(({ value, label, count }) => (
              <option key={value} value={value}>
                {label} ({count})
              </option>
            ))}
          </select>

          <div className="dropdown dropdown-bottom dropdown-end">
            <button className="btn btn-square btn-soft" type="button">
              <SlidersHorizontalIcon />
            </button>
            <div className="dropdown-content z-10 w-52 rounded-box bg-base-200 p-4">
              <fieldset className="flex flex-col gap-2">
                <span className="font-semibold">Status</span>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={!status}
                    className="radio radio-sm"
                    name="status"
                    onChange={() => setStatus(null)}
                    type="radio"
                    value=""
                  />
                  <span>All statuses</span>
                </label>
                {statusFacets.map(({ value, label, count }) => (
                  <label
                    className="flex items-center gap-2 text-sm"
                    key={value}
                  >
                    <input
                      checked={status === value}
                      className="radio radio-sm"
                      name="status"
                      onChange={() => setStatus(value)}
                      type="radio"
                      value={value}
                    />
                    <span>
                      {label} ({count})
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="divider mt-2 mb-0" />
              <fieldset className="flex flex-col gap-2">
                <span className="font-semibold">Created</span>
                {DATE_OPTIONS.map(({ value, label }) => (
                  <label
                    className="flex items-center gap-2 text-sm"
                    key={value}
                  >
                    <input
                      checked={
                        createdAt === value || (!createdAt && value === "")
                      }
                      className="radio radio-sm"
                      name="created"
                      onChange={() => setCreatedAt(value || null)}
                      type="radio"
                      value={value}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
              <div className="divider mt-2 mb-0" />
              <fieldset className="flex flex-col gap-2">
                <span className="font-semibold">Updated</span>
                {DATE_OPTIONS.map(({ value, label }) => (
                  <label
                    className="flex items-center gap-2 text-sm"
                    key={value}
                  >
                    <input
                      checked={
                        updatedAt === value || (!updatedAt && value === "")
                      }
                      className="radio radio-sm"
                      name="updated"
                      onChange={() => setUpdatedAt(value || null)}
                      type="radio"
                      value={value}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
              <div className="divider mt-2 mb-0" />
              <fieldset className="flex flex-col gap-2">
                <span className="font-semibold">Expires</span>
                {DATE_OPTIONS.map(({ value, label }) => (
                  <label
                    className="flex items-center gap-2 text-sm"
                    key={value}
                  >
                    <input
                      checked={
                        expiresAt === value || (!expiresAt && value === "")
                      }
                      className="radio radio-sm"
                      name="expires"
                      onChange={() => setExpiresAt(value || null)}
                      type="radio"
                      value={value}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
            </div>
          </div>

          <div className="dropdown dropdown-bottom dropdown-end">
            <button className="btn btn-square btn-soft" type="button">
              <GearIcon />
            </button>
            <div className="dropdown-content z-10 w-40 rounded-box bg-base-200 p-4">
              <div className="flex flex-col gap-2">
                <span className="font-semibold">Visibility</span>
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <label
                      className="flex items-center gap-2 text-sm"
                      key={col.id}
                    >
                      <input
                        checked={col.getIsVisible()}
                        className="checkbox checkbox-sm"
                        onChange={col.getToggleVisibilityHandler()}
                        type="checkbox"
                      />
                      <span>{col.columnDef.header as string}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {activeFilters.map((badge) => (
            <button
              className="btn btn-soft btn-xs"
              key={badge.id + badge.value}
              onClick={badge.clear}
              type="button"
            >
              <span>{badge.value}</span>
              <XIcon />
            </button>
          ))}
          <button
            className="btn btn-ghost btn-xs"
            onClick={clearAllFilters}
            type="button"
          >
            {tAction("clearAll")}
          </button>
        </div>
      )}

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
