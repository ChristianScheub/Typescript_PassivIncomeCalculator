import React from "react";
import { useTranslation } from "react-i18next";
import { DividendFrequency, PaymentFrequency } from "../../types";
import { FormGrid, StandardFormField } from "../forms/FormGrid";
import { MonthSelector } from "../forms/MonthSelector";
import { CustomAmountsSection } from "./CustomAmountsSection";

interface PaymentScheduleSectionProps {
  isEnabled: boolean;
  amount: number;
  frequency: DividendFrequency | PaymentFrequency;
  paymentMonths: number[];
  customAmounts: Record<string, number>;
  currency: string;
  onEnabledChange: (enabled: boolean) => void;
  onAmountChange: (amount: number) => void;
  onFrequencyChange: (frequency: DividendFrequency | PaymentFrequency) => void;
  onMonthChange: (month: number, checked: boolean) => void;
  onCustomAmountChange: (month: number, amount: number) => void;
  labels: {
    enabledLabel: string;
    amountLabel: string;
    frequencyLabel: string;
    monthSelectorLabel: string;
    customAmountsLabel: string;
  };
}

export const PaymentScheduleSection: React.FC<PaymentScheduleSectionProps> = ({
  isEnabled,
  amount,
  frequency,
  paymentMonths,
  customAmounts,
  currency,
  onEnabledChange,
  onAmountChange,
  onFrequencyChange,
  onMonthChange,
  onCustomAmountChange,
  labels
}) => {
  const { t } = useTranslation();

  return (
    <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
      <StandardFormField
        label={labels.enabledLabel}
        name="paymentEnabled"
        type="checkbox"
        value={isEnabled}
        onChange={onEnabledChange}
      />

      {isEnabled && (
        <>
          <StandardFormField
            label={labels.amountLabel}
            name="paymentAmount"
            type="number"
            value={amount}
            onChange={onAmountChange}
            step={0.01}
            min={0}
          />

          <StandardFormField
            label={labels.frequencyLabel}
            name="paymentFrequency"
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
            onChange={onFrequencyChange}
          />

          {frequency && (frequency === "quarterly" || frequency === "annually" || frequency === "custom") && (
            <div style={{ marginTop: "16px" }}>
              <MonthSelector
                selectedMonths={paymentMonths}
                onChange={onMonthChange}
                label={labels.monthSelectorLabel}
              />
            </div>
          )}

          {frequency === "custom" && (
            <CustomAmountsSection
              frequency={frequency}
              selectedMonths={paymentMonths}
              customAmounts={customAmounts}
              onAmountChange={onCustomAmountChange}
              title={labels.customAmountsLabel}
              currency={currency}
            />
          )}
        </>
      )}
    </FormGrid>
  );
};
