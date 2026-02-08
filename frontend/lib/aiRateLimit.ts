// Sliding window rate limiter for Groq API calls
const WINDOW_MS = 60_000; // 1 minute
const MAX_CALLS = 25; // Leave buffer below Groq's 30/min limit

let callTimestamps: number[] = [];

export function canCallGroq(): boolean {
  const now = Date.now();
  callTimestamps = callTimestamps.filter((t) => now - t < WINDOW_MS);
  return callTimestamps.length < MAX_CALLS;
}

export function recordGroqCall(): void {
  callTimestamps.push(Date.now());
}
