const { fetchCricketMatches, fetchCricketMatch } = require('../adapters/cricketAdapter');
const { fetchFootballMatches, fetchFootballMatch } = require('../adapters/footballAdapter');
const { generateHeadline } = require('./aiSummary');
const NodeCache = require('node-cache');

// Cache scores for 30 seconds to avoid burning API quota
const cache = new NodeCache({ stdTTL: 30 });

/**
 * Get all live/recent scores, optionally filtered by sport
 */
async function getScores(sport) {
  const cacheKey = `scores_${sport || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let matches = [];

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
    const statusOrder = { live: 0, upcoming: 1, completed: 2 };
    const aDiff = statusOrder[a.status] ?? 3;
    const bDiff = statusOrder[b.status] ?? 3;
    if (aDiff !== bDiff) return aDiff - bDiff;
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  // Generate AI headlines for matches that don't have one
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

  cache.set(cacheKey, result);
  return result;
}

/**
 * Get a single match by its ID
 */
async function getMatch(matchId) {
  const cacheKey = `match_${matchId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let match = null;

  if (matchId.startsWith('football-')) {
    const fixtureId = matchId.replace('football-', '');
    match = await fetchFootballMatch(fixtureId);
  } else {
    match = await fetchCricketMatch(matchId);
  }

  if (match) {
    cache.set(cacheKey, match, 15); // Cache individual matches for 15s
  }

  return match;
}

module.exports = { getScores, getMatch };
