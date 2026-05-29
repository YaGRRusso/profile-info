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
  type ColumnFiltersState,
  createColumnHelper,
  type FilterFn,
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
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SkillCategory, type SkillEntity } from "@/graphql/graphql";
import { cn } from "@/lib/cn";
import { getMinMaxFacets, getUniqueFacets } from "@/lib/facets";
import { parseAsShape } from "@/lib/parsers";

const debounce = { method: "debounce" as const, timeMs: 500 };

const tableShapes = {
  query: parseAsShape(z.string())
    .withDefault("")
    .withOptions({ limitUrlUpdates: debounce }),
  sort: parseAsShape(
    z.array(z.object({ id: z.string(), desc: z.boolean() }))
  ).withDefault([]),
  category: parseAsShape(z.string()),
  createdAt: parseAsShape(z.string()),
  updatedAt: parseAsShape(z.string()),
  relevance: parseAsShape(
    z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
  ).withOptions({ limitUrlUpdates: debounce }),
};

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
  const [state, setState] = useQueryStates(tableShapes, {
    clearOnDefault: true,
    history: "push",
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // JSON estabiliza a dep do memo: o nuqs pode entregar uma nova ref de
  // `state.relevance` mesmo quando o conteúdo é igual; sem isso o memo
  // re-roda e o TanStack re-faceta tudo a cada keystroke.
  const relevanceKey = JSON.stringify(state.relevance ?? null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: relevanceKey serializa state.relevance
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const out: ColumnFiltersState = [];
    if (state.category) out.push({ id: "category", value: state.category });
    if (state.createdAt) out.push({ id: "createdAt", value: state.createdAt });
    if (state.updatedAt) out.push({ id: "updatedAt", value: state.updatedAt });
    if (state.relevance) {
      out.push({
        id: "relevance",
        value: [state.relevance.min, state.relevance.max] as [
          number | undefined,
          number | undefined,
        ],
      });
    }
    return out;
  }, [state.category, state.createdAt, state.updatedAt, relevanceKey]);

  const setSorting: OnChangeFn<SortingState> = (updater) => {
    setState((prev) => ({
      sort: typeof updater === "function" ? updater(prev.sort) : updater,
    }));
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
    columns: getColumns(onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowId: (row) => row.id,
    state: {
      globalFilter: state.query,
      sorting: state.sort,
      columnFilters,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  });

  function setRelevanceFilter(index: 0 | 1, raw: string) {
    const val = raw === "" ? undefined : Number(raw);
    const next: [number | undefined, number | undefined] = [
      state.relevance?.min,
      state.relevance?.max,
    ];
    next[index] = val;
    const [min, max] = next;
    const hasAny = min !== undefined || max !== undefined;
    setState({ relevance: hasAny ? { min, max } : null });
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
            onChange={(e) => setState({ query: e.target.value })}
            placeholder="Search by name or slug..."
            type="text"
            value={state.query}
          />
        </label>
        <select
          className="select"
          disabled={!categoryFacets.length}
          onChange={(e) => setState({ category: e.target.value || null })}
          value={state.category ?? ""}
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
                  value={state.relevance?.min ?? ""}
                />
                <input
                  className="input input-sm w-full"
                  max={relevanceFacets.max ?? 100}
                  min={relevanceFacets.min ?? 0}
                  onChange={(e) => setRelevanceFilter(1, e.target.value)}
                  placeholder={`Max (${relevanceFacets.max ?? "–"})`}
                  type="number"
                  value={state.relevance?.max ?? ""}
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
                      state.createdAt === value ||
                      (!state.createdAt && value === "")
                    }
                    className="radio radio-sm"
                    name="created"
                    onChange={() => setState({ createdAt: value || null })}
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
                      state.updatedAt === value ||
                      (!state.updatedAt && value === "")
                    }
                    className="radio radio-sm"
                    name="updated"
                    onChange={() => setState({ updatedAt: value || null })}
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
