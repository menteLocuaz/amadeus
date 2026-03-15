import 'styled-components';
import { Light, Dark } from '../styles/Themes';

type LightThemeType = typeof Light;
type DarkThemeType = typeof Dark;

// Unimos ambos tipos para asegurar que todas las propiedades estén presentes
type ThemeType = LightThemeType & DarkThemeType;

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ThemeType {}
}
