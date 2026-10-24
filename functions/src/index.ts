import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

/**
 * Triggered whenever a user's status changes in Firestore.
 * Sends push notifications to all friends in their circle.
 */
export const onStatusChange = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;

    // Only fire when isBusy changes to true
    if (!after.status?.isBusy || before.status?.isBusy === after.status?.isBusy) {
      return null;
    }

    const senderName: string = after.displayName ?? 'Someone';
    const emoji: string = after.status?.emoji ?? '🔴';
    const message: string = after.status?.message ?? 'Busy';
    const circle: string[] = after.circle ?? [];

    if (circle.length === 0) return null;

    // Fetch FCM tokens for all circle members
    const friendDocs = await db.getAll(...circle.map(uid => db.doc(`users/${uid}`)));
    const tokens: string[] = friendDocs
      .filter(d => d.exists && d.data()?.fcmToken)
      .map(d => d.data()!.fcmToken as string);

    if (tokens.length === 0) return null;

    // Send multicast push notification
    const payload: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: `${senderName} is busy`,
        body: `${emoji} ${message}`,
      },
      data: {
        type: 'STATUS_CHANGE',
        userId,
        isBusy: 'true',
        message,
        emoji,
      },
      android: {
        priority: 'high',
        notification: { channelId: 'busy_status', sound: 'default' },
      },
    };

    const response = await fcm.sendEachForMulticast(payload);
    console.log(`Sent ${response.successCount}/${tokens.length} notifications`);
    return null;
  });

/**
 * HTTP callable: notify a specific individual (instead of whole circle).
 */
export const notifyIndividual = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const { targetUid, senderName, emoji, message } = data as {
    targetUid: string;
    senderName: string;
    emoji: string;
    message: string;
  };

  const targetDoc = await db.doc(`users/${targetUid}`).get();
  const token: string | undefined = targetDoc.data()?.fcmToken;

  if (!token) throw new functions.https.HttpsError('not-found', 'Target user has no FCM token');

  await fcm.send({
    token,
    notification: {
      title: `${senderName} wants your attention`,
      body: `${emoji} ${message}`,
    },
    data: { type: 'INDIVIDUAL_NOTIFY', senderUid: context.auth.uid },
  });

  return { success: true };
});
