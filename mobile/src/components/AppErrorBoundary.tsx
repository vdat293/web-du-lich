import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import i18n from '../i18n';
import { colors, fonts } from '../theme';

type State = { hasError: boolean };

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled mobile render error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.screen} accessibilityRole="alert">
        <Text style={styles.title}>{i18n.t('screenState.crashTitle')}</Text>
        <Text style={styles.message}>{i18n.t('screenState.crashMessage')}</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => this.setState({ hasError: false })}
        >
          <Text style={styles.buttonText}>{i18n.t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, padding: 32 },
  title: { color: colors.primary, fontFamily: fonts.heading, fontSize: 25, textAlign: 'center' },
  message: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  button: { minHeight: 48, justifyContent: 'center', borderRadius: 999, backgroundColor: colors.primary, paddingHorizontal: 24, marginTop: 22 },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
});

