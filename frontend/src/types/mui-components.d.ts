/**
 * Type declarations for Material UI components to resolve type errors
 */

declare module '@mui/material/FormControlLabel' {
  import * as React from 'react';
  
  export interface FormControlLabelProps {
    control: React.ReactElement;
    disabled?: boolean;
    label: React.ReactNode;
    labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
    value?: any;
    sx?: any;
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  }
  
  const FormControlLabel: React.FC<FormControlLabelProps>;
  export default FormControlLabel;
}

// Type declarations for Modal component
declare module '@mui/material/Modal' {
  import * as React from 'react';
  
  export interface ModalProps {
    open: boolean;
    onClose?: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
    children?: React.ReactNode;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    sx?: any;
    className?: string;
  }
  
  const Modal: React.FC<ModalProps>;
  export default Modal;
}

// Type declarations for Box component
declare module '@mui/material/Box' {
  import * as React from 'react';
  
  export interface BoxProps {
    sx?: any;
    children?: React.ReactNode;
    className?: string;
  }
  
  const Box: React.FC<BoxProps>;
  export default Box;
}

// Fix for other MUI components with similar issues
declare module '@mui/material' {
  import * as React from 'react';
  
  // Ensure components can accept ReactNode in label props
  export interface ButtonProps {
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
  }
  
  export interface TabProps {
    label?: React.ReactNode;
    icon?: React.ReactNode;
  }
  
  export interface ChipProps {
    label?: React.ReactNode;
    avatar?: React.ReactNode;
    deleteIcon?: React.ReactNode;
    icon?: React.ReactNode;
  }
  
  export interface ListItemProps {
    children?: React.ReactNode;
  }
  
  export interface ListItemTextProps {
    primary?: React.ReactNode;
    secondary?: React.ReactNode;
  }
  
  export interface MenuItemProps {
    children?: React.ReactNode;
  }
  
  export interface FormLabelProps {
    children?: React.ReactNode;
  }
  
  export interface FormHelperTextProps {
    children?: React.ReactNode;
  }
  
  export interface InputLabelProps {
    children?: React.ReactNode;
  }
  
  export interface DialogTitleProps {
    children?: React.ReactNode;
  }
  
  export interface DialogContentTextProps {
    children?: React.ReactNode;
  }
  
  export interface TypographyProps {
    children?: React.ReactNode;
  }
}

// Fix for icons from @mui/icons-material
declare module '@mui/icons-material/*' {
  import * as React from 'react';
  
  const Icon: React.ComponentType<any>;
  export default Icon;
}
