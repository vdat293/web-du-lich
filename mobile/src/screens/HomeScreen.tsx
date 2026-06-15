import { useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { propertyService } from '../api/services';
import { PropertyCard } from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, shadow } from '../theme';
import type { Property } from '../types';

const heroImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=90';

const collections = [
  {
    titleKey: 'home.collectionLuxuryTitle',
    subtitleKey: 'home.collectionLuxurySubtitle',
    query: 'villa',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    titleKey: 'home.collectionSummerTitle',
    subtitleKey: 'home.collectionSummerSubtitle',
    query: 'biển',
    image:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1000&q=85',
  },
];

const destinations = [
  {
    titleKey: 'home.destinationDaNang',
    subtitleKey: 'home.destinationDaNangSubtitle',
    image:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=85',
  },
  {
    titleKey: 'home.destinationDaLat',
    subtitleKey: 'home.destinationDaLatSubtitle',
    image:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85',
  },
  {
    titleKey: 'home.destinationPhuQuoc',
    subtitleKey: 'home.destinationPhuQuocSubtitle',
    image:
      'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=900&q=85',
  },
];

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    void propertyService
      .list()
      .then((items) => setProperties(items.slice(0, 5)))
      .catch(() => setProperties([]));
  }, []);

  function search(value = query) {
    navigation.navigate('Search', { query: value.trim() });
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <ImageBackground source={{ uri: heroImage }} style={styles.heroImage}>
            <LinearGradient
              colors={['rgba(1,36,37,0.52)', 'rgba(1,36,37,0.06)', 'rgba(1,36,37,0.55)']}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeHeader} edges={['top']}>
              <View style={styles.header}>
                <Pressable style={styles.headerButton}>
                  <Ionicons name="menu" size={24} color={colors.white} />
                </Pressable>
                <Text style={styles.brand}>Aoklevart</Text>
                <View style={styles.avatar}>
                  {user?.avatar ? (
                    <ImageBackground source={{ uri: user.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'A'}</Text>
                  )}
                </View>
              </View>
            </SafeAreaView>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>{t('home.heroEyebrow')}</Text>
              <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={21} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => search()}
                placeholder={t('home.searchPlaceholder')}
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                style={styles.searchInput}
              />
              <Pressable style={styles.searchButton} onPress={() => search()}>
                <Ionicons name="arrow-forward" size={21} color={colors.white} />
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.curatedTitle')}</Text>
          <Text style={styles.sectionBody}>{t('home.curatedBody')}</Text>
          {collections.map((collection, index) => (
            <Pressable key={collection.titleKey} onPress={() => search(collection.query)}>
              <ImageBackground
                source={{ uri: collection.image }}
                style={[styles.collectionCard, index === 1 && styles.collectionCardSmall]}
                imageStyle={styles.roundedImage}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.78)']}
                  style={[StyleSheet.absoluteFill, styles.roundedImage]}
                />
                <View style={styles.collectionCopy}>
                  {index === 0 ? <Text style={styles.collectionBadge}>{t('home.collectionBadge')}</Text> : null}
                  <Text style={styles.collectionTitle}>{t(collection.titleKey)}</Text>
                  <Text style={styles.collectionSubtitle}>{t(collection.subtitleKey)}</Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </View>

        {properties.length ? (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>{t('home.featuredTitle')}</Text>
              <Pressable onPress={() => search('')}>
                <Text style={styles.viewAll}>{t('home.viewAll')}</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  wide
                  onPress={() => navigation.navigate('Details', { property })}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.destinationSection}>
          <Text style={[styles.sectionTitle, styles.centerText]}>{t('home.trendingTitle')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationList}>
              {destinations.map((destination) => (
              <Pressable key={destination.titleKey} style={styles.destinationCard} onPress={() => search(t(destination.titleKey))}>
                <ImageBackground source={{ uri: destination.image }} style={styles.destinationImage} imageStyle={styles.roundedImage}>
                  <LinearGradient colors={['transparent', 'rgba(1,36,37,0.72)']} style={[StyleSheet.absoluteFill, styles.roundedImage]} />
                  <View style={styles.destinationCopy}>
                    <Text style={styles.destinationTitle}>{t(destination.titleKey)}</Text>
                    <Text style={styles.destinationSubtitle}>{t(destination.subtitleKey)}</Text>
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: 105 },
  hero: { height: 700, paddingHorizontal: 14, paddingTop: 10 },
  heroImage: { flex: 1, overflow: 'hidden', borderRadius: 24, justifyContent: 'space-between' },
  safeHeader: { width: '100%' },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(1,36,37,0.28)' },
  brand: { color: colors.white, fontFamily: fonts.display, fontSize: 26 },
  avatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondaryFixed, borderWidth: 2, borderColor: 'rgba(255,255,255,0.55)' },
  avatarImage: { width: 36, height: 36 },
  avatarText: { color: colors.primary, fontFamily: fonts.bold },
  heroCopy: { alignItems: 'center', paddingHorizontal: 22, marginTop: 'auto', marginBottom: 42 },
  eyebrow: { color: 'rgba(255,255,255,0.9)', fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.8, textAlign: 'center', marginBottom: 14 },
  heroTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 38, lineHeight: 46, textAlign: 'center' },
  searchBox: { height: 66, flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 22, paddingLeft: 18, paddingRight: 7, borderRadius: 33, backgroundColor: colors.white, ...shadow },
  searchInput: { flex: 1, height: '100%', marginLeft: 10, color: colors.text, fontFamily: fonts.body, fontSize: 15 },
  searchButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  section: { paddingHorizontal: 20, paddingTop: 46 },
  sectionTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 29, lineHeight: 36 },
  sectionBody: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 8, marginBottom: 24 },
  collectionCard: { height: 390, justifyContent: 'flex-end', marginBottom: 18 },
  collectionCardSmall: { height: 280 },
  roundedImage: { borderRadius: 20 },
  collectionCopy: { padding: 24 },
  collectionBadge: { alignSelf: 'flex-start', color: '#251a00', backgroundColor: colors.secondaryFixed, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1, marginBottom: 12 },
  collectionTitle: { color: colors.white, fontFamily: fonts.heading, fontSize: 28 },
  collectionSubtitle: { color: 'rgba(255,255,255,0.82)', fontFamily: fonts.body, fontSize: 14, marginTop: 5 },
  featuredSection: { paddingTop: 44, paddingLeft: 20 },
  sectionHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, marginBottom: 20 },
  viewAll: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 13 },
  destinationSection: { paddingTop: 40, paddingBottom: 30, backgroundColor: colors.surfaceLow },
  centerText: { textAlign: 'center' },
  destinationList: { paddingHorizontal: 20, paddingTop: 24 },
  destinationCard: { width: 285, height: 430, marginRight: 16 },
  destinationImage: { flex: 1, justifyContent: 'flex-end' },
  destinationCopy: { padding: 22 },
  destinationTitle: { color: colors.white, fontFamily: fonts.heading, fontSize: 27 },
  destinationSubtitle: { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.body, fontSize: 13, marginTop: 4 },
});
