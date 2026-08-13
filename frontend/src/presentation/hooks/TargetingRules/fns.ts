import type { CreateTargetingRuleInput, TargetingRule } from "../../../core/types/TargetingRules";
import { formatComparisonValue, moveInOrderedList, parseComparisonValueForOperator } from "../../../core/utils/targeting";
import type { TargetingRuleFormValues } from "./data";

export { formatComparisonValue };

export const defaultTargetingRuleFormValues: TargetingRuleFormValues = {
  attribute: "country",
  comparisonValue: "IT",
  operator: "EQUALS",
  resultValue: "true",
  segmentId: "",
  source: "ATTRIBUTE"
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

export const moveTargetingRule = (rules: TargetingRule[], ruleId: string, direction: "down" | "up"): TargetingRule[] =>
  moveInOrderedList(rules, ruleId, direction, (rule) => rule.id);

export const parseTargetingRuleFormValues = (values: TargetingRuleFormValues): CreateTargetingRuleInput => {
  if (values.source === "SEGMENT") {
    return {
      resultValue: values.resultValue === "true",
      segmentId: values.segmentId,
      source: "SEGMENT"
    };
  }

  const operator = values.operator ?? "EQUALS";

  return {
    attribute: (values.attribute ?? "").trim(),
    comparisonValue: parseComparisonValueForOperator(operator, values.comparisonValue ?? ""),
    operator,
    resultValue: values.resultValue === "true",
    source: "ATTRIBUTE"
  };
};
