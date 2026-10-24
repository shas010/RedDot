import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '@/screens/HomeScreen';
import CircleScreen from '@/screens/CircleScreen';
import AddFriendScreen from '@/screens/AddFriendScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ThemeScreen from '@/screens/ThemeScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import AuthScreen from '@/screens/AuthScreen';
import StatusPickerScreen from '@/screens/StatusPickerScreen';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export type RootStackParamList = {
  Main: undefined;
  StatusPicker: undefined;
  AddFriend: undefined;
};

export type TabParamList = {
  Home: undefined;
  Circle: undefined;
  History: undefined;
  Themes: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const { theme } = useTheme();
  const T = theme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: T.tabBackground,
          borderTopColor: T.border,
          paddingBottom: 8,
          height: 62,
        },
        tabBarActiveTintColor: T.accent,
        tabBarInactiveTintColor: T.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'radio-button-on',
            Circle: 'people',
            History: 'time',
            Themes: 'color-palette',
            Profile: 'person-circle',
          };
          return <Icon name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Circle" component={CircleScreen} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Activity' }} />
      <Tab.Screen name="Themes" component={ThemeScreen} options={{ title: 'Theme' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const T = theme;

  if (loading) return null;
  if (!user) return <AuthScreen />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: T.card },
        headerTintColor: T.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="StatusPicker"
        component={StatusPickerScreen}
        options={{ title: 'What are you busy with?', presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
        options={{ title: 'Add to Circle', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
