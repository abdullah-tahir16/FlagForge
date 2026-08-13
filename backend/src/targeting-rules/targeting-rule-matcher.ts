import { BadRequestException } from "@nestjs/common";
import type { SdkEvaluationContextValue } from "../evaluations/dto/evaluation-request.dto";
import type { TargetingComparisonValue, TargetingPrimitive } from "./targeting-rule-comparison-value";
import { TargetingRuleOperator } from "./targeting-rule-operator.enum";

export interface TargetingRuleMatchInput {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  operator: TargetingRuleOperator;
}

export type TargetingEvaluationContext = Record<string, SdkEvaluationContextValue | undefined>;

const numericOperators = new Set<TargetingRuleOperator>([
  TargetingRuleOperator.GreaterThan,
  TargetingRuleOperator.GreaterThanOrEqual,
  TargetingRuleOperator.LessThan,
  TargetingRuleOperator.LessThanOrEqual
]);

const arrayOperators = new Set<TargetingRuleOperator>([TargetingRuleOperator.In, TargetingRuleOperator.NotIn]);

const stringOperators = new Set<TargetingRuleOperator>([
  TargetingRuleOperator.StartsWith,
  TargetingRuleOperator.EndsWith
]);

export const validateTargetingComparisonValue = (
  operator: TargetingRuleOperator,
  comparisonValue: TargetingComparisonValue
): void => {
  if (arrayOperators.has(operator)) {
    if (!Array.isArray(comparisonValue) || !comparisonValue.every(isComparablePrimitive)) {
      throw new BadRequestException(`${operator} requires an array comparison value`);
    }

    return;
  }

  if (Array.isArray(comparisonValue)) {
    throw new BadRequestException(`${operator} requires a primitive comparison value`);
  }

  if (!isComparablePrimitive(comparisonValue)) {
    throw new BadRequestException("Comparison value must be a string, number, boolean, null, or primitive array");
  }

  if (numericOperators.has(operator) && typeof comparisonValue !== "number") {
    throw new BadRequestException(`${operator} requires a numeric comparison value`);
  }

  if (stringOperators.has(operator) && typeof comparisonValue !== "string") {
    throw new BadRequestException(`${operator} requires a string comparison value`);
  }
};

export const matchesTargetingRule = (rule: TargetingRuleMatchInput, context: TargetingEvaluationContext): boolean => {
  const contextValue = context[rule.attribute];

  if (!isContextValueSupported(contextValue)) {
    return false;
  }

  switch (rule.operator) {
    case TargetingRuleOperator.Equals:
      return areEqual(contextValue, rule.comparisonValue);
    case TargetingRuleOperator.NotEquals:
      return !areEqual(contextValue, rule.comparisonValue);
    case TargetingRuleOperator.Contains:
      return containsValue(contextValue, rule.comparisonValue);
    case TargetingRuleOperator.NotContains:
      return !containsValue(contextValue, rule.comparisonValue);
    case TargetingRuleOperator.StartsWith:
      return typeof contextValue === "string" && typeof rule.comparisonValue === "string" && contextValue.startsWith(rule.comparisonValue);
    case TargetingRuleOperator.EndsWith:
      return typeof contextValue === "string" && typeof rule.comparisonValue === "string" && contextValue.endsWith(rule.comparisonValue);
    case TargetingRuleOperator.In:
      return Array.isArray(rule.comparisonValue) && rule.comparisonValue.some((value) => areEqual(contextValue, value));
    case TargetingRuleOperator.NotIn:
      return Array.isArray(rule.comparisonValue) && !rule.comparisonValue.some((value) => areEqual(contextValue, value));
    case TargetingRuleOperator.GreaterThan:
      return compareNumbers(contextValue, rule.comparisonValue, (left, right) => left > right);
    case TargetingRuleOperator.GreaterThanOrEqual:
      return compareNumbers(contextValue, rule.comparisonValue, (left, right) => left >= right);
    case TargetingRuleOperator.LessThan:
      return compareNumbers(contextValue, rule.comparisonValue, (left, right) => left < right);
    case TargetingRuleOperator.LessThanOrEqual:
      return compareNumbers(contextValue, rule.comparisonValue, (left, right) => left <= right);
  }
};

export const findMatchingTargetingRule = <T extends TargetingRuleMatchInput>(
  rules: T[],
  context: TargetingEvaluationContext
): T | null => rules.find((rule) => matchesTargetingRule(rule, context)) ?? null;

const areEqual = (left: SdkEvaluationContextValue, right: TargetingComparisonValue): boolean => {
  if (Array.isArray(left) || Array.isArray(right)) {
    return false;
  }

  return left === right;
};

const compareNumbers = (
  left: SdkEvaluationContextValue,
  right: TargetingComparisonValue,
  compare: (leftNumber: number, rightNumber: number) => boolean
): boolean => typeof left === "number" && typeof right === "number" && compare(left, right);

const containsValue = (left: SdkEvaluationContextValue, right: TargetingComparisonValue): boolean => {
  if (typeof left === "string" && typeof right === "string") {
    return left.includes(right);
  }

  if (Array.isArray(left) && !Array.isArray(right)) {
    return left.some((value) => value === right);
  }

  return false;
};

const isComparablePrimitive = (value: unknown): value is TargetingPrimitive =>
  value === null || ["boolean", "number", "string"].includes(typeof value);

const isContextValueSupported = (value: unknown): value is SdkEvaluationContextValue =>
  isComparablePrimitive(value) || (Array.isArray(value) && value.every(isComparablePrimitive));
