/**
 * Design tokens shared by every screen. Kept as plain objects (not a
 * CSS-in-JS theme) so they work equally well as StyleSheet values and as
 * plain props. Mirrored in tailwind.config.js for the NativeWind classes
 * used in layout-heavy screens — keep both in sync when changing a color.
 */

export const colors = {
  brandPrimary: '#0B3B24', // deep field green — primary actions, headers
  brandPrimaryDark: '#082A19',
  brandAccent: '#F58220', // marigold orange — secondary actions, alerts
  brandAccentDark: '#8A3B00',
  background: '#FDFBF7', // warm off-white app background
  surface: '#FFFFFF',
  surfaceMuted: '#F5F4F0',
  border: '#E7E5DF',

  textPrimary: '#1A2420',
  textSecondary: '#5B6660',
  textInverse: '#FFFFFF',
  textMuted: '#8A938D',

  success: '#1E7A3D',
  successBg: '#E5F3EA',
  warning: '#B4700A',
  warningBg: '#FDF0DD',
  danger: '#B3261E',
  dangerBg: '#FBE9E7',
  info: '#1E5FB4',
  infoBg: '#E8F0FC',

  confidenceHigh: '#1E7A3D',
  confidenceMedium: '#B4700A',
  confidenceLow: '#B3261E',

  overlay: 'rgba(11, 59, 36, 0.55)',
  shadow: '#0B3B24',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/**
 * Font families come from the bundled Noto Sans families so Telugu and
 * Devanagari glyphs render correctly offline, pre-install, on every device.
 * Loaded once in app/_layout.tsx via useFonts; fall back to system fonts
 * until loaded so the splash → first paint never renders blank.
 */
export const fontFamily = {
  regular: 'NotoSans_400Regular',
  medium: 'NotoSans_500Medium',
  bold: 'NotoSans_700Bold',
  teluguRegular: 'NotoSansTelugu_400Regular',
  teluguBold: 'NotoSansTelugu_700Bold',
  hindiRegular: 'NotoSansDevanagari_400Regular',
  hindiBold: 'NotoSansDevanagari_700Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 36,
} as const;

export const minTouchTarget = 64;

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

/** Word-labels for a numeric confidence score — never show a raw number alone. */
export function confidenceBand(confidence: number): {
  level: 'high' | 'medium' | 'low';
  color: string;
} {
  if (confidence >= 0.6) return { level: 'high', color: colors.confidenceHigh };
  if (confidence >= 0.35) return { level: 'medium', color: colors.confidenceMedium };
  return { level: 'low', color: colors.confidenceLow };
}
