import { TARGET_COLORS } from '@/constants/theme';
import { expandNoticeTargets, hasBothNoticeTargets } from '@/lib/notice-utils';

export function getTargetColor(targets: string[], isPast = false): string {
  if (isPast) {
    return '#94A3B8';
  }

  const expanded = expandNoticeTargets(targets);

  if (hasBothNoticeTargets(expanded)) {
    return TARGET_COLORS.BOTH;
  }
  if (expanded.includes('前鋒會')) {
    return TARGET_COLORS.PATHFINDER;
  }
  if (expanded.includes('幼鋒會')) {
    return TARGET_COLORS.ADVENTURER;
  }

  return TARGET_COLORS.BOTH;
}

export function getSingleTargetColor(target: string, isPast = false): string {
  if (isPast) {
    return '#94A3B8';
  }
  if (target === '前鋒會') {
    return TARGET_COLORS.PATHFINDER;
  }
  if (target === '幼鋒會') {
    return TARGET_COLORS.ADVENTURER;
  }
  return TARGET_COLORS.BOTH;
}
