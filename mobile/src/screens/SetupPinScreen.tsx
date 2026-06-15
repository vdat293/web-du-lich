import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { securityService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';
import { setStoredValue } from '../storage';

type Mode = 'send_otp' | 'otp' | 'set_pin' | 'confirm_pin' | 'success';
const EMPTY_CODE = ['', '', '', '', '', ''];

type SetupPinScreenRouteProp = RouteProp<RootStackParamList, 'SetupPin'>;

export function SetupPinScreen() {
  const { user, updateUser } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<SetupPinScreenRouteProp>();
  const { t } = useTranslation();

  const returnToRewards = route.params?.returnToRewards;

  const [mode, setMode] = useState<Mode>('send_otp');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // OTP Verification States
  const [otp, setOtp] = useState([...EMPTY_CODE]);
  const [timer, setTimer] = useState(60);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  // PIN Configuration States
  const [pin, setPin] = useState([...EMPTY_CODE]);
  const [confirmPin, setConfirmPin] = useState([...EMPTY_CODE]);
  const [setupToken, setSetupToken] = useState('');
  const pinInputs = useRef<Array<TextInput | null>>([]);
  const confirmPinInputs = useRef<Array<TextInput | null>>([]);

  // Timer countdown for OTP
  useEffect(() => {
    if (mode !== 'otp' || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [mode, timer]);

  // Handle auto-submitting verification OTP
  useEffect(() => {
    const codeStr = otp.join('');
    if (mode === 'otp' && codeStr.length === 6 && !submitting) {
      void verifyOtp(codeStr);
    }
  }, [mode, otp]);

  // Handle auto-transitioning to confirm PIN
  useEffect(() => {
    const pinStr = pin.join('');
    if (mode === 'set_pin' && pinStr.length === 6) {
      setMode('confirm_pin');
      setTimeout(() => confirmPinInputs.current[0]?.focus(), 100);
    }
  }, [mode, pin]);

  // Handle auto-submitting PIN for confirmation
  useEffect(() => {
    const confirmPinStr = confirmPin.join('');
    if (mode === 'confirm_pin' && confirmPinStr.length === 6 && !submitting) {
      void handleSavePin(confirmPinStr);
    }
  }, [mode, confirmPin]);

  // Request/Send OTP to Email/SMS on mount or retry
  const sendOtp = async () => {
    setSubmitting(true);
    setError('');
    setDevOtp(null);
    try {
      const res = await securityService.sendSetupOtp();
      setTimer(60);
      setOtp([...EMPTY_CODE]);
      setMode('otp');
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setTimeout(() => otpInputs.current[0]?.focus(), 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('security.otpSendFailed'));
      setMode('send_otp');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger send OTP automatically when screen is loaded
  useEffect(() => {
    void sendOtp();
  }, []);

  const verifyOtp = async (codeStr: string) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await securityService.verifySetupOtp(codeStr);
      setSetupToken(res.setup_token);
      setMode('set_pin');
      setTimeout(() => pinInputs.current[0]?.focus(), 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('security.otpVerifyFailed'));
      setOtp([...EMPTY_CODE]);
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePin = async (confirmPinStr: string) => {
    const pinStr = pin.join('');
    if (pinStr !== confirmPinStr) {
      setError(t('security.pinErrorMismatch'));
      setConfirmPin([...EMPTY_CODE]);
      setMode('set_pin');
      setPin([...EMPTY_CODE]);
      setTimeout(() => pinInputs.current[0]?.focus(), 150);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await securityService.setTransactionPin(pinStr, setupToken);
      // Update local auth context
      if (user) {
        await updateUser({ ...user, transaction_pin_enabled: true });
      }
      // Cache PIN in secure store immediately
      try {
        await setStoredValue('aoklevart_transaction_pin', pinStr);
      } catch (storeErr) {
        console.log('Failed to save PIN in SecureStore during setup:', storeErr);
      }
      setMode('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('security.pinErrorFailed'));
      setPin([...EMPTY_CODE]);
      setConfirmPin([...EMPTY_CODE]);
      setMode('set_pin');
      setTimeout(() => pinInputs.current[0]?.focus(), 100);
    } finally {
      setSubmitting(false);
    }
  };

  // PIN and OTP keypad helpers
  const handleDigitChange = (
    index: number,
    value: string,
    digitArray: string[],
    setDigitArray: (arr: string[]) => void,
    inputsRef: React.MutableRefObject<Array<TextInput | null>>,
  ) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newArr = [...digitArray];
    newArr[index] = digit;
    setDigitArray(newArr);
    if (digit && index < digitArray.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    digitArray: string[],
    inputsRef: React.MutableRefObject<Array<TextInput | null>>,
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !digitArray[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Complete setup
  const handleComplete = () => {
    if (returnToRewards) {
      navigation.navigate('Tabs', { screen: 'Rewards' });
    } else {
      navigation.goBack();
    }
  };

  // Mask user contact information
  const getMaskedIdentifier = () => {
    if (!user) return '';
    const id = user.email || user.phone || '';
    if (id.includes('@')) {
      const [local, domain] = id.split('@');
      return `${local.slice(0, 3)}***@${domain}`;
    }
    return `${id.slice(0, 3)}******${id.slice(-2)}`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('security.transactionSecurity')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {mode === 'send_otp' && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('security.otpInitLoading')}</Text>
          </View>
        )}

        {mode === 'otp' && (
          <View style={styles.stageContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-open-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('security.otpVerifyTitle')}</Text>
            <Text style={styles.desc}>
              {t('security.otpVerifyDesc', { identifier: getMaskedIdentifier() })}
            </Text>

            <View style={styles.codeRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(input) => { otpInputs.current[idx] = input; }}
                  autoFocus={idx === 0}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!submitting}
                  selectTextOnFocus
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(val) =>
                    handleDigitChange(idx, val, otp, setOtp, otpInputs)
                  }
                  onKeyPress={(e) => handleKeyPress(idx, e, otp, otpInputs)}
                />
              ))}
            </View>

            {devOtp && (
              <View style={styles.devOtpContainer}>
                <Text style={styles.devOtpText}>{t('security.devOtp', { code: devOtp })}</Text>
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.timerRow}>
              {timer > 0 ? (
                <Text style={styles.timerText}>{t('security.otpTimer', { seconds: timer })}</Text>
              ) : (
                <Pressable onPress={() => void sendOtp()} disabled={submitting}>
                  <Text style={styles.resendText}>{t('security.otpResend')}</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {mode === 'set_pin' && (
          <View style={styles.stageContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="keypad-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('security.pinSetupTitle')}</Text>
            <Text style={styles.desc}>
              {t('security.pinSetupDesc')}
            </Text>

            <View style={styles.codeRow}>
              {pin.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(input) => { pinInputs.current[idx] = input; }}
                  autoFocus={idx === 0}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={1}
                  editable={!submitting}
                  selectTextOnFocus
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(val) =>
                    handleDigitChange(idx, val, pin, setPin, pinInputs)
                  }
                  onKeyPress={(e) => handleKeyPress(idx, e, pin, pinInputs)}
                />
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        )}

        {mode === 'confirm_pin' && (
          <View style={styles.stageContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('security.pinConfirmTitle')}</Text>
            <Text style={styles.desc}>
              {t('security.pinConfirmDesc')}
            </Text>

            <View style={styles.codeRow}>
              {confirmPin.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(input) => { confirmPinInputs.current[idx] = input; }}
                  autoFocus={idx === 0}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={1}
                  editable={!submitting}
                  selectTextOnFocus
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(val) =>
                    handleDigitChange(idx, val, confirmPin, setConfirmPin, confirmPinInputs)
                  }
                  onKeyPress={(e) => handleKeyPress(idx, e, confirmPin, confirmPinInputs)}
                />
              ))}
            </View>

            {submitting && <ActivityIndicator color={colors.primary} style={styles.loader} />}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setPin([...EMPTY_CODE]);
                setConfirmPin([...EMPTY_CODE]);
                setMode('set_pin');
                setError('');
                setTimeout(() => pinInputs.current[0]?.focus(), 150);
              }}
            >
              <Text style={styles.cancelBtnText}>{t('security.pinConfirmBack')}</Text>
            </Pressable>
          </View>
        )}

        {mode === 'success' && (
          <View style={styles.stageContainer}>
            <View style={[styles.iconCircle, styles.successCircle]}>
              <Ionicons name="checkmark" size={42} color={colors.white} />
            </View>
            <Text style={styles.title}>{t('security.pinSuccessTitle')}</Text>
            <Text style={styles.desc}>
              {t('security.pinSuccessDesc')}
            </Text>

            <Pressable style={styles.completeBtn} onPress={handleComplete}>
              <Text style={styles.completeBtnText}>{t('security.pinSuccessComplete')}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 16,
  },
  stageContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successCircle: {
    backgroundColor: colors.success,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  codeInput: {
    width: 45,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 22,
    textAlign: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  errorText: {
    color: colors.error,
    backgroundColor: '#fff1f0',
    borderRadius: 10,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    textAlign: 'center',
    width: '100%',
    maxWidth: 310,
  },
  devOtpContainer: {
    backgroundColor: colors.surfaceContainer,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  devOtpText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.text,
  },
  devOtpCode: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  timerRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  resendText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  loader: {
    marginVertical: 15,
  },
  cancelBtn: {
    padding: 16,
    marginTop: 10,
  },
  cancelBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMuted,
  },
  biometricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
    width: '100%',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(1, 36, 37, 0.05)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  biometricsText: {
    flex: 1,
    paddingLeft: 12,
  },
  biometricsTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  biometricsDesc: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  completeBtn: {
    width: '100%',
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  completeBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
