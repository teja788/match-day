import type { Match } from './cricketAdapter';
import { getGroqClient } from './aiClient';
import { canCallGroq, recordGroqCall } from './aiRateLimit';

export async function generateHeadline(
  match: Match
): Promise<{ en: string; hi: string } | null> {
  const client = getGroqClient();
  if (!client || !canCallGroq()) return null;

  const prompt = `You are a sports headline writer. Generate a short, exciting one-line headline (max 15 words) for this live match:

Sport: ${match.sport}
${match.teamA.name} ${match.teamA.score} vs ${match.teamB.name} ${match.teamB.score}
Tournament: ${match.tournament}
Venue: ${match.venue}

Respond in JSON format:
{"en": "English headline here", "hi": "Hindi headline here"}

Only output the JSON, nothing else.`;

  try {
    recordGroqCall();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) return null;

    return JSON.parse(text);
  } catch (err) {
    console.error('[AISummary] Generation error:', err);
    return null;
  }
}
