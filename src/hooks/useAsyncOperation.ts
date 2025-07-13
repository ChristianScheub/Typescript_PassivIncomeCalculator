import { useState, useCallback } from 'react';

export interface AsyncOperationState {
  loading: boolean;
  error: string | null;
}

export function useAsyncOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAsyncOperation = useCallback(async (operation: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await operation();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { executeAsyncOperation, loading, error };
}
