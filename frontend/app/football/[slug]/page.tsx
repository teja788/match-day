import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getScores, getMatch } from '@/lib/scoreAggregator';
import { resolveSlugToId } from '@/lib/slugify';
import { MatchDetailClient } from '@/components/MatchDetailClient';
import { JsonLdSportsEvent } from '@/components/JsonLdSportsEvent';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  await getScores('football');
  const matchId = resolveSlugToId('football', slug);
  if (!matchId) return { title: 'Match Not Found — MatchDay' };

  const match = await getMatch(matchId);
  if (!match) return { title: 'Match Not Found — MatchDay' };

  const title = `${match.teamA.name} vs ${match.teamB.name} Live Score — ${match.tournament} | MatchDay`;
  const description =
    match.headline ||
    `${match.teamA.name} ${match.teamA.score} vs ${match.teamB.name} ${match.teamB.score} — Follow live at MatchDay`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: `/api/og?sport=football&slug=${slug}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/football/${slug}`,
    },
  };
}

export default async function FootballMatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await getScores('football');
  const matchId = resolveSlugToId('football', slug);

  if (!matchId) {
    notFound();
  }

  let match = null;
  try {
    match = await getMatch(matchId);
  } catch {
    // Client will handle fetch
  }

  return (
    <>
      {match && <JsonLdSportsEvent match={match} />}
      <MatchDetailClient matchId={matchId} initialData={match} />
    </>
  );
}
