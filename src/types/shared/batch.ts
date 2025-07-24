// Globale Typdefinition für Batch-Operationen
export type BatchResult<T> = {
  success: boolean;
  updatedDefinition?: T;
  symbol?: string;
  error?: string;
};
