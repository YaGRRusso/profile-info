import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  EyeIcon,
  GearIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  SlidersHorizontalIcon,
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
import { BadgeList } from "@/components/display/badge-list";
import { EmptyValue } from "@/components/display/empty-value";
import { CatalogPartition, UserRole } from "@/generated/graphql/graphql";
import { useActiveFilters } from "@/hooks/custom/use-active-filters";
import { usePersistedState } from "@/hooks/custom/use-persisted-state";
import type { SkillRow } from "@/hooks/queries/skills";
import {
  isCatalogRowMutationReadOnly,
  selectionHasReadOnlyCatalogRows,
} from "@/lib/catalog-mutation-access";
import { cn } from "@/lib/cn";
import { EMPTY_MARKER, isEmptyValue } from "@/lib/empty-value";
import { getUniqueFacets } from "@/lib/facets";
import { i18nLabel } from "@/lib/i18n";
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
  z.array(z.object({ id: z.string(), desc: z.boolean() }))
)
  .withDefault([])
  .withOptions(persistentOptions);

const categoryParser = parseAsShape(z.string()).withOptions(persistentOptions);
const partitionParser = parseAsShape(z.string()).withOptions(persistentOptions);
const createdAtParser = parseAsShape(z.string()).withOptions(persistentOptions);
const updatedAtParser = parseAsShape(z.string()).withOptions(persistentOptions);

