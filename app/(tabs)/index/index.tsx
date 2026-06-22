import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppLogo } from "@/components/AppLogo";
import { HomePreviewTile } from "@/components/home/HomePreviewTile";
import { HomeHeaderLogin, HomeHeaderMenuButton } from "@/components/HomeHeader";
import { HeroBanner } from "@/components/ui/HeroBanner";
import { Screen } from "@/components/ui/Screen";
import { spacing, TARGET_COLORS } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNativeTabScrollProps } from "@/hooks/useNativeTabScrollProps";
import { API } from "@/lib/api";
import {
    getActivityClubBadges,
    getActivityDisplayName,
    getNextUpcomingActivity,
    parseActivityClub,
    type ActivitiesByDate,
    type ActivityClub,
} from "@/lib/calendar-utils";
import {
    expandNoticeTargets,
    getClubShortLabel,
    getNoticeActivityName,
    getNoticeDisplayDate,
    getNoticePreview,
    isPastNotice,
    type NoticeItem,
} from "@/lib/notice-utils";
import { HERO_BANNER_PHOTO } from "@/lib/photo-url";
import { getSingleTargetColor } from "@/lib/target-colors";

type DailyVerse = {
  citation: string;
  passage: string;
  version: string;
};

type NextEventPreview = {
  name: string;
  date: string;
  club: ActivityClub | null;
};

function getClubColor(club: "PATHFINDER" | "ADVENTURER"): string {
  switch (club) {
    case "PATHFINDER":
      return TARGET_COLORS.PATHFINDER;
    case "ADVENTURER":
      return TARGET_COLORS.ADVENTURER;
    default: {
      const unreachable: never = club;
      return unreachable;
    }
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const tabScrollProps = useNativeTabScrollProps();

  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [verseError, setVerseError] = useState<string | null>(null);
  const [nextEvent, setNextEvent] = useState<NextEventPreview | null>(null);
  const [noticePreview, setNoticePreview] = useState<NoticeItem[]>([]);
  const [calendarActivities, setCalendarActivities] =
    useState<ActivitiesByDate>({});

  useEffect(() => {
    async function loadHomeData() {
      setVerseLoading(true);
      try {
        const [verseRes, calendarRes, noticesRes] = await Promise.all([
          fetch(API.bibleCached()),
          fetch(API.calendar()),
          fetch(API.notices()),
        ]);

        if (verseRes.ok) {
          const verseData = await verseRes.json();
          setDailyVerse(verseData);
          setVerseError(null);
        } else {
          throw new Error("verse fetch failed");
        }

        if (calendarRes.ok) {
          const calendarData = (await calendarRes.json()) as ActivitiesByDate;
          setCalendarActivities(calendarData);
          const next = getNextUpcomingActivity(calendarData);
          if (next) {
            setNextEvent({
              name: getActivityDisplayName(next.activity.title),
              date: next.dateLabel,
              club: parseActivityClub(next.activity.title),
            });
          }
        }

        if (noticesRes.ok) {
          const notices = (await noticesRes.json()) as NoticeItem[];
          setNoticePreview(getNoticePreview(notices, 1));
        }
      } catch (err) {
        console.error("Home data error:", err);
        setVerseError("無法載入今日經文");
        setDailyVerse({
          citation: "腓立比書 4:13",
          passage: "我靠著那加給我力量的，凡事都能做。",
          version: "和合本",
        });
      } finally {
        setVerseLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const latestNotice = noticePreview[0];
  const latestNoticePast = latestNotice
    ? isPastNotice(latestNotice.date)
    : false;

  return (
    <Screen scroll={false} padded={false} edges={["top"]}>
      <View collapsable={false} style={styles.screenRoot}>
        <ScrollView
          {...tabScrollProps}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroWrap}>
            <HeroBanner
              fullBleed
              imageUri={HERO_BANNER_PHOTO}
              title="屯門前鋒會 幼鋒會"
              subtitle="Tuen Mun Pathfinder and Adventurer Club"
            />
          </View>

          <View style={styles.infoStack}>
            <HomePreviewTile
              label="今日經文"
              icon="bookmark.fill"
              tone="primary"
              name={verseLoading ? undefined : dailyVerse?.passage}
              date={verseLoading ? undefined : dailyVerse?.citation}
              loading={verseLoading}
              error={verseError}
            />

            <View style={styles.previewRow}>
              <View style={styles.previewColumn}>
                <HomePreviewTile
                  label="下一活動"
                  icon="calendar.circle.fill"
                  tone="secondary"
                  name={nextEvent?.name}
                  date={nextEvent?.date}
                  tags={
                    nextEvent?.club
                      ? getActivityClubBadges(nextEvent.club).map((badge) => ({
                          label: getClubShortLabel(badge.label),
                          color: getClubColor(badge.club),
                        }))
                      : []
                  }
                  emptyText="暫無即將舉行的活動"
                  onPress={() => router.push("/(tabs)/calendar")}
                />
              </View>

              <View style={styles.previewColumn}>
                <HomePreviewTile
                  label="最新通告"
                  icon="bell.fill"
                  tone="accent"
                  name={
                    latestNotice
                      ? getNoticeActivityName(latestNotice)
                      : undefined
                  }
                  date={
                    latestNotice
                      ? getNoticeDisplayDate(latestNotice, calendarActivities, {
                          includeYear: false,
                        })
                      : undefined
                  }
                  tags={
                    latestNotice
                      ? expandNoticeTargets(latestNotice.target).map(
                          (target) => ({
                            label: getClubShortLabel(target),
                            color: getSingleTargetColor(
                              target,
                              latestNoticePast,
                            ),
                          }),
                        )
                      : []
                  }
                  emptyText="暫無最新通告"
                  onPress={() =>
                    latestNotice
                      ? router.push({
                          pathname: "/noticeDetailModal",
                          params: { id: latestNotice.id },
                        })
                      : router.push("/(tabs)/notice")
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          pointerEvents="box-none"
          style={[
            styles.headerOverlay,
            styles.headerBar,
            { backgroundColor: colors.background },
          ]}
        >
          <AppLogo />
          <View style={styles.headerActions}>
            <HomeHeaderLogin />
            <HomeHeaderMenuButton />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  scrollContent: {
    paddingTop: 44 + spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  heroWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoStack: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
  previewColumn: {
    flex: 1,
    minWidth: 0,
  },
});
