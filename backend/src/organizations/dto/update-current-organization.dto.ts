import { IsString, MinLength } from "class-validator";

export class UpdateCurrentOrganizationDto {
  @IsString()
  @MinLength(2)
  name!: string;
}
