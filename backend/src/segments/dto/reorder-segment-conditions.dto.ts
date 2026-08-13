import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";

export class ReorderSegmentConditionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  conditionIds!: string[];
}
