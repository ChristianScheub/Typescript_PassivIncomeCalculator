// Optional API configuration for worker usage
export interface ApiConfig {
  apiKeys: Record<string, string | undefined>;
  selectedProvider: string;
}