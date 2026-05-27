import { PencilIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SkillEntity } from "@/graphql/graphql";
import { cn } from "@/lib/cn";

const RELEVANCE_COLORS: Record<number, string> = {
  0: "",
  1: "badge-error",
  2: "badge-error",
  3: "badge-warning",
  4: "badge-success",
  5: "badge-success",
};

const columnHelper = createColumnHelper<SkillEntity>();

const getColumns = (
  onEdit: (skill: SkillEntity) => void,
  onDelete: (id: string) => void
) => [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("slug", {
    header: "Slug",
    cell: (info) => (
      <span className="font-mono text-sm opacity-60">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("category", {
    header: "Category",
    cell: (info) => <span className="badge badge-soft">{info.getValue()}</span>,
  }),
  columnHelper.accessor("relevance", {
    header: "Relevance",
    cell: (info) => {
      const value = info.getValue();
      return value == null ? (
        <span className="opacity-40">—</span>
      ) : (
        <span className={cn("badge badge-soft", RELEVANCE_COLORS[value])}>
          {value}
        </span>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) =>
      new Date(info.getValue()).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated At",
    cell: (info) =>
      new Date(info.getValue()).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const skill = row.original;
      return (
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-square btn-soft"
            onClick={() => onEdit(skill)}
            type="button"
          >
            <PencilIcon />
          </button>
          <button
            className="btn btn-sm btn-soft btn-square btn-error"
            onClick={() => onDelete(skill.id)}
            type="button"
          >
            <TrashSimpleIcon />
          </button>
        </div>
      );
    },
  }),
];

interface SkillsTableProps {
  data: SkillEntity[];
  onDelete: (id: string) => void;
  onEdit: (skill: SkillEntity) => void;
}

export function SkillsTable({ data, onEdit, onDelete }: SkillsTableProps) {
  const table = useReactTable({
    data,
    columns: getColumns(onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded bg-base-200">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="hover:bg-base-300" key={row.id}>
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
  );
}
