import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useStatusHistory } from '@/hooks/useStatusHistory';
import { StatusHistoryEntry } from '@/services/statusService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { history, loading } = useStatusHistory(user?.uid);
  const [filter, setFilter] = useState<'all' | 'busy' | 'available'>('all');

  const filteredHistory = history.filter(item => {
    if (filter === 'busy') return item.isBusy;
    if (filter === 'available') return !item.isBusy;
    return true;
  });

  const totalBusyEvents = history.filter(h => h.isBusy).length;

  const renderItem = ({ item }: { item: StatusHistoryEntry }) => {
    const isBusy = item.isBusy;
    const startText = item.startedAt
      ? dayjs(item.startedAt.toDate ? item.startedAt.toDate() : item.startedAt).format('MMM D, h:mm A')
      : 'Just now';

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatarBadge,
            {
              backgroundColor: isBusy ? theme.busy + '20' : theme.available + '20',
            },
          ]}
        >
          <Text style={styles.emojiText}>{item.emoji}</Text>
        </View>

        <View style={styles.itemContent}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.itemTitle,
                { color: theme.textPrimary },
              ]}
              numberOfLines={1}
            >
              {item.message}
            </Text>
            <Text
              style={[
                styles.badgeStatus,
                {
                  color: isBusy ? theme.busy : theme.available,
                  backgroundColor: isBusy ? theme.busy + '15' : theme.available + '15',
                },
              ]}
            >
              {isBusy ? 'Busy' : 'Available'}
            </Text>
          </View>

          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {startText}
          </Text>

          {item.durationMinutes ? (
            <View style={styles.durationRow}>
              <Text style={[styles.durationLabel, { color: theme.textMuted }]}>
                Duration:
              </Text>
              <Text style={[styles.durationValue, { color: theme.accent }]}>
                {item.durationMinutes} min
              </Text>
            </View>
          ) : isBusy && !item.endedAt ? (
            <View style={styles.durationRow}>
              <View style={[styles.liveDot, { backgroundColor: theme.busy }]} />
              <Text style={[styles.durationValue, { color: theme.busy }]}>
                Active Session
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryNumber, { color: theme.accent }]}>
            {history.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Logs</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryNumber, { color: theme.busy }]}>
            {totalBusyEvents}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Busy Sessions</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['all', 'busy', 'available'] as const).map(tab => {
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              style={[
                styles.filterBtn,
                isActive && { backgroundColor: theme.accent },
                !isActive && { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={theme.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={item => item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                No Activity Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Every time you switch between busy or available, the timestamp and duration are saved here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 26,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  itemContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  badgeStatus: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    marginTop: 3,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  durationValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
