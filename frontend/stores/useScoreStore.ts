import { create } from 'zustand';

type Sport = 'cricket' | 'football';

interface ScoreStore {
  activeSport: Sport | 'all';
  setActiveSport: (sport: Sport | 'all') => void;
}

export const useScoreStore = create<ScoreStore>((set) => ({
  activeSport: 'all',
  setActiveSport: (sport) => set({ activeSport: sport }),
}));
