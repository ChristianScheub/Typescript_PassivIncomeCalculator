import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { PriceHistoryEntry, Asset, Transaction } from '@/types/domains/assets/';
import formatService from '@service/infrastructure/formatService';
import { calculateHistoricalPortfolioValues } from '../../utils/priceHistoryUtils';

interface PriceChartProps {
  priceHistory: PriceHistoryEntry[];
  transactions?: Array<Asset | Transaction>;  // Optional transactions for portfolio value calculation
  ticker?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  priceHistory,
  transactions,
  ticker
}) => {
  // If transactions are provided, calculate historical portfolio values
  const displayHistory = transactions 
    ? calculateHistoricalPortfolioValues(transactions, priceHistory)
    : priceHistory;
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if less than 2 entries
  if (!priceHistory || priceHistory.length < 2) {
    return null;
  }

  // Sort by date (oldest first for chart)
  const sortedHistory = [...displayHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate min and max prices for scaling with padding
  const prices = sortedHistory.map(entry => entry.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Add 5% padding to top and bottom for better visualization
  const paddedMin = minPrice - (priceRange * 0.05);
  const paddedMax = maxPrice + (priceRange * 0.05);
  const paddedRange = paddedMax - paddedMin;
  
  // Calculate percentage change from first to last
  const firstPrice = sortedHistory[0].price;
  const lastPrice = sortedHistory[sortedHistory.length - 1].price;
  const totalChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = totalChange >= 0;

  // Create smooth SVG path for the price line
  const createPath = () => {
    const width = 600;
    const height = 250;
    const padding = 50;
    
    const points = sortedHistory.map((entry, index) => {
      const x = padding + (index / (sortedHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((entry.price - paddedMin) / (paddedRange || 1)) * (height - 2 * padding);
      return { x, y };
    });

    if (points.length < 2) return '';

    // Create smooth curve using cubic bezier curves
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      if (i === 1) {
        // First segment - simple line
        path += ` L ${curr.x},${curr.y}`;
      } else {
        // Smooth curve using control points
        const prevPrev = points[i - 2];
        const next = i < points.length - 1 ? points[i + 1] : curr;
        
        // Calculate smooth control points
        const cp1x = prev.x + (curr.x - prevPrev.x) * 0.2;
        const cp1y = prev.y + (curr.y - prevPrev.y) * 0.2;
        const cp2x = curr.x - (next.x - prev.x) * 0.2;
        const cp2y = curr.y - (next.y - prev.y) * 0.2;
        
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
      }
    }

    return path;
  };

  // Create SVG path for area fill
  const createAreaPath = () => {
    const width = 600;
    const height = 250;
    const padding = 50;
    
    const points = sortedHistory.map((entry, index) => {
      const x = padding + (index / (sortedHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((entry.price - paddedMin) / (paddedRange || 1)) * (height - 2 * padding);
      return { x, y };
    });

    if (points.length < 2) return '';

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height - padding;

    // Start from bottom-left
    let path = `M ${firstX},${bottomY}`;
    
    // Draw to first point
    path += ` L ${points[0].x},${points[0].y}`;
    
    // Follow the same smooth curve as the line
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      if (i === 1) {
        path += ` L ${curr.x},${curr.y}`;
      } else {
        const prevPrev = points[i - 2];
        const next = i < points.length - 1 ? points[i + 1] : curr;
        
        const cp1x = prev.x + (curr.x - prevPrev.x) * 0.2;
        const cp1y = prev.y + (curr.y - prevPrev.y) * 0.2;
        const cp2x = curr.x - (next.x - prev.x) * 0.2;
        const cp2y = curr.y - (next.y - prev.y) * 0.2;
        
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
      }
    }
    
    // Close path to bottom
    path += ` L ${lastX},${bottomY} Z`;

    return path;
  };

  // Generate Y-axis price levels (like in professional charts)
  const generatePriceLevels = () => {
    const levels = 5;
    const levelStep = paddedRange / (levels - 1);
    return Array.from({ length: levels }, (_, i) => paddedMin + (i * levelStep));
  };

  const priceLevels = generatePriceLevels();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('assets.priceChart.title')}
              {ticker && (
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({ticker})
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {sortedHistory.length} {t('assets.priceHistory.entries')}
              </span>
              <span className={`font-medium ${
                isPositive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {isPositive ? '+' : ''}{totalChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isExpanded ? t('common.collapse') : t('common.expand')}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </button>

      {/* Chart Content - Collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            {/* Current Price and Change */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatService.formatCurrency(lastPrice)}
                </div>
                <div className={`text-sm font-medium ${
                  isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{formatService.formatCurrency(lastPrice - firstPrice)} ({totalChange.toFixed(2)}%)
                </div>
              </div>
              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                <div>{new Date(sortedHistory[0].date).toLocaleDateString()}</div>
                <div>to {new Date(sortedHistory[sortedHistory.length - 1].date).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Professional SVG Chart */}
            <div className="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <svg 
                width="600" 
                height="250" 
                viewBox="0 0 600 250"
                className="w-full h-auto"
                style={{ minWidth: '600px' }}
              >
                {/* Grid and axis styling */}
                <defs>
                  {/* Grid pattern */}
                  <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
                    <path 
                      d="M 50 0 L 0 0 0 40" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="0.5"
                      className="text-gray-200 dark:text-gray-700"
                      opacity="0.5"
                    />
                  </pattern>
                  
                  {/* Gradients for area fill */}
                  <linearGradient id="gradient-positive" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05"/>
                  </linearGradient>
                  <linearGradient id="gradient-negative" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>

                {/* Background */}
                <rect width="100%" height="100%" fill="currentColor" className="text-white dark:text-gray-800" />
                
                {/* Grid */}
                <rect x="50" y="0" width="500" height="200" fill="url(#grid)" />

                {/* Y-axis price levels */}
                {priceLevels.map((price, index) => {
                  const y = 200 - (index * 40);
                  return (
                    <g key={`price-level-${price.toFixed(2)}`}>
                      <line
                        x1="50"
                        y1={y}
                        x2="550"
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-gray-300 dark:text-gray-600"
                        opacity="0.6"
                      />
                      <text
                        x="45"
                        y={y}
                        fontSize="12"
                        textAnchor="end"
                        alignmentBaseline="middle"
                        className="text-gray-400 dark:text-gray-500"
                      >
                        {formatService.formatCurrency(price)}
                      </text>
                    </g>
                  );
                })}

                {/* Area fill using gradient */}
                <path
                  d={createAreaPath()}
                  fill={isPositive ? "url(#gradient-positive)" : "url(#gradient-negative)"}
                  opacity="0.6"
                />

                {/* Price line */}
                <path
                  d={createPath()}
                  fill="none"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {sortedHistory.map((entry) => {
                  const x = 50 + (sortedHistory.indexOf(entry) / (sortedHistory.length - 1)) * 500;
                  const y = 200 - ((entry.price - paddedMin) / (paddedRange || 1)) * 150;
                  
                  return (
                    <g key={`point-${entry.date}-${entry.price}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        fill={isPositive ? "#10b981" : "#ef4444"}
                        stroke="white"
                        strokeWidth="2"
                        className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      />
                      {/* Tooltip on hover would go here */}
                    </g>
                  );
                })}

                {/* X-axis labels */}
                <g>
                  {/* First date */}
                  <text
                    x="50"
                    y="240"
                    fontSize="12"
                    textAnchor="start"
                    className="text-gray-400 dark:text-gray-500"
                  >
                    {new Date(sortedHistory[0].date).toLocaleDateString()}
                  </text>
                  
                  {/* Last date */}
                  <text
                    x="550"
                    y="240"
                    fontSize="12"
                    textAnchor="end"
                    className="text-gray-400 dark:text-gray-500"
                  >
                    {new Date(sortedHistory[sortedHistory.length - 1].date).toLocaleDateString()}
                  </text>
                  
                  {/* Middle date if enough data points */}
                  {sortedHistory.length > 10 && (
                    <text
                      x="300"
                      y="240"
                      fontSize="12"
                      textAnchor="middle"
                      className="text-gray-400 dark:text-gray-500"
                    >
                      {new Date(sortedHistory[Math.floor(sortedHistory.length / 2)].date).toLocaleDateString()}
                    </text>
                  )}
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
