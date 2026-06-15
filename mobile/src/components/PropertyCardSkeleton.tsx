import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme';

function SkeletonBlock({ style }: { style?: object }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  return (
    <View style={[styles.block, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              {
                translateX: shimmer.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-220, 420],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.72)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmer}
        />
      </Animated.View>
    </View>
  );
}

export function PropertyCardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <View style={[styles.card, wide && styles.wideCard]}>
      <SkeletonBlock style={[styles.image, wide && styles.wideImage]} />
      <View style={styles.row}>
        <SkeletonBlock style={styles.title} />
        <SkeletonBlock style={styles.rating} />
      </View>
      <SkeletonBlock style={styles.location} />
      <SkeletonBlock style={styles.price} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 30,
  },
  wideCard: {
    width: 300,
    marginRight: 18,
  },
  block: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  shimmer: {
    width: 150,
    height: '100%',
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    marginBottom: 14,
  },
  wideImage: {
    height: 230,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    width: '62%',
    height: 24,
    borderRadius: 7,
  },
  rating: {
    width: 44,
    height: 18,
    borderRadius: 6,
  },
  location: {
    width: '44%',
    height: 14,
    borderRadius: 5,
    marginTop: 9,
  },
  price: {
    width: '34%',
    height: 20,
    borderRadius: 6,
    marginTop: 14,
  },
});
