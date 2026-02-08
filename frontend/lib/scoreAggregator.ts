import { fetchCricketMatches, fetchCricketMatch } from './cricketAdapter';
import type { Match } from './cricketAdapter';
import { fetchFootballMatches, fetchFootballMatch } from './footballAdapter';
import { generateHeadline } from './aiSummary';
import { generateMatchSummary } from './aiMatchSummary';
import { generateWinProbability } from './aiWinProbability';
import { generateMatchSlug, registerSlug } from './slugify';

// Simple in-memory cache (works within a single serverless invocation lifetime)
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data as T;
  cache.delete(key);
  return null;
}

// Default TTL: 5 minutes — keeps CricAPI free tier (100 req/day) within budget
function setCache(key: string, data: unknown, ttlMs = 300_000) {
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

  // Generate slugs and register slug-to-ID mappings
  for (const match of matches) {
    match.slug = generateMatchSlug(match);
    registerSlug(match.slug, match.id, match.sport);
  }

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

  // Generate match summaries and win probabilities for live matches
  for (const match of matches) {
    if (match.status === 'live') {
      match.matchPhase = detectMatchPhase(match);

      // Generate summary at break phases or for completed matches
      if (!match.summary) {
        try {
          const summary = await generateMatchSummary(match);
          if (summary) {
            match.summary = summary.summary;
            match.summaryHi = summary.summaryHi;
          }
        } catch { /* best-effort */ }
      }

      // Generate win probability for live matches
      if (!match.winProbability) {
        try {
          const prob = await generateWinProbability(match);
          if (prob) {
            match.winProbability = prob;
          }
        } catch { /* best-effort */ }
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

  // First check if the match exists in the scores cache (handles mock data IDs)
  for (const key of ['scores_all', 'scores_cricket', 'scores_football']) {
    const scoresCache = getCached<{ matches: Match[] }>(key);
    if (scoresCache) {
      const found = scoresCache.matches.find((m) => m.id === matchId);
      if (found) {
        setCache(cacheKey, found, 15000);
        return found;
      }
    }
  }

  let match: Match | null = null;

  if (matchId.startsWith('football-')) {
    const fixtureId = matchId.replace('football-', '');
    match = await fetchFootballMatch(fixtureId);
  } else {
    match = await fetchCricketMatch(matchId);
  }

  if (match) {
    match.slug = generateMatchSlug(match);
    registerSlug(match.slug, match.id, match.sport);
    if (match.status === 'live') {
      match.matchPhase = detectMatchPhase(match);
    }
    setCache(cacheKey, match, 15000);
  }

  return match;
}

function detectMatchPhase(match: Match): string {
  if (match.sport === 'football') {
    const minute = match.extras?.minute as number | null;
    if (!minute) return 'pre_match';
    if (minute <= 45) return 'first_half';
    if (minute <= 50) return 'halftime';
    if (minute <= 90) return 'second_half';
    return 'full_time';
  }

  // Cricket: use headline/status to infer phase
  const headline = (match.headline || '').toLowerCase();
  if (headline.includes('innings break') || headline.includes('inn break')) {
    return 'innings_break';
  }
  if (headline.includes('stumps') || headline.includes('tea') || headline.includes('lunch')) {
    return 'session_break';
  }
  return 'in_play';
}
