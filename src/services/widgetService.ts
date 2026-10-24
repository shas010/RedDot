import { NativeModules, Platform } from 'react-native';

const { WidgetBridge } = NativeModules;

/**
 * Synchronizes the app's current status with the native Android Home Screen Widget.
 */
export function updateHomeScreenWidget(isBusy: boolean, emoji: string, message: string): void {
  if (Platform.OS === 'android' && WidgetBridge?.syncWidget) {
    try {
      WidgetBridge.syncWidget(isBusy, emoji, message);
    } catch (e) {
      console.warn('Failed to sync with Android home screen widget:', e);
    }
  }
}
