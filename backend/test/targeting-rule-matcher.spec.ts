import { BadRequestException } from "@nestjs/common";
import {
  findMatchingTargetingRule,
  matchesTargetingRule,
  validateTargetingComparisonValue
} from "../src/targeting-rules/targeting-rule-matcher";
import { TargetingRuleOperator } from "../src/targeting-rules/targeting-rule-operator.enum";

describe("targeting rule matcher", () => {
  it("matches equality and inequality operators", () => {
    expect(matchesTargetingRule({ attribute: "country", comparisonValue: "IT", operator: TargetingRuleOperator.Equals }, { country: "IT" })).toBe(true);
    expect(matchesTargetingRule({ attribute: "country", comparisonValue: "FR", operator: TargetingRuleOperator.NotEquals }, { country: "IT" })).toBe(true);
    expect(matchesTargetingRule({ attribute: "enabled", comparisonValue: true, operator: TargetingRuleOperator.Equals }, { enabled: true })).toBe(true);
  });

  it("matches contains, prefix, suffix, and inclusion operators", () => {
    expect(matchesTargetingRule({ attribute: "email", comparisonValue: "@company.com", operator: TargetingRuleOperator.EndsWith }, { email: "a@company.com" })).toBe(true);
    expect(matchesTargetingRule({ attribute: "email", comparisonValue: "admin", operator: TargetingRuleOperator.StartsWith }, { email: "admin@example.com" })).toBe(true);
    expect(matchesTargetingRule({ attribute: "email", comparisonValue: "example", operator: TargetingRuleOperator.Contains }, { email: "admin@example.com" })).toBe(true);
    expect(matchesTargetingRule({ attribute: "roles", comparisonValue: "beta", operator: TargetingRuleOperator.Contains }, { roles: ["alpha", "beta"] })).toBe(true);
    expect(matchesTargetingRule({ attribute: "plan", comparisonValue: ["FREE", "PREMIUM"], operator: TargetingRuleOperator.In }, { plan: "PREMIUM" })).toBe(true);
    expect(matchesTargetingRule({ attribute: "plan", comparisonValue: ["FREE"], operator: TargetingRuleOperator.NotIn }, { plan: "PREMIUM" })).toBe(true);
  });

  it("matches numeric comparison operators only for numeric values", () => {
    expect(matchesTargetingRule({ attribute: "age", comparisonValue: 18, operator: TargetingRuleOperator.GreaterThanOrEqual }, { age: 18 })).toBe(true);
    expect(matchesTargetingRule({ attribute: "age", comparisonValue: 18, operator: TargetingRuleOperator.GreaterThan }, { age: 21 })).toBe(true);
    expect(matchesTargetingRule({ attribute: "age", comparisonValue: 65, operator: TargetingRuleOperator.LessThan }, { age: 40 })).toBe(true);
    expect(matchesTargetingRule({ attribute: "age", comparisonValue: 65, operator: TargetingRuleOperator.LessThanOrEqual }, { age: 65 })).toBe(true);
    expect(matchesTargetingRule({ attribute: "age", comparisonValue: 18, operator: TargetingRuleOperator.GreaterThan }, { age: "21" })).toBe(false);
  });

  it("returns the first matching rule and ignores missing or unsupported context", () => {
    const rules = [
      { attribute: "country", comparisonValue: "FR", operator: TargetingRuleOperator.Equals, resultValue: true },
      { attribute: "plan", comparisonValue: "PREMIUM", operator: TargetingRuleOperator.Equals, resultValue: false },
      { attribute: "email", comparisonValue: "@company.com", operator: TargetingRuleOperator.EndsWith, resultValue: true }
    ];

    expect(findMatchingTargetingRule(rules, { email: "a@company.com", plan: "PREMIUM" })).toBe(rules[1]);
    expect(matchesTargetingRule({ attribute: "missing", comparisonValue: "x", operator: TargetingRuleOperator.Equals }, {})).toBe(false);
    expect(matchesTargetingRule({ attribute: "profile", comparisonValue: "x", operator: TargetingRuleOperator.Equals }, { profile: { nested: true } as never })).toBe(false);
  });

  it("rejects invalid operator comparison values", () => {
    expect(() => validateTargetingComparisonValue(TargetingRuleOperator.In, "PREMIUM")).toThrow(BadRequestException);
    expect(() => validateTargetingComparisonValue(TargetingRuleOperator.GreaterThan, "18")).toThrow(BadRequestException);
    expect(() => validateTargetingComparisonValue(TargetingRuleOperator.StartsWith, 123)).toThrow(BadRequestException);
    expect(() => validateTargetingComparisonValue(TargetingRuleOperator.Equals, ["IT"])).toThrow(BadRequestException);
  });
});
