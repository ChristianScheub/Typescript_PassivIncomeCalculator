import React from 'react';
import { Box } from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import FloatingBtn, { ButtonAlignment } from './floatingBtn';

interface FormSubmitButtonProps {
  onSubmit: () => void;
  onCancel?: () => void;
  alignment?: ButtonAlignment;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  onSubmit,
  onCancel,
  alignment = ButtonAlignment.RIGHT
}) => {
  if (onCancel) {
    return (
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1.5, sm: 2 }, 
        position: 'fixed', 
        bottom: { xs: '16px', sm: '20px' }, 
        right: { xs: '16px', sm: '20px' }, 
        zIndex: 1100 
      }}>
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Close}
          onClick={onCancel}
          backgroundColor="#f44336"
          hoverBackgroundColor="#d32f2f"
        />
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Save}
          onClick={onSubmit}
        />
      </Box>
    );
  }

  return (
    <FloatingBtn
      icon={Save}
      onClick={onSubmit}
      alignment={alignment}
    />
  );
};
