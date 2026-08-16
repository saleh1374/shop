import { ProductGridSkeleton } from "@/components/skeletons";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-5 animate-pulse">
            <div className="h-4 bg-slate-100 rounded-lg w-24" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 bg-slate-100 rounded-lg w-full" />
              ))}
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-slate-100 rounded-lg w-32" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-slate-100 rounded-lg w-20" />
              ))}
            </div>
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
