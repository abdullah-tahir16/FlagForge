import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useUpdateCurrentOrganization } from "../../../infrastructure/hooks/Organization/useUpdateCurrentOrganization";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";

export const useHomeFeature = () => {
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const updateOrganizationMutation = useUpdateCurrentOrganization();
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    if (currentOrganizationQuery.data?.name) {
      setOrganizationName(currentOrganizationQuery.data.name);
    }
  }, [currentOrganizationQuery.data?.name]);

  const onOrganizationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateOrganizationMutation.mutateAsync({ name: organizationName });
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  return {
    title: "FlagForge",
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    isUpdatingOrganization: updateOrganizationMutation.isPending,
    onLogout,
    onOrganizationNameChange: setOrganizationName,
    onOrganizationSubmit,
    organizationName,
    navigate,
    sections: [
      { description: "Create and manage projects and their environments.", label: "Projects", to: "/projects" },
      { description: "Toggle boolean flags and configure rollouts per environment.", label: "Flags", to: "/flags" },
      { description: "Build reusable segments for flag targeting rules.", label: "Segments", to: "/segments" },
      { description: "Review the organization's management activity.", label: "Audit", to: "/audit" }
    ]
  };
};
