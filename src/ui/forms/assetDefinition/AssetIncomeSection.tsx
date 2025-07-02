import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../../common/Card";
import { Toggle } from "../../common/Toggle";
import { StandardFormField } from "../StandardFormWrapper";
import { CustomAmountsSection } from "../../specialized/CustomAmountsSection";
import { MonthSelector } from "../MonthSelector";
import { PaymentFrequency } from '@/types/shared/base/enums';

interface AssetIncomeSectionProps {
  type: "dividend" | "rental";
  hasIncome: boolean | undefined;
  onHasIncomeChange: (checked: boolean) => void;
  amount: number | undefined;
  onAmountChange: (value: number) => void;
  frequency: PaymentFrequency | undefined;
  onFrequencyChange: (value: PaymentFrequency) => void;
  paymentMonths: number[];
  onPaymentMonthChange: (month: number, checked: boolean) => void;
  customAmounts: Record<string, number>;
  onCustomAmountChange: (month: number, amount: number) => void;
}

export const AssetIncomeSection: React.FC<AssetIncomeSectionProps> = ({
  type,
  hasIncome,
  onHasIncomeChange,
  amount,
  onAmountChange,
  frequency,
  onFrequencyChange,
  paymentMonths,
  onPaymentMonthChange,
  customAmounts,
  onCustomAmountChange,
}) => {
  const { t } = useTranslation();

  const texts = {
    dividend: {
      has: "assets.hasDividend",
      amount: "assets.dividendAmount",
      frequency: "assets.dividendFrequency",
      selectQuarterly: "assets.selectQuarterlyMonths",
      selectAnnual: "assets.selectAnnualMonth",
      selectMonths: "assets.selectDividendMonths",
      customAmounts: "assets.customDividendAmounts",
    },
    rental: {
      has: "assets.hasRental",
      amount: "assets.rentalAmount",
      frequency: "assets.rentalFrequency",
      selectQuarterly: "assets.selectQuarterlyMonths",
      selectAnnual: "assets.selectAnnualMonth",
      selectMonths: "assets.selectRentalMonths",
      customAmounts: "assets.customRentalAmounts",
    },
  };

  const currentTexts = texts[type];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-700 dark:text-gray-300">
          {t(currentTexts.has)}
        </span>
        <Toggle
          checked={hasIncome ?? false}
          onChange={onHasIncomeChange}
          id={`has${type}`}
          label={t(currentTexts.has)}
        />
      </div>

      {hasIncome && (
        <Card className="p-6">
          <div className="space-y-6">
            <StandardFormField
              label={t(currentTexts.amount)}
              name={`${type}Amount`}
              type="number"
              value={amount}
              onChange={(value) => onAmountChange(typeof value === 'number' ? value : parseFloat(String(value)) || 0)}
              step={0.01}
              min={0}
            />

            <StandardFormField
              label={t(currentTexts.frequency)}
              name={`${type}Frequency`}
              type="select"
              options={[
                {
                  value: "monthly",
                  label: t("paymentFrequency.monthly"),
                },
                {
                  value: "quarterly",
                  label: t("paymentFrequency.quarterly"),
                },
                {
                  value: "annually",
                  label: t("paymentFrequency.annually"),
                },
                { value: "custom", label: t("paymentFrequency.custom") },
              ]}
              value={frequency}
              onChange={(value) => onFrequencyChange(value as PaymentFrequency)}
            />
          </div>

          {/* Payment Month Selection */}
          {frequency &&
            (frequency === "quarterly" ||
              frequency === "annually" ||
              frequency === "custom") && (
              <div className="mt-6">
                <MonthSelector
                  selectedMonths={paymentMonths}
                  onChange={onPaymentMonthChange}
                  label={(() => {
                    if (frequency === "quarterly") {
                      return t(currentTexts.selectQuarterly);
                    }
                    if (frequency === "annually") {
                      return t(currentTexts.selectAnnual);
                    }
                    return t(currentTexts.selectMonths);
                  })()}
                />
              </div>
            )}

          {/* Custom Payment Amounts */}
          {frequency === "custom" && (
            <CustomAmountsSection
              frequency={frequency}
              selectedMonths={paymentMonths}
              customAmounts={customAmounts}
              onAmountChange={onCustomAmountChange}
              title={t(currentTexts.customAmounts)}
            />
          )}
        </Card>
      )}
    </div>
  );
};
