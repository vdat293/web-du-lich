export const colors = {
  primary: '#012425',
  primaryContainer: '#1a3a3a',
  primaryLight: '#2d5a5a',
  secondary: '#745b1c',
  secondaryFixed: '#ffdf9b',
  accent: '#e8d5a3',
  surface: '#fcf9f8',
  surfaceLow: '#f6f3f2',
  surfaceContainer: '#f0eded',
  surfaceVariant: '#e5e2e1',
  white: '#ffffff',
  text: '#1b1b1b',
  textMuted: '#6b6b6b',
  textSoft: '#414848',
  outline: '#c1c8c7',
  border: 'rgba(0,0,0,0.07)',
  error: '#ba1a1a',
  success: '#28663f',
} as const;

export const fonts = {
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  heading: 'DMSans_700Bold',
  display: 'DMSans_700Bold',
} as const;

export const shadow = {
  ...Platform.select({
    web: { boxShadow: '0 8px 18px rgba(1, 36, 37, 0.12)' },
    default: {
      shadowColor: '#012425',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 6,
    },
  }),
} as const;
import { Platform } from 'react-native';
