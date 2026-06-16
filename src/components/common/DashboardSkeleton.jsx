const DashboardSkeleton = () => {
  return (
    <div className="max-w-md w-full animate-pulse">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--border-color)] rounded-full opacity-40" />
        </div>

        <div className="h-8 bg-[var(--border-color)] rounded-lg w-3/4 mx-auto mb-4 opacity-40" />
        <div className="h-4 bg-[var(--border-color)] rounded-lg w-1/2 mx-auto mb-8 opacity-40" />

        <div className="space-y-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color)] opacity-40">
              <div className="w-10 h-10 bg-[var(--border-color)] rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[var(--border-color)] rounded w-1/4" />
                <div className="h-4 bg-[var(--border-color)] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>

        <div className="h-12 bg-[var(--border-color)] rounded-xl w-full opacity-40" />
      </div>
    </div>
  );
};


export default DashboardSkeleton;
