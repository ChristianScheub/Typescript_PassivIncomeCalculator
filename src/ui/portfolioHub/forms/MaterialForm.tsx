import React from 'react';
import {
  Box,
  Typography,
  Paper,
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

export interface MaterialFormProps {
  title: string;
  children: React.ReactNode;
  onSubmit: (e?: React.FormEvent) => void;
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
