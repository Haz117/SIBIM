export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Topbar skeleton */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-muted" />
          <div className="hidden sm:block w-px h-7 bg-border" />
          <div className="space-y-1.5">
            <div className="h-5 w-36 rounded-md bg-muted" />
            <div className="h-3 w-52 rounded-md bg-muted" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:block h-9 w-56 rounded-lg bg-muted" />
          <div className="h-9 w-9 rounded-lg bg-muted" />
          <div className="h-9 w-9 rounded-lg bg-muted" />
          <div className="h-9 w-9 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Content area */}
      <div className="p-6 space-y-6">
        {/* Stat cards row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted border border-border" />
          ))}
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 rounded-2xl bg-muted border border-border" />
          <div className="h-64 rounded-2xl bg-muted border border-border" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="h-14 border-b border-border px-4 flex items-center gap-3">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="ml-auto h-8 w-32 rounded-lg bg-muted" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 px-4 flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
                <div className="h-5 w-16 rounded-full bg-muted" />
                <div className="h-3.5 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
