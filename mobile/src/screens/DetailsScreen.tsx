import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { propertyService } from '../api/services';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, shadow } from '../theme';
import type { Amenity, Room } from '../types';
import { countNights, formatCurrency, formatDate, toDateInput } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const fallbackImage =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90';
const MAX_DESCRIPTION_CHARS = 380;
type DateField = 'checkIn' | 'checkOut';

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDate(value: string) {
  return value ? new Date(`${value}T00:00:00`) : startOfToday();
}

function amenityIcon(amenity: Amenity): keyof typeof Ionicons.glyphMap {
  const name = amenity.name.toLowerCase();
  if (name.includes('wifi')) return 'wifi';
  if (name.includes('hồ') || name.includes('pool')) return 'water';
  if (name.includes('điều hòa') || name.includes('air')) return 'snow';
  if (name.includes('bếp') || name.includes('kitchen')) return 'restaurant';
  if (name.includes('xe')) return 'car';
  return 'sparkles-outline';
}

export function DetailsScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const { property, checkIn: initialCheckIn = '', checkOut: initialCheckOut = '', guests: requestedGuests } = route.params;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { locked, user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(property.rooms[0]);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [showDescription, setShowDescription] = useState(false);

  const images = [property.images.main, ...property.images.gallery].filter(Boolean);
  if (!images.length) images.push(fallbackImage);

  const nights = countNights(checkIn, checkOut);
  const canReserve = Boolean(selectedRoom && checkIn && checkOut && nights > 0);
  const roomCapacity = selectedRoom ? selectedRoom.max_adults + selectedRoom.max_children : 0;
  const guests = requestedGuests && requestedGuests <= roomCapacity ? requestedGuests : roomCapacity;
  const subtotal = selectedRoom ? selectedRoom.price * nights : 0;
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee;
  const fullDescription = property.description || t('details.fallbackDescription');
  const fallbackAmenities = ['WiFi tốc độ cao', 'Điều hòa', 'Bãi đỗ xe', 'Không gian riêng tư'];
  const hasLongDescription = fullDescription.length > MAX_DESCRIPTION_CHARS;
  const shortDescription = hasLongDescription
    ? `${fullDescription.slice(0, MAX_DESCRIPTION_CHARS).trimEnd()}...`
    : fullDescription;

  function openDatePicker(field: DateField) {
    setError('');
    setActiveDateField(field);
  }

  function selectDate(event: DateTimePickerEvent, date?: Date) {
    if (event.type === 'dismissed') {
      setActiveDateField(null);
      return;
    }
    if (!date || !activeDateField) return;

    const value = toDateInput(date);
    if (activeDateField === 'checkIn') {
      setCheckIn(value);
      if (checkOut && countNights(value, checkOut) === 0) setCheckOut('');
      setActiveDateField('checkOut');
      return;
    }
    setCheckOut(value);
    setActiveDateField(null);
  }

  async function continueToPayment() {
    if (!selectedRoom) {
      setError(t('details.unavailableRoomType'));
      return;
    }
    if (!checkIn || !checkOut) {
      setError(t('details.selectDates'));
      return;
    }
    if (!nights) {
      setError(t('details.checkoutAfterCheckin'));
      return;
    }
    setChecking(true);
    setError('');
    try {
      await propertyService.checkAvailability({
        room_type_id: selectedRoom.id,
        check_in: checkIn,
        check_out: checkOut,
        number_of_rooms: 1,
      });
      navigation.navigate('Payment', {
        draft: {
          property,
          room: selectedRoom,
          checkIn,
          checkOut,
          guests,
          nights,
          subtotal,
          serviceFee,
          total,
        },
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('details.availabilityError'));
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 + insets.bottom }}>
        <View style={styles.gallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => setCurrentImage(Math.round(event.nativeEvent.contentOffset.x / width))}
          >
            {images.map((image, index) => (
              <Image key={`${image}-${index}`} source={{ uri: image }} style={{ width, height: 390 }} resizeMode="cover" />
            ))}
          </ScrollView>
          <SafeAreaView style={styles.overlayHeader} edges={['top']}>
            <Pressable style={styles.circleButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={colors.primary} />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable style={styles.circleButton} onPress={() => void Share.share({ message: `${property.name} - ${property.location}` })}>
                <Ionicons name="share-outline" size={21} color={colors.primary} />
              </Pressable>
              <Pressable 
                style={styles.circleButton} 
                onPress={() => {
                  if (!user) {
                    navigation.navigate(locked ? 'Unlock' : 'Login');
                    return;
                  }
                  void toggleFavorite(property.id);
                }}
              >
                <Ionicons name={isFavorite(property.id) ? 'heart' : 'heart-outline'} size={22} color={isFavorite(property.id) ? colors.error : colors.primary} />
              </Pressable>
            </View>
          </SafeAreaView>
          <View style={styles.imageCount}>
            <Text style={styles.imageCountText}>{t('details.images', { current: currentImage + 1, total: images.length })}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={17} color={colors.secondary} />
            <Text style={styles.ratingText}>{property.rating || t('details.newBadge')} · {t('details.reviews', { count: property.reviews })}</Text>
          </View>
          <Text style={styles.title}>{property.name}</Text>
          <Text style={styles.location}>{property.location} · {property.type}</Text>

          <View style={styles.divider} />
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              {property.host.avatar ? <Image source={{ uri: property.host.avatar }} style={styles.hostAvatarImage} /> : <Text style={styles.hostInitial}>{property.host.name.charAt(0)}</Text>}
            </View>
            <View style={styles.hostCopy}>
              <Text style={styles.hostTitle}>{t('details.hostedBy', { name: property.host.name })}</Text>
              <Text style={styles.hostMeta}>{t('details.maxGuests', { count: property.maxGuests })} · {t('details.bedrooms', { count: property.bedrooms })} · {t('details.bathrooms', { count: property.bathrooms })}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>{t('details.about')}</Text>
          <Text style={[styles.description, hasLongDescription && styles.descriptionCollapsed]}>{shortDescription}</Text>
          {hasLongDescription ? (
            <Pressable style={styles.descriptionButton} onPress={() => setShowDescription(true)}>
              <Text style={styles.descriptionButtonText}>{t('details.showMore')}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </Pressable>
          ) : null}

          <Text style={styles.sectionTitle}>{t('details.amenities')}</Text>
          <View style={styles.amenitiesGrid}>
            {(property.amenities.length ? property.amenities : fallbackAmenities.map((name, index) => ({ id: -(index + 1), name }))).slice(0, 6).map((amenity) => (
              <View key={amenity.id} style={styles.amenity}>
                <View style={styles.amenityIcon}>
                  <Ionicons name={amenityIcon(amenity)} size={21} color={colors.primary} />
                </View>
                <Text style={styles.amenityText} numberOfLines={2}>{amenity.name}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('details.chooseRoom')}</Text>
          {property.rooms.length ? property.rooms.map((room) => {
            const active = room.id === selectedRoom?.id;
            return (
              <Pressable key={room.id} style={[styles.roomCard, active && styles.roomCardActive]} onPress={() => setSelectedRoom(room)}>
                <View style={styles.radioOuter}>{active ? <View style={styles.radioInner} /> : null}</View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomMeta}>{room.bed_type || t('details.standardBed')} · {t('details.maxGuests', { count: room.max_adults + room.max_children })}</Text>
                </View>
                <Text style={styles.roomPrice}>{formatCurrency(room.price)}</Text>
              </Pressable>
            );
          }) : <Text style={styles.description}>{t('details.contactForAvailability')}</Text>}

          <View style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>{t('details.itinerary')}</Text>
            <View style={styles.dateRow}>
              <Pressable style={styles.dateField} onPress={() => openDatePicker('checkIn')}>
                <Text style={styles.fieldLabel}>{t('details.checkIn')}</Text>
                <View style={styles.dateValueRow}>
                  <Text style={[styles.dateValue, !checkIn && styles.datePlaceholder]}>
                    {checkIn ? formatDate(checkIn) : t('details.selectDate')}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                </View>
              </Pressable>
              <Pressable style={styles.dateField} onPress={() => openDatePicker('checkOut')}>
                <Text style={styles.fieldLabel}>{t('details.checkOut')}</Text>
                <View style={styles.dateValueRow}>
                  <Text style={[styles.dateValue, !checkOut && styles.datePlaceholder]}>
                    {checkOut ? formatDate(checkOut) : t('details.selectDate')}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                </View>
              </Pressable>
            </View>
            <View style={styles.guestRow}>
              <View>
                <Text style={styles.fieldLabel}>{t('details.guests')}</Text>
                <Text style={styles.guestValue}>{t('common.guests', { count: guests })}</Text>
              </View>
              <Ionicons name="people-outline" size={21} color={colors.primary} />
            </View>
            {nights > 0 && selectedRoom ? (
              <View style={styles.priceDetails}>
                <View style={styles.priceLine}><Text style={styles.priceLabel}>{formatCurrency(selectedRoom.price)} × {t('common.nights', { count: nights })}</Text><Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text></View>
                <View style={styles.priceLine}><Text style={styles.priceLabel}>{t('details.serviceFee')}</Text><Text style={styles.priceValue}>{formatCurrency(serviceFee)}</Text></View>
                <View style={[styles.priceLine, styles.totalLine]}><Text style={styles.totalLabel}>{t('details.total')}</Text><Text style={styles.totalValue}>{formatCurrency(total)}</Text></View>
              </View>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View>
          <Text style={styles.bottomPrice}>{selectedRoom ? formatCurrency(selectedRoom.price) : property.price}</Text>
          <Text style={styles.bottomMeta}>{t('common.perNight')} · {t('common.nights', { count: nights || 0 })}</Text>
        </View>
        <Pressable disabled={checking || !canReserve} style={[styles.reserveButton, (!canReserve || checking) && styles.disabledButton]} onPress={() => void continueToPayment()}>
          {checking ? <ActivityIndicator color={colors.white} /> : <Text style={styles.reserveText}>{t('details.bookNow')}</Text>}
        </Pressable>
      </View>

      {activeDateField && Platform.OS === 'android' ? (
        <DateTimePicker
          value={activeDateField === 'checkOut' && checkOut ? parseDate(checkOut) : activeDateField === 'checkIn' && checkIn ? parseDate(checkIn) : activeDateField === 'checkOut' && checkIn ? addDays(parseDate(checkIn), 1) : startOfToday()}
          mode="date"
          display="default"
          minimumDate={activeDateField === 'checkOut' && checkIn ? addDays(parseDate(checkIn), 1) : startOfToday()}
          onChange={selectDate}
          locale={i18n.language === 'en' ? 'en-US' : 'vi-VN'}
          accentColor={colors.primary}
        />
      ) : activeDateField ? (
        <Modal transparent animationType="fade" onRequestClose={() => setActiveDateField(null)}>
          <Pressable style={styles.datePickerBackdrop} onPress={() => setActiveDateField(null)}>
            <Pressable style={styles.datePickerCard} onPress={(event) => event.stopPropagation()}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>
                  {activeDateField === 'checkIn' ? t('details.selectCheckIn') : t('details.selectCheckOut')}
                </Text>
                <Pressable style={styles.modalCloseButton} onPress={() => setActiveDateField(null)}>
                  <Ionicons name="close" size={22} color={colors.primary} />
                </Pressable>
              </View>
              <DateTimePicker
                value={activeDateField === 'checkOut' && checkOut ? parseDate(checkOut) : activeDateField === 'checkIn' && checkIn ? parseDate(checkIn) : activeDateField === 'checkOut' && checkIn ? addDays(parseDate(checkIn), 1) : startOfToday()}
                mode="date"
                display="inline"
                minimumDate={activeDateField === 'checkOut' && checkIn ? addDays(parseDate(checkIn), 1) : startOfToday()}
                onChange={selectDate}
                locale={i18n.language === 'en' ? 'en-US' : 'vi-VN'}
                accentColor={colors.primary}
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <Modal visible={showDescription} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDescription(false)}>
        <SafeAreaView style={styles.descriptionModal}>
          <View style={styles.descriptionModalHeader}>
            <Text style={styles.descriptionModalTitle}>{t('details.about')}</Text>
            <Pressable style={styles.modalCloseButton} onPress={() => setShowDescription(false)}>
              <Ionicons name="close" size={22} color={colors.primary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.descriptionModalContent}>
            <Text style={styles.descriptionModalText}>{fullDescription}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  gallery: { height: 390, backgroundColor: colors.surfaceContainer },
  overlayHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  headerActions: { flexDirection: 'row', gap: 9 },
  circleButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(252,249,248,0.92)' },
  imageCount: { position: 'absolute', right: 18, bottom: 18, borderRadius: 999, backgroundColor: 'rgba(1,36,37,0.78)', paddingHorizontal: 12, paddingVertical: 7 },
  imageCountText: { color: colors.white, fontFamily: fonts.medium, fontSize: 11 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { color: colors.text, fontFamily: fonts.medium, fontSize: 13 },
  title: { color: colors.primary, fontFamily: fonts.display, fontSize: 34, lineHeight: 41, marginTop: 9 },
  location: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: 7 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 25 },
  hostRow: { flexDirection: 'row', alignItems: 'center' },
  hostAvatar: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondaryFixed },
  hostAvatarImage: { width: 52, height: 52 },
  hostInitial: { color: colors.primary, fontFamily: fonts.display, fontSize: 21 },
  hostCopy: { flex: 1, paddingLeft: 14 },
  hostTitle: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14 },
  hostMeta: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 3 },
  sectionTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 25, marginTop: 12, marginBottom: 14 },
  description: { color: colors.textSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, marginBottom: 24 },
  descriptionCollapsed: { marginBottom: 8 },
  descriptionButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 24, paddingVertical: 6 },
  descriptionButtonText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14, textDecorationLine: 'underline' },
  descriptionModal: { flex: 1, backgroundColor: colors.surface },
  descriptionModalHeader: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  descriptionModalTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 25 },
  modalCloseButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  descriptionModalContent: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 40 },
  descriptionModalText: { color: colors.textSoft, fontFamily: fonts.body, fontSize: 16, lineHeight: 27 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  amenity: { width: '48%', flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  amenityIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  amenityText: { flex: 1, marginLeft: 10, color: colors.text, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  roomCard: { minHeight: 82, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.white, padding: 14, marginBottom: 11 },
  roomCardActive: { borderColor: colors.primary, backgroundColor: '#f7fbfa' },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  roomInfo: { flex: 1, paddingHorizontal: 12 },
  roomName: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14 },
  roomMeta: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 4 },
  roomPrice: { color: colors.primary, fontFamily: fonts.heading, fontSize: 14 },
  bookingCard: { marginTop: 26, padding: 20, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, ...shadow },
  bookingTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 24, marginBottom: 18 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1, minHeight: 68, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  fieldLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.8 },
  dateValueRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 5 },
  dateValue: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 12 },
  datePlaceholder: { color: colors.textMuted },
  guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11, marginTop: 10 },
  guestValue: { color: colors.text, fontFamily: fonts.medium, fontSize: 13, marginTop: 3 },
  priceDetails: { marginTop: 18 },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },
  priceLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 },
  priceValue: { color: colors.text, fontFamily: fonts.medium, fontSize: 13 },
  totalLine: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, marginTop: 3 },
  totalLabel: { color: colors.primary, fontFamily: fonts.heading, fontSize: 18 },
  totalValue: { color: colors.primary, fontFamily: fonts.heading, fontSize: 18 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 8 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  bottomPrice: { color: colors.primary, fontFamily: fonts.heading, fontSize: 19 },
  bottomMeta: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  reserveButton: { minWidth: 140, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingHorizontal: 22 },
  disabledButton: { backgroundColor: colors.textMuted, opacity: 0.55 },
  reserveText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  datePickerBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(1,36,37,0.38)' },
  datePickerCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.surface, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 24 },
  datePickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  datePickerTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 23 },
});
