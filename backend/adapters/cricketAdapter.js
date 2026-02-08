const axios = require('axios');

const CRIC_API_BASE = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRIC_API_KEY;

/**
 * Fetch current/recent cricket matches from CricAPI
 * Free tier: 100 requests/day
 * Docs: https://cricapi.com/
 */
async function fetchCricketMatches() {
  if (!API_KEY || API_KEY === 'your_cricapi_key_here') {
    console.warn('[CricketAdapter] No API key configured — returning mock data');
    return getMockCricketMatches();
  }

  try {
    const { data } = await axios.get(`${CRIC_API_BASE}/currentMatches`, {
      params: { apikey: API_KEY, offset: 0 },
      timeout: 10000,
    });

    if (data.status !== 'success' || !data.data) {
      console.warn('[CricketAdapter] API returned non-success:', data.info);
      return getMockCricketMatches();
    }

    return data.data
      .filter((m) => m.matchStarted || m.matchEnded)
      .map(normalizeCricketMatch);
  } catch (err) {
    console.error('[CricketAdapter] Fetch error:', err.message);
    return getMockCricketMatches();
  }
}

/**
 * Fetch a single cricket match by ID
 */
async function fetchCricketMatch(matchId) {
  if (!API_KEY || API_KEY === 'your_cricapi_key_here') {
    const mocks = getMockCricketMatches();
    return mocks.find((m) => m.id === matchId) || null;
  }

  try {
    const { data } = await axios.get(`${CRIC_API_BASE}/match_info`, {
      params: { apikey: API_KEY, id: matchId },
      timeout: 10000,
    });

    if (data.status !== 'success' || !data.data) return null;
    return normalizeCricketMatch(data.data);
  } catch (err) {
    console.error('[CricketAdapter] Match fetch error:', err.message);
    return null;
  }
}

function findAllInningsForTeam(teamName, scores) {
  return scores.filter(
    (s) => s.inning && s.inning.toLowerCase().startsWith(teamName.toLowerCase())
  );
}

function formatInnings(innings) {
  if (innings.length === 0) return '-';
  return innings
    .map((inn) => `${inn.r}/${inn.w} (${inn.o} ov)`)
    .join(' & ');
}

function normalizeCricketMatch(raw) {
  const teams = raw.teams || [];
  const score = raw.score || [];

  const teamAName = teams[0] || 'Team A';
  const teamBName = teams[1] || 'Team B';

  // Match scores to correct teams using the inning field
  const teamAInnings = findAllInningsForTeam(teamAName, score);
  const teamBInnings = findAllInningsForTeam(teamBName, score);

  const latestInning = teamAInnings[teamAInnings.length - 1] || {};

  let status = 'upcoming';
  if (raw.matchEnded) status = 'completed';
  else if (raw.matchStarted) status = 'live';

  // Find logo from teamInfo by matching name
  const teamAInfo = (raw.teamInfo || []).find(
    (t) => t.name && t.name.toLowerCase() === teamAName.toLowerCase()
  );
  const teamBInfo = (raw.teamInfo || []).find(
    (t) => t.name && t.name.toLowerCase() === teamBName.toLowerCase()
  );

  return {
    id: raw.id,
    sport: 'cricket',
    status,
    tournament: raw.series || raw.name || 'Cricket Match',
    teamA: {
      name: teamAName,
      shortName: abbreviate(teamAName),
      logo: teamAInfo?.img || '',
      score: formatInnings(teamAInnings),
    },
    teamB: {
      name: teamBName,
      shortName: abbreviate(teamBName),
      logo: teamBInfo?.img || '',
      score: formatInnings(teamBInnings),
    },
    headline: raw.status || '',
    headlineHi: '',
    startTime: raw.dateTimeGMT || new Date().toISOString(),
    venue: raw.venue || '',
    extras: {
      overs: latestInning.o || '',
      runRate: '',
      partnership: '',
    },
    lastUpdated: new Date().toISOString(),
  };
}

function abbreviate(name) {
  if (!name) return '???';
  if (name.length <= 4) return name.toUpperCase();
  // Common cricket abbreviations
  const abbrevs = {
    'India': 'IND', 'Australia': 'AUS', 'England': 'ENG',
    'Pakistan': 'PAK', 'South Africa': 'SA', 'New Zealand': 'NZ',
    'Sri Lanka': 'SL', 'Bangladesh': 'BAN', 'West Indies': 'WI',
    'Afghanistan': 'AFG', 'Zimbabwe': 'ZIM', 'Ireland': 'IRE',
  };
  return abbrevs[name] || name.substring(0, 3).toUpperCase();
}

function getMockCricketMatches() {
  return [
    {
      id: 'cricket-mock-1',
      sport: 'cricket',
      status: 'live',
      tournament: 'T20 World Cup 2026',
      teamA: { name: 'India', shortName: 'IND', logo: '', score: '186/4 (18.2 ov)' },
      teamB: { name: 'Australia', shortName: 'AUS', logo: '', score: '172/10 (19.4 ov)' },
      headline: 'Kohli smashes 89* as India chase down 173 target',
      headlineHi: 'कोहली की तूफानी 89* के साथ भारत ने 173 का लक्ष्य हासिल किया',
      startTime: new Date().toISOString(),
      venue: 'Eden Gardens, Kolkata',
      extras: { overs: '18.2', runRate: '10.14', partnership: '78 (42)' },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'cricket-mock-2',
      sport: 'cricket',
      status: 'live',
      tournament: 'IPL 2026',
      teamA: { name: 'Mumbai Indians', shortName: 'MI', logo: '', score: '145/6 (16.0 ov)' },
      teamB: { name: 'Chennai Super Kings', shortName: 'CSK', logo: '', score: '152/3 (15.2 ov)' },
      headline: 'CSK cruising towards target with Dhoni at the crease',
      headlineHi: 'धोनी की बदौलत CSK लक्ष्य की ओर बढ़ रहा है',
      startTime: new Date().toISOString(),
      venue: 'Wankhede Stadium, Mumbai',
      extras: { overs: '15.2', runRate: '9.91', partnership: '45 (28)' },
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'cricket-mock-3',
      sport: 'cricket',
      status: 'completed',
      tournament: 'T20 World Cup 2026',
      teamA: { name: 'England', shortName: 'ENG', logo: '', score: '156/8 (20 ov)' },
      teamB: { name: 'South Africa', shortName: 'SA', logo: '', score: '160/4 (18.4 ov)' },
      headline: 'South Africa win by 6 wickets to top Group B',
      headlineHi: 'दक्षिण अफ्रीका ने 6 विकेट से जीतकर ग्रुप B में शीर्ष पर',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      venue: 'Newlands, Cape Town',
      extras: { overs: '20', runRate: '8.56', partnership: '' },
      lastUpdated: new Date().toISOString(),
    },
  ];
}

module.exports = { fetchCricketMatches, fetchCricketMatch };
