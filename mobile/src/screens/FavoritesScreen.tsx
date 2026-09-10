import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { propertyService } from '../api/services';
import { AuthPlaceholder } from '../components/AuthPlaceholder';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { EmptyState } from '../components/ScreenState';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';
import type { Property } from '../types';

export function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favoriteIds } = useFavorites();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }
    if (!favoriteIds.length) {
      setProperties([]);
      setLoading(false);
      return;
    }
    setError('');
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      setProperties(await propertyService.list({ ids: favoriteIds }));
    } catch (reason) {
      setProperties([]);
      setError(reason instanceof Error ? reason.message : t('favorites.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [favoriteIds, t, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const favorites = useMemo(() => properties, [properties]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('favorites.eyebrow')}</Text>
        <Text style={styles.title}>{t('favorites.title')}</Text>
      </View>
      {!user ? (
        <AuthPlaceholder
          icon="heart-outline"
          title={t('favorites.loginTitle')}
          message={t('favorites.loginMessage')}
        />
      ) : loading ? (
        <FlatList
          data={[0, 1, 2]}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={() => <PropertyCardSkeleton />}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={<EmptyState icon={error ? 'cloud-offline-outline' : 'heart-outline'} title={error ? t('favorites.loadError') : t('favorites.emptyTitle')} message={error ? t('common.retry') : t('favorites.emptyMessage')} actionLabel={error ? t('common.retry') : t('favorites.action')} onAction={error ? () => void load() : () => navigation.navigate('Search')} />}
          renderItem={({ item }) => <PropertyCard property={item} onPress={() => navigation.navigate('Details', { property: item })} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 },
  eyebrow: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4 },
  title: { color: colors.primary, fontFamily: fonts.display, fontSize: 32, marginTop: 5 },
  list: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 100 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 12, marginBottom: 10 },
});
