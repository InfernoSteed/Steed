import React from 'react';

export const AssetSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-theme-surface/5 border border-transparent animate-pulse">
    <div className="w-12 h-12 rounded bg-[#333] relative overflow-hidden shrink-0">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
    <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3 w-3/4 bg-[#333] rounded relative overflow-hidden">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
        <div className="h-2 w-1/2 bg-[#333] rounded relative overflow-hidden">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
    </div>
  </div>
);