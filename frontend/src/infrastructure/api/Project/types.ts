import type { CreateProjectInput, Project, UpdateProjectInput } from "../../../core/types/Project";

export type CreateProjectRequestDto = CreateProjectInput;
export type UpdateProjectRequestDto = UpdateProjectInput;

export interface ProjectResponseDto extends Project {}
