import { createActivityManager } from '../managers/activityManager';
import { DEFAULT_CONFIG } from '../core/config';

// Shared activity manager instance to ensure consistent state
export const sharedActivityManager = createActivityManager(DEFAULT_CONFIG);
