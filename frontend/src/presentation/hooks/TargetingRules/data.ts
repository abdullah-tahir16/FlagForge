import { z } from "zod";
import { targetingRuleOperators } from "../../../core/types/TargetingRules";
import type { TargetingRuleOperator } from "../../../core/types/TargetingRules";

export const numericTargetingRuleOperators: TargetingRuleOperator[] = [
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL"
];

export const arrayTargetingRuleOperators: TargetingRuleOperator[] = ["IN", "NOT_IN"];

export const targetingRuleOperatorLabels: Record<TargetingRuleOperator, string> = {
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

export const targetingRuleOperatorOptions = targetingRuleOperators.map((operator) => ({
  label: targetingRuleOperatorLabels[operator],
  value: operator
}));

export const targetingRuleFormSchema = z
  .object({
    attribute: z
      .string()
      .trim()
      .min(1, "Attribute is required")
      .max(80, "Attribute must be 80 characters or less")
      .regex(/^[A-Za-z][A-Za-z0-9_.-]*$/, "Use letters, numbers, dots, dashes, or underscores"),
    comparisonValue: z.string().trim().min(1, "Comparison value is required"),
    operator: z.enum(targetingRuleOperators),
    resultValue: z.enum(["true", "false"])
  })
  .superRefine((values, context) => {
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
