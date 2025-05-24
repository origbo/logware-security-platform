/**
 * This file provides module declarations for MUI components to fix ESM resolution issues
 */

// Material-UI component declarations
declare module '@mui/material/styles' {
  export * from '@mui/material';
}

declare module '@mui/material/*' {
  export * from '@mui/material';
}

declare module '@mui/system/RtlProvider' {
  import { FC, ReactNode } from 'react';
  interface RtlProviderProps {
    children: ReactNode;
    rtl?: boolean;
  }
  const RtlProvider: FC<RtlProviderProps>;
  export default RtlProvider;
}

declare module '@mui/system/createStyled' {
  export * from '@mui/system';
}

declare module '@mui/material/utils' {
  export * from '@mui/material';
}

// Data Grid declarations
declare module '@mui/x-data-grid/esm/*' {
  export * from '@mui/x-data-grid';
}

// Date pickers declarations
declare module '@mui/x-date-pickers/*' {
  export * from '@mui/x-date-pickers';
}

declare module 'date-fns/*' {
  export * from 'date-fns';
}
