import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Platform,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    ActivityHeader,
    getActivityHeaderHeight,
} from "@/components/activity/ActivityHeader";
import { ActivityListItem } from "@/components/activity/ActivityListItem";
import { ActivityMonthCalendar } from "@/components/activity/ActivityMonthCalendar";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingView } from "@/components/ui/LoadingView";
import { headerContentGap, spacing, typography } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNativeTabScrollProps } from "@/hooks/useNativeTabScrollProps";
import { API } from "@/lib/api";
import {
    filterCombinedActivities,
    getAllCombinedActivities,
    getCombinedMonthActivities,
    groupActivitiesByMonth,
    isRecurringMeeting,
    type ActivitiesByDate,
    type ActivityClubFilter,
    type ActivityTimelineFilter,
    type ActivityViewMode,
    type CombinedActivity,
} from "@/lib/calendar-utils";
import { findNoticeForActivity, type NoticeItem } from "@/lib/notice-utils";

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabScrollProps = useNativeTabScrollProps();
  const [activities, setActivities] = useState<ActivitiesByDate>({});
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clubFilter, setClubFilter] = useState<ActivityClubFilter>("all");
  const [timelineFilter, setTimelineFilter] =
    useState<ActivityTimelineFilter>("upcoming");
  const [viewMode, setViewMode] = useState<ActivityViewMode>("calendar");
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [headerHeight, setHeaderHeight] = useState(0);

  const contentTopInset =
    (headerHeight || getActivityHeaderHeight(insets.top)) + headerContentGap;
  const scrollContentTopInset = Math.max(0, contentTopInset - insets.top);

  const fetchData = useCallback(async () => {
    try {
      setLoadError(null);
      const [calendarRes, noticesRes] = await Promise.all([
        fetch(API.calendar()),
        fetch(API.notices()),
      ]);

      if (!calendarRes.ok) {
        throw new Error(`Failed to load calendar: ${calendarRes.status}`);
      }

      setActivities((await calendarRes.json()) as ActivitiesByDate);

      if (noticesRes.ok) {
        setNotices((await noticesRes.json()) as NoticeItem[]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setLoadError("無法載入活動，請稍後再試");
    }
  }, []);

  React.useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const allActivities = useMemo(
    () => getAllCombinedActivities(activities),
    [activities],
  );

  const filteredActivities = useMemo(
    () =>
      filterCombinedActivities(allActivities, {
        club: clubFilter,
        timeline: timelineFilter,
      }),
    [allActivities, clubFilter, timelineFilter],
  );

  const sections = useMemo(
    () => groupActivitiesByMonth(filteredActivities),
    [filteredActivities],
  );

  const monthActivities = useMemo(
    () => getCombinedMonthActivities(activities, currentMonth.substring(0, 7)),
    [activities, currentMonth],
  );

  const getActivityPressHandler = useCallback(
    (item: CombinedActivity) => {
      if (isRecurringMeeting(item.activity)) return undefined;

      const notice = findNoticeForActivity(notices, item);
      if (!notice) return undefined;

      return () => {
        router.push({
          pathname: "/noticeDetailModal",
          params: { id: notice.id },
        });
      };
    },
    [notices, router],
  );

  const renderActivityItem = useCallback(
    (item: CombinedActivity) => (
      <ActivityListItem item={item} onPress={getActivityPressHandler(item)} />
    ),
    [getActivityPressHandler],
  );

  const renderSectionItem = useCallback(
    ({ item }: { item: CombinedActivity }) => renderActivityItem(item),
    [renderActivityItem],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        {section.title}
      </Text>
    ),
    [colors.muted],
  );

  const renderMonthListItem = useCallback(
    ({ item }: { item: CombinedActivity }) => renderActivityItem(item),
    [renderActivityItem],
  );

  const renderMonthEmpty = useCallback(
    () => (
      <Text style={[styles.emptyMonthText, { color: colors.muted }]}>
        本月沒有活動
      </Text>
    ),
    [colors.muted],
  );

  const headerProps = {
    sticky: true,
    onLayout: setHeaderHeight,
    showOptions: !loading && !loadError,
    club: clubFilter,
    onClubChange: setClubFilter,
    timeline: timelineFilter,
    onTimelineChange: setTimelineFilter,
    viewMode,
    onViewModeChange: setViewMode,
  };

  const showList =
    !loading &&
    !loadError &&
    viewMode === "list" &&
    filteredActivities.length > 0;
  const showCalendar =
    !loading &&
    !loadError &&
    viewMode === "calendar" &&
    allActivities.length > 0;

  let body: React.ReactNode = null;

  if (loading) {
    body = <LoadingView message="載入活動…" />;
  } else if (loadError) {
    body = (
      <EmptyState
        icon={<Text style={styles.emptyIcon}>!</Text>}
        title="載入失敗"
        description={loadError}
        actionLabel="重試"
        onAction={handleRefresh}
      />
    );
  } else if (allActivities.length === 0) {
    body = (
      <EmptyState
        icon={<Text style={styles.emptyIcon}>📅</Text>}
        title="暫無活動"
        description="目前沒有已排定的活動"
      />
    );
  } else if (viewMode === "list" && filteredActivities.length === 0) {
    body = (
      <EmptyState
        icon={<Text style={styles.emptyIcon}>📅</Text>}
        title="沒有符合的活動"
        description="試試其他篩選條件"
      />
    );
  }

  return (
    <View
      collapsable={false}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {showList ? (
        <SectionList
          {...tabScrollProps}
          style={styles.list}
          sections={sections}
          renderItem={renderSectionItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) =>
            `${item.startDate}-${item.activity.id}-${item.activity.campKey ?? "single"}`
          }
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: scrollContentTopInset },
          ]}
          scrollIndicatorInsets={{ top: scrollContentTopInset }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => (
            <View style={styles.sectionSeparator} />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : showCalendar ? (
        <View style={[styles.calendarLayout, { paddingTop: contentTopInset }]}>
          <View
            style={[
              styles.stickyCalendar,
              { backgroundColor: colors.background },
            ]}
          >
            <ActivityMonthCalendar
              activities={activities}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </View>
          <FlatList
            {...tabScrollProps}
            style={styles.monthList}
            data={monthActivities}
            renderItem={renderMonthListItem}
            keyExtractor={(item) =>
              `month-${item.startDate}-${item.activity.id}-${item.activity.campKey ?? "single"}`
            }
            contentContainerStyle={styles.monthListContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={renderMonthEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        </View>
      ) : (
        <View style={[styles.staticBody, { paddingTop: contentTopInset }]}>
          {body}
        </View>
      )}

      <ActivityHeader {...headerProps} />
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },
  calendarLayout: {
    flex: 1,
  },
  stickyCalendar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  monthList: {
    flex: 1,
  },
  monthListContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
    flexGrow: 1,
  },
  emptyMonthText: {
    ...typography.body,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
  sectionSeparator: {
    height: spacing.xs,
  },
  emptyIcon: {
    fontSize: 28,
  },
});
