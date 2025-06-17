import React, { useState, useRef, useCallback } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  disabled?: boolean;
  swipeThreshold?: number;
  actionWidth?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onEdit,
  onDelete,
  className,
  disabled = false,
  swipeThreshold = 80,
  actionWidth = 160
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || disabled) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Wischen nach links (positives diff) um Aktionen zu zeigen
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, actionWidth));
    }
    // Wischen nach rechts (negatives diff) um Aktionen zu verstecken, wenn sie sichtbar sind
    else if (isActionsVisible && diff < 0) {
      const rightSwipeDistance = Math.abs(diff);
      const newOffset = Math.max(0, swipeOffset - rightSwipeDistance);
      setSwipeOffset(newOffset);
    }
  }, [disabled, actionWidth, isActionsVisible, swipeOffset]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || disabled) return;
    
    isDragging.current = false;
    
    // Entscheiden ob Aktionen angezeigt oder versteckt werden sollen
    if (swipeOffset > swipeThreshold) {
      setSwipeOffset(actionWidth);
      setIsActionsVisible(true);
    } else {
      setSwipeOffset(0);
      setIsActionsVisible(false);
    }
  }, [disabled, swipeOffset, swipeThreshold, actionWidth]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    isDragging.current = true;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      currentX.current = e.clientX;
      const diff = startX.current - currentX.current;
      
      // Wischen nach links (positives diff) um Aktionen zu zeigen
      if (diff > 0) {
        setSwipeOffset(Math.min(diff, actionWidth));
      }
      // Wischen nach rechts (negatives diff) um Aktionen zu verstecken, wenn sie sichtbar sind
      else if (isActionsVisible && diff < 0) {
        const rightSwipeDistance = Math.abs(diff);
        const newOffset = Math.max(0, swipeOffset - rightSwipeDistance);
        setSwipeOffset(newOffset);
      }
    };
    
    const handleMouseUp = () => {
      if (!isDragging.current) return;
      
      isDragging.current = false;
      
      // Entscheiden ob Aktionen angezeigt oder versteckt werden sollen
      if (swipeOffset > swipeThreshold) {
        setSwipeOffset(actionWidth);
        setIsActionsVisible(true);
      } else {
        setSwipeOffset(0);
        setIsActionsVisible(false);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, swipeOffset, swipeThreshold, actionWidth, isActionsVisible]);

  const handleActionClick = useCallback((action: () => void) => {
    action();
    setSwipeOffset(0);
    setIsActionsVisible(false);
  }, []);

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0);
    setIsActionsVisible(false);
  }, []);

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Main content */}
      <div
        ref={cardRef}
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(-${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={isActionsVisible ? resetSwipe : undefined}
      >
        {children}
      </div>

      {/* Action buttons */}
      <div 
        className="absolute right-0 top-0 h-full flex items-center"
        style={{
          transform: `translateX(${actionWidth - swipeOffset}px)`,
          width: `${actionWidth}px`,
        }}
      >
        {onEdit && (
          <button
            onClick={() => handleActionClick(onEdit)}
            className="h-full flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white flex items-center justify-center transition-colors duration-150"
            aria-label="Bearbeiten"
          >
            <Edit size={20} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => handleActionClick(onDelete)}
            className="h-full flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white flex items-center justify-center transition-colors duration-150"
            aria-label="Löschen"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
