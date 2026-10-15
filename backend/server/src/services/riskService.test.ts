import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { computeComponentScores, computeSafetyScoreAndPd } from "./riskService";
import type { RiskRequest } from "../validators/riskSchema";

const strongApplicant: RiskRequest = {
  age: 30,
  maritalStatus: "Married",
  numberOfDependents: 1,
  employmentType: "Permanent",
  monthlyNetSalary: 3000,
  employmentYears: 6,
  monthlyDebtPayments: 0,
  savingsBalance: 6000,
  otherObligations: 0,
  rentAmount: 600,
  hasGuarantor: true,
  guarantorLocation: "Tunisia",
  monthsAtResidence: 48,
  numberOfPastDefaults: 0,
  landlordReferences: [{ rating: "Positive" }],
  utilityPaymentHistory: "Always",
  healthStatus: "Good",
  verifiedId: true,
};

const weakApplicant: RiskRequest = {
  age: 70,
  maritalStatus: "Divorced",
  numberOfDependents: 5,
  employmentType: "Unemployed",
  monthlyNetSalary: 1000,
  employmentYears: 0,
  monthlyDebtPayments: 500,
  savingsBalance: 0,
  otherObligations: 300,
  rentAmount: 800,
  hasGuarantor: false,
  guarantorLocation: "Unknown",
  monthsAtResidence: 3,
  numberOfPastDefaults: 3,
  landlordReferences: [{ rating: "Negative" }],
  utilityPaymentHistory: "Frequently",
  healthStatus: "Poor",
  verifiedId: false,
};

describe("computeComponentScores", () => {
  it("gives a strong applicant the maximum in every component", () => {
    const c = computeComponentScores(strongApplicant);
    expect([c.personal, c.employment, c.financial, c.housing, c.other]).toEqual([10, 25, 20, 25, 20]);
  });

  it("scores a weak applicant near the bottom of every component", () => {
    const c = computeComponentScores(weakApplicant);
    expect([c.personal, c.employment, c.financial, c.housing, c.other]).toEqual([3, 1, 0, 1, 0]);
  });

  it("counts only the best landlord reference", () => {
    const refs = [{ rating: "Negative" }, { rating: "Positive" }, { rating: "Neutral" }] as RiskRequest["landlordReferences"];
    const withRefs = computeComponentScores({ ...weakApplicant, landlordReferences: refs });
    const without = computeComponentScores({ ...weakApplicant, landlordReferences: [] });
    expect(withRefs.housing - without.housing).toBe(5);
  });

  it("rewards a lower rent-to-income ratio", () => {
    const affordable = computeComponentScores({ ...strongApplicant, rentAmount: 900 }); // 30% of income
    const stretched = computeComponentScores({ ...strongApplicant, rentAmount: 1500 }); // 50% of income
    const unaffordable = computeComponentScores({ ...strongApplicant, rentAmount: 1800 }); // 60% of income
    expect(affordable.employment).toBeGreaterThan(stretched.employment);
    expect(stretched.employment).toBeGreaterThan(unaffordable.employment);
  });
});

describe("computeSafetyScoreAndPd", () => {
  it("accepts a strong applicant with a perfect score and no default probability", () => {
    const r = computeSafetyScoreAndPd(strongApplicant);
    expect(r.safetyScore).toBe(100);
    expect(r.PD_12m).toBe(0);
    expect(r.decision).toBe("accept");
    expect(r.explanations).toEqual(["Applicant meets primary underwriting criteria."]);
  });

  it("declines a weak applicant and explains every weak area", () => {
    const r = computeSafetyScoreAndPd(weakApplicant);
    expect(r.safetyScore).toBe(5);
    expect(r.PD_12m).toBe(0.2375);
    expect(r.decision).toBe("decline");
    expect(r.explanations).toHaveLength(4);
  });

  it("follows the configured decision thresholds", () => {
    const lenient = computeSafetyScoreAndPd(weakApplicant, undefined, {
      decisionThresholds: { acceptPd: 0.3, conditionalPd: 0.4 },
    });
    expect(lenient.decision).toBe("accept");
  });
});

const applicant: fc.Arbitrary<RiskRequest> = fc.record({
  age: fc.integer({ min: 18, max: 120 }),
  maritalStatus: fc.constantFrom("Single", "Married", "Divorced", "Widowed"),
  numberOfDependents: fc.integer({ min: 0, max: 10 }),
  employmentType: fc.constantFrom("Permanent", "Contract", "Self_employed", "Student", "Unemployed", "Retired"),
  monthlyNetSalary: fc.integer({ min: 0, max: 50_000 }),
  employmentYears: fc.integer({ min: 0, max: 45 }),
  monthlyDebtPayments: fc.integer({ min: 0, max: 50_000 }),
  savingsBalance: fc.integer({ min: 0, max: 1_000_000 }),
  otherObligations: fc.integer({ min: 0, max: 50_000 }),
  rentAmount: fc.integer({ min: 0, max: 20_000 }),
  hasGuarantor: fc.boolean(),
  guarantorLocation: fc.constantFrom("Tunisia", "Outside", "Unknown"),
  monthsAtResidence: fc.integer({ min: 0, max: 600 }),
  numberOfPastDefaults: fc.integer({ min: 0, max: 10 }),
  landlordReferences: fc.array(fc.record({ rating: fc.constantFrom("Positive", "Neutral", "Negative") }), { maxLength: 4 }),
  utilityPaymentHistory: fc.constantFrom("Always", "Sometimes", "Frequently"),
  healthStatus: fc.constantFrom("Good", "Average", "Poor"),
  verifiedId: fc.boolean(),
}) as fc.Arbitrary<RiskRequest>;

describe("scoring invariants (property-based)", () => {
  it("keeps the score between 0 and 100 and the default probability between 0 and pdMax", () => {
    fc.assert(
      fc.property(applicant, (input) => {
        const r = computeSafetyScoreAndPd(input);
        expect(r.safetyScore).toBeGreaterThanOrEqual(0);
        expect(r.safetyScore).toBeLessThanOrEqual(100);
        expect(r.PD_12m).toBeGreaterThanOrEqual(0);
        expect(r.PD_12m).toBeLessThanOrEqual(0.25);
      }),
    );
  });

  it("never lets a component exceed its configured weight", () => {
    const weights = { personal: 15, employment: 30, financial: 20, housing: 20, other: 15 };
    fc.assert(
      fc.property(applicant, (input) => {
        const { components } = computeSafetyScoreAndPd(input, undefined, { weights });
        for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
          expect(components[key]).toBeLessThanOrEqual(weights[key]);
          expect(components[key]).toBeGreaterThanOrEqual(0);
        }
      }),
    );
  });

  it("always decides according to the thresholds", () => {
    fc.assert(
      fc.property(applicant, (input) => {
        const r = computeSafetyScoreAndPd(input);
        const expected = r.PD_12m <= 0.03 ? "accept" : r.PD_12m <= 0.1 ? "conditional_accept" : "decline";
        expect(r.decision).toBe(expected);
      }),
    );
  });

  it("never lowers the score when a past default is removed", () => {
    fc.assert(
      fc.property(applicant, (input) => {
        fc.pre((input.numberOfPastDefaults ?? 0) > 0);
        const before = computeSafetyScoreAndPd(input).safetyScore;
        const after = computeSafetyScoreAndPd({ ...input, numberOfPastDefaults: (input.numberOfPastDefaults ?? 0) - 1 }).safetyScore;
        expect(after).toBeGreaterThanOrEqual(before);
      }),
    );
  });
});
