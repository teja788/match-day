# MatchDay — Live Cricket & Football Score Website

## Web-First Build Plan & Step-by-Step Guide

---

## What Changes (App → Website)

| Aspect | App (Previous Plan) | Website (This Plan) |
|--------|-------------------|-------------------|
| Frontend | React Native (Expo) | Next.js 14 (React) |
| Deployment | Play Store ($25 fee, review delays) | Vercel (free, instant deploys) |
| Monetization | AdMob | Google AdSense (higher CPM for web) |
| Notifications | Firebase Cloud Messaging | Browser Push Notifications (Web Push API) |
| SEO | None (apps are invisible to Google) | Massive advantage — "IND vs ENG live score" ranks on Google |
| State Management | Zustand | Zustand (same) |
| Backend | Node.js + Express | Same — no change |
| Time to launch | ~4 weeks | ~2–3 weeks (no app store review) |
| Install friction | User must download from Play Store | Zero — just visit the URL |

**The backend stays exactly the same.** You only replace the React Native frontend with a Next.js web frontend. Everything from Phase 3 of the previous plan (adapters, aggregator, AI summaries) is unchanged.

---

## Why Website is Actually Better for This Idea

1. **SEO is your free growth engine.** During T20 World Cup, millions of Indians Google "IND vs ENG live score." A website ranks. An app doesn't. You get free traffic from Google without spending on ads.

2. **Zero install friction.** Someone Googles a score, lands on your site, bookmarks it. Compare that to: find app → download → install → open. You lose 80% of users at each step.

3. **Faster to ship.** No Play Store review (3–7 days), no dealing with Android build configs, no signing keys. Push code → live in 30 seconds on Vercel.

4. **AdSense pays more than AdMob for India sports traffic.** Sports keyword CPCs are ₹5–15 on web vs ₹1–3 on mobile app ads.

5. **PWA gives you app-like features.** Add to home screen, offline caching, push notifications — all without the Play Store.

---

## Phase 0: Validate (Days 1–2)

Same as before. Check keyword volume, read competitor reviews. One addition:

**Check SEO competition.** Google these queries and note who ranks:
- "live cricket score" → Cricbuzz, ESPNcricinfo dominate
- "IND vs [opponent] live score" → less competitive, especially for specific match queries
- "cricket football live score" → almost no competition for this combined query
- "T20 World Cup 2026 live score" → seasonal, beatable with fresh content

Your SEO wedge: **no website combines cricket + football live scores on a single page with AI summaries.** That's your unique content angle.

---

## Phase 1: Tech Stack (Day 3)

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | SSR for SEO, React ecosystem, deploys free on Vercel |
| Styling | Tailwind CSS | Fast to build, responsive out of the box |
| State | Zustand | Same lightweight store from the app plan |
| Real-time | SWR or React Query | Auto-revalidation, stale-while-revalidate pattern |
| Backend | Node.js + Express (unchanged) | Same aggregator, same adapters |
| Hosting (frontend) | Vercel (free tier) | Auto deploys from GitHub, edge CDN |
| Hosting (backend) | Railway or Render (free tier) | Same as before |
| Analytics | Google Analytics 4 + Search Console | Track SEO traffic, user behavior |
| Ads | Google AdSense | Higher CPM than mobile ads for sports keywords |
| Push Notifications | Web Push API + Firebase | Browser push for goals/wickets |

### Project Structure

