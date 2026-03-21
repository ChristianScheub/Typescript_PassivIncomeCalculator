import React, { createContext, useContext, useState } from 'react';

interface FormModeContextValue {
  quickMode: boolean;
  setQuickMode: (v: boolean) => void;
}

const FormModeContext = createContext<FormModeContextValue>({
  quickMode: true,
  setQuickMode: () => {},
});

export const FormModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quickMode, setQuickMode] = useState(true);

  return (
    <FormModeContext.Provider value={{ quickMode, setQuickMode }}>
      {children}
    </FormModeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFormMode = () => useContext(FormModeContext);
