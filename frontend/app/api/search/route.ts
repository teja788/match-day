import { NextRequest, NextResponse } from 'next/server';
import { getScores } from '@/lib/scoreAggregator';
import { getGroqClient } from '@/lib/aiClient';
import { canCallGroq, recordGroqCall } from '@/lib/aiRateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query required' }, { status: 400 });
    }

    const client = getGroqClient();
    if (!client || !canCallGroq()) {
      return NextResponse.json({
        matchIds: [],
        response: 'AI search is temporarily unavailable. Please try again.',
        responseHi: '',
      });
    }

    const scores = await getScores();
    const matchSummaries = scores.matches.map((m) => ({
      id: m.id,
      slug: m.slug,
      sport: m.sport,
      teams: `${m.teamA.name} vs ${m.teamB.name}`,
      score: `${m.teamA.score} - ${m.teamB.score}`,
      tournament: m.tournament,
      status: m.status,
      headline: m.headline,
    }));

    const prompt = `You are a sports search assistant. Given these matches and the user's query, return the most relevant matches.

Matches:
${JSON.stringify(matchSummaries, null, 2)}

User query: "${query}"

Respond in JSON:
{
  "matchIds": ["id1", "id2"],
  "response": "Natural language response to the query",
  "responseHi": "Hindi response"
}

If no matches are relevant, return empty matchIds and explain why.`;

    recordGroqCall();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      return NextResponse.json({
        matchIds: [],
        response: 'Could not process your search. Please try again.',
        responseHi: '',
      });
    }

    const result = JSON.parse(text);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /search] Error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
