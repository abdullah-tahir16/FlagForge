import { matchesSegment } from "../src/segments/segment-matcher";
import { SegmentMatchMode } from "../src/segments/segment-match-mode.enum";
import { TargetingRuleOperator } from "../src/targeting-rules/targeting-rule-operator.enum";

const createCondition = (overrides = {}) => ({
  attribute: "country",
  comparisonValue: "IT",
  operator: TargetingRuleOperator.Equals,
  sortOrder: 1,
  ...overrides
});

describe("segment matcher", () => {
  it("matches only when every condition matches in match-all mode", () => {
    const segment = {
      conditions: [
        createCondition(),
        createCondition({ attribute: "plan", comparisonValue: "PREMIUM", sortOrder: 2 })
      ],
      matchMode: SegmentMatchMode.MatchAll
    };

    expect(matchesSegment(segment as never, { country: "IT", plan: "PREMIUM" })).toBe(true);
    expect(matchesSegment(segment as never, { country: "IT", plan: "FREE" })).toBe(false);
  });

  it("matches when any condition matches in match-any mode", () => {
    const segment = {
      conditions: [
        createCondition({ attribute: "email", comparisonValue: "@company.com", operator: TargetingRuleOperator.EndsWith }),
        createCondition({ attribute: "role", comparisonValue: "STAFF", sortOrder: 2 })
      ],
      matchMode: SegmentMatchMode.MatchAny
    };

    expect(matchesSegment(segment as never, { email: "user@example.com", role: "STAFF" })).toBe(true);
    expect(matchesSegment(segment as never, { email: "user@example.com", role: "CUSTOMER" })).toBe(false);
  });

  it("does not match empty segments", () => {
    expect(matchesSegment({ conditions: [], matchMode: SegmentMatchMode.MatchAny }, {})).toBe(false);
    expect(matchesSegment({ conditions: [], matchMode: SegmentMatchMode.MatchAll }, {})).toBe(false);
  });

  it("reuses targeting operator behavior for numeric and array comparisons", () => {
    const segment = {
      conditions: [
        createCondition({ attribute: "age", comparisonValue: 18, operator: TargetingRuleOperator.GreaterThanOrEqual }),
        createCondition({ attribute: "plan", comparisonValue: ["PREMIUM", "ENTERPRISE"], operator: TargetingRuleOperator.In, sortOrder: 2 })
      ],
      matchMode: SegmentMatchMode.MatchAll
    };

    expect(matchesSegment(segment as never, { age: 21, plan: "PREMIUM" })).toBe(true);
    expect(matchesSegment(segment as never, { age: 17, plan: "PREMIUM" })).toBe(false);
  });
});
