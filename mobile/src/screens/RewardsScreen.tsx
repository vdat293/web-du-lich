import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { getStoredValue, setStoredValue } from '../storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { rewardService } from '../api/services';
import { AuthPlaceholder } from '../components/AuthPlaceholder';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';
import type { Reward, RewardRedemption } from '../types';
import type { RootStackParamList } from '../navigation/types';

const PENDING_BOOKING_COUPON_KEY = 'aoklevart_pending_booking_coupon';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDiscount(type: 'fixed' | 'percent', value: number) {
  return type === 'percent'
    ? `Giảm ${Number(value)}%`
    : `Giảm ${Number(value).toLocaleString('vi-VN')}đ`;
}

export function RewardsScreen() {
  const { user, updateUser, biometricsEnabled } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [points, setPoints] = useState(user?.loyalty_points || 0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [refreshing, setRefreshing] = useState(false);
  const [redeemingKey, setRedeemingKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [couponsModalVisible, setCouponsModalVisible] = useState(false);

  // Security Verification States
  const EMPTY_PIN = ['', '', '', '', '', ''];
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [inputPin, setInputPin] = useState([...EMPTY_PIN]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const pinInputs = useRef<Array<TextInput | null>>([]);

  const load = useCallback(async (refresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const response = await rewardService.list();
      setPoints(response.loyalty_points);
      setRewards(response.rewards);
      setRedemptions(response.redemptions);
    } catch {
      setError(t('rewards.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const redeem = async (reward: Reward, enteredPin?: string) => {
    setRedeemingKey(reward.key);
    try {
      const response = await rewardService.redeem(reward.key, enteredPin);
      setPoints(response.loyalty_points);
      if (user) await updateUser({ ...user, loyalty_points: response.loyalty_points });
      if (reward.category === 'booking') {
        try {
          await setStoredValue(PENDING_BOOKING_COUPON_KEY, response.coupon_code);
        } catch (storageError) {
          console.log('Failed to cache redeemed coupon:', storageError);
        }
      }
      await load(true);
      Alert.alert(
        t('rewards.successTitle'),
        t(
          reward.category === 'booking'
            ? 'rewards.bookingSuccessMessage'
            : 'rewards.successMessage',
          { code: response.coupon_code },
        ),
        reward.category === 'booking'
          ? [
              { text: t('common.close'), style: 'cancel' },
              {
                text: t('rewards.bookNow'),
                onPress: () => navigation.navigate('Explore' as any),
              },
            ]
          : [{ text: t('common.close'), style: 'cancel' }],
      );
      setPinModalVisible(false);
      if (enteredPin) {
        try {
          await setStoredValue('aoklevart_transaction_pin', enteredPin);
        } catch (err) {
          console.log('Failed to cache PIN in secure store:', err);
        }
      }
    } catch (redeemError) {
      Alert.alert(
        t('rewards.errorTitle'),
        redeemError instanceof Error ? redeemError.message : t('rewards.errorTitle'),
      );
      setInputPin([...EMPTY_PIN]);
      setTimeout(() => pinInputs.current[0]?.focus(), 150);
    } finally {
      setRedeemingKey(null);
    }
  };

  const handlePinDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newArr = [...inputPin];
    newArr[index] = digit;
    setInputPin(newArr);
    if (digit && index < inputPin.length - 1) {
      pinInputs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !inputPin[index] && index > 0) {
      pinInputs.current[index - 1]?.focus();
    }
  };

  const closePinModal = () => {
    Keyboard.dismiss();
    setPinModalVisible(false);
  };

  // Watch PIN completion inside modal
  useEffect(() => {
    const pinStr = inputPin.join('');
    if (pinStr.length === 6 && selectedReward && redeemingKey === null) {
      void redeem(selectedReward, pinStr);
    }
  }, [inputPin]);

  const handleRedeemFlow = async (reward: Reward) => {
    if (biometricsEnabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const pinVal = await getStoredValue('aoklevart_transaction_pin');

      if (hasHardware && isEnrolled && pinVal) {
        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: t('security.biometric'),
            cancelLabel: t('security.transactionPin'),
            disableDeviceFallback: true,
          });
          if (result.success) {
            await redeem(reward, pinVal);
            return;
          }
        } catch (authErr) {
          console.log('Biometric auth failed or cancelled:', authErr);
        }
      }
    }

    // Fallback: Open transaction PIN modal
    setSelectedReward(reward);
    setInputPin([...EMPTY_PIN]);
    setPinModalVisible(true);
    setTimeout(() => {
      if (pinInputs.current[0]) {
        pinInputs.current[0].focus();
      }
    }, 150);
  };

  const confirmRedeem = (reward: Reward) => {
    if (!user?.transaction_pin_enabled) {
      Alert.alert(
        t('security.pinRequiredTitle'),
        t('security.pinRequiredDesc'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('security.pinRequiredSetup'), onPress: () => navigation.navigate('SetupPin', { returnToRewards: true }) }
        ]
      );
      return;
    }

    Alert.alert(
      t('rewards.confirmTitle'),
      t('rewards.confirmMessage', { count: reward.points.toLocaleString('vi-VN'), title: reward.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), onPress: () => void handleRedeemFlow(reward) },
      ],
    );
  };

  if (!user) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <AuthPlaceholder
          icon="gift-outline"
          title={t('rewards.loginTitle')}
          message={t('rewards.loginMessage')}
        />
      </View>
    );
  }

  // Đưa coupon đặt phòng lên đầu để người dùng dễ tìm thấy trên mobile.
  const filteredRewards = [...rewards].sort((first, second) => {
    const firstPriority = first.category === 'booking' ? 0 : 1;
    const secondPriority = second.category === 'booking' ? 0 : 1;
    return firstPriority - secondPriority || first.points - second.points;
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
      >
        {/* Header Background Image */}
        <ImageBackground
          source={{ uri: 'https://res.cloudinary.com/dptmoijn0/image/upload/web-du-lich/assets/thumnails.jpg' }}
          style={styles.headerBg}
          imageStyle={styles.headerBgImage}
        >
          <View style={styles.headerOverlay} />
          <Pressable style={[styles.backButton, { top: insets.top + 10 }]} onPress={() => navigation.navigate('Explore' as any)}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </Pressable>
        </ImageBackground>

        {/* Profile Card Overlay */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=150&auto=format&fit=crop&q=60' }}
              style={styles.avatar}
            />
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{user.membership_tier?.toUpperCase() || 'CLASSIC'}</Text>
            </View>
          </View>

          <View style={styles.profileStats}>
            <Pressable style={styles.statItem} onPress={() => setCouponsModalVisible(true)}>
              <Ionicons name="ticket-outline" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Ưu đãi của tôi</Text>
            </Pressable>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="sparkles" size={20} color="#745b1c" />
              <Text style={styles.statLabel}>
                <Text style={styles.pointsHighlight}>{points.toLocaleString('vi-VN')}</Text> ĐIỂM
              </Text>
            </View>
          </View>
        </View>

        {/* Catalog Section */}
        <View style={styles.catalogContainer}>
          <Text style={styles.sectionTitle}>Phần thưởng dành cho bạn</Text>

          {loading && !refreshing ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : error ? (
            <Pressable style={styles.errorCard} onPress={() => void load()}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText}>{t('common.retry')}</Text>
            </Pressable>
          ) : filteredRewards.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="cube-outline" size={28} color={colors.outline} />
              <Text style={styles.emptyText}>Không có phần thưởng nào trong danh mục này.</Text>
            </View>
          ) : (
            filteredRewards.map((reward) => {
              const canRedeem = points >= reward.points;
              const isRedeeming = redeemingKey === reward.key;
              return (
                <Pressable
                  key={reward.key}
                  style={styles.rewardRowCard}
                  onPress={() => canRedeem && confirmRedeem(reward)}
                >
                  <Image
                    source={{ uri: reward.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300' }}
                    style={styles.rewardRowImage}
                  />
                  <View style={styles.rewardRowBody}>
                    <Text style={styles.rewardRowPartner}>{reward.partner_name || 'AOKLEVART'}</Text>
                    {reward.category === 'booking' || reward.discount_value > 0 ? (
                      <View style={styles.rewardOfferRow}>
                        {reward.category === 'booking' ? (
                          <View style={styles.bookingBadge}>
                            <Ionicons name="bed-outline" size={11} color={colors.primary} />
                            <Text style={styles.bookingBadgeText}>ĐẶT PHÒNG</Text>
                          </View>
                        ) : null}
                        {reward.discount_value > 0 ? (
                          <Text style={styles.rewardDiscount}>
                            {formatDiscount(reward.discount_type, reward.discount_value)}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                    <Text style={styles.rewardRowTitle} numberOfLines={2}>{reward.title}</Text>
                    <View style={styles.rewardRowFooter}>
                      <Text style={styles.rewardRowPoints}>{reward.points} Điểm</Text>
                      
                      <View style={[
                        styles.redeemActionBtn,
                        !canRedeem && styles.redeemActionBtnDisabled,
                      ]}>
                        {isRedeeming ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <Text style={[
                            styles.redeemActionText,
                            !canRedeem && styles.redeemActionTextDisabled
                          ]}>
                            {canRedeem ? 'Đổi' : 'Cần thêm'}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Coupons Modal */}
      <Modal
        visible={couponsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCouponsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ưu đãi của tôi</Text>
              <Pressable onPress={() => setCouponsModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {redemptions.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Ionicons name="ticket-outline" size={48} color={colors.outline} />
                  <Text style={styles.modalEmptyText}>Bạn chưa đổi coupon nào.</Text>
                </View>
              ) : (
                redemptions.map((redemption) => {
                  const used = redemption.used_count > 0;
                  return (
                    <View key={redemption.id} style={styles.couponItem}>
                      <View style={styles.couponIconBox}>
                        <Ionicons name="ticket-outline" size={22} color={colors.primary} />
                      </View>
                      <View style={styles.couponDetails}>
                        <Text selectable style={styles.couponCodeText}>{redemption.code}</Text>
                        <Text style={styles.couponBenefitText}>
                          {formatDiscount(redemption.discount_type, redemption.discount_value)}
                          {Number(redemption.min_order_amount) > 0
                            ? ` · Đơn từ ${Number(redemption.min_order_amount).toLocaleString('vi-VN')}đ`
                            : ''}
                        </Text>
                        <Text style={styles.couponDateText}>
                          Hạn dùng: {formatDate(redemption.valid_until)}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, used ? styles.statusBadgeUsed : styles.statusBadgeUnused]}>
                        <Text style={[styles.statusText, used ? styles.statusTextUsed : styles.statusTextUnused]}>
                          {used ? 'ĐÃ DÙNG' : 'CÒN HẠN'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Transaction PIN Verification Modal */}
      <Modal
        visible={pinModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePinModal}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.pinModalContent]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('security.pinModalTitle')}</Text>
                <Pressable onPress={closePinModal} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color={colors.primary} />
                </Pressable>
              </View>

              <View style={styles.pinModalBody}>
                <Text style={styles.pinModalDesc}>{t('security.pinModalRedeeming')}</Text>
                <Text style={styles.pinModalRewardName} numberOfLines={1}>
                  {selectedReward?.title}
                </Text>
                <Text style={styles.pinModalPoints}>
                  {t('security.pinModalCost', { count: selectedReward?.points })}
                </Text>

                <View style={styles.codeRow}>
                  {inputPin.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      ref={(input) => { pinInputs.current[idx] = input; }}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={1}
                      editable={redeemingKey === null}
                      selectTextOnFocus
                      style={styles.codeInput}
                      value={digit}
                      onChangeText={(val) => handlePinDigitChange(idx, val)}
                      onKeyPress={(e) => handlePinKeyPress(idx, e)}
                    />
                  ))}
                </View>

                {redeemingKey !== null && (
                  <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerBg: {
    height: 180,
    justifyContent: 'center',
    position: 'relative',
  },
  headerBgImage: {
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 36, 37, 0.45)',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginTop: -40,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -56,
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.surfaceContainer,
  },
  tierBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#745b1c',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tierText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  statLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  pointsHighlight: {
    color: '#745b1c',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 20,
  },
  tabCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabCardActive: {
    borderColor: '#745b1c',
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  tabIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tabIconCircleActive: {
    backgroundColor: '#745b1c',
  },
  tabText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  tabTextActive: {
    color: '#745b1c',
  },
  catalogContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.primary,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 40,
  },
  errorCard: {
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#fff7f6',
    padding: 18,
  },
  errorText: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  retryText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
    marginTop: 7,
  },
  emptyCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 30,
    backgroundColor: colors.white,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  rewardRowCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  rewardRowImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
  },
  rewardRowBody: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  rewardRowPartner: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  rewardOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  bookingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bookingBadgeText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 0.4,
  },
  rewardDiscount: {
    color: colors.success,
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  rewardRowTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  rewardRowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardRowPoints: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#745b1c',
  },
  redeemActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  redeemActionBtnDisabled: {
    backgroundColor: colors.surfaceVariant,
  },
  redeemActionText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.white,
  },
  redeemActionTextDisabled: {
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoider: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '40%',
    paddingBottom: 30,
  },
  pinModalContent: {
    minHeight: 0,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.primary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalEmptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  couponItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  couponIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponDetails: {
    flex: 1,
    paddingLeft: 12,
  },
  couponCodeText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  couponDateText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  couponBenefitText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.success,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeUsed: {
    backgroundColor: colors.surfaceContainer,
  },
  statusBadgeUnused: {
    backgroundColor: '#eef7f1',
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: 9,
  },
  statusTextUsed: {
    color: colors.textMuted,
  },
  statusTextUnused: {
    color: colors.success,
  },
  pinModalBody: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  pinModalDesc: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pinModalRewardName: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.primary,
    marginTop: 6,
    textAlign: 'center',
  },
  pinModalPoints: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
    marginTop: 4,
    marginBottom: 26,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  codeInput: {
    width: 44,
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 20,
    textAlign: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
});
