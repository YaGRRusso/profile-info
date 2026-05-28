import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  GearIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  SlidersHorizontalIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import {
  createColumnHelper,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type RowSelectionState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { SkillCategory, type SkillEntity } from "@/graphql/graphql";
import { cn } from "@/lib/cn";
import { getMinMaxFacets, getUniqueFacets } from "@/lib/facets";
import {
  parseAsColumnFiltersState,
  parseAsSortingState,
} from "@/lib/table-parsers";

const CATEGORY_LABELS: Array<{ value: SkillCategory; label: string }> = [
  { value: SkillCategory.Backend, label: "Backend" },
  { value: SkillCategory.Concepts, label: "Concepts" },
  { value: SkillCategory.Data, label: "Data" },
  { value: SkillCategory.Design, label: "Design" },
  { value: SkillCategory.Devops, label: "DevOps" },
  { value: SkillCategory.Frontend, label: "Frontend" },
  { value: SkillCategory.Language, label: "Language" },
  { value: SkillCategory.Quality, label: "Quality" },
  { value: SkillCategory.Soft, label: "Soft Skills" },
];

const DATE_OPTIONS = [
  { value: "", label: "Any date" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
];

const columnHelper = createColumnHelper<SkillEntity>();

const numberRangeFilter: FilterFn<SkillEntity> = (row, columnId, value) => {
  const rowValue = row.getValue<number | null>(columnId);
  if (rowValue === null || rowValue === undefined) return false;
  const [min, max] = value as [number | undefined, number | undefined];
  if (min !== undefined && rowValue < min) return false;
  if (max !== undefined && rowValue > max) return false;
  return true;
};

const dateRangeFilter: FilterFn<SkillEntity> = (row, column, value) => {
  const date = new Date(row.getValue(column));
  const now = new Date();
  switch (value) {
    case "week":
      return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    default:
      return true;
  }
};

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  onEdit: (skill: SkillEntity) => void,
  onDelete: (skill: SkillEntity) => void
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
  columnHelper.accessor("slug", {
    header: "Slug",
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
  columnHelper.accessor("relevance", {
    header: "Relevance",
    enableColumnFilter: true,
    enableGlobalFilter: false,
    filterFn: numberRangeFilter,
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
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
          onClick={() => onDelete(row.original)}
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
  onDelete: (id: SkillEntity) => void;
  onEdit: (skill: SkillEntity) => void;
  onSelect?: (ids: SkillEntity[]) => void;
}

export function SkillsTable({
  data,
  onEdit,
  onDelete,
  onSelect,
}: SkillsTableProps) {
  const [globalFilter, setGlobalFilter] = useQueryState("query", {
    defaultValue: "",
    clearOnDefault: true,
    history: "push",
    limitUrlUpdates: {
      method: "debounce",
      timeMs: 500,
    },
  });
  const [sorting, setSorting] = useQueryState(
    "sort",
    parseAsSortingState.withDefault([]).withOptions({
      clearOnDefault: true,
      history: "push",
    })
  );
  const [columnFilters, setColumnFilters] = useQueryState(
    "filters",
    parseAsColumnFiltersState.withDefault([]).withOptions({
      clearOnDefault: true,
      history: "push",
    })
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

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
  const relevanceFilter = columnFilters.find((f) => f.id === "relevance")
    ?.value as [number | undefined, number | undefined] | undefined;

  // getCoreRowModel - required
  // getFilteredRowModel - use when using filters
  // getSortedRowModel - use when using sorting
  // getPaginationRowModel - use when using pagination
  // getFacetedRowModel - use when using either of the below
  // getFacetedUniqueValues - use to get a Map<value, count> for a column (e.g. for showing filter options with counts) -
  // getFacetedMinMaxValues - use to get a [min, max] for a column (e.g. for setting min and max values on a range slider filter)

  const table = useReactTable({
    data,
    columns: getColumns(onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowId: (row) => row.id,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  function setRelevanceFilter(index: 0 | 1, raw: string) {
    const val = raw === "" ? undefined : Number(raw);
    const next: [number | undefined, number | undefined] = [
      relevanceFilter?.[0],
      relevanceFilter?.[1],
    ];
    next[index] = val;

    setColumnFilter(
      "relevance",
      next.some((v) => v !== undefined) ? next : undefined
    );
  }

  const categoryFacets = getUniqueFacets(
    table.getColumn("category")!.getFacetedUniqueValues(),
    CATEGORY_LABELS
  );
  const relevanceFacets = getMinMaxFacets(
    table.getColumn("relevance")?.getFacetedMinMaxValues()
  );

  useEffect(() => {
    const selected = data.filter((skill) => rowSelection[skill.id]);
    onSelect?.(selected);
  }, [rowSelection, onSelect, data]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
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
          disabled={!categoryFacets.length}
          onChange={(e) => setColumnFilter("category", e.target.value)}
          value={categoryFilter ?? ""}
        >
          <option value="">All categories</option>
          {categoryFacets.map(({ value, label, count }) => (
            <option key={value} value={value}>
              {label} ({count})
            </option>
          ))}
        </select>

        <div className="dropdown dropdown-bottom dropdown-end">
          <button className="btn btn-square btn-soft" type="button">
            <SlidersHorizontalIcon />
          </button>
          <div className="dropdown-content z-1 flex w-52 flex-col rounded-box border border-input bg-base-200 p-4">
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
                  value={relevanceFilter?.[0] ?? ""}
                />
                <input
                  className="input input-sm w-full"
                  max={relevanceFacets.max ?? 100}
                  min={relevanceFacets.min ?? 0}
                  onChange={(e) => setRelevanceFilter(1, e.target.value)}
                  placeholder={`Max (${relevanceFacets.max ?? "–"})`}
                  type="number"
                  value={relevanceFilter?.[1] ?? ""}
                />
              </div>
            </fieldset>
            <div className="divider mt-2 mb-0" />
            <fieldset className="flex flex-col gap-2">
              <span className="font-semibold">Created</span>
              {DATE_OPTIONS.map(({ value, label }) => (
                <label className="flex items-center gap-2 text-sm" key={value}>
                  <input
                    checked={
                      createdAtFilter === value ||
                      (!createdAtFilter && value === "")
                    }
                    className="radio radio-sm"
                    name="created"
                    onChange={() => setColumnFilter("createdAt", value)}
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
                <label className="flex items-center gap-2 text-sm" key={value}>
                  <input
                    checked={
                      updatedAtFilter === value ||
                      (!updatedAtFilter && value === "")
                    }
                    className="radio radio-sm"
                    name="updated"
                    onChange={() => setColumnFilter("updatedAt", value)}
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
          <div className="dropdown-content z-1 flex w-40 flex-col gap-2 rounded-box border border-input bg-base-200 p-4">
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
              <tr
                className={cn(
                  "hover:bg-base-300",
                  row.getIsSelected() && "bg-base-300"
                )}
                key={row.id}
              >
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
