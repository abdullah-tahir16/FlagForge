import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";

export class ReorderTargetingRulesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  ruleIds!: string[];
}
