import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MenuPageLayout } from '@/components/MenuPageLayout';
import { ClubCard } from '@/components/ui/ClubCard';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { radius, spacing, TARGET_COLORS, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { HERO_BANNER_PHOTO } from '@/lib/photo-url';

export default function AboutScreen() {
  const { colors } = useAppTheme();

  return (
    <MenuPageLayout route="/about" title="關於我們">
      <Screen scroll={false} padded={false} edges={[]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HeroBanner
            imageUri={HERO_BANNER_PHOTO}
            title="屯門前鋒會 幼鋒會"
            subtitle="Tuen Mun Pathfinder and Adventurer Club"
          />

          <Text style={[styles.intro, { color: colors.text }]}>
            屯門前鋒會及幼鋒會隸屬香港復臨教會，透過戶外活動、技能訓練及靈修生活，陪伴孩子與青少年健康成長，建立品格與服務心志。
          </Text>

          <View style={styles.section}>
            <SectionHeader title="認識我們" icon="info.circle.fill" />
            <ClubCard
              accent="PATHFINDER"
              title="前鋒會"
              description="為 10 至 15 歲青少年而設，透過探索、露營與自然研究，開闊視野並建立與上帝的關係。"
            />
            <ClubCard
              accent="ADVENTURER"
              title="幼鋒會"
              description="為 6 至 9 歲兒童而設，幫助孩子在群體中學習相處、獨立與照顧自己。"
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="聚會時間" icon="clock.fill" />
            <View style={[styles.meetingPill, { backgroundColor: `${TARGET_COLORS.PATHFINDER}22` }]}>
              <View style={[styles.meetingDot, { backgroundColor: TARGET_COLORS.PATHFINDER }]} />
              <Text style={[styles.meetingText, { color: colors.text }]}>
                前鋒會：逢星期六 下午2:30 - 4:30
              </Text>
            </View>
            <View style={[styles.meetingPill, { backgroundColor: `${TARGET_COLORS.ADVENTURER}22` }]}>
              <View style={[styles.meetingDot, { backgroundColor: TARGET_COLORS.ADVENTURER }]} />
              <Text style={[styles.meetingText, { color: colors.text }]}>
                幼鋒會：逢星期六 下午2:30 - 4:30
              </Text>
            </View>
          </View>
        </ScrollView>
      </Screen>
    </MenuPageLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  intro: {
    ...typography.body,
  },
  section: {
    gap: spacing.md,
  },
  meetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  meetingDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  meetingText: {
    ...typography.caption,
    flex: 1,
  },
});
