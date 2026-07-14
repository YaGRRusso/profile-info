import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
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
import { EmptyValue } from "@/components/display/empty-value";
import { BatchButton, BatchToolbar } from "@/components/table/batch-buttons";
import { FiltersButton } from "@/components/table/filters-button";
import {
  DATE_FILTER_OPTIONS,
  FiltersRadio,
} from "@/components/table/filters-radio";
import { FiltersSelect } from "@/components/table/filters-select";
import { VisibilityButton } from "@/components/table/visibility-button";
import { ApiTokenPermission, UserRole } from "@/generated/graphql/graphql";
import { useActiveFilters } from "@/hooks/custom/use-active-filters";
import { usePersistedState } from "@/hooks/custom/use-persisted-state";
import type { ApiTokenRow } from "@/hooks/queries/api-tokens";
import { cn } from "@/lib/cn";
import { isEmptyValue } from "@/lib/empty-value";
import { getUniqueFacets } from "@/lib/facets";
import { parseAsShape } from "@/lib/parsers";
import {
  canSeeColumn,
  DEFAULT_META_COLUMN_VISIBILITY,
  getRestrictedVisibility,
  type RestrictedColumns,
} from "@/lib/table-columns";
import { dateRangeFilter } from "@/lib/table-filters";
import { useAuthStore } from "@/stores/auth";

const debouncedUrlUpdates = { method: "debounce" as const, timeMs: 500 };
const persistentOptions = { clearOnDefault: true, history: "push" as const };

const queryParser = parseAsShape(z.string())
  .withDefault("")
  .withOptions({ ...persistentOptions, limitUrlUpdates: debouncedUrlUpdates });

const sortParser = parseAsShape(
  z.array(z.object({ desc: z.boolean(), id: z.string() }))
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
  { label: "QUERY", value: ApiTokenPermission.Query },
  { label: "MUTATE", value: ApiTokenPermission.Mutate },
];

const STATUS_LABELS: Array<{
  value: "active" | "expired" | "no-expiry";
  label: string;
}> = [
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
  { label: "No expiry", value: "no-expiry" },
];

const RESTRICTED_COLUMNS: RestrictedColumns = {
  [UserRole.SuperAdmin]: ["owner"],
};

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
    cell: ({ row }) => (
      <input
        checked={row.getIsSelected()}
        className="checkbox checkbox-sm"
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        type="checkbox"
      />
    ),
    enableHiding: false,
    header: ({ table }) => (
      <input
        checked={table.getIsAllRowsSelected()}
        className="checkbox checkbox-sm"
        onChange={table.getToggleAllRowsSelectedHandler()}
        type="checkbox"
      />
    ),
    id: "select",
  }),
  columnHelper.accessor("id", {
    cell: (data) => (
      <span className="font-mono text-xs">{data.getValue()}</span>
    ),
    enableGlobalFilter: false,
    enableSorting: false,
    header: "ID",
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor((row) => tokenStatus(row.expiresAt), {
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
    enableColumnFilter: true,
    enableGlobalFilter: false,
    enableSorting: false,
    filterFn: "equals",
    header: "Status",
    id: "status",
  }),
  columnHelper.accessor("permissions", {
    cell: (data) => (
      <BadgeList
        values={data.getValue().map((permission) => permission.toString())}
      />
    ),
    enableColumnFilter: true,
    enableGlobalFilter: false,
    enableSorting: false,
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      return row.original.permissions.includes(
        filterValue as ApiTokenPermission
      );
    },
    header: "Permissions",
  }),
  columnHelper.accessor((row) => row.owner?.nickname ?? "", {
    cell: (data) => {
      const value = data.getValue();
      if (isEmptyValue(value)) return <EmptyValue />;
      return <span className="badge badge-soft badge-sm">{value}</span>;
    },
    enableGlobalFilter: false,
    enableSorting: false,
    header: "Owner",
    id: "owner",
  }),
  columnHelper.accessor("expiresAt", {
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? new Date(value).toLocaleDateString() : "Never";
    },
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      const expiresAt = row.getValue<string | null | undefined>(columnId);
      if (!filterValue) return true;
      if (!expiresAt) return false;
      return dateRangeFilter(row, columnId, filterValue);
    },
    header: "Expires",
    sortingFn: "datetime",
  }),
  columnHelper.accessor("createdAt", {
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: dateRangeFilter,
    header: "Created",
    sortingFn: "datetime",
  }),
  columnHelper.accessor("updatedAt", {
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: dateRangeFilter,
    header: "Updated",
    sortingFn: "datetime",
  }),
  columnHelper.display({
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
    enableHiding: false,
    id: "actions",
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
  const userRole = useAuthStore((state) => state.user?.role);
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
        setState: setPermission,
        state: permission,
      },
      {
        id: "status",
        label: "Status",
        setState: setStatus,
        state: status,
      },
      {
        id: "createdAt",
        label: "Created",
        setState: setCreatedAt,
        state: createdAt,
      },
      {
        id: "updatedAt",
        label: "Updated",
        setState: setUpdatedAt,
        state: updatedAt,
      },
      {
        id: "expiresAt",
        label: "Expires",
        setState: setExpiresAt,
        state: expiresAt,
      },
    ]);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSort((currentSort) =>
      typeof updater === "function" ? updater(currentSort) : updater
    );
  };

  const table = useReactTable({
    columns: getColumns(onEdit, onDelete, onView),
    data,
    getCoreRowModel: getCoreRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    state: {
      columnFilters,
      columnVisibility: getRestrictedVisibility(
        columnVisibility,
        RESTRICTED_COLUMNS,
        userRole
      ),
      globalFilter: searchQuery,
      rowSelection,
      sorting: sort,
    },
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
      <BatchToolbar>
        <BatchButton
          disabled={!selected.length}
          icon={<PencilIcon />}
          label={tAction("updateSelected", { count: selected.length })}
          onClick={() => onMultiEdit(selected)}
        />
        <BatchButton
          disabled={!selected.length}
          icon={<EyeIcon />}
          label={tAction("viewSelected", { count: selected.length })}
          onClick={() => onMultiView(selected)}
        />
        <BatchButton
          className="btn-error"
          disabled={!selected.length}
          icon={<TrashSimpleIcon />}
          label={tAction("removeSelected", { count: selected.length })}
          onClick={() => onMultiDelete(selected)}
        />
      </BatchToolbar>

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
          <FiltersSelect
            allLabel="All permissions"
            onChange={setPermission}
            options={permissionFacets}
            value={permission}
          />

          <FiltersSelect
            allLabel="All statuses"
            onChange={setStatus}
            options={statusFacets}
            value={status}
          />

          <FiltersButton>
            <FiltersRadio
              label="Created"
              name="created"
              onChange={setCreatedAt}
              options={DATE_FILTER_OPTIONS}
              value={createdAt}
            />
            <div className="divider" />
            <FiltersRadio
              label="Updated"
              name="updated"
              onChange={setUpdatedAt}
              options={DATE_FILTER_OPTIONS}
              value={updatedAt}
            />
            <div className="divider" />
            <FiltersRadio
              label="Expires"
              name="expires"
              onChange={setExpiresAt}
              options={DATE_FILTER_OPTIONS}
              value={expiresAt}
            />
          </FiltersButton>

          <VisibilityButton
            columns={table
              .getAllColumns()
              .filter((col) =>
                canSeeColumn(RESTRICTED_COLUMNS, col.id, userRole)
              )}
          />
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
