import { Transaction as Asset } from '@/types/domains/assets/';
import { Income } from '@/types/domains/financial/';
import { PortfolioRecommendation } from '@/types/domains/analytics';

export const generateIncomeRecommendations = (
  _assets: Asset[],
  income: Income[],
): PortfolioRecommendation[] => {
  const recommendations: PortfolioRecommendation[] = [];

  // Only recommendations for salary, interest, side hustles, and other income
  // 1. Is salary present?
  const salaryIncome = income.filter(inc => inc.type === 'salary');
  if (salaryIncome.length === 0) {
    recommendations.push({
      id: 'add-salary-income',
      category: 'income',
      priority: 'high',
      titleKey: 'recommendations.income.addSalaryIncome.title',
      descriptionKey: 'recommendations.income.addSalaryIncome.description',
      actionCategory: 'income',
      actionSubCategory: 'sources',
      metadata: { currentSources: income.length }
    });
  }

  // 2. Is interest income present?
  const interestIncome = income.filter(inc => inc.type === 'interest');
  if (interestIncome.length === 0) {
    recommendations.push({
      id: 'add-interest-income',
      category: 'income',
      priority: 'medium',
      titleKey: 'recommendations.income.addInterestIncome.title',
      descriptionKey: 'recommendations.income.addInterestIncome.description',
      actionCategory: 'income',
      actionSubCategory: 'sources',
      metadata: { currentSources: income.length }
    });
  }

  // 3. Is side hustle income present?
  const sideHustleIncome = income.filter(inc => inc.type === 'side_hustle');
  if (sideHustleIncome.length === 0 && salaryIncome.length > 0) {
    recommendations.push({
      id: 'develop-side-hustle',
      category: 'income',
      priority: 'medium',
      titleKey: 'recommendations.income.developSideHustle.title',
      descriptionKey: 'recommendations.income.developSideHustle.description',
      actionCategory: 'income',
      actionSubCategory: 'sources',
      metadata: { currentSources: income.length }
    });
  }

  // 4. Is other income present?
  const otherIncome = income.filter(inc => inc.type === 'other');
  if (otherIncome.length === 0 && income.length > 0) {
    recommendations.push({
      id: 'add-other-income',
      category: 'income',
      priority: 'low',
      titleKey: 'recommendations.income.addOtherIncome.title',
      descriptionKey: 'recommendations.income.addOtherIncome.description',
      actionCategory: 'income',
      actionSubCategory: 'sources',
      metadata: { currentSources: income.length }
    });
  }

  // 5. Check for passive income
  const passiveIncome = income.filter(inc => inc.isPassive);
  if (passiveIncome.length === 0 && income.length > 0) {
    recommendations.push({
      id: 'add-passive-income',
      category: 'income',
      priority: 'medium',
      titleKey: 'recommendations.income.addPassiveIncome.title',
      descriptionKey: 'recommendations.income.addPassiveIncome.description',
      actionCategory: 'income',
      actionSubCategory: 'passive',
      metadata: { currentSources: income.length }
    });
  }

  // 6. Income source diversification
  if (income.length < 2) {
    recommendations.push({
      id: 'diversify-income-sources',
      category: 'income',
      priority: 'high',
      titleKey: 'recommendations.income.diversifyIncomeSources.title',
      descriptionKey: 'recommendations.income.diversifyIncomeSources.description',
      actionCategory: 'income',
      actionSubCategory: 'sources',
      metadata: { currentSources: income.length }
    });
  }

  // 7. Income timing optimization
  const irregularIncome = findIrregularIncome(income);
  if (irregularIncome.length > 0) {
    recommendations.push({
      id: 'optimize-income-timing',
      category: 'income',
      priority: 'low',
      titleKey: 'recommendations.income.optimizeIncomeTiming.title',
      descriptionKey: 'recommendations.income.optimizeIncomeTiming.description',
      actionCategory: 'income',
      actionSubCategory: 'scheduling',
      metadata: { count: irregularIncome.length }
    });
  }

  return recommendations;
};

// Helper function: Find income with irregular payment intervals
const findIrregularIncome = (income: Income[]): Income[] => {
  return income.filter(inc => {
    // Check for irregular frequency
    const freq = inc.paymentSchedule?.frequency;
    return freq === 'custom' || freq === 'none';
  });
};
