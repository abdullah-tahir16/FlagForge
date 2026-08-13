import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { SegmentMatchMode } from "../segment-match-mode.enum";

export class CreateSegmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(SegmentMatchMode)
  matchMode?: SegmentMatchMode;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;
}
