export interface WordItem {
  main: string;
  sub: string;
  romaji?: string;
}

export type CategoryKey = 'japanese' | 'english' | 'programming' | 'custom';
export type ThemeMode = 'dark' | 'light';

export interface DisplayParts {
  done: string;
  activeBuffer: string;
  activeRemaining: string;
  future: string;
}

export interface ResultStats {
  cpm: number;
  accuracy: string;
  accuracyNum: number;
  score: number;
  maxCombo: number;
  totalCorrectKeys: number;
  totalMissedKeys: number;
  rank: string;
  rankTitle: string;
  rankColor: string;
  category: CategoryKey;
}
