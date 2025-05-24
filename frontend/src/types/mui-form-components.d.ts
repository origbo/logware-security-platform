/**
 * Type declarations for Material UI form components
 */

import * as React from 'react';

declare module '@mui/material/FormControlLabel' {
  export interface FormControlLabelProps {
    control: React.ReactElement;
    disabled?: boolean;
    label: React.ReactNode;
    labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
    value?: any;
    sx?: any;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  }

  const FormControlLabel: React.ComponentType<FormControlLabelProps>;
  export default FormControlLabel;
}

declare module '@mui/material' {
  export interface FormControlLabelProps {
    control: React.ReactElement;
    disabled?: boolean;
    label: React.ReactNode;
    labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
    value?: any;
    sx?: any;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  }
}
