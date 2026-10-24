import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { userDoc } from './firebase';
import { updateHomeScreenWidget } from './widgetService';

// ─── Status presets ────────────────────────────────────────────────────────

export const STATUS_PRESETS = [
  { emoji: '📚', label: 'In Class' },
  { emoji: '💼', label: 'At Work' },
  { emoji: '😴', label: 'Sleeping' },
  { emoji: '🚗', label: 'Driving' },
  { emoji: '🎧', label: 'Do Not Disturb' },
  { emoji: '🏋️', label: 'At the Gym' },
  { emoji: '🍽️', label: 'Having Food' },
  { emoji: '✏️', label: 'Custom...' },
] as const;

export type StatusPreset = (typeof STATUS_PRESETS)[number];

export interface UserStatus {
  isBusy: boolean;
  emoji: string;
  message: string;
  updatedAt: FirebaseFirestore.Timestamp | null;
  endsAt: FirebaseFirestore.Timestamp | null;
}

export interface StatusHistoryEntry {
  id?: string;
  emoji: string;
  message: string;
  isBusy: boolean;
  startedAt: any;
  endedAt: any | null;
  durationMinutes?: number | null;
}

// ─── Subcollection reference ───────────────────────────────────────────────

export const statusHistoryCol = (uid: string) =>
  userDoc(uid).collection('statusHistory');

// ─── Set status with History logging ───────────────────────────────────────

export async function setStatus(
  uid: string,
  isBusy: boolean,
  emoji: string,
  message: string,
  endsInMinutes?: number,
): Promise<void> {
  const endsAt = endsInMinutes
    ? firestore.Timestamp.fromDate(
        new Date(Date.now() + endsInMinutes * 60 * 1000),
      )
    : null;

  const now = firestore.FieldValue.serverTimestamp();

  // 1. Update active user status
  await userDoc(uid).update({
    'status.isBusy': isBusy,
    'status.emoji': emoji,
    'status.message': message,
    'status.updatedAt': now,
    'status.endsAt': endsAt,
  });

  // 2. Log to history subcollection
  await statusHistoryCol(uid).add({
    emoji,
    message,
    isBusy,
    startedAt: now,
    endedAt: null,
    action: isBusy ? 'went_busy' : 'became_available',
  });

  // 3. Update Android home screen widget
  updateHomeScreenWidget(isBusy, emoji, message);
}

// ─── Clear status with History closing ─────────────────────────────────────

export async function clearStatus(uid: string): Promise<void> {
  const now = firestore.FieldValue.serverTimestamp();

  await userDoc(uid).update({
    'status.isBusy': false,
    'status.emoji': '',
    'status.message': '',
    'status.updatedAt': now,
    'status.endsAt': null,
  });

  // Find the last open 'went_busy' session and mark it ended
  try {
    const activeSessions = await statusHistoryCol(uid)
      .where('isBusy', '==', true)
      .where('endedAt', '==', null)
      .orderBy('startedAt', 'desc')
      .limit(1)
      .get();

    if (!activeSessions.empty) {
      const activeDoc = activeSessions.docs[0];
      await activeDoc.ref.update({
        endedAt: now,
      });
    }
  } catch (err) {
    console.log('Error closing previous session:', err);
  }

  // Also log the available event
  await statusHistoryCol(uid).add({
    emoji: '✅',
    message: 'Available',
    isBusy: false,
    startedAt: now,
    endedAt: null,
    action: 'cleared',
  });

  // Update Android home screen widget
  updateHomeScreenWidget(false, '✅', 'Available');
}

// ─── Save FCM token ────────────────────────────────────────────────────────

export async function saveFcmToken(uid: string): Promise<void> {
  const token = await messaging().getToken();
  await userDoc(uid).update({ fcmToken: token });

  messaging().onTokenRefresh(async newToken => {
    await userDoc(uid).update({ fcmToken: newToken });
  });
}
