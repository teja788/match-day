import type { Match } from '@/lib/cricketAdapter';

export function JsonLdSportsEvent({ match }: { match: Match }) {
  const eventStatus =
    match.status === 'completed'
      ? 'https://schema.org/EventScheduled'
      : match.status === 'live'
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventScheduled';

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.teamA.name} vs ${match.teamB.name}`,
    description:
      match.headline ||
      `${match.teamA.name} ${match.teamA.score} vs ${match.teamB.name} ${match.teamB.score} - ${match.tournament}`,
    startDate: match.startTime,
    eventStatus,
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: match.venue || 'TBD',
    },
    competitor: [
      {
        '@type': 'SportsTeam',
        name: match.teamA.name,
        ...(match.teamA.logo ? { image: match.teamA.logo } : {}),
      },
      {
        '@type': 'SportsTeam',
        name: match.teamB.name,
        ...(match.teamB.logo ? { image: match.teamB.logo } : {}),
      },
    ],
    organizer: {
      '@type': 'Organization',
      name: match.tournament,
    },
  };

  if (match.status === 'completed') {
    jsonLd.result = `${match.teamA.shortName} ${match.teamA.score} vs ${match.teamB.shortName} ${match.teamB.score}`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
