/**
 * Type declarations for MUI DatePicker components
 */

declare module '@mui/x-date-pickers/DatePicker' {
  import * as React from 'react';

  export interface DatePickerProps<TDate = Date, TError = unknown> {
    label?: React.ReactNode;
    value?: TDate | null;
    defaultValue?: TDate | null;
    onChange?: (value: TDate | null, context: any) => void;
    minDate?: TDate;
    maxDate?: TDate;
    format?: string;
    disabled?: boolean;
    readOnly?: boolean;
    disableFuture?: boolean;
    disablePast?: boolean;
    views?: Array<'year' | 'month' | 'day'>;
    openTo?: 'year' | 'month' | 'day';
    inputRef?: React.Ref<HTMLInputElement>;
    renderInput?: (props: any) => React.ReactElement;
    InputProps?: any;
    InputAdornmentProps?: any;
    slotProps?: {
      textField?: {
        fullWidth?: boolean;
        variant?: 'standard' | 'outlined' | 'filled';
        size?: 'small' | 'medium';
        error?: boolean;
        helperText?: React.ReactNode;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  }

  const DatePicker: React.FC<DatePickerProps>;
  export default DatePicker;
}

declare module '@mui/x-date-pickers/TimePicker' {
  import * as React from 'react';
  
  export interface TimePickerProps<TDate = Date, TError = unknown> {
    label?: React.ReactNode;
    value?: TDate | null;
    defaultValue?: TDate | null;
    onChange?: (value: TDate | null, context: any) => void;
    disabled?: boolean;
    readOnly?: boolean;
    ampm?: boolean;
    format?: string;
    views?: Array<'hours' | 'minutes' | 'seconds'>;
    openTo?: 'hours' | 'minutes' | 'seconds';
    minTime?: TDate;
    maxTime?: TDate;
    inputRef?: React.Ref<HTMLInputElement>;
    renderInput?: (props: any) => React.ReactElement;
    InputProps?: any;
    InputAdornmentProps?: any;
    slotProps?: {
      textField?: {
        fullWidth?: boolean;
        variant?: 'standard' | 'outlined' | 'filled';
        size?: 'small' | 'medium';
        error?: boolean;
        helperText?: React.ReactNode;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  }

  const TimePicker: React.FC<TimePickerProps>;
  export default TimePicker;
}

declare module '@mui/x-date-pickers/DateTimePicker' {
  import * as React from 'react';
  
  export interface DateTimePickerProps<TDate = Date, TError = unknown> {
    label?: React.ReactNode;
    value?: TDate | null;
    defaultValue?: TDate | null;
    onChange?: (value: TDate | null, context: any) => void;
    disabled?: boolean;
    readOnly?: boolean;
    format?: string;
    ampm?: boolean;
    disableFuture?: boolean;
    disablePast?: boolean;
    minDateTime?: TDate;
    maxDateTime?: TDate;
    views?: Array<'year' | 'month' | 'day' | 'hours' | 'minutes' | 'seconds'>;
    openTo?: 'year' | 'month' | 'day' | 'hours' | 'minutes' | 'seconds';
    inputRef?: React.Ref<HTMLInputElement>;
    renderInput?: (props: any) => React.ReactElement;
    InputProps?: any;
    InputAdornmentProps?: any;
    slotProps?: {
      textField?: {
        fullWidth?: boolean;
        variant?: 'standard' | 'outlined' | 'filled';
        size?: 'small' | 'medium';
        error?: boolean;
        helperText?: React.ReactNode;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  }

  const DateTimePicker: React.FC<DateTimePickerProps>;
  export default DateTimePicker;
}
