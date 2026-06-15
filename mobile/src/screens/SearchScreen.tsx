import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { propertyService } from '../api/services';
import { BrandLogo } from '../components/BrandLogo';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { EmptyState } from '../components/ScreenState';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, shadow } from '../theme';
import type { Amenity, Property } from '../types';
import { formatDate, toDateInput } from '../utils/date';
import { matchesPropertySearch } from '../utils/propertySearch';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;
type DateField = 'checkIn' | 'checkOut';
const PRICE_PRESETS = [1_000_000, 2_000_000, 5_000_000] as const;

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function mergeAmenities(current: Amenity[], properties: Property[]) {
  const byId = new Map(current.map(amenity => [amenity.id, amenity]));
  properties.forEach(property => property.amenities.forEach(amenity => byId.set(amenity.id, amenity)));
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function propertyTypeLabel(type: string, t: (key: string) => string) {
  const knownTypes: Record<string, string> = {
    hotel: t('search.typeHotel'),
    apartment: t('search.typeApartment'),
    villa: t('search.typeVilla'),
    resort: t('search.typeResort'),
    homestay: t('search.typeHomestay'),
  };
  return knownTypes[type.toLowerCase()] || type;
}

export function SearchScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const initialQuery = route.params?.query || '';
  const [query, setQuery] = useState(initialQuery);
  const [properties, setProperties] = useState<Property[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [propertyType, setPropertyType] = useState('');
  const [amenityIds, setAmenityIds] = useState<number[]>([]);

  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [draftGuests, setDraftGuests] = useState(guests);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [draftType, setDraftType] = useState('');
  const [draftAmenityIds, setDraftAmenityIds] = useState<number[]>([]);
  const [filterError, setFilterError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const items = await propertyService.list({
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        guests,
        minPrice,
        maxPrice,
        type: propertyType || undefined,
        amenityIds,
      });
      setProperties(items);
      setAvailableTypes(current => [...new Set([...current, ...items.map(item => item.type).filter(Boolean)])].sort());
      setAvailableAmenities(current => mergeAmenities(current, items));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('search.offline'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [amenityIds, checkIn, checkOut, guests, maxPrice, minPrice, propertyType, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const results = useMemo(
    () => properties.filter(property => matchesPropertySearch(property, query)),
    [properties, query],
  );

  const featuredAmenities = useMemo(() => {
    const definitions = [
      { key: 'wifi', label: t('search.wifi'), iconName: 'wifi' as const, icons: ['wifi'], terms: ['wifi'] },
      { key: 'pool', label: t('search.pool'), iconName: 'water' as const, icons: ['pool'], terms: ['ho boi', 'pool'] },
      { key: 'parking', label: t('search.parking'), iconName: 'car' as const, icons: ['local_parking'], terms: ['do xe', 'dau xe', 'gui xe', 'parking'] },
    ];

    return definitions.flatMap(definition => {
      const amenity = availableAmenities.find(item => {
        const name = normalizeText(item.name);
        return definition.icons.includes(item.icon || '') || definition.terms.some(term => name.includes(term));
      });
      return amenity ? [{ ...definition, amenity }] : [];
    });
  }, [availableAmenities, t]);

  const featuredAmenityIds = useMemo(
    () => new Set(featuredAmenities.map(item => item.amenity.id)),
    [featuredAmenities],
  );
  const otherAmenities = availableAmenities.filter(amenity => !featuredAmenityIds.has(amenity.id));

  const dateLabel = checkIn && checkOut
    ? `${formatDate(checkIn).slice(0, 5)} - ${formatDate(checkOut).slice(0, 5)}`
    : t('search.flexibleDates');
  const extraFilterCount = Number(Boolean(minPrice || maxPrice)) + Number(Boolean(propertyType)) + amenityIds.length;

  function selectDate(event: DateTimePickerChangeEvent, date?: Date) {
    if (!date || !activeDateField) return;
    const value = toDateInput(date);
    if (activeDateField === 'checkIn') {
      setCheckIn(value);
      if (checkOut && checkOut <= value) setCheckOut('');
      setActiveDateField('checkOut');
      return;
    }
    setCheckOut(value);
    setActiveDateField(null);
  }

  function dismissDatePicker() {
    setActiveDateField(null);
  }

  function openFilters() {
    setDraftMinPrice(minPrice == null ? '' : String(minPrice));
    setDraftMaxPrice(maxPrice == null ? '' : String(maxPrice));
    setDraftType(propertyType);
    setDraftAmenityIds(amenityIds);
    setFilterError('');
    setFilterModalOpen(true);
  }

  function applyFilters() {
    const nextMin = draftMinPrice ? Number(draftMinPrice) : undefined;
    const nextMax = draftMaxPrice ? Number(draftMaxPrice) : undefined;
    if ((nextMin != null && !Number.isFinite(nextMin)) || (nextMax != null && !Number.isFinite(nextMax))) {
      setFilterError(t('search.invalidPrice'));
      return;
    }
    if (nextMin != null && nextMax != null && nextMin > nextMax) {
      setFilterError(t('search.invalidPriceRange'));
      return;
    }
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
    setPropertyType(draftType);
    setAmenityIds(draftAmenityIds);
    setFilterModalOpen(false);
  }

  function resetFilters() {
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftType('');
    setDraftAmenityIds([]);
    setFilterError('');
  }

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Pressable style={[styles.filterPill, checkIn && checkOut && styles.filterPillActive]} onPress={() => setActiveDateField('checkIn')}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.filterText}>{dateLabel}</Text>
        </Pressable>
        <Pressable style={styles.filterPill} onPress={() => { setDraftGuests(guests); setGuestModalOpen(true); }}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          <Text style={styles.filterText}>{t('search.guestCount', { count: guests })}</Text>
        </Pressable>
        <Pressable style={[styles.filterPill, styles.filterPrimary]} onPress={openFilters}>
          <Ionicons name="options-outline" size={16} color={colors.white} />
          <Text style={styles.filterPrimaryText}>
            {t('search.filters')}{extraFilterCount ? ` (${extraFilterCount})` : ''}
          </Text>
        </Pressable>
      </ScrollView>

      {loading ? (
        <FlatList
          data={[0, 1, 2]}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={() => <PropertyCardSkeleton />}
        />
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
          ListEmptyComponent={<EmptyState icon="search-outline" title={t('search.emptyTitle')} message={t('search.emptyFilteredBody')} />}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => navigation.navigate('Details', {
                property: item,
                checkIn: checkIn || undefined,
                checkOut: checkOut || undefined,
                guests,
              })}
            />
          )}
        />
      )}

      {activeDateField ? (
        <Modal transparent animationType="fade" onRequestClose={() => setActiveDateField(null)}>
          <Pressable style={styles.backdrop} onPress={() => setActiveDateField(null)}>
            <Pressable style={styles.modalCard} onPress={event => event.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeDateField === 'checkIn' ? t('search.selectCheckIn') : t('search.selectCheckOut')}
                </Text>
                <Pressable onPress={() => setActiveDateField(null)}><Ionicons name="close" size={22} color={colors.primary} /></Pressable>
              </View>
              <DateTimePicker
                value={activeDateField === 'checkOut' && checkOut ? parseDate(checkOut) : activeDateField === 'checkIn' && checkIn ? parseDate(checkIn) : activeDateField === 'checkOut' && checkIn ? addDays(parseDate(checkIn), 1) : startOfToday()}
                mode="date"
                display="inline"
                minimumDate={activeDateField === 'checkOut' && checkIn ? addDays(parseDate(checkIn), 1) : startOfToday()}
                onValueChange={selectDate}
                onDismiss={dismissDatePicker}
                locale={i18n.language === 'en' ? 'en-US' : 'vi-VN'}
                accentColor={colors.primary}
              />
              {checkIn || checkOut ? (
                <Pressable style={styles.clearButton} onPress={() => { setCheckIn(''); setCheckOut(''); setActiveDateField(null); }}>
                  <Text style={styles.clearButtonText}>{t('search.clearDates')}</Text>
                </Pressable>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <Modal transparent visible={guestModalOpen} animationType="fade" onRequestClose={() => setGuestModalOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setGuestModalOpen(false)}>
          <Pressable style={styles.smallModalCard} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t('search.guestsTitle')}</Text>
                <Text style={styles.modalSubtitle}>{t('search.guestsHint')}</Text>
              </View>
              <Pressable onPress={() => setGuestModalOpen(false)}><Ionicons name="close" size={22} color={colors.primary} /></Pressable>
            </View>
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>{t('search.guests')}</Text>
              <View style={styles.stepper}>
                <Pressable disabled={draftGuests <= 1} style={[styles.stepButton, draftGuests <= 1 && styles.disabledStep]} onPress={() => setDraftGuests(value => Math.max(1, value - 1))}>
                  <Ionicons name="remove" size={20} color={colors.primary} />
                </Pressable>
                <Text style={styles.stepperValue}>{draftGuests}</Text>
                <Pressable disabled={draftGuests >= 20} style={[styles.stepButton, draftGuests >= 20 && styles.disabledStep]} onPress={() => setDraftGuests(value => Math.min(20, value + 1))}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                </Pressable>
              </View>
            </View>
            <Pressable style={styles.applyButton} onPress={() => { setGuests(draftGuests); setGuestModalOpen(false); }}>
              <Text style={styles.applyButtonText}>{t('search.apply')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={filterModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFilterModalOpen(false)}>
        <SafeAreaView style={styles.filterModal}>
          <View style={styles.sheetHeader}>
            <Pressable onPress={() => setFilterModalOpen(false)}><Ionicons name="close" size={24} color={colors.primary} /></Pressable>
            <Text style={styles.modalTitle}>{t('search.filters')}</Text>
            <Pressable onPress={resetFilters}><Text style={styles.resetText}>{t('search.reset')}</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>{t('search.priceRange')}</Text>
            <View style={styles.priceInputs}>
              <View style={styles.priceField}>
                <Text style={styles.inputLabel}>{t('search.minimum')}</Text>
                <TextInput value={draftMinPrice} onChangeText={setDraftMinPrice} keyboardType="number-pad" placeholder="0" style={styles.priceInput} />
              </View>
              <View style={styles.priceField}>
                <Text style={styles.inputLabel}>{t('search.maximum')}</Text>
                <TextInput value={draftMaxPrice} onChangeText={setDraftMaxPrice} keyboardType="number-pad" placeholder="10.000.000" style={styles.priceInput} />
              </View>
            </View>

            <Text style={styles.inputLabel}>{t('search.quickPrice')}</Text>
            <View style={styles.chipWrap}>
              {PRICE_PRESETS.map(value => {
                const selected = draftMaxPrice === String(value);
                return (
                  <Pressable key={value} style={[styles.choiceChip, selected && styles.choiceChipActive]} onPress={() => { setDraftMinPrice(''); setDraftMaxPrice(String(value)); }}>
                    <Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>{`${value / 1_000_000}M`}</Text>
                  </Pressable>
                );
              })}
              <Pressable style={[styles.choiceChip, !draftMaxPrice && styles.choiceChipActive]} onPress={() => { setDraftMinPrice(''); setDraftMaxPrice(''); }}>
                <Text style={[styles.choiceChipText, !draftMaxPrice && styles.choiceChipTextActive]}>10M+</Text>
              </Pressable>
            </View>

            {availableTypes.length ? (
              <>
                <Text style={styles.sectionTitle}>{t('search.propertyType')}</Text>
                <View style={styles.chipWrap}>
                  {availableTypes.map(type => (
                    <Pressable key={type} style={[styles.choiceChip, draftType === type && styles.choiceChipActive]} onPress={() => setDraftType(current => current === type ? '' : type)}>
                      <Text style={[styles.choiceChipText, draftType === type && styles.choiceChipTextActive]}>{propertyTypeLabel(type, t)}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            {featuredAmenities.length ? (
              <>
                <Text style={styles.sectionTitle}>{t('search.popularAmenities')}</Text>
                <View style={styles.chipWrap}>
                  {featuredAmenities.map(({ key, label, iconName, amenity }) => {
                    const selected = draftAmenityIds.includes(amenity.id);
                    return (
                      <Pressable key={key} style={[styles.featuredChip, selected && styles.choiceChipActive]} onPress={() => setDraftAmenityIds(current => selected ? current.filter(id => id !== amenity.id) : [...current, amenity.id])}>
                        <Ionicons name={iconName} size={17} color={selected ? colors.white : colors.primary} />
                        <Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {otherAmenities.length ? (
              <>
                <Text style={styles.sectionTitle}>{t('search.moreAmenities')}</Text>
                <View style={styles.chipWrap}>
                  {otherAmenities.map(amenity => {
                    const selected = draftAmenityIds.includes(amenity.id);
                    return (
                      <Pressable key={amenity.id} style={[styles.choiceChip, selected && styles.choiceChipActive]} onPress={() => setDraftAmenityIds(current => selected ? current.filter(id => id !== amenity.id) : [...current, amenity.id])}>
                        <Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>{amenity.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}
            {filterError ? <Text style={styles.errorText}>{filterError}</Text> : null}
          </ScrollView>
          <View style={styles.sheetFooter}>
            <Pressable style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>{t('search.showResults')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21 },
  searchBar: { height: 54, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, borderRadius: 27, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 17 },
  searchInput: { flex: 1, height: '100%', color: colors.text, fontFamily: fonts.body, fontSize: 15 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filterPill: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 19, paddingHorizontal: 12, backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { borderColor: colors.primary, backgroundColor: '#eef6f5' },
  filterText: { color: colors.primary, fontFamily: fonts.medium, fontSize: 12 },
  filterPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterPrimaryText: { color: colors.white, fontFamily: fonts.medium, fontSize: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  resultHeader: { paddingTop: 14, paddingBottom: 24 },
  resultEyebrow: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4, marginBottom: 5 },
  resultTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 28 },
  backdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(1, 36, 37, 0.45)' },
  modalCard: { borderRadius: 24, backgroundColor: colors.white, padding: 20, ...shadow },
  smallModalCard: { borderRadius: 24, backgroundColor: colors.white, padding: 22, ...shadow },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 },
  modalTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 20 },
  modalSubtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  clearButton: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  clearButtonText: { color: colors.error, fontFamily: fonts.medium, fontSize: 13 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  stepperLabel: { color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  stepButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  disabledStep: { opacity: 0.35 },
  stepperValue: { minWidth: 24, textAlign: 'center', color: colors.primary, fontFamily: fonts.bold, fontSize: 17 },
  applyButton: { minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingHorizontal: 24 },
  applyButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  filterModal: { flex: 1, backgroundColor: colors.surface },
  sheetHeader: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  resetText: { color: colors.primary, fontFamily: fonts.medium, fontSize: 13 },
  sheetContent: { padding: 22, paddingBottom: 120 },
  sectionTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 18, marginTop: 12, marginBottom: 14 },
  priceInputs: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  priceField: { flex: 1 },
  inputLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 11, marginBottom: 7 },
  priceInput: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.white, color: colors.text, fontFamily: fonts.body, paddingHorizontal: 14 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 18 },
  choiceChip: { minHeight: 40, justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.white, paddingHorizontal: 14 },
  featuredChip: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 22, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.white, paddingHorizontal: 15 },
  choiceChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  choiceChipText: { color: colors.primary, fontFamily: fonts.medium, fontSize: 12 },
  choiceChipTextActive: { color: colors.white },
  errorText: { color: colors.error, fontFamily: fonts.medium, fontSize: 12, marginTop: 8 },
  sheetFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
