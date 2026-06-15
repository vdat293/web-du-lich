import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, View, StyleSheet, Pressable } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import {
  BottomTabBar,
  type BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts } from '../theme';
import { DetailsScreen } from '../screens/DetailsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { TripsScreen } from '../screens/TripsScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import { SetupPinScreen } from '../screens/SetupPinScreen'; // Transaction PIN setup screen
import { HelpCenterScreen } from '../screens/HelpCenterScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { AppLockScreen } from '../screens/AppLockScreen';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const TAB_TRANSITION_DURATION = 260;
const tabTransitionEasing = Easing.bezier(0.22, 1, 0.36, 1);

const icons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Explore: 'compass',
  Saved: 'heart',
  Trips: 'briefcase',
  Rewards: 'gift',
  Notifications: 'notifications',
  Profile: 'person',
};

function TabBarIcon({
  name,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
}) {
  return (
    <View style={tabIconStyles.wrapper}>
      <Ionicons name={name} color={color} size={size} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  barContainer: {
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: colors.primary,
  },
});

function AnimatedTabBar(props: BottomTabBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const progress = useRef(new Animated.Value(props.state.index)).current;
  const tabWidth = barWidth / props.state.routes.length;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: props.state.index,
      duration: TAB_TRANSITION_DURATION,
      easing: tabTransitionEasing,
      useNativeDriver: Platform.OS !== 'web',
    });

    animation.start();
    return () => animation.stop();
  }, [progress, props.state.index]);

  return (
    <View
      style={tabIconStyles.barContainer}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
    >
      <BottomTabBar {...props} />
      {barWidth > 0 ? (
        <Animated.View
          style={[
            tabIconStyles.indicator,
            {
              pointerEvents: 'none',
              left: tabWidth / 2 - 12,
              transform: [{ translateX: Animated.multiply(progress, tabWidth) }],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function TabNavigator() {
  const { notifications, user } = useAuth();
  const { t: tt } = useTranslation();
  const unreadCount = user ? notifications.filter((n) => n.unread).length : 0;

  return (
    <Tabs.Navigator
      detachInactiveScreens={false}
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'none',
        lazy: false,
        sceneStyle: { backgroundColor: colors.surface },
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
          ...Platform.select({
            web: { boxShadow: '0 -8px 18px rgba(1, 36, 37, 0.1)' },
            default: {
              shadowColor: colors.primary,
              shadowOpacity: 0.1,
              shadowRadius: 18,
              elevation: 12,
            },
          }),
        },
        tabBarIcon: ({ color, focused, size }) => {
          const iconName = focused ? icons[route.name] : (`${icons[route.name]}-outline` as keyof typeof Ionicons.glyphMap);
          return <TabBarIcon name={iconName} color={color} size={size} />;
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
      <Tabs.Screen name="Rewards" component={RewardsScreen} options={{ title: tt('nav.rewards') }} />
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
        <Stack.Screen name="SetupPin" component={SetupPinScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Unlock" component={AppLockScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
