import React from 'react';
import { OptionalSection } from './OptionalSection';
import { FormGrid, StandardFormField } from './FormGrid';
import { useTranslation } from 'react-i18next';

interface OptionalFieldsSectionProps {
  // Form state values
  endDateValue?: string;
  notesValue?: string;
  
  // Change handlers
  onEndDateChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  
  // Optional customization
  title?: string;
  showEndDate?: boolean;
  showNotes?: boolean;
}

/**
 * Reusable component for the standard optional fields section
 * that appears in most forms (endDate and notes).
 * 
 * This component provides a consistent UI and behavior across
 * all forms that need optional end date and notes fields.
 */
const OptionalFieldsSection: React.FC<OptionalFieldsSectionProps> = ({
  endDateValue,
  notesValue,
  onEndDateChange,
  onNotesChange,
  title,
  showEndDate = true,
  showNotes = true,
}) => {
  const { t } = useTranslation();
  
  // Don't render anything if both fields are disabled
  if (!showEndDate && !showNotes) {
    return null;
  }

  return (
    <OptionalSection title={title || t('common.optionalFields')}>
      <FormGrid>
        {showEndDate && (
          <StandardFormField
            label={t('common.endDate')}
            name="endDate"
            type="date"
            value={endDateValue}
            onChange={onEndDateChange}
          />
        )}
        
        {showNotes && (
          <StandardFormField
            label={t('common.notes')}
            name="notes"
            value={notesValue}
            onChange={onNotesChange}
            placeholder={t('common.notesPlaceholder')}
            gridColumn="1 / -1"
          />
        )}
      </FormGrid>
    </OptionalSection>
  );
};

export { OptionalFieldsSection };
export type { OptionalFieldsSectionProps };
