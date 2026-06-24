import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NoticeHeader, getNoticeHeaderHeight } from '@/components/notice/NoticeHeader';
import { NoticeListItem } from '@/components/notice/NoticeListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingView } from '@/components/ui/LoadingView';
import { spacing } from '@/constants/theme';
import { useNativeTabScrollProps } from '@/hooks/useNativeTabScrollProps';
import { useStickyHeaderContentInset } from '@/hooks/useStickyHeaderContentInset';
import { useAppTheme } from '@/hooks/useAppTheme';
import { API } from '@/lib/api';
import { type ActivitiesByDate } from '@/lib/calendar-utils';
import {
  filterNotices,
  type NoticeClubFilter,
  type NoticeItem,
  type NoticeTimelineFilter,
} from '@/lib/notice-utils';

function getNoticeSubtitle({
  count,
  total,
  loading,
}: {
  count: number;
  total?: number;
  loading?: boolean;
}) {
  if (loading) return '正在載入…';
  if (total !== undefined && count !== total) {
    return `共 ${count} 則通告（全部 ${total} 則）`;
  }
  return `共 ${count} 則通告`;
}

export default function NoticeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabScrollProps = useNativeTabScrollProps();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [calendarActivities, setCalendarActivities] = useState<ActivitiesByDate>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clubFilter, setClubFilter] = useState<NoticeClubFilter>('all');
  const [timelineFilter, setTimelineFilter] = useState<NoticeTimelineFilter>('active');
  const [headerHeight, setHeaderHeight] = useState(() => getNoticeHeaderHeight(insets.top));
  const { contentTopInset, scrollContentTopInset } = useStickyHeaderContentInset(
    headerHeight,
    getNoticeHeaderHeight,
  );

  const fetchNotices = useCallback(async () => {
    try {
      setLoadError(null);
      const [noticesRes, calendarRes] = await Promise.all([
        fetch(API.notices()),
        fetch(API.calendar()),
      ]);

      if (!noticesRes.ok) {
        throw new Error(`Network response was not ok: ${noticesRes.status}`);
      }

      setNotices(await noticesRes.json());

      if (calendarRes.ok) {
        setCalendarActivities((await calendarRes.json()) as ActivitiesByDate);
      }
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

  const filteredNotices = useMemo(
    () =>
      filterNotices(notices, {
        club: clubFilter,
        timeline: timelineFilter,
      }),
    [notices, clubFilter, timelineFilter],
  );

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
      <NoticeListItem
        notice={item}
        activities={calendarActivities}
        onPress={() => openNotice(item)}
      />
    ),
    [calendarActivities, openNotice],
  );

  const headerProps = {
    sticky: true,
    onLayout: setHeaderHeight,
    showOptions: !loading && !loadError,
    club: clubFilter,
    onClubChange: setClubFilter,
    timeline: timelineFilter,
    onTimelineChange: setTimelineFilter,
  };

  const subtitle = loading
    ? getNoticeSubtitle({ count: 0, loading: true })
    : getNoticeSubtitle({
        count: filteredNotices.length,
        total: notices.length,
      });

  const showNoticeList = !loading && !loadError && filteredNotices.length > 0;

  let body: React.ReactNode = null;

  if (loading) {
    body = <LoadingView message="載入通告…" />;
  } else if (loadError) {
    body = (
      <EmptyState
        icon={<Text style={styles.errorIcon}>!</Text>}
        title="載入失敗"
        description={loadError}
        actionLabel="重試"
        onAction={handleRefresh}
      />
    );
  } else if (notices.length === 0) {
    body = (
      <EmptyState
        icon={<Text style={styles.errorIcon}>📋</Text>}
        title="暫無通告"
        description="目前沒有活動通告"
      />
    );
  } else if (filteredNotices.length === 0) {
    body = (
      <View style={styles.emptyWrap}>
        <EmptyState
          icon={<Text style={styles.errorIcon}>📋</Text>}
          title="沒有符合的通告"
          description="試試其他篩選條件"
        />
      </View>
    );
  }

  return (
    <View
      collapsable={false}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {showNoticeList ? (
        <FlatList
          {...tabScrollProps}
          style={styles.list}
          data={filteredNotices}
          renderItem={renderNoticeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: scrollContentTopInset },
          ]}
          scrollIndicatorInsets={{ top: scrollContentTopInset }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <View style={[styles.staticBody, { paddingTop: contentTopInset }]}>{body}</View>
      )}

      <NoticeHeader {...headerProps} subtitle={subtitle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  staticBody: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  separator: {
    height: spacing.sm,
  },
  errorIcon: {
    fontSize: 28,
  },
});
