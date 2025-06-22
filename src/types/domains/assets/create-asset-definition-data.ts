import { AssetDefinition } from './entities';

/**
 * Type for creating new asset definitions, omits metadata fields like id, createdAt, updatedAt.
 * The name field is optional as it's derived from fullName in the adapter function.
 */
export type CreateAssetDefinitionData = Omit<AssetDefinition, 'id' | 'createdAt' | 'updatedAt' | 'name'> & { name?: string };
