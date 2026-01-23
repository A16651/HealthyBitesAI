import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-8 w-3/5 bg-slate-200 rounded" />
      <div className="h-4 w-full bg-slate-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-28 bg-slate-200 rounded" />
        <div className="h-28 bg-slate-200 rounded" />
      </div>
      <div className="h-40 bg-slate-200 rounded" />
    </div>
  );
}
