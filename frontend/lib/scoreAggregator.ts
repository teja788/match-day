import { fetchCricketMatches, fetchCricketMatch } from './cricketAdapter';
import type { Match } from './cricketAdapter';
import { fetchFootballMatches, fetchFootballMatch } from './footballAdapter';
import { generateHeadline } from './aiSummary';

// Simple in-memory cache (works within a single serverless invocation lifetime)
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlMs = 30000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

export async function getScores(sport?: string) {
  const cacheKey = `scores_${sport || 'all'}`;
  const cached = getCached<{ matches: Match[]; lastUpdated: string; count: number }>(cacheKey);
  if (cached) return cached;

  let matches: Match[] = [];

  if (!sport || sport === 'cricket') {
    const cricket = await fetchCricketMatches();
    matches = matches.concat(cricket);
  }

  if (!sport || sport === 'football') {
    const football = await fetchFootballMatches();
    matches = matches.concat(football);
  }

  // Sort: live first, then by start time descending
  matches.sort((a, b) => {
    const statusOrder: Record<string, number> = { live: 0, upcoming: 1, completed: 2 };
    const aDiff = statusOrder[a.status] ?? 3;
    const bDiff = statusOrder[b.status] ?? 3;
    if (aDiff !== bDiff) return aDiff - bDiff;
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  // Generate AI headlines for live matches without one
  for (const match of matches) {
    if (!match.headline && match.status === 'live') {
      try {
        const aiHeadline = await generateHeadline(match);
        if (aiHeadline) {
          match.headline = aiHeadline.en;
          match.headlineHi = aiHeadline.hi;
        }
      } catch {
        // AI headline generation is best-effort
      }
    }
  }

  const result = {
    matches,
    lastUpdated: new Date().toISOString(),
    count: matches.length,
  };

  setCache(cacheKey, result);
  return result;
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const cacheKey = `match_${matchId}`;
  const cached = getCached<Match>(cacheKey);
  if (cached) return cached;

  let match: Match | null = null;

  if (matchId.startsWith('football-')) {
    const fixtureId = matchId.replace('football-', '');
    match = await fetchFootballMatch(fixtureId);
  } else {
    match = await fetchCricketMatch(matchId);
  }

  if (match) {
    setCache(cacheKey, match, 15000);
  }

  return match;
}
