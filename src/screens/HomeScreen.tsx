import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { Colors } from '@/theme/colors';
import { useAuth } from '@/hooks/useAuth';
import { useCircle } from '@/hooks/useCircle';
import { setStatus, clearStatus } from '@/services/statusService';
import { RootStackParamList } from '@/navigation/AppNavigator';
import FriendCard from '@/components/FriendCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { friends } = useCircle(user?.uid ?? '', user?.circle ?? []);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isBusy = user?.status.isBusy ?? false;

  // Pulsing ring animation when busy
  useEffect(() => {
    if (isBusy) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isBusy]);

  const handleToggle = async () => {
    if (!user) return;
    if (isBusy) {
      await clearStatus(user.uid);
      Toast.show({ type: 'success', text1: '✅ You\'re available now' });
    } else {
      // Go busy with last or default status, then open picker
      await setStatus(user.uid, true, '🔴', 'Busy');
      navigation.navigate('StatusPicker');
    }
  };

  const notifyCircle = async () => {
    // Cloud Function handles the actual FCM sends; just show feedback
    Toast.show({
      type: 'success',
      text1: '🔔 Circle notified!',
      text2: `"${user?.status.emoji} ${user?.status.message}"`,
    });
  };

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, {user.displayName.split(' ')[0]} 👋</Text>
        <Text style={styles.subGreeting}>
          {isBusy ? 'You\'re marked busy' : 'You\'re available'}
        </Text>
      </View>

      {/* ── Big Status Button ── */}
      <View style={styles.btnContainer}>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}
          pointerEvents="none"
        />
        <TouchableOpacity
          style={[styles.statusBtn, isBusy ? styles.statusBtnBusy : styles.statusBtnAvail]}
          onPress={handleToggle}
          activeOpacity={0.85}
        >
          <Text style={styles.statusBtnEmoji}>{isBusy ? '🔴' : '✅'}</Text>
          <Text style={styles.statusBtnLabel}>{isBusy ? 'Busy' : 'Available'}</Text>
          <Text style={styles.statusBtnHint}>Tap to {isBusy ? 'clear' : 'go busy'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Current Status Card ── */}
      {isBusy && (
        <View style={styles.statusCard}>
          <View style={styles.statusCardLeft}>
            <Text style={styles.statusCardEmoji}>{user.status.emoji || '🔴'}</Text>
            <View>
              <Text style={styles.statusCardTitle}>Currently busy</Text>
              <Text style={styles.statusCardMsg}>{user.status.message || 'Busy'}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('StatusPicker')}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Notify Buttons ── */}
      {isBusy && (
        <View style={styles.notifyRow}>
          <TouchableOpacity style={styles.notifyCircleBtn} onPress={notifyCircle} activeOpacity={0.85}>
            <Text style={styles.notifyCircleBtnText}>🔔  Notify Circle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notifyIndivBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Circle' } as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.notifyIndivBtnText}>👤 Individual</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Circle Feed ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Circle</Text>
        <Text style={styles.sectionCount}>{friends.length} people</Text>
      </View>

      {friends.length === 0 ? (
        <View style={styles.emptyCircle}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyText}>Your circle is empty</Text>
          <Text style={styles.emptySubText}>Go to the Circle tab to add friends</Text>
        </View>
      ) : (
        friends.map(friend => <FriendCard key={friend.uid} friend={friend} />)
      )}
    </ScrollView>
  );
}

const BTN_SIZE = 180;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  header: { marginBottom: 32 },
  greeting: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  subGreeting: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  btnContainer: { alignItems: 'center', marginBottom: 28, position: 'relative' },
  pulseRing: {
    position: 'absolute',
    width: BTN_SIZE + 40,
    height: BTN_SIZE + 40,
    borderRadius: (BTN_SIZE + 40) / 2,
    backgroundColor: Colors.busy + '22',
    alignSelf: 'center',
    top: -20,
  },
  statusBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.4,
  },
  statusBtnAvail: { backgroundColor: Colors.available, shadowColor: Colors.available },
  statusBtnBusy: { backgroundColor: Colors.busy, shadowColor: Colors.busy },
  statusBtnEmoji: { fontSize: 44, marginBottom: 4 },
  statusBtnLabel: { fontSize: 20, fontWeight: '800', color: Colors.white },
  statusBtnHint: { fontSize: 12, color: Colors.white + 'BB', marginTop: 2 },

  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusCardEmoji: { fontSize: 28 },
  statusCardTitle: { fontSize: 12, color: Colors.textMuted },
  statusCardMsg: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  editBtn: {
    backgroundColor: Colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  notifyRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  notifyCircleBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  notifyCircleBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  notifyIndivBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  notifyIndivBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sectionCount: { fontSize: 13, color: Colors.textMuted },

  emptyCircle: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  emptySubText: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
});
