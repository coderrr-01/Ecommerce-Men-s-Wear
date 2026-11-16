export default function ShopLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <span className="sr-only">Loading collection</span>
      <div className="space-y-4">
        <div className="skeleton-shimmer h-3 w-24 bg-secondary" />
        <div className="skeleton-shimmer h-10 w-56 bg-secondary sm:w-80" />
        <div className="skeleton-shimmer h-4 w-full max-w-lg bg-secondary" />
        <div className="skeleton-shimmer mt-8 h-14 w-full border-y border-border bg-background" />
      </div>
      <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index}>
            <div className="skeleton-shimmer aspect-[3/4] bg-secondary" />
            <div className="skeleton-shimmer mt-4 h-3 w-20 bg-secondary" />
            <div className="skeleton-shimmer mt-2 h-4 w-4/5 bg-secondary" />
            <div className="skeleton-shimmer mt-3 h-4 w-16 bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}
