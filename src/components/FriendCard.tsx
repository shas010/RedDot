import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '@/theme/colors';
import { AppUser } from '@/hooks/useAuth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Props {
  friend: AppUser;
  onRemove?: () => void;
  showNotify?: boolean;
}

export default function FriendCard({ friend, onRemove, showNotify }: Props) {
  const isBusy = friend.status?.isBusy ?? false;

  const handleNotify = () => {
    // In production, call a Cloud Function endpoint to send targeted FCM to this friend
    Toast.show({
      type: 'success',
      text1: `🔔 Notified ${friend.displayName}`,
    });
  };

  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: isBusy ? Colors.busy + '22' : Colors.available + '22' }]}>
        <Text style={[styles.avatarText, { color: isBusy ? Colors.busy : Colors.available }]}>
          {friend.displayName[0]?.toUpperCase()}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{friend.displayName}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: isBusy ? Colors.busy : Colors.available }]} />
          <Text style={styles.statusText} numberOfLines={1}>
            {isBusy
              ? `${friend.status?.emoji ?? ''} ${friend.status?.message ?? 'Busy'}`
              : 'Available'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {showNotify && isBusy === false && (
          <TouchableOpacity style={styles.notifyBtn} onPress={handleNotify} activeOpacity={0.8}>
            <Text style={styles.notifyBtnText}>Notify</Text>
          </TouchableOpacity>
        )}
        {onRemove && (
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.8}>
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  notifyBtn: {
    backgroundColor: Colors.primary + '22',
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  notifyBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  removeBtn: {
    backgroundColor: Colors.cardBorder,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 12, color: Colors.textMuted },
});
