import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { bookingService, couponService, paymentService } from '../api/services';
import { BrandLogo } from '../components/BrandLogo';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { getStoredValue, removeStoredValue } from '../storage';
import { colors, fonts, shadow } from '../theme';
import { formatCurrency, formatDate } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;
type PaymentMethod = 'card' | 'momo' | 'cash';
const PENDING_BOOKING_COUPON_KEY = 'aoklevart_pending_booking_coupon';

export function PaymentScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const { draft } = route.params;
  const { user } = useAuth();
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_type: 'fixed' | 'percent';
    discount_value: number;
  } | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [momoBookingId, setMomoBookingId] = useState<number | null>(null);
  const [momoStatus, setMomoStatus] = useState('pending');
  const [momoSeconds, setMomoSeconds] = useState(15 * 60);

  const image = draft.property.images.main ||
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85';
  const discountAmount = appliedCoupon
    ? Math.min(
        draft.subtotal,
        appliedCoupon.discount_type === 'percent'
          ? Math.round(draft.subtotal * appliedCoupon.discount_value / 100)
          : Number(appliedCoupon.discount_value),
      )
    : 0;
  const finalTotal = Math.max(0, draft.total - discountAmount);

  useEffect(() => {
    if (!momoBookingId || momoStatus !== 'pending') return;
    const timer = setInterval(() => {
      setMomoSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [momoBookingId, momoStatus]);

  useEffect(() => {
    if (!momoBookingId || momoStatus !== 'pending') return;
    async function refreshStatus() {
      try {
        const result = await paymentService.getBookingStatus(momoBookingId as number);
        setMomoStatus(result.status);
        if (result.status === 'confirmed' || result.status === 'completed') {
          setBookingId(momoBookingId);
          setMomoBookingId(null);
        }
      } catch {
        // Giữ màn hình thanh toán và thử cập nhật lại ở lần kiểm tra tiếp theo.
      }
    }
    void refreshStatus();
    const poller = setInterval(() => void refreshStatus(), 3000);
    return () => clearInterval(poller);
  }, [momoBookingId, momoStatus]);

  useEffect(() => {
    if (!momoBookingId || momoSeconds > 0 || momoStatus !== 'pending') return;
    void cancelMomo(i18n.language === 'en' ? 'MoMo transaction expired after 15 minutes' : 'Giao dịch MoMo quá hạn 15 phút');
  }, [momoBookingId, momoSeconds, momoStatus]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;
    void getStoredValue(PENDING_BOOKING_COUPON_KEY).then((savedCode) => {
      if (!active || !savedCode) return;
      const normalizedCode = savedCode.trim().toUpperCase();
      setCouponCode(normalizedCode);
      void applyCoupon(normalizedCode);
    }).catch(() => {
      // Người dùng vẫn có thể nhập coupon thủ công nếu SecureStore không khả dụng.
    });

    return () => {
      active = false;
    };
  }, [user?.id, draft.subtotal]);

  function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }

  function validateGuest() {
    if (user) return true;
    if (!guestName.trim() || !guestPhone.trim()) {
      setError(i18n.language === 'en' ? 'Please enter the guest name and phone number.' : 'Vui lòng nhập họ tên và số điện thoại của khách đặt phòng.');
      return false;
    }
    return true;
  }

  async function createBooking(status: 'pending' | 'confirmed', paymentMethod: string) {
    const payload = {
      property_id: draft.property.id,
      room_type_id: draft.room.id,
      check_in: draft.checkIn,
      check_out: draft.checkOut,
      number_of_rooms: 1,
      total_price: draft.total,
      coupon_code: appliedCoupon?.code,
      special_requests: specialRequests.trim() || null,
      status,
      payment_method: paymentMethod,
    };
    const result = user
      ? await bookingService.createForUser(payload)
      : await bookingService.createForGuest({
          ...payload,
          guest_name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim() || null,
        });
    if (user && appliedCoupon) {
      try {
        await removeStoredValue(PENDING_BOOKING_COUPON_KEY);
      } catch {
        // Booking đã tạo thành công; lỗi dọn SecureStore không được làm hỏng kết quả.
      }
    }
    return result.booking_id;
  }

  async function applyCoupon(codeOverride?: string) {
    const code = (codeOverride ?? couponCode).trim().toUpperCase();
    if (!code) return;

    setApplyingCoupon(true);
    setCouponMessage('');
    try {
      const response = await couponService.validate(code);
      const coupon = response.coupon;
      if (
        !response.valid
        || !coupon
        || (coupon.min_order_amount && draft.subtotal < Number(coupon.min_order_amount))
      ) {
        setAppliedCoupon(null);
        setCouponMessage(t('payment.couponInvalid'));
        return;
      }
      setCouponCode(code);
      setAppliedCoupon({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
      });
      setCouponMessage(t('payment.couponApplied', { code }));
    } catch {
      setAppliedCoupon(null);
      setCouponMessage(t('payment.couponInvalid'));
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function cancelMomo(note = i18n.language === 'en' ? 'User cancelled the MoMo transaction' : 'Người dùng chủ động hủy giao dịch MoMo') {
    if (!momoBookingId || processing) return;
    setProcessing(true);
    setError('');
    try {
      await paymentService.cancelBooking(momoBookingId, note);
      setMomoStatus('cancelled');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : (i18n.language === 'en' ? 'Unable to cancel the MoMo transaction.' : 'Không thể hủy giao dịch MoMo.'));
    } finally {
      setProcessing(false);
    }
  }

  async function submit() {
    if (!validateGuest()) return;
    setError('');
    setProcessing(true);
    try {
      if (method === 'cash') {
        setBookingId(await createBooking('pending', 'cash'));
        return;
      }
      if (method === 'momo') {
        const id = await createBooking('pending', 'momo');
        setMomoBookingId(id);
        setMomoStatus('pending');
        setMomoSeconds(15 * 60);
        return;
      }
      if (!cardHolder.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
        setError(i18n.language === 'en' ? 'Please enter all card details.' : 'Vui lòng nhập đầy đủ thông tin thẻ.');
        return;
      }
      if (cardNumber.replace(/\D/g, '').length < 16) {
        setError(i18n.language === 'en' ? 'Card number must be at least 16 digits.' : 'Số thẻ phải có ít nhất 16 chữ số.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim())) {
        setError(i18n.language === 'en' ? 'Expiry date must be in MM/YY format.' : 'Ngày hết hạn phải đúng định dạng MM/YY.');
        return;
      }
      if (!/^\d{3,4}$/.test(cvv.trim())) {
        setError(i18n.language === 'en' ? 'CVV must contain 3 or 4 digits.' : 'CVV phải gồm 3 hoặc 4 chữ số.');
        return;
      }
      const result = await paymentService.initiate({
        card_number: cardNumber.trim(),
        card_holder: cardHolder.trim(),
        expiry_date: expiry.trim(),
        cvv: cvv.trim(),
        amount: finalTotal,
      });
      setTransactionId(result.transaction_id);
      setOtp('');
      setShowOtp(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : (i18n.language === 'en' ? 'Unable to process the payment.' : 'Không thể xử lý thanh toán.'));
    } finally {
      setProcessing(false);
    }
  }

  async function confirmOtp() {
    if (otp.length !== 6) {
      setError(i18n.language === 'en' ? 'Please enter the full 6-digit OTP.' : 'Vui lòng nhập đủ 6 số OTP.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      await paymentService.confirm(transactionId, otp);
      setShowOtp(false);
      setBookingId(await createBooking('confirmed', 'card'));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : (i18n.language === 'en' ? 'Invalid OTP.' : 'OTP không hợp lệ.'));
    } finally {
      setProcessing(false);
    }
  }

  if (bookingId) {
    return (
      <SafeAreaView style={styles.successScreen}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={42} color={colors.white} />
        </View>
        <Text style={styles.successTitle}>{t('payment.bookingSuccess')}</Text>
        <Text style={styles.successMessage}>{t('payment.bookingSuccessMessage', { id: bookingId })}</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Tabs', { screen: 'Trips' })}>
          <Text style={styles.primaryButtonText}>{t('payment.viewTrips')}</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Tabs', { screen: 'Explore' })}>
          <Text style={styles.linkText}>{t('payment.backToExplore')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (momoBookingId) {
    const minutes = Math.floor(momoSeconds / 60).toString().padStart(2, '0');
    const seconds = (momoSeconds % 60).toString().padStart(2, '0');
    const qrData = encodeURIComponent(`MOMO_PAYMENT_${momoBookingId}_${finalTotal}`);
    const isCancelled = momoStatus === 'cancelled';
    return (
      <SafeAreaView style={styles.momoScreen}>
        <ScrollView contentContainerStyle={styles.momoContent} showsVerticalScrollIndicator={false}>
          <View style={styles.momoLogo}><Text style={styles.momoLogoText}>M</Text></View>
          <Text style={styles.momoTitle}>{t('payment.momoTitle')}</Text>
          <Text style={styles.momoSubtitle}>{t('payment.momoSubtitle')}</Text>

          {isCancelled ? (
            <View style={styles.momoStateCard}>
              <Ionicons name="close-circle" size={54} color={colors.error} />
              <Text style={styles.momoStateTitle}>{t('payment.cancelled')}</Text>
              <Text style={styles.momoStateText}>{t('payment.notWaiting', { id: momoBookingId })}</Text>
            </View>
          ) : (
            <>
              <View style={styles.momoInfoCard}>
                <Text style={styles.momoLabel}>{t('payment.tripDetails')}</Text>
                <Text style={styles.momoBookingCode}>#BK-{momoBookingId}</Text>
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}` }}
                  style={styles.momoQr}
                />
                <Text style={styles.momoAmount}>{formatCurrency(finalTotal)}</Text>
                <Text style={styles.momoTimer}>{minutes}:{seconds}</Text>
              </View>
              <View style={styles.momoHint}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                <Text style={styles.momoHintText}>{t('payment.momoStatusHint')}</Text>
              </View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {isCancelled ? (
            <Pressable style={styles.primaryButton} onPress={() => { setMomoBookingId(null); setError(''); }}>
              <Text style={styles.primaryButtonText}>{t('payment.backToPayment')}</Text>
            </Pressable>
          ) : (
            <Pressable disabled={processing} style={styles.momoCancelButton} onPress={() => void cancelMomo()}>
              {processing ? <ActivityIndicator color={colors.error} /> : <Text style={styles.momoCancelText}>{t('payment.cancelTransaction')}</Text>}
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={23} color={colors.primary} />
          </Pressable>
          <BrandLogo size={34} nameSize={21} />
          <Ionicons name="lock-closed" size={19} color={colors.primary} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.steps}>
            <Step number="1" label="1" done />
            <View style={styles.stepLine} />
            <Step number="2" label="2" active />
            <View style={styles.stepLine} />
            <Step number="3" label="3" />
          </View>

          <View style={styles.summaryCard}>
            <Image source={{ uri: image }} style={styles.summaryImage} />
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryName} numberOfLines={2}>{draft.property.name}</Text>
              <Text style={styles.summaryLocation}>{draft.property.location}</Text>
              <Text style={styles.summaryMeta}>{draft.nights} {t('common.nights', { count: draft.nights })} · {draft.guests} {t('common.guests', { count: draft.guests })} · {draft.room.name}</Text>
            </View>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.cardTitle}>{t('payment.priceDetails')}</Text>
            <PriceLine label={`${formatCurrency(draft.room.price)} × ${draft.nights} ${t('common.nights', { count: draft.nights })}`} value={formatCurrency(draft.subtotal)} />
            <PriceLine label={t('payment.serviceFee')} value={formatCurrency(draft.serviceFee)} />
            {discountAmount > 0 ? <PriceLine label={t('payment.discount')} value={`-${formatCurrency(discountAmount)}`} /> : null}
            <View style={styles.totalDivider} />
            <PriceLine label={t('payment.totalPayment')} value={formatCurrency(finalTotal)} total />
            <View style={styles.tripDates}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.tripDateText}>{formatDate(draft.checkIn)} - {formatDate(draft.checkOut)}</Text>
            </View>
          </View>

          {!user ? (
            <View style={styles.card}>
              <View style={styles.cardHeadingRow}>
                <Text style={styles.cardTitle}>{t('payment.customerInfo')}</Text>
                <Pressable onPress={() => setShowLogin(true)}><Text style={styles.loginLink}>{t('payment.login')}</Text></Pressable>
              </View>
              <Field icon="person-outline" placeholder={t('payment.guestName')} value={guestName} onChangeText={setGuestName} />
              <Field icon="call-outline" placeholder={t('payment.guestPhone')} keyboardType="phone-pad" value={guestPhone} onChangeText={setGuestPhone} />
              <Field icon="mail-outline" placeholder={t('payment.guestEmail')} keyboardType="email-address" autoCapitalize="none" value={guestEmail} onChangeText={setGuestEmail} />
            </View>
          ) : (
            <>
              <View style={styles.signedInCard}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <View style={styles.signedInCopy}>
                  <Text style={styles.signedInTitle}>{t('payment.signedInAs', { name: user.name })}</Text>
                  <Text style={styles.signedInMeta}>{user.email}</Text>
                </View>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('payment.coupon')}</Text>
                <View style={styles.couponRow}>
                  <TextInput
                    autoCapitalize="characters"
                    value={couponCode}
                    onChangeText={(value) => {
                      setCouponCode(value.toUpperCase());
                      setAppliedCoupon(null);
                      setCouponMessage('');
                    }}
                    placeholder={t('payment.couponPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    style={styles.couponInput}
                  />
                  <Pressable
                    disabled={applyingCoupon || !couponCode.trim()}
                    style={[styles.couponButton, (!couponCode.trim() || applyingCoupon) && styles.disabled]}
                    onPress={() => void applyCoupon()}
                  >
                    {applyingCoupon
                      ? <ActivityIndicator size="small" color={colors.white} />
                      : <Text style={styles.couponButtonText}>{t('payment.applyCoupon')}</Text>}
                  </Pressable>
                </View>
                {couponMessage ? (
                  <Text style={appliedCoupon ? styles.couponSuccess : styles.couponError}>{couponMessage}</Text>
                ) : null}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>{t('payment.paymentMethod')}</Text>
          <PaymentOption active={method === 'card'} icon="card-outline" title={t('payment.atmCard')} subtitle={t('payment.atmSubtitle')} onPress={() => { setMethod('card'); setError(''); }} />
          {method === 'card' ? (
            <View style={styles.cardFields}>
              <Field icon="person-outline" placeholder={t('payment.cardHolder')} autoCapitalize="characters" value={cardHolder} onChangeText={(value) => setCardHolder(value.toUpperCase())} />
              <Field icon="card-outline" placeholder={t('payment.cardNumber')} keyboardType="number-pad" maxLength={23} value={cardNumber} onChangeText={(value) => setCardNumber(formatCardNumber(value))} />
              <View style={styles.halfRow}>
                <View style={styles.half}><Field placeholder="MM/YY" keyboardType="number-pad" maxLength={5} value={expiry} onChangeText={(value) => setExpiry(formatExpiry(value))} /></View>
                <View style={styles.half}><Field placeholder="CVV" keyboardType="number-pad" maxLength={4} secureTextEntry value={cvv} onChangeText={(value) => setCvv(value.replace(/\D/g, ''))} /></View>
              </View>
            </View>
          ) : null}
          <PaymentOption active={method === 'momo'} icon="phone-portrait-outline" title={t('payment.momo')} subtitle={t('payment.momoDesc')} onPress={() => { setMethod('momo'); setError(''); }} />
          <PaymentOption active={method === 'cash'} icon="wallet-outline" title={t('payment.cash')} subtitle={t('payment.cashDesc')} onPress={() => { setMethod('cash'); setError(''); }} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('payment.specialRequests')}</Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={specialRequests}
              onChangeText={setSpecialRequests}
              placeholder={t('payment.specialPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.notes}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" size={21} color={colors.primary} />
            <Text style={styles.securityText}>
              {t(
                method === 'card'
                  ? 'payment.cardSecurity'
                  : method === 'momo'
                    ? 'payment.momoSecurity'
                    : 'payment.cashSecurity',
              )}
            </Text>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable disabled={processing} style={[styles.primaryButton, processing && styles.disabled]} onPress={() => void submit()}>
            {processing ? <ActivityIndicator color={colors.white} /> : <><Text style={styles.primaryButtonText}>{method === 'card' ? t('payment.continueOtp') : method === 'momo' ? t('payment.createMomo') : t('payment.submitBooking')}</Text><Ionicons name="lock-closed" size={15} color={colors.white} /></>}
          </Pressable>
          <Text style={styles.terms}>{t('payment.terms')}</Text>
        </ScrollView>
      </SafeAreaView>

      <Modal transparent visible={showOtp} animationType="fade" onRequestClose={() => setShowOtp(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}><Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.primary} /></View>
            <Text style={styles.modalTitle}>{t('payment.otpTitle')}</Text>
            <Text style={styles.modalMessage}>{t('payment.otpMessage')}</Text>
            <TextInput
              autoFocus
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/\D/g, ''))}
              placeholder="000000"
              placeholderTextColor={colors.outline}
              style={styles.otpInput}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable disabled={processing} style={styles.primaryButton} onPress={() => void confirmOtp()}>
              {processing ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>{t('payment.confirmAndPay')}</Text>}
            </Pressable>
            <Pressable style={styles.linkButton} onPress={() => setShowOtp(false)}><Text style={styles.linkText}>{t('payment.back')}</Text></Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showLogin} animationType="slide" onRequestClose={() => setShowLogin(false)}>
        <View style={styles.modalBackdropBottom}>
          <View style={styles.loginSheet}>
            <View style={styles.sheetHandle} />
            <BrandLogo size={48} nameSize={24} />
            <Text style={styles.modalMessage}>{t('payment.login')}</Text>
            <LoginForm onSuccess={() => setShowLogin(false)} />
            <Pressable style={styles.linkButton} onPress={() => setShowLogin(false)}><Text style={styles.linkText}>{t('payment.backToExplore')}</Text></Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Step({ number, label, active, done }: { number: string; label: string; active?: boolean; done?: boolean }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepCircle, (active || done) && styles.stepCircleActive]}>
        {done ? <Ionicons name="checkmark" size={15} color={colors.white} /> : <Text style={[styles.stepNumber, (active || done) && styles.stepNumberActive]}>{number}</Text>}
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

function PriceLine({ label, value, total }: { label: string; value: string; total?: boolean }) {
  return <View style={styles.priceLine}><Text style={total ? styles.totalText : styles.priceLabel}>{label}</Text><Text style={total ? styles.totalText : styles.priceValue}>{value}</Text></View>;
}

function Field(props: React.ComponentProps<typeof TextInput> & { icon?: keyof typeof Ionicons.glyphMap }) {
  const { icon, style, ...inputProps } = props;
  return <View style={styles.field}>{icon ? <Ionicons name={icon} size={18} color={colors.textMuted} /> : null}<TextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...inputProps} /></View>;
}

function PaymentOption({ active, icon, title, subtitle, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.paymentOption, active && styles.paymentOptionActive]} onPress={onPress}>
      <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <View style={styles.paymentCopy}><Text style={styles.paymentTitle}>{title}</Text><Text style={styles.paymentSubtitle}>{subtitle}</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 50 },
  steps: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginVertical: 22 },
  step: { alignItems: 'center', width: 72 },
  stepCircle: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  stepCircleActive: { backgroundColor: colors.primary },
  stepNumber: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 12 },
  stepNumberActive: { color: colors.white },
  stepLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10, marginTop: 5 },
  stepLabelActive: { color: colors.primary },
  stepLine: { width: 32, height: 1, backgroundColor: colors.outline, marginTop: 14 },
  summaryCard: { flexDirection: 'row', borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 12, ...shadow },
  summaryImage: { width: 112, height: 106, borderRadius: 13, backgroundColor: colors.surfaceContainer },
  summaryCopy: { flex: 1, justifyContent: 'center', paddingLeft: 14 },
  summaryName: { color: colors.primary, fontFamily: fonts.heading, fontSize: 19, lineHeight: 24 },
  summaryLocation: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  summaryMeta: { color: colors.text, fontFamily: fonts.medium, fontSize: 11, marginTop: 8 },
  priceCard: { marginTop: 16, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 18 },
  card: { marginTop: 16, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 18 },
  cardTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 21, marginBottom: 15 },
  cardHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loginLink: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 13, marginBottom: 15 },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },
  priceLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 },
  priceValue: { color: colors.text, fontFamily: fonts.medium, fontSize: 13 },
  totalDivider: { height: 1, backgroundColor: colors.border, marginVertical: 5, marginBottom: 14 },
  totalText: { color: colors.primary, fontFamily: fonts.heading, fontSize: 18 },
  tripDates: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceLow, borderRadius: 11, padding: 11, marginTop: 4 },
  tripDateText: { color: colors.primary, fontFamily: fonts.medium, fontSize: 12 },
  signedInCard: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: '#edf7f0', borderWidth: 1, borderColor: '#cfe5d5' },
  signedInCopy: { flex: 1, paddingLeft: 12 },
  signedInTitle: { color: colors.success, fontFamily: fonts.bold, fontSize: 13 },
  signedInMeta: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  couponRow: { flexDirection: 'row', gap: 9 },
  couponInput: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.bold, fontSize: 13, paddingHorizontal: 13 },
  couponButton: { minWidth: 82, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.primary, paddingHorizontal: 12 },
  couponButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  couponSuccess: { color: colors.success, fontFamily: fonts.medium, fontSize: 11, marginTop: 8 },
  couponError: { color: colors.error, fontFamily: fonts.medium, fontSize: 11, marginTop: 8 },
  sectionTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 25, marginTop: 30, marginBottom: 14 },
  paymentOption: { minHeight: 82, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 15, marginBottom: 11 },
  paymentOptionActive: { borderColor: colors.primary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  paymentCopy: { flex: 1, marginLeft: 12 },
  paymentTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
  paymentSubtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 4 },
  cardFields: { borderRadius: 16, backgroundColor: colors.surfaceLow, padding: 12, marginTop: -4, marginBottom: 11 },
  field: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 13, marginBottom: 10 },
  input: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14, paddingVertical: 12 },
  halfRow: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  notes: { minHeight: 100, color: colors.text, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 13 },
  securityNote: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, backgroundColor: colors.surfaceContainer, padding: 14, marginTop: 16 },
  securityText: { flex: 1, color: colors.textSoft, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 12 },
  primaryButton: { minHeight: 55, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.primary, paddingHorizontal: 22, marginTop: 18 },
  primaryButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  disabled: { opacity: 0.6 },
  terms: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 12 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(1,36,37,0.62)', padding: 20 },
  modalBackdropBottom: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(1,36,37,0.5)' },
  modalCard: { width: '100%', borderRadius: 24, backgroundColor: colors.surface, padding: 24 },
  modalIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: colors.surfaceContainer, marginBottom: 14 },
  modalTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 26, textAlign: 'center' },
  modalMessage: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, marginBottom: 18 },
  otpInput: { height: 64, borderRadius: 14, borderWidth: 1, borderColor: colors.primary, color: colors.primary, backgroundColor: colors.white, fontFamily: fonts.bold, fontSize: 28, textAlign: 'center', letterSpacing: 9 },
  linkButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  linkText: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 13 },
  loginSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: colors.surface, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 34 },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.outline, alignSelf: 'center', marginBottom: 18 },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, backgroundColor: colors.surface },
  successIcon: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.success, marginBottom: 22 },
  successTitle: { color: colors.primary, fontFamily: fonts.display, fontSize: 32, textAlign: 'center' },
  successMessage: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  momoScreen: { flex: 1, backgroundColor: colors.surface },
  momoContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 22, paddingTop: 24, paddingBottom: 40 },
  momoLogo: { width: 68, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#a50064' },
  momoLogoText: { color: colors.white, fontFamily: fonts.bold, fontSize: 35 },
  momoTitle: { color: colors.primary, fontFamily: fonts.display, fontSize: 31, marginTop: 16 },
  momoSubtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 5 },
  momoInfoCard: { width: '100%', alignItems: 'center', borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 22, marginTop: 22, ...shadow },
  momoLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11 },
  momoBookingCode: { color: colors.primary, fontFamily: fonts.bold, fontSize: 18, marginTop: 4 },
  momoQr: { width: 210, height: 210, marginTop: 18, backgroundColor: colors.surfaceContainer },
  momoAmount: { color: '#a50064', fontFamily: fonts.heading, fontSize: 25, marginTop: 17 },
  momoTimer: { color: colors.error, fontFamily: fonts.bold, fontSize: 13, marginTop: 7 },
  momoHint: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, backgroundColor: colors.surfaceContainer, padding: 14, marginTop: 15 },
  momoHintText: { flex: 1, color: colors.textSoft, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  momoCancelButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: 18 },
  momoCancelText: { color: colors.error, fontFamily: fonts.bold, fontSize: 14 },
  momoStateCard: { width: '100%', alignItems: 'center', borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 28, marginTop: 24 },
  momoStateTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 23, marginTop: 12 },
  momoStateText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', marginTop: 7 },
});
