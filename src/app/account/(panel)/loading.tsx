export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${70 + i * 10}%` }} />
        ))}
      </div>
    </div>
  );
}
