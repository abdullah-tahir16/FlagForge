import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useProtectedRouteFeature } from "../../hooks/ProtectedRoute/useProtectedRouteFeature";

interface Props extends PropsWithChildren {}

const ProtectedRouteContainer = ({ children }: Props) => {
  const { isAllowed, isChecking } = useProtectedRouteFeature();

  if (isChecking) {
    return <div className="min-h-screen bg-app-background px-5 py-8 text-app-text-muted">Loading</div>;
  }

  if (!isAllowed) {
    return <Navigate replace to="/login" />;
  }

  return children;
};

export default ProtectedRouteContainer;
