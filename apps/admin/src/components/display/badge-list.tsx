export interface BadgeListProps {
  values: string[];
}

export function BadgeList({ values }: BadgeListProps) {
  const unique = [...new Set(values.filter(Boolean))];

  if (!unique.length) {
    return <span className="opacity-md">–</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {[...unique].splice(0, 3).map((value) => (
        <span className="badge badge-soft badge-sm line-clamp-1" key={value}>
          {value}
        </span>
      ))}
      {unique.length > 3 && <span className="badge badge-sm">+</span>}
    </div>
  );
}
