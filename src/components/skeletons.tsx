export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
        <div className="h-5 bg-slate-100 rounded-lg w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="border-t border-slate-100 p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-4 bg-slate-100 rounded-lg w-20" />
        <div className="h-4 bg-slate-100 rounded-lg w-32" />
        <div className="h-4 bg-slate-100 rounded-lg w-24 ml-auto" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-lg w-1/3" />
      <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
      <div className="h-64 bg-slate-100 rounded-2xl" />
    </div>
  );
}
