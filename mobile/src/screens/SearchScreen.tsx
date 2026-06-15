import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { propertyService } from '../api/services';
import { BrandLogo } from '../components/BrandLogo';
import { PropertyCard } from '../components/PropertyCard';
import { EmptyState, LoadingState } from '../components/ScreenState';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';
import type { Property } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = useState(initialQuery);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setProperties(await propertyService.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('search.offline'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const results = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi');
    if (!keyword) return properties;
    return properties.filter((property) =>
      [property.name, property.location, property.type]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('vi').includes(keyword)),
    );
  }, [properties, query]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={23} color={colors.primary} />
        </Pressable>
        <BrandLogo size={34} nameSize={21} />
        <View style={styles.iconButton} />
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          autoFocus={!initialQuery}
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.filterRow}>
        <View style={styles.filterPill}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.filterText}>{t('search.flexibleDates')}</Text>
        </View>
        <View style={styles.filterPill}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          <Text style={styles.filterText}>{t('search.guestsShort')}</Text>
        </View>
        <View style={[styles.filterPill, styles.filterPrimary]}>
          <Ionicons name="options-outline" size={16} color={colors.white} />
          <Text style={styles.filterPrimaryText}>{t('search.filters')}</Text>
        </View>
      </View>

      {loading ? (
        <LoadingState label={t('search.loading')} />
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title={t('search.offlineTitle')} message={error} actionLabel={t('search.retry')} onAction={() => void load()} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.resultHeader}>
              <Text style={styles.resultEyebrow}>{t('search.explore')}</Text>
              <Text style={styles.resultTitle}>{t('search.results', { count: results.length })}</Text>
            </View>
          }
          ListEmptyComponent={<EmptyState icon="search-outline" title={t('search.emptyTitle')} message={t('search.emptyBody')} />}
          renderItem={({ item }) => (
            <PropertyCard property={item} onPress={() => navigation.navigate('Details', { property: item })} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21 },
  searchBar: { height: 54, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, borderRadius: 27, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 17 },
  searchInput: { flex: 1, height: '100%', color: colors.text, fontFamily: fonts.body, fontSize: 15 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filterPill: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 19, paddingHorizontal: 12, backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.border },
  filterText: { color: colors.primary, fontFamily: fonts.medium, fontSize: 12 },
  filterPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterPrimaryText: { color: colors.white, fontFamily: fonts.medium, fontSize: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  resultHeader: { paddingTop: 14, paddingBottom: 24 },
  resultEyebrow: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4, marginBottom: 5 },
  resultTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 28 },
});
