import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NoticeListItem } from '@/components/notice/NoticeListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingView } from '@/components/ui/LoadingView';
import { radius, spacing, TARGET_COLORS, typography } from '@/constants/theme';
import { useNativeTabScrollProps } from '@/hooks/useNativeTabScrollProps';
import { useAppTheme } from '@/hooks/useAppTheme';
import { API } from '@/lib/api';
import {
  groupNoticesForTimeline,
  type NoticeItem,
} from '@/lib/notice-utils';
function ColorLegend() {
  const { colors } = useAppTheme();
  const items = [
    { label: '前鋒會', color: TARGET_COLORS.PATHFINDER },
    { label: '幼鋒會', color: TARGET_COLORS.ADVENTURER },
    { label: '前鋒會 + 幼鋒會', color: TARGET_COLORS.BOTH },
  ];

  return (
    <View style={[styles.legend, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={[styles.legendText, { color: colors.muted }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function NoticeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const tabScrollProps = useNativeTabScrollProps();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    try {
      setLoadError(null);
      const response = await fetch(API.notices());
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      setNotices(await response.json());
    } catch (err) {
      console.error('Failed to fetch notices:', err);
      setLoadError('無法載入通告，請稍後再試');
    }
  }, []);

  React.useEffect(() => {
    setLoading(true);
    fetchNotices().finally(() => setLoading(false));
  }, [fetchNotices]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  }, [fetchNotices]);

  const sections = useMemo(() => groupNoticesForTimeline(notices), [notices]);

  const openNotice = useCallback(
    (notice: NoticeItem) => {
      router.push({
        pathname: '/noticeDetailModal',
        params: { id: notice.id },
      });
    },
    [router],
  );

  const renderNoticeItem = useCallback(
    ({ item }: { item: NoticeItem }) => (
      <NoticeListItem notice={item} onPress={() => openNotice(item)} />
    ),
    [openNotice],
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => {
    const isUpcoming = section.title === '即將舉行';
    return (
      <Text
        style={[
          styles.sectionHeader,
          { color: isUpcoming ? colors.primary : colors.muted },
        ]}
      >
        {section.title}
      </Text>
    );
  };

  if (loading) {
    return <LoadingView message="載入通告…" />;
  }

  if (loadError) {
    return (
      <EmptyState
        icon={<Text style={styles.errorIcon}>!</Text>}
        title="載入失敗"
        description={loadError}
        actionLabel="重試"
        onAction={handleRefresh}
      />
    );
  }

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={<Text style={styles.errorIcon}>📋</Text>}
        title="暫無通告"
        description="目前沒有活動通告"
      />
    );
  }

  return (
    <SectionList
      {...tabScrollProps}
      style={styles.list}
      sections={sections}
      renderItem={renderNoticeItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={<ColorLegend />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  legendText: {
    ...typography.small,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  sectionHeader: {
    ...typography.label,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  errorIcon: {
    fontSize: 28,
  },
});
