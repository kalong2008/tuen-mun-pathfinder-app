import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

const LOGO_ASPECT_RATIO = 2543 / 1324;
const LOGO_HEIGHT = 32;

export function AppLogo() {
  return (
    <Image
      source={require('@/assets/images/pathfinder-adventurer.png')}
      style={styles.logo}
      contentFit="contain"
      accessibilityLabel="屯門前鋒會 幼鋒會"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    height: LOGO_HEIGHT,
    width: LOGO_HEIGHT * LOGO_ASPECT_RATIO,
  },
});
