import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const theme = useTheme();
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
      onClick={onClose}
    >
      <div className="h-full w-full flex items-start justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto mt-8 mb-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button in top-right corner */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(55, 65, 81, 0.9)' // dark:gray-700 with opacity
                : 'rgba(255, 255, 255, 0.9)',
              color: theme.palette.mode === 'dark'
                ? 'rgba(229, 231, 235, 0.8)' // dark:gray-200 with opacity
                : 'rgba(0, 0, 0, 0.7)',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(55, 65, 81, 1)' // dark:gray-700
                  : 'rgba(255, 255, 255, 1)',
                color: theme.palette.mode === 'dark'
                  ? 'rgba(229, 231, 235, 1)' // dark:gray-200
                  : 'rgba(0, 0, 0, 0.9)',
              },
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Close fontSize="small" />
          </IconButton>
          {children}
        </div>
      </div>
    </div>
  );
};
