export default function AccountLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}
