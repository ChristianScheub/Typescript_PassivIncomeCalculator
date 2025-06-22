import { useDispatch } from 'react-redux';
import { 
  showSnackbar, 
  showSuccessSnackbar, 
  showErrorSnackbar, 
  showWarningSnackbar, 
  showInfoSnackbar,
  clearAllSnackbars 
} from '@/store/slices/snackbarSlice';
import type { SnackbarMessage } from '@/store/slices/snackbarSlice';

export const useSnackbar = () => {
  const dispatch = useDispatch();

  const show = (message: Omit<SnackbarMessage, 'id'>) => {
    dispatch(showSnackbar(message));
  };

  const showSuccess = (message: string, autoHideDuration?: number) => {
    if (autoHideDuration) {
      dispatch(showSnackbar({ 
        message, 
        severity: 'success', 
        autoHideDuration 
      }));
    } else {
      dispatch(showSuccessSnackbar(message));
    }
  };

  const showError = (message: string, autoHideDuration?: number) => {
    if (autoHideDuration) {
      dispatch(showSnackbar({ 
        message, 
        severity: 'error', 
        autoHideDuration 
      }));
    } else {
      dispatch(showErrorSnackbar(message));
    }
  };

  const showWarning = (message: string, autoHideDuration?: number) => {
    if (autoHideDuration) {
      dispatch(showSnackbar({ 
        message, 
        severity: 'warning', 
        autoHideDuration 
      }));
    } else {
      dispatch(showWarningSnackbar(message));
    }
  };

  const showInfo = (message: string, autoHideDuration?: number) => {
    if (autoHideDuration) {
      dispatch(showSnackbar({ 
        message, 
        severity: 'info', 
        autoHideDuration 
      }));
    } else {
      dispatch(showInfoSnackbar(message));
    }
  };

  const showWithAction = (
    message: string, 
    actionLabel: string, 
    actionCallback: () => void,
    severity?: 'success' | 'info' | 'warning' | 'error',
    autoHideDuration?: number
  ) => {
    dispatch(showSnackbar({
      message,
      severity: severity || 'info',
      autoHideDuration: autoHideDuration || 6000,
      action: {
        label: actionLabel,
        onClick: actionCallback
      }
    }));
  };

  const clearAll = () => {
    dispatch(clearAllSnackbars());
  };

  return {
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showWithAction,
    clearAll,
  };
};
