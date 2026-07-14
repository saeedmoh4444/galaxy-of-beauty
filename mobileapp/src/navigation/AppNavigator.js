import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import CustomerDashboard from '../screens/CustomerDashboard';
import TechnicianDashboard from '../screens/TechnicianDashboard';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import WishlistScreen from '../screens/WishlistScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#7C3AED', tabBarStyle: { paddingBottom: 5, height: 60 } }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'الرئيسية', tabBarIcon: () => <TabIcon icon="🏠" /> }} />
      <Tab.Screen name="ServicesTab" component={ServicesScreen} options={{ tabBarLabel: 'الخدمات', tabBarIcon: () => <TabIcon icon="✨" /> }} />
      <Tab.Screen name="BookingsTab" component={CustomerDashboard} options={{ tabBarLabel: 'حجوزاتي', tabBarIcon: () => <TabIcon icon="📋" /> }} />
      <Tab.Screen name="WalletTab" component={WalletScreen} options={{ tabBarLabel: 'المحفظة', tabBarIcon: () => <TabIcon icon="💰" /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'حسابي', tabBarIcon: () => <TabIcon icon="👤" /> }} />
    </Tab.Navigator>
  );
}

function TechnicianTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#7C3AED', tabBarStyle: { paddingBottom: 5, height: 60 } }}>
      <Tab.Screen name="RequestsTab" component={TechnicianDashboard} options={{ tabBarLabel: 'الطلبات', tabBarIcon: () => <TabIcon icon="📨" /> }} />
      <Tab.Screen name="WalletTab" component={WalletScreen} options={{ tabBarLabel: 'المحفظة', tabBarIcon: () => <TabIcon icon="💰" /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'حسابي', tabBarIcon: () => <TabIcon icon="👤" /> }} />
    </Tab.Navigator>
  );
}

function TabIcon({ icon }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const navigationRef = useRef(null);
  const prevAuthRef = useRef(isAuthenticated);

  // React to auth state changes — navigate to Login on logout, or main screen on login
  useEffect(() => {
    if (!navigationRef.current || isLoading) return;
    if (prevAuthRef.current === isAuthenticated) return;
    prevAuthRef.current = isAuthenticated;

    if (!isAuthenticated) {
      // Logged out — reset to Login screen
      navigationRef.current.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
      );
    } else {
      // Logged in — navigate to appropriate tabs
      const target = user?.role === 'TECHNICIAN' ? 'TechTabs' : 'CustomerTabs';
      navigationRef.current.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: target }] })
      );
    }
  }, [isAuthenticated, isLoading, user?.role]);

  // Consume pending deep links from notifications
  useEffect(() => {
    if (!isLoading && global.__pendingDeepLink && navigationRef.current) {
      const { screen, params } = global.__pendingDeepLink;
      global.__pendingDeepLink = null;
      setTimeout(() => {
        navigationRef.current?.navigate(screen, params);
      }, 500);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={!isAuthenticated ? 'Login' : user?.role === 'TECHNICIAN' ? 'TechTabs' : 'CustomerTabs'} screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Customer */}
        <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ headerShown: true, title: 'تفاصيل الخدمة', headerTintColor: '#7C3AED' }} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ headerShown: true, title: 'حجز جديد', headerTintColor: '#7C3AED' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'الإشعارات', headerTintColor: '#7C3AED' }} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ headerShown: true, title: 'المفضلة', headerTintColor: '#7C3AED' }} />

        {/* Technician */}
        <Stack.Screen name="TechTabs" component={TechnicianTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
