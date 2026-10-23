import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashSimpleIcon,
  XCircleIcon,
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
import { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Avatar } from "@/components/display/avatar";
import { EmptyValue } from "@/components/display/empty-value";
import { ViewCell } from "@/components/display/view-cell";
import { BatchButton, BatchToolbar } from "@/components/table/batch-buttons";
import { FiltersButton } from "@/components/table/filters-button";
import {
  DATE_FILTER_OPTIONS,
  FiltersRadio,
} from "@/components/table/filters-radio";
import { FiltersSelect } from "@/components/table/filters-select";
import { VisibilityButton } from "@/components/table/visibility-button";
import { UserRole } from "@/generated/graphql/graphql";
import { useActiveFilters } from "@/hooks/custom/use-active-filters";
import { usePersistedState } from "@/hooks/custom/use-persisted-state";
import type { UserRow } from "@/hooks/queries/users";
import { cn } from "@/lib/cn";
import { isEmptyValue } from "@/lib/empty-value";
import { getUniqueFacets } from "@/lib/facets";
import { parseAsShape } from "@/lib/parsers";
import { DEFAULT_META_COLUMN_VISIBILITY } from "@/lib/table-columns";
import { dateRangeFilter } from "@/lib/table-filters";
import { useAuthStore } from "@/stores/auth";

const persistentOptions = { clearOnDefault: true, history: "push" as const };
const queryParser = parseAsShape(z.string())
  .withDefault("")
  .withOptions({
    ...persistentOptions,
    limitUrlUpdates: { method: "debounce", timeMs: 500 },
  });
const sortParser = parseAsShape(
  z.array(z.object({ desc: z.boolean(), id: z.string() }))
)
  .withDefault([])
  .withOptions(persistentOptions);
const roleParser = parseAsShape(z.string()).withOptions(persistentOptions);
const disabledParser = parseAsShape(z.string()).withOptions(persistentOptions);
const createdAtParser = parseAsShape(z.string()).withOptions(persistentOptions);
const updatedAtParser = parseAsShape(z.string()).withOptions(persistentOptions);
const columnHelper = createColumnHelper<UserRow>();

