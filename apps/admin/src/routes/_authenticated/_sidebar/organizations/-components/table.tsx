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
import { EmptyValue } from "@/components/display/empty-value";
import { Link } from "@/components/display/link";
import { BatchButton, BatchToolbar } from "@/components/table/batch-buttons";
import { FiltersButton } from "@/components/table/filters-button";
import {
  DATE_FILTER_OPTIONS,
  FiltersRadio,
} from "@/components/table/filters-radio";
import { FiltersSelect } from "@/components/table/filters-select";
import { VisibilityButton } from "@/components/table/visibility-button";
import {
  CatalogPartition,
  OrganizationCategory,
  UserRole,
} from "@/generated/graphql/graphql";
import { useActiveFilters } from "@/hooks/custom/use-active-filters";
import { usePersistedState } from "@/hooks/custom/use-persisted-state";
import type { OrganizationRow } from "@/hooks/queries/organizations";
import {
  isCatalogRowMutationReadOnly,
  selectionHasReadOnlyCatalogRows,
} from "@/lib/catalog-mutation-access";
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

const categoryParser = parseAsShape(z.string()).withOptions(persistentOptions);
const partitionParser = parseAsShape(z.string()).withOptions(persistentOptions);
const createdAtParser = parseAsShape(z.string()).withOptions(persistentOptions);
const updatedAtParser = parseAsShape(z.string()).withOptions(persistentOptions);

const CATEGORY_LABELS: Array<{ value: OrganizationCategory; label: string }> = [
  { label: "Company", value: OrganizationCategory.Company },
  { label: "School", value: OrganizationCategory.School },
  { label: "Other", value: OrganizationCategory.Other },
];

const PARTITION_LABELS: Array<{ value: CatalogPartition; label: string }> = [
  { label: "Global", value: CatalogPartition.Global },
  { label: "Local", value: CatalogPartition.Local },
];

const RESTRICTED_COLUMNS: RestrictedColumns = {
  [UserRole.SuperAdmin]: ["owner"],
};

const columnHelper = createColumnHelper<OrganizationRow>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  onEdit: (organization: OrganizationRow) => void,
  onDisable: (organization: OrganizationRow) => void,
  onEnable: (organization: OrganizationRow) => void,
  onRemove: (organization: OrganizationRow) => void,
  onView: (organization: OrganizationRow) => void,
  opts: { isSuperAdmin: boolean }
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
  columnHelper.accessor("slug", {
    header: "Slug",
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("category", {
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
    enableColumnFilter: true,
    enableGlobalFilter: false,
    enableSorting: false,
    filterFn: "equals",
    header: "Category",
  }),
  columnHelper.accessor("partition", {
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
    enableColumnFilter: true,
    enableGlobalFilter: false,
    enableSorting: false,
    filterFn: "equals",
    header: "Partition",
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
    header: "Status",
  }),
  columnHelper.accessor("website", {
    cell: (data) => {
      const url = data.getValue();
      if (!url) return <EmptyValue />;
      return (
        <a className="link" href={url} rel="noreferrer" target="_blank">
          {url}
        </a>
      );
    },
    enableGlobalFilter: false,
    header: "Website",
  }),
  columnHelper.accessor("logo", {
    cell: (data) => {
      const url = data.getValue();
      if (!url) return <EmptyValue />;
      return <Link href={url} />;
    },
    enableGlobalFilter: false,
    enableSorting: false,
    header: "Logo",
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
    enableHiding: false,
    id: "actions",
  }),
];

interface OrganizationsTableProps {
  data: OrganizationRow[];
  onDisable: (organization: OrganizationRow) => void;
  onEdit: (organization: OrganizationRow) => void;
  onEnable: (organization: OrganizationRow) => void;
  onMultiDisable: (organizations: OrganizationRow[]) => void;
  onMultiEdit: (organizations: OrganizationRow[]) => void;
  onMultiEnable: (organizations: OrganizationRow[]) => void;
  onMultiRemove: (organizations: OrganizationRow[]) => void;
  onMultiView: (organizations: OrganizationRow[]) => void;
  onRemove: (organization: OrganizationRow) => void;
  onView: (organization: OrganizationRow) => void;
}

export function OrganizationsTable({
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
}: OrganizationsTableProps) {
  const { t: tAction } = useTranslation("actions");
  const { t: tTable } = useTranslation("tables");
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
      "organizations-table-columns",
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
        setState: setCategory,
        state: category,
      },
      {
        id: "partition",
        label: "Partition",
        setState: setPartition,
        state: partition,
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

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSort((currentSort) =>
      typeof updater === "function" ? updater(currentSort) : updater
    );
  };

  const table = useReactTable({
    columns: getColumns(onEdit, onDisable, onEnable, onRemove, onView, {
      isSuperAdmin,
    }),
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

  const selected = data.filter((organization) => rowSelection[organization.id]);
  const selectedHasReadOnlyRows = selectionHasReadOnlyCatalogRows(
    selected,
    isSuperAdmin
  );

  const categoryFacets = getUniqueFacets(
    table.getColumn("category")!.getFacetedUniqueValues(),
    CATEGORY_LABELS
  );

  const partitionFacets = getUniqueFacets(
    table.getColumn("partition")!.getFacetedUniqueValues(),
    PARTITION_LABELS
  );

  return (
    <div className="flex flex-col gap-4">
      <BatchToolbar>
        <BatchButton
          disabled={!selected?.length || selectedHasReadOnlyRows}
          icon={<PencilIcon />}
          label={tAction("updateSelected", { count: selected.length })}
          onClick={() => onMultiEdit(selected)}
        />
        <BatchButton
          disabled={!selected?.length}
          icon={<EyeIcon />}
          label={tAction("viewSelected", { count: selected.length })}
          onClick={() => onMultiView(selected)}
        />
        {isSuperAdmin && (
          <>
            <BatchButton
              className="btn-success"
              disabled={!selected?.length || selectedHasReadOnlyRows}
              icon={<CheckCircleIcon />}
              label={tAction("enableSelected", { count: selected.length })}
              onClick={() => onMultiEnable(selected)}
            />
            <BatchButton
              className="btn-error"
              disabled={!selected?.length || selectedHasReadOnlyRows}
              icon={<XCircleIcon />}
              label={tAction("disableSelected", { count: selected.length })}
              onClick={() => onMultiDisable(selected)}
            />
          </>
        )}
        <BatchButton
          className="btn-error"
          disabled={!selected?.length || selectedHasReadOnlyRows}
          icon={<TrashSimpleIcon />}
          label={tAction("removeSelected", { count: selected.length })}
          onClick={() => onMultiRemove(selected)}
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
            allLabel="All partitions"
            onChange={setPartition}
            options={partitionFacets}
            value={partition}
          />

          <FiltersSelect
            allLabel="All categories"
            onChange={setCategory}
            options={categoryFacets}
            value={category}
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
