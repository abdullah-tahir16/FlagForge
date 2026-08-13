import type { CreateSegmentConditionInput, CreateSegmentInput, Segment, SegmentCondition } from "../../../core/types/Segment";
import { formatComparisonValue, moveInOrderedList, parseComparisonValueForOperator } from "../../../core/utils/targeting";
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

export const formatSegmentComparisonValue = formatComparisonValue;

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
  comparisonValue: parseComparisonValueForOperator(values.operator, values.comparisonValue),
  operator: values.operator
});

export const moveSegmentCondition = (
  conditions: SegmentCondition[],
  conditionId: string,
  direction: "down" | "up"
): SegmentCondition[] => moveInOrderedList(conditions, conditionId, direction, (condition) => condition.id);