const ROLE_OPTIONS = Object.values(UserRole).map((role) => ({
  label: role,
  value: role,
}));
const STATUS_OPTIONS = [
  { label: "Active", value: "false" },
  { label: "Disabled", value: "true" },
];

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  onEdit: (user: UserRow) => void,
  onDisable: (user: UserRow) => void,
  onEnable: (user: UserRow) => void,
  onRemove: (user: UserRow) => void,
  onView: (user: UserRow) => void
) => [
  columnHelper.display({
    cell: ({ row }) => (
      <input
        checked={row.getIsSelected()}
        className="checkbox checkbox-sm"
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
  columnHelper.accessor("avatar", {
    cell: ({ row }) => (
      <Avatar
        avatar={row.original.avatar}
        className="size-8"
        name={row.original.name}
      />
    ),
    enableGlobalFilter: false,
    enableSorting: false,
    header: "Avatar",
  }),
  columnHelper.accessor("name", {
    cell: (data) => {
      const value = data.getValue();
      if (isEmptyValue(value)) return <EmptyValue />;
      return (
        <ViewCell onClick={() => onView(data.row.original)}>{value}</ViewCell>
      );
    },
    header: "Name",
  }),
  columnHelper.accessor("nickname", { header: "Nickname" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("role", {
    cell: (data) => (
      <span className="badge badge-sm badge-soft">{data.getValue()}</span>
    ),
    enableGlobalFilter: false,
    enableSorting: false,
    filterFn: "equals",
    header: "Role",
  }),
  columnHelper.accessor("disabled", {
    cell: (data) => (
      <span
        className={cn(
          "badge badge-sm badge-soft",
          data.getValue() ? "badge-error" : "badge-success"
        )}
      >
        {data.getValue() ? "Disabled" : "Active"}
      </span>
    ),
    enableGlobalFilter: false,
    enableSorting: false,
    filterFn: "equals",
    header: "Status",
  }),
  columnHelper.accessor((row) => row.ownedCounts.experiences, {
    enableGlobalFilter: false,
    header: "Experiences",
    id: "experiences",
  }),
  columnHelper.accessor((row) => row.ownedCounts.educations, {
    enableGlobalFilter: false,
    header: "Educations",
    id: "educations",
  }),
  columnHelper.accessor((row) => row.ownedCounts.courses, {
    enableGlobalFilter: false,
    header: "Courses",
    id: "courses",
  }),
  columnHelper.accessor((row) => row.ownedCounts.projects, {
    enableGlobalFilter: false,
    header: "Projects",
    id: "projects",
  }),
  columnHelper.accessor("createdAt", {
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    enableGlobalFilter: false,
    filterFn: dateRangeFilter,
    header: "Created",
    sortingFn: "datetime",
  }),
  columnHelper.accessor("updatedAt", {
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    enableGlobalFilter: false,
    filterFn: dateRangeFilter,
    header: "Updated",
    sortingFn: "datetime",
  }),
  columnHelper.display({
    cell: ({ row }) => {
      const canRemove = row.original.role !== UserRole.SuperAdmin;
      const actions: ReactNode[] = [
        <button
          className="btn btn-sm btn-square btn-ghost"
          key="edit"
          onClick={() => onEdit(row.original)}
          type="button"
        >
          <PencilIcon />
        </button>,
        <button
          className="btn btn-sm btn-square btn-ghost"
          key="view"
          onClick={() => onView(row.original)}
          type="button"
        >
          <EyeIcon />
        </button>,
        row.original.disabled ? (
          <button
            className="btn btn-sm btn-square btn-ghost btn-success"
            key="enable"
            onClick={() => onEnable(row.original)}
            type="button"
          >
            <CheckCircleIcon />
          </button>
        ) : (
          <button
            className="btn btn-sm btn-square btn-ghost btn-error"
            key="disable"
            onClick={() => onDisable(row.original)}
            type="button"
          >
            <XCircleIcon />
          </button>
        ),
        <button
          className="btn btn-sm btn-square btn-ghost btn-error"
          disabled={!canRemove}
          key="remove"
          onClick={() => onRemove(row.original)}
          type="button"
        >
          <TrashSimpleIcon />
        </button>,
      ];
      return (
        <div className="flex items-center justify-end gap-1">{actions}</div>
      );
    },
    enableHiding: false,
    id: "actions",
  }),
];

interface UsersTableProps {
  data: UserRow[];
  onDisable: (users: UserRow) => void;
  onEdit: (users: UserRow) => void;
  onEnable: (users: UserRow) => void;
  onMultiDisable: (users: UserRow[]) => void;
  onMultiEdit: (users: UserRow[]) => void;
  onMultiEnable: (users: UserRow[]) => void;
  onMultiRemove: (users: UserRow[]) => void;
  onMultiView: (users: UserRow[]) => void;
  onRemove: (users: UserRow) => void;
  onView: (users: UserRow) => void;
}

export function UsersTable(props: UsersTableProps) {
  const { t: tAction } = useTranslation("actions");
  const { t: tTable } = useTranslation("tables");
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [query, setQuery] = useQueryState("query", queryParser);
  const [sort, setSort] = useQueryState("sort", sortParser);
  const [role, setRole] = useQueryState("role", roleParser);
  const [disabled, setDisabled] = useQueryState("disabled", disabledParser);
  const [createdAt, setCreatedAt] = useQueryState("createdAt", createdAtParser);
  const [updatedAt, setUpdatedAt] = useQueryState("updatedAt", updatedAtParser);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>(
      "users-table-columns",
      DEFAULT_META_COLUMN_VISIBILITY
    );
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (role) filters.push({ id: "role", value: role });
    if (disabled) filters.push({ id: "disabled", value: disabled === "true" });
    if (createdAt) filters.push({ id: "createdAt", value: createdAt });
    if (updatedAt) filters.push({ id: "updatedAt", value: updatedAt });
    return filters;
  }, [role, disabled, createdAt, updatedAt]);
  const { filters: activeFilters, clearAll: clearAllFilters } =
    useActiveFilters([
      { id: "role", label: "Role", setState: setRole, state: role },
      {
        id: "disabled",
        label: "Status",
        setState: setDisabled,
        state: disabled,
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
    ]);
  const data = useMemo(
    () => props.data.filter((user) => user.id !== currentUserId),
    [props.data, currentUserId]
  );
  const table = useReactTable({
    columns: getColumns(
      props.onEdit,
      props.onDisable,
      props.onEnable,
      props.onRemove,
      props.onView
    ),
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
    onSortingChange: ((updater) =>
      setSort((current) =>
        typeof updater === "function" ? updater(current) : updater
      )) as OnChangeFn<SortingState>,
    state: {
      columnFilters,
      columnVisibility,
      globalFilter: query,
      rowSelection,
      sorting: sort,
    },
  });
  const selected = data.filter((user) => rowSelection[user.id]);
  const selectionHasSuperAdmin = selected.some(
    (user) => user.role === UserRole.SuperAdmin
  );
  const roleFacets = getUniqueFacets(
    table.getColumn("role")?.getFacetedUniqueValues(),
    ROLE_OPTIONS
  );
  const statusFacets = getUniqueFacets(
    table.getColumn("disabled")?.getFacetedUniqueValues(),
    STATUS_OPTIONS
  );

  return (
    <div className="flex flex-col gap-4">
      <BatchToolbar>
        <BatchButton
          disabled={!selected.length}
          icon={<PencilIcon />}
          label={tAction("updateSelected", { count: selected.length })}
          onClick={() => props.onMultiEdit(selected)}
        />
        <BatchButton
          disabled={!selected.length}
          icon={<EyeIcon />}
          label={tAction("viewSelected", { count: selected.length })}
          onClick={() => props.onMultiView(selected)}
        />
        <BatchButton
          className="btn-success"
          disabled={!selected.length}
          icon={<CheckCircleIcon />}
          label={tAction("enableSelected", { count: selected.length })}
          onClick={() => props.onMultiEnable(selected)}
        />
        <BatchButton
          className="btn-error"
          disabled={!selected.length}
          icon={<XCircleIcon />}
          label={tAction("disableSelected", { count: selected.length })}
          onClick={() => props.onMultiDisable(selected)}
        />
        <BatchButton
          className="btn-error"
          disabled={!selected.length || selectionHasSuperAdmin}
          icon={<TrashSimpleIcon />}
          label={tAction("removeSelected", { count: selected.length })}
          onClick={() => props.onMultiRemove(selected)}
        />
      </BatchToolbar>
      <div className="flex flex-wrap items-center gap-2">
        <label className="input min-w-64 flex-1 bg-base-200">
          <MagnifyingGlassIcon className="opacity-md" />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tTable("search")}
            type="search"
            value={query}
          />
        </label>
        <div className="flex min-w-64 flex-1 items-center gap-2">
          <FiltersSelect
            allLabel="All roles"
            onChange={setRole}
            options={roleFacets}
            value={role}
          />
          <FiltersSelect
            allLabel="All statuses"
            onChange={setDisabled}
            options={statusFacets}
            value={disabled}
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
          </FiltersButton>
          <VisibilityButton columns={table.getAllColumns()} />
        </div>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {activeFilters.map((badge) => (
            <button
              className="btn btn-soft btn-xs"
              key={badge.id + badge.value}
              onClick={badge.clear}
              type="button"
            >
              {badge.value}
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
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
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
