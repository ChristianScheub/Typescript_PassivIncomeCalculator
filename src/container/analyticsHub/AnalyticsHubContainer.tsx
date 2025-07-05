import React, { useState, useEffect } from 'react';
import Logger from '@/service/shared/logging/Logger/logger';
import recentActivityService from '@/service/domain/analytics/reporting/recentActivityService';
import { AnalyticsCategory, AnalyticsSubCategory } from '@/types/domains/analytics/reporting';
import DistributionsAnalyticsContainer from './distribution/DistributionsAnalyticsContainer';
import PerformanceAnalyticsContainer from './PerformanceAnalyticsContainer';
import AnalyticsHubView from '@/view/analytics-hub/AnalyticsHubView';
import AIAnalyticsContainer from './ai/AIAnalyticsContainer';
import type { AIAnalyticsCategory } from '@/types/domains/analytics/ai';
import ForecastContainer from './forecast/ForecastContainer';
import MilestonesContainer from './forecast/MilestonesContainer';
import AssetCalendarContainer from './AssetCalendarContainer';

// Re-export types for external use
export type { AnalyticsCategory, AnalyticsSubCategory };

interface AnalyticsHubContainerProps {
  onBack?: () => void;
}

const AnalyticsHubContainer: React.FC<AnalyticsHubContainerProps> = ({ onBack }) => {
  
  // Default subcategories for each main category
  const defaultSubCategories: Record<AnalyticsCategory, AnalyticsSubCategory> = {
    overview: 'dashboard',
    forecasting: 'cashflow',
    milestones: 'fire',
    distributions: 'distributions',
    performance: 'portfolioPerformance',
    custom: 'calendar'
  };
  
  // Analytics navigation state
  const [selectedCategory, setSelectedCategory] = useState<AnalyticsCategory>('overview');
  const [selectedSubCategory, setSelectedSubCategory] = useState<AnalyticsSubCategory>('dashboard');
  const [aiCategory, setAICategory] = useState<AIAnalyticsCategory | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ category: AnalyticsCategory; subCategory: AnalyticsSubCategory }>>([]);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  // Also scroll to top when subcategory changes (for container switching)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSubCategory]);

  // Navigation handlers
  const handleCategoryChange = (category: AnalyticsCategory, subCategory?: AnalyticsSubCategory) => {
    const subCategoryText = subCategory ? `, subcategory ${subCategory}` : '';
    Logger.info(`Analytics Hub: Navigating to category ${category}${subCategoryText}`);
    
    // Add current position to history
    setNavigationHistory(prev => [...prev, { category: selectedCategory, subCategory: selectedSubCategory }]);
    
    setSelectedCategory(category);
    
    if (subCategory) {
      setSelectedSubCategory(subCategory);
    } else {
      // Use default subcategory for main category
      setSelectedSubCategory(defaultSubCategories[category]);
    }

    // Reset AI category when changing analytics category
    setAICategory(null);

    // Track analytics history for specific subcategory navigation
    // Special case: For distributions without subcategory, track as overview
    if (category === 'distributions' && !subCategory) {
      // This is navigation to distributions overview - we don't track it as an activity
      // because it's not a specific analysis but the overview page
      Logger.info('Navigating to distributions overview - no activity tracking');
    } else if (subCategory) {
      // Add analytics activity for specific subcategory navigation
      recentActivityService.addAnalyticsActivity(category, subCategory);
    } else if (category !== 'overview') {
      // For other categories without specific subcategory, use default
      const finalSubCategory = defaultSubCategories[category];
      recentActivityService.addAnalyticsActivity(category, finalSubCategory);
    }
  };

  const handleAINavigation = (category: AIAnalyticsCategory) => {
    Logger.info(`Analytics Hub: Navigating to AI ${category}`);
    
    // Add current position to history
    setNavigationHistory(prev => [...prev, { category: selectedCategory, subCategory: selectedSubCategory }]);
    
    setAICategory(category);
  };

  const handleBackToHub = () => {
    Logger.info('Analytics Hub: Returning to hub overview');
    if (navigationHistory.length > 0) {
      const lastPosition = navigationHistory[navigationHistory.length - 1];
      setSelectedCategory(lastPosition.category);
      setSelectedSubCategory(lastPosition.subCategory);
      setNavigationHistory(prev => prev.slice(0, -1));
    } else {
      setSelectedCategory('overview');
      setSelectedSubCategory('dashboard');
    }
    
    // Reset AI category
    setAICategory(null);
    
    // Scroll to top when navigating back
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if we should render a specific analytics container
  const shouldRenderContainer = () => {
    // Show AI container if AI category is selected
    if (aiCategory) return true;
    // Only show hub view for overview/dashboard, all other combinations should render specific containers
    return !(selectedCategory === 'overview' && selectedSubCategory === 'dashboard');
  };

  // Render specific analytics containers
  const renderAnalyticsContainer = () => {
    // If AI category is selected, render AI container
    if (aiCategory) {
      Logger.info(`Analytics Hub: Rendering AI container for ${aiCategory}`);
      return <AIAnalyticsContainer category={aiCategory} onBack={handleBackToHub} />;
    }

    Logger.info(`Analytics Hub: Rendering container for ${selectedCategory} - ${selectedSubCategory}`);
    
    switch (selectedCategory) {
      case 'overview':
        switch (selectedSubCategory) {
          case 'dashboard':
            return null; // Will show hub view
          default:
            return null; // Will show hub view
        }
        
      case 'forecasting':
        // All forecasting subcategories go to ForecastContainer
        return <ForecastContainer onBack={handleBackToHub} />;
        
      case 'milestones':
        // All milestone subcategories go to MilestonesContainer  
        return <MilestonesContainer onBack={handleBackToHub} />;
        
      case 'distributions':
        // Use the new DistributionsAnalyticsContainer which shows overview and handles subcategories
        // Pass the actual subcategory for navigation from Recent Activities
        return <DistributionsAnalyticsContainer 
          initialSubCategory={selectedSubCategory} 
          onBack={handleBackToHub} 
        />;
      
      case 'performance':
        switch (selectedSubCategory) {
          case 'portfolioPerformance':
            return <PerformanceAnalyticsContainer selectedTab="portfolio" onBack={handleBackToHub} />;
          case 'returns':
            return <PerformanceAnalyticsContainer selectedTab="returns" onBack={handleBackToHub} />;
          case 'historical':
            return <PerformanceAnalyticsContainer selectedTab="historical" onBack={handleBackToHub} />;
          default:
            return <PerformanceAnalyticsContainer selectedTab="portfolio" onBack={handleBackToHub} />;
        }
        
      case 'custom':
        // Asset Calendar
        switch (selectedSubCategory) {
          case 'calendar':
            return <AssetCalendarContainer selectedTab="calendar" onBack={handleBackToHub} />;
          case 'history':
            return <AssetCalendarContainer selectedTab="history" onBack={handleBackToHub} />;
          case 'timeline':
            return <AssetCalendarContainer selectedTab="timeline" onBack={handleBackToHub} />;
          default:
            return <AssetCalendarContainer selectedTab="calendar" onBack={handleBackToHub} />;
        }
        
      default:
        // Return to overview
        setSelectedCategory('overview');
        setSelectedSubCategory('dashboard');
        return null;
    }
  };

  // Log analytics hub access
  useEffect(() => {
    Logger.info('Analytics Hub accessed - initializing analytics overview');
  }, []);

  // If we should render a specific container, do so
  if (shouldRenderContainer()) {
    return renderAnalyticsContainer();
  }

  // Otherwise render the main analytics hub view
  return (
    <AnalyticsHubView
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      onAINavigation={handleAINavigation}
      onBack={onBack}
    />
  );
};

export default AnalyticsHubContainer;
