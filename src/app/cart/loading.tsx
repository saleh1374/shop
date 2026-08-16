export default function CartLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 animate-pulse">
            <div className="w-24 h-24 bg-slate-200 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
