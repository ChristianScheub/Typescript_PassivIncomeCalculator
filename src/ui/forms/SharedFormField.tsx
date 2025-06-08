import React from 'react';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Box,
  Typography,
  styled,
  useTheme,
  SxProps,
  Theme
} from '@mui/material';
import { FormFieldProps } from '../../types/form';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    '& fieldset': {
      borderColor: theme.palette.grey[300],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    // Ensure labels have enough space and are not cut off
    marginTop: theme.spacing(0.5),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    backgroundColor: 'transparent',
    '&.MuiInputLabel-shrunk': {
      marginTop: 0,
      paddingTop: 0,
      paddingBottom: 0,
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  },
}));

export type SharedFormFieldProps = FormFieldProps & {
  className?: string;
  sx?: SxProps<Theme>;
};

export const SharedFormField: React.FC<SharedFormFieldProps> = ({
  label,
  name,
  type = 'text',
  required = false,
  error,
  value,
  onChange,
  options = [],
  placeholder,
  min,
  max,
  step,
  rows = 3,
  helperText,
  disabled = false,
  fullWidth = true,
  multiline = false,
  className,
  sx
}) => {
  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(event.target.value) || 0 : event.target.value;
    onChange?.(newValue);
  };

  if (type === 'checkbox') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={Boolean(value)}
            onChange={(e) => onChange?.(e.target.checked)}
            name={name}
            color="primary"
            disabled={disabled}
          />
        }
        label={label}
        sx={{ 
          ...sx,
          '& .MuiFormControlLabel-label': { 
            fontWeight: required ? 600 : 400,
            color: theme.palette.text.primary
          } 
        }}
        className={className}
      />
    );
  }

  if (type === 'select') {
    return (
      <FormControl 
        fullWidth={fullWidth} 
        error={Boolean(error)}
        disabled={disabled}
        variant="outlined"
        className={className}
        sx={{
          ...sx,
          '& .MuiInputLabel-root': {
            // Ensure select labels have enough space and are not cut off
            marginTop: theme.spacing(0.5),
            paddingTop: theme.spacing(0.5),
            paddingBottom: theme.spacing(0.5),
            backgroundColor: 'transparent',
            '&.MuiInputLabel-shrunk': {
              marginTop: 0,
              paddingTop: 0,
              paddingBottom: 0,
              transform: 'translate(14px, -9px) scale(0.75)',
            },
          },
        }}
      >
        <InputLabel id={`${name}-label`} required={required}>
          {label}
        </InputLabel>
        <Select
          labelId={`${name}-label`}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          label={label}
          sx={{
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.grey[300],
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {(error || helperText) && (
          <FormHelperText>{error || helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  if (type === 'textarea') {
    return (
      <Box className={className} sx={sx}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1.5, 
            mt: 0.5,
            fontWeight: required ? 600 : 400,
            color: theme.palette.text.primary,
            lineHeight: 1.2
          }}
        >
          {label} {required && '*'}
        </Typography>
        <StyledTextField
          fullWidth={fullWidth}
          multiline
          rows={rows}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          error={Boolean(error)}
          helperText={error || helperText}
          disabled={disabled}
          variant="outlined"
        />
      </Box>
    );
  }

  // Special handling for date fields to fix placeholder issues
  if (type === 'date') {
    return (
      <StyledTextField
        fullWidth={fullWidth}
        label={label}
        required={required}
        type={type}
        value={value || ''}
        onChange={handleChange}
        error={Boolean(error)}
        helperText={error || helperText}
        disabled={disabled}
        variant="outlined"
        className={className}
        InputLabelProps={{
          shrink: true, // Always shrink label for date fields
        }}
        inputProps={{
          placeholder: '', // Remove HTML5 date placeholder to avoid conflicts
        }}
        sx={{
          ...sx,
          '& .MuiInputLabel-root': {
            lineHeight: 1.2,
          },
          '& input[type="date"]::-webkit-datetime-edit-text': {
            color: 'transparent',
          },
          '& input[type="date"]::-webkit-datetime-edit-month-field': {
            color: 'transparent',
          },
          '& input[type="date"]::-webkit-datetime-edit-day-field': {
            color: 'transparent',
          },
          '& input[type="date"]::-webkit-datetime-edit-year-field': {
            color: 'transparent',
          },
          '& input[type="date"]::-webkit-calendar-picker-indicator': {
            opacity: 1,
          },
          '& input[type="date"]:focus::-webkit-datetime-edit-text': {
            color: theme.palette.text.primary,
          },
          '& input[type="date"]:focus::-webkit-datetime-edit-month-field': {
            color: theme.palette.text.primary,
          },
          '& input[type="date"]:focus::-webkit-datetime-edit-day-field': {
            color: theme.palette.text.primary,
          },
          '& input[type="date"]:focus::-webkit-datetime-edit-year-field': {
            color: theme.palette.text.primary,
          },
          '& input[type="date"][value=""]::-webkit-datetime-edit-text': {
            color: 'transparent',
          },
          '& input[type="date"]:not([value=""])::-webkit-datetime-edit-text': {
            color: theme.palette.text.primary,
          },
          '& input[type="date"]:not([value=""])::-webkit-datetime-edit-month-field': {
            color: theme.palette.text.primary,
          },
          '& input[type="date"]:not([value=""])::-webkit-datetime-edit-day-field': {
            color: theme.palette.text.primary,
          },
          '& input[type="date"]:not([value=""])::-webkit-datetime-edit-year-field': {
            color: theme.palette.text.primary,
          },
        }}
      />
    );
  }

  return (
    <StyledTextField
      fullWidth={fullWidth}
      label={label}
      required={required}
      type={type}
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      error={Boolean(error)}
      helperText={error || helperText}
      inputProps={{
        min: type === 'number' ? min : undefined,
        max: type === 'number' ? max : undefined,
        step: type === 'number' ? step : undefined,
      }}
      disabled={disabled}
      variant="outlined"
      multiline={multiline}
      rows={multiline ? rows : undefined}
      className={className}
      sx={{
        ...sx,
        '& .MuiInputLabel-root': {
          // Additional label spacing for consistency
          lineHeight: 1.2,
        },
      }}
    />
  );
};
