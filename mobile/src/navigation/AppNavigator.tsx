import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts } from '../theme';
import { DetailsScreen } from '../screens/DetailsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { TripsScreen } from '../screens/TripsScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import { HelpCenterScreen } from '../screens/HelpCenterScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const icons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Explore: 'compass',
  Saved: 'heart',
  Trips: 'briefcase',
  Notifications: 'notifications',
  Profile: 'person',
};

function TabNavigator() {
  const { notifications, user } = useAuth();
  const unreadCount = user ? notifications.filter((n) => n.unread).length : 0;

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11, paddingBottom: 2 },
        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 12,
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: colors.surface,
          position: 'absolute',
          shadowColor: colors.primary,
          shadowOpacity: 0.1,
          shadowRadius: 18,
          elevation: 12,
        },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={focused ? icons[route.name] : (`${icons[route.name]}-outline` as keyof typeof Ionicons.glyphMap)} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen name="Explore" component={HomeScreen} options={{ title: 'Khám phá' }} />
      <Tabs.Screen name="Saved" component={FavoritesScreen} options={{ title: 'Đã lưu' }} />
      <Tabs.Screen name="Trips" component={TripsScreen} options={{ title: 'Chuyến đi' }} />
      <Tabs.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          title: 'Thông báo',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error, color: colors.white, fontSize: 10, lineHeight: 13, height: 16, minWidth: 16 },
        }} 
      />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: colors.surface, card: colors.surface },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
