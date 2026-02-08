const CRIC_API_BASE = 'https://api.cricapi.com/v1';

interface TeamScore {
  r?: number;
  w?: number;
  o?: number;
  inning?: string;
}

interface CricAPIMatch {
  id: string;
  teams?: string[];
  score?: TeamScore[];
  matchStarted?: boolean;
  matchEnded?: boolean;
  series?: string;
  name?: string;
  status?: string;
  dateTimeGMT?: string;
  venue?: string;
  teamInfo?: { name?: string; img?: string }[];
}

export interface Match {
  id: string;
  sport: string;
  status: string;
  tournament: string;
  teamA: { name: string; shortName: string; logo: string; score: string };
  teamB: { name: string; shortName: string; logo: string; score: string };
  headline: string;
  headlineHi: string;
  startTime: string;
  venue: string;
  extras: Record<string, unknown>;
  lastUpdated: string;
}

export async function fetchCricketMatches(): Promise<Match[]> {
  const API_KEY = process.env.CRIC_API_KEY;

  if (!API_KEY || API_KEY === 'your_cricapi_key_here') {
    return getMockCricketMatches();
  }

  try {
    const res = await fetch(
      `${CRIC_API_BASE}/currentMatches?apikey=${API_KEY}&offset=0`,
      { next: { revalidate: 30 } }
    );
    const data = await res.json();

    if (data.status !== 'success' || !data.data) {
      return getMockCricketMatches();
    }

    return data.data
      .filter((m: CricAPIMatch) => m.matchStarted || m.matchEnded)
      .map(normalizeCricketMatch);
  } catch (err) {
    console.error('[CricketAdapter] Fetch error:', err);
    return getMockCricketMatches();
  }
}

export async function fetchCricketMatch(matchId: string): Promise<Match | null> {
  const API_KEY = process.env.CRIC_API_KEY;

  if (!API_KEY || API_KEY === 'your_cricapi_key_here') {
    const mocks = getMockCricketMatches();
    return mocks.find((m) => m.id === matchId) || null;
  }

  try {
    const res = await fetch(
      `${CRIC_API_BASE}/match_info?apikey=${API_KEY}&id=${matchId}`,
      { next: { revalidate: 15 } }
    );
    const data = await res.json();

    if (data.status !== 'success' || !data.data) return null;
    return normalizeCricketMatch(data.data);
  } catch (err) {
    console.error('[CricketAdapter] Match fetch error:', err);
    return null;
  }
}

function findAllInningsForTeam(
  teamName: string,
  scores: TeamScore[]
): TeamScore[] {
  return scores.filter(
    (s) => s.inning && s.inning.toLowerCase().startsWith(teamName.toLowerCase())
  );
}

function formatInnings(innings: TeamScore[]): string {
  if (innings.length === 0) return '-';
  return innings
    .map((inn) => `${inn.r}/${inn.w} (${inn.o} ov)`)
    .join(' & ');
}

function normalizeCricketMatch(raw: CricAPIMatch): Match {
  const teams = raw.teams || [];
  const score = raw.score || [];

  const teamAName = teams[0] || 'Team A';
  const teamBName = teams[1] || 'Team B';

  // Match scores to correct teams using the inning field
  const teamAInnings = findAllInningsForTeam(teamAName, score);
  const teamBInnings = findAllInningsForTeam(teamBName, score);

  // Use the latest inning for extras (overs, etc.)
  const latestInning = teamAInnings[teamAInnings.length - 1] || {};

  let status = 'upcoming';
  if (raw.matchEnded) status = 'completed';
  else if (raw.matchStarted) status = 'live';

  // Find logo from teamInfo by matching name
  const teamAInfo = raw.teamInfo?.find(
    (t) => t.name && t.name.toLowerCase() === teamAName.toLowerCase()
  );
  const teamBInfo = raw.teamInfo?.find(
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

function abbreviate(name?: string): string {
  if (!name) return '???';
  if (name.length <= 4) return name.toUpperCase();
  const abbrevs: Record<string, string> = {
    India: 'IND', Australia: 'AUS', England: 'ENG',
    Pakistan: 'PAK', 'South Africa': 'SA', 'New Zealand': 'NZ',
    'Sri Lanka': 'SL', Bangladesh: 'BAN', 'West Indies': 'WI',
    Afghanistan: 'AFG', Zimbabwe: 'ZIM', Ireland: 'IRE',
    Nepal: 'NEP', 'United States of America': 'USA', USA: 'USA',
  };
  return abbrevs[name] || name.substring(0, 3).toUpperCase();
}

function getMockCricketMatches(): Match[] {
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
