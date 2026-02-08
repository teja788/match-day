import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq | null {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY;
    if (key && key !== 'your_groq_api_key_here') {
      groqClient = new Groq({ apiKey: key });
    }
  }
  return groqClient;
}
