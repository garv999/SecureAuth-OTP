import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="max-w-md w-full animate-pulse">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-700 rounded-full" />
        </div>

        <div className="h-8 bg-slate-700 rounded-lg w-3/4 mx-auto mb-4" />
        <div className="h-4 bg-slate-700 rounded-lg w-1/2 mx-auto mb-8" />

        <div className="space-y-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-700/30">
              <div className="w-10 h-10 bg-slate-700 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-700 rounded w-1/4" />
                <div className="h-4 bg-slate-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>

        <div className="h-12 bg-slate-700 rounded-xl w-full" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
