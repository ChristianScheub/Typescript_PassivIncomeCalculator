import { CacheRefreshService } from './interfaces/ICacheRefreshService';
import { refreshAllCaches } from './methods/refreshAllCaches';

// Create cacheRefreshService as a functional object
const cacheRefreshService: CacheRefreshService = {
    refreshAllCaches
};

// Export the service interface and implementation
export type { CacheRefreshService };
export { cacheRefreshService };

// Export default instance for direct use
export default cacheRefreshService;

// Export individual methods for direct use if needed
export {
    refreshAllCaches
};
