import { SdkEvaluationRequest } from "../evaluations/dto/evaluation-request.dto";
import { matchesTargetingRule, TargetingRuleMatchInput } from "../targeting-rules/targeting-rule-matcher";
import { SegmentMatchMode } from "./segment-match-mode.enum";

type SegmentMatchCondition = TargetingRuleMatchInput & {
  sortOrder: number;
};

export const matchesSegment = (
  segment: {
    conditions?: SegmentMatchCondition[];
    matchMode: SegmentMatchMode;
  },
  evaluationContext: SdkEvaluationRequest
): boolean => {
  const conditions = [...(segment.conditions ?? [])].sort(
    (first, second) => first.sortOrder - second.sortOrder
  );

  if (conditions.length === 0) {
    return false;
  }

  if (segment.matchMode === SegmentMatchMode.MatchAny) {
    return conditions.some((condition) => matchesTargetingRule(condition, evaluationContext));
  }

  return conditions.every((condition) => matchesTargetingRule(condition, evaluationContext));
};
