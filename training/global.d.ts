// Global type declarations for the training module
declare module 'react' {
  export = React;
  export as namespace React;
}

declare module '@mui/material' {
  export const Box: any;
  export const Typography: any;
  export const Container: any;
  export const Tabs: any;
  export const Tab: any;
  export const Paper: any;
  export const ThemeProvider: any;
  export const CssBaseline: any;
  export default {
    Box, Typography, Container, Tabs, Tab, Paper, ThemeProvider, CssBaseline
  };
}

declare module '@mui/material/styles' {
  export const useTheme: () => any;
}
