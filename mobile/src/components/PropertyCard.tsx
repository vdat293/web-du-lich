import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, shadow } from '../theme';
import type { Property } from '../types';

const fallbackImage =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85';

export function PropertyCard({
  property,
  onPress,
  wide = false,
}: {
  property: Property;
  onPress: () => void;
  wide?: boolean;
  }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const liked = isFavorite(property.id);

  return (
    <Pressable style={[styles.card, wide && styles.wideCard]} onPress={onPress}>
      <View style={[styles.imageWrap, wide && styles.wideImage]}>
        <Image
          source={{ uri: property.images.main || fallbackImage }}
          style={styles.image}
          resizeMode="cover"
        />
        <Pressable
          accessibilityLabel={liked ? t('propertyCard.unsave') : t('propertyCard.save')}
          hitSlop={10}
          style={styles.favorite}
          onPress={(event) => {
            event.stopPropagation();
            if (!user) {
              navigation.navigate('Login');
              return;
            }
            void toggleFavorite(property.id);
          }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? colors.error : colors.white}
          />
        </Pressable>
        {property.isHot ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('propertyCard.featured')}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.topLine}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {property.name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.location} numberOfLines={1}>
              {property.location}
            </Text>
          </View>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={15} color={colors.secondary} />
          <Text style={styles.rating}>{property.rating || t('propertyCard.new')}</Text>
        </View>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{property.price}</Text>
        <Text style={styles.night}> {t('propertyCard.perNight')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 30 },
  wideCard: { width: 300, marginRight: 18 },
  imageWrap: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: colors.surfaceContainer,
    ...shadow,
  },
  wideImage: { height: 230 },
  image: { width: '100%', height: '100%' },
  favorite: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(1,36,37,0.42)',
  },
  badge: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    backgroundColor: colors.secondaryFixed,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  badgeText: { color: '#251a00', fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.7 },
  topLine: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  info: { flex: 1, paddingRight: 12 },
  name: { color: colors.primary, fontFamily: fonts.heading, fontSize: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  location: { flex: 1, color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 4 },
  rating: { color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 },
  price: { color: colors.primary, fontFamily: fonts.heading, fontSize: 20 },
  night: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 },
});
