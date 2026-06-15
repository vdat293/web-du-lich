import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

export const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dptmoijn0/image/upload/c_crop,g_center,w_650,h_850/c_pad,b_rgb:FAF8F5,h_850,w_850/f_auto,q_auto/logo-aoklevart_vrh0ph';

export const BRAND_WORDMARK_URL =
  'https://res.cloudinary.com/dptmoijn0/image/upload/c_crop,g_center,h_520,w_1300/f_auto,q_auto/v1781504541/wordmark-aoklevart_wt819k.png';

type BrandLogoProps = {
  size?: number;
  showName?: boolean;
  nameColor?: string;
  nameSize?: number;
};

export function BrandLogo({
  size = 40,
  showName = true,
  nameColor = colors.primary,
  nameSize = 22,
}: BrandLogoProps) {
  return (
    <View style={styles.container}>
      <Image
        accessibilityLabel="Aoklevart"
        source={{ uri: BRAND_LOGO_URL }}
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.2) }}
      />
      {showName ? (
        <Text style={[styles.name, { color: nameColor, fontSize: nameSize }]}>Aoklevart</Text>
      ) : null}
    </View>
  );
}

export function BrandWordmark({ width = 232 }: { width?: number }) {
  return (
    <Image
      accessibilityLabel="Aoklevart"
      resizeMode="contain"
      source={{ uri: BRAND_WORDMARK_URL }}
      style={{ width, height: width * 0.4 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  name: { fontFamily: fonts.display, letterSpacing: -0.4 },
});
