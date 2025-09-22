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
import { Progress } from "@/components/ui/progress";
import { useRisk } from "@/hooks/useRisk";
import { riskFormSchema, type RiskFormData } from "@/types/schema/riskSchema";
import type { RiskRequest } from "@/types/risk";
import { ArrowLeft, ArrowRight, Calculator } from "lucide-react";

const SECTION_TITLES = [
  "Personal Info",
  "Employment & Income",
  "Financial Obligations",
  "Housing & Rental History",
  "Other Factors",
];

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
  const [step, setStep] = React.useState<number>(-1); // -1 = landing, 0..4 = sections

  const employmentOptions = [
    { label: "Permanent", value: "Permanent" },
    { label: "Contract", value: "Contract" },
    { label: "Self-employed", value: "Self_employed" },
    { label: "Student", value: "Student" },
    { label: "Unemployed", value: "Unemployed" },
    { label: "Retired", value: "Retired" },
  ];

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));
  const handleStart = () => setStep(0);
  const handleRestart = () => {
    setResult(null);
    setStep(-1);
    form.reset();
  };

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

  // Section rendering
  function renderSection() {
    switch (step) {
      case 0:
        return (
          <CollapsibleCard
            title="Section 1 — Personal Info"
            subtitle="Identification and basic demographic"
            
          >
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
        );
      case 1:
        return (
          <CollapsibleCard
            title="Section 2 — Employment & Income"
            subtitle="Work and earnings"
          >
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
        );
      case 2:
        return (
          <CollapsibleCard
            title="Section 3 — Financial Obligations"
            subtitle="Debts and reserves"
          >
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
        );
      case 3:
        return (
          <CollapsibleCard
            title="Section 4 — Housing & Rental History"
            subtitle="Rent, guarantor and references"
          >
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
        );
      case 4:
        return (
          <CollapsibleCard
            title="Section 5 — Other Factors"
            subtitle="Optional / supporting info"
          >
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
        );
      default:
        return null;
    }
  }

  // Progress bar value
  const progressValue = step >= 0 ? ((step + 1) / SECTION_TITLES.length) * 100 : 0;

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 shadow-2xl">
          {/* Landing page */}
          {step === -1 && (
            <div className="text-center animate-fade-in">
              <h1 className="text-4xl font-bold text-foreground mb-4">Tenant / Applicant Credit Scoring</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Welcome to RentGuardPro! Click below to start your advanced, interactive quote. 
                You'll fill out 5 quick sections, see your progress, and get instant results.
              </p>
              <Button size="lg" onClick={handleStart}>
                Start Quote
              </Button>
            </div>
          )}

          {/* Multi-step form */}
          {step >= 0 && step <= 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-xl">{SECTION_TITLES[step]}</span>
                <Progress value={progressValue} className="w-1/2" />
                <span className="text-sm text-muted-foreground">{step + 1} / {SECTION_TITLES.length}</span>
              </div>
              {renderSection()}
              <div className="flex justify-between mt-8">
                <Button variant="outline" disabled={step === 0} onClick={handleBack}>
                  <ArrowLeft className="mr-2" /> Back
                </Button>
                {step < 4 ? (
                  <Button onClick={handleNext}>
                    Next <ArrowRight className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-1/2"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={riskMutation.isPending}
                  >
                    {riskMutation.isPending ? "Calculating…" : <>Calculate <Calculator className="ml-2" /></>}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Result & restart */}
          {result && (
            <div className="animate-fade-in mt-8">
              <RiskResultCard result={result} />
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={handleRestart}>
                  Start New Quote
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Guidance card always visible */}
        <div className="max-w-2xl mx-auto mt-8">
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
  );
}