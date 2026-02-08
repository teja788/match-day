'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight">
            Match<span className="text-headline">Day</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <Link href="/cricket" className="hover:text-cricket transition-colors">
            Cricket
          </Link>
          <Link href="/football" className="hover:text-football transition-colors">
            Football
          </Link>
        </div>
      </div>
    </header>
  );
}
