import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet, Pressable } from 'react-native';
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
import { LoginScreen } from '../screens/LoginScreen';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
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

function TabBarIcon({
  name,
  color,
  focused,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  size: number;
}) {
  const animValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: focused ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const dotScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const dotOpacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 1],
  });

  return (
    <View style={tabIconStyles.wrapper}>
      <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
        <Ionicons name={name} color={color} size={size} />
      </Animated.View>
      <Animated.View
        style={[
          tabIconStyles.dot,
          {
            backgroundColor: colors.primary,
            opacity: dotOpacity,
            transform: [{ scaleX: dotScale }],
          },
        ]}
      />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
});

function TabNavigator() {
  const { notifications, user } = useAuth();
  const { t: tt } = useTranslation();
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
          shadowColor: colors.primary,
          shadowOpacity: 0.1,
          shadowRadius: 18,
          elevation: 12,
        },
        tabBarIcon: ({ color, focused, size }) => {
          const iconName = focused ? icons[route.name] : (`${icons[route.name]}-outline` as keyof typeof Ionicons.glyphMap);
          return <TabBarIcon name={iconName} color={color} focused={focused} size={size} />;
        },
        tabBarButton: ({ ref: _ref, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ color: colors.primary + '12', borderless: true, foreground: false }}
            style={({ pressed }) => [
              props.style as any,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          />
        ),
      })}
    >
      <Tabs.Screen name="Explore" component={HomeScreen} options={{ title: tt('nav.explore') }} />
      <Tabs.Screen name="Saved" component={FavoritesScreen} options={{ title: tt('nav.saved') }} />
      <Tabs.Screen name="Trips" component={TripsScreen} options={{ title: tt('nav.trips') }} />
      <Tabs.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          title: tt('nav.notifications'),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error, color: colors.white, fontSize: 10, lineHeight: 13, height: 16, minWidth: 16 },
        }} 
      />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: tt('nav.profile') }} />
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
        <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
