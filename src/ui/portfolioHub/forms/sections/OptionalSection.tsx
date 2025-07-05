import React from 'react';
import { Box } from '@mui/material';
import { SectionTitle } from '../MaterialForm';

interface OptionalSectionProps {
  title: string;
  children: React.ReactNode;
}

export const OptionalSection: React.FC<OptionalSectionProps> = ({ 
  title, 
  children 
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <SectionTitle sx={{ 
        fontSize: { xs: '1rem', sm: '1.1rem' }, 
        mb: { xs: 2, sm: 3 },
        color: 'text.primary'
      }}>
        {title}
      </SectionTitle>
      
      {children}
    </Box>
  );
};
