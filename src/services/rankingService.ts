import {
  collection,
  doc,
  setDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth, ensureAuth } from '../firebase';

export interface RankingEntry {
  id: string;
  nickname: string;
  cpm: number;
  accuracy: number;
  maxCombo: number;
  score: number;
  category: string;
  dateKey: string;
  createdAt: string;
  userId: string;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Submits a new score to Firebase daily_rankings collection
 */
export async function submitScore(data: {
  nickname: string;
  cpm: number;
  accuracy: number;
  maxCombo: number;
  score: number;
  category: string;
}): Promise<string> {
  const user = await ensureAuth();
  if (!user) {
    throw new Error('スコア登録には認証が必要です。');
  }

  const dateKey = getTodayDateKey();
  const colRef = collection(db, 'daily_rankings');
  const docRef = doc(colRef);

  const payload: Omit<RankingEntry, 'id'> = {
    nickname: data.nickname.trim().slice(0, 30),
    cpm: Math.max(0, Math.round(data.cpm)),
    accuracy: Number(Math.max(0, Math.min(100, data.accuracy)).toFixed(1)),
    maxCombo: Math.max(0, data.maxCombo),
    score: Math.max(0, Math.round(data.score)),
    category: data.category.slice(0, 20),
    dateKey,
    createdAt: new Date().toISOString(),
    userId: user.uid,
  };

  await setDoc(docRef, payload);
  return docRef.id;
}

/**
 * Subscribes to today's rankings in real time.
 * Data is strictly isolated to today's dateKey (YYYY-MM-DD), so previous days' records
 * are automatically filtered out when a new day arrives.
 */
export function subscribeTodayRankings(
  onUpdate: (rankings: RankingEntry[]) => void,
  onError?: (err: Error) => void
): () => void {
  const todayKey = getTodayDateKey();
  const colRef = collection(db, 'daily_rankings');
  const q = query(colRef, where('dateKey', '==', todayKey));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: RankingEntry[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Omit<RankingEntry, 'id'>;
        list.push({
          id: d.id,
          ...data,
        });
      });

      // Sort in memory: higher score first, then higher CPM, then higher accuracy
      list.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.cpm !== a.cpm) return b.cpm - a.cpm;
        return b.accuracy - a.accuracy;
      });

      onUpdate(list);
    },
    (err) => {
      console.error('Error listening to daily rankings:', err);
      onError?.(err);
    }
  );
}

/**
 * Prunes past days' rankings created by this user
 */
export async function prunePastRankingsForCurrentUser(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const todayKey = getTodayDateKey();
    const colRef = collection(db, 'daily_rankings');
    const q = query(colRef, where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const deletes: Promise<void>[] = [];
    snap.forEach((d) => {
      const data = d.data() as RankingEntry;
      if (data.dateKey !== todayKey) {
        deletes.push(deleteDoc(d.ref));
      }
    });
    if (deletes.length > 0) {
      await Promise.all(deletes);
    }
  } catch (e) {
    console.warn('Pruning past rankings:', e);
  }
}
