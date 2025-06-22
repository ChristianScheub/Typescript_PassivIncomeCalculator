# Portfolio History Service

A specialized IndexedDB service for managing intraday and portfolio history data, separate from the main finance tracker database.

## Overview

This service provides persistent storage for:
- **Intraday Price Entries**: Individual asset price data points throughout the day
- **Portfolio Intraday Data**: Aggregated portfolio value points throughout the day  
- **Portfolio History**: Daily portfolio snapshots with detailed position information

## Architecture

The service follows the same clean architecture pattern as the main `sqlLiteService`:

```
sqlLitePortfolioHistory/
├── interfaces/
│   └── IPortfolioHistoryService.ts    # Type definitions and service interface
├── methods/
│   ├── initDatabase.ts                # Database initialization and schema
│   ├── dbOperations.ts                # Basic CRUD operations
│   ├── specializedOperations.ts       # Domain-specific queries
│   └── importExportOperations.ts      # Data backup/restore
├── utils/
│   └── debugUtils.ts                  # Development utilities
└── index.ts                           # Main service export
```

## Database Schema

### Stores

1. **intradayEntries**: Raw intraday price data
   - Key: `{assetDefinitionId}-{date}`
   - Indexes: `by-asset`, `by-date`, `by-asset-date`

2. **portfolioIntradayData**: Aggregated portfolio intraday points
   - Key: `date`
   - Indexes: `by-date`, `by-timestamp`

3. **portfolioHistory**: Daily portfolio snapshots
   - Key: `date`  
   - Indexes: `by-date`, `by-value`

## Usage

### Basic Operations

```typescript
import portfolioHistoryService from '@/service/infrastructure/sqlLitePortfolioHistory';

// Add intraday price entry
await portfolioHistoryService.add('intradayEntries', {
  id: 'AAPL-2024-01-01',
  assetDefinitionId: 'asset-123',
  date: '2024-01-01',
  price: 150.25,
  timestamp: Date.now()
});

// Get all entries for an asset
const entries = await portfolioHistoryService.getIntradayEntriesByAsset('asset-123');

// Get portfolio data for date range
const portfolioData = await portfolioHistoryService.getPortfolioIntradayByDateRange(
  '2024-01-01', 
  '2024-01-31'
);
```

### Bulk Operations

```typescript
// Bulk add for better performance
await portfolioHistoryService.bulkAddIntradayEntries([
  { id: '1', assetDefinitionId: 'asset-1', date: '2024-01-01', price: 100, timestamp: Date.now() },
  { id: '2', assetDefinitionId: 'asset-2', date: '2024-01-01', price: 200, timestamp: Date.now() }
]);
```

### Data Management

```typescript
// Get database size information
const stats = await portfolioHistoryService.getDataSizeInfo();
console.log(`Total entries: ${stats.totalEntries}, Date range: ${stats.oldestDate} - ${stats.newestDate}`);

// Clear old data (older than 30 days)
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
await portfolioHistoryService.clearOldData(thirtyDaysAgo);
```

### Import/Export

```typescript
// Export all data
const exportedData = await portfolioHistoryService.exportData();
localStorage.setItem('portfolio-backup', exportedData);

// Import data
const backupData = localStorage.getItem('portfolio-backup');
if (backupData) {
  await portfolioHistoryService.importData(backupData);
}
```

## Integration with Redux

The service is designed to work with Redux slices for state management:

1. **Load data**: Redux thunks fetch data from IndexedDB on app initialization
2. **Cache in Redux**: Data is kept in Redux state for fast access during user session  
3. **Persist changes**: Redux middleware automatically saves changes back to IndexedDB
4. **No localStorage**: Large datasets bypass localStorage entirely to avoid size limits

## Performance Considerations

- **Separate Database**: Uses its own IndexedDB (`portfolio-history`) to avoid conflicts
- **Bulk Operations**: Optimized methods for adding multiple entries at once
- **Date-based Queries**: Efficient filtering by date ranges using indexes
- **Memory Management**: Data can be cleared periodically to manage storage size

## Development Utilities

In development mode, debug utilities are available on `window.portfolioHistoryDebug`:

```javascript
// In browser console
portfolioHistoryDebug.getStats()           // Get database statistics
portfolioHistoryDebug.testOperations()     // Run basic operation tests
portfolioHistoryDebug.clearAllData()       // Clear all data (⚠️ destructive)
```

## Error Handling

All methods include proper error handling and logging. Failed operations will:
- Log detailed error messages to console
- Return empty arrays/objects for query operations
- Throw errors for critical operations (add/update/delete)

## Migration from localStorage

This service replaces localStorage persistence for large intraday/portfolio datasets:

1. **Before**: All data stored in Redux + localStorage (size limits, slow performance)
2. **After**: Metadata in localStorage + full data in IndexedDB (unlimited size, fast performance)

The Redux state still contains the data during the session, but persistence is handled by IndexedDB instead of localStorage.