const DATE_OPTIONS = [
  { value: "", label: "Any date" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
];

const PARTITION_LABELS: Array<{ value: CatalogPartition; label: string }> = [
  { value: CatalogPartition.Global, label: "Global" },
  { value: CatalogPartition.Local, label: "Local" },
];

const RESTRICTED_COLUMNS: RestrictedColumns = {
  [UserRole.SuperAdmin]: ["owner"],
};

const columnHelper = createColumnHelper<SkillRow>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  locale: string,
  onEdit: (skill: SkillRow) => void,
  onDisable: (skill: SkillRow) => void,
  onEnable: (skill: SkillRow) => void,
  onRemove: (skill: SkillRow) => void,
  onView: (skill: SkillRow) => void,
  opts: { isSuperAdmin: boolean }
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
  columnHelper.accessor("slug", {
    header: "Slug",
  }),
  columnHelper.accessor((row) => i18nLabel(row, locale), {
    id: `title-${locale}`,
    header: "Title",
    cell: (data) => {
      const value = data.getValue();
      if (isEmptyValue(value)) return <EmptyValue />;
      return value;
    },
  }),
  columnHelper.accessor("category", {
    header: "Category",
    enableColumnFilter: true,
    enableSorting: false,
    enableGlobalFilter: false,
    filterFn: "equals",
    cell: (data) => {
      const value = data.getValue();
      if (!value) return <EmptyValue />;
      return <BadgeList values={[value]} />;
    },
  }),
  columnHelper.accessor("partition", {
    header: "Partition",
    enableColumnFilter: true,
    enableSorting: false,
    enableGlobalFilter: false,
    filterFn: "equals",
    cell: (data) => (
      <span
        className={cn(
          "badge badge-sm badge-soft",
          data.getValue() === CatalogPartition.Global
            ? "badge-info"
            : "badge-warning"
        )}
      >
        {data.getValue() === CatalogPartition.Global ? "Global" : "Local"}
      </span>
    ),
  }),
  columnHelper.accessor("disabled", {
    header: "Status",
    enableGlobalFilter: false,
    enableSorting: false,
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
  }),
  columnHelper.accessor((row) => row.i18n.map((entry) => entry.locale), {
    id: "languages",
    header: "Languages",
    enableGlobalFilter: false,
    enableSorting: false,
    cell: (data) => <BadgeList values={data.getValue()} />,
  }),
  columnHelper.accessor((row) => row.owner?.nickname ?? "", {
    id: "owner",
    header: "Owner",
    enableGlobalFilter: false,
    enableSorting: false,
    cell: (data) => {
      const value = data.getValue();
      if (isEmptyValue(value)) return <EmptyValue />;
      return <span className="badge badge-soft badge-sm">{value}</span>;
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
    cell: ({ row }) => {
      const isGlobal = row.original.partition === CatalogPartition.Global;
      const readOnly = isCatalogRowMutationReadOnly(
        row.original.partition,
        opts.isSuperAdmin
      );

      const actions: ReactNode[] = [
        <button
          className="btn btn-sm btn-square btn-ghost"
          disabled={readOnly}
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
      ];

      if (isGlobal) {
        if (row.original.disabled) {
          actions.push(
            <button
              className="btn btn-sm btn-square btn-ghost btn-success"
              disabled={readOnly}
              key="enable"
              onClick={() => onEnable(row.original)}
              type="button"
            >
              <CheckCircleIcon />
            </button>
          );
        }
        if (!row.original.disabled) {
          actions.push(
            <button
              className="btn btn-sm btn-square btn-ghost btn-error"
              disabled={readOnly}
              key="disable"
              onClick={() => onDisable(row.original)}
              type="button"
            >
              <XCircleIcon />
            </button>
          );
        }
      }
      if (!isGlobal) {
        actions.push(
          <button
            className="btn btn-sm btn-square btn-ghost btn-error"
            disabled={readOnly}
            key="remove"
            onClick={() => onRemove(row.original)}
            type="button"
          >
            <TrashSimpleIcon />
          </button>
        );
      }

      return (
        <div className="flex items-center justify-end gap-1">{actions}</div>
      );
    },
  }),
];

interface SkillsTableProps {
  data: SkillRow[];
  onDisable: (skill: SkillRow) => void;
  onEdit: (skill: SkillRow) => void;
  onEnable: (skill: SkillRow) => void;
  onMultiDisable: (skills: SkillRow[]) => void;
  onMultiEdit: (skills: SkillRow[]) => void;
  onMultiEnable: (skills: SkillRow[]) => void;
  onMultiRemove: (skills: SkillRow[]) => void;
  onMultiView: (skills: SkillRow[]) => void;
  onRemove: (skill: SkillRow) => void;
  onView: (skill: SkillRow) => void;
}

export function SkillsTable({
  data,
  onEdit,
  onDisable,
  onEnable,
  onRemove,
  onView,
  onMultiEdit,
  onMultiView,
  onMultiDisable,
  onMultiEnable,
  onMultiRemove,
}: SkillsTableProps) {
  const { t: tAction } = useTranslation("actions");
  const { t: tTable } = useTranslation("tables");
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const userRole = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const [searchQuery, setSearchQuery] = useQueryState("query", queryParser);
  const [sort, setSort] = useQueryState("sort", sortParser);
  const [category, setCategory] = useQueryState("category", categoryParser);
  const [partition, setPartition] = useQueryState("partition", partitionParser);
  const [createdAt, setCreatedAt] = useQueryState("createdAt", createdAtParser);
  const [updatedAt, setUpdatedAt] = useQueryState("updatedAt", updatedAtParser);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>(
      "skills-table-columns",
      DEFAULT_META_COLUMN_VISIBILITY
    );

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const activeFilters: ColumnFiltersState = [];
    if (category) activeFilters.push({ id: "category", value: category });
    if (partition) activeFilters.push({ id: "partition", value: partition });
    if (createdAt) activeFilters.push({ id: "createdAt", value: createdAt });
    if (updatedAt) activeFilters.push({ id: "updatedAt", value: updatedAt });
    return activeFilters;
  }, [category, partition, createdAt, updatedAt]);

  const { filters: activeFilters, clearAll: clearAllFilters } =
    useActiveFilters([
      {
        id: "category",
        label: "Category",
        state: category,
        setState: setCategory,
      },
      {
        id: "partition",
        label: "Partition",
        state: partition,
        setState: setPartition,
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
    ]);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSort((currentSort) =>
      typeof updater === "function" ? updater(currentSort) : updater
    );
  };

  // getCoreRowModel - required
  // getFilteredRowModel - use when using filters
  // getSortedRowModel - use when using sorting
  // getPaginationRowModel - use when using pagination
  // getFacetedRowModel - use when using either of the below
  // getFacetedUniqueValues - use to get a Map<value, count> for a column (e.g. for showing filter options with counts) -
  // getFacetedMinMaxValues - use to get a [min, max] for a column (e.g. for setting min and max values on a range slider filter)

  const table = useReactTable({
    data,
    columns: getColumns(locale, onEdit, onDisable, onEnable, onRemove, onView, {
      isSuperAdmin,
    }),
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
      columnVisibility: getRestrictedVisibility(
        columnVisibility,
        RESTRICTED_COLUMNS,
        userRole
      ),
    },
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const selected = data.filter((skill) => rowSelection[skill.id]);
  const selectedHasReadOnlyRows = selectionHasReadOnlyCatalogRows(
    selected,
    isSuperAdmin
  );

  const categoryFacets = getUniqueFacets(
    table.getColumn("category")!.getFacetedUniqueValues()
  ).filter(({ value }) => value != null && value !== "");

  const partitionFacets = getUniqueFacets(
    table.getColumn("partition")!.getFacetedUniqueValues(),
    PARTITION_LABELS
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="-mb-2 flex justify-end">
        <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto">
          <button
            className="btn btn-ghost btn-sm"
            disabled={!selected?.length || selectedHasReadOnlyRows}
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
          {isSuperAdmin && (
            <>
              <button
                className="btn btn-ghost btn-sm btn-success"
                disabled={!selected?.length || selectedHasReadOnlyRows}
                onClick={() => onMultiEnable(selected)}
                type="button"
              >
                <CheckCircleIcon />
                <span>
                  {tAction("enableSelected", { count: selected.length })}
                </span>
              </button>
              <button
                className="btn btn-ghost btn-sm btn-error"
                disabled={!selected?.length || selectedHasReadOnlyRows}
                onClick={() => onMultiDisable(selected)}
                type="button"
              >
                <XCircleIcon />
                <span>
                  {tAction("disableSelected", { count: selected.length })}
                </span>
              </button>
            </>
          )}
          <button
            className="btn btn-ghost btn-sm btn-error"
            disabled={!selected?.length || selectedHasReadOnlyRows}
            onClick={() => onMultiRemove(selected)}
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
            disabled={!partitionFacets.length}
            onChange={(event) => setPartition(event.target.value || null)}
            value={partition ?? ""}
          >
            <option value="">All partitions</option>
            {partitionFacets.map(({ value, label, count }) => (
              <option key={value} value={value}>
                {label} ({count})
              </option>
            ))}
          </select>

          <select
            className="select flex-1 bg-base-200"
            disabled={!categoryFacets.length}
            onChange={(event) => setCategory(event.target.value || null)}
            value={category ?? ""}
          >
            <option value="">All categories</option>
            {categoryFacets.map(({ value, label, count }) => (
              <option key={String(value)} value={String(value)}>
                {label || EMPTY_MARKER} ({count})
              </option>
            ))}
          </select>

          <div className="dropdown dropdown-bottom dropdown-end">
            <button className="btn btn-square btn-soft" type="button">
              <SlidersHorizontalIcon />
            </button>
            <div className="dropdown-content z-10 w-52 rounded-box bg-base-200 p-4">
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
                  .filter((col) =>
                    canSeeColumn(RESTRICTED_COLUMNS, col.id, userRole)
                  )
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
