/**
 * Integration Beispiel: Neue Domain-Types in React Component
 */

import React, { useEffect, useState } from 'react';
// Neue Domain-Types verwenden
import { AssetPosition, PerformanceMetrics } from '../../types/domains/portfolio/';
import { SectorAllocation } from '../../types/domains/assets/';
import { assetAnalyticsService } from '../../service/assetAnalyticsService';
// Legacy Redux State (noch alte Types)
import { useAppSelector } from '../../hooks/redux';

export const NewAssetAnalyticsComponent: React.FC = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [sectorAllocation, setSectorAllocation] = useState<SectorAllocation[]>([]);
  
  // Legacy Redux State verwenden (schrittweise Migration)
  const assets = useAppSelector(state => state.transactions.items);
  const assetDefinitions = useAppSelector(state => state.assetDefinitions.items);
  const portfolioCache = useAppSelector(state => state.transactions.portfolioCache);
  
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Neue Service-Methoden mit Domain-Types
        const metrics = await assetAnalyticsService.analyzeAssetPerformance(
          assets,     // Legacy Type von Redux
          assetDefinitions  // Legacy Type von Redux
        );
        setPerformanceMetrics(metrics);
        
        // Sector Allocation berechnen
        if (portfolioCache?.positions) {
          const sectors = assetAnalyticsService.calculateSectorAllocation(
            portfolioCache.positions,  // Legacy Type
            assetDefinitions          // Legacy Type
          );
          setSectorAllocation(sectors);
        }
      } catch (error) {
        console.error('Analytics loading failed:', error);
      }
    };
    
    loadAnalytics();
  }, [assets, assetDefinitions, portfolioCache]);
  
  return (
    <div className="asset-analytics">
      <h2>Asset Analytics (Neue Domain-Types)</h2>
      
      <div className="performance-section">
        <h3>Performance Metrics</h3>
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <p>Total Return: {metric.totalReturn.toFixed(2)}€</p>
            <p>Return %: {metric.totalReturnPercentage.toFixed(2)}%</p>
            <p>Annualized Return: {metric.annualizedReturn.toFixed(2)}%</p>
          </div>
        ))}
      </div>
      
      <div className="sector-allocation-section">
        <h3>Sector Allocation</h3>
        {sectorAllocation.map((sector, index) => (
          <div key={index} className="sector-item">
            <span>{sector.sectorName}: {sector.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewAssetAnalyticsComponent;
