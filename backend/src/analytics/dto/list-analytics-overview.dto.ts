import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export const analyticsRangeValues = ["24h", "7d", "30d"] as const;
export type AnalyticsRange = (typeof analyticsRangeValues)[number];

export class ListAnalyticsOverviewDto {
  @IsOptional()
  @IsUUID()
  environmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  flagKey?: string;

  @IsIn(analyticsRangeValues)
  @IsOptional()
  range?: AnalyticsRange;
}
