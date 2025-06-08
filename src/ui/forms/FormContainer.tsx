import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface FormContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  sx?: SxProps<Theme>;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  backgroundColor = 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(156, 39, 176, 0.03) 100%)',
  sx = {}
}) => {
  return (
    <Box 
      sx={{ 
        pb: { xs: 12, sm: 10 },
        pt: { xs: 3, sm: 4 },
        px: { xs: 1, sm: 2 },
        minHeight: '100vh',
        background: backgroundColor,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};
