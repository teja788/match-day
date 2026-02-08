import useSWR from 'swr';
import { fetchScores } from './api';

export function useLiveScores(sport?: string, fallbackData?: unknown) {
  return useSWR(
    ['scores', sport],
    () => fetchScores(sport),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
      keepPreviousData: true,
    }
  );
}
