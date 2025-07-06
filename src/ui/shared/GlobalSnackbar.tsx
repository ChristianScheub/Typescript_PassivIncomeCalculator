import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, IconButton, Button } from '@mui/material';
import { X } from 'lucide-react';
import type { SnackbarCloseReason } from '@mui/material';
import { RootState } from '@/store';
import { hideSnackbar, removeSnackbar } from '@/store/slices/ui';

const GlobalSnackbar: React.FC = () => {
  const dispatch = useDispatch();
  const { messages, open } = useSelector((state: RootState) => state.snackbar);
  
  // Get the current message (first in queue)
  const currentMessage = messages[0];

  const handleClose = React.useCallback((_event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    dispatch(hideSnackbar());
    
    // Remove the current message after animation completes
    setTimeout(() => {
      if (currentMessage) {
        dispatch(removeSnackbar(currentMessage.id));
      }
    }, 300); // Material-UI transition duration
  }, [dispatch, currentMessage]);

  // Use a ref to always have the latest handleClose in useEffect
  const handleCloseRef = React.useRef(handleClose);
  handleCloseRef.current = handleClose;

  React.useEffect(() => {
    if (currentMessage?.autoHideDuration) {
      const timer = setTimeout(() => {
        handleCloseRef.current();
      }, currentMessage.autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [currentMessage]);

  const handleActionClick = () => {
    if (currentMessage?.action?.onClick) {
      currentMessage.action.onClick();
    }
    handleClose();
  };

  if (!currentMessage) {
    return null;
  }

  // Simple Snackbar for basic messages
  if (!currentMessage.severity) {
    return (
      <Snackbar
        open={open}
        message={currentMessage.message}
        onClose={handleClose}
        action={
          <>
            {currentMessage.action && (
              <Button color="secondary" size="small" onClick={handleActionClick}>
                {currentMessage.action.label}
              </Button>
            )}
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => handleClose()}
            >
              <X size={16} />
            </IconButton>
          </>
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      />
    );
  }

  // Alert Snackbar for severity-based messages
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Alert
        onClose={() => handleClose()}
        severity={currentMessage.severity}
        variant="filled"
        action={
          currentMessage.action && (
            <Button color="inherit" size="small" onClick={handleActionClick}>
              {currentMessage.action.label}
            </Button>
          )
        }
        sx={{ width: '100%' }}
      >
        {currentMessage.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
