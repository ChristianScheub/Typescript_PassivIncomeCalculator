import React from 'react';
import { WizardProgress } from '@/types/domains/setupWizard';

interface StepIndicatorProps {
  progress: WizardProgress;
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ progress, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.completionPercentage}%` }}
        ></div>
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {progress.stepsConfig.map((stepConfig, index) => {
          const isActive = index === progress.currentStepIndex;
          const isCompleted = index < progress.currentStepIndex;
          
          return (
            <div key={stepConfig.step} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-200
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
                    : 'bg-gray-300 text-gray-600'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-2 text-center">
                <div 
                  className={`
                    text-xs font-medium
                    ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}
                >
                  {stepConfig.title}
                </div>
                {stepConfig.isOptional && (
                  <div className="text-xs text-gray-400 mt-1">Optional</div>
                )}
              </div>
              
              {/* Connector Line */}
              {index < progress.stepsConfig.length - 1 && (
                <div 
                  className={`
                    absolute top-4 left-1/2 w-full h-0.5 -z-10
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                  style={{ 
                    transform: 'translateX(50%)',
                    width: `${100 / progress.stepsConfig.length}%`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress Text */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Step {progress.currentStepIndex + 1} of {progress.totalSteps}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {progress.completionPercentage}% Complete
        </p>
      </div>
    </div>
  );
};

export default StepIndicator;