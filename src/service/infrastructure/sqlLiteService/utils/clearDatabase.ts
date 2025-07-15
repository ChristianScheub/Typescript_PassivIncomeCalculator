/**
 * Development utility to clear the IndexedDB database
 * Use this if you encounter database schema conflicts during development
 */
export const clearDatabase = async (): Promise<void> => {
  const DB_NAME = 'finance-tracker';
  
  try {
    // Close any existing connections
    const request = indexedDB.deleteDatabase(DB_NAME);
    
    return new Promise((resolve, reject) => {
      request.onerror = () => {
        console.error('Error deleting database:', request.error);
        let error: Error;
        if (request.error instanceof Error) {
          error = request.error;
        } else {
          error = new Error(request.error ? String(request.error) : 'Failed to delete database');
        }
        reject(error);
      };
      
      request.onsuccess = () => {
        console.log('Database deleted successfully');
        resolve();
      };
      
      request.onblocked = () => {
        console.warn('Database deletion blocked - close all tabs and try again');
        reject(new Error('Database deletion blocked'));
      };
    });
  } catch (error) {
    console.error('Failed to delete database:', error);
    throw error;
  }
};

/**
 * Development utility - call this from browser console to reset database
 */
(window as { clearFinanceDatabase?: () => void }).clearFinanceDatabase = () => {
  clearDatabase().catch(console.error);
};
