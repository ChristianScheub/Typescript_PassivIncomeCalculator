import React from 'react';
import { Box, Typography, TextField, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CustomAmountsSectionProps {
  frequency: string;
  selectedMonths: number[];
  customAmounts: Record<number, number>;
  onAmountChange: (month: number, amount: number) => void;
  title?: string;
  currency?: string;
}

export const CustomAmountsSection: React.FC<CustomAmountsSectionProps> = ({
  frequency,
  selectedMonths,
  customAmounts,
  onAmountChange,
  title,
  currency = 'EUR'
}) => {
  const { t } = useTranslation();

  if (frequency !== 'custom' || selectedMonths.length === 0) {
    return null;
  }

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'long' });
  };

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
        {title || t('common.customAmounts')}
      </Typography>
      
      <Grid container spacing={2}>
        {selectedMonths.map(month => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={month}>
            <TextField
              fullWidth
              label={getMonthName(month)}
              type="number"
              value={customAmounts[month] || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onAmountChange(month, value);
              }}
              InputProps={{
                inputProps: { 
                  min: 0, 
                  step: 0.01 
                },
                endAdornment: currency
              }}
              placeholder="0.00"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
          </Grid>
        ))}
      </Grid>

      {selectedMonths.length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ 
            mb: 1, 
            color: 'text.secondary',
            fontSize: { xs: '0.875rem', sm: '0.75rem' }
          }}>
            {t('common.totalAnnualAmount')}:
          </Typography>
          <Typography variant="h6" color="primary">
            {Object.values(customAmounts).reduce((sum, amount) => sum + (amount || 0), 0).toFixed(2)} {currency}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
