import type { Metadata } from 'next';
import { fetchMatch } from '@/lib/api';
import { MatchDetailClient } from './MatchDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const match = await fetchMatch(id);
    const title = `${match.teamA.name} vs ${match.teamB.name} Live Score — ${match.tournament}`;
    const desc =
      match.headline ||
      `Follow ${match.teamA.name} vs ${match.teamB.name} live.`;
    return {
      title,
      description: desc,
      openGraph: { title, description: desc },
    };
  } catch {
    return { title: 'Match Score — MatchDay' };
  }
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData = null;
  try {
    initialData = await fetchMatch(id);
  } catch {
    // Will render client-only if server fetch fails
  }

  return (
    <>
      {initialData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SportsEvent',
              name: `${initialData.teamA.name} vs ${initialData.teamB.name}`,
              startDate: initialData.startTime,
              location: { '@type': 'Place', name: initialData.venue },
              competitor: [
                { '@type': 'SportsTeam', name: initialData.teamA.name },
                { '@type': 'SportsTeam', name: initialData.teamB.name },
              ],
            }),
          }}
        />
      )}
      <MatchDetailClient matchId={id} initialData={initialData} />
    </>
  );
}
