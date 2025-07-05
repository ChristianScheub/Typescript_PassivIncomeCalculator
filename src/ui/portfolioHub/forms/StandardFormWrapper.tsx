import React from 'react';
import { MaterialForm } from './MaterialForm';
import { FormContainer } from './FormContainer';
import { FormSubmitButton } from './FormSubmitButton';
import { RequiredSection } from './sections/RequiredSection';
import { OptionalSection } from './sections/OptionalSection';
import { FormGrid, StandardFormField } from './FormGrid';
import { CustomScheduleSection } from './sections/CustomScheduleSection';

interface StandardFormWrapperProps {
  title: string;
  onSubmit: (e?: React.FormEvent) => void;
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
        <FormSubmitButton onSubmit={onSubmit} formRef={formRef} />
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
