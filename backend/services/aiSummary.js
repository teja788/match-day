const Groq = require('groq-sdk');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

let groqClient = null;

function getClient() {
  if (!groqClient && GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') {
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Generate a short, punchy AI headline for a match
 * Returns { en: string, hi: string } or null
 */
async function generateHeadline(match) {
  const client = getClient();
  if (!client) return null;

  const prompt = `You are a sports headline writer. Generate a short, exciting one-line headline (max 15 words) for this live match:

Sport: ${match.sport}
${match.teamA.name} ${match.teamA.score} vs ${match.teamB.name} ${match.teamB.score}
Tournament: ${match.tournament}
Venue: ${match.venue}

Respond in JSON format:
{"en": "English headline here", "hi": "Hindi headline here"}

Only output the JSON, nothing else.`;

  try {
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
    console.error('[AISummary] Generation error:', err.message);
    return null;
  }
}

module.exports = { generateHeadline };
