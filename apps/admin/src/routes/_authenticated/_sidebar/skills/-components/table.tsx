import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import type { SkillEntity } from "@/graphql/graphql";
import { cn } from "@/lib/cn";

const columnHelper = createColumnHelper<SkillEntity>();

// Ícone que reflete o estado atual da coluna
function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon />;
  if (sorted === "desc") return <ArrowDownIcon />;
  return <ArrowsDownUpIcon className="opacity-50" />;
}

const getColumns = (
  onEdit: (skill: SkillEntity) => void,
  onDelete: (id: string) => void
) => [
  columnHelper.accessor("name", {
    header: "Name",
    enableGlobalFilter: true,
    enableSorting: true,
  }),
  columnHelper.accessor("slug", {
    header: "Slug",
    enableGlobalFilter: true,
    enableSorting: true,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    enableGlobalFilter: false,
    enableSorting: false,
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.accessor("relevance", {
    header: "Relevance",
    enableGlobalFilter: false,
    enableSorting: true,
    cell: (data) => (
      <span className="badge badge-soft badge-sm">{data.getValue()}</span>
    ),
  }),
  columnHelper.display({
    id: "actions",
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
          onClick={() => onDelete(row.original.id)}
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
  onDelete: (id: string) => void;
  onEdit: (skill: SkillEntity) => void;
}

export function SkillsTable({ data, onEdit, onDelete }: SkillsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns: getColumns(onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // pipeline: core → filtered
    getSortedRowModel: getSortedRowModel(), // pipeline: core → filtered → sorted
    state: { globalFilter, sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="flex flex-col gap-2">
      <label className="input w-full">
        <MagnifyingGlassIcon className="opacity-md" />
        <input
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by name or slug..."
          type="text"
          value={globalFilter}
        />
      </label>

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
              <tr key={row.id}>
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
