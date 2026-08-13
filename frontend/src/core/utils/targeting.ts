import type { TargetingComparisonValue, TargetingPrimitive, TargetingRuleOperator } from "../types/TargetingRules";

export const numericComparisonOperators: TargetingRuleOperator[] = [
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL"
];

export const arrayComparisonOperators: TargetingRuleOperator[] = ["IN", "NOT_IN"];

export const comparisonOperatorLabels: Record<TargetingRuleOperator, string> = {
  CONTAINS: "contains",
  ENDS_WITH: "ends with",
  EQUALS: "equals",
  GREATER_THAN: "greater than",
  GREATER_THAN_OR_EQUAL: "greater than or equal",
  IN: "in",
  LESS_THAN: "less than",
  LESS_THAN_OR_EQUAL: "less than or equal",
  NOT_CONTAINS: "does not contain",
  NOT_EQUALS: "does not equal",
  NOT_IN: "not in",
  STARTS_WITH: "starts with"
};

export const formatComparisonValue = (value: TargetingComparisonValue): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value === null ? "null" : String(value);
};

export const parsePrimitiveValue = (value: string): TargetingPrimitive | "" => {
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

export const parseComparisonValueForOperator = (
  operator: TargetingRuleOperator,
  rawComparisonValue: string
): TargetingComparisonValue => {
  if (arrayComparisonOperators.includes(operator)) {
    return rawComparisonValue
      .split(",")
      .map((value) => parsePrimitiveValue(value.trim()))
      .filter((value) => value !== "");
  }

  if (numericComparisonOperators.includes(operator)) {
    return Number(rawComparisonValue);
  }

  return parsePrimitiveValue(rawComparisonValue.trim());
};

export const moveInOrderedList = <T>(items: T[], itemId: string, direction: "down" | "up", getId: (item: T) => string): T[] => {
  const currentIndex = items.findIndex((item) => getId(item) === itemId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(currentIndex, 1);
  nextItems.splice(nextIndex, 0, item);

  return nextItems;
};
