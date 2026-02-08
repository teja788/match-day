import type { Match } from './cricketAdapter';
import { getGroqClient } from './aiClient';
import { canCallGroq, recordGroqCall } from './aiRateLimit';

// Cache win probability for 60s per match
const probCache = new Map<string, { data: Match['winProbability']; expiry: number }>();

export async function generateWinProbability(
  match: Match
): Promise<Match['winProbability'] | null> {
  const cached = probCache.get(match.id);
  if (cached && Date.now() < cached.expiry) return cached.data ?? null;

  const client = getGroqClient();
  if (!client || !canCallGroq()) return null;

  const sportContext =
    match.sport === 'cricket'
      ? `Overs: ${match.extras?.overs || 'N/A'}`
      : `Minute: ${match.extras?.minute || 'N/A'}`;

  const drawField =
    match.sport === 'football' ? '"draw": <0-100 probability>,' : '';

  const prompt = `You are a sports analyst. Given this live ${match.sport} match, estimate win probability.

${match.teamA.name} ${match.teamA.score} vs ${match.teamB.name} ${match.teamB.score}
Tournament: ${match.tournament}
${sportContext}
Status: ${match.headline}

Respond in JSON:
{
  "teamA": <0-100 probability>,
  "teamB": <0-100 probability>,
  ${drawField}
  "confidence": "low" | "medium" | "high",
  "reasoning": "One sentence explanation"
}

Probabilities must sum to 100.`;

  try {
    recordGroqCall();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) return null;

    const parsed = JSON.parse(text);
    const result: Match['winProbability'] = {
      teamA: parsed.teamA ?? 50,
      teamB: parsed.teamB ?? 50,
      confidence: parsed.confidence || 'low',
      reasoning: parsed.reasoning || '',
    };
    if (parsed.draw != null) {
      result.draw = parsed.draw;
    }

    probCache.set(match.id, { data: result, expiry: Date.now() + 60_000 });
    return result;
  } catch (err) {
    console.error('[AIWinProbability] Generation error:', err);
    return null;
  }
}
