// client/src/pages/quote/index.tsx
import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CollapsibleCard from "@/components/form/CollapsibleCard";
import NumberField from "@/components/form/NumberField";
import TextField from "@/components/form/TextField";
import ToggleField from "@/components/form/ToggleField";
import SelectField from "@/components/form/SelectField";
import RiskResultCard from "@/components/RiskResultCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRisk } from "@/hooks/useRisk";
import { riskFormSchema, type RiskFormData } from "@/types/schema/riskSchema";
import type { RiskRequest } from "@/types/risk";

export default function Quote() {
  const riskMutation = useRisk();

  const form = useForm<RiskFormData>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      fullName: "",
      age: 25,
      maritalStatus: "Single",
      numberOfDependents: 0,

      employmentType: "Permanent",
      monthlyNetSalary: 0,
      employmentYears: 0,

      monthlyDebtPayments: 0,
      savingsBalance: 0,
      otherObligations: 0,

      rentAmount: 0,
      hasGuarantor: false,
      guarantorIncome: null,
      guarantorLocation: "Unknown",
      monthsAtResidence: 0,
      numberOfPastDefaults: 0,
      landlordReferences: [],

      utilityPaymentHistory: "Sometimes",
      healthStatus: "Good",
      verifiedId: false,
      nationalId: "",
    },
  });

  const [result, setResult] = React.useState<null | import("@/types/risk").RiskResponse>(null);

  const onSubmit = (data: RiskFormData) => {
    const payload: RiskRequest = {
      fullName: data.fullName,
      age: data.age,
      maritalStatus: data.maritalStatus,
      numberOfDependents: data.numberOfDependents,

      employmentType: data.employmentType,
      monthlyNetSalary: data.monthlyNetSalary,
      employmentYears: data.employmentYears,

      monthlyDebtPayments: data.monthlyDebtPayments,
      savingsBalance: data.savingsBalance,
      otherObligations: data.otherObligations,

      rentAmount: data.rentAmount,
      hasGuarantor: data.hasGuarantor,
      guarantorIncome: data.hasGuarantor ? data.guarantorIncome ?? null : null,
      guarantorLocation: data.guarantorLocation,
      monthsAtResidence: data.monthsAtResidence,
      numberOfPastDefaults: data.numberOfPastDefaults,
      landlordReferences: data.landlordReferences,

      utilityPaymentHistory: data.utilityPaymentHistory,
      healthStatus: data.healthStatus,
      verifiedId: data.verifiedId,
      nationalId: data.nationalId,
    };

    riskMutation.mutate(payload, {
      onSuccess: (res) => setResult(res.risk),
    });
  };

  const employmentOptions = [
    { label: "Permanent", value: "Permanent" },
    { label: "Contract", value: "Contract" },
    { label: "Self-employed", value: "Self_employed" },
    { label: "Student", value: "Student" },
    { label: "Unemployed", value: "Unemployed" },
    { label: "Retired", value: "Retired" },
  ];

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Tenant / Applicant Credit Scoring</h1>
          <p className="text-muted-foreground mt-1">
            Complete the form below to calculate safety score, PD and underwriting decision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Personal info */}
            <CollapsibleCard title="Section 1 — Personal Info" subtitle="Identification and basic demographic">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Full Name"
                  id="fullName"
                  register={form.register}
                  error={form.formState.errors.fullName?.message}
                />
                <NumberField
                  label="Age"
                  id="age"
                  register={form.register}
                  error={form.formState.errors.age?.message}
                  min={18}
                  max={99}
                />
                <Controller
                  control={form.control}
                  name="maritalStatus"
                  render={({ field: { value, onChange } }) => (
                    <SelectField
                      label="Marital Status"
                      options={[
                        { label: "Single", value: "Single" },
                        { label: "Married", value: "Married" },
                        { label: "Divorced", value: "Divorced" },
                        { label: "Widowed", value: "Widowed" },
                      ]}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <NumberField
                  label="Number of Dependents"
                  id="numberOfDependents"
                  register={form.register}
                  error={form.formState.errors.numberOfDependents?.message}
                  min={0}
                  max={10}
                />
              </div>
            </CollapsibleCard>

            {/* Employment & Income */}
            <CollapsibleCard title="Section 2 — Employment & Income" subtitle="Work and earnings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="employmentType"
                  control={form.control}
                  render={({ field: { value, onChange } }) => (
                    <SelectField label="Employment Type" options={employmentOptions} value={value} onChange={onChange} />
                  )}
                />
                <NumberField
                  label="Monthly Net Salary (TND)"
                  id="monthlyNetSalary"
                  register={form.register}
                  error={form.formState.errors.monthlyNetSalary?.message}
                />
                <NumberField
                  label="Employment Stability (years)"
                  id="employmentYears"
                  register={form.register}
                  error={form.formState.errors.employmentYears?.message}
                  min={0}
                />
              </div>
            </CollapsibleCard>

            {/* Financial obligations */}
            <CollapsibleCard title="Section 3 — Financial Obligations" subtitle="Debts and reserves">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField
                  label="Monthly Debt Payments (TND)"
                  id="monthlyDebtPayments"
                  register={form.register}
                  error={form.formState.errors.monthlyDebtPayments?.message}
                />
                <NumberField
                  label="Savings Balance (TND)"
                  id="savingsBalance"
                  register={form.register}
                  error={form.formState.errors.savingsBalance?.message}
                />
                <NumberField
                  label="Other Regular Obligations (TND)"
                  id="otherObligations"
                  register={form.register}
                  error={form.formState.errors.otherObligations?.message}
                />
              </div>
            </CollapsibleCard>

            {/* Housing & Rental History */}
            <CollapsibleCard title="Section 4 — Housing & Rental History" subtitle="Rent, guarantor and references">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField
                  label="Current Rent Amount (TND)"
                  id="rentAmount"
                  register={form.register}
                  error={form.formState.errors.rentAmount?.message}
                />
                <Controller
                  name="hasGuarantor"
                  control={form.control}
                  render={({ field: { value, onChange } }) => (
                    <ToggleField label="Has Guarantor?" id="hasGuarantor" checked={value} onChange={onChange} />
                  )}
                />
                {form.watch("hasGuarantor") && (
                  <>
                    <NumberField
                      label="Guarantor Income (TND)"
                      id="guarantorIncome"
                      register={form.register}
                      error={form.formState.errors.guarantorIncome?.message}
                    />
                    <Controller
                      control={form.control}
                      name="guarantorLocation"
                      render={({ field: { value, onChange } }) => (
                        <SelectField
                          label="Guarantor Location"
                          options={[
                            { label: "Tunisia", value: "Tunisia" },
                            { label: "Outside Tunisia", value: "Outside" },
                            { label: "Unknown", value: "Unknown" },
                          ]}
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                  </>
                )}
                <NumberField
                  label="Tenure at Current Residence (months)"
                  id="monthsAtResidence"
                  register={form.register}
                  error={form.formState.errors.monthsAtResidence?.message}
                />
                <NumberField
                  label="Past Rental Defaults"
                  id="numberOfPastDefaults"
                  register={form.register}
                  error={form.formState.errors.numberOfPastDefaults?.message}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Landlord References (one per line: name | phone | rating)
                  </label>
                  <textarea
                    placeholder="Example: Ahmed | +216-xx-xxx-xxx | Positive"
                    className="w-full rounded-md border p-2"
                    rows={3}
                    onBlur={(e) => {
                      const raw = e.currentTarget.value;
                      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
                      const parsed = lines.map((l, idx) => {
                        const parts = l.split("|").map((p) => p.trim());
                        return {
                          id: `lr-${idx}`,
                          name: parts[0] ?? "",
                          phone: parts[1] ?? "",
                          relation: "previous landlord",
                          rating: (parts[2] ?? "Neutral") as any,
                        };
                      });
                      form.setValue("landlordReferences", parsed);
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use one line per landlord. Format: name | phone | rating (Positive/Neutral/Negative)
                  </p>
                </div>
              </div>
            </CollapsibleCard>

            {/* Other factors */}
            <CollapsibleCard title="Section 5 — Other Factors" subtitle="Optional / supporting info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="utilityPaymentHistory"
                  render={({ field: { value, onChange } }) => (
                    <SelectField
                      label="Utility Payment History"
                      options={[
                        { label: "Always on time", value: "Always" },
                        { label: "Sometimes late", value: "Sometimes" },
                        { label: "Frequently late", value: "Frequently" },
                      ]}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="healthStatus"
                  render={({ field: { value, onChange } }) => (
                    <SelectField
                      label="Health Status (optional)"
                      options={[
                        { label: "Good", value: "Good" },
                        { label: "Average", value: "Average" },
                        { label: "Poor", value: "Poor" },
                      ]}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <Controller
                  name="verifiedId"
                  control={form.control}
                  render={({ field: { value, onChange } }) => (
                    <ToggleField label="National ID verified" id="verifiedId" checked={value} onChange={onChange} />
                  )}
                />
                <TextField
                  label="National ID / Passport Number (optional)"
                  id="nationalId"
                  register={form.register}
                />
              </div>
            </CollapsibleCard>

            <div className="pt-4">
              <Button onClick={form.handleSubmit(onSubmit)} className="w-full" disabled={riskMutation.isPending}>
                {riskMutation.isPending ? "Calculating…" : "Calculate Risk"}
              </Button>
            </div>
          </div>

          {/* Right column: result & guidance */}
          <div className="space-y-4">
            <RiskResultCard result={result} />
            <Card>
              <div className="p-4">
                <h3 className="font-medium">Guidance</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Tips: Improve safety score by increasing savings, reducing debt, providing stronger landlord
                  references or a guarantor located in Tunisia.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
