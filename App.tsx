import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AppNavigator from '@/navigation/AppNavigator';
import { ThemeProvider } from '@/theme/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </ThemeProvider>
  );
}
