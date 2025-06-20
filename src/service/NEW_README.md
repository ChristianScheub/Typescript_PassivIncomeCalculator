# Service Layer Architecture

This directory contains all business logic and infrastructure services organized using **Domain-Driven Design** principles with a **Clean Architecture** approach.

## Architecture Overview

```
src/service/
├── domain/                          # Domain Services (Business Logic)
│   ├── assets/                      # Asset Management Domain
│   ├── financial/                   # Financial Operations Domain  
│   ├── portfolio/                   # Portfolio Management Domain
│   └── analytics/                   # Analytics & Reporting Domain
├── application/                     # Application Services (Use Cases)
│   ├── workflows/                   # Complex Business Processes
│   ├── orchestration/               # Service Coordination
│   └── notifications/               # Cross-Domain Notifications
├── infrastructure/                  # Infrastructure Services (Technical)
│   ├── persistence/                 # Data Storage & Caching
│   ├── formatting/                  # Data Transformation
│   └── configuration/               # System Configuration
└── shared/                          # Shared Services (Utilities)
    ├── utilities/                   # Common Utilities
    └── logging/                     # Logging & Debugging
```

## Domain Services

### 🏦 Assets Domain (`domain/assets/`)
Handles all asset-related calculations and market data operations.

**Structure:**
```
assets/
├── calculations/
│   └── assetCalculatorService/      # Asset value & income calculations
└── market-data/
    └── stockAPIService/             # Stock market data & API integration
```

**Key Responsibilities:**
- Asset value calculations
- Asset income calculations  
- Asset allocation analysis
- Stock market data retrieval
- Asset caching mechanisms

### 💰 Financial Domain (`domain/financial/`)
Core financial operations including income, expenses, liabilities, and calculations.

**Structure:**
```
financial/
├── income/
│   └── incomeCalculatorService/     # Income calculations & allocations
├── expenses/ 
│   └── expenseCalculatorService/    # Expense calculations & breakdowns
├── liabilities/
│   └── liabilityCalculatorService/  # Debt & liability calculations
├── calculations/
│   ├── financialCalculatorService/  # Overall financial calculations
│   └── compositeCalculatorService/  # Unified calculator interface
└── exchange/
    └── exchangeService/             # Currency exchange operations
```

**Key Responsibilities:**
- Income calculations & passive income analysis
- Expense tracking & categorization
- Liability & debt management
- Cash flow calculations
- Net worth calculations
- Currency exchange operations

### 📊 Portfolio Domain (`domain/portfolio/`)
Portfolio management and historical tracking.

**Structure:**
```
portfolio/
├── management/
│   └── portfolioService/            # Portfolio CRUD operations
└── history/
    └── portfolioHistoryService/     # Portfolio historical tracking
```

**Key Responsibilities:**
- Portfolio creation & management
- Position tracking
- Historical performance tracking
- Portfolio state management

### 📈 Analytics Domain (`domain/analytics/`)
Analytics, reporting, and business intelligence.

**Structure:**
```
analytics/
├── calculations/
│   └── financialAnalyticsService/   # Financial analytics & metrics
└── reporting/
    └── recentActivityService/       # Activity reporting & tracking
```

**Key Responsibilities:**
- Financial analytics & insights
- Performance metrics calculation
- Activity tracking & reporting
- Business intelligence reporting

## Application Services

### 🔄 Workflows (`application/workflows/`)
Complex business processes that coordinate multiple domains.

- **deleteDataService**: Orchestrates data deletion across all domains

### 🎯 Orchestration (`application/orchestration/`)
Service coordination and cache management.

- **cacheRefreshService**: Manages cache refresh across all domains

### 🔔 Notifications (`application/notifications/`)
Cross-domain notifications and alerts.

- **alertsService**: Handles notifications across all business domains

## Infrastructure Services

### 💾 Persistence (`infrastructure/persistence/`)
Data storage and caching infrastructure.

- **sqlLiteService**: Database operations
- **cacheService**: In-memory caching

### 🔧 Formatting (`infrastructure/formatting/`)
Data transformation and formatting.

- **formatService**: Data formatting utilities

### ⚙️ Configuration (`infrastructure/`)
System configuration management.

- **configService**: Application configuration

## Shared Services

### 🛠️ Utilities (`shared/utilities/`)
Common utilities used across all domains.

- **helper**: Common utility functions

### 📝 Logging (`shared/logging/`)
Logging and debugging infrastructure.

- **Logger**: Centralized logging service

## Domain Consistency

The service architecture **mirrors the type structure** (`src/types/domains/`) to ensure consistency:

| **Types Domain** | **Service Domain** | **Purpose** |
|------------------|-------------------|-------------|
| `types/domains/assets/` | `service/domain/assets/` | Asset management |
| `types/domains/financial/` | `service/domain/financial/` | Financial operations |
| `types/domains/portfolio/` | `service/domain/portfolio/` | Portfolio management |
| `types/domains/analytics/` | `service/domain/analytics/` | Analytics & reporting |

## Usage

### Main Calculator Service
```typescript
// Use the composite calculator service for all calculations
import { calculatorService } from '@/service';

// The composite service provides a unified interface to all domain calculators
const monthlyIncome = calculatorService.calculateTotalMonthlyIncome(incomeItems);
const expenseBreakdown = calculatorService.calculateExpenseBreakdown(expenses);
```

### Domain-Specific Services
```typescript
// Import specific domain services when needed
import { 
  assetCalculatorService,
  incomeCalculatorService,
  expenseCalculatorService 
} from '@/service/domain/financial';
```

### Application Services
```typescript
// Use application services for complex workflows
import { deleteDataService, cacheRefreshService } from '@/service/application';
```

## Design Principles

### 1. **Domain-Driven Design (DDD)**
- Services are organized by business domains
- Each domain has clear boundaries and responsibilities
- Domain models drive the service structure

### 2. **Clean Architecture**
- **Domain Layer**: Core business logic (no external dependencies)
- **Application Layer**: Use cases and workflows (coordinates domains)
- **Infrastructure Layer**: Technical details (databases, APIs, etc.)
- **Shared Layer**: Common utilities and cross-cutting concerns

### 3. **Single Responsibility Principle**
- Each service has one clear responsibility
- Services are focused and cohesive
- Separation of concerns is maintained

### 4. **Dependency Inversion**
- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Infrastructure depends on domain, not vice versa

## Migration Guide

The service layer has been refactored from a monolithic structure to a modular domain-based architecture:

### Before (Monolithic)
```typescript
import { calculatorService } from '@/service/calculatorService';
```

### After (Domain-based)
```typescript
// Same interface, now powered by modular architecture
import { calculatorService } from '@/service';
// OR use specific domain services
import { incomeCalculatorService } from '@/service/domain/financial';
```

### Benefits of the New Architecture

1. **🔍 Better Organization**: Services are logically grouped by business domain
2. **🚀 Improved Maintainability**: Easier to find and modify specific functionality
3. **🧩 Enhanced Modularity**: Clear separation of concerns and dependencies
4. **📈 Better Scalability**: New features can be added to appropriate domains
5. **🧪 Easier Testing**: Domain services can be tested independently
6. **👥 Team Collaboration**: Different teams can work on different domains
7. **🔄 Future Flexibility**: Architecture supports future expansion and changes

## Future Enhancements

The architecture is designed to support future enhancements:

- **Dashboard Domain**: Future dashboard-specific services
- **Forms Domain**: Form validation and processing services  
- **Database Domain**: Advanced database schema services
- **Real-time Features**: Event sourcing and CQRS patterns
- **Microservices**: Easy transition to microservices architecture
