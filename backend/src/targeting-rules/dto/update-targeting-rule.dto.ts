import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import type { TargetingComparisonValue } from "../targeting-rule-comparison-value";
import { TargetingRuleOperator } from "../targeting-rule-operator.enum";
import { TargetingRuleSource } from "../targeting-rule-source.enum";

export class UpdateTargetingRuleDto {
  @IsOptional()
  @IsEnum(TargetingRuleSource)
  source?: TargetingRuleSource;

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
  @IsUUID()
  segmentId?: string;

  @IsOptional()
  @IsBoolean()
  resultValue?: boolean;
}
