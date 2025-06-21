import React from 'react';
import { Box } from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import FloatingBtn, { ButtonAlignment } from '../layout/floatingBtn';

interface FormSubmitButtonProps {
  onSubmit: (e?: React.FormEvent) => void;
  onCancel?: () => void;
  alignment?: ButtonAlignment;
  formRef?: React.RefObject<HTMLFormElement>;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  onSubmit,
  onCancel,
  alignment = ButtonAlignment.RIGHT,
  formRef
}) => {
  const handleSubmit = () => {
    // Try to submit the form using the form reference
    if (formRef?.current) {
      // Use requestSubmit if available (modern browsers)
      if ('requestSubmit' in formRef.current && typeof formRef.current.requestSubmit === 'function') {
        formRef.current.requestSubmit();
      } else {
        // Fallback for older browsers
        const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
        formRef.current.dispatchEvent(submitEvent);
      }
    } else {
      // Fallback to calling onSubmit directly
      onSubmit();
    }
  };

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
          onClick={handleSubmit}
        />
      </Box>
    );
  }

  return (
    <FloatingBtn
      icon={Save}
      onClick={handleSubmit}
      alignment={alignment}
    />
  );
};
