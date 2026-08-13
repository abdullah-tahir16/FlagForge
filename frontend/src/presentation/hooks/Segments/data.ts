import { z } from "zod";
import { segmentMatchModes } from "../../../core/types/Segment";
import type { SegmentMatchMode } from "../../../core/types/Segment";
import { targetingRuleOperators } from "../../../core/types/TargetingRules";
import { arrayComparisonOperators, comparisonOperatorLabels, numericComparisonOperators } from "../../../core/utils/targeting";

export const segmentMatchModeLabels: Record<SegmentMatchMode, string> = {
  MATCH_ALL: "Match all",
  MATCH_ANY: "Match any"
};

export const segmentMatchModeOptions = segmentMatchModes.map((mode) => ({
  label: segmentMatchModeLabels[mode],
  value: mode
}));

export const segmentFormSchema = z.object({
  description: z.string().trim().max(1000, "Description must be 1000 characters or less").optional(),
  matchMode: z.enum(segmentMatchModes),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(160, "Name must be 160 characters or less")
});

export const numericSegmentOperators = numericComparisonOperators;
export const arraySegmentOperators = arrayComparisonOperators;
export const segmentOperatorLabels = comparisonOperatorLabels;

export const segmentOperatorOptions = targetingRuleOperators.map((operator) => ({
  label: segmentOperatorLabels[operator],
  value: operator
}));

export const segmentConditionFormSchema = z
  .object({
    attribute: z
      .string()
      .trim()
      .min(1, "Attribute is required")
      .max(80, "Attribute must be 80 characters or less")
      .regex(/^[A-Za-z][A-Za-z0-9_.-]*$/, "Use letters, numbers, dots, dashes, or underscores"),
    comparisonValue: z.string().trim().min(1, "Comparison value is required"),
    operator: z.enum(targetingRuleOperators)
  })
  .superRefine((values, context) => {
    if (numericSegmentOperators.includes(values.operator) && Number.isNaN(Number(values.comparisonValue))) {
      context.addIssue({
        code: "custom",
        message: "Comparison value must be numeric for this operator",
        path: ["comparisonValue"]
      });
    }

    if (arraySegmentOperators.includes(values.operator) && values.comparisonValue.split(",").every((part) => !part.trim())) {
      context.addIssue({
        code: "custom",
        message: "Enter at least one comma-separated value",
        path: ["comparisonValue"]
      });
    }
  });

export type SegmentConditionFormValues = z.infer<typeof segmentConditionFormSchema>;
export type SegmentFormValues = z.infer<typeof segmentFormSchema>;
