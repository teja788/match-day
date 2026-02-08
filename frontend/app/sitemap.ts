import type { MetadataRoute } from 'next';
import { getScores } from '@/lib/scoreAggregator';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://frontend-one-xi-66.vercel.app';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cricket`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/football`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
  ];

  let matchPages: MetadataRoute.Sitemap = [];
  try {
    const data = await getScores();
    matchPages = data.matches.map((match) => ({
      url: `${baseUrl}/${match.sport}/${match.slug}`,
      lastModified: new Date(match.lastUpdated),
      changeFrequency: (match.status === 'live' ? 'always' : 'hourly') as 'always' | 'hourly',
      priority: match.status === 'live' ? 0.8 : 0.6,
    }));
  } catch {
    // If fetch fails, return static pages only
  }

  return [...staticPages, ...matchPages];
}
