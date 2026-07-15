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
import { Link } from "@/components/display/link";
import { BatchButton, BatchToolbar } from "@/components/table/batch-buttons";
import { FiltersButton } from "@/components/table/filters-button";
import {
  DATE_FILTER_OPTIONS,
  FiltersRadio,
} from "@/components/table/filters-radio";
import { FiltersRange } from "@/components/table/filters-range";
import { FiltersSelect } from "@/components/table/filters-select";
import { VisibilityButton } from "@/components/table/visibility-button";
import {
  EducationLevel,
  EducationStatus,
  UserRole,
} from "@/generated/graphql/graphql";
import { useActiveFilters } from "@/hooks/custom/use-active-filters";
import { usePersistedState } from "@/hooks/custom/use-persisted-state";
import { useStableValue } from "@/hooks/custom/use-stable-value";
import type { EducationRow } from "@/hooks/queries/educations";
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
  z.array(z.object({ desc: z.boolean(), id: z.string() }))
)
  .withDefault([])
  .withOptions(persistentOptions);

const levelParser = parseAsShape(z.string()).withOptions(persistentOptions);
const statusParser = parseAsShape(z.string()).withOptions(persistentOptions);
const createdAtParser = parseAsShape(z.string()).withOptions(persistentOptions);
const updatedAtParser = parseAsShape(z.string()).withOptions(persistentOptions);

const relevanceParser = parseAsShape(
  z.object({
    max: z.number().optional(),
    min: z.number().optional(),
  })
).withOptions({
  ...persistentOptions,
  limitUrlUpdates: debouncedUrlUpdates,
});

const LEVEL_LABELS: Array<{ value: EducationLevel; label: string }> = [
  { label: "High School", value: EducationLevel.HighSchool },
  { label: "Technical", value: EducationLevel.Technical },
  { label: "Bachelor", value: EducationLevel.Bachelor },
  { label: "Postgrad", value: EducationLevel.Postgrad },
  { label: "Master", value: EducationLevel.Master },
  { label: "Doctorate", value: EducationLevel.Doctorate },
];

const STATUS_LABELS: Array<{ value: EducationStatus; label: string }> = [
  { label: "Complete", value: EducationStatus.Complete },
  { label: "Incomplete", value: EducationStatus.Incomplete },
  { label: "In Progress", value: EducationStatus.InProgress },
];

const RESTRICTED_COLUMNS: RestrictedColumns = {
  [UserRole.SuperAdmin]: ["owner"],
};

