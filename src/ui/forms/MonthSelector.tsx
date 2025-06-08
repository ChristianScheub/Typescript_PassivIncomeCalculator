import React from 'react';
import { Chip, Box, Typography } from '@mui/material';

interface MonthSelectorProps {
  selectedMonths: number[];
  onChange: (month: number, checked: boolean) => void;
  label: string;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonths,
  onChange,
  label,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
          const isChecked = selectedMonths?.includes(month) || false;
          
          return (
            <Chip
              key={month}
              label={new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
              clickable
              color={isChecked ? 'primary' : 'default'}
              variant={isChecked ? 'filled' : 'outlined'}
              onClick={() => onChange(month, !isChecked)}
            />
          );
        })}
      </Box>
    </Box>
  );
};
