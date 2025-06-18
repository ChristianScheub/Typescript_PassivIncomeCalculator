/**
 * Base entity interfaces for all domain entities
 */

export interface BaseEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Identifiable {
  id: string;
}

export interface Nameable {
  name: string;
}

export interface Describable {
  description?: string;
}

export interface Activatable {
  isActive: boolean;
}

export interface Sortable {
  sortOrder?: number;
}

export interface Auditable extends Timestamps {
  createdBy?: string;
  updatedBy?: string;
}
