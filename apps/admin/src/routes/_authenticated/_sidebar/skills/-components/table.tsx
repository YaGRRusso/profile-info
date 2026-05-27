import { PencilIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SkillEntity } from "@/graphql/graphql";

const columnHelper = createColumnHelper<SkillEntity>();

const getColumns = (
  onEdit: (skill: SkillEntity) => void,
  onDelete: (id: string) => void
) => [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("slug", { header: "Slug" }),
  columnHelper.accessor("category", { header: "Category" }),
  columnHelper.accessor("relevance", { header: "Relevance" }),
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
  const table = useReactTable({
    data,
    columns: getColumns(onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto bg-base-200">
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
  );
}
