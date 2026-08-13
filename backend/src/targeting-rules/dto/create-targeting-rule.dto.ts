import { IsBoolean, IsDefined, IsEnum, IsString, Matches, MaxLength, MinLength } from "class-validator";
import type { TargetingComparisonValue } from "../targeting-rule-comparison-value";
import { TargetingRuleOperator } from "../targeting-rule-operator.enum";

export class CreateTargetingRuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[A-Za-z][A-Za-z0-9_.-]*$/)
  attribute!: string;

  @IsDefined()
  comparisonValue!: TargetingComparisonValue;

  @IsEnum(TargetingRuleOperator)
  operator!: TargetingRuleOperator;

  @IsBoolean()
  resultValue!: boolean;
}
