import React from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { AISettingsSection } from '@/ui/settings/AISettingsSection';
import { setAIEnabled } from '@/store/slices/configSlice';

/**
 * AI Settings Container
 * Connects AI settings component to Redux store
 */
export const AISettingsContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const aiConfig = useAppSelector(state => state.config.apis.ai);

  const handleAIToggle = (enabled: boolean) => {
    dispatch(setAIEnabled(enabled));
    
    // Optional: Show snackbar notification
    // dispatch(showSnackbar({
    //   message: enabled ? 'AI Assistant aktiviert' : 'AI Assistant deaktiviert',
    //   severity: 'success'
    // }));
  };

  return (
    <AISettingsSection
      isAIEnabled={aiConfig.enabled}
      onAIToggle={handleAIToggle}
    />
  );
};
