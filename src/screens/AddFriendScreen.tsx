import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors } from '@/theme/colors';
import { useAuth } from '@/hooks/useAuth';
import { searchUserByUsername, sendFriendRequest } from '@/services/circleService';

export default function AddFriendScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);
    setNotFound(false);
    const found = await searchUserByUsername(query.replace('@', ''));
    setSearching(false);
    if (!found) { setNotFound(true); return; }
    if (found.uid === user?.uid) {
      Toast.show({ type: 'error', text1: "That's you! 😄" });
      return;
    }
    if (user?.circle.includes(found.uid)) {
      Toast.show({ type: 'info', text1: 'Already in your circle' });
      return;
    }
    setResult(found);
  };

  const handleSend = async () => {
    if (!user || !result) return;
    setSending(true);
    try {
      await sendFriendRequest(user.uid, user.displayName, result.uid);
      Toast.show({ type: 'success', text1: '✅ Request sent!', text2: `To ${result.displayName}` });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message ?? 'Failed to send request' });
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Add to Circle</Text>
        <Text style={styles.sub}>Search by username to add someone</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="@username"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
            {searching ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {notFound && (
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>No user found with that username</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultAvatar}>
              <Text style={styles.resultAvatarText}>{result.displayName[0]}</Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{result.displayName}</Text>
              <Text style={styles.resultUsername}>@{result.username}</Text>
            </View>
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSend}
              activeOpacity={0.85}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.sendBtnText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },

  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  notFound: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  notFoundText: { color: Colors.textSecondary, fontSize: 14 },

  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultAvatarText: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  resultUsername: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  sendBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sendBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
