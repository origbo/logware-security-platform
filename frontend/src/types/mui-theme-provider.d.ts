/**
 * Type declarations for the Material UI ThemeProvider
 */

declare module '@mui/material/styles' {
  import * as React from 'react';
  import { Theme } from '@mui/material';

  export interface ThemeProviderProps {
    children?: React.ReactNode;
    theme: Theme | ((outerTheme: Theme) => Theme);
  }

  // Ensure proper typing for the ThemeProvider component
  export const ThemeProvider: (props: ThemeProviderProps) => React.ReactElement;
}

declare module '../theme/ThemeProvider' {
  import * as React from 'react';
  
  interface ThemeProviderProps {
    children?: React.ReactNode;
  }
  
  const ThemeProvider: React.FC<ThemeProviderProps>;
  export default ThemeProvider;
  
  export function useThemeContext(): {
    mode: 'light' | 'dark';
    toggleColorMode: () => void;
    theme: any;
  };
}

declare module '@mui/material/styles' {
  import { Theme, ThemeOptions } from '@mui/material/styles';
  
  export interface CustomTheme extends Theme {
    status?: {
      danger?: string;
    };
    custom?: {
      backgrounds?: {
        default?: string;
        paper?: string;
        [key: string]: string | undefined;
      };
      colors?: {
        primary?: string;
        secondary?: string;
        error?: string;
        warning?: string;
        info?: string;
        success?: string;
        [key: string]: string | undefined;
      };
    };
    alert?: {
      critical?: string;
      high?: string;
      medium?: string;
      low?: string;
      info?: string;
    };
  }
  
  export interface CustomThemeOptions extends ThemeOptions {
    status?: {
      danger?: string;
    };
    custom?: {
      backgrounds?: {
        default?: string;
        paper?: string;
        [key: string]: string | undefined;
      };
      colors?: {
        primary?: string;
        secondary?: string;
        error?: string;
        warning?: string;
        info?: string;
        success?: string;
        [key: string]: string | undefined;
      };
    };
    alert?: {
      critical?: string;
      high?: string;
      medium?: string;
      low?: string;
      info?: string;
    };
  }

  export interface CustomThemeProviderProps {
    theme?: CustomThemeOptions;
    customMode?: 'light' | 'dark' | 'system';
    toggleColorMode?: () => void;
    children?: React.ReactNode;
  }
  
  export function createTheme(options?: CustomThemeOptions, ...args: object[]): CustomTheme;
  
  export const ThemeProvider: React.FC<CustomThemeProviderProps>;
}

// Augment the theme to avoid type errors with custom properties
declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    default: string;
    paper: string;
    [key: string]: string;
  }
  
  interface TypeText {
    primary: string;
    secondary: string;
    disabled: string;
    [key: string]: string;
  }
  
  interface Palette {
    custom?: {
      backgrounds?: {
        default?: string;
        paper?: string;
        [key: string]: string | undefined;
      };
      colors?: {
        primary?: string;
        secondary?: string;
        error?: string;
        warning?: string;
        info?: string;
        success?: string;
        [key: string]: string | undefined;
      };
    };
  }
  
  interface PaletteOptions {
    custom?: {
      backgrounds?: {
        default?: string;
        paper?: string;
        [key: string]: string | undefined;
      };
      colors?: {
        primary?: string;
        secondary?: string;
        error?: string;
        warning?: string;
        info?: string;
        success?: string;
        [key: string]: string | undefined;
      };
    };
  }
}
