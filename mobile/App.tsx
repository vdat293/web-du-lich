import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts as useDmSans,
} from '@expo-google-fonts/dm-sans';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  useFonts as usePlayfair,
} from '@expo-google-fonts/playfair-display';

import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingState } from './src/components/ScreenState';
import { getStoredValue } from './src/storage';
import { colors } from './src/theme';
import { useAuth } from './src/context/AuthContext';
import { subscribeToPushNotifications } from './src/notifications/push';
import i18n from './src/i18n';
import './src/i18n';

void SplashScreen.preventAutoHideAsync();

const STORAGE_KEY = 'aoklevart_language';

function AppContent() {
  const { loading, user, refreshNotifications } = useAuth();

  useEffect(() => {
    if (!user) return undefined;
    return subscribeToPushNotifications(() => {
      void refreshNotifications().catch(() => undefined);
    });
  }, [refreshNotifications, user]);

  if (loading) {
    return <LoadingState />;
  }

  return <AppNavigator />;
}

export default function App() {
  const [dmLoaded] = useDmSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const [playfairLoaded] = usePlayfair({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  const ready = dmLoaded && playfairLoaded;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    void getStoredValue(STORAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'vi') {
        void i18n.changeLanguage(stored);
      }
    });
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;
  }

  return (
    <AuthProvider>
      <FavoritesProvider>
        <StatusBar style="dark" />
        <AppContent />
      </FavoritesProvider>
    </AuthProvider>
  );
}
