import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors } from '@/theme/colors';
import { useAuth } from '@/hooks/useAuth';
import { setStatus } from '@/services/statusService';
import { STATUS_PRESETS } from '@/services/statusService';

export default function StatusPickerScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [customMsg, setCustomMsg] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [selected, setSelected] = useState<{ emoji: string; label: string } | null>(null);

  const handlePreset = async (emoji: string, label: string) => {
    if (label === 'Custom...') {
      setShowCustom(true);
      setSelected({ emoji: '✏️', label: '' });
      return;
    }
    setSelected({ emoji, label });
    setShowCustom(false);
    setCustomMsg('');
  };

  const handleSave = async () => {
    if (!user) return;
    const emoji = selected?.emoji ?? '🔴';
    const message = showCustom ? customMsg.trim() : (selected?.label ?? 'Busy');
    if (!message) {
      Toast.show({ type: 'error', text1: 'Enter a status message' });
      return;
    }
    await setStatus(user.uid, true, emoji, message);
    Toast.show({ type: 'success', text1: `${emoji} Status set!`, text2: message });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are you busy with?</Text>
        <Text style={styles.sub}>Pick a preset or write your own</Text>

        {/* Presets grid */}
        <View style={styles.grid}>
          {STATUS_PRESETS.map(({ emoji, label }) => {
            const isSelected = selected?.label === label && !showCustom;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                onPress={() => handlePreset(emoji, label)}
                activeOpacity={0.75}
              >
                <Text style={styles.presetEmoji}>{emoji}</Text>
                <Text style={[styles.presetLabel, isSelected && styles.presetLabelSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom input */}
        {showCustom && (
          <View style={styles.customBox}>
            <TextInput
              style={styles.customInput}
              placeholder="e.g. In a meeting until 3pm..."
              placeholderTextColor={Colors.textMuted}
              value={customMsg}
              onChangeText={setCustomMsg}
              maxLength={60}
              autoFocus
            />
            <Text style={styles.charCount}>{customMsg.length}/60</Text>
          </View>
        )}

        {/* Save button */}
        {selected && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>
              Set Status {selected.emoji}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  presetCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: 'flex-start',
    gap: 6,
  },
  presetCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  presetEmoji: { fontSize: 26 },
  presetLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  presetLabelSelected: { color: Colors.primary },

  customBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 20,
  },
  customInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 0,
  },
  charCount: { fontSize: 12, color: Colors.textMuted, textAlign: 'right', marginTop: 8 },

  saveBtn: {
    backgroundColor: Colors.busy,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
