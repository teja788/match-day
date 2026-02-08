import axios from 'axios';

const client = axios.create({ baseURL: '', timeout: 10000 });

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
