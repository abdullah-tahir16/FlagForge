import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { SegmentMatchMode } from "../segment-match-mode.enum";

export class UpdateSegmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsOptional()
  @IsEnum(SegmentMatchMode)
  matchMode?: SegmentMatchMode;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;
}
