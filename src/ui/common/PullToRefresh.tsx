import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  className?: string;
  pullThreshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  isRefreshing,
  className,
  pullThreshold = 80,
}) => {
  const { t } = useTranslation();
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    await onRefresh();
    setPullDistance(0);
    setIsPulling(false);
  }, [onRefresh]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const isContainerAtTop = containerRef.current && containerRef.current.scrollTop === 0;
    const isWindowAtTop = window.scrollY <= 10;
    if (isContainerAtTop && isWindowAtTop) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling || isRefreshing) return;
    if (pullDistance >= pullThreshold) {
      handleRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isPulling, isRefreshing, pullDistance, pullThreshold, handleRefresh]);

  const getRefreshStatus = () => {
    if (isRefreshing) return t('dashboard.refreshing');
    if (pullDistance >= pullThreshold) return t('dashboard.releaseToRefresh');
    if (isPulling && pullDistance > 0) return t('dashboard.pullToRefresh');
    return '';
  };

  const getRefreshOpacity = () => {
    if (isRefreshing) return 1;
    return Math.min(pullDistance / pullThreshold, 1);
  };

  const getRefreshTransform = () => {
    const scale = Math.min(pullDistance / pullThreshold, 1);
    return `translateY(${pullDistance * 0.5}px) scale(${0.7 + scale * 0.3})`;
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing || !containerRef.current) return;
    const isContainerAtTop = containerRef.current.scrollTop === 0;
    const isWindowAtTop = window.scrollY <= 10;
    if (!isContainerAtTop || !isWindowAtTop) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, pullThreshold * 1.5));
    }
  }, [isPulling, isRefreshing, startY, pullThreshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleTouchMoveNative = (e: TouchEvent) => {
      handleTouchMove(e);
    };
    container.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    return () => {
      container.removeEventListener('touchmove', handleTouchMoveNative);
    };
  }, [handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-auto h-full",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isPulling || isRefreshing ? `translateY(${Math.min(pullDistance * 0.3, 40)}px)` : 'none',
        transition: isPulling || isRefreshing ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Refresh Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex flex-col items-center justify-center",
          "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700",
          "transition-all duration-300 ease-out z-10",
          isPulling || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: `${Math.max(pullDistance * 0.8, isRefreshing ? 60 : 0)}px`,
          transform: getRefreshTransform(),
          opacity: getRefreshOpacity()
        }}
      >
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          {isRefreshing ? (
            <LoadingSpinner size={20} />
          ) : (
            <RefreshCw 
              className={cn(
                "transition-transform duration-200",
                pullDistance >= pullThreshold ? "rotate-180" : ""
              )} 
              size={20} 
            />
          )}
          <span className="text-sm font-medium">
            {getRefreshStatus()}
          </span>
        </div>
      </div>
      {/* Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          isPulling || isRefreshing ? "pt-2" : ""
        )}
      >
        {children}
      </div>
      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col items-center space-y-3">
            <LoadingSpinner size={32} />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {t('dashboard.refreshing')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
