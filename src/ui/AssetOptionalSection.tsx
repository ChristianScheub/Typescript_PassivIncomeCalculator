import React from 'react';
import { Box } from '@mui/material';
import { UseFormSetValue } from 'react-hook-form';
import { SectionTitle } from './MaterialForm';
import { FormGrid, StandardFormField } from './FormGrid';
import { useTranslation } from 'react-i18next';

interface AssetOptionalSectionProps {
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
}

export const AssetOptionalSection: React.FC<AssetOptionalSectionProps> = ({ 
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
          label={t('assets.form.purchaseDate')}
          name="purchaseDate"
          type="date"
          value={watch('purchaseDate')}
          onChange={(value) => setValue('purchaseDate', value || new Date().getFullYear() + '-01-01')}
        />
        
        <StandardFormField
          label={t('assets.form.country')}
          name="country"
          value={watch('country')}
          onChange={(value) => setValue('country', value)}
        />
        
        <StandardFormField
          label={t('assets.form.continent')}
          name="continent"
          value={watch('continent')}
          onChange={(value) => setValue('continent', value)}
        />
        
        <StandardFormField
          label={t('assets.form.sector')}
          name="sector"
          value={watch('sector')}
          onChange={(value) => setValue('sector', value)}
        />
        
        <StandardFormField
          label={t('common.notes')}
          name="notes"
          type="textarea"
          value={watch('notes')}
          onChange={(value) => setValue('notes', value)}
          rows={3}
          gridColumn="span 2"
        />
      </FormGrid>
    </Box>
  );
};
