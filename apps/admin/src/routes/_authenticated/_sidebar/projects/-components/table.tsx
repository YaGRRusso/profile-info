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
import { z } from "zod";
import { BadgeList } from "@/components/display/badge-list";
import { useActiveFilters } from "@/hooks/custom/use-active-filters";
import { usePersistedState } from "@/hooks/custom/use-persisted-state";
import { useStableValue } from "@/hooks/custom/use-stable-value";
import type { ProjectRow } from "@/hooks/queries/projects";
import { cn } from "@/lib/cn";
import { getMinMaxFacets } from "@/lib/facets";
import { parseAsShape } from "@/lib/parsers";
import { dateRangeFilter, numberRangeFilter } from "@/lib/table-filters";

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

const DATE_OPTIONS = [
  { value: "", label: "Any date" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
];

const columnHelper = createColumnHelper<ProjectRow>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  onEdit: (project: ProjectRow) => void,
  onDelete: (project: ProjectRow) => void,
  onView: (project: ProjectRow) => void
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
  columnHelper.accessor("relevance", {
    header: "Relevance",
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: numberRangeFilter,
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.skills?.map((skill) => skill.name) ?? [], {
    id: "skills",
    header: "Skills",
    enableGlobalFilter: false,
    enableSorting: false,
    cell: (data) => <BadgeList values={data.getValue()} />,
  }),
  columnHelper.accessor((row) => row.images?.length ?? 0, {
    id: "images",
    header: "Images",
    enableGlobalFilter: false,
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.urls?.map((url) => url.title) ?? [], {
    id: "links",
    header: "Links",
    enableGlobalFilter: false,
    enableSorting: false,
    cell: (data) => <BadgeList values={data.getValue()} />,
  }),
  columnHelper.accessor((row) => row.i18n.map((entry) => entry.locale), {
    id: "languages",
    header: "Languages",
    enableGlobalFilter: false,
    enableSorting: false,
    cell: (data) => <BadgeList values={data.getValue()} />,
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

interface ProjectsTableProps {
  data: ProjectRow[];
  onDelete: (project: ProjectRow) => void;
  onEdit: (project: ProjectRow) => void;
  onMultiDelete: (projects: ProjectRow[]) => void;
  onMultiEdit: (projects: ProjectRow[]) => void;
  onMultiView: (projects: ProjectRow[]) => void;
  onView: (project: ProjectRow) => void;
}

export function ProjectsTable({
  data,
  onEdit,
  onDelete,
  onView,
  onMultiEdit,
  onMultiView,
  onMultiDelete,
}: ProjectsTableProps) {
  const [searchQuery, setSearchQuery] = useQueryState("query", queryParser);
  const [sort, setSort] = useQueryState("sort", sortParser);
  const [createdAt, setCreatedAt] = useQueryState("createdAt", createdAtParser);
  const [updatedAt, setUpdatedAt] = useQueryState("updatedAt", updatedAtParser);
  const [relevance, setRelevance] = useQueryState("relevance", relevanceParser);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>("projects-table-columns", {});

  const stableRelevance = useStableValue(relevance);
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const activeFilters: ColumnFiltersState = [];
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
  }, [createdAt, updatedAt, stableRelevance]);

  const { filters: activeFilters, clearAll: clearAllFilters } =
    useActiveFilters([
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

  function setRelevanceFilter(inputIndex: 0 | 1, rawValue: string) {
    const parsedValue = rawValue === "" ? undefined : Number(rawValue);
    const nextRange: [number | undefined, number | undefined] = [
      relevance?.min,
      relevance?.max,
    ];
    nextRange[inputIndex] = parsedValue;
    const [nextMin, nextMax] = nextRange;
    const hasAnyValue = nextMin !== undefined || nextMax !== undefined;
    setRelevance(hasAnyValue ? { min: nextMin, max: nextMax } : null);
  }

  const selected = data.filter((project) => rowSelection[project.id]);

  const relevanceFacets = getMinMaxFacets(
    table.getColumn("relevance")?.getFacetedMinMaxValues()
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="-mb-2 flex justify-end">
        <div className="scrollbar-hidden flex items-center gap-2 overflow-auto">
          <button
            className="btn btn-ghost btn-sm"
            disabled={!selected?.length}
            onClick={() => onMultiEdit(selected)}
            type="button"
          >
            <PencilIcon />
            <span>Update Selected ({selected.length})</span>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            disabled={!selected?.length}
            onClick={() => onMultiView(selected)}
            type="button"
          >
            <EyeIcon />
            <span>View Selected ({selected.length})</span>
          </button>
          <button
            className="btn btn-ghost btn-sm btn-error"
            disabled={!selected?.length}
            onClick={() => onMultiDelete(selected)}
            type="button"
          >
            <TrashSimpleIcon />
            <span>Remove Selected ({selected.length})</span>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-64 flex-1 items-center gap-2">
          <label className="input flex-1 bg-base-200">
            <MagnifyingGlassIcon className="opacity-md" />
            <input
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or slug..."
              type="search"
              value={searchQuery}
            />
          </label>

          <div className="dropdown dropdown-bottom dropdown-end">
            <button className="btn btn-square btn-soft" type="button">
              <SlidersHorizontalIcon />
            </button>
            <div className="dropdown-content z-10 w-52 rounded-box bg-base-200 p-4">
              <fieldset className="flex flex-col gap-2">
                <span className="font-semibold">Relevance</span>
                <div className="flex items-center gap-2">
                  <input
                    className="input input-sm w-full"
                    max={relevanceFacets.max ?? 100}
                    min={relevanceFacets.min ?? 0}
                    onChange={(e) => setRelevanceFilter(0, e.target.value)}
                    placeholder={`Min (${relevanceFacets.min ?? "–"})`}
                    type="number"
                    value={relevance?.min ?? ""}
                  />
                  <input
                    className="input input-sm w-full"
                    max={relevanceFacets.max ?? 100}
                    min={relevanceFacets.min ?? 0}
                    onChange={(e) => setRelevanceFilter(1, e.target.value)}
                    placeholder={`Max (${relevanceFacets.max ?? "–"})`}
                    type="number"
                    value={relevance?.max ?? ""}
                  />
                </div>
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
            clear all
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
