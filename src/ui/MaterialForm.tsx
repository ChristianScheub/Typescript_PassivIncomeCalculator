import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for better Material Design look
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  background: theme.palette.background.paper,
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontSize: '1.1rem',
}));

const RequiredFieldsSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const OptionalFieldsSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  paddingTop: theme.spacing(3),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  error?: string;
  value?: any;
  onChange?: (value: any) => void;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
}

export const MaterialFormField: React.FC<FormFieldProps> = ({
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
}) => {
  const theme = useTheme();

  const handleChange = (event: any) => {
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
          '& .MuiFormControlLabel-label': { 
            fontWeight: required ? 600 : 400,
            color: theme.palette.text.primary
          } 
        }}
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
      >
        <InputLabel id={`${name}-label`}>
          {label} {required && '*'}
        </InputLabel>
        <Select
          labelId={`${name}-label`}
          value={value || ''}
          onChange={handleChange}
          label={`${label} ${required ? '*' : ''}`}
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
      <Box>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1, 
            fontWeight: required ? 600 : 400,
            color: theme.palette.text.primary
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

  return (
    <StyledTextField
      fullWidth={fullWidth}
      label={`${label} ${required ? '*' : ''}`}
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
    />
  );
};

export interface MaterialFormProps {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  formRef?: React.RefObject<HTMLFormElement>;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({
  title,
  children,
  onSubmit,
  formRef
}) => {
  const theme = useTheme();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <StyledPaper elevation={2}>
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        noValidate 
        ref={formRef}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            mb: 3, 
            fontWeight: 700,
            color: theme.palette.text.primary
          }}
        >
          {title}
        </Typography>
        {children}
      </Box>
    </StyledPaper>
  );
};

export { 
  FormSection, 
  SectionTitle, 
  RequiredFieldsSection, 
  OptionalFieldsSection,
  StyledPaper
};
