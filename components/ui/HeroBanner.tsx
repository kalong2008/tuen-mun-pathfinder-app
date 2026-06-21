import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { radius, spacing, typography } from '@/constants/theme';

type HeroBannerProps = {
  imageUri: string;
  title: string;
  subtitle?: string;
  fullBleed?: boolean;
};

export function HeroBanner({ imageUri, title, subtitle, fullBleed = false }: HeroBannerProps) {
  return (
    <View style={[styles.container, fullBleed && styles.fullBleed]}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={imageUri}
        transition={200}
      />
      <View style={[styles.overlay, fullBleed && styles.fullBleedOverlay]}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  fullBleed: {
    height: 240,
    borderRadius: 0,
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  fullBleedOverlay: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subtitle: {
    ...typography.subtitleEn,
    color: 'rgba(255,255,255,0.95)',
    marginTop: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
