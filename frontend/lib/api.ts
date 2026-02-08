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
