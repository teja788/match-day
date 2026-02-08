'use client';

import { useState } from 'react';
import { MatchCard } from './MatchCard';
import type { Match } from './MatchCard';

interface SearchResult {
  matchIds: string[];
  response: string;
  responseHi?: string;
}

export function SearchBar({ matches }: { matches?: Match[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({
        matchIds: [],
        response: 'Search failed. Please try again.',
      });
    }
    setLoading(false);
  };

  const filteredMatches = matches?.filter((m) =>
    results?.matchIds.includes(m.id)
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-white transition-colors"
        aria-label="Search matches"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 sm:w-96 bg-surface-card border border-surface-border rounded-xl shadow-lg z-50 p-4">
          <input
            type="text"
            placeholder='Ask about matches... e.g., "close matches today"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-headline"
          />

          {loading && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Searching...
            </p>
          )}

          {results && !loading && (
            <div className="mt-3">
              <p className="text-sm text-headline mb-3">{results.response}</p>
              {filteredMatches && filteredMatches.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
