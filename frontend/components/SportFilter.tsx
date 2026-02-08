'use client';

import { useScoreStore } from '@/stores/useScoreStore';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
] as const;

export function SportFilter() {
  const { activeSport, setActiveSport } = useScoreStore();

  return (
    <div className="flex gap-2 px-4 py-3">
      {FILTERS.map((f) => {
        const isActive = activeSport === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setActiveSport(f.id as 'all' | 'cricket' | 'football')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              isActive
                ? 'bg-white text-surface'
                : 'bg-surface-card text-gray-400 border border-surface-border hover:border-gray-500'
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
