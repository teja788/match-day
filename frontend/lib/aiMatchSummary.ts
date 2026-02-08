import type { Match } from './cricketAdapter';
import { getGroqClient } from './aiClient';
import { canCallGroq, recordGroqCall } from './aiRateLimit';

// Cache summaries with no expiry (they don't change once generated for a phase)
const summaryCache = new Map<string, { summary: string; summaryHi: string }>();

export async function generateMatchSummary(
  match: Match
): Promise<{ summary: string; summaryHi: string } | null> {
  const cacheKey = `${match.id}_${match.matchPhase}`;
  const cached = summaryCache.get(cacheKey);
  if (cached) return cached;

  const client = getGroqClient();
  if (!client || !canCallGroq()) return null;

  const prompt =
    match.sport === 'cricket'
      ? `You are a cricket commentator. Write a 3-4 sentence match summary for this cricket match at the current stage.

Teams: ${match.teamA.name} ${match.teamA.score} vs ${match.teamB.name} ${match.teamB.score}
Tournament: ${match.tournament}
Venue: ${match.venue}
Status: ${match.headline}

Respond in JSON: {"en": "English summary", "hi": "Hindi summary"}`
      : `You are a football commentator. Write a 3-4 sentence match summary for this football match.

Teams: ${match.teamA.name} ${match.teamA.score} vs ${match.teamB.name} ${match.teamB.score}
Tournament: ${match.tournament}
Venue: ${match.venue}
Phase: ${match.matchPhase}

Respond in JSON: {"en": "English summary", "hi": "Hindi summary"}`;

  try {
    recordGroqCall();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) return null;

    const parsed = JSON.parse(text);
    const result = {
      summary: parsed.en || '',
      summaryHi: parsed.hi || '',
    };

    summaryCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[AIMatchSummary] Generation error:', err);
    return null;
  }
}
