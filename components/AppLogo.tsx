import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const LOGO_ASPECT_RATIO = 2543 / 1324;
const LOGO_HEIGHT = 32;

export function AppLogo() {
  return (
    <View pointerEvents="none" accessible={false} importantForAccessibility="no">
      <Image
        source={require('@/assets/images/pathfinder-adventurer.png')}
        style={styles.logo}
        contentFit="contain"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: LOGO_HEIGHT,
    width: LOGO_HEIGHT * LOGO_ASPECT_RATIO,
    backgroundColor: 'transparent',
  },
});
