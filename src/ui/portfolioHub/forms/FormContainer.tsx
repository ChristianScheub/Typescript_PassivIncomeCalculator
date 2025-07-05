import React from 'react';
import { Box, SxProps, Theme, useTheme } from '@mui/material';

interface FormContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  sx?: SxProps<Theme>;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  backgroundColor,
  sx = {}
}) => {
  const theme = useTheme();
  
  // Create dynamic background based on theme mode
  const dynamicBackground = backgroundColor || (
    theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)' // blue-500 to violet-500 with 5% opacity
      : 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(156, 39, 176, 0.03) 100%)' // blue-600 to violet-600 with 3% opacity
  );

  return (
    <Box 
      sx={{ 
        pb: { xs: 12, sm: 10 },
        pt: { xs: 3, sm: 4 },
        px: { xs: 1, sm: 2 },
        minHeight: '100vh',
        background: dynamicBackground,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};
