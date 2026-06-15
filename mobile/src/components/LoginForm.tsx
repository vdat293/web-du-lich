import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';

type LoginMode = 'identifier' | 'otp' | 'password';

const EMPTY_OTP = ['', '', '', '', '', ''];

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login, loginWithOtp, sendLoginOtp } = useAuth();
  const { t } = useTranslation();
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const lastAutoSubmittedOtp = useRef('');
  const [mode, setMode] = useState<LoginMode>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState([...EMPTY_OTP]);
  const [otpRecipient, setOtpRecipient] = useState('');
  const [timer, setTimer] = useState(60);
  const [secure, setSecure] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'otp' || timer <= 0) return;
    const timeout = setTimeout(() => setTimer((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [mode, timer]);

  useEffect(() => {
    const code = otp.join('');
    if (
      mode === 'otp'
      && !submitting
      && code.length === 6
      && code !== lastAutoSubmittedOtp.current
    ) {
      lastAutoSubmittedOtp.current = code;
      void verifyOtp(code);
    }
  }, [mode, otp, submitting]);

  async function requestOtp() {
    if (submitting) return;
    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) {
      setError(t('login.identifierRequired'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await sendLoginOtp(normalizedIdentifier);
      setOtp([...EMPTY_OTP]);
      setOtpRecipient(normalizedIdentifier);
      lastAutoSubmittedOtp.current = '';
      setTimer(60);
      setMode('otp');
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.otpSendFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp(code = otp.join('')) {
    if (submitting) return;
    if (code.length !== 6) {
      setError(t('login.otpRequired'));
      return;
    }

    lastAutoSubmittedOtp.current = code;
    setSubmitting(true);
    setError('');
    try {
      await loginWithOtp(identifier.trim(), code);
      onSuccess?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.otpVerifyFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPassword() {
    if (submitting) return;
    if (!identifier.trim() || !password) {
      setError(t('login.required'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await login(identifier.trim(), password);
      onSuccess?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  function updateOtp(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    lastAutoSubmittedOtp.current = '';
    setOtp(nextOtp);
    if (digit && index < nextOtp.length - 1) otpInputs.current[index + 1]?.focus();
  }

  function handleOtpKeyPress(
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  }

  function changeIdentifier() {
    setMode('identifier');
    setOtp([...EMPTY_OTP]);
    setOtpRecipient('');
    setPassword('');
    setTimer(60);
    setError('');
    lastAutoSubmittedOtp.current = '';
  }

  if (mode === 'identifier') {
    return (
      <View>
        <Text style={styles.title}>{t('login.quickTitle')}</Text>
        <Text style={styles.subtitle}>{t('login.quickSubtitle')}</Text>
        <IdentifierField value={identifier} onChangeText={setIdentifier} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={t('login.continue')}
          loading={submitting}
          onPress={() => void requestOtp()}
        />
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('login.or')}</Text>
          <View style={styles.dividerLine} />
        </View>
        <SecondaryButton
          label={t('login.usePassword')}
          onPress={() => {
            setMode('password');
            setError('');
          }}
        />
      </View>
    );
  }

  if (mode === 'password') {
    return (
      <View>
        <Text style={styles.title}>{t('login.passwordTitle')}</Text>
        <Text style={styles.subtitle}>
          {identifier.trim()
            ? t('login.passwordSubtitle', { identifier: identifier.trim() })
            : t('login.passwordSubtitleEmpty')}
        </Text>
        <IdentifierField value={identifier} onChangeText={setIdentifier} />
        <View style={styles.field}>
          <Ionicons name="lock-closed-outline" size={19} color={colors.textMuted} />
          <TextInput
            autoCapitalize="none"
            placeholder={t('login.password')}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={secure}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => void submitPassword()}
          />
          <Pressable onPress={() => setSecure((value) => !value)}>
            <Ionicons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={t('login.submit')}
          loading={submitting}
          onPress={() => void submitPassword()}
        />
        <View style={styles.linkRow}>
          <LinkButton label={t('login.changeIdentifier')} onPress={changeIdentifier} />
          <LinkButton
            label={t('login.useOtp')}
            onPress={() => {
              if (otpRecipient === identifier.trim() && otpRecipient) {
                setMode('otp');
                setError('');
                setTimeout(() => otpInputs.current[0]?.focus(), 100);
              } else {
                void requestOtp();
              }
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.title}>{t('login.otpTitle')}</Text>
      <Text style={styles.subtitle}>
        {t('login.otpSubtitle', { identifier: identifier.trim() })}
      </Text>
      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(input) => {
              otpInputs.current[index] = input;
            }}
            autoFocus={index === 0}
            keyboardType="number-pad"
            maxLength={1}
            editable={!submitting}
            selectTextOnFocus
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => updateOtp(index, value)}
            onKeyPress={(event) => handleOtpKeyPress(index, event)}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.linkRow}>
        {timer === 0 ? (
          <LinkButton label={t('login.resendOtp')} onPress={() => void requestOtp()} />
        ) : (
          <Text style={styles.timer}>{t('login.resendAfter', { seconds: timer })}</Text>
        )}
        <LinkButton
          label={t('login.usePassword')}
          onPress={() => {
            setMode('password');
            setError('');
          }}
        />
      </View>
      <PrimaryButton
        label={t('login.verifyOtp')}
        loading={submitting}
        onPress={() => void verifyOtp()}
      />
      <View style={styles.centerLink}>
        <LinkButton label={t('login.changeIdentifier')} onPress={changeIdentifier} />
      </View>
    </View>
  );
}

function IdentifierField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.field}>
      <Ionicons name="person-outline" size={19} color={colors.textMuted} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder={t('login.identifier')}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function PrimaryButton({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={loading}
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onPress}
    >
      {loading
        ? <ActivityIndicator color={colors.white} />
        : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Ionicons name="key-outline" size={18} color={colors.primary} />
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontFamily: fonts.heading, fontSize: 19, marginBottom: 5 },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  field: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 },
  otpRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  otpInput: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    backgroundColor: '#fff1f0',
    borderRadius: 10,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  button: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  secondaryButtonText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14 },
  linkRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  link: { color: colors.primaryLight, fontFamily: fonts.bold, fontSize: 12 },
  timer: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
  centerLink: { alignItems: 'center', marginTop: 16 },
});
