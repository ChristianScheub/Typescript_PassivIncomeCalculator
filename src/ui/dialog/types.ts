export interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}
