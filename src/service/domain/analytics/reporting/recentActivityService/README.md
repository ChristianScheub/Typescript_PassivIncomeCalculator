# Recent Activity Service

A comprehensive service for managing recent user activities across different sections of the Portfolio Hub application.

## Structure

```
recentActivityService/
├── index.ts                 # Main service entry point
├── types/                   # TypeScript interfaces and types
│   └── index.ts            
├── core/                    # Core functionality and factories
│   ├── config.ts           # Service configuration
│   └── activityFactory.ts  # Activity creation factory
├── managers/                # Data and storage management
│   ├── storageManager.ts   # LocalStorage operations
│   └── activityManager.ts  # CRUD operations for activities
├── resolvers/               # Resolution utilities
│   ├── titleResolver.ts    # i18n title resolution
│   └── iconResolver.ts     # Icon mapping resolution
└── utils/                   # Utility exports and re-exports
    └── index.ts            

```

## Features

- **Multi-Type Activities**: Analytics, Portfolio, and Transaction activities
- **Intelligent Storage**: Separate storage keys for different activity types
- **Deduplication**: Prevents duplicate analytics/portfolio activities
- **i18n Support**: Uses translation keys instead of translated strings
- **Configurable**: Environment-specific configurations
- **Type Safety**: Full TypeScript support

## Usage

```typescript
import recentActivityService from '@/service/recentActivityService';

// Add portfolio navigation activity
recentActivityService.addPortfolioActivity('assets', 'portfolio');

// Add analytics activity
recentActivityService.addAnalyticsActivity('distributions', 'assets');

// Add transaction activity
recentActivityService.addTransactionActivity(
  'asset', 
  'transactions.asset.purchase', 
  'transactions.asset.purchase.subtitle', 
  'asset-123', 
  150.50, 
  'USD'
);

// Get recent activities
const recentActivities = recentActivityService.getRecentActivities(5);

// Get activities by type
const analyticsHistory = recentActivityService.getActivitiesByType('analytics', 3);
```

## Activity Types

- **Analytics**: Navigation within analytics hub
- **Portfolio**: Navigation within portfolio hub  
- **Asset**: Asset-related transactions
- **Income**: Income-related activities
- **Expense**: Expense-related activities
- **Liability**: Liability-related activities
- **Transaction**: General transaction activities

## Configuration

The service supports environment-specific configurations:

- **Development**: 50 max entries, dev-prefixed storage keys
- **Production**: 10 max entries, standard storage keys
- **Test**: 5 max entries, test-prefixed storage keys
