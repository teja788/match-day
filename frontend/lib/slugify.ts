import type { Match } from './cricketAdapter';

// Module-level bidirectional maps (persist within serverless invocation lifetime)
const slugToId = new Map<string, string>();
const idToSlug = new Map<string, string>();

function slugifyTeam(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateMatchSlug(match: Match): string {
  const teamA = slugifyTeam(match.teamA.shortName || match.teamA.name);
  const teamB = slugifyTeam(match.teamB.shortName || match.teamB.name);
  const date = match.startTime.split('T')[0]; // YYYY-MM-DD
  return `${teamA}-vs-${teamB}-${date}`;
}

export function generateMatchPath(match: Match): string {
  return `/${match.sport}/${match.slug || generateMatchSlug(match)}`;
}

export function registerSlug(slug: string, matchId: string, sport: string): void {
  const fullSlug = `${sport}/${slug}`;
  slugToId.set(fullSlug, matchId);
  idToSlug.set(matchId, fullSlug);
}

export function resolveSlugToId(sport: string, slug: string): string | null {
  return slugToId.get(`${sport}/${slug}`) || null;
}

export function resolveIdToSlug(matchId: string): string | null {
  return idToSlug.get(matchId) || null;
}
