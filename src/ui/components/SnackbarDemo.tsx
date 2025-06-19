import React from 'react';
import { Button, Stack, Typography, Paper } from '@mui/material';
import { useSnackbar } from '../../hooks/useSnackbar';

const SnackbarDemo: React.FC = () => {
  const snackbar = useSnackbar();

  const handleSuccessClick = () => {
    snackbar.showSuccess('Operation completed successfully!');
  };

  const handleErrorClick = () => {
    snackbar.showError('Something went wrong!');
  };

  const handleWarningClick = () => {
    snackbar.showWarning('Please check your input!');
  };

  const handleInfoClick = () => {
    snackbar.showInfo('Here is some information for you.');
  };

  const handleCustomClick = () => {
    snackbar.show({
      message: 'This is a custom message with longer duration',
      severity: 'info',
      autoHideDuration: 8000,
    });
  };

  const handleActionClick = () => {
    snackbar.showWithAction(
      'Do you want to undo this action?',
      'UNDO',
      () => {
        snackbar.showSuccess('Action undone!');
      },
      'warning',
      10000
    );
  };

  const handleAsyncOperation = async () => {
    snackbar.showInfo('Starting async operation...');
    
    try {
      // Simuliere eine async Operation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve('success');
          } else {
            reject(new Error('Random error'));
          }
        }, 2000);
      });
      
      snackbar.showSuccess('Async operation completed!');
    } catch (error) {
      snackbar.showError('Async operation failed!');
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Snackbar Demo
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Test verschiedene Snackbar-Varianten:
      </Typography>

      <Stack spacing={2} direction="column" sx={{ maxWidth: 300 }}>
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleSuccessClick}
        >
          Success Message
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleErrorClick}
        >
          Error Message
        </Button>
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={handleWarningClick}
        >
          Warning Message
        </Button>
        
        <Button 
          variant="contained" 
          color="info" 
          onClick={handleInfoClick}
        >
          Info Message
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handleCustomClick}
        >
          Custom Duration Message
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handleActionClick}
        >
          Message with Action
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handleAsyncOperation}
        >
          Test Async Operation
        </Button>
        
        <Button 
          variant="text" 
          color="secondary"
          onClick={() => snackbar.clearAll()}
        >
          Clear All Messages
        </Button>
      </Stack>
    </Paper>
  );
};

export default SnackbarDemo;
