/**
 * Identifier types and reference utilities
 */

// Reference types
export interface EntityReference<T = string> {
  id: T;
  name?: string;
}

export interface AssetReference extends EntityReference {
  ticker?: string;
  type?: string;
}

export interface CategoryReference extends EntityReference {
  level?: number;
  parentId?: string;
}

// Key generation utilities
export type KeyOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
