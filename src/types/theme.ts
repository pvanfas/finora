export type AccentThemeId = 'orange' | 'violet' | 'emerald' | 'ocean' | 'rose';

export interface AccentTheme {
  id: AccentThemeId;
  name: string;
  primary: string;
  hover: string;
  light: string;
  border: string;
}
