import type { AuthSession, AuthUser, LoginInput, RegisterInput } from "../../../core/types/Auth";

export type LoginRequestDto = LoginInput;
export type RegisterRequestDto = RegisterInput;

export interface AuthResponseDto extends AuthSession {}

export interface CurrentUserResponseDto extends AuthUser {}
