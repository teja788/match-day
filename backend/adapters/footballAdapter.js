const axios = require('axios');

const FOOTBALL_API_BASE = 'https://api-football-v1.p.rapidapi.com/v3';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

/**
 * Fetch live/today's football matches from API-Football (RapidAPI)
 * Free tier: 100 requests/day
 * Docs: https://rapidapi.com/api-sports/api/api-football
 */
async function fetchFootballMatches() {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    console.warn('[FootballAdapter] No API key configured — returning mock data');
    return getMockFootballMatches();
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await axios.get(`${FOOTBALL_API_BASE}/fixtures`, {
      params: { date: today, timezone: 'Asia/Kolkata' },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      },
      timeout: 10000,
    });

    if (!data.response || data.response.length === 0) {
      return getMockFootballMatches();
    }

    return data.response.map(normalizeFootballMatch);
  } catch (err) {
    console.error('[FootballAdapter] Fetch error:', err.message);
    return getMockFootballMatches();
  }
}

/**
 * Fetch a single football match by fixture ID
 */
async function fetchFootballMatch(fixtureId) {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    const mocks = getMockFootballMatches();
    return mocks.find((m) => m.id === fixtureId) || null;
  }

  try {
    const { data } = await axios.get(`${FOOTBALL_API_BASE}/fixtures`, {
      params: { id: fixtureId },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      },
      timeout: 10000,
    });

    if (!data.response || data.response.length === 0) return null;
    return normalizeFootballMatch(data.response[0]);
  } catch (err) {
    console.error('[FootballAdapter] Match fetch error:', err.message);
    return null;
  }
}

function normalizeFootballMatch(raw) {
  const fixture = raw.fixture || {};
  const league = raw.league || {};
  const teams = raw.teams || {};
  const goals = raw.goals || {};
  const score = raw.score || {};

  let status = 'upcoming';
  const shortStatus = fixture.status?.short || '';
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];
  const completedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];

  if (liveStatuses.includes(shortStatus)) status = 'live';
  else if (completedStatuses.includes(shortStatus)) status = 'completed';

  return {
    id: `football-${fixture.id}`,
    sport: 'football',
    status,
    tournament: league.name || 'Football Match',
    teamA: {
      name: teams.home?.name || 'Home',
      shortName: abbreviateFootball(teams.home?.name),
      logo: teams.home?.logo || '',
      score: goals.home != null ? String(goals.home) : '-',
    },
    teamB: {
      name: teams.away?.name || 'Away',
      shortName: abbreviateFootball(teams.away?.name),
      logo: teams.away?.logo || '',
      score: goals.away != null ? String(goals.away) : '-',
    },
    headline: '',
    headlineHi: '',
    startTime: fixture.date || new Date().toISOString(),
    venue: fixture.venue?.name || '',
    extras: {
      minute: fixture.status?.elapsed || null,
      possession: null,
      halfTime: score.halftime
        ? `${score.halftime.home ?? '-'} - ${score.halftime.away ?? '-'}`
        : null,
    },
    lastUpdated: new Date().toISOString(),
  };
}

function abbreviateFootball(name) {
  if (!name) return '???';
  if (name.length <= 4) return name.toUpperCase();
  // Common football club abbreviations
  const abbrevs = {
    'Manchester United': 'MUN', 'Manchester City': 'MCI',
    'Liverpool': 'LIV', 'Chelsea': 'CHE', 'Arsenal': 'ARS',
    'Tottenham Hotspur': 'TOT', 'Barcelona': 'BAR',
    'Real Madrid': 'RMA', 'Bayern Munich': 'BAY',
    'Paris Saint Germain': 'PSG', 'Juventus': 'JUV',
    'AC Milan': 'ACM', 'Inter Milan': 'INT',
    'Atletico Madrid': 'ATM', 'Borussia Dortmund': 'BVB',
  };
  return abbrevs[name] || name.substring(0, 3).toUpperCase();
}

function getMockFootballMatches() {
  return [
    {
      id: 'football-mock-1',
      sport: 'football',
      status: 'live',
      tournament: 'Premier League',
      teamA: { name: 'Arsenal', shortName: 'ARS', logo: '', score: '2' },
      teamB: { name: 'Manchester City', shortName: 'MCI', logo: '', score: '1' },
      headline: 'Saka scores a screamer to put Arsenal ahead!',
      headlineHi: 'साका के शानदार गोल से आर्सनल आगे!',
      startTime: new Date().toISOString(),
      venue: 'Emirates Stadium, London',
      extras: { minute: 67, possession: 45 },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'football-mock-2',
      sport: 'football',
      status: 'live',
      tournament: 'La Liga',
      teamA: { name: 'Real Madrid', shortName: 'RMA', logo: '', score: '3' },
      teamB: { name: 'Barcelona', shortName: 'BAR', logo: '', score: '3' },
      headline: 'El Clásico thriller! Six goals and counting',
      headlineHi: 'एल क्लासिको में गोलों की बरसात! 6 गोल हो चुके',
      startTime: new Date().toISOString(),
      venue: 'Santiago Bernabéu, Madrid',
      extras: { minute: 78, possession: 52 },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'football-mock-3',
      sport: 'football',
      status: 'completed',
      tournament: 'Champions League',
      teamA: { name: 'Liverpool', shortName: 'LIV', logo: '', score: '4' },
      teamB: { name: 'Bayern Munich', shortName: 'BAY', logo: '', score: '2' },
      headline: 'Liverpool dominate Bayern to reach semi-finals',
      headlineHi: 'लिवरपूल ने बायर्न को हराकर सेमीफाइनल में प्रवेश किया',
      startTime: new Date(Date.now() - 7200000).toISOString(),
      venue: 'Anfield, Liverpool',
      extras: { minute: 90, possession: 58 },
      lastUpdated: new Date().toISOString(),
    },
  ];
}

module.exports = { fetchFootballMatches, fetchFootballMatch };
