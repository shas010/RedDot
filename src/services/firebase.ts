/**
 * Firebase initialization.
 * @react-native-firebase auto-initializes from google-services.json (Android)
 * and GoogleService-Info.plist (iOS). No manual init needed.
 *
 * Place your google-services.json at: android/app/google-services.json
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export { auth, firestore, messaging };

// ── Firestore collection helpers ──────────────────────────────────────────────

export const usersCol = () => firestore().collection('users');
export const userDoc = (uid: string) => usersCol().doc(uid);

export const requestsCol = () => firestore().collection('friendRequests');
