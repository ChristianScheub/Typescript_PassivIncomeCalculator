import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { SharedFormField } from './SharedFormField';

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
        gridTemplateColumns: columns,
        gap,
        mb: 2,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

// Standard field styles for consistent form appearance
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
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  step?: number;
  min?: number;
  rows?: number;
  gridColumn?: string;
  disabled?: boolean;
  helperText?: string;
  sx?: any;
}

export const StandardFormField: React.FC<StandardFormFieldProps> = ({
  gridColumn,
  sx,
  ...props
}) => {
  const fieldSx = {
    ...standardFieldStyles,
    ...(gridColumn && { gridColumn }),
    ...sx
  };
  
  return (
    <SharedFormField
      {...props}
      sx={fieldSx}
    />
  );
};
