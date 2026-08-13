import { IsDefined, IsEnum, IsString, Matches, MaxLength, MinLength } from "class-validator";
import type { TargetingComparisonValue } from "../../targeting-rules/targeting-rule-comparison-value";
import { TargetingRuleOperator } from "../../targeting-rules/targeting-rule-operator.enum";

export class CreateSegmentConditionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[A-Za-z][A-Za-z0-9_.-]*$/)
  attribute!: string;

  @IsDefined()
  comparisonValue!: TargetingComparisonValue;

  @IsEnum(TargetingRuleOperator)
  operator!: TargetingRuleOperator;
}
