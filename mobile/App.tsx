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
import { colors } from './src/theme';

void SplashScreen.preventAutoHideAsync();

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

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;
  }

  return (
    <AuthProvider>
      <FavoritesProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </FavoritesProvider>
    </AuthProvider>
  );
}
