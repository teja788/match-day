import useSWR from 'swr';
import { fetchScores } from './api';

export function useLiveScores(sport?: string) {
  return useSWR(
    ['scores', sport],
    () => fetchScores(sport),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
      keepPreviousData: true,
    }
  );
}
