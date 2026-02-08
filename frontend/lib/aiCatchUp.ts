import type { Match } from './cricketAdapter';
import { getGroqClient } from './aiClient';
import { canCallGroq, recordGroqCall } from './aiRateLimit';

export async function generateCatchUp(
  match: Match,
  lastVisitISO: string
): Promise<{ en: string; hi: string } | null> {
  const client = getGroqClient();
  if (!client || !canCallGroq()) return null;

  const minutesAgo = Math.round(
    (Date.now() - new Date(lastVisitISO).getTime()) / 60000
  );

  if (minutesAgo < 1) return null;

  const prompt = `The user last checked this ${match.sport} match ${minutesAgo} minutes ago.
Current state: ${match.teamA.name} ${match.teamA.score} vs ${match.teamB.name} ${match.teamB.score}
Tournament: ${match.tournament}
Match status: ${match.status}
Headline: ${match.headline}

Write a 2-3 sentence catch-up summary telling the user what likely happened since their last visit. Be specific about score changes and key moments.
Respond in JSON: {"en": "English catch-up", "hi": "Hindi catch-up"}`;

  try {
    recordGroqCall();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 250,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) return null;

    return JSON.parse(text);
  } catch (err) {
    console.error('[AICatchUp] Generation error:', err);
    return null;
  }
}
