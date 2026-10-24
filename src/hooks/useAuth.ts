import { useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { userDoc, usersCol } from '@/services/firebase';
import { saveFcmToken } from '@/services/statusService';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // ← Replace with your Firebase web client ID
});

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  username: string;
  circle: string[];
  status: {
    isBusy: boolean;
    emoji: string;
    message: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async fbUser => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Listen to Firestore user doc in real-time
      const unsubscribeDoc = userDoc(fbUser.uid).onSnapshot(snap => {
        if (snap.exists()) {
          setUser({ uid: fbUser.uid, ...(snap.data() as Omit<AppUser, 'uid'>) });
        }
        setLoading(false);
      });

      return () => unsubscribeDoc();
    });

    return unsubscribeAuth;
  }, []);

  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices();
    const { data } = await GoogleSignin.signIn();
    const credential = auth.GoogleAuthProvider.credential(data!.idToken);
    const result = await auth().signInWithCredential(credential);

    // Create user doc if first login
    const ref = userDoc(result.user.uid);
    const snap = await ref.get();

    if (!snap.exists()) {
      const username = result.user.email?.split('@')[0].toLowerCase() ?? 'user';
      await ref.set({
        displayName: result.user.displayName ?? 'User',
        email: result.user.email ?? '',
        photoURL: result.user.photoURL ?? null,
        username,
        circle: [],
        status: { isBusy: false, emoji: '', message: '' },
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    // Save push notification token
    await saveFcmToken(result.user.uid);
  };

  const signOut = async () => {
    await GoogleSignin.signOut();
    await auth().signOut();
  };

  return { user, firebaseUser, loading, signInWithGoogle, signOut };
}
