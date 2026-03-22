import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const HapticFeedback = {
  /** Light tap — any touch interaction */
  tap: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /** Medium impact — element reaction */
  elementReact: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /** Success notification — correct match or completion */
  success: () => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /** Heavy impact — palm slam or big celebration */
  heavy: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /** Selection change — subtle feedback for UI navigation */
  selection: () => {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync();
  },

  /** Celebration pattern — multiple haptic pulses for big rewards */
  celebrate: async () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 80));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 80));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
};
