/** Colors from Figma file "Taking Monday" (lime + orange graffiti palette). */
export const colors = {
  gradientStart: '#86DF01',
  gradientEnd: '#5BAA00',
  /** Headings / key labels — good-things card */
  goodGreen: '#00BD40',
  goodGreenBright: '#20E50A',
  statGreen: '#00C141',
  goodGreenStroke: '#00C142',
  /** Good-wishes card */
  orange: '#F84A01',
  orangeDeep: '#F74901',
  /** Neutrals */
  text: '#000000',
  textOnGreen: '#FFFFFF',
  cream: '#FEFFFE',
  divider: 'rgba(255, 255, 255, 0.99)',
  surface: 'rgba(252, 252, 252, 0.96)',
  surfaceBorder: 'rgba(255, 255, 255, 0.55)',
  neutralLine: '#E9E8E7',
  /** Admin / forms on light panels */
  bg: '#FFF8F3',
  border: '#E1D5CD',
  textMuted: '#636E72',
  /** Shared CTA (matches orange system) */
  primary: '#F84A01',
  primaryDark: '#F74901',
} as const;

export const fonts = {
  /** Road Rage — big numbers / display */
  display: 'RoadRage_400Regular',
  /** Sedgwick Ave — labels & body */
  body: 'SedgwickAve_400Regular',
} as const;

export const radius = { card: 20, button: 14, full: 999 } as const;

export const space = { xs: 6, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
