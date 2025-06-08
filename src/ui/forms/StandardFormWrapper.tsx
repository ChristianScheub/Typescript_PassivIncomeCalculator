import React from 'react';
import { MaterialForm } from './MaterialForm';
import { FormContainer } from './FormContainer';
import { FormSubmitButton } from './FormSubmitButton';
import { RequiredSection } from './RequiredSection';
import { OptionalSection } from './OptionalSection';
import { FormGrid, StandardFormField } from './FormGrid';
import { CustomScheduleSection } from '../specialized/CustomScheduleSection';

interface StandardFormWrapperProps {
  title: string;
  onSubmit: () => void;
  backgroundColor?: string;
  children: React.ReactNode;
  formRef?: React.RefObject<HTMLFormElement>;
}

export const StandardFormWrapper: React.FC<StandardFormWrapperProps> = ({
  title,
  onSubmit,
  backgroundColor,
  children,
  formRef
}) => {
  return (
    <FormContainer backgroundColor={backgroundColor}>
      <MaterialForm 
        title={title}
        onSubmit={onSubmit}
        formRef={formRef}
      >
        {children}
        <FormSubmitButton onSubmit={onSubmit} />
      </MaterialForm>
    </FormContainer>
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
