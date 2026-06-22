import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";

import { Card } from "@/components/ui/Card";
import { spacing, typography } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ActivitiesByDate } from "@/lib/calendar-utils";

LocaleConfig.locales["zh"] = {
  monthNames: [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ],
  monthNamesShort: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  dayNames: [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ],
  dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
  today: "今天",
};
LocaleConfig.defaultLocale = "zh";

type CalendarDayProps = {
  date?: { day: number; dateString: string };
  state?: string;
  marking?: {
    color?: string;
    startingDay?: boolean;
    endingDay?: boolean;
  };
  campColor: string;
  activityColor: string;
  todayTextColor: string;
  disabledTextColor: string;
  defaultTextColor: string;
};

function CalendarDay({
  date,
  state,
  marking,
  campColor,
  activityColor,
  todayTextColor,
  disabledTextColor,
  defaultTextColor,
}: CalendarDayProps) {
  if (!date) return null;

  const today = new Date().toISOString().split("T")[0];
  const isToday = date.dateString === today;
  const isDisabled = state === "disabled";
  const isCamp = !isDisabled && marking?.color === campColor;
  const isStartingDay = isCamp && marking?.startingDay;
  const isEndingDay = isCamp && marking?.endingDay;
  const hasActivity = !isDisabled && marking?.color === activityColor;
  const isPeriod = isCamp && !isStartingDay && !isEndingDay;
  const marked = isCamp || hasActivity;

  return (
    <View
      style={{
        width: isPeriod ? "140%" : isCamp ? "100%" : "60%",
        marginRight: isCamp && isStartingDay ? "-20%" : 0,
        marginLeft: isCamp && isEndingDay ? "-20%" : 0,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isCamp
          ? campColor
          : hasActivity
            ? activityColor
            : "transparent",
        borderTopLeftRadius: isStartingDay ? 16 : 0,
        borderBottomLeftRadius: isStartingDay ? 16 : 0,
        borderTopRightRadius: isEndingDay ? 16 : 0,
        borderBottomRightRadius: isEndingDay ? 16 : 0,
        borderLeftWidth: isStartingDay ? 1 : 0,
        borderRightWidth: isEndingDay ? 1 : 0,
        borderColor: isCamp ? campColor : activityColor,
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          marginLeft: isCamp && isStartingDay ? "-20%" : 0,
          marginRight: isCamp && isEndingDay ? "-20%" : 0,
          fontWeight: isToday ? "bold" : "normal",
          color: isDisabled
            ? disabledTextColor
            : isToday && !marked
              ? todayTextColor
              : marked
                ? "#FFFFFF"
                : defaultTextColor,
          textAlign: "center",
          opacity: isDisabled ? 0.3 : 1,
        }}
      >
        {date.day}
      </Text>
    </View>
  );
}

type ActivityMonthCalendarProps = {
  activities: ActivitiesByDate;
  currentMonth: string;
  onMonthChange: (monthKey: string) => void;
};

export function ActivityMonthCalendar({
  activities,
  currentMonth,
  onMonthChange,
}: ActivityMonthCalendarProps) {
  const { colors } = useAppTheme();
  const campColor = colors.primary;
  const activityColor = colors.secondary;

  const markedDates = useMemo(
    () =>
      Object.entries(activities).reduce(
        (acc, [date, dayActivities]) => {
          const activity = dayActivities[0];
          acc[date] = {
            ...activity.marking,
            color: activity.isCamp ? campColor : activityColor,
            textColor: "#FFFFFF",
          };
          return acc;
        },
        {} as Record<string, object>,
      ),
    [activities, activityColor, campColor],
  );

  return (
    <Card style={styles.calendarCard}>
      <Calendar
        current={currentMonth}
        enableSwipeMonths
        onMonthChange={(month: DateData) => onMonthChange(month.dateString)}
        markedDates={markedDates}
        markingType="period"
        dayComponent={(props) => (
          <CalendarDay
            {...props}
            campColor={campColor}
            activityColor={activityColor}
            todayTextColor={colors.primary}
            disabledTextColor={colors.border}
            defaultTextColor={colors.text}
          />
        )}
        renderHeader={(date: Date) => {
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          return (
            <Text style={[styles.monthHeader, { color: colors.text }]}>
              {`${year}年${month}月`}
            </Text>
          );
        }}
        theme={{
          calendarBackground: "transparent",
          textSectionTitleColor: colors.muted,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textDisabledColor: colors.border,
        }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    padding: spacing.sm,
  },
  monthHeader: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
});
