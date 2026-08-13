import { useQueryClient } from "@tanstack/react-query";
import type { LoginInput, RegisterInput } from "../../../core/types/Auth";
import { clearAccessToken, getAccessToken, setAccessToken } from "../../api/Auth/session";
import { useCurrentUser } from "../../hooks/Auth/useCurrentUser";
import { useLogin } from "../../hooks/Auth/useLogin";
import { useLogout } from "../../hooks/Auth/useLogout";
import { useRefreshSession } from "../../hooks/Auth/useRefreshSession";
import { useRegister } from "../../hooks/Auth/useRegister";

export const useAuthUseCase = () => {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshMutation = useRefreshSession();
  const registerMutation = useRegister();

  const login = async (input: LoginInput) => {
    const session = await loginMutation.mutateAsync(input);
    setAccessToken(session.accessToken);
    await queryClient.invalidateQueries({ queryKey: ["auth"] });

    return session;
  };

  const register = async (input: RegisterInput) => {
    const session = await registerMutation.mutateAsync(input);
    setAccessToken(session.accessToken);
    await queryClient.invalidateQueries({ queryKey: ["auth"] });

    return session;
  };

  const restoreSession = async () => {
    const session = await refreshMutation.mutateAsync();
    setAccessToken(session.accessToken);
    await queryClient.invalidateQueries({ queryKey: ["auth"] });

    return session;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    clearAccessToken();
    queryClient.clear();
  };

  return {
    currentUser: currentUserQuery.data,
    hasAccessToken: Boolean(getAccessToken()),
    isAuthenticated: Boolean(currentUserQuery.data || getAccessToken()),
    isCheckingCurrentUser: currentUserQuery.isLoading,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    isRestoringSession: refreshMutation.isPending,
    login,
    loginError: loginMutation.error,
    logout,
    register,
    registerError: registerMutation.error,
    restoreSession,
    restoreSessionError: refreshMutation.error
  };
};
