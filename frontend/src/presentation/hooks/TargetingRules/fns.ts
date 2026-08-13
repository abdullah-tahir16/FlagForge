import type {
  CreateTargetingRuleInput,
  TargetingComparisonValue,
  TargetingPrimitive,
  TargetingRule
} from "../../../core/types/TargetingRules";
import { arrayTargetingRuleOperators, numericTargetingRuleOperators } from "./data";
import type { TargetingRuleFormValues } from "./data";

export const defaultTargetingRuleFormValues: TargetingRuleFormValues = {
  attribute: "country",
  comparisonValue: "IT",
  operator: "EQUALS",
  resultValue: "true"
};

export const formatComparisonValue = (value: TargetingComparisonValue): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value === null ? "null" : String(value);
};

export const getTargetingRuleInitialValues = (rule?: TargetingRule): TargetingRuleFormValues =>
  rule
    ? {
        attribute: rule.attribute,
        comparisonValue: formatComparisonValue(rule.comparisonValue),
        operator: rule.operator,
        resultValue: rule.resultValue ? "true" : "false"
      }
    : defaultTargetingRuleFormValues;

export const moveTargetingRule = (rules: TargetingRule[], ruleId: string, direction: "down" | "up"): TargetingRule[] => {
  const currentIndex = rules.findIndex((rule) => rule.id === ruleId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= rules.length) {
    return rules;
  }

  const nextRules = [...rules];
  const [rule] = nextRules.splice(currentIndex, 1);
  nextRules.splice(nextIndex, 0, rule);

  return nextRules;
};

export const parseTargetingRuleFormValues = (values: TargetingRuleFormValues): CreateTargetingRuleInput => ({
  attribute: values.attribute.trim(),
  comparisonValue: parseComparisonValue(values),
  operator: values.operator,
  resultValue: values.resultValue === "true"
});

const parseComparisonValue = (values: TargetingRuleFormValues): TargetingComparisonValue => {
  if (arrayTargetingRuleOperators.includes(values.operator)) {
    return values.comparisonValue
      .split(",")
      .map((value) => parsePrimitiveValue(value.trim()))
      .filter((value) => value !== "");
  }

  if (numericTargetingRuleOperators.includes(values.operator)) {
    return Number(values.comparisonValue);
  }

  return parsePrimitiveValue(values.comparisonValue.trim());
};

const parsePrimitiveValue = (value: string): TargetingPrimitive | "" => {
  if (!value) {
    return "";
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "null") {
    return null;
  }

  return value;
};
