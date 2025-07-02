import React from 'react';
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/ui/common/Card";
import { ViewHeader } from "@/ui/layout/ViewHeader";
import { MotivationalEmptyState } from "@/ui/feedback/EnhancedEmptyState";
import { Modal } from "@/ui/common/Modal";
import { MaterialLiabilityForm } from "@/container/forms/MaterialLiabilityForm";
import FloatingBtn, { ButtonAlignment } from "@/ui/layout/floatingBtn";
import { SwipeableCard } from "@/ui/common/SwipeableCard";
import { Plus,Landmark } from "lucide-react";
import formatService from "@service/infrastructure/formatService";
import { Liability } from '@/types/domains/financial';
import { LoadingSpinner } from '@/ui/feedback/LoadingSpinner';
import PortfolioHubRecommendations from "../hub/PortfolioHubRecommendations";

interface LiabilitiesViewProps {
  liabilities: Liability[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  totalDebt: number;
  totalMonthlyPayment: number;
  isAddingLiability: boolean;
  editingLiability: Liability | null;
  onAddLiability: (data: Liability) => void; // Form sends Liability object
  onUpdateLiability: (data: Liability) => void; // Form sends Liability object
  onDeleteLiability: (id: string) => void;
  onSetIsAddingLiability: (isAdding: boolean) => void;
  onSetEditingLiability: (liability: Liability | null) => void;
  onBack?: () => void;
}

const LiabilitiesView: React.FC<LiabilitiesViewProps> = ({
  liabilities,
  status,
  totalDebt,
  totalMonthlyPayment,
  isAddingLiability,
  editingLiability,
  onAddLiability,
  onUpdateLiability,
  onDeleteLiability,
  onSetIsAddingLiability,
  onSetEditingLiability,
  onBack
}) => {
  const { t } = useTranslation();


  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t('liabilities.title')}
        onBack={onBack}
      />

      {/* Summary Card - keeping existing structure */}
      <div className="bg-gradient-to-r from-red-500 to-orange-400 dark:from-red-600 dark:to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t('liabilities.title')}</h2>
            <p className="text-sm opacity-90">{t('common.across', { count: liabilities.length })}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{formatService.formatCurrency(totalDebt)}</p>
            <p className="text-sm opacity-90">{t('liabilities.totalDebt')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatService.formatCurrency(totalMonthlyPayment)}</p>
            <p className="text-sm opacity-90">{t('liabilities.monthlyPayments')}</p>
          </div>
        </div>
      </div>

      <PortfolioHubRecommendations context="liabilities" />

      {/* Liabilities List */}
      {liabilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liabilities.map(liability => (
            <SwipeableCard
              key={liability.id}
              onEdit={() => onSetEditingLiability(liability)}
              onDelete={() => onDeleteLiability(liability.id)}
              className="hover:shadow-md transition-shadow"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{liability.name}</h3>
                      <span className="text-sm text-gray-500">
                        {formatService.formatCurrency(liability.currentBalance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{liability.type}</span>
                      {liability.paymentSchedule && (
                        <span>
                          {formatService.formatCurrency(liability.paymentSchedule.amount)}/Monat
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SwipeableCard>
          ))}
        </div>
      ) : (
        <MotivationalEmptyState
          icon={<Landmark className="h-8 w-8" />}
          title={t('emptyStates.liabilities.title')}
          description={t('emptyStates.liabilities.description')}
          motivationalText={t('emptyStates.liabilities.motivationalText')}
          primaryAction={{
            label: t('emptyStates.liabilities.primaryAction'),
            onClick: () => onSetIsAddingLiability(true),
            variant: 'primary'
          }}
          tips={t('emptyStates.liabilities.tips', { returnObjects: true }) as string[]}
        />
      )}

      {/* Liability Form Modal */}
      <Modal
        isOpen={isAddingLiability || editingLiability !== null}
        onClose={() => {
          onSetIsAddingLiability(false);
          onSetEditingLiability(null);
        }}
      >
        <MaterialLiabilityForm
          initialData={editingLiability || undefined}
          onSubmit={(data) => {
            const now = new Date().toISOString();
            const liability = {
              ...data,
              id: editingLiability?.id || Date.now().toString(),
              createdAt: editingLiability?.createdAt || now,
              updatedAt: now,
            };
            if (editingLiability) {
              onUpdateLiability(liability);
            } else {
              onAddLiability(liability);
            }
            onSetIsAddingLiability(false);
            onSetEditingLiability(null);
          }}
        />
      </Modal>

      {/* FloatingBtn nur anzeigen wenn kein Modal geöffnet ist */}
      {!isAddingLiability && !editingLiability && (
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Plus}
          onClick={() => onSetIsAddingLiability(true)}
          backgroundColor="#EF4444"
          hoverBackgroundColor="#DC2626"
        />
      )}
    </div>
  );
};

export default LiabilitiesView;
