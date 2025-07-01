# Service Layer Architecture

This directory contains all business logic and infrastructure services organized using **Domain-Driven Design** principles with a **Clean Architecture** approach.

## Architecture Overview

```
src/service/
├── domain/                          # Domain Services (Business Logic)
│   ├── assets/                      # Asset Management Domain
│   ├── financial/                   # Financial Operations Domain  
│   ├── portfolio/                   # Portfolio Management Domain
│   ├── analytics/                   # Analytics & Reporting Domain
│   └── ai/                          # AI & Machine Learning Domain
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

### 🤖 AI Domain (`domain/ai/`)
Artificial Intelligence and Machine Learning services.

**Structure:**
```
ai/
├── llm/
│   └── llmService/                  # Generic LLM service for WebLLM integration
└── insights/
    └── financialInsightsService/    # Financial AI insights & recommendations
```

**Key Responsibilities:**
- LLM model loading and inference
- Financial data analysis using AI
- AI-powered insights generation
- Natural language financial recommendations

## Application Services

### 🔄 Workflows (`application/workflows/`)
Complex business processes that coordinate multiple domains.

- **deleteDataService**: Orchestrates data deletion across all domains

### 🎯 Orchestration (`application/orchestration/`)
Service coordination and cache management.

- **cacheRefreshService**: Manages cache refresh across all domains

### � Portfolio History (`application/portfolioHistoryCalculation/`)
Portfolio history calculation and persistence workflows.

- **PortfolioHistoryCalculationService**: Portfolio time series calculations and IndexedDB persistence

### �🔔 Notifications (`application/notifications/`)
Cross-domain notifications and alerts.

- **alertsService**: Handles notifications across all business domains

## Infrastructure Services

### 💾 Persistence (`infrastructure/persistence/`)
Data storage and infrastructure services.

- **sqlLiteService**: Primary database operations (IndexedDB: `finance-tracker`)
- **sqlLitePortfolioHistory**: Portfolio history database (IndexedDB: `portfolio-history`)
- **cacheService**: In-memory caching and cache management

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
| `types/domains/ai/` | `service/domain/ai/` | AI & machine learning |

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

// Portfolio history calculations
import { PortfolioHistoryCalculationService } from '@/service/application/portfolioHistoryCalculation';
```

### AI Services
```typescript
// Use AI services for insights and recommendations
import { llmService, financialInsightsService } from '@/service';
import { getModelConfig } from '@/config/aiModelConfig';

// Initialize LLM model (loaded on-demand in settings)
const modelConfig = getModelConfig();
await llmService.loadModel(modelConfig);

// Generate financial insights from Redux state
const insights = await financialInsightsService.generateInsightsFromReduxState({
  reduxState: store.getState(),
  requestType: 'general'
});
```

### Infrastructure Services
```typescript
// Database services
import sqlLiteService from '@/service/infrastructure/sqlLiteService';
import portfolioHistoryService from '@/service/infrastructure/sqlLitePortfolioHistory';

// Essential data persistence (finance-tracker DB)
const assets = await sqlLiteService.getAll('assets');

// Portfolio history (portfolio-history DB)  
const history = await portfolioHistoryService.getPortfolioHistoryByDateRange(start, end);
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

## Data Flow Architecture

This application implements a **hybrid data flow architecture** that strategically combines **Redux** and **IndexedDB** based on technical requirements and data characteristics.

### 📊 **Data Flow Patterns**

#### **1. 🟢 Redux Pattern (Primary System)**
Used for the majority of application state and entities.

```typescript
// Standard Redux usage in containers
const { items: expenses } = useAppSelector(state => state.expenses);
const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);

// Redux in orchestration services
const state = store.getState();
const { items: assets } = state.transactions;
```

**Used for:**
- ✅ All CRUD entities (Assets, Income, Expenses, Liabilities)
- ✅ Application state (Dashboard Settings, Snackbar)
- ✅ Calculated data cache (Financial Summary, Asset Focus Data)
- ✅ UI state management and reactivity

#### **2. 🟡 IndexedDB Pattern (Specialized System)**
Used for large datasets that exceed localStorage limitations.

```typescript
// Portfolio history through specialized hooks
const portfolioHistoryData = usePortfolioHistoryView('1M');
const intradayData = usePortfolioIntradayView();

