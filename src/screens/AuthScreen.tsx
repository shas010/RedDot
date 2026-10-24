import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { Colors } from '@/theme/colors';
import { useAuth } from '@/hooks/useAuth';

export default function AuthScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Logo area */}
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🔴</Text>
        </View>
        <Text style={styles.appName}>Red Dot</Text>
        <Text style={styles.tagline}>
          Let your circle know when you're busy — with one tap.
        </Text>
      </View>

      {/* Sign In button */}
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle} activeOpacity={0.85}>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>No password needed. Just your Google account.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  logoEmoji: { fontSize: 48 },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 260,
  },
  bottom: {
    gap: 16,
    alignItems: 'center',
  },
  googleBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  googleBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
