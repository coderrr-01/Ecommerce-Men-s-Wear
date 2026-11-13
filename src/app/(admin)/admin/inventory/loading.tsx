export default function AdminInventoryLoading() {
  return (
    <div aria-label="Loading inventory" className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded bg-muted" />
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