```
matchday/
├── backend/                     # UNCHANGED from app plan
│   ├── adapters/
│   │   ├── cricketAdapter.js
│   │   └── footballAdapter.js
│   ├── services/
│   │   ├── scoreAggregator.js
│   │   ├── aiSummary.js
│   │   └── notificationService.js
│   ├── routes/
│   │   └── scores.js
│   ├── server.js
│   └── .env
│
├── frontend/                    # NEW — replaces React Native
│   ├── app/
│   │   ├── layout.tsx           # Root layout with metadata for SEO
│   │   ├── page.tsx             # Home — unified feed
│   │   ├── cricket/
│   │   │   └── page.tsx         # Cricket-only scores
│   │   ├── football/
│   │   │   └── page.tsx         # Football-only scores
│   │   ├── match/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Individual match detail (SSR for SEO)
│   │   └── api/
│   │       └── revalidate/
│   │           └── route.ts     # On-demand ISR trigger
│   ├── components/
│   │   ├── MatchCard.tsx
│   │   ├── LiveIndicator.tsx
│   │   ├── SportFilter.tsx
│   │   ├── ScoreFeed.tsx
│   │   ├── Header.tsx
│   │   ├── AdSlot.tsx
│   │   └── SEOHead.tsx
│   ├── stores/
│   │   └── useScoreStore.ts     # Zustand (same logic, web-adapted)
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   └── swr.ts               # SWR config for auto-refresh
│   ├── public/
│   │   ├── manifest.json        # PWA manifest
│   │   ├── sw.js                # Service worker
│   │   ├── icons/               # PWA icons
│   │   └── og-image.png         # Social sharing image
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
```

---

## Phase 2: Data Sources (Day 3–4)

**No change.** Same free APIs:
- CricAPI.com (free — 100 req/day)
- API-Football on RapidAPI (free — 100 req/day)
- TheSportsDB (free — logos and metadata)

---

## Phase 3: Backend (Days 4–8)

**No change.** The entire backend from the previous plan works as-is. Same adapters, same aggregator, same AI summary service, same REST endpoints.

The only addition: enable CORS for your Vercel domain.

```javascript
// server.js — add this
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3001',              // Local dev
    'https://matchday.vercel.app',        // Production
    'https://matchday.live'               // Custom domain
  ]
}));
```

```bash
npm install cors
```

---

## Phase 4: Build the Website (Days 8–16)

### Step 1: Project Setup

```bash
npx create-next-app@latest matchday-web --typescript --tailwind --app --src-dir=false
cd matchday-web
npm install zustand axios swr
```

### Step 2: Tailwind Config — Dark Sports Theme

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0F1117',
          card: '#1A1D26',
          border: '#2A2D36',
          hover: '#22252E',
        },
        live: '#EF4444',
        cricket: '#22C55E',
        football: '#3B82F6',
        headline: '#F59E0B',
        score: '#F9FAFB',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'live-pulse': 'pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
```

### Step 3: Root Layout with SEO Metadata

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = DM_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'MatchDay — Live Cricket & Football Scores',
  description:
    'Real-time cricket and football scores on one screen. T20 World Cup, IPL, Premier League, La Liga — AI-powered match highlights.',
  keywords: [
    'live cricket score',
    'live football score',
    'T20 World Cup 2026 live',
    'IPL live score',
    'Premier League live score',
    'cricket football scores',
  ],
  openGraph: {
    title: 'MatchDay — Live Cricket & Football Scores',
    description: 'One screen. Two sports. AI-powered highlights.',
    url: 'https://matchday.live',
    siteName: 'MatchDay',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MatchDay — Live Cricket & Football Scores',
    description: 'One screen. Two sports. AI-powered highlights.',
  },
  manifest: '/manifest.json',
  themeColor: '#0F1117',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="bg-surface text-white font-display antialiased">
        {children}
      </body>
    </html>
  );
}
```

### Step 4: API Client with SWR (Replaces Zustand Polling)

On the web, SWR handles auto-refresh better than manual `setInterval`. It gives you stale-while-revalidate, tab focus refetch, and error retry for free.

```typescript
// lib/api.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const client = axios.create({ baseURL: BASE_URL, timeout: 10000 });

export async function fetchScores(sport?: string) {
  const params: Record<string, string> = {};
  if (sport) params.sport = sport;
  const { data } = await client.get('/api/scores', { params });
  return data;
}

export async function fetchMatch(matchId: string) {
  const { data } = await client.get(`/api/scores/${matchId}`);
  return data;
}
```

