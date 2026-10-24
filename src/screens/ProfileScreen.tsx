import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors } from '@/theme/colors';
import { useAuth } from '@/hooks/useAuth';
import { clearStatus } from '@/services/statusService';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleClearStatus = async () => {
    if (!user) return;
    await clearStatus(user.uid);
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{user.displayName[0]}</Text>
      </View>
      <Text style={styles.name}>{user.displayName}</Text>
      <Text style={styles.username}>@{user.username}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {/* Current status */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Current Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: user.status.isBusy ? Colors.busy : Colors.available }]} />
          <Text style={styles.statusText}>
            {user.status.isBusy
              ? `${user.status.emoji} ${user.status.message}`
              : '✅ Available'}
          </Text>
        </View>
        {user.status.isBusy && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearStatus}>
            <Text style={styles.clearBtnText}>Clear Status</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Circle stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{user.circle.length}</Text>
          <Text style={styles.statLabel}>In Circle</Text>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, alignItems: 'center', paddingBottom: 60 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: Colors.primary },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  username: { fontSize: 14, color: Colors.primary, marginTop: 2 },
  email: { fontSize: 13, color: Colors.textMuted, marginTop: 4, marginBottom: 24 },

  section: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  clearBtn: {
    marginTop: 12,
    backgroundColor: Colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  clearBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  statsRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: 'center',
  },
  statNum: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },

  signOutBtn: {
    width: '100%',
    backgroundColor: Colors.danger + '22',
    borderWidth: 1,
    borderColor: Colors.danger + '44',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutText: { color: Colors.danger, fontSize: 15, fontWeight: '700' },
});
