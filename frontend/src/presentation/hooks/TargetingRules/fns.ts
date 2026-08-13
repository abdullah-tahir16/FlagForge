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
  resultValue: "true",
  segmentId: "",
  source: "ATTRIBUTE"
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
        attribute: rule.attribute ?? defaultTargetingRuleFormValues.attribute,
        comparisonValue: rule.comparisonValue === null ? "" : formatComparisonValue(rule.comparisonValue),
        operator: rule.operator ?? defaultTargetingRuleFormValues.operator,
        resultValue: rule.resultValue ? "true" : "false",
        segmentId: rule.segmentId ?? "",
        source: rule.source
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

export const parseTargetingRuleFormValues = (values: TargetingRuleFormValues): CreateTargetingRuleInput => {
  if (values.source === "SEGMENT") {
    return {
      resultValue: values.resultValue === "true",
      segmentId: values.segmentId,
      source: "SEGMENT"
    };
  }

  return {
    attribute: (values.attribute ?? "").trim(),
    comparisonValue: parseComparisonValue(values),
    operator: values.operator ?? "EQUALS",
    resultValue: values.resultValue === "true",
    source: "ATTRIBUTE"
  };
};

const parseComparisonValue = (values: TargetingRuleFormValues): TargetingComparisonValue => {
  const operator = values.operator ?? "EQUALS";
  const comparisonValue = values.comparisonValue ?? "";

  if (arrayTargetingRuleOperators.includes(operator)) {
    return comparisonValue
      .split(",")
      .map((value) => parsePrimitiveValue(value.trim()))
      .filter((value) => value !== "");
  }

  if (numericTargetingRuleOperators.includes(operator)) {
    return Number(comparisonValue);
  }

  return parsePrimitiveValue(comparisonValue.trim());
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
