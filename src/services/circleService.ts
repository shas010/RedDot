import firestore from '@react-native-firebase/firestore';
import { userDoc, requestsCol, usersCol } from './firebase';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FriendRequest {
  id: string;
  from: string;
  to: string;
  fromName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Friend {
  uid: string;
  displayName: string;
  photoURL?: string;
  status: {
    isBusy: boolean;
    emoji: string;
    message: string;
    updatedAt: FirebaseFirestore.Timestamp | null;
  };
}

// ─── Search user by username ───────────────────────────────────────────────

export async function searchUserByUsername(username: string) {
  const snap = await usersCol()
    .where('username', '==', username.toLowerCase().trim())
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, ...doc.data() };
}

// ─── Send friend request ───────────────────────────────────────────────────

export async function sendFriendRequest(
  fromUid: string,
  fromName: string,
  toUid: string,
): Promise<void> {
  // Prevent duplicate requests
  const existing = await requestsCol()
    .where('from', '==', fromUid)
    .where('to', '==', toUid)
    .where('status', '==', 'pending')
    .get();

  if (!existing.empty) throw new Error('Request already sent');

  await requestsCol().add({
    from: fromUid,
    fromName,
    to: toUid,
    status: 'pending',
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ─── Accept / decline request ──────────────────────────────────────────────

export async function acceptFriendRequest(
  requestId: string,
  fromUid: string,
  toUid: string,
): Promise<void> {
  const batch = firestore().batch();

  // Mark request accepted
  batch.update(requestsCol().doc(requestId), { status: 'accepted' });

  // Add each other to circles
  batch.update(userDoc(fromUid), {
    circle: firestore.FieldValue.arrayUnion(toUid),
  });
  batch.update(userDoc(toUid), {
    circle: firestore.FieldValue.arrayUnion(fromUid),
  });

  await batch.commit();
}

export async function declineFriendRequest(requestId: string): Promise<void> {
  await requestsCol().doc(requestId).update({ status: 'declined' });
}

// ─── Remove friend ─────────────────────────────────────────────────────────

export async function removeFriend(
  myUid: string,
  friendUid: string,
): Promise<void> {
  const batch = firestore().batch();
  batch.update(userDoc(myUid), {
    circle: firestore.FieldValue.arrayRemove(friendUid),
  });
  batch.update(userDoc(friendUid), {
    circle: firestore.FieldValue.arrayRemove(myUid),
  });
  await batch.commit();
}
