export type AlphabetRank = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

export interface RankInfo {
  rank: AlphabetRank;
  points: number;
  title: string;
  color: string;
  badgeClass: string;
}

/**
 * Calculates alphabet rank information from CPM and accuracy percentage.
 * Thresholds:
 * SSS: CPM >= 320 and accuracy >= 97% (250 pts)
 * SS:  CPM >= 260 and accuracy >= 95% (225 pts)
 * S:   CPM >= 200 and accuracy >= 90% (200 pts)
 * A:   CPM >= 150                      (160 pts)
 * B:   CPM >= 100                      (120 pts)
 * C:   CPM >= 60                       (80 pts)
 * D:   otherwise                       (60 pts)
 */
export function getRankInfo(cpm: number, accuracyNum: number): RankInfo {
  const safeCpm = Math.max(0, cpm || 0);
  const safeAcc = Math.max(0, accuracyNum || 0);

  if (safeCpm >= 320 && safeAcc >= 97) {
    return {
      rank: 'SSS',
      points: 250,
      title: '伝説の神速タイピスト 👑',
      color: 'from-amber-400 via-rose-500 to-purple-600',
      badgeClass: 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white font-black shadow-sm shadow-rose-500/20',
    };
  } else if (safeCpm >= 260 && safeAcc >= 95) {
    return {
      rank: 'SS',
      points: 225,
      title: '超人タイピスト 🔥',
      color: 'from-cyan-400 to-indigo-600',
      badgeClass: 'bg-gradient-to-r from-cyan-400 to-indigo-600 text-white font-black shadow-sm shadow-cyan-500/20',
    };
  } else if (safeCpm >= 200 && safeAcc >= 90) {
    return {
      rank: 'S',
      points: 200,
      title: 'マスタータイピスト ⚡',
      color: 'from-emerald-400 to-cyan-600',
      badgeClass: 'bg-gradient-to-r from-emerald-400 to-cyan-600 text-white font-extrabold shadow-sm shadow-emerald-500/20',
    };
  } else if (safeCpm >= 150) {
    return {
      rank: 'A',
      points: 160,
      title: '上級タイピスト ✨',
      color: 'from-blue-500 to-indigo-600',
      badgeClass: 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border border-blue-500/40 font-bold',
    };
  } else if (safeCpm >= 100) {
    return {
      rank: 'B',
      points: 120,
      title: '中級タイピスト 👍',
      color: 'from-slate-500 to-blue-600',
      badgeClass: 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/40 font-bold',
    };
  } else if (safeCpm >= 60) {
    return {
      rank: 'C',
      points: 80,
      title: '初中級タイピスト 🌸',
      color: 'from-teal-600 to-emerald-700',
      badgeClass: 'bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/40 font-bold',
    };
  } else {
    return {
      rank: 'D',
      points: 60,
      title: '初級タイピスト 🌱',
      color: 'from-slate-600 to-slate-800',
      badgeClass: 'bg-slate-500/20 text-slate-600 dark:text-slate-300 border border-slate-500/40 font-bold',
    };
  }
}

/**
 * Returns point value corresponding to the letter rank
 */
export function getRankPoints(rank: string): number {
  switch (rank?.toUpperCase()) {
    case 'SSS':
      return 250;
    case 'SS':
      return 225;
    case 'S':
      return 200;
    case 'A':
      return 160;
    case 'B':
      return 120;
    case 'C':
      return 80;
    case 'D':
    default:
      return 60;
  }
}
