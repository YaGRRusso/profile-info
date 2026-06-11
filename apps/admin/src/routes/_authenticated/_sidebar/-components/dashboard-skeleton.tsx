export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skeleton h-44 w-full rounded-box" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="skeleton h-24 rounded-box" key={index} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="skeleton h-80 rounded-box xl:col-span-2" />
        <div className="flex flex-col gap-4">
          <div className="skeleton h-36 rounded-box" />
          <div className="skeleton h-36 rounded-box" />
        </div>
      </div>
      <div className="skeleton h-48 rounded-box" />
    </div>
  );
}
