import { useState, useEffect } from 'react';
import { statusHistoryCol, StatusHistoryEntry } from '@/services/statusService';

export function useStatusHistory(uid?: string) {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const unsub = statusHistoryCol(uid)
      .orderBy('startedAt', 'desc')
      .limit(50)
      .onSnapshot(
        snapshot => {
          const list: StatusHistoryEntry[] = snapshot.docs.map(doc => {
            const data = doc.data();
            let durationMinutes: number | null = null;
            if (data.startedAt && data.endedAt) {
              const startMs = data.startedAt.toMillis ? data.startedAt.toMillis() : new Date(data.startedAt).getTime();
              const endMs = data.endedAt.toMillis ? data.endedAt.toMillis() : new Date(data.endedAt).getTime();
              durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
            }
            return {
              id: doc.id,
              emoji: data.emoji || (data.isBusy ? '🔴' : '✅'),
              message: data.message || (data.isBusy ? 'Busy' : 'Available'),
              isBusy: data.isBusy ?? false,
              startedAt: data.startedAt,
              endedAt: data.endedAt,
              durationMinutes,
            };
          });
          setHistory(list);
          setLoading(false);
        },
        err => {
          console.error('Error fetching history:', err);
          setLoading(false);
        },
      );

    return () => unsub();
  }, [uid]);

  return { history, loading };
}
