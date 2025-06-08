import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SectionTitle, RequiredFieldsSection } from './MaterialForm';

interface RequiredSectionProps {
  children: React.ReactNode;
}

export const RequiredSection: React.FC<RequiredSectionProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <RequiredFieldsSection>
      <SectionTitle sx={{ 
        fontSize: { xs: '1rem', sm: '1.1rem' }, 
        mb: { xs: 2, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '&::before': {
          content: '"*"',
          color: 'error.main',
          fontWeight: 'bold',
          fontSize: '1.2em'
        }
      }}>
        {t('common.requiredFields')}
      </SectionTitle>
      
      {children}
    </RequiredFieldsSection>
  );
};
