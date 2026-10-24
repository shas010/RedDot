import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { Colors } from '@/theme/colors';
import { useAuth } from '@/hooks/useAuth';
import { useCircle } from '@/hooks/useCircle';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { acceptFriendRequest, declineFriendRequest, removeFriend } from '@/services/circleService';
import FriendCard from '@/components/FriendCard';
import { RootStackParamList } from '@/navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CircleScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { friends } = useCircle(user?.uid ?? '', user?.circle ?? []);
  const { requests } = useFriendRequests(user?.uid ?? '');

  const handleAccept = async (reqId: string, fromUid: string) => {
    if (!user) return;
    await acceptFriendRequest(reqId, fromUid, user.uid);
    Toast.show({ type: 'success', text1: '✅ Friend added to circle!' });
  };

  const handleDecline = async (reqId: string) => {
    await declineFriendRequest(reqId);
  };

  const handleRemove = (friendUid: string, name: string) => {
    if (!user) return;
    Alert.alert('Remove from Circle', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => removeFriend(user.uid, friendUid),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Circle</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddFriend')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.sectionLabel}>Requests ({requests.length})</Text>
          {requests.map(req => (
            <View key={req.id} style={styles.requestCard}>
              <View style={styles.requestAvatar}>
                <Text style={styles.requestAvatarText}>{req.fromName[0]}</Text>
              </View>
              <Text style={styles.requestName} numberOfLines={1}>{req.fromName}</Text>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(req.id, req.from)}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDecline(req.id)}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Friends List */}
      <Text style={styles.sectionLabel}>
        {friends.length > 0 ? `${friends.length} People` : 'No friends yet'}
      </Text>

      <FlatList
        data={friends}
        keyExtractor={f => f.uid}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onRemove={() => handleRemove(item.uid, item.displayName)}
            showNotify
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>Add friends to see their status here</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  requestsSection: { paddingHorizontal: 20, marginBottom: 8 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  requestAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  requestName: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    backgroundColor: Colors.available,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  acceptBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  declineBtn: {
    backgroundColor: Colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  declineBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
});
