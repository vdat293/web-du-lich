import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingState } from './src/components/ScreenState';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { getStoredValue } from './src/storage';
import { colors } from './src/theme';
import i18n from './src/i18n';

void SplashScreen.preventAutoHideAsync();

const STORAGE_KEY = 'aoklevart_language';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  return <AppNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const ready = fontsLoaded;

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
    <AppErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          <StatusBar style="dark" />
          <AppContent />
        </FavoritesProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
