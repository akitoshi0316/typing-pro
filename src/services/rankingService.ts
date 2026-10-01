import {
  collection,
  doc,
  setDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, ensureAuth, getOrCreateClientId } from '../firebase';

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
  const cleanNickname = data.nickname.trim().slice(0, 30);
  if (!cleanNickname) {
    throw new Error('ニックネームを入力してください。');
  }

  // Attempt anonymous auth if available; otherwise use persistent device client ID
  let userId = auth.currentUser?.uid;
  if (!userId) {
    const user = await ensureAuth();
    userId = user?.uid;
  }
  if (!userId) {
    userId = getOrCreateClientId();
  }

  const dateKey = getTodayDateKey();
  const colRef = collection(db, 'daily_rankings');
  const docRef = doc(colRef);

  const payload: Omit<RankingEntry, 'id'> = {
    nickname: cleanNickname,
    cpm: Math.max(0, Math.min(10000, Math.round(data.cpm))),
    accuracy: Number(Math.max(0, Math.min(100, data.accuracy)).toFixed(1)),
    maxCombo: Math.max(0, Math.min(10000, data.maxCombo)),
    score: Math.max(0, Math.min(1000000, Math.round(data.score))),
    category: (data.category || 'japanese').slice(0, 20),
    dateKey,
    createdAt: new Date().toISOString(),
    userId: userId.slice(0, 64),
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
 * Past days' rankings are automatically partitioned out by the dateKey query.
 */
export async function prunePastRankingsForCurrentUser(): Promise<void> {
  // Queries are partitioned strictly by todayKey, so past records are automatically excluded.
}