```typescript
// lib/swr.ts
import useSWR from 'swr';
import { fetchScores } from './api';

export function useLiveScores(sport?: string) {
  return useSWR(
    ['scores', sport],
    () => fetchScores(sport),
    {
      refreshInterval: 30_000,      // Auto-refresh every 30 seconds
      revalidateOnFocus: true,      // Refresh when user returns to tab
      dedupingInterval: 10_000,     // Don't duplicate requests within 10s
      keepPreviousData: true,       // Show stale data while fetching
    }
  );
}
```

### Step 5: Zustand Store (Simplified for Web)

```typescript
// stores/useScoreStore.ts
import { create } from 'zustand';

type Sport = 'cricket' | 'football';

interface ScoreStore {
  activeSport: Sport | 'all';
  setActiveSport: (sport: Sport | 'all') => void;
}

export const useScoreStore = create<ScoreStore>((set) => ({
  activeSport: 'all',
  setActiveSport: (sport) => set({ activeSport: sport }),
}));
```

SWR handles data fetching and caching now, so Zustand only manages UI state (which filter is active).

### Step 6: Header Component

```tsx
// components/Header.tsx
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
            🏏 Cricket
          </Link>
          <Link href="/football" className="hover:text-football transition-colors">
            ⚽ Football
          </Link>
        </div>
      </div>
    </header>
  );
}
```

### Step 7: SportFilter Component (Web Version)

```tsx
// components/SportFilter.tsx
'use client';

import { useScoreStore } from '@/stores/useScoreStore';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'cricket', label: '🏏 Cricket' },
  { id: 'football', label: '⚽ Football' },
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
            onClick={() => setActiveSport(f.id as any)}
            className={`
              px-4 py-1.5 rounded-full text-sm font-semibold transition-all
              ${isActive
                ? 'bg-white text-surface'
                : 'bg-surface-card text-gray-400 border border-surface-border hover:border-gray-500'}
            `}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
```

### Step 8: LiveIndicator Component (CSS-only, no JS animation needed)

```tsx
// components/LiveIndicator.tsx
export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-live animate-live-pulse" />
      <span className="text-live text-[10px] font-extrabold tracking-wider">LIVE</span>
    </span>
  );
}
```

### Step 9: MatchCard Component (Web Version)

