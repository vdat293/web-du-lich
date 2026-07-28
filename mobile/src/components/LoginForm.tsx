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

import { authService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';

type LoginMode =
  | 'identifier'
  | 'otp'
  | 'password'
  | 'register'
  | 'forgotIdentifier'
  | 'forgotOtp'
  | 'forgotReset';

const EMPTY_OTP = ['', '', '', '', '', ''];

export function LoginForm({
  onSuccess,
  allowAccountActions = true,
}: {
  onSuccess?: () => void;
  allowAccountActions?: boolean;
}) {
  const { login, loginWithOtp, sendLoginOtp } = useAuth();
  const { t } = useTranslation();
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const lastAutoSubmittedOtp = useRef('');
  const lastAutoSubmittedForgotOtp = useRef('');
  const [mode, setMode] = useState<LoginMode>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState([...EMPTY_OTP]);
  const [otpRecipient, setOtpRecipient] = useState('');
  const [timer, setTimer] = useState(60);
  const [secure, setSecure] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotTransactionId, setForgotTransactionId] = useState('');
  const [forgotOtp, setForgotOtp] = useState([...EMPTY_OTP]);
  const [forgotTimer, setForgotTimer] = useState(300);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureNewPassword, setSecureNewPassword] = useState(true);

  useEffect(() => {
    if (mode !== 'otp' || timer <= 0) return;
    const timeout = setTimeout(() => setTimer((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [mode, timer]);

  useEffect(() => {
    if (mode !== 'forgotOtp' || forgotTimer <= 0) return;
    const timeout = setTimeout(() => setForgotTimer((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [forgotTimer, mode]);

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

  useEffect(() => {
    const code = forgotOtp.join('');
    if (
      mode === 'forgotOtp'
      && !submitting
      && code.length === 6
      && code !== lastAutoSubmittedForgotOtp.current
    ) {
      lastAutoSubmittedForgotOtp.current = code;
      void verifyForgotOtp(code);
    }
  }, [forgotOtp, mode, submitting]);

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

  async function submitRegister() {
    if (submitting) return;
    const payload = {
      firstName: registerFirstName.trim(),
      lastName: registerLastName.trim(),
      email: registerEmail.trim(),
      password: registerPassword,
    };
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
      setError(t('login.registerRequired'));
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const result = await authService.register(payload);
      setIdentifier(payload.email);
      setPassword('');
      setSuccess(result.message || t('login.registerSuccess'));
      setMode('password');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.registerFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function requestForgotOtp() {
    if (submitting) return;
    const normalizedIdentifier = forgotIdentifier.trim();
    if (!normalizedIdentifier) {
      setError(t('login.identifierRequired'));
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const result = await authService.forgotPassword(normalizedIdentifier);
      setForgotTransactionId(result.transaction_id);
      setForgotOtp([...EMPTY_OTP]);
      setForgotTimer(300);
      lastAutoSubmittedForgotOtp.current = '';
      setMode('forgotOtp');
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.forgotSendFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyForgotOtp(code = forgotOtp.join('')) {
    if (submitting) return;
    if (code.length !== 6) {
      setError(t('login.otpRequired'));
      return;
    }

    lastAutoSubmittedForgotOtp.current = code;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const result = await authService.verifyResetOtp(forgotTransactionId, code);
      setSuccess(result.message);
      setMode('forgotReset');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.otpVerifyFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitResetPassword() {
    if (submitting) return;
    if (newPassword.length < 6) {
      setError(t('login.passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('login.passwordMismatch'));
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const result = await authService.resetPassword(
        forgotTransactionId,
        forgotOtp.join(''),
        newPassword,
      );
      setIdentifier(forgotIdentifier.trim());
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(result.message || t('login.resetSuccess'));
      setMode('password');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.resetFailed'));
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
    setSuccess('');
    lastAutoSubmittedOtp.current = '';
  }

  function openRegister() {
    setRegisterFirstName('');
    setRegisterLastName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setError('');
    setSuccess('');
    setMode('register');
  }

  function openForgotPassword() {
    setForgotIdentifier(identifier.trim());
    setForgotTransactionId('');
    setForgotOtp([...EMPTY_OTP]);
    setForgotTimer(300);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    lastAutoSubmittedForgotOtp.current = '';
    setMode('forgotIdentifier');
  }

  function backToLogin() {
    setMode(identifier.trim() ? 'password' : 'identifier');
    setError('');
    setSuccess('');
  }

  if (mode === 'register') {
    return (
      <View>
        <Text style={styles.title}>{t('login.registerTitle')}</Text>
        <Text style={styles.subtitle}>{t('login.registerSubtitle')}</Text>
        <View style={styles.nameRow}>
          <TextField
            icon="person-outline"
            placeholder={t('login.firstName')}
            value={registerFirstName}
            onChangeText={setRegisterFirstName}
            containerStyle={styles.nameField}
          />
          <TextField
            placeholder={t('login.lastName')}
            value={registerLastName}
            onChangeText={setRegisterLastName}
            containerStyle={styles.nameField}
          />
        </View>
        <TextField
          icon="mail-outline"
          placeholder={t('login.email')}
          value={registerEmail}
          onChangeText={setRegisterEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PasswordField
          placeholder={t('login.password')}
          value={registerPassword}
          onChangeText={setRegisterPassword}
          secure={secure}
          onToggleSecure={() => setSecure((value) => !value)}
          onSubmitEditing={() => void submitRegister()}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={t('login.createAccount')}
          loading={submitting}
          onPress={() => void submitRegister()}
        />
        <View style={styles.centerLink}>
          <Text style={styles.inlinePrompt}>
            {t('login.alreadyAccount')}{' '}
            <Text style={styles.link} onPress={backToLogin}>{t('login.submit')}</Text>
          </Text>
        </View>
      </View>
    );
  }

  if (mode === 'forgotIdentifier') {
    return (
      <View>
        <StepIndicator step={1} />
        <Text style={styles.title}>{t('login.forgotTitle')}</Text>
        <Text style={styles.subtitle}>{t('login.forgotSubtitle')}</Text>
        <IdentifierField value={forgotIdentifier} onChangeText={setForgotIdentifier} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={t('login.sendResetOtp')}
          loading={submitting}
          onPress={() => void requestForgotOtp()}
        />
        <View style={styles.centerLink}>
          <LinkButton label={t('login.backToLogin')} onPress={backToLogin} />
        </View>
      </View>
    );
  }

  if (mode === 'forgotOtp') {
    return (
      <View>
        <StepIndicator step={2} />
        <Text style={styles.title}>{t('login.resetOtpTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('login.resetOtpSubtitle', { identifier: forgotIdentifier.trim() })}
        </Text>
        <OtpFields
          otp={forgotOtp}
          inputs={otpInputs}
          submitting={submitting}
          onChange={(index, value) => {
            const digit = value.replace(/\D/g, '').slice(-1);
            const nextOtp = [...forgotOtp];
            nextOtp[index] = digit;
            lastAutoSubmittedForgotOtp.current = '';
            setForgotOtp(nextOtp);
            if (digit && index < nextOtp.length - 1) otpInputs.current[index + 1]?.focus();
          }}
          onKeyPress={(index, event) => {
            if (event.nativeEvent.key === 'Backspace' && !forgotOtp[index] && index > 0) {
              otpInputs.current[index - 1]?.focus();
            }
          }}
        />
        <Text style={styles.expiry}>
          {t('login.expiresIn', {
            time: `${Math.floor(forgotTimer / 60)}:${String(forgotTimer % 60).padStart(2, '0')}`,
          })}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={t('login.verifyResetOtp')}
          loading={submitting}
          onPress={() => void verifyForgotOtp()}
        />
        <View style={styles.linkRowAfterButton}>
          <LinkButton
            label={t('login.changeIdentifier')}
            onPress={() => {
              setMode('forgotIdentifier');
              setError('');
            }}
          />
          {forgotTimer === 0 ? (
            <LinkButton label={t('login.resendOtp')} onPress={() => void requestForgotOtp()} />
          ) : null}
        </View>
      </View>
    );
  }

  if (mode === 'forgotReset') {
    return (
      <View>
        <StepIndicator step={3} />
        <Text style={styles.title}>{t('login.newPasswordTitle')}</Text>
        <Text style={styles.subtitle}>{t('login.newPasswordSubtitle')}</Text>
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <PasswordField
          placeholder={t('login.newPassword')}
          value={newPassword}
          onChangeText={setNewPassword}
          secure={secureNewPassword}
          onToggleSecure={() => setSecureNewPassword((value) => !value)}
        />
        <PasswordField
          placeholder={t('login.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secure={secureNewPassword}
          onToggleSecure={() => setSecureNewPassword((value) => !value)}
          onSubmitEditing={() => void submitResetPassword()}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={t('login.changePassword')}
          loading={submitting}
          onPress={() => void submitResetPassword()}
        />
      </View>
    );
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
        {allowAccountActions ? (
          <View style={styles.centerLink}>
            <Text style={styles.inlinePrompt}>
              {t('login.noAccount')}{' '}
              <Text style={styles.link} onPress={openRegister}>{t('login.createAccount')}</Text>
            </Text>
          </View>
        ) : null}
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
        <PasswordField
          placeholder={t('login.password')}
          value={password}
          onChangeText={setPassword}
          secure={secure}
          onToggleSecure={() => setSecure((value) => !value)}
          onSubmitEditing={() => void submitPassword()}
        />
        {success ? <Text style={styles.success}>{success}</Text> : null}
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
        {allowAccountActions ? (
          <View style={styles.accountActions}>
            <LinkButton label={t('login.forgotPassword')} onPress={openForgotPassword} />
            <LinkButton label={t('login.createAccount')} onPress={openRegister} />
          </View>
        ) : null}
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

function OtpFields({
  otp,
  inputs,
  submitting,
  onChange,
  onKeyPress,
}: {
  otp: string[];
  inputs: React.MutableRefObject<Array<TextInput | null>>;
  submitting: boolean;
  onChange: (index: number, value: string) => void;
  onKeyPress: (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => void;
}) {
  return (
    <View style={styles.otpRow}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(input) => {
            inputs.current[index] = input;
          }}
          autoFocus={index === 0}
          keyboardType="number-pad"
          maxLength={1}
          editable={!submitting}
          selectTextOnFocus
          style={styles.otpInput}
          value={digit}
          onChangeText={(value) => onChange(index, value)}
          onKeyPress={(event) => onKeyPress(index, event)}
        />
      ))}
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

function TextField({
  icon,
  containerStyle,
  ...inputProps
}: React.ComponentProps<typeof TextInput> & {
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: object;
}) {
  return (
    <View style={[styles.field, containerStyle]}>
      {icon ? <Ionicons name={icon} size={19} color={colors.textMuted} /> : null}
      <TextInput
        {...inputProps}
        autoCorrect={false}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

function PasswordField({
  secure,
  onToggleSecure,
  ...inputProps
}: React.ComponentProps<typeof TextInput> & {
  secure: boolean;
  onToggleSecure: () => void;
}) {
  return (
    <View style={styles.field}>
      <Ionicons name="lock-closed-outline" size={19} color={colors.textMuted} />
      <TextInput
        {...inputProps}
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secure}
        style={styles.input}
      />
      <Pressable onPress={onToggleSecure}>
        <Ionicons
          name={secure ? 'eye-outline' : 'eye-off-outline'}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <View style={styles.stepRow}>
      {[1, 2, 3].map((value) => (
        <View key={value} style={[styles.stepLine, value <= step && styles.stepLineActive]} />
      ))}
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
  success: {
    color: colors.success,
    backgroundColor: '#eef8f1',
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
  inlinePrompt: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
  nameRow: { flexDirection: 'row', gap: 10 },
  nameField: { flex: 1 },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepRow: { flexDirection: 'row', gap: 7, marginBottom: 20 },
  stepLine: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceVariant,
  },
  stepLineActive: { backgroundColor: colors.primary },
  expiry: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 14,
  },
  linkRowAfterButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
});
