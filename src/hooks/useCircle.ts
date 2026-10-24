import { useState, useEffect } from 'react';
import { userDoc, usersCol } from '@/services/firebase';
import { AppUser } from './useAuth';

/**
 * Listens in real-time to all friends in the user's circle.
 */
export function useCircle(myUid: string, circleIds: string[]) {
  const [friends, setFriends] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!myUid || circleIds.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    // Firestore 'in' query supports max 30 items; chunk if needed
    const chunks: string[][] = [];
    for (let i = 0; i < circleIds.length; i += 30) {
      chunks.push(circleIds.slice(i, i + 30));
    }

    const unsubscribers = chunks.map(chunk =>
      usersCol()
        .where(require('@react-native-firebase/firestore').default.FieldPath.documentId(), 'in', chunk)
        .onSnapshot(snap => {
          const chunkFriends = snap.docs.map(d => ({
            uid: d.id,
            ...(d.data() as Omit<AppUser, 'uid'>),
          }));
          setFriends(prev => {
            const others = prev.filter(f => !chunk.includes(f.uid));
            return [...others, ...chunkFriends];
          });
          setLoading(false);
        }),
    );

    return () => unsubscribers.forEach(u => u());
  }, [myUid, JSON.stringify(circleIds)]);

  return { friends, loading };
}
