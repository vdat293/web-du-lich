import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { propertyService } from '../api/services';
import { PropertyCard } from '../components/PropertyCard';
import { EmptyState, LoadingState } from '../components/ScreenState';
import { useFavorites } from '../context/FavoritesContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';
import type { Property } from '../types';

export function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favoriteIds } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProperties(await propertyService.list());
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const favorites = useMemo(
    () => properties.filter((property) => favoriteIds.includes(property.id)),
    [favoriteIds, properties],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>BỘ SƯU TẬP CỦA BẠN</Text>
        <Text style={styles.title}>Những nơi đã lưu</Text>
      </View>
      {loading ? <LoadingState /> : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="heart-outline" title="Chưa có nơi nào được lưu" message="Chạm biểu tượng trái tim trên chỗ nghỉ bạn yêu thích để xem lại tại đây." actionLabel="Khám phá ngay" onAction={() => navigation.navigate('Search')} />}
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
});
