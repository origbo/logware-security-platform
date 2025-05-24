/**
 * Type declarations for the custom ThemeProvider in the Logware Security Platform
 */

// Declare custom theme provider module
declare module '../../theme/ThemeProvider' {
  import * as React from 'react';
  import { Theme, PaletteMode } from '@mui/material';

  export interface ThemeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
    setMode: (mode: PaletteMode) => void;
  }

  export interface ThemeProviderProps {
    children: React.ReactNode;
  }

  export const ThemeContext: React.Context<ThemeContextType>;
  
  export function useTheme(): ThemeContextType;
  
  export const ThemeProviderWrapper: React.FC<ThemeProviderProps>;
  
  export default ThemeProviderWrapper;
}

// Also add the declarations for direct import path
declare module '../theme/ThemeProvider' {
  import * as React from 'react';
  import { Theme, PaletteMode } from '@mui/material';

  export interface ThemeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
    setMode: (mode: PaletteMode) => void;
  }

  export interface ThemeProviderProps {
    children: React.ReactNode;
  }

  export const ThemeContext: React.Context<ThemeContextType>;
  
  export function useTheme(): ThemeContextType;
  
  export const ThemeProviderWrapper: React.FC<ThemeProviderProps>;
  
  export default ThemeProviderWrapper;
}

// Add declaration for direct import in App.tsx
declare module './theme/ThemeProvider' {
  import * as React from 'react';
  import { PaletteMode } from '@mui/material';
  
  export interface ThemeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
    setMode: (mode: PaletteMode) => void;
  }

  export interface ThemeProviderProps {
    children: React.ReactNode;
  }

  export const ThemeContext: React.Context<ThemeContextType>;
  
  export function useTheme(): ThemeContextType;
  
  export const ThemeProviderWrapper: React.FC<ThemeProviderProps>;
  
  export default ThemeProviderWrapper;
}

// Also add declarations for the component import in the common directory
declare module '../components/common/ThemeProvider' {
  import * as React from 'react';
  import { PaletteMode } from '@mui/material';
  
  export interface ThemeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
    setMode: (mode: PaletteMode) => void;
  }

  export interface ThemeProviderProps {
    children: React.ReactNode;
  }

  export const ThemeContext: React.Context<ThemeContextType>;
  
  export function useTheme(): ThemeContextType;
  
  export const ThemeProviderWrapper: React.FC<ThemeProviderProps>;
  
  export default ThemeProviderWrapper;
}
