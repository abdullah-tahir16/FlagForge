import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import type { TargetingComparisonValue } from "../targeting-rule-comparison-value";
import { TargetingRuleOperator } from "../targeting-rule-operator.enum";

export class UpdateTargetingRuleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[A-Za-z][A-Za-z0-9_.-]*$/)
  attribute?: string;

  @IsOptional()
  comparisonValue?: TargetingComparisonValue;

  @IsOptional()
  @IsEnum(TargetingRuleOperator)
  operator?: TargetingRuleOperator;

  @IsOptional()
  @IsBoolean()
  resultValue?: boolean;
}
