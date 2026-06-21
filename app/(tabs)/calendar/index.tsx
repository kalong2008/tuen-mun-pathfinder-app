import { API } from '@/lib/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';

import { Card } from '@/components/ui/Card';
import { LoadingView } from '@/components/ui/LoadingView';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useNativeTabScrollProps } from '@/hooks/useNativeTabScrollProps';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  getCombinedMonthActivities,
  getCombinedUpcomingActivities,
  type ActivitiesByDate,
  type CalendarActivity,
  type CombinedActivity,
} from '@/lib/calendar-utils';

const CAMP_COLOR = '#40916C';
const ACTIVITY_COLOR = '#74A892';
const TEXT_COLOR = 'white';

LocaleConfig.locales['zh'] = {
  monthNames: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天',
};
LocaleConfig.defaultLocale = 'zh';

function CustomDay({ date, state, marking }: any) {
  const isToday = date.dateString === new Date().toISOString().split('T')[0];
  const isDisabled = state === 'disabled';
  const isCamp = !isDisabled && marking?.color === CAMP_COLOR;
  const isStartingDay = isCamp && marking?.startingDay;
  const isEndingDay = isCamp && marking?.endingDay;
  const hasActivity = !isDisabled && marking?.color === ACTIVITY_COLOR;
  const isPeriod = isCamp && !isStartingDay && !isEndingDay;

  return (
    <View
      style={{
        width: isPeriod ? '140%' : isCamp ? '100%' : '60%',
        marginRight: isCamp && isStartingDay ? '-20%' : 0,
        marginLeft: isCamp && isEndingDay ? '-20%' : 0,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isCamp ? CAMP_COLOR : hasActivity ? ACTIVITY_COLOR : 'transparent',
        borderTopLeftRadius: isStartingDay ? 16 : 0,
        borderBottomLeftRadius: isStartingDay ? 16 : 0,
        borderTopRightRadius: isEndingDay ? 16 : 0,
        borderBottomRightRadius: isEndingDay ? 16 : 0,
        borderLeftWidth: isStartingDay ? 1 : 0,
        borderRightWidth: isEndingDay ? 1 : 0,
        borderColor: isCamp ? CAMP_COLOR : ACTIVITY_COLOR,
        overflow: 'hidden',
      }}
    >
      <Text
        style={{
          marginLeft: isCamp && isStartingDay ? '-20%' : 0,
          marginRight: isCamp && isEndingDay ? '-20%' : 0,
          fontWeight: isToday ? 'bold' : 'normal',
          color: isDisabled
            ? '#d9d9d9'
            : isToday
              ? '#1B4332'
              : isStartingDay || isEndingDay || isCamp || hasActivity
                ? TEXT_COLOR
                : '#333',
          textAlign: 'center',
          opacity: isDisabled ? 0.3 : 1,
        }}
      >
        {date.day}
      </Text>
    </View>
  );
}

function ActivityRow({
  item,
  onPress,
}: {
  item: CombinedActivity;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const { activity, dateLabel } = item;
  const isCamp = activity.isCamp;
  const content = (
    <>
      <Text style={[styles.activityDate, { color: colors.primary }]}>{dateLabel}</Text>
      <View style={styles.activityDetails}>
        <Text style={[styles.activityTitle, { color: colors.text }]}>
          {activity.title}
        </Text>
        <Text style={[styles.activityMeta, { color: colors.muted }]}>
          {activity.time} · {activity.location}
        </Text>
      </View>
    </>
  );

  const rowStyle = [
    styles.activityRow,
    { backgroundColor: colors.surface, borderColor: colors.border },
    isCamp && { borderLeftColor: colors.primary, borderLeftWidth: 4 },
  ];

  if (onPress) {
    return (
      <ScalePressable style={rowStyle} onPress={onPress}>
        {content}
      </ScalePressable>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const tabScrollProps = useNativeTabScrollProps();
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<ActivitiesByDate>({});
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(API.calendar());
        if (!response.ok) throw new Error(`Failed to load calendar: ${response.status}`);
        setActivities(await response.json());
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const upcoming = useMemo(
    () => getCombinedUpcomingActivities(activities, { additionalMonths: 2 }),
    [activities],
  );
  const monthActivities = useMemo(
    () => getCombinedMonthActivities(activities, currentMonth.substring(0, 7)),
    [activities, currentMonth],
  );

  const markedDates = useMemo(
    () =>
      Object.entries(activities).reduce(
        (acc, [date, dayActivities]) => {
          const activity = dayActivities[0];
          acc[date] = {
            ...activity.marking,
            color: activity.isCamp ? CAMP_COLOR : ACTIVITY_COLOR,
            textColor: TEXT_COLOR,
          };
          return acc;
        },
        {} as Record<string, object>,
      ),
    [activities],
  );

  const handleActivityPress = (activity: CalendarActivity) => {
    if (!activity.title.includes('集會')) {
      router.push('/(tabs)/notice');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingView message="載入活動…" />
      </View>
    );
  }

  return (
    <ScrollView
      {...tabScrollProps}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
        <SectionHeader title="即將舉行" />
        {upcoming.length > 0 ? (
          upcoming.map((item) => (
            <ActivityRow
              key={`${item.startDate}-${item.activity.id}-${item.activity.campKey ?? 'single'}`}
              item={item}
              onPress={
                item.activity.title.includes('集會')
                  ? undefined
                  : () => handleActivityPress(item.activity)
              }
            />
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>暫無即將舉行的活動</Text>
        )}

        <Pressable
          onPress={() => setShowCalendar((value) => !value)}
          style={[styles.calendarToggle, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Text style={[styles.calendarToggleText, { color: colors.primary }]}>
            {showCalendar ? '收起月曆' : '顯示月曆'}
          </Text>
        </Pressable>

        {showCalendar ? (
          <Card style={styles.calendarCard}>
            <Calendar
              onMonthChange={(month: DateData) => setCurrentMonth(month.dateString)}
              markedDates={markedDates}
              markingType="period"
              dayComponent={CustomDay}
              renderHeader={(date: Date) => {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                return (
                  <Text style={[styles.monthHeader, { color: colors.text }]}>
                    {`${year}年${month}月`}
                  </Text>
                );
              }}
            />
            <View style={styles.monthList}>
              {monthActivities.length > 0 ? (
                monthActivities.map((item) => (
                  <ActivityRow
                    key={`month-${item.startDate}-${item.activity.id}-${item.activity.campKey ?? 'single'}`}
                    item={item}
                    onPress={
                      item.activity.title.includes('集會')
                        ? undefined
                        : () => handleActivityPress(item.activity)
                    }
                  />
                ))
              ) : (
                <Text style={[styles.emptyText, { color: colors.muted }]}>本月沒有活動</Text>
              )}
            </View>
          </Card>
        ) : null}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  activityDate: {
    ...typography.label,
    minWidth: 72,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.xs,
  },
  activityMeta: {
    ...typography.caption,
  },
  emptyText: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  calendarToggle: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginVertical: spacing.lg,
  },
  calendarToggleText: {
    ...typography.label,
  },
  calendarCard: {
    padding: spacing.sm,
  },
  monthHeader: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  monthList: {
    marginTop: spacing.md,
  },
});
