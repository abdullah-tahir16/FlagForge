import type {
  CreateSegmentConditionInput,
  CreateSegmentInput,
  Segment,
  SegmentCondition
} from "../../../core/types/Segment";
import type { TargetingComparisonValue, TargetingPrimitive } from "../../../core/types/TargetingRules";
import { arraySegmentOperators, numericSegmentOperators } from "./data";
import type { SegmentConditionFormValues, SegmentFormValues } from "./data";

export const defaultSegmentFormValues: SegmentFormValues = {
  description: "",
  matchMode: "MATCH_ALL",
  name: ""
};

export const defaultSegmentConditionFormValues: SegmentConditionFormValues = {
  attribute: "country",
  comparisonValue: "IT",
  operator: "EQUALS"
};

export const formatSegmentComparisonValue = (value: TargetingComparisonValue): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value === null ? "null" : String(value);
};

export const getSegmentInitialValues = (segment?: Segment): SegmentFormValues =>
  segment
    ? {
        description: segment.description ?? "",
        matchMode: segment.matchMode,
        name: segment.name
      }
    : defaultSegmentFormValues;

export const getSegmentConditionInitialValues = (condition?: SegmentCondition): SegmentConditionFormValues =>
  condition
    ? {
        attribute: condition.attribute,
        comparisonValue: formatSegmentComparisonValue(condition.comparisonValue),
        operator: condition.operator
      }
    : defaultSegmentConditionFormValues;

export const parseSegmentFormValues = (values: SegmentFormValues): CreateSegmentInput => ({
  description: values.description?.trim() || null,
  matchMode: values.matchMode,
  name: values.name.trim()
});

export const parseSegmentConditionFormValues = (values: SegmentConditionFormValues): CreateSegmentConditionInput => ({
  attribute: values.attribute.trim(),
  comparisonValue: parseComparisonValue(values),
  operator: values.operator
});

export const moveSegmentCondition = (
  conditions: SegmentCondition[],
  conditionId: string,
  direction: "down" | "up"
): SegmentCondition[] => {
  const currentIndex = conditions.findIndex((condition) => condition.id === conditionId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= conditions.length) {
    return conditions;
  }

  const nextConditions = [...conditions];
  const [condition] = nextConditions.splice(currentIndex, 1);
  nextConditions.splice(nextIndex, 0, condition);

  return nextConditions;
};

const parseComparisonValue = (values: SegmentConditionFormValues): TargetingComparisonValue => {
  if (arraySegmentOperators.includes(values.operator)) {
    return values.comparisonValue
      .split(",")
      .map((value) => parsePrimitiveValue(value.trim()))
      .filter((value) => value !== "");
  }

  if (numericSegmentOperators.includes(values.operator)) {
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
