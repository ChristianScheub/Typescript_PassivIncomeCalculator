import React from 'react';
import { Box } from '@mui/material';
import { UseFormSetValue } from 'react-hook-form';
import { SectionTitle } from './MaterialForm';
import { FormGrid, StandardFormField } from './FormGrid';
import { useTranslation } from 'react-i18next';

interface ExpenseOptionalSectionProps {
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
}

export const ExpenseOptionalSection: React.FC<ExpenseOptionalSectionProps> = ({ 
  watch, 
  setValue 
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      mb: { xs: 3, sm: 4 },
      p: { xs: 2, sm: 3 },
      borderRadius: 2,
      backgroundColor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <SectionTitle sx={{ 
        fontSize: { xs: '1rem', sm: '1.1rem' }, 
        mb: { xs: 2, sm: 3 },
        color: 'primary.main',
        fontWeight: 600
      }}>
        {t('common.optionalFields')}
      </SectionTitle>
      
      <FormGrid>
        <StandardFormField
          label={t('common.endDate')}
          name="endDate"
          type="date"
          value={watch('endDate')}
          onChange={(value) => setValue('endDate', value)}
        />

        <StandardFormField
          label={t('common.notes')}
          name="notes"
          type="textarea"
          value={watch('notes')}
          onChange={(value) => setValue('notes', value)}
          rows={3}
          placeholder={t('common.enterNotes')}
          gridColumn="span 2"
        />
      </FormGrid>
    </Box>
  );
};
