import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { Zap, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MaterialForm } from './MaterialForm';
import { FormContainer } from './FormContainer';
import { FormSubmitButton } from './FormSubmitButton';
import { RequiredSection } from './sections/RequiredSection';
import { OptionalSection } from './sections/OptionalSection';
import { FormGrid, StandardFormField } from './FormGrid';
import { CustomScheduleSection } from './sections/CustomScheduleSection';
import { FormModeProvider, useFormMode } from './FormModeContext';

interface StandardFormWrapperProps {
  title: string;
  onSubmit: (e?: React.FormEvent) => void;
  backgroundColor?: string;
  children: React.ReactNode;
  formRef?: React.RefObject<HTMLFormElement>;
}

const FormModeToggle: React.FC = () => {
  const { quickMode, setQuickMode } = useFormMode();
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
      <ToggleButtonGroup
        value={quickMode ? 'quick' : 'detail'}
        exclusive
        onChange={(_, val) => { if (val !== null) setQuickMode(val === 'quick'); }}
        size="small"
        sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.5, fontSize: '0.75rem', textTransform: 'none', gap: 0.5 } }}
      >
        <Tooltip title={t('form.quickModeHint')}>
          <ToggleButton value="quick" aria-label={t('form.quickMode')}>
            <Zap size={14} />
            {t('form.quickMode')}
          </ToggleButton>
        </Tooltip>
        <Tooltip title={t('form.detailModeHint')}>
          <ToggleButton value="detail" aria-label={t('form.detailMode')}>
            <SlidersHorizontal size={14} />
            {t('form.detailMode')}
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
};

export const StandardFormWrapper: React.FC<StandardFormWrapperProps> = ({
  title,
  onSubmit,
  backgroundColor,
  children,
  formRef
}) => {
  return (
    <FormModeProvider>
      <FormContainer backgroundColor={backgroundColor}>
        <MaterialForm
          title={title}
          onSubmit={onSubmit}
          formRef={formRef}
        >
          <FormModeToggle />
          {children}
          <FormSubmitButton onSubmit={onSubmit} formRef={formRef} />
        </MaterialForm>
      </FormContainer>
    </FormModeProvider>
  );
};

// Export all form components for easy access
export {
  FormContainer,
  FormGrid,
  StandardFormField,
  RequiredSection,
  OptionalSection,
  CustomScheduleSection,
  FormSubmitButton
};
// eslint-disable-next-line react-refresh/only-export-components
export { useFormMode } from './FormModeContext';
