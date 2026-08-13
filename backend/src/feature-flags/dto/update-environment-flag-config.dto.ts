import { IsBoolean, IsOptional } from "class-validator";

export class UpdateEnvironmentFlagConfigDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  value?: boolean;
}
