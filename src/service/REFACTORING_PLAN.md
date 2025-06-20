# Calculator Service Refactoring - Function Mapping

## Original calculatorService Functions vs New Services

### Asset Calculations (→ assetCalculatorService)
- ✅ calculateAssetMonthlyIncome
- ✅ calculateAssetIncomeForMonth  
- ✅ calculateTotalAssetValue
- ✅ calculateLiquidAssetValue
- ✅ calculateTotalMonthlyAssetIncome
- ✅ calculateTotalAssetIncomeForMonth
- ✅ calculateAnnualAssetIncome
- ❓ calculateAssetMonthlyIncomeWithCache
- ❓ calculateTotalAssetIncomeForMonthWithCache
- ❓ areAssetsCached

### Income Calculations (→ incomeCalculatorService)  
- ✅ calculateMonthlyIncome
- ✅ calculateTotalMonthlyIncome
- ✅ calculatePassiveIncome
- ✅ calculatePassiveIncomeRatio
- ✅ calculateAnnualIncome
- ✅ calculatePaymentSchedule
- ✅ calculateDividendSchedule
- ✅ calculateDividendForMonth

### Liability Calculations (→ liabilityCalculatorService)
- ✅ calculateTotalDebt
- ✅ calculateTotalMonthlyLiabilityPayments
- ✅ calculateLiabilityMonthlyPayment

### Expense Calculations (→ expenseCalculatorService)
- ✅ calculateMonthlyExpense
- ✅ calculateTotalMonthlyExpenses
- ✅ calculateAnnualExpenses

### Financial Analysis (→ financialCalculatorService)
- ✅ calculateMonthlyCashFlow
- ✅ calculateNetWorth

### Portfolio/Analytics (→ financialAnalyticsService)
- ❓ calculateAssetAllocation
- ❓ calculateIncomeAllocation  
- ❓ calculateExpenseBreakdown
- ❓ calculateProjections
- ❓ calculateProjectionsWithCache
- ❓ calculatePortfolioAnalytics
- ❓ calculateIncomeAnalytics

## Migration Strategy

**Phase 1: Complete missing functions**
1. Add missing cache functions to assetCalculatorService
2. Add missing analytics functions to financialAnalyticsService  
3. Add allocation functions to appropriate services

**Phase 2: Verify all functions work correctly**
1. Test each new service individually
2. Ensure type compatibility

**Phase 3: Create unified service interface (optional)**
1. Create composite service that combines all individual services
2. Maintain same interface as original calculatorService

**Phase 4: Update all imports**
1. Replace calculatorService imports with new services
2. Update function calls

**Phase 5: Remove old calculatorService**
1. Delete old service files
2. Clean up unused imports
