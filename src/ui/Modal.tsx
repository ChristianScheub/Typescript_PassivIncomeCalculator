import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      style={{ margin: 0, padding: 0, top: 0, left: 0 }}
      onClick={onClose}
    >
      <div className="h-full w-full flex items-start justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto mt-8 mb-8"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
