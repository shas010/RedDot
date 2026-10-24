export const Colors = {
  // Brand
  primary: '#6C63FF',
  primaryDark: '#4B44CC',

  // Status
  busy: '#EF4444',
  busyLight: '#FEE2E2',
  available: '#22C55E',
  availableLight: '#DCFCE7',

  // Surfaces
  background: '#0F0F14',
  card: '#1C1C28',
  cardBorder: '#2A2A3D',

  // Text
  textPrimary: '#F1F1F5',
  textSecondary: '#9393A8',
  textMuted: '#5C5C78',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};

export const StatusColors = {
  busy: { bg: Colors.busyLight, text: Colors.busy, dot: Colors.busy },
  available: { bg: Colors.availableLight, text: Colors.available, dot: Colors.available },
};
