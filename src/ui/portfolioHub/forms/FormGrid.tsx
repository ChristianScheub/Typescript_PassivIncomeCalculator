import React from 'react';
import { 
  Box, 
  SxProps, 
  Theme,
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Typography,
  styled,
  useTheme
} from '@mui/material';

interface FormGridProps {
  children?: React.ReactNode;
  columns?: { xs: string; sm: string };
  gap?: { xs: number; sm: number };
  sx?: SxProps<Theme>;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = { xs: '1fr', sm: 'repeat(2, 1fr)' },
  gap = { xs: 2.5, sm: 3 },
  sx = {}
}) => {
  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: columns.xs, sm: columns.sm },
        gap: { xs: gap.xs, sm: gap.sm },
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

// Styled TextField with Material-UI design
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

// Standard field styles for consistent form appearance
// eslint-disable-next-line react-refresh/only-export-components
export const standardFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    minHeight: { xs: 56, sm: 48 },
    fontSize: { xs: '1rem', sm: '0.875rem' }
  }
};

// Helper component for common form field patterns
interface StandardFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea';
  required?: boolean;
  error?: string;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  step?: number;
  min?: number;
  max?: number;
  rows?: number;
  gridColumn?: string;
  disabled?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  multiline?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
}

export const StandardFormField: React.FC<StandardFormFieldProps> = ({
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
  gridColumn,
  className,
  sx
}) => {
  const theme = useTheme();

  // Merge styles with grid column positioning
  const fieldSx = {
    ...standardFieldStyles,
    ...(gridColumn && { gridColumn }),
    ...sx
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(event.target.value) || 0 : event.target.value;
    onChange?.(newValue);
  };

  if (type === 'checkbox') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={value === true}
            onChange={(e) => onChange?.(e.target.checked)}
            name={name}
            color="primary"
            disabled={disabled}
          />
        }
        label={label}
        sx={{ 
          ...fieldSx,
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
          ...fieldSx,
          '& .MuiInputLabel-root': {
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
          value={value ?? ''}
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
      <Box className={className} sx={fieldSx}>
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
          value={value ?? ''}
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
          ...fieldSx,
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
        ...fieldSx,
        '& .MuiInputLabel-root': {
          lineHeight: 1.2,
        },
      }}
    />
  );
};
