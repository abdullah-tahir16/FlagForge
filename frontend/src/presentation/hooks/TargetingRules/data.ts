import { z } from "zod";
import { targetingRuleOperators, targetingRuleSources } from "../../../core/types/TargetingRules";
import { arrayComparisonOperators, comparisonOperatorLabels, numericComparisonOperators } from "../../../core/utils/targeting";

export const numericTargetingRuleOperators = numericComparisonOperators;
export const arrayTargetingRuleOperators = arrayComparisonOperators;
export const targetingRuleOperatorLabels = comparisonOperatorLabels;

export const targetingRuleOperatorOptions = targetingRuleOperators.map((operator) => ({
  label: targetingRuleOperatorLabels[operator],
  value: operator
}));

export const targetingRuleSourceOptions = [
  { label: "Attribute", value: "ATTRIBUTE" },
  { label: "Segment", value: "SEGMENT" }
];

export const targetingRuleFormSchema = z
  .object({
    attribute: z
      .string()
      .trim()
      .max(80, "Attribute must be 80 characters or less")
      .optional(),
    comparisonValue: z.string().trim().optional(),
    operator: z.enum(targetingRuleOperators).optional(),
    resultValue: z.enum(["true", "false"]),
    segmentId: z.string().optional(),
    source: z.enum(targetingRuleSources)
  })
  .superRefine((values, context) => {
    if (values.source === "SEGMENT") {
      if (!values.segmentId) {
        context.addIssue({
          code: "custom",
          message: "Segment is required",
          path: ["segmentId"]
        });
      }

      return;
    }

    if (!values.attribute) {
      context.addIssue({
        code: "custom",
        message: "Attribute is required",
        path: ["attribute"]
      });
    } else if (!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(values.attribute)) {
      context.addIssue({
        code: "custom",
        message: "Use letters, numbers, dots, dashes, or underscores",
        path: ["attribute"]
      });
    }

    if (!values.operator) {
      context.addIssue({
        code: "custom",
        message: "Operator is required",
        path: ["operator"]
      });
    }

    if (!values.comparisonValue) {
      context.addIssue({
        code: "custom",
        message: "Comparison value is required",
        path: ["comparisonValue"]
      });
    }

    if (!values.operator || !values.comparisonValue) {
      return;
    }

    if (numericTargetingRuleOperators.includes(values.operator) && Number.isNaN(Number(values.comparisonValue))) {
      context.addIssue({
        code: "custom",
        message: "Comparison value must be numeric for this operator",
        path: ["comparisonValue"]
      });
    }

    if (arrayTargetingRuleOperators.includes(values.operator) && values.comparisonValue.split(",").every((part) => !part.trim())) {
      context.addIssue({
        code: "custom",
        message: "Enter at least one comma-separated value",
        path: ["comparisonValue"]
      });
    }
  });

export type TargetingRuleFormValues = z.infer<typeof targetingRuleFormSchema>;
