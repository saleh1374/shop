export default function CheckoutLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-40 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-3 bg-slate-100 rounded w-20 mb-2"></div>
                <div className="h-11 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-32 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-px bg-slate-200 my-4"></div>
            <div className="h-6 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