```tsx
// components/MatchCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LiveIndicator } from './LiveIndicator';

interface Team {
  name: string;
  shortName: string;
  logo: string;
  score: string;
}

interface Match {
  id: string;
  sport: 'cricket' | 'football';
  status: 'upcoming' | 'live' | 'completed';
  tournament: string;
  teamA: Team;
  teamB: Team;
  headline: string;
  headlineHi: string;
  startTime: string;
  venue: string;
  extras: Record<string, any>;
}

const sportIcon: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
};

export function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'live';

  return (
    <Link
      href={`/match/${match.id}`}
      className={`
        block bg-surface-card rounded-xl p-4 border transition-all
        hover:bg-surface-hover hover:border-gray-600 group
        ${isLive ? 'border-live/25' : 'border-surface-border'}
      `}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-semibold">
          {sportIcon[match.sport]} {match.tournament}
          {match.sport === 'football' && match.extras?.minute
            ? ` • ${match.extras.minute}'`
            : ''}
        </span>
        {isLive && <LiveIndicator />}
        {match.status === 'upcoming' && (
          <span className="text-xs text-gray-500">
            {new Date(match.startTime).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        {match.status === 'completed' && (
          <span className="text-xs text-gray-500 font-bold">FT</span>
        )}
      </div>

      {/* Team scores */}
      <div className="space-y-1.5 mb-3">
        <TeamRow team={match.teamA} isLive={isLive} />
        <TeamRow team={match.teamB} isLive={isLive} />
      </div>

      {/* AI headline */}
      {match.headline && (
        <div className="bg-headline/10 rounded-md px-3 py-1.5 mb-2">
          <p className="text-headline text-xs font-semibold truncate">
            ⚡ {match.headline}
          </p>
        </div>
      )}

      {/* Venue */}
      {match.venue && (
        <p className="text-[11px] text-gray-500 truncate">{match.venue}</p>
      )}
    </Link>
  );
}

function TeamRow({ team, isLive }: { team: Team; isLive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {team.logo && (
        <img
          src={team.logo}
          alt={team.name}
          width={20}
          height={20}
          className="w-5 h-5 rounded-full object-cover"
        />
      )}
      <span className="text-sm font-semibold text-white flex-1">
        {team.shortName || team.name}
      </span>
      <span className={`text-sm font-bold font-mono ${isLive ? 'text-score' : 'text-gray-300'}`}>
        {team.score}
      </span>
    </div>
  );
}
```

### Step 10: ScoreFeed Component (Combines SWR + Filter)

```tsx
// components/ScoreFeed.tsx
'use client';

import { useLiveScores } from '@/lib/swr';
import { useScoreStore } from '@/stores/useScoreStore';
import { MatchCard } from './MatchCard';
import { SportFilter } from './SportFilter';

export function ScoreFeed() {
  const { activeSport } = useScoreStore();
  const sportParam = activeSport === 'all' ? undefined : activeSport;
  const { data, error, isLoading, isValidating } = useLiveScores(sportParam);

  return (
    <div>
      <SportFilter />

      {/* Loading state */}
      {isLoading && (
        <div className="px-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-surface-card rounded-xl animate-pulse border border-surface-border"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Failed to load scores</p>
          <p className="text-sm mt-1">Retrying automatically...</p>
        </div>
      )}

      {/* Match cards */}
      {data && (
        <div className="px-4 space-y-3">
          {/* Refreshing indicator */}
          {isValidating && !isLoading && (
            <div className="flex justify-center">
              <span className="text-[10px] text-gray-600 bg-surface-card px-3 py-1 rounded-full">
                Updating...
              </span>
            </div>
          )}

          {data.matches.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No matches right now</p>
              <p className="text-sm mt-1">Check back during match hours</p>
            </div>
          ) : (
            data.matches.map((match: any) => (
              <MatchCard key={match.id} match={match} />
            ))
          )}

          {/* Last updated */}
          {data.lastUpdated && (
            <p className="text-center text-[10px] text-gray-600 py-4">
              Last updated{' '}
              {new Date(data.lastUpdated).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              {' • '}Auto-refreshes every 30s
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

### Step 11: Home Page

```tsx
// app/page.tsx
import { Header } from '@/components/Header';
import { ScoreFeed } from '@/components/ScoreFeed';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-3xl mx-auto pb-20">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-extrabold">Live Scores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cricket & Football • AI-powered highlights
          </p>
        </div>
        <ScoreFeed />
      </div>
    </main>
  );
}
```

### Step 12: Sport-Specific Pages (SEO Gold)

These dedicated pages rank for sport-specific searches.

```tsx
// app/cricket/page.tsx
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { CricketFeed } from './CricketFeed';

export const metadata: Metadata = {
  title: 'Live Cricket Scores — T20 World Cup, IPL, Test Matches | MatchDay',
  description:
    'Real-time cricket scores with AI-powered match summaries. T20 World Cup 2026, IPL, Test matches, ODI — ball-by-ball updates.',
  keywords: [
    'live cricket score',
    'T20 World Cup 2026 live score',
    'IPL live score 2026',
    'India cricket score today',
    'cricket score today',
  ],
};

export default function CricketPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-3xl mx-auto pb-20">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-extrabold">🏏 Live Cricket Scores</h1>
          <p className="text-sm text-gray-500 mt-1">
            T20 World Cup • IPL • International — updated every 30 seconds
          </p>
        </div>
        <CricketFeed />
      </div>
    </main>
  );
}
```

```tsx
// app/cricket/CricketFeed.tsx
'use client';

import { useLiveScores } from '@/lib/swr';
import { MatchCard } from '@/components/MatchCard';

export function CricketFeed() {
  const { data, isLoading } = useLiveScores('cricket');

  if (isLoading) return <div className="px-4"><LoadingSkeleton /></div>;

  return (
    <div className="px-4 space-y-3">
      {data?.matches.map((match: any) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-36 bg-surface-card rounded-xl animate-pulse border border-surface-border" />
      ))}
    </div>
  );
}
```

Do the same for `app/football/page.tsx` — swap "Cricket" for "Football" and the keywords accordingly.

### Step 13: Match Detail Page (SSR for SEO)

This is critical. When someone Googles "IND vs ENG score," this page should rank.

```tsx
// app/match/[id]/page.tsx
import type { Metadata } from 'next';
import { fetchMatch } from '@/lib/api';
import { MatchDetailClient } from './MatchDetailClient';

// Dynamic metadata based on match data
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const match = await fetchMatch(params.id);
    const title = `${match.teamA.name} vs ${match.teamB.name} Live Score — ${match.tournament}`;
    const desc = match.headline || `Follow ${match.teamA.name} vs ${match.teamB.name} live.`;
    return {
      title,
      description: desc,
      openGraph: { title, description: desc },
    };
  } catch {
    return { title: 'Match Score — MatchDay' };
  }
}

export default async function MatchPage({ params }: { params: { id: string } }) {
  // Server-side fetch for initial render (SEO)
  let initialData = null;
  try {
    initialData = await fetchMatch(params.id);
  } catch {}

  return <MatchDetailClient matchId={params.id} initialData={initialData} />;
}
```

```tsx
// app/match/[id]/MatchDetailClient.tsx
'use client';

import useSWR from 'swr';
import { fetchMatch } from '@/lib/api';
import { Header } from '@/components/Header';
import { LiveIndicator } from '@/components/LiveIndicator';

export function MatchDetailClient({
  matchId,
  initialData,
}: {
  matchId: string;
  initialData: any;
}) {
  const { data: match } = useSWR(
    ['match', matchId],
    () => fetchMatch(matchId),
    {
      fallbackData: initialData,
      refreshInterval: 15_000,   // Faster refresh on detail page
      revalidateOnFocus: true,
    }
  );

  if (!match) return <div className="min-h-screen bg-surface" />;

  const isLive = match.status === 'live';

  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Match header */}
        <div className="text-center mb-8">
          <p className="text-xs text-gray-400 font-semibold mb-2">
            {match.tournament}
          </p>
          {isLive && (
            <div className="flex justify-center mb-3">
              <LiveIndicator />
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="bg-surface-card rounded-2xl p-6 border border-surface-border mb-6">
          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="text-center flex-1">
              {match.teamA.logo && (
                <img src={match.teamA.logo} alt="" className="w-12 h-12 rounded-full mx-auto mb-2" />
              )}
              <p className="font-bold text-lg">{match.teamA.shortName || match.teamA.name}</p>
              <p className="text-2xl font-extrabold font-mono mt-1">{match.teamA.score}</p>
            </div>

            <span className="text-gray-600 text-xl font-bold px-4">vs</span>

            {/* Team B */}
            <div className="text-center flex-1">
              {match.teamB.logo && (
                <img src={match.teamB.logo} alt="" className="w-12 h-12 rounded-full mx-auto mb-2" />
              )}
              <p className="font-bold text-lg">{match.teamB.shortName || match.teamB.name}</p>
              <p className="text-2xl font-extrabold font-mono mt-1">{match.teamB.score}</p>
            </div>
          </div>
        </div>

        {/* AI Headline */}
        {match.headline && (
          <div className="bg-headline/10 rounded-xl px-4 py-3 mb-6 text-center">
            <p className="text-headline font-semibold">⚡ {match.headline}</p>
            {match.headlineHi && (
              <p className="text-headline/70 text-sm mt-1">{match.headlineHi}</p>
            )}
          </div>
        )}

        {/* Match info */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          {match.venue && <p>📍 {match.venue}</p>}
          <p>
            {new Date(match.startTime).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Cricket-specific extras */}
        {match.sport === 'cricket' && match.extras && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {match.extras.runRate && (
              <StatBox label="Run Rate" value={match.extras.runRate} />
            )}
            {match.extras.overs && (
              <StatBox label="Overs" value={match.extras.overs} />
            )}
            {match.extras.partnership && (
              <StatBox label="Partnership" value={match.extras.partnership} />
            )}
          </div>
        )}

        {/* Football-specific extras */}
        {match.sport === 'football' && match.extras && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {match.extras.possession && (
              <StatBox label="Possession" value={`${match.extras.possession}%`} />
            )}
            {match.extras.minute && (
              <StatBox label="Minute" value={`${match.extras.minute}'`} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-card rounded-lg p-3 text-center border border-surface-border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold font-mono mt-1">{value}</p>
    </div>
  );
}
```

### Step 14: PWA Setup (App-Like Experience on Mobile)

```json
// public/manifest.json
{
  "name": "MatchDay — Live Cricket & Football Scores",
  "short_name": "MatchDay",
  "description": "Live cricket and football scores with AI highlights",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F1117",
  "theme_color": "#0F1117",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // your next config
});
```

```bash
npm install next-pwa
```

This lets mobile users "Add to Home Screen" and get an app-like experience without the Play Store.

---

## Phase 5: SEO — Your Free Growth Engine (Days 16–18)

This is the biggest advantage of web over app. Do these:

### 1. Dynamic Sitemap

```tsx
// app/sitemap.ts
import { fetchScores } from '@/lib/api';

export default async function sitemap() {
  const data = await fetchScores();
  
  const matchPages = data.matches.map((m: any) => ({
    url: `https://matchday.live/match/${m.id}`,
    lastModified: m.lastUpdated,
    changeFrequency: m.status === 'live' ? 'always' : 'hourly',
    priority: m.status === 'live' ? 1.0 : 0.7,
  }));

  return [
    { url: 'https://matchday.live', lastModified: new Date(), priority: 1.0 },
    { url: 'https://matchday.live/cricket', lastModified: new Date(), priority: 0.9 },
    { url: 'https://matchday.live/football', lastModified: new Date(), priority: 0.9 },
    ...matchPages,
  ];
}
```

### 2. Structured Data (Google Rich Results)

Add JSON-LD to match pages so Google shows rich score cards in search results:

```tsx
// Add to match/[id]/page.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${match.teamA.name} vs ${match.teamB.name}`,
      startDate: match.startTime,
      location: { '@type': 'Place', name: match.venue },
      competitor: [
        { '@type': 'SportsTeam', name: match.teamA.name },
        { '@type': 'SportsTeam', name: match.teamB.name },
      ],
    }),
  }}