// Direct service access for bulk operations
await portfolioHistoryService.getPortfolioHistoryByDateRange(start, end);
```

**Used for:**
- ✅ Portfolio history data (large time series)
- ✅ Intraday trading data (frequent updates)
- ✅ Historical calculations (daily snapshots)

#### **3. 🟢 Service Pattern (Pure Business Logic)**
Framework-agnostic services for domain calculations.

```typescript
// Pure domain logic - no external dependencies
export function calculatePortfolio(assets, definitions, categories) {
  const positions = calculatePortfolioPositions(...);
  return { positions, totals };
}
```

**Used for:**
- ✅ Domain calculations and business rules
- ✅ Data transformations and validations
- ✅ Utilities without side effects

### 🎯 **Technical Rationale**

#### **Why Redux for Standard Data?**
- **Small datasets**: Typically < 1MB per entity type
- **Frequent access**: UI needs reactive updates
- **Cross-component state**: Global state management
- **Caching**: In-memory performance optimization

#### **Why IndexedDB for Portfolio History?**
- **Large datasets**: Portfolio history can exceed 10MB over time
- **localStorage limits**: ~5-10MB quota restrictions
- **Asynchronous access**: Non-blocking for large queries
- **Complex data types**: Better than JSON serialization
- **Offline persistence**: Independent of Redux lifecycle

### 🗄️ **Database Strategy**

#### **IndexedDB: `finance-tracker`**
Primary database for essential user data persistence.

```typescript
// Database structure
finance-tracker/
├── assets                   # Asset transactions
├── assetDefinitions        # Asset metadata
├── assetCategories         # Category system
├── income                  # Income records
├── expenses               # Expense records
├── liabilities            # Debt & liability records
└── exchangeRates          # Currency data
```

**Purpose:**
- 🔒 **Data safety**: Survives app updates and cache clears
- 💾 **Offline capability**: Full functionality without network
- 📱 **Cross-session**: Data persists across browser sessions
- 🔄 **Import/Export**: Backup and restore functionality

#### **IndexedDB: `portfolio-history`**
Specialized database for portfolio time series data.

```typescript
// Historical data structure  
portfolio-history/
├── portfolioHistory        # Daily snapshots
└── portfolioIntradayData   # Intraday data points
```

**Purpose:**
- 📈 **Time series storage**: Optimized for historical data
- ⚡ **Performance**: Large dataset queries
- 🕒 **Temporal queries**: Date range filtering

### 🏗️ **Architecture Benefits**

#### **1. Technical Optimization**
- **Redux**: Fast synchronous access for UI state
- **IndexedDB**: Efficient async operations for large data
- **Service Layer**: Framework-independent business logic

#### **2. Scalability**
- **Storage limits**: IndexedDB handles unlimited data growth
- **Performance**: Each pattern optimized for its use case
- **Maintainability**: Clear separation of concerns

#### **3. Reliability**
- **Data persistence**: Multiple persistence strategies
- **Fault tolerance**: Redux fallbacks for IndexedDB failures
- **Update safety**: Essential data survives app updates

### 🔄 **Integration Pattern**

Containers orchestrate multiple data sources seamlessly:

```typescript
const AssetDashboardContainer = () => {
  // Redux for standard entities
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  
  // IndexedDB for large historical data
  const portfolioHistory = usePortfolioHistoryView('1M');
  
  // Services for calculations
  const analytics = analyticsService.calculateRatios(summary);
  
  // Unified presentation to view layer
  return <AssetDashboardView {...combinedData} />;
};
```

This hybrid approach provides the **best of both worlds**: Redux reactivity for UI state and IndexedDB scalability for large datasets, while maintaining clean service layer boundaries.

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

- **Advanced Analytics**: Real-time performance tracking and AI-powered insights
- **Multi-Currency Support**: Enhanced exchange rate management and currency analytics
- **Real-time Features**: WebSocket integration for live market data
- **Collaboration Features**: Multi-user portfolio sharing and family financial planning
- **Advanced Reporting**: PDF generation and detailed financial reports
- **API Integration**: External service integrations (banking APIs, tax software)
- **Mobile Optimization**: Enhanced mobile-specific features and PWA capabilities
- **Microservices**: Easy transition to microservices architecture if needed

---

## Service Pattern: Functional Object Wrapper (Hybrid Functional/OOP)

### What pattern is used?

This codebase uses a **Functional Object Wrapper** pattern for almost all services. Each service is defined as a plain object that implements a TypeScript interface, where each property is a pure function or a reference to a function. This is sometimes called the "functional service object" or "hybrid functional/OOP" pattern.

**Example:**
```typescript
const incomeCalculatorService: IIncomeCalculatorService = {
  calculateMonthlyIncome,
  calculateTotalMonthlyIncome,
  calculatePassiveIncome,
  // ...
};
```

### How does it work?
- Each service is a singleton object, not a class instance.
- All logic is implemented as stateless, pure functions (no `this` context).
- Services are imported and used directly, e.g. `import { incomeCalculatorService } from ...`.
- For simple services, this pattern is extremely lightweight and easy to maintain.

### Why do we use this pattern?
- **Simplicity:** No boilerplate, no constructors, no `this` context.
- **Consistency:** All services follow the same structure, making the codebase easy to navigate.
- **Testability:** Pure functions are easy to test in isolation.
- **Performance:** No class instantiation overhead, no hidden state.
- **Tree-shaking:** Unused service methods can be removed by bundlers.

### When is this pattern sufficient?
- For stateless, functional business logic (calculations, formatting, etc.)
- When you do not need runtime configuration, dependency injection, or service state
- When you want maximum code clarity and minimal complexity

### When should you consider OOP/DI instead?
- If you need to inject dependencies (e.g. for testing, logging, or configuration)
- If your service needs to manage internal state or lifecycle
- If you have complex cross-service dependencies

**In this project, almost all services use the functional object pattern. Only a few infrastructure or provider classes (e.g. Logger, API clients) use classic OOP.**

---
