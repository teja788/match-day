import { permanentRedirect, notFound } from 'next/navigation';
import { getScores, getMatch } from '@/lib/scoreAggregator';
import { resolveIdToSlug } from '@/lib/slugify';

export const dynamic = 'force-dynamic';

export default async function LegacyMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Populate slug map
  await getScores();
  const slugPath = resolveIdToSlug(id);

  if (slugPath) {
    permanentRedirect(`/${slugPath}`);
  }

  // Fallback: try to fetch the match and build the slug
  const match = await getMatch(id);
  if (match && match.slug) {
    permanentRedirect(`/${match.sport}/${match.slug}`);
  }

  notFound();
}