/>
```

### 3. Google Search Console

- Verify your domain on Google Search Console on day 1 of launch
- Submit your sitemap
- Monitor which queries bring traffic
- Target long-tail queries like "IND vs AUS T20 World Cup score today"

---

## Phase 6: Monetization (Days 18–20)

### Google AdSense (Primary)

Apply for AdSense once you have 10–15 pages of content (match pages count). Place ads:

```tsx
// components/AdSlot.tsx
'use client';

import { useEffect, useRef } from 'react';

export function AdSlot({ slot, format = 'auto' }: { slot: string; format?: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
```

Place `<AdSlot />` between every 4th–5th MatchCard in the feed and on the match detail page.

**Expected revenue for sports content:**
- India traffic: ₹5–15 CPM (web) vs ₹1–3 CPM (mobile app)
- 10,000 daily pageviews × ₹10 CPM = ₹100/day = ₹3,000/month
- 50,000 daily pageviews × ₹10 CPM = ₹500/day = ₹15,000/month

### Fantasy Sports Affiliates (Secondary)

Add "Play Fantasy" buttons on cricket match cards linking to Dream11, My11Circle. Affiliate payouts: ₹50–200 per registration.

---

## Phase 7: Launch & Deployment (Days 20–22)

### Deploy Frontend (Vercel — Free)

```bash
# Connect GitHub repo to Vercel
npm install -g vercel
vercel

# Or push to GitHub and connect via vercel.com dashboard
```

Custom domain setup:
- Buy `matchday.live` or similar (~₹800/year on Namecheap/Hostinger)
- Point DNS to Vercel (they handle SSL automatically)

### Deploy Backend (Railway — Free Tier)

```bash
# Push backend folder to a separate GitHub repo
# Connect to Railway via dashboard
# Set environment variables in Railway
```

### Launch Checklist

- [ ] Backend live and returning scores from both APIs
- [ ] Frontend deployed on Vercel with custom domain
- [ ] Google Search Console verified, sitemap submitted
- [ ] Google Analytics 4 installed
- [ ] PWA manifest working (test "Add to Home Screen" on mobile)
- [ ] OG image and Twitter card metadata working (test on opengraph.xyz)
- [ ] Core Web Vitals passing (test on PageSpeed Insights)
- [ ] CORS configured for production domain

---

## Timeline Summary (Web Version)

| Phase | Days | Deliverable |
|-------|------|-------------|
| 0. Validate | 1–2 | Keyword research, competitor gap confirmed |
| 1. Architecture | 3 | Tech stack decided, APIs signed up |
| 2. Data Sources | 3–4 | API accounts, test calls working |
| 3. Backend | 4–8 | Aggregator + AI summaries running |
| 4. Website Build | 8–16 | Next.js site with feed + match detail + SEO |
| 5. SEO Setup | 16–18 | Sitemap, structured data, Search Console |
| 6. Monetization | 18–20 | AdSense applied, affiliate links added |
| 7. Deploy & Launch | 20–22 | Live on custom domain |

**Total: ~3 weeks from start to live website.**
One week faster than the app, and you start ranking on Google immediately.

---

## Web-Specific Pitfalls to Avoid

1. **Don't skip SSR on match pages.** Client-side-only pages won't rank on Google. Use Next.js server components to render initial HTML with scores, then hydrate with SWR for live updates.

2. **Don't block rendering on API calls.** Use SWR's `keepPreviousData: true` so users always see something, even if stale. A 30-second-old score is better than a loading spinner.

3. **Don't ignore mobile web.** 85%+ of your Indian users will visit on phones. Test on Chrome Android at 3G speeds. The site must load in under 2 seconds.

4. **Don't use heavy images for team logos.** Use `next/image` with width/height props, or just use emoji flags for countries (🇮🇳 🏴󠁧󠁢󠁥󠁮󠁧󠁿) to save bandwidth.

5. **Don't forget `robots.txt`.** Allow Google to crawl all match pages. Block `/api/` routes from crawlers.

6. **Don't apply for AdSense too early.** Google wants to see real content and real traffic first. Wait until you have 20+ match pages with content and at least a few hundred daily visitors.

---

## After Launch: Web → App Funnel

Once the website is getting 5,000+ daily visitors, build the React Native app using the **exact same backend.** The web proves demand. The app adds push notifications and stickiness. Many users will discover you on the web and install the app for notifications.

This is the playbook Cricbuzz used — web first, app second.

---

## Your First 4 Actions Today

1. Sign up: CricAPI.com, RapidAPI (API-Football), Groq Cloud, Vercel
2. Make test API calls from Postman to both sports APIs
3. Run `npx create-next-app@latest matchday-web --typescript --tailwind --app`
4. Build the cricket adapter first — T20 World Cup is live, you'll have real data to test with now
