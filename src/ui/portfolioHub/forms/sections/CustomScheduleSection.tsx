import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MonthSelector } from './MonthSelector';
import { PaymentFrequency } from '@/types/shared/';

interface CustomScheduleSectionProps {
  frequency: PaymentFrequency;
  selectedMonths: number[];
  onMonthChange: (month: number, checked: boolean) => void;
  title?: string;
}

export const CustomScheduleSection: React.FC<CustomScheduleSectionProps> = ({
  frequency,
  selectedMonths,
  onMonthChange,
  title
}) => {
  const { t } = useTranslation();

  if (frequency !== 'custom') {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          fontSize: { xs: '1rem', sm: '1.1rem' },
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        {title || t('common.customSchedule')}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <MonthSelector
          selectedMonths={selectedMonths}
          onChange={onMonthChange}
          label={t('common.selectMonths')}
        />
      </Box>

      {selectedMonths.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ 
            mb: 1, 
            color: 'text.secondary',
            fontSize: { xs: '0.875rem', sm: '0.75rem' }
          }}>
            {t('common.selectedMonths')}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedMonths.map(month => (
              <Chip
                key={month}
                label={t(`months.short.${month}`)}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  height: 24
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
