import { useState, useEffect } from 'react';
import { requestsCol } from '@/services/firebase';
import { FriendRequest } from '@/services/circleService';

/**
 * Listens for incoming pending friend requests for the current user.
 */
export function useFriendRequests(myUid: string) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (!myUid) return;

    const unsub = requestsCol()
      .where('to', '==', myUid)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        setRequests(
          snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<FriendRequest, 'id'>) })),
        );
      });

    return unsub;
  }, [myUid]);

  return { requests };
}