const columnHelper = createColumnHelper<EducationRow>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  locale: string,
  onEdit: (education: EducationRow) => void,
  onDelete: (education: EducationRow) => void,
  onView: (education: EducationRow) => void
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
  columnHelper.accessor((row) => i18nLabel(row, locale), {
    cell: (data) => {
      const value = data.getValue();
      if (isEmptyValue(value)) return <EmptyValue />;
      return value;
    },
    header: "Title",
    id: `title-${locale}`,
  }),
  columnHelper.accessor("relevance", {
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: numberRangeFilter,
    header: "Relevance",
  }),
  columnHelper.accessor("level", {
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
    enableColumnFilter: true,
    enableGlobalFilter: false,
    enableSorting: false,
    filterFn: "equals",
    header: "Level",
  }),
  columnHelper.accessor("status", {
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
    enableColumnFilter: true,
    enableGlobalFilter: false,
    enableSorting: false,
    filterFn: "equals",
    header: "Status",
  }),
  columnHelper.accessor((row) => row.organization?.name ?? "", {
    cell: (data) => <BadgeList values={[data.getValue()]} />,
    header: "Organization",
    id: "organization",
  }),
  columnHelper.accessor((row) => row.period, {
    cell: (data) => {
      const period = data.getValue();
      if (!(period?.from || period?.to)) return <EmptyValue />;
      const from = period.from
        ? new Date(period.from).toLocaleDateString()
        : "?";
      const to = period.to ? new Date(period.to).toLocaleDateString() : "?";
      return `${from} – ${to}`;
    },
    enableGlobalFilter: false,
    enableSorting: false,
    header: "Period",
    id: "period",
  }),
  columnHelper.accessor(
    (row) => row.skills?.map((skill) => i18nLabel(skill, locale)) ?? [],
    {
      cell: (data) => <BadgeList values={data.getValue()} />,
      enableGlobalFilter: false,
      enableSorting: false,
      header: "Skills",
      id: `skills-${locale}`,
    }
  ),
  columnHelper.accessor((row) => row.i18n.map((entry) => entry.locale), {
    cell: (data) => <BadgeList values={data.getValue()} />,
    enableGlobalFilter: false,
    enableSorting: false,
    header: "Languages",
    id: "languages",
  }),
  columnHelper.accessor("url", {
    cell: (data) => {
      const url = data.getValue();
      return <Link href={url} />;
    },
    enableGlobalFilter: false,
    enableSorting: false,
    header: "URL",
  }),
  columnHelper.accessor("image", {
    cell: (data) => {
      const url = data.getValue();
      return <Link href={url} />;
    },
    enableGlobalFilter: false,
    enableSorting: false,
    header: "Image",
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

interface EducationsTableProps {
  data: EducationRow[];
  onDelete: (education: EducationRow) => void;
  onEdit: (education: EducationRow) => void;
  onMultiDelete: (educations: EducationRow[]) => void;
  onMultiEdit: (educations: EducationRow[]) => void;
  onMultiView: (educations: EducationRow[]) => void;
  onView: (education: EducationRow) => void;
}

export function EducationsTable({
  data,
  onEdit,
  onDelete,
  onView,
  onMultiEdit,
  onMultiView,
  onMultiDelete,
}: EducationsTableProps) {
  const { t: tAction } = useTranslation("actions");
  const { t: tTable } = useTranslation("tables");
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const userRole = useAuthStore((state) => state.user?.role);
  const [searchQuery, setSearchQuery] = useQueryState("query", queryParser);
  const [sort, setSort] = useQueryState("sort", sortParser);
  const [level, setLevel] = useQueryState("level", levelParser);
  const [status, setStatus] = useQueryState("status", statusParser);
  const [createdAt, setCreatedAt] = useQueryState("createdAt", createdAtParser);
  const [updatedAt, setUpdatedAt] = useQueryState("updatedAt", updatedAtParser);
  const [relevance, setRelevance] = useQueryState("relevance", relevanceParser);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>(
      "educations-table-columns",
      DEFAULT_META_COLUMN_VISIBILITY
    );

  const stableRelevance = useStableValue(relevance);
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const activeFilters: ColumnFiltersState = [];
    if (level) activeFilters.push({ id: "level", value: level });
    if (status) activeFilters.push({ id: "status", value: status });
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
  }, [level, status, createdAt, updatedAt, stableRelevance]);

  const { filters: activeFilters, clearAll: clearAllFilters } =
    useActiveFilters([
      { id: "level", label: "Level", setState: setLevel, state: level },
      { id: "status", label: "Status", setState: setStatus, state: status },
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
        id: "relevance",
        label: "Relevance",
        setState: setRelevance,
        state: stableRelevance,
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
    columns,
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

  const selected = data.filter((education) => rowSelection[education.id]);

  const levelFacets = getUniqueFacets(
    table.getColumn("level")?.getFacetedUniqueValues(),
    LEVEL_LABELS
  );
  const statusFacets = getUniqueFacets(
    table.getColumn("status")?.getFacetedUniqueValues(),
    STATUS_LABELS
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
            allLabel="All levels"
            onChange={setLevel}
            options={levelFacets}
            value={level}
          />

          <FiltersSelect
            allLabel="All statuses"
            onChange={setStatus}
            options={statusFacets}
            value={status}
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
