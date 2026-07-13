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
import { FiltersRange } from "@/components/table/filters-range";
import { FiltersSelect } from "@/components/table/filters-select";
import { VisibilityButton } from "@/components/table/visibility-button";
import { ExperienceCategory, UserRole } from "@/generated/graphql/graphql";
import { useActiveFilters } from "@/hooks/custom/use-active-filters";
import { usePersistedState } from "@/hooks/custom/use-persisted-state";
import { useStableValue } from "@/hooks/custom/use-stable-value";
import type { ExperienceRow } from "@/hooks/queries/experiences";
import { cn } from "@/lib/cn";
import { isEmptyValue } from "@/lib/empty-value";
import { getMinMaxFacets, getUniqueFacets } from "@/lib/facets";
import { i18nLabel } from "@/lib/i18n";
import { parseAsShape } from "@/lib/parsers";
import {
  canSeeColumn,
  DEFAULT_META_COLUMN_VISIBILITY,
  getRestrictedVisibility,
  RestrictedColumns,
} from "@/lib/table-columns";
import { dateRangeFilter, numberRangeFilter } from "@/lib/table-filters";
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
const createdAtParser = parseAsShape(z.string()).withOptions(persistentOptions);
const updatedAtParser = parseAsShape(z.string()).withOptions(persistentOptions);

const relevanceParser = parseAsShape(
  z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  })
).withOptions({
  ...persistentOptions,
  limitUrlUpdates: debouncedUrlUpdates,
});

const CATEGORY_LABELS: Array<{ value: ExperienceCategory; label: string }> = [
  { value: ExperienceCategory.FullTime, label: "Full Time" },
  { value: ExperienceCategory.PartTime, label: "Part Time" },
  { value: ExperienceCategory.Freelance, label: "Freelance" },
  { value: ExperienceCategory.Volunteer, label: "Volunteer" },
];

const RESTRICTED_COLUMNS: RestrictedColumns = {
  [UserRole.SuperAdmin]: ["owner"],
};

const columnHelper = createColumnHelper<ExperienceRow>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  locale: string,
  onEdit: (experience: ExperienceRow) => void,
  onDelete: (experience: ExperienceRow) => void,
  onView: (experience: ExperienceRow) => void
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
  columnHelper.accessor(
    (row) => {
      const role = row.roles?.[0];
      return role ? i18nLabel({ i18n: role.i18n }, locale) : "";
    },
    {
      id: `title-${locale}`,
      header: "Title",
      cell: (data) => {
        const value = data.getValue();
        if (isEmptyValue(value)) return <EmptyValue />;
        return value;
      },
    }
  ),
  columnHelper.accessor("relevance", {
    header: "Relevance",
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: numberRangeFilter,
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.organization?.name ?? "", {
    id: "organization",
    header: "Organization",
    cell: (data) => <BadgeList values={[data.getValue()]} />,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    enableColumnFilter: true,
    enableSorting: false,
    enableGlobalFilter: false,
    filterFn: "equals",
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.roles?.length ?? 0, {
    id: "roles",
    header: "Roles",
    enableGlobalFilter: false,
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor(
    (row) =>
      row.roles?.flatMap(
        (role) => role.skills?.map((s) => i18nLabel(s, locale)) ?? []
      ) ?? [],
    {
      id: `skills-${locale}`,
      header: "Skills",
      enableGlobalFilter: false,
      enableSorting: false,
      cell: (data) => <BadgeList values={data.getValue()} />,
    }
  ),
  columnHelper.accessor(
    (row) => row.roles?.flatMap((role) => role.i18n.map((e) => e.locale)) ?? [],
    {
      id: "languages",
      header: "Languages",
      enableGlobalFilter: false,
      enableSorting: false,
      cell: (data) => <BadgeList values={data.getValue()} />,
    }
  ),
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

interface ExperiencesTableProps {
  data: ExperienceRow[];
  onDelete: (experience: ExperienceRow) => void;
  onEdit: (experience: ExperienceRow) => void;
  onMultiDelete: (experiences: ExperienceRow[]) => void;
  onMultiEdit: (experiences: ExperienceRow[]) => void;
  onMultiView: (experiences: ExperienceRow[]) => void;
  onView: (experience: ExperienceRow) => void;
}

export function ExperiencesTable({
  data,
  onEdit,
  onDelete,
  onView,
  onMultiEdit,
  onMultiView,
  onMultiDelete,
}: ExperiencesTableProps) {
  const { t: tAction } = useTranslation("actions");
  const { t: tTable } = useTranslation("tables");
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const userRole = useAuthStore((state) => state.user?.role);
  const [searchQuery, setSearchQuery] = useQueryState("query", queryParser);
  const [sort, setSort] = useQueryState("sort", sortParser);
  const [category, setCategory] = useQueryState("category", categoryParser);
  const [createdAt, setCreatedAt] = useQueryState("createdAt", createdAtParser);
  const [updatedAt, setUpdatedAt] = useQueryState("updatedAt", updatedAtParser);
  const [relevance, setRelevance] = useQueryState("relevance", relevanceParser);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>(
      "experiences-table-columns",
      DEFAULT_META_COLUMN_VISIBILITY
    );

  const stableRelevance = useStableValue(relevance);
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const activeFilters: ColumnFiltersState = [];
    if (category) activeFilters.push({ id: "category", value: category });
    if (createdAt) activeFilters.push({ id: "createdAt", value: createdAt });
    if (updatedAt) activeFilters.push({ id: "updatedAt", value: updatedAt });
    if (stableRelevance) {
      activeFilters.push({
        id: "relevance",
        value: [stableRelevance.min, stableRelevance.max] as [
          number | undefined,
          number | undefined,
        ],
      });
    }
    return activeFilters;
  }, [category, createdAt, updatedAt, stableRelevance]);

  const { filters: activeFilters, clearAll: clearAllFilters } =
    useActiveFilters([
      {
        id: "category",
        label: "Category",
        state: category,
        setState: setCategory,
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
        id: "relevance",
        label: "Relevance",
        state: stableRelevance,
        setState: setRelevance,
      },
    ]);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSort((currentSort) =>
      typeof updater === "function" ? updater(currentSort) : updater
    );
  };

  const columns = useMemo(
    () => getColumns(locale, onEdit, onDelete, onView),
    [locale, onEdit, onDelete, onView]
  );

  const table = useReactTable({
    data,
    columns,
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

  const selected = data.filter((experience) => rowSelection[experience.id]);

  const categoryFacets = getUniqueFacets(
    table.getColumn("category")!.getFacetedUniqueValues(),
    CATEGORY_LABELS
  );
  const relevanceFacets = getMinMaxFacets(
    table.getColumn("relevance")?.getFacetedMinMaxValues()
  );

  return (
    <div className="flex flex-col gap-4">
      <BatchToolbar>
        <BatchButton
          disabled={!selected?.length}
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
        <BatchButton
          className="btn-error"
          disabled={!selected?.length}
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
            allLabel="All categories"
            onChange={setCategory}
            options={categoryFacets}
            value={category}
          />

          <FiltersButton>
            <FiltersRange
              label="Relevance"
              max={relevanceFacets.max}
              min={relevanceFacets.min}
              onChange={setRelevance}
              value={relevance}
            />
            <div className="divider" />
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
