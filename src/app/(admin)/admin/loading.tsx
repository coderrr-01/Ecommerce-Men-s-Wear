export default function AdminDashboardLoading() {
  return (
    <div aria-label="Loading dashboard" className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-lg border border-border bg-muted/50" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-lg border border-border bg-muted/50" />
    </div>
  );
}
